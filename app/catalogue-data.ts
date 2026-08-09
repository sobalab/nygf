// The six filter chips, in the order they render. Six is the whole list: adding
// a seventh means most chips go back to returning two or three cards, which is
// what this replaced.
export const categories = [
  { id: "roses", label: "Roses" },
  { id: "carnations", label: "Carnations" },
  { id: "lilies", label: "Lilies and callas" },
  { id: "orchids", label: "Orchids and tropicals" },
  { id: "seasonal", label: "Seasonal and specialty" },
  { id: "greens", label: "Greens and filler" },
] as const;

export type CategoryId = (typeof categories)[number]["id"];

export type CatalogueItem = {
  name: string;
  // Exactly one category per item, and every item has one — this field is the
  // only place a flower's chip is decided, so adding a variety is one line here
  // and nothing in the page component.
  category: CategoryId;
  // Photography. To add one: drop the original in public/media, run
  // `npm run media` to convert it to WebP, then set the path here. An item
  // without an image falls back to a flat tile rather than breaking the grid.
  image?: string;
  // Neither of these is filled in yet, and neither should be guessed — the
  // Korean names on file were seed-translated and never reviewed, and no
  // botanical name has been confirmed against what the shop actually buys. The
  // search box already reads both fields, so a buyer can type either the moment
  // the owner fills one in.
  korean?: string;
  botanical?: string;
};

const items: CatalogueItem[] = [
  { name: "Premium Rose", category: "roses", image: "/media/premium-rose.webp" },
  { name: "Spray Rose", category: "roses", image: "/media/spray-rose.webp" },
  { name: "Garden Rose", category: "roses", image: "/media/garden-rose.webp" },

  { name: "Select-grade Carnation", category: "carnations", image: "/media/select-carnations.webp" },
  { name: "Mini Carnation", category: "carnations", image: "/media/mini-carnation.webp" },

  { name: "Premium Lilies", category: "lilies", image: "/media/premium-lilies.webp" },
  { name: "Oriental Lily", category: "lilies", image: "/media/oriental-lilies.webp" },
  { name: "Asiatic Lily", category: "lilies", image: "/media/asiatic-lilies.webp" },
  { name: "Hybrid Lilies", category: "lilies", image: "/media/hybrid-lilies.webp" },
  { name: "Calla Lilies", category: "lilies", image: "/media/calla-lilies.webp" },
  { name: "Mini Calla Lilies", category: "lilies", image: "/media/mini-calla-lilies.webp" },

  { name: "Cymbidium Orchid", category: "orchids", image: "/media/cymbidium-orchid.webp" },
  { name: "Dendrobium", category: "orchids", image: "/media/dendrobium.webp" },
  { name: "Phalaenopsis (Moth Orchid)", category: "orchids", image: "/media/phalaenopsis.webp" },
  { name: "Bird of Paradise", category: "orchids", image: "/media/bird-of-paradise.webp" },

  { name: "Premium Hydrangea", category: "seasonal", image: "/media/hydrangea.webp" },
  { name: "Tulips", category: "seasonal", image: "/media/tulips.webp" },
  { name: "Sunflowers", category: "seasonal", image: "/media/sunflowers.webp" },
  { name: "Peony", category: "seasonal", image: "/media/peonies.webp" },
  { name: "Ranunculus", category: "seasonal", image: "/media/ranunculus.webp" },
  { name: "Butterfly Ranunculus", category: "seasonal", image: "/media/butterfly-ranunculus.webp" },
  { name: "Anemone", category: "seasonal", image: "/media/anemone.webp" },
  { name: "Sweet Pea", category: "seasonal", image: "/media/sweet-pea.webp" },
  { name: "Lisianthus", category: "seasonal", image: "/media/lisianthus.webp" },
  { name: "Chrysanthemum", category: "seasonal", image: "/media/chrysanthemum.webp" },
  { name: "Daisy", category: "seasonal", image: "/media/daisies.webp" },
  { name: "Gerbera", category: "seasonal", image: "/media/gerbera.webp" },
  { name: "Snapdragon", category: "seasonal", image: "/media/snapdragon.webp" },
  { name: "Molucella", category: "seasonal", image: "/media/molucella.webp" },

  { name: "Eucalyptus", category: "greens", image: "/media/eucalyptus.webp" },
  { name: "Israeli Ruscus", category: "greens", image: "/media/israeli-ruscus.webp" },
  { name: "Baby's Breath", category: "greens", image: "/media/babys-breath.webp" },
  { name: "Solidago", category: "greens", image: "/media/solidago.webp" },
  { name: "Statice", category: "greens", image: "/media/statice.webp" },
  { name: "Wax Flower", category: "greens", image: "/media/wax-flower.webp" },
  { name: "Queen of Lace", category: "greens", image: "/media/queen-of-lace.webp" },
  { name: "Lepidium", category: "greens", image: "/media/lepidium.webp" },
];

// Dutch and wedding flowers are offerings, not stems sold by the bunch, so they
// live in their own section rather than the filterable grid.
export const services = ["Dutch Flowers", "Wedding Flowers"];

const categoryLabels = new Map<CategoryId, string>(categories.map(({ id, label }) => [id, label]));

// One spelling for both sides of the search: lower case, and accents pulled off
// the letters they sit on, so "peonies" finds Peony's neighbours and a typed
// "e" still reaches an "é". The query runs through the same function, so the two
// strings are always compared in the same form.
function normalize(value: string) {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

export function normalizeQuery(value: string) {
  return normalize(value.trim());
}

// The haystack is built once, at module load, rather than per keystroke: name
// first, then the Korean and botanical names if the record carries them.
export const flowers = items.map((item) => ({
  ...item,
  group: categoryLabels.get(item.category)!,
  search: normalize([item.name, item.korean, item.botanical].filter(Boolean).join(" ")),
}));

// The home field leads with photographed stems rather than grey placeholders.
// Order matters: PLACEMENT in flower-field.tsx scatters them by index.
const previewNames = ["Premium Rose", "Premium Hydrangea", "Premium Lilies", "Peony", "Tulips", "Ranunculus", "Sunflowers", "Calla Lilies", "Anemone"];
export const previewFlowers = previewNames.map((name) => flowers.find((flower) => flower.name === name)!);
