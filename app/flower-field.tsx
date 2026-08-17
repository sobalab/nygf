"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";

type Flower = { name: string; group: string; image?: string };

// One entry per stem, in the order previewFlowers lists them. Widths are
// clamped against the viewport so the scatter keeps its shape from a phone to a
// wide desktop instead of being pinned to one screen size. `depth` is how hard
// a card answers the pointer.
//
// Vertical placement comes in two kinds. The cards out at the flanks are placed
// by `t`, a percentage down the field, and are free to run past the heading
// because nothing of theirs crosses the copy's column. The cards that do share
// that column are placed by `above`/`below` instead: an offset from the field's
// centre line to the card's near edge. The copy is centred on that same line,
// so a matched pair of offsets gives the same clearance over the heading as it
// does under the button, at any window height and however many lines the note
// wraps to — which a pair of top percentages cannot, since the copy's share of
// the band grows as the window gets shorter.
//
// Cards on the right are anchored by `r`, not `l`: with a left offset the card
// grows rightward off the edge and gets clipped, where a right offset holds the
// gap no matter how wide the card is. Between that, the centre anchors capping
// themselves against the far edge, and the min-height on the section, every
// card stays whole at every size.
//
// The `m` values are the narrow-screen positions of the six that stay — below
// 800px the copy takes the full width, so only the bands above and below it are
// free, and three cards go in each. The other three step out. A card keeps the
// same anchoring side at both sizes; left and right on one card would fight.
type Spot = {
  w: string;
  ratio: string;
  hcap: number;
  depth: number;
  t?: string;
  above?: string;
  below?: string;
  l?: string;
  r?: string;
  mt?: string;
  mAbove?: string;
  mBelow?: string;
  ml?: string;
  mr?: string;
  // The narrow layout sizes off the phone's width rather than off the wide
  // layout's floor, and the two portraits that stand either side of the copy
  // square up there: what limits a card on a phone is the height of the band,
  // not the width of the screen, so a tall crop buys its width back in the one
  // dimension there is none to spare in.
  mw?: string;
  mratio?: string;
};

// Left and right offsets are held in step — 2/3 across the top, 1/1 through the
// middle, 7/9 along the bottom — so neither flank sits nearer its gutter than
// the other, and the widest card in each row is answered by a comparable one
// opposite instead of all the weight falling down one side.
//
// The two cards nearest the copy, one over the heading and one under the
// button, are each pushed out as far as their own height allows: the offset
// stops just short of where cap() would pin the card to the field's edge, so
// the clearance around the copy is the most the band can give without the
// scatter losing its outer margin. Their offsets differ by a few pixels for
// that reason, not by intent. The rest of each row is staggered outward from
// there so the band reads as a scatter rather than two straight ranks.
const PLACEMENT: Spot[] = [
  { t: "10%", l: "2%", w: "clamp(108px,16vw,248px)", ratio: "3/4", hcap: 0.32, depth: 0.6, mt: "3%", ml: "auto", mr: "3%", mw: "min(35vw,138px)", mratio: "1/1" },
  { above: "clamp(200px,22%,352px)", l: "24%", w: "clamp(96px,13vw,200px)", ratio: "1/1", hcap: 0.24, depth: 1.3 },
  { above: "clamp(196px,22%,352px)", l: "49%", w: "clamp(124px,18vw,268px)", ratio: "5/4", hcap: 0.245, depth: 2.1, mt: "5%", ml: "3%", mw: "min(38vw,166px)" },
  { t: "12%", r: "3%", w: "clamp(104px,16vw,258px)", ratio: "4/5", hcap: 0.31, depth: 1, mAbove: "clamp(140px,15%,240px)", ml: "33%", mr: "auto", mw: "min(33vw,130px)", mratio: "1/1" },
  { t: "45%", l: "1%", w: "clamp(112px,16vw,258px)", ratio: "1/1", hcap: 0.25, depth: 1.5, mBelow: "clamp(300px,34%,520px)", ml: "37%", mw: "min(33vw,138px)" },
  // Square, not portrait: three tall cards down the right flank left no room
  // between them once the field took its gutters.
  { t: "47%", r: "1%", w: "clamp(102px,13vw,220px)", ratio: "1/1", hcap: 0.21, depth: 0.7 },
  { below: "clamp(200px,25%,360px)", l: "7%", w: "clamp(120px,19.5vw,300px)", ratio: "4/3", hcap: 0.24, depth: 3, mBelow: "clamp(165px,18%,280px)", ml: "3%", mw: "min(38vw,166px)" },
  { below: "clamp(190px,24%,320px)", l: "44%", w: "clamp(112px,15vw,210px)", ratio: "4/5", hcap: 0.255, depth: 1.1 },
  { below: "clamp(188px,23.5%,344px)", r: "9%", w: "clamp(108px,17vw,272px)", ratio: "1/1", hcap: 0.26, depth: 2.2, mBelow: "clamp(140px,15%,240px)", mr: "3%", mw: "min(35vw,150px)" },
];

// A centre-line anchor: the offset runs from the field's middle to the card.
const anchor = (offset: string) => cap(`calc(50% + ${offset})`);

// Whatever a card is anchored by, its far edge stops at the field's edge rather
// than sliding under the overflow. `--h` is the card's height, which is its
// width times the inverse of its aspect ratio.
const cap = (top: string) => `min(${top},calc(100% - var(--h)))`;

const heightRatio = (ratio: string) => {
  const [w, h] = ratio.split("/").map(Number);
  return h / w;
};

// How far the cursor moves a card at depth 1, in pixels. Everything else is a
// multiple of that through the card's own depth.
const PULL_X = -20;
const PULL_Y = -15;

// The drift a card carries on its own. Reach and period both come off the same
// depth the pointer parallax uses, so a card that leans hardest into the cursor
// is also the one that swims furthest.
const FLOAT_X = 3.2;
const FLOAT_Y = 5;

export function FlowerField({ flowers }: { flowers: Flower[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const still = useReducedMotion();

  // The cursor's position in the field, -1 to 1 on each axis. Two MotionValues
  // rather than state: a pointer move writes a number and Motion reads it on
  // its own frame, so the nine cards follow the cursor without React seeing a
  // single render.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  // The lag that makes it read as depth rather than as nine elements welded to
  // the mouse. A spring rather than a duration, so a fast flick across the band
  // and a slow drift both settle the same way instead of every move taking the
  // same fixed time regardless of how far it went.
  const sx = useSpring(px, { stiffness: 90, damping: 20, mass: 0.6 });
  const sy = useSpring(py, { stiffness: 90, damping: 20, mass: 0.6 });

  useEffect(() => {
    const field = ref.current;
    if (!field) return;

    // Parallax is a pointer affordance: no fine pointer, no parallax.
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!fine.matches || still) return;

    let onScreen = false;
    const watch = new IntersectionObserver(([entry]) => (onScreen = entry.isIntersecting), { threshold: 0 });
    watch.observe(field);

    const onMove = (event: PointerEvent) => {
      if (!onScreen) return;
      const box = field.getBoundingClientRect();
      px.set(((event.clientX - box.left) / box.width) * 2 - 1);
      py.set(((event.clientY - box.top) / box.height) * 2 - 1);
    };
    // Cursor gone from the window: settle back to centre rather than holding
    // the last offset.
    const onLeave = () => {
      px.set(0);
      py.set(0);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      watch.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [px, py, still]);

  return (
    <div className="field" ref={ref} aria-hidden="true">
      {flowers.map((flower, index) => {
        const spot = PLACEMENT[index];
        if (!spot || !flower.image) return null;
        return (
          <FieldCard key={flower.name} flower={flower} spot={spot} index={index} sx={sx} sy={sy} still={!!still} />
        );
      })}
    </div>
  );
}

function FieldCard({
  flower,
  spot,
  index,
  sx,
  sy,
  still,
}: {
  flower: Flower;
  spot: Spot;
  index: number;
  sx: ReturnType<typeof useSpring>;
  sy: ReturnType<typeof useSpring>;
  still: boolean;
}) {
  // Only the side the card is anchored from is declared; the other stays unset
  // so it resolves to auto. Both vertical sides are declared at the narrow
  // size, since a card can swap which one it hangs from there and an unset one
  // would fall through to the wide value underneath.
  const narrowRatio = spot.mratio ?? spot.ratio;
  const style: Record<string, string | number> = {
    "--w": spot.w,
    "--hr": heightRatio(spot.ratio),
    "--hcap": spot.hcap,
    "--ar": spot.ratio,
    "--mw": spot.mw ?? spot.w,
    "--mhr": heightRatio(narrowRatio),
    "--mar": narrowRatio,
  };
  if (spot.t) style["--t"] = cap(spot.t);
  if (spot.below) style["--t"] = anchor(spot.below);
  if (spot.above) style["--bt"] = anchor(spot.above);
  if (spot.l) style["--l"] = spot.l;
  if (spot.r) style["--r"] = spot.r;
  const narrow = spot.mt || spot.mAbove || spot.mBelow;
  if (narrow) {
    style["--mt"] = spot.mt ? cap(spot.mt) : spot.mBelow ? anchor(spot.mBelow) : "auto";
    style["--mbt"] = spot.mAbove ? anchor(spot.mAbove) : "auto";
  }
  if (spot.ml) style["--ml"] = spot.ml;
  if (spot.mr) style["--mr"] = spot.mr;

  const x = useTransform(sx, (v) => v * spot.depth * PULL_X);
  const y = useTransform(sy, (v) => v * spot.depth * PULL_Y);

  // The plate is what drifts, and it holds both the photograph and the name
  // over it. Floating the photograph alone would swim it out from under its own
  // wash, since the wash is placed against whatever box it sits in and that box
  // would be standing still.
  const reach = 1 + spot.depth;
  const float = still
    ? undefined
    : {
        x: [0, reach * FLOAT_X * 0.62, reach * FLOAT_X, reach * FLOAT_X * 0.62, 0],
        y: [0, reach * -FLOAT_Y, 0, reach * FLOAT_Y, 0],
      };

  return (
    <motion.div
      className={narrow ? "field-item" : "field-item field-wide"}
      style={{ ...(style as CSSProperties), x, y }}
      // The cards arrive one behind another the first time the band is
      // scrolled to, and only then — `once` is what stops the scatter
      // re-staging itself every time the reader passes it.
      initial={still ? false : { opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, delay: index * 0.09, ease: [0.22, 0.7, 0.3, 1] }}
    >
      <motion.a href="/catalogue" tabIndex={-1} whileHover={{ scale: 1.05 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
        <motion.span
          className="field-plate"
          // One cycle, phase-shifted per card by a negative delay, so no two
          // swim in lockstep — which reads as a machine rather than a drift.
          animate={float}
          transition={
            still
              ? undefined
              : { duration: 9 + spot.depth * 1.7, repeat: Infinity, ease: "easeInOut", delay: index * -2.3 }
          }
        >
          {/* The photographs are decorative here: the card is a link, and the
              link's name is built from everything inside it, so an alt on the
              plate would have a screen reader say the variety twice. */}
          <img src={flower.image} alt="" loading="lazy" />
          {/* Named on hover rather than under the card: the scatter is a picture
              of the range, and nine standing captions would turn it into a list
              laid out badly. */}
          <span className="field-name">{flower.name}</span>
        </motion.span>
      </motion.a>
    </motion.div>
  );
}
