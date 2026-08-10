// The filter chips, in the order they render. The six stem chips are sized so
// none of them comes back with only two or three cards, which is the failure
// this replaced — a new stem category has to be able to carry a grid before it
// earns one. Bouquets is the exception and sits last on purpose: it is the one
// chip that isn't stems by the bunch at all, so a short list under it reads as
// the whole of what is made up rather than as a category that fell short.
//   A label is display copy in two places, not one: it is the chip, and it is
// the group line printed under every card in that category. Title Case, as
// every heading on the site is — the lower-case colour that some cards add
// after it is the only part of that line set as running text.
export const categories = [
  { id: "roses", label: "Roses" },
  { id: "carnations", label: "Carnations" },
  { id: "lilies", label: "Lilies and Callas" },
  { id: "orchids", label: "Orchids and Tropicals" },
  { id: "seasonal", label: "Seasonal and Specialty" },
  { id: "greens", label: "Greens and Filler" },
  { id: "bouquets", label: "Bouquets" },
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
  // A set of frames, for a record photographed more than once. Where `image` is
  // one picture of a stem that is always the same stem, this is for the ones
  // made up to order: a bouquet is a different object every time it is tied, so
  // one frame of it is a claim the next delivery has to live up to and three is
  // closer to the truth. The card cycles them where this is set and falls back
  // to `image` where it isn't, so it stays opt-in — nothing else on the list
  // wants it.
  images?: string[];
  // Neither of these is filled in yet, and neither should be guessed — the
  // Korean names on file were seed-translated and never reviewed, and no
  // botanical name has been confirmed against what the shop actually buys. The
  // search box already reads both fields, so a buyer can type either the moment
  // the owner fills one in.
  korean?: string;
  botanical?: string;
  // The colour group a variety is bought by. Only the named roses carry one so
  // far, and they are the reason it exists: "Roses" is what the chip says, and
  // between ten of them the colour is the thing that actually tells one card
  // from the next. It reads as the second half of the card's meta line and goes
  // into the search haystack below, so typing "white" reaches Vendela and
  // Mondial. Written in the case it reads in mid-sentence, since that is the
  // only place it appears.
  colour?: string;
};

const items: CatalogueItem[] = [
  { name: "Red Rose", category: "roses", image: "/media/red-rose.webp" },
  { name: "Spray Rose", category: "roses", image: "/media/spray-rose.webp" },
  { name: "Garden Rose", category: "roses", image: "/media/garden-rose.webp" },
  // The three above are grades; these are the varieties bought by name, so they
  // sit under the same chip rather than taking one of their own.
  //   Every colour here is read off the photograph beside it rather than off a
  // variety's reputation: Mondial and Momentum are a white and a red in the
  // trade at large, and the shop's own stems are the blush and the yellow the
  // pictures show. The photograph is what a buyer is choosing from, so it wins.
  //   Which makes the three pinks a scale rather than three guesses at one word:
  // light pink, pink, hot pink, palest first. They are the only colours on the
  // list a reader has to tell apart from each other.
  //   Tinted Rose is the one with no colour of its own: it is a treatment
  // rather than a group, and the name has already said so by the time the meta
  // line would repeat it.
  { name: "Vendela", category: "roses", colour: "white and cream", image: "/media/vendela.webp" },
  { name: "Mondial", category: "roses", colour: "light pink", image: "/media/mondial.webp" },
  { name: "Mandala", category: "roses", colour: "pink", image: "/media/mandala.webp" },
  { name: "Momentum", category: "roses", colour: "yellow", image: "/media/momentum.webp" },
  { name: "High & Magic", category: "roses", colour: "bicolor", image: "/media/high-and-magic.webp" },
  { name: "Pink Floyd", category: "roses", colour: "hot pink", image: "/media/pink-floyd.webp" },
  { name: "Tinted Rose", category: "roses", image: "/media/tinted-rose.webp" },

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
  { name: "Spider Chrysanthemum", category: "seasonal", image: "/media/spider-chrysanthemum.webp" },
  { name: "Delphinium", category: "seasonal", image: "/media/delphinium.webp" },
  // Peruvian lily by its common name, but not a true one, and the trade buys it
  // as its own line rather than off the lily list — so it sits with the other
  // year-round mainstays here rather than under the Lilies chip. Moving it is a
  // one-word edit if the shop reads it the other way.
  { name: "Alstroemeria", category: "seasonal", image: "/media/alstroemeria.webp" },
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
  // The plume is the flower, but the hanging cut is bought to trail out of an
  // arrangement the way the rest of this chip is, so it is filed by what it does
  // rather than by what it is.
  { name: "Hanging Amaranthus", category: "greens", image: "/media/hanging-amaranthus.webp" },

  // Made up rather than sold by the stem, so they close the list: everything
  // above is what goes into one.
  //   Each of these takes three photographs rather than one, on `images` — see
  // the field's note above for why, and .flower-slide in globals.css for the
  // turn itself. The order here is the order they are shown in, so the frame
  // that best answers "what is this" belongs first: it is the one a card is
  // holding when a reader arrives, and the only one described to a screen
  // reader.
  { name: "Rose Bouquet", category: "bouquets", images: ["/media/rose-bouquet1.webp", "/media/rose-bouquet2.webp", "/media/rose-bouquet3.webp"] },
  { name: "Mixed Bouquet", category: "bouquets", images: ["/media/mixed-bouquet1.webp", "/media/mixed-bouquet2.webp", "/media/mixed-bouquet3.webp"] },
  { name: "Tropical Bouquet", category: "bouquets", images: ["/media/tropical-bouquet1.webp", "/media/tropical-bouquet2.webp", "/media/tropical-bouquet3.webp"] },
];

// Dutch, wedding and tropical flowers are offerings, not stems sold by the
// bunch, so they live in their own section rather than the filterable grid.
// Kept in step with the order kinds the contact form offers: a buyer who reads
// about one here has to be able to pick it there.
// The photograph is the card's ground rather than a picture sitting on it, so
// it is decorative: the heading over it already names the offering, and the
// card carries no alt text for that reason. Same pipeline as the catalogue
// stems — drop the original in public/media, run `npm run media`, point here.
export const services = [
  { name: "Dutch Flowers", image: "/media/dutch-flowers.webp" },
  { name: "Wedding Flowers", image: "/media/wedding-flowers.webp" },
  { name: "Tropical Flowers", image: "/media/tropical-flowers.webp" },
];

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
// first, then the colour group and the Korean and botanical names if the record
// carries them.
export const flowers = items.map((item) => ({
  ...item,
  group: categoryLabels.get(item.category)!,
  search: normalize([item.name, item.colour, item.korean, item.botanical].filter(Boolean).join(" ")),
}));

// The home field leads with photographed stems rather than grey placeholders.
// Order matters: PLACEMENT in flower-field.tsx scatters them by index.
// These are names, so renaming an item above means renaming it here too — the
// lookup below asserts the match rather than checking it, and a miss would take
// the home page down rather than dropping one stem out of the field.
const previewNames = ["Red Rose", "Premium Hydrangea", "Premium Lilies", "Peony", "Tulips", "Ranunculus", "Sunflowers", "Calla Lilies", "Anemone"];
export const previewFlowers = previewNames.map((name) => flowers.find((flower) => flower.name === name)!);
