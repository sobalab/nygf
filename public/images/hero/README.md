# Hero photo

Drop the hero "plate" photo here — it fills the framed panel next to the
headline on the homepage.

**Shot style**

- A single stem or small bunch, plain light ground, ~4:5 portrait crop —
  same treatment as the catalog photos, just the hero's lead image.
- This frame is a stand-in for a future interactive canvas (see
  `<InteractiveStage>` in the README at the project root) — keep the photo
  calm and uncluttered since it may later sit behind or alongside motion.

**Wiring it up**

1. Save the photo here as `plate.jpg` (or update the path in
   `src/components/sections/Hero.tsx`, the `fallbackSrc` prop passed to
   `<InteractiveStage>`).
2. Until that file exists, the frame falls back to a plain paper-toned block.
