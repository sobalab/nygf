"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";

type Flower = { name: string; group: string; image?: string };

// One entry per stem, in the order previewFlowers lists them. Positions are
// percentages of the section and widths are clamped against the viewport, so
// the scatter keeps its shape from a phone to a wide desktop instead of being
// pinned to one screen size. `depth` is how hard a card answers the pointer.
// The copy holds the middle of the band, so anything in that horizontal strip
// stays clear of it vertically and the taller cards sit out at the edges, where
// they can run down past the heading without touching it.
//
// Cards on the right are anchored by `r`, not `l`: with a left offset the card
// grows rightward off the edge and gets clipped, where a right offset holds the
// gap no matter how wide the card is. Between that and the min-height on the
// section, every card stays whole at every size.
//
// `mt`/`ml`/`mr` are the narrow-screen positions of the six that stay — below
// 800px the copy takes the full width, so only the bands above and below it are
// free, and three cards go in each. The other three step out. A card keeps the
// same anchoring side at both sizes; left and right on one card would fight.
type Spot = { t: string; w: string; ratio: string; depth: number; l?: string; r?: string; mt?: string; ml?: string; mr?: string };

// Left and right offsets are held in step — 2/3 across the top, 1/1 through the
// middle, 7/9 along the bottom — so neither flank sits nearer its gutter than
// the other, and the widest card in each row is answered by a comparable one
// opposite instead of all the weight falling down one side.
const PLACEMENT: Spot[] = [
  { t: "10%", l: "2%", w: "clamp(120px,15vw,206px)", ratio: "3/4", depth: 0.6, mt: "7%", ml: "auto", mr: "4%" },
  { t: "10%", l: "24%", w: "clamp(96px,11.5vw,162px)", ratio: "1/1", depth: 1.3 },
  { t: "7%", l: "49%", w: "clamp(136px,17vw,244px)", ratio: "5/4", depth: 2.1, mt: "5%", ml: "3%" },
  { t: "12%", r: "3%", w: "clamp(114px,15vw,216px)", ratio: "4/5", depth: 1, mt: "20%", ml: "6%", mr: "auto" },
  { t: "45%", l: "1%", w: "clamp(124px,15vw,216px)", ratio: "1/1", depth: 1.5, mt: "83%", ml: "14%" },
  // Square, not portrait: three tall cards down the right flank left no room
  // between them once the field took its gutters.
  { t: "47%", r: "1%", w: "clamp(102px,11.5vw,180px)", ratio: "1/1", depth: 0.7 },
  { t: "72%", l: "7%", w: "clamp(146px,18vw,254px)", ratio: "4/3", depth: 3, mt: "68%", ml: "4%" },
  { t: "65%", l: "44%", w: "clamp(112px,13.5vw,176px)", ratio: "3/4", depth: 1.1 },
  { t: "68%", r: "9%", w: "clamp(128px,15vw,230px)", ratio: "1/1", depth: 2.2, mt: "66%", mr: "5%" },
];

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
        // unset so it resolves to auto.
        const style: Record<string, string | number> = {
          "--t": spot.t,
          "--w": spot.w,
          "--ar": spot.ratio,
          "--d": spot.depth,
          "--i": index,
        };
        if (spot.l) style["--l"] = spot.l;
        if (spot.r) style["--r"] = spot.r;
        if (spot.mt) style["--mt"] = spot.mt;
        if (spot.ml) style["--ml"] = spot.ml;
        if (spot.mr) style["--mr"] = spot.mr;
        return (
          <div className={spot.mt ? "field-item" : "field-item field-wide"} key={flower.name} style={style as CSSProperties}>
            <a href="/catalogue" tabIndex={-1}>
              <img src={flower.image} alt="" loading="lazy" />
            </a>
          </div>
        );
      })}
    </div>
  );
}
