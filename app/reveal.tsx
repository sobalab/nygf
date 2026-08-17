"use client";

import { useRef, type ReactNode } from "react";
import { useMediaQuery, useMounted } from "./client-env";
import { motion, useInView, useReducedMotion } from "motion/react";

// Stages a block's children in as it is scrolled to, and again the next time it
// is scrolled to: `once` is deliberately off here, where the flower field has
// it on. A row of three cards rising as you arrive is the band introducing
// itself, and it should do that whenever the band is arrived at; the scatter on
// the flowers band is the band's whole content, and re-staging that reads as
// the page rebuilding itself under the reader.
//
// The children stage themselves through variants rather than each declaring its
// own delay, so the stagger is one number on the parent and a card added to the
// list takes its place in the run without being told what number it is — where
// the stylesheet this replaces had a rule per child, numbered by hand.
const list = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.12 } },
};

// Stacked, the cards come in from the side rather than from below. The row
// version rises because the cards sit side by side and a rise reads across all
// three at once; stacked, a rise is the same move the page itself is making as
// you scroll, and the two cancel out.
const item = (narrow: boolean) => ({
  hidden: { opacity: 0, y: narrow ? 0 : 34, x: narrow ? -34 : 0 },
  shown: { opacity: 1, y: 0, x: 0, transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] as const } },
});

// The stacked layout is the same 800px the stylesheet breaks at.
const NARROW = "(max-width:800px)";

export function Reveal({ className, children }: { className?: string; children: ReactNode }) {
  const still = useReducedMotion();
  // Nothing to stage under reduced motion: the children are simply there. A
  // plain div rather than a motion one with the variants stripped, so there is
  // no chance of a half-applied hidden state being what a reader is left with.
  if (still) return <div className={className}>{children}</div>;

  return (
    <motion.div className={className} variants={list} initial="hidden" whileInView="shown" viewport={{ amount: 0.2 }}>
      {children}
    </motion.div>
  );
}

// The child half of the pair. A block staged by Reveal wraps each of its own
// pieces in this, which is what puts them in the parent's stagger.
export function RevealItem({ className, children }: { className?: string; children: ReactNode }) {
  const still = useReducedMotion();
  const narrow = useMediaQuery(NARROW);
  if (still) return <article className={className}>{children}</article>;
  return (
    <motion.article className={className} variants={item(narrow)}>
      {children}
    </motion.article>
  );
}

// The gate for a heading that cuts itself into view. CutReveal is a server
// component — it ships no JavaScript, renders with the script switched off, and
// carries the largest text on the page — so its per-piece run stays where it
// is, in keyframes, and all this does is say when to start it. Motion's
// useInView replaces the IntersectionObserver that used to do the same job by
// hand; the marks it toggles are the ones .cut-piece already listens for.
//
// Both marks matter and they are not the same one twice: armed holds the pieces
// under their masks, and dropping `in` on the way out is what lets the run play
// again the next time the band is reached.
export function RevealCut({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const still = useReducedMotion();
  const inView = useInView(ref, { amount: 0.2 });
  const armed = useMounted() && !still;

  const marks = [className, armed ? "reveal-armed" : "", armed && inView ? "reveal-in" : ""].filter(Boolean).join(" ");
  return (
    <div className={marks} ref={ref}>
      {children}
    </div>
  );
}
