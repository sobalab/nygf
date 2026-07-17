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

Edit this every morning. `date` drives the heading, `updatedAt` drives the
"Updated" timestamp, and each item's `status` is one of `'in-stock'`,
`'limited'`, or `'pre-order'`. Item names here are freeform strings (not
translated per-locale) — write them in whatever language is fastest for the
morning update.

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

Delivery zones, order cutoff, and delivery minimum are marked
`TODO(owner)` placeholders inside `delivery.info.*.value` in both locale
files (see below) — fill in the real values before launch.

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

## Where three.js / p5 plug in later

The hero's framed "plate" renders `<InteractiveStage>`
(`src/components/stage/InteractiveStage.tsx`). It's wrapped in
`React.memo` and owns its own `containerRef`, isolated so a future
WebGL/canvas render loop won't re-render on every page-level state change
(filters, language toggle, scroll). Right now it renders a static fallback —
a photo if `fallbackSrc` resolves, otherwise a plain paper-toned block.

The mount point is commented directly in that file. To wire up a sketch
later:

- **three.js / `@react-three/fiber`**: render an R3F `<Canvas>` as a child of
  the container inside `InteractiveStage`.
- **p5.js**: in a `useEffect`, do
  `new p5(sketch, containerRef.current)` and clean it up (`instance.remove()`)
  on unmount.

Neither library is installed yet — ask before adding `three`,
`@react-three/fiber`, or `p5` as dependencies.

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
    stage/                InteractiveStage (future three.js/p5 mount point)
    sections/             The 8 page sections (Hero, AvailabilityBoard, Catalogue, …)
    catalogue/             FilterRail, CatalogueCard, CatalogueGrid
    common/                 Small shared UI: SectionHeading, CtaButton, LanguageToggle, PhotoFrame
public/
  images/
    hero/                 Hero plate photo (see README inside)
    catalog/               Catalog item photos (see README inside)
```

## Notes on placeholders

The following are intentionally marked `TODO(owner)` in the code/data and
should not be treated as final: business hours, delivery zones, order
cutoff, delivery minimum, all daily availability contents, and every
catalog item's colour/season tags. Search the codebase for `TODO(owner)` to
find them all.
