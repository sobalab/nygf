"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";

// NYGF, split so each letter of the monogram stays put and grows its own word.
const WORDS = [
  ["N", "ew"],
  ["Y", "ork"],
  ["G", "arden"],
  ["F", "lower"],
];

// Two staggers, both matching the keyframe delays in globals.css: the letters
// fall in a tenth of a second apart, then the words open in the same order,
// close enough together to read as one move rather than four.
const FALL_FIRST = 50;
const FALL_STEP = 100;
const OPEN_FIRST = 950;
const OPEN_STEP = 60;

// Long enough for the second line to land, the second it holds there, and the
// fade — after which the overlay is only an invisible node, so take it out.
// The reduced-motion cut runs a much shorter clear (see globals.css) and gets
// its own figure; the scroll lock lives on this timer, so a shared one would
// pin the page for three seconds after that version had already finished.
const TEARDOWN = 4150;
const TEARDOWN_STILL = 1450;

const KEY = "nygf-splash";

// Read by the inline script in the document head, which is what actually keeps
// the splash from replaying — every link here is a full page load.
export const splashScript = `try{if(sessionStorage.getItem('${KEY}'))document.documentElement.dataset.splash='off';else sessionStorage.setItem('${KEY}','1')}catch(e){}`;

const timing = (fall: number, open: number) =>
  ({ "--fall": `${fall}ms`, "--delay": `${open}ms` }) as CSSProperties;

// Read once and remembered: React's dev-only remount rewrites the <html>
// attributes from JSX, which would wipe the flag the head script set.
let play: boolean | null = null;
function shouldPlay() {
  if (play === null) play = document.documentElement.dataset.splash !== "off";
  return play;
}

export function Splash() {
  const [shown, setShown] = useState(true);

  useEffect(() => {
    // A repeat visit has the overlay hidden by the head script already, so it
    // only needs taking out of the DOM; a first visit holds it for the run.
    const playing = shouldPlay();
    if (playing) document.documentElement.classList.add("splash-open");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = setTimeout(() => setShown(false), playing ? (still ? TEARDOWN_STILL : TEARDOWN) : 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!shown) document.documentElement.classList.remove("splash-open");
  }, [shown]);

  if (!shown) return null;

  return (
    // Decorative: the page behind it carries the same name in the header, and a
    // screen reader shouldn't have to sit through the animation.
    <div className="splash" aria-hidden="true">
      <div className="splash-mark">
        <div className="splash-line">
          {WORDS.map(([initial, rest], index) => {
            const style = timing(FALL_FIRST + index * FALL_STEP, OPEN_FIRST + index * OPEN_STEP);
            return (
              <span className="splash-word" key={initial} style={style}>
                {initial}
                <span className="splash-tail" style={style}>
                  <span className="splash-fade" style={style}>{rest}</span>
                </span>
              </span>
            );
          })}
        </div>
        <div className="splash-second">
          <span>
            <span className="splash-lift">Wholesale INC.</span>
          </span>
        </div>
      </div>
    </div>
  );
}
