// Seeded from the 27 photographs of the cooler taken on 2026-08-20: real
// varieties, real grades, real farms, real date codes off the boxes. It is
// stand-in data for a prototype — the quantities are invented so the screens
// have something to draw, and nothing here is a figure anybody has counted.
// Everything else is transcribed from the labels.
//   This module exists so the screens can be built and argued about before the
// database lands. When it does, these types are what the queries return, so the
// components do not have to change.
import { daysInCooler } from "../lib/date-code";

export type Lot = {
  // As written on the box in marker, MMDD backwards. Kept as the shop writes it
  // rather than as a Date, because it is what somebody reads off a shelf.
  dateCode: string;
  farm: string;
  units: number;
};

export type Variant = {
  slug: string;          // the catalogue variety it belongs to
  name: string;
  category: string;
  grade: number | null;  // stem length in cm; null for what has no grade
  unit: string;          // what one counted unit is
  stemsPerUnit: number | null;
  par: number | null;    // "running low" at or below this
  lots: Lot[];
  reserved: number;
};

// Grades come off the grid the farm boxes print and tick.
export const GRADES = [40, 50, 60, 70, 80, 90, 100] as const;

export const FARMS = [
  "Ceres Farms", "Herrera Farms", "La Rosaleda", "Fiorentina", "Milenium Roses",
  "Luanflowers", "Esmeralda", "Family Flowers", "Hydranflowers", "Green Land",
  "Golden Flowers", "Pine Ridge", "Simpsons Greens", "Kontikiflor",
];

export const variants: Variant[] = [
  { slug: "freedom", name: "Freedom", category: "Standard Roses", grade: 70, unit: "bunch", stemsPerUnit: 25, par: 8,
    reserved: 6, lots: [{ dateCode: "6180", farm: "Milenium Roses", units: 14 }, { dateCode: "0280", farm: "Milenium Roses", units: 10 }] },
  { slug: "explorer", name: "Explorer", category: "Standard Roses", grade: 80, unit: "bunch", stemsPerUnit: 25, par: 6,
    reserved: 0, lots: [{ dateCode: "0370", farm: "Ceres Farms", units: 12 }] },
  { slug: "mondial", name: "Mondial", category: "Standard Roses", grade: 80, unit: "bunch", stemsPerUnit: 25, par: 4,
    reserved: 0, lots: [{ dateCode: "0280", farm: "Ceres Farms", units: 4 }] },
  { slug: "orange-crush", name: "Orange Crush", category: "Standard Roses", grade: 60, unit: "bunch", stemsPerUnit: 25, par: 6,
    reserved: 2, lots: [{ dateCode: "2180", farm: "Ceres Farms", units: 12 }] },
  { slug: "momentum", name: "Momentum", category: "Standard Roses", grade: 60, unit: "bunch", stemsPerUnit: 25, par: 4,
    reserved: 0, lots: [{ dateCode: "9080", farm: "Ceres Farms", units: 4 }] },
  { slug: "mandala", name: "Mandala", category: "Standard Roses", grade: 50, unit: "bunch", stemsPerUnit: 25, par: 6,
    reserved: 0, lots: [{ dateCode: "2180", farm: "Fiorentina", units: 12 }] },
  { slug: "high-and-magic", name: "High & Magic", category: "Standard Roses", grade: 70, unit: "bunch", stemsPerUnit: 25, par: 6,
    reserved: 3, lots: [{ dateCode: "2270", farm: "La Rosaleda", units: 12 }] },
  { slug: "full-monty", name: "Full Monty", category: "Standard Roses", grade: 50, unit: "bunch", stemsPerUnit: 25, par: 4,
    reserved: 0, lots: [{ dateCode: "6280", farm: "Herrera Farms", units: 9 }] },
  { slug: "tiffany", name: "Tiffany", category: "Standard Roses", grade: 60, unit: "bunch", stemsPerUnit: 25, par: 4,
    reserved: 0, lots: [{ dateCode: "6080", farm: "La Rosaleda", units: 2 }] },
  { slug: "pink-floyd", name: "Pink Floyd", category: "Standard Roses", grade: 60, unit: "bunch", stemsPerUnit: 25, par: 4,
    reserved: 0, lots: [{ dateCode: "9070", farm: "Luanflowers", units: 11 }] },
  { slug: "pink-floyd", name: "Pink Floyd", category: "Standard Roses", grade: 70, unit: "bunch", stemsPerUnit: 25, par: 2,
    reserved: 0, lots: [{ dateCode: "9070", farm: "Luanflowers", units: 1 }] },

  { slug: "premium-hydrangea", name: "Hydrangea, Premium White", category: "Seasonal and Specialty", grade: null, unit: "bunch", stemsPerUnit: 35, par: 4,
    reserved: 0, lots: [{ dateCode: "3080", farm: "Hydranflowers", units: 6 }] },
  { slug: "premium-hydrangea", name: "Hydrangea, Tinted Blue", category: "Seasonal and Specialty", grade: null, unit: "bunch", stemsPerUnit: 35, par: 3,
    reserved: 1, lots: [{ dateCode: "3080", farm: "Hydranflowers", units: 3 }] },
  { slug: "mini-carnation", name: "Mini Carnation, Assorted", category: "Carnations", grade: null, unit: "bunch", stemsPerUnit: 10, par: 10,
    reserved: 4, lots: [{ dateCode: "6180", farm: "Golden Flowers", units: 18 }] },
  { slug: "gerbera", name: "Gerbera, Large", category: "Seasonal and Specialty", grade: null, unit: "box", stemsPerUnit: null, par: 2,
    reserved: 0, lots: [{ dateCode: "8080", farm: "Pine Ridge", units: 2 }] },
  { slug: "premium-lilies", name: "Lily, Dalian", category: "Lilies and Callas", grade: 90, unit: "box", stemsPerUnit: 40, par: 2,
    reserved: 0, lots: [{ dateCode: "6180", farm: "Kontikiflor", units: 3 }] },
  { slug: "lisianthus", name: "Lisianthus, Mixed Double", category: "Seasonal and Specialty", grade: null, unit: "box", stemsPerUnit: 160, par: 1,
    reserved: 0, lots: [{ dateCode: "3180", farm: "Kontikiflor", units: 1 }] },

  { slug: "tii-leaves", name: "Tii Leaves Green", category: "Greens and Filler", grade: 80, unit: "bunch", stemsPerUnit: 10, par: 6,
    reserved: 0, lots: [{ dateCode: "2270", farm: "Simpsons Greens", units: 8 }] },
  { slug: "pittosporum", name: "Pittosporum Variegated", category: "Greens and Filler", grade: null, unit: "bunch", stemsPerUnit: 10, par: 8,
    reserved: 0, lots: [{ dateCode: "3180", farm: "Simpsons Greens", units: 4 }] },
];

// The order the chips run in on the public catalogue, so the cooler reads in the
// same order as the site and, more to the point, as the room.
const CATEGORY_ORDER = [
  "Standard Roses", "Garden Roses", "Spray Roses", "Tinted/Dyed Roses",
  "Carnations", "Lilies and Callas", "Orchids and Tropicals",
  "Seasonal and Specialty", "Greens and Filler", "Bouquets",
];

// What the ledger points at. Not the slug: a slug is one variety and a variety
// is several sellable things — Pink Floyd is a row at 60cm and another at 70cm,
// and hydrangea is white and tinted blue under one catalogue entry.
export const keyOf = (v: Variant) => `${v.name}::${v.grade ?? ""}`;

export const onHand = (v: Variant) => v.lots.reduce((sum, lot) => sum + lot.units, 0);
export const available = (v: Variant) => onHand(v) - v.reserved;

// The oldest lot decides whether a row needs attention, because it is the one
// that will be thrown away first.
export function oldestLot(v: Variant, on: Date): { lot: Lot; days: number } | null {
  let worst: { lot: Lot; days: number } | null = null;
  for (const lot of v.lots) {
    const days = daysInCooler(lot.dateCode, on);
    if (days === null) continue;
    if (!worst || days > worst.days) worst = { lot, days };
  }
  return worst;
}

// Seven days is a working default and not a fact about any particular flower.
// Real shelf life belongs per product, which is why the schema carries it there.
export const isAging = (days: number) => days >= 7;

// Past this, the reading is far more likely to be a misread code than a real
// box. Cut flowers do not last six weeks, so a lot that claims to have been in
// the cooler since last autumn is telling you about the handwriting, not about
// the stock — and the screens say so rather than printing "359 days in" with a
// straight face. Found by looking at the prototype: the Full Monty box reads
// 6280, which decodes to a date in the future and so resolves to last year.
export const SUSPECT_AFTER_DAYS = 45;
export const isSuspect = (days: number) => days > SUSPECT_AFTER_DAYS;
export const isLow = (v: Variant) => v.par !== null && available(v) <= v.par;

export function byCategory(list: Variant[]) {
  const groups = new Map<string, Variant[]>();
  for (const v of list) {
    const group = groups.get(v.category) ?? [];
    group.push(v);
    groups.set(v.category, group);
  }
  return [...groups.entries()].sort(
    (a, b) => CATEGORY_ORDER.indexOf(a[0]) - CATEGORY_ORDER.indexOf(b[0]),
  );
}

export const label = (v: Variant) => (v.grade ? `${v.name}, ${v.grade}cm` : v.name);
