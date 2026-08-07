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

`web3formsAccessKey` powers the contact form's auto-email (see below).

### Contact form (`#/contact`) — auto-email + WhatsApp

The Contact page is its own view at `#/contact` (a lightweight hash route — no
router dependency). On submit it opens a prefilled WhatsApp draft to the shop
**and** emails a copy of the inquiry to the shop as the confirmation record.

The email is sent through [Web3Forms](https://web3forms.com) — a free, static-
site-friendly service (no server needed):

1. Sign up at web3forms.com using the shop email (`nyflowergarden@hotmail.com`)
   so inquiries land in that inbox.
2. Copy the **access key** (a UUID) it gives you.
3. Paste it into `web3formsAccessKey` in `src/data/siteConfig.ts`, replacing
   `'YOUR_WEB3FORMS_ACCESS_KEY'`. The key is public-safe (it only permits
   submissions to your address), so it's fine to commit.

Until a real key is set, the form still works — it just falls back to opening
WhatsApp plus a one-tap "email a copy" (`mailto:`) draft instead of auto-sending.

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

## The hero's particle specimen

The hero's framed "plate" is a **three.js particle specimen**: a rotating 3D
flower built from tens of thousands of GPU particles, glowing on a dark plate,
cycling one flower at a time across five species (rose, peony, sunflower, lily,
orchid). Each species has a procedural 3D form (petals/disc/stem sampled as 3D
surfaces) and every particle is coloured by sampling the **reference photo**
(`public/images/flowers/*.jpg`, front-projected onto the form) — so the shape
and colour come from the real flowers, rendered as points. The cloud rotates
under a fixed camera that looks slightly down into the blooms.

Particles are soft additive sprites. To keep dense cores glowing as bright
*colour* instead of clipping to white, they accumulate into an **HDR float
buffer** which a post pass then **ACES tone-maps** to the screen — a proper
bloom-style pipeline. The dark plate is what lets the glow (and the white
lily/orchid) read; the rest of the page stays light around the framed screen.

- **Scene:** `src/components/stage/heroFlowerScene.ts` — the whole three.js
  pipeline: species geometry generation + photo colour sampling, the additive
  particle shader, the HDR render target + tone-map post pass, rotation, the
  species cross-fade cycle, pause/resume, resize, and full GPU disposal.
- **Mount point:** `src/components/stage/InteractiveStage.tsx` — a memoized,
  generic container that lazy-mounts the scene on first intersection. three.js is
  dynamic-imported, so it is **code-split** and only downloads when the plate is
  on-screen (desktop). It never loads on mobile, where the plate is hidden.
- **Motion & accessibility:** `prefers-reduced-motion` renders one static flower
  (no loop); otherwise a pause/play button on the plate lets anyone stop the
  motion (WCAG 2.2.2). The loop also pauses when off-screen or the tab is hidden.

three.js (`three@^0.180`) is the only 3D dependency. To add a flower species:
drop a 4:5 crop of the bloom in `public/images/flowers/`, then append an entry to
`SPECIES` in `heroFlowerScene.ts` — the `image` path, a `cx,cy,r` UV mapping
(flower centre + sample radius in the crop, 0..1), the geometric bloom radius
`geoR`, and a `build(e)` routine that emits bloom particles via `e.bloom(x,y,z)`
(coloured from the photo) and stem/leaf particles via `e.stem(x,y,z)`. y is up;
bloom centred at the origin, stem base near y=-2.3. The shared
`petal`/`discFill`/`ball`/`stemAndLeaves` helpers cover most forms.

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
