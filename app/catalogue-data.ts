export const groups = [
  { id: "roses", label: "Roses", items: ["Premium Rose", "Spray Rose", "Garden Rose"] },
  { id: "carnations", label: "Carnations", items: ["Select-grade Carnation", "Mini Carnation"] },
  { id: "lilies", label: "Lilies", items: ["Premium Lilies", "Oriental Lily", "Asiatic Lily", "Hybrid Lilies"] },
  { id: "callas", label: "Callas", items: ["Calla Lilies", "Mini Calla Lilies"] },
  { id: "orchids", label: "Orchids", items: ["Cymbidium Orchid", "Dendrobium", "Phalaenopsis (Moth Orchid)"] },
  { id: "hydrangea", label: "Hydrangea", items: ["Premium Hydrangea"] },
  { id: "seasonal", label: "Seasonal and specialty", items: ["Tulips", "Sunflowers", "Peony", "Ranunculus", "Butterfly Ranunculus", "Anemone", "Sweet Pea", "Lisianthus"] },
  { id: "daisy", label: "Daisy family", items: ["Chrysanthemum", "Daisy", "Gerbera"] },
  { id: "line", label: "Line flowers", items: ["Snapdragon", "Molucella", "Lepidium"] },
  { id: "filler", label: "Filler", items: ["Baby's Breath", "Solidago", "Statice", "Wax Flower", "Queen of Lace"] },
  { id: "greens", label: "Greens", items: ["Eucalyptus", "Israeli Ruscus"] },
  { id: "tropical", label: "Tropical", items: ["Bird of Paradise"] },
];

// Dutch and wedding flowers are offerings, not stems sold by the bunch, so they
// live in their own section rather than the filterable grid.
export const services = ["Dutch Flowers", "Wedding Flowers"];

// Photography keyed by item name. Every item is covered right now; anything
// added to `groups` without an entry here falls back to a flat tile. To add
// one: drop the original in public/media, run `npm run media` to convert it to
// WebP, then add a line here.
const images: Record<string, string> = {
  "Premium Rose": "/media/premium-rose.webp",
  "Spray Rose": "/media/spray-rose.webp",
  "Garden Rose": "/media/garden-rose.webp",
  "Select-grade Carnation": "/media/select-carnations.webp",
  "Mini Carnation": "/media/mini-carnation.webp",
  "Premium Lilies": "/media/premium-lilies.webp",
  "Oriental Lily": "/media/oriental-lilies.webp",
  "Asiatic Lily": "/media/asiatic-lilies.webp",
  "Hybrid Lilies": "/media/hybrid-lilies.webp",
  "Calla Lilies": "/media/calla-lilies.webp",
  "Mini Calla Lilies": "/media/mini-calla-lilies.webp",
  "Cymbidium Orchid": "/media/cymbidium-orchid.webp",
  "Dendrobium": "/media/dendrobium.webp",
  "Phalaenopsis (Moth Orchid)": "/media/phalaenopsis.webp",
  "Premium Hydrangea": "/media/hydrangea.webp",
  "Tulips": "/media/tulips.webp",
  "Sunflowers": "/media/sunflowers.webp",
  "Peony": "/media/peonies.webp",
  "Ranunculus": "/media/ranunculus.webp",
  "Butterfly Ranunculus": "/media/butterfly-ranunculus.webp",
  "Anemone": "/media/anemone.webp",
  "Sweet Pea": "/media/sweet-pea.webp",
  "Lisianthus": "/media/lisianthus.webp",
  "Chrysanthemum": "/media/chrysanthemum.webp",
  "Daisy": "/media/daisies.webp",
  "Gerbera": "/media/gerbera.webp",
  "Snapdragon": "/media/snapdragon.webp",
  "Molucella": "/media/molucella.webp",
  "Lepidium": "/media/lepidium.webp",
  "Baby's Breath": "/media/babys-breath.webp",
  "Solidago": "/media/solidago.webp",
  "Statice": "/media/statice.webp",
  "Wax Flower": "/media/wax-flower.webp",
  "Queen of Lace": "/media/queen-of-lace.webp",
  "Eucalyptus": "/media/eucalyptus.webp",
  "Israeli Ruscus": "/media/israeli-ruscus.webp",
  "Bird of Paradise": "/media/bird-of-paradise.webp",
};

export const flowers = groups.flatMap((group) => group.items.map((name) => ({ name, group: group.label, groupId: group.id, image: images[name] })));

export const filters = [{ id: "all", label: "All flowers" }, ...groups.map(({ id, label }) => ({ id, label }))];

// The home strip leads with photographed stems rather than grey placeholders.
const previewNames = ["Premium Rose", "Premium Hydrangea", "Premium Lilies", "Peony", "Tulips"];
export const previewFlowers = previewNames.map((name) => flowers.find((flower) => flower.name === name)!);
