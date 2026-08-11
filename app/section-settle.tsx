"use client";

import { useEffect } from "react";

// Each band on the home page is a screenful, and this is what makes one feel
// like a stop rather than a stretch of page that happens to be tall: when a
// scroll comes to rest with a band's top already close, the last of the travel
// is finished for you and the band settles into the window.
//
// It only ever moves the way you were already going. That is the whole point,
// and it is the one thing CSS scroll-snap cannot express — snap resolves to the
// *nearest* point, so a short scroll down from a band's top gets answered by
// pulling you back up onto it, which reads as the page refusing to let go.
// Direction is tracked here instead, and a candidate behind the reader is never
// considered.
//
// Two more reasons this is not scroll-snap: `mandatory` has to land on a snap
// point after every scroll, which would make the middle of Our Story's 310svh
// track a place the page won't stop, and `proximity` is what produced the
// backward pull. So the track is skipped outright below, and everything here is
// a plain smooth scrollTo — no wheel handler, nothing preventDefault'ed, so
// momentum, keyboard, scrollbar dragging and find-in-page all behave normally
// and a settle already under way is interrupted the moment the reader scrolls.
const IDLE_MS = 140;
// How near a band's top has to be, as a share of the window, before the rest of
// the distance is worth finishing. Just under half: rest in the front half of a
// band and you are left alone, carry past the middle and the next band comes to
// meet you.
const REACH = 0.45;

export function SectionSettle() {
  useEffect(() => {
    const wide = window.matchMedia("(min-width:801px)");
    const motion = window.matchMedia("(prefers-reduced-motion:no-preference)");

    // Measured per settle rather than cached: the bands are sized in svh, the
    // webfonts swap under them, and Our Story changes its own height when it
    // arms. Five elements is nothing to read.
    //
    // Our Story's top is in the list like any other band — landing on it is
    // what engages the pin and starts the first scene. Only the inside of its
    // track is protected, by the guard below.
    const bandTops = () =>
      [...document.querySelectorAll<HTMLElement>(".home > section")]
        .map((section) => Math.round(section.getBoundingClientRect().top + window.scrollY));

    // Our Story owns the scroll for the whole of its track: it is pinned in
    // there and its panels turn on how far through it you are, so a reader
    // partway down it is mid-scene, not adrift between bands.
    const insideStory = () => {
      const story = document.querySelector(".story");
      if (!story) return false;
      const box = story.getBoundingClientRect();
      return box.top < 0 && box.bottom > window.innerHeight;
    };

    let last = window.scrollY;
    // 0 until the reader actually scrolls, so arriving on a #hash is left
    // exactly where it landed.
    let heading = 0;
    let idle: ReturnType<typeof setTimeout> | undefined;

    const settle = () => {
      idle = undefined;
      if (!heading || !wide.matches || !motion.matches || insideStory()) return;

      const y = window.scrollY;
      const furthest = document.documentElement.scrollHeight - window.innerHeight;
      // Both ends are already a resting place of their own.
      if (y <= 0 || y >= furthest - 1) return;

      const ahead = bandTops().filter((top) => (heading > 0 ? top > y : top < y));
      if (!ahead.length) return;
      const target = heading > 0 ? Math.min(...ahead) : Math.max(...ahead);

      const distance = Math.abs(target - y);
      if (distance < 2 || distance > window.innerHeight * REACH) return;
      window.scrollTo({ top: target, behavior: "smooth" });
    };

    const onScroll = () => {
      const y = window.scrollY;
      if (y !== last) {
        heading = y > last ? 1 : -1;
        last = y;
      }
      if (idle) clearTimeout(idle);
      idle = setTimeout(settle, IDLE_MS);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (idle) clearTimeout(idle);
    };
  }, []);

  return null;
}
