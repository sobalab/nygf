"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useMounted } from "./client-env";

// The bands of the home page, in the order they are read, named by the custom
// property each one is painted in. The hero is not here: it is a photograph and
// resolves its own foot into the band below it, so the sequence starts at the
// colour that meets it.
//
// The footer is not here either, and for a different reason. It is a panel that
// slides up over the page with its top corners cut, and what those corners cut
// through has to be the band behind it — if the ground had already turned paper
// by the time it arrived, the corners would be paper on paper and the shape
// would vanish. So the ground holds the last band and the footer paints itself.
const BANDS = [
  { selector: ".flower-field", variable: "--band-flowers" },
  { selector: ".story", variable: "--band-story" },
  { selector: ".trade", variable: "--band-trade" },
  { selector: ".contact", variable: "--band-contact" },
];

// Where in the window a boundary is when the ground starts and finishes turning,
// as a share of the window height. The turn is centred on the middle of the
// screen and kept narrow — about a quarter of a window of scrolling — for a
// reason the band heights force: every band here is close to exactly one
// screenful, so the scroll a band owns and the scroll a fade would take are the
// same order of size. A wide fade leaves no stretch where a band is simply
// itself, which is the thing to protect: a reader stopped anywhere but the
// crossing should be looking at a colour, not at a blend.
const TURN_FROM = 0.62;
const TURN_TO = 0.38;

type Stops = { at: number[]; colours: string[] };

export function BandBackdrop() {
  const mounted = useMounted();
  const still = useReducedMotion();
  const { scrollY } = useScroll();
  const [stops, setStops] = useState<Stops | null>(null);

  // Measured rather than declared: the bands are sized in svh and Our Story
  // changes its own height when it arms, so where a boundary sits is not
  // something this can be told at build time. Re-read on resize, and once the
  // webfonts have swapped, which moves every measure below the fold.
  useEffect(() => {
    if (still) return;
    const read = () => {
      const root = getComputedStyle(document.documentElement);
      const at: number[] = [];
      const colours: string[] = [];
      BANDS.forEach((band, index) => {
        const el = document.querySelector<HTMLElement>(band.selector);
        if (!el) return;
        const colour = root.getPropertyValue(band.variable).trim();
        if (index === 0) {
          // The first band has no boundary above it to turn on — it is simply
          // the ground until the second one comes up the window.
          at.push(0);
          colours.push(colour);
          return;
        }
        const top = el.getBoundingClientRect().top + window.scrollY;
        // Scroll positions, not page positions: the boundary is at `top`, and
        // it sits this far up the window when the page has been scrolled this
        // much. Both stops of the turn, so the ramp between them is the fade.
        at.push(top - window.innerHeight * TURN_FROM, top - window.innerHeight * TURN_TO);
        colours.push(colours[colours.length - 1], colour);
      });
      // A stop list has to climb. A short band whose two turns overlap would
      // hand useTransform a list that goes backwards, which it reads as a
      // range of zero width and snaps through.
      for (let i = 1; i < at.length; i++) at[i] = Math.max(at[i], at[i - 1] + 1);
      setStops({ at, colours });
    };
    read();
    window.addEventListener("resize", read);
    document.fonts?.ready.then(read);
    return () => window.removeEventListener("resize", read);
  }, [still]);

  // useTransform needs both arrays on every render and needs them the same
  // length, so it is fed a flat pair until the measure lands.
  const background = useTransform(scrollY, stops?.at ?? [0, 1], stops?.colours ?? ["#112f28", "#112f28"]);

  if (!mounted || still || !stops) return null;
  return <motion.div className="band-backdrop" style={{ backgroundColor: background }} aria-hidden="true" />;
}
