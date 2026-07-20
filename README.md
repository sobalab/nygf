# New York Garden Flower Wholesale

Catalog-plus-contact marketing site for New York Garden Flower Wholesale, Inc.
No e-commerce, no cart, no checkout — buyers browse the catalogue and daily
cooler list, then order by phone or WhatsApp because prices move with the
market every day.

Stack: Vite + React 18 + TypeScript + Tailwind CSS, `react-i18next` for
EN/KO. Single-page site with anchor-linked sections, componentized so it can
grow to a multi-page site later without a rewrite.

## Run it

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # type-checks then builds to dist/
npm run preview   # serve the production build locally
```

## Deploying

`npm run build` produces a static `dist/` folder. Point Netlify or Vercel at
this repo with:

- Build command: `npm run build`
- Output directory: `dist`

No environment variables or server are required.

## What the owner edits day to day

Everything content-related lives under `src/data/` as plain TypeScript
objects — no CMS, no build step beyond the normal `npm run build`.

### 1. Today's cooler list — `src/data/availability.ts`

The cooler section is currently unmounted from the page (removed by request),
but the component (`src/components/sections/AvailabilityBoard.tsx`) and this
data file are kept intact. To bring it back, re-add `<AvailabilityBoard />` in
`src/App.tsx` and restore the nav item in `src/components/layout/Header.tsx`.
When mounted: edit this file every morning — `date` drives the heading,
`updatedAt` drives the "Updated" timestamp, and each item's `status` is one of
`'in-stock'`, `'limited'`, or `'pre-order'`.

### 2. Add a catalog item + photo — `src/data/catalog.ts` + `public/images/catalog/`

1. Drop a photo in `public/images/catalog/` — see the README in that folder
   for the shot style (single stem/bunch, plain light ground, ~4:5 crop).
2. Add an entry to the `catalog` array in `src/data/catalog.ts` with the next
   `index`, bilingual `name` and `soldBy`, the Latin name, and the `colors` /
   `type` / `season` tags. The `image` field is the single source of truth for
   the photo — point it at the file you just added.
3. Until a real photo exists at that path, the card automatically shows a
   plain placeholder naming the Latin name instead of a broken image.

Colour and season tags on every existing item are a starting-point
placeholder set (marked `TODO(owner)` in the file) — confirm them against
real stock rather than treating them as final.

### 3. Site info, hours, contact — `src/data/siteConfig.ts`

Legal name, address, phone/WhatsApp/email, and `hours`. `hours` is marked
`TODO(owner)` — the current values are placeholders pending confirmation.

### 4. Origins — `src/data/origins.ts`

The six sourcing countries shown in the Sourcing grid.

### 5. Delivery details — `src/i18n/locales/en.json` and `ko.json`

Delivery info rows (zones, cold chain, pickup) live under `delivery.info.*`
in both locale files. To add or remove a row, edit the `INFO_KEYS` list in
`src/components/sections/Delivery.tsx` and add the matching label/value pair
to both locale files.

## Translating strings

All UI copy lives in `src/i18n/locales/en.json` and `ko.json` — no strings
are hardcoded in components. The two files share the same key structure; to
change a piece of UI copy, edit the matching key in both files. The Korean
copy was seed-translated for this build and should get a native-speaker
review pass before launch, particularly the flower and delivery copy.

Catalog item names and sold-by units are bilingual fields directly on the
data (`{ en, ko }`) in `src/data/catalog.ts`, not in the locale files, since
they're catalog data rather than UI chrome.

The language toggle persists the visitor's choice to `localStorage`
(`src/i18n/index.ts`) — no cookie banner or detection library involved.

## Where a headless data source would plug in later

Right now `src/data/*.ts` are static TypeScript modules imported directly by
components. To move to a headless source (a JSON endpoint, Sanity, etc.)
without touching component code:

1. Keep the same shapes defined in `src/types/*.ts` — `SiteConfig`,
   `CatalogItem`, `AvailabilityBoard`, `Origin`.
2. Replace the static exports in `src/data/*.ts` with a fetch call (e.g. in a
   small `useEffect`/`fetch` hook, or React Query if you add it) that
   resolves to the same shape and feeds it into the section components,
   which already just consume typed props/imports and don't know or care
   where the data came from.
3. `availability.ts` is the best candidate to move first — it changes daily
   and is the one place a non-technical daily update would benefit most from
   a lightweight CMS entry form instead of editing TypeScript.

## The hero's generative plate

The hero's framed "plate" renders a live **p5.js generative botanical specimen**:
a **rotating 3D point cloud** drawn one flower at a time, each in its species'
real colours, rendered as halftone dots on the light plate and cycling
draw-in → hold → dissolve → next. Each archetype emits points in 3D space with per-point surface normals; the
sketch rotates them around the vertical axis (with a downward viewing tilt),
perspective-projects, depth-sorts, and lights each point (lambert against a
fixed source) so lit faces lighten toward the plate and shadowed faces stay
deep ink — highlights and shadow sweep across the bloom as it turns, giving it
volume. Petals also carry a base→tip colour gradient. The forms are fully
procedural (no photos); rendering is plain 2D canvas + hand-rolled 3D projection
and lighting (no WebGL).

- **Sketch:** `src/components/stage/flowerSketch.ts` (the p5 harness — render,
  animation state machine, pause/resume) and `src/components/stage/flowerArchetypes.ts`
  (the botanical archetypes: form + species ink palette, colours sourced from
  `src/lib/blossomSwatches.ts`).
- **Mount point:** `src/components/stage/InteractiveStage.tsx` — a memoized,
  generic container that lazy-mounts a sketch on first intersection. p5 is
  dynamic-imported, so it is **code-split** and only downloads when the plate is
  on-screen (desktop). It never loads on mobile, where the plate is hidden.
  When no `mount` prop is passed, it falls back to a `fallbackSrc` image / plain
  plate instead (that path is unused by the hero but kept for reuse).
- **Motion & accessibility:** `prefers-reduced-motion` renders one static frame
  (no loop); otherwise a pause/play button on the plate lets anyone stop the
  motion (WCAG 2.2.2). The loop also pauses when off-screen or the tab is hidden.

p5 (`p5@^1.11.13`) **is installed**. three.js / `@react-three/fiber` are not — to
add a WebGL sketch instead, render an R3F `<Canvas>` into `InteractiveStage`'s
container via the same `mount` prop, and ask before adding those dependencies.

To add a flower species, append an archetype to `ARCHETYPES` in
`flowerArchetypes.ts` — a `type`, an `inks` palette, and a `draw(ctx)` routine
that emits 3D points via `ctx.push(x, y, z, hex)` (y up; stem base near y=-1.05,
bloom around y=+0.5). The shared `stem`/`petal`/`shell`/`spike`/`leaf` helpers
cover most forms.

## Project structure

```
src/
  i18n/                  i18next setup + en.json / ko.json locale files
  types/                 TS types for site config, catalog, availability, origins
  data/                  Owner-editable data modules (see above)
  lib/
    filterCatalog.ts     Pure, unit-testable catalogue filter logic
    links.ts             tel:/sms:/wa.me/mailto link builders
    blossomSwatches.ts   Filter-rail swatch colours per blossom colour
  components/
    layout/              Header, Footer
    stage/                InteractiveStage mount point + p5 generative flower sketch
    sections/             The 8 page sections (Hero, AvailabilityBoard, Catalogue, …)
    catalogue/             FilterBar, CatalogueCard, CatalogueGrid
    common/                 Small shared UI: SectionHeading, CtaButton, LanguageToggle, PhotoFrame
public/
  images/
    hero/                 Hero plate photo (see README inside)
    catalog/               Catalog item photos (see README inside)
```

## Notes on placeholders

The following are intentionally marked `TODO(owner)` in the code/data and
should not be treated as final: the daily availability contents (currently
unmounted) and every catalog item's colour/season tags. Search the codebase
for `TODO(owner)` to find them. Business hours and delivery zones are
confirmed real values.
