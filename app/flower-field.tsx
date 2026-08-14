"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";

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
// button, carry the same offset; the rest of each row is staggered outward from
// there so the band reads as a scatter rather than two straight ranks.
const PLACEMENT: Spot[] = [
  { t: "10%", l: "2%", w: "clamp(108px,16vw,248px)", ratio: "3/4", hcap: 0.32, depth: 0.6, mt: "3%", ml: "auto", mr: "3%", mw: "min(35vw,138px)", mratio: "1/1" },
  { above: "clamp(200px,22%,352px)", l: "24%", w: "clamp(96px,13vw,200px)", ratio: "1/1", hcap: 0.24, depth: 1.3 },
  { above: "clamp(176px,19.5%,320px)", l: "49%", w: "clamp(124px,18vw,268px)", ratio: "5/4", hcap: 0.28, depth: 2.1, mt: "5%", ml: "3%", mw: "min(38vw,166px)" },
  { t: "12%", r: "3%", w: "clamp(104px,16vw,258px)", ratio: "4/5", hcap: 0.31, depth: 1, mAbove: "clamp(140px,15%,240px)", ml: "33%", mr: "auto", mw: "min(33vw,130px)", mratio: "1/1" },
  { t: "45%", l: "1%", w: "clamp(112px,16vw,258px)", ratio: "1/1", hcap: 0.25, depth: 1.5, mBelow: "clamp(300px,34%,520px)", ml: "37%", mw: "min(33vw,138px)" },
  // Square, not portrait: three tall cards down the right flank left no room
  // between them once the field took its gutters.
  { t: "47%", r: "1%", w: "clamp(102px,13vw,220px)", ratio: "1/1", hcap: 0.21, depth: 0.7 },
  { below: "clamp(200px,25%,360px)", l: "7%", w: "clamp(120px,19.5vw,300px)", ratio: "4/3", hcap: 0.24, depth: 3, mBelow: "clamp(165px,18%,280px)", ml: "3%", mw: "min(38vw,166px)" },
  { below: "clamp(176px,19.5%,320px)", l: "44%", w: "clamp(112px,15vw,210px)", ratio: "4/5", hcap: 0.3, depth: 1.1 },
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

export function FlowerField({ flowers }: { flowers: Flower[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const field = ref.current;
    if (!field) return;

    // Armed from script, so the cards are simply there for a reader without
    // JavaScript rather than stuck at opacity 0 waiting for a reveal.
    field.classList.add("field-armed");

    let onScreen = false;
    const watch = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        if (onScreen) field.classList.add("field-in");
      },
      { threshold: 0.15 },
    );
    watch.observe(field);

    // Parallax is a pointer affordance: no fine pointer, no parallax. The lag
    // itself is a CSS transition on .field-item — this only feeds it the
    // cursor's position, one write per frame however fast the events arrive.
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || still.matches) return () => watch.disconnect();

    let pending: PointerEvent | null = null;
    let frame = 0;

    const write = () => {
      frame = 0;
      const event = pending;
      pending = null;
      if (!event) return;
      const box = field.getBoundingClientRect();
      field.style.setProperty("--px", ((event.clientX - box.left) / box.width * 2 - 1).toFixed(3));
      field.style.setProperty("--py", ((event.clientY - box.top) / box.height * 2 - 1).toFixed(3));
    };

    const onMove = (event: PointerEvent) => {
      if (!onScreen) return;
      pending = event;
      if (!frame) frame = requestAnimationFrame(write);
    };

    // Cursor gone from the window: settle back to centre rather than holding
    // the last offset.
    const onLeave = () => {
      field.style.setProperty("--px", "0");
      field.style.setProperty("--py", "0");
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    return () => {
      watch.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="field" ref={ref} aria-hidden="true">
      {flowers.map((flower, index) => {
        const spot = PLACEMENT[index];
        if (!spot || !flower.image) return null;
        // Only the side the card is anchored from is declared; the other stays
        // unset so it resolves to auto. Both vertical sides are declared at the
        // narrow size, since a card can swap which one it hangs from there and
        // an unset one would fall through to the wide value underneath.
        const narrowRatio = spot.mratio ?? spot.ratio;
        const style: Record<string, string | number> = {
          "--w": spot.w,
          "--hr": heightRatio(spot.ratio),
          "--hcap": spot.hcap,
          "--ar": spot.ratio,
          "--mw": spot.mw ?? spot.w,
          "--mhr": heightRatio(narrowRatio),
          "--mar": narrowRatio,
          "--d": spot.depth,
          "--i": index,
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
        return (
          <div className={narrow ? "field-item" : "field-item field-wide"} key={flower.name} style={style as CSSProperties}>
            <a href="/catalogue" tabIndex={-1}>
              <img src={flower.image} alt="" loading="lazy" />
            </a>
          </div>
        );
      })}
    </div>
  );
}
