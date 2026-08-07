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

// Cards fall back to a flat tile until real photography exists; add `image` per item to swap one in.
export const flowers = groups.flatMap((group) => group.items.map((name) => ({ name, group: group.label, groupId: group.id })));

export const filters = [{ id: "all", label: "All flowers" }, ...groups.map(({ id, label }) => ({ id, label }))];

const previewIds = ["roses", "hydrangea", "lilies", "seasonal", "greens"];
export const previewGroups = previewIds.map((id) => groups.find((group) => group.id === id)!);
