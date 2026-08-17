"use client";

import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";
import { useMediaQuery, useMounted } from "./client-env";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";

// Our Story is a tall scroll track with a stage pinned inside it. Two readings
// of the scroll drive everything on it:
//
//   enter  the approach — 0 when the section's top is at the foot of the window,
//          1 when it reaches the head of it. The band climbing into view.
//   p      the track — 0 where the pin engages, 1 where it lets go. Only this
//          one means anything once the section is pinned, and it is still 0 for
//          the whole of the approach, which is why the first plate needs enter.
//
// Both come from useScroll, so the values are read on Motion's own frame loop
// rather than from a scroll handler of ours, and everything derived from them
// is a MotionValue — the transforms never touch React state and never re-render
// the tree while the reader scrolls.
type Track = {
  armed: boolean;
  // The stacked layout, where the plate is about half the width it is beside a
  // copy column. The deck is measured in pixels, so the narrow stage needs its
  // own set rather than the wide one applied to a smaller plate.
  narrow: boolean;
  p: MotionValue<number>;
  enter: MotionValue<number>;
  // One entry per scene, in order. A plate reads its own to arrive and the ones
  // after it to know how far it has been buried.
  land: MotionValue<number>[];
  settle: MotionValue<number>[];
};

const TrackContext = createContext<Track | null>(null);

// A window on some progress value, clamped at both ends: 0 before `from`, 1
// after `to`. Every fade and every landing on the stage is one of these.
function useWindow(value: MotionValue<number>, from: number, to: number) {
  return useTransform(value, [from, to], [0, 1]);
}

// The eased read of a landing. One minus the square of what is left — an
// ease-out. It matters because the raw window is linear in scroll, and a plate
// that crosses its whole travel at one speed and then stops dead reads as a
// slider being dragged. Eased, it covers most of the distance early and drifts
// the last few pixels home, which is what arriving looks like.
function useSettle(land: MotionValue<number>) {
  return useTransform(land, (v) => 1 - (1 - v) * (1 - v));
}

// Held down until `until`, then released over `fade`. The leaving half of a
// scene, written the way the arriving half is so the two read alike.
function useLeave(p: MotionValue<number>, until: number, fade = 0.04) {
  return useTransform(p, [until, until + fade], [1, 0]);
}

export function StoryScroll({ title, children }: { title: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const still = useReducedMotion();
  // Armed only once we are past the server render, so the track ships as plain
  // stacked panels: a reader without JavaScript gets the scenes one under
  // another rather than three of them piled in one pinned cell with only the
  // last visible. Reduced motion keeps that same flow rendering on purpose — a
  // scene that only turns over when the page is scrolled is exactly what the
  // setting is for.
  const armed = useMounted() && !still;
  // The same breakpoint the stacked layout is written at in globals.css.
  const narrow = useMediaQuery("(max-width:800px)");

  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const { scrollYProgress: enter } = useScroll({ target: ref, offset: ["start end", "start start"] });

  // The three landings. The first is on the approach and the other two on the
  // track, and each takes a wider window than a line of copy does: a plate
  // crossing a hundred pixels and several degrees needs the room, and it can
  // start while the outgoing scene's words are still leaving, since it is
  // landing on the pile rather than taking the stage from them.
  const land1 = useWindow(enter, 0.25, 1);
  const land2 = useWindow(p, 0.24, 0.34);
  const land3 = useWindow(p, 0.58, 0.68);
  const settle1 = useSettle(land1);
  const settle2 = useSettle(land2);
  const settle3 = useSettle(land3);

  // The title is handed in rather than passed through as a child, because it is
  // the one piece of the stage that belongs to the section rather than to a
  // scene: it names the band and holds while the scenes turn over beneath it.
  // Owning it here is what lets it fade up on the approach with the first
  // plate instead of needing a reveal of its own.
  const titleIn = useWindow(enter, 0.15, 0.45);

  // Arming changes the section's height from whatever the panels took in flow
  // to a fixed track, so anything below Our Story has just moved and a reader
  // who arrived on a #hash was landed against the old layout. Put them back on
  // their section, and again once the webfonts have swapped, which shifts the
  // measure too. No smooth scroll: they asked for a position, not a second
  // animation. If they have scrolled in the meantime the page is theirs, and
  // the later pass stands down.
  useEffect(() => {
    if (!armed) return;
    const target = location.hash.length > 1 && document.getElementById(location.hash.slice(1));
    if (!target) return;
    const reseat = () => {
      const root = document.documentElement.style;
      const smooth = root.scrollBehavior;
      root.scrollBehavior = "auto";
      target.scrollIntoView();
      root.scrollBehavior = smooth;
      return window.scrollY;
    };
    const landed = reseat();
    document.fonts?.ready.then(() => {
      if (window.scrollY === landed) requestAnimationFrame(reseat);
    });
  }, [armed]);

  const track: Track = { armed, narrow, p, enter, land: [land1, land2, land3], settle: [settle1, settle2, settle3] };

  return (
    // Deliberately not .section-pad: that class is padded by a `.home>section`
    // rule the armed reset can't outweigh, and the armed section has to measure
    // exactly its own track.
    <section className={armed ? "story story-armed" : "story"} id="story" ref={ref}>
      <div className="story-stage">
        <motion.h2 className="story-title" style={armed ? { opacity: titleIn } : undefined}>
          {title}
        </motion.h2>
        <TrackContext.Provider value={track}>{children}</TrackContext.Provider>
      </div>
    </section>
  );
}

// Where each plate comes to rest on the deck, and how much extra tilt it
// carries on the way in. The fan settles as it climbs: the plate underneath
// sits at the widest angle and the one on top comes to rest almost square,
// which is what makes the pile read as a pile rather than as three photographs
// pinned at random. Swing is signed so no two neighbours unwind the same way.
const DECK = [
  { x: -30, y: 16, rotate: -4.6, swing: -8 },
  { x: 18, y: -11, rotate: 3.4, swing: 7 },
  { x: -4, y: 2, rotate: -1, swing: -6.5 },
];

// The same fan on the stacked stage, where the plate is a little over half the
// width it takes beside a copy column. Offsets in pixels don't carry across
// that: the wide set spread the three over about a quarter of the plate's own
// width down here, which read as three photographs dropped separately rather
// than as one pile. The steps here are even — each plate sits the same distance
// off the one under it, on both axes and in angle — so the stack reads as a
// stack at a glance, which is all it gets on a phone.
const DECK_NARROW = [
  { x: -14, y: 9, rotate: -3.6, swing: -6.5 },
  { x: 0, y: 0, rotate: -1.2, swing: 5.5 },
  { x: 14, y: -9, rotate: 1.2, swing: -5 },
];

// How far a plate is dimmed by each plate that lands on top of it. A plate
// darkens as it falls behind, so the pile reads as depth rather than as three
// photographs competing at the same value, and the one being spoken about is
// always the brightest thing on the stage. The bottom of the pile takes both.
const BURIED = 0.24;
const BURIED_AGAIN = 0.14;

// The travel a plate makes on its way in, in pixels. Shorter on the stacked
// stage for the same reason the deck is tighter — the plate is smaller, and the
// copy is directly beneath it rather than beside it, so a long run crosses the
// heading on the way up.
const RISE = 130;
const RISE_NARROW = 84;

export function StoryPanel({
  index,
  className,
  image,
  alt,
  objectPosition,
  copyDrift,
  headingAt,
  copyAt,
  headingClassName,
  heading,
  children,
}: {
  index: number;
  className: string;
  image: string;
  alt: string;
  /** Held off centre where the plate takes a much narrower slice of a
      landscape source than it does of a portrait one. */
  objectPosition?: string;
  /** The scene's own drift, as [at --p 0, at --p 1] in pixels. The middle scene
      passes through — it rises into place, sits level over its dwell and
      carries on up as it goes — where the outer two only ever do one half of
      that. */
  copyDrift: [number, number];
  /** Where the heading is whole, as [in, out] on --p. Omit the out for a scene
      that never leaves. */
  headingAt: [number, number?];
  /** The same for the paragraph, a step behind the heading. */
  copyAt: [number, number?];
  /** Set on the one heading written as a single phrase, which holds its line. */
  headingClassName?: string;
  heading: ReactNode;
  children: ReactNode;
}) {
  const track = useContext(TrackContext);
  // Never null in practice — a panel is only ever rendered inside the track —
  // but the hooks below need values on every render, and reaching for a field
  // of a possible null in each of a dozen of them is worse than one fallback.
  const p = track!.p;
  const land = track!.land[index];
  const settle = track!.settle[index];
  const narrow = track!.narrow;
  const spot = (narrow ? DECK_NARROW : DECK)[index];
  const rise = narrow ? RISE_NARROW : RISE;

  // A plate is thrown onto the deck rather than faded onto it: it comes up from
  // below carrying more tilt than it will keep and unwinds into its resting
  // angle as it lands. The deck offset is folded into the same values, so the
  // fan and the arrival are one transform rather than two fighting over the
  // element.
  const plateOpacity = useTransform(land, [0, 0.34], [0, 1]);
  const plateX = spot.x;
  const plateY = useTransform(settle, (v) => spot.y + (1 - v) * rise);
  const plateRotate = useTransform(settle, (v) => spot.rotate + (1 - v) * spot.swing);

  // Dimmed by whatever lands on top. The windows are the arrivals of those
  // plates, so a plate darkens exactly as the next one comes down over it.
  const next = track!.land[index + 1];
  const after = track!.land[index + 2];
  const plateDim = useTransform([next ?? land, after ?? land], ([a, b]: number[]) =>
    `saturate(.9) brightness(${1 - (next ? a * BURIED : 0) - (after ? b * BURIED_AGAIN : 0)})`,
  );

  const copyY = useTransform(p, [0, 1], copyDrift);
  // The first scene's words arrive on the approach like its plate does, a step
  // behind it and a step behind each other. The later scenes have no approach
  // to arrive on — they arrive by their own window on the track — so their in
  // is a plain window and this multiplier is simply 1 by the time it matters.
  const enter = track!.enter;
  const headingEnter = useWindow(enter, 0.35, 0.65);
  const copyEnter = useWindow(enter, 0.45, 0.75);
  const headingIn = useWindow(p, headingAt[0] - 0.04, headingAt[0]);
  const copyIn = useWindow(p, copyAt[0] - 0.04, copyAt[0]);
  const headingOut = useLeave(p, headingAt[1] ?? 2);
  const copyOut = useLeave(p, copyAt[1] ?? 2);
  const first = index === 0;
  const headingOpacity = useTransform([first ? headingEnter : headingIn, headingOut], ([a, b]: number[]) =>
    Math.min(a, b),
  );
  const copyOpacity = useTransform([first ? copyEnter : copyIn, copyOut], ([a, b]: number[]) => Math.min(a, b));

  const armed = track!.armed;

  return (
    <div className={`story-panel ${className}`}>
      <div className="story-image">
        <motion.img
          src={image}
          alt={alt}
          loading="lazy"
          style={
            armed
              ? { opacity: plateOpacity, x: plateX, y: plateY, rotate: plateRotate, filter: plateDim, objectPosition }
              : { objectPosition }
          }
        />
      </div>
      <motion.div className="story-copy" style={armed ? { y: copyY } : undefined}>
        <motion.h3 className={headingClassName} style={armed ? { opacity: headingOpacity } : undefined}>
          {heading}
        </motion.h3>
        <motion.p style={armed ? { opacity: copyOpacity } : undefined}>{children}</motion.p>
      </motion.div>
    </div>
  );
}
