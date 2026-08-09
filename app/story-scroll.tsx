"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { Reveal } from "./reveal";

// The section is a tall scroll track and the stage pins inside it; the panels
// handed in as children stack in one cell and cross-fade as you travel. All
// this writes is --p, the 0-to-1 progress through the track — the fades and the
// drift are calc() off it in globals.css, so a scroll costs one style write a
// frame however fast the events arrive.
export function StoryScroll({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = ref.current;
    if (!section) return;

    // Unarmed, the panels simply follow one another down the page. That is the
    // no-JavaScript rendering and the reduced-motion one — a scene that turns
    // over only when the page is scrolled is exactly what that setting is for.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    section.classList.add("story-armed");

    // Arming fixes the track at 200svh, which is not the height the panels took
    // in flow — so anything below Our Story has just moved, and a reader who
    // arrived on a #hash was landed against the old layout. Put them back on
    // their section, and again once the webfonts have swapped, which shifts the
    // measure too. No smooth scroll: they asked for a position, not a second
    // animation. If they have scrolled in the meantime the page is theirs, and
    // the later pass stands down.
    const target = location.hash.length > 1 && document.getElementById(location.hash.slice(1));
    if (target) {
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
    }

    let frame = 0;
    const measure = () => {
      frame = 0;
      const travel = section.offsetHeight - window.innerHeight;
      if (travel <= 0) return section.style.setProperty("--p", "0");
      const progress = -section.getBoundingClientRect().top / travel;
      section.style.setProperty("--p", Math.min(1, Math.max(0, progress)).toFixed(4));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
      section.classList.remove("story-armed");
    };
  }, []);

  return (
    // Deliberately not .section-pad: that class is padded by a `.home>section`
    // rule the armed reset below can't outweigh, and the armed section has to
    // measure exactly its own track.
    <section className="story" id="story" ref={ref}>
      {/* The stage carries the reveal mark as well as the pin: the first scene
          stages itself in when the band is reached, where --p only starts
          moving once the section has pinned and so has nothing to say about
          arriving. The two do not collide — the entrance is an animation with
          a backwards fill, which hands opacity back to the --p rule the moment
          it finishes, in time for that rule to fade the scene out again. */}
      <Reveal className="story-stage">{children}</Reveal>
    </section>
  );
}
