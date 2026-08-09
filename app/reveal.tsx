"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

// Marks a block while it is on screen, so its children can stage an entrance
// off the class in CSS. The mark is dropped again once the block has left the
// viewport completely, which is what lets the entrance replay the next time it
// is scrolled to — the two thresholds are deliberately apart, so a block held
// half on screen keeps its mark instead of flickering on the boundary.
//
// Armed from script, like the flower field, so the children are simply there
// for a reader without JavaScript instead of stuck at opacity 0 waiting for a
// reveal that never comes.
export function Reveal({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const block = ref.current;
    if (!block) return;
    block.classList.add("reveal-armed");

    const watch = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.intersectionRatio >= 0.2) block.classList.add("reveal-in");
          else if (entry.intersectionRatio === 0) block.classList.remove("reveal-in");
        }
      },
      { threshold: [0, 0.2] },
    );
    watch.observe(block);
    return () => watch.disconnect();
  }, []);

  return (
    <div className={className} ref={ref}>
      {children}
    </div>
  );
}
