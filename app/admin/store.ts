"use client";

import { useSyncExternalStore } from "react";
import { variants, keyOf, type Variant } from "./data";
import { normalize } from "../lib/text";

// The prototype's data layer, and it is deliberately the shape the real one
// will be: a ledger of movements, with every count derived from it. Nothing in
// here ever writes a stock number directly. Receiving adds a row, selling adds
// a negative row, correcting a miscount adds a row saying so, and what is on
// the shelf is whatever those rows add up to.
//   That is not ceremony. A number you can only overwrite tells you what
// somebody last typed; a number you can only add to tells you what happened,
// which is the difference between a system that can answer "where did the other
// four go" and one that cannot. It is also what makes waste countable at all.
//   Backed by localStorage so the three screens agree with each other while
// somebody is clicking around. Swapping this for Postgres is a change to this
// file and to nothing that imports it.

export type Reason = "intake" | "sale" | "adjustment" | "waste";

export type Movement = {
  id: number;
  key: string;        // which variant, from keyOf()
  delta: number;      // positive in, negative out
  reason: Reason;
  dateCode?: string;  // the lot this came in on, for anything received
  farm?: string;
  note?: string;
  at: number;
};

const STORAGE_KEY = "nygf-admin-prototype-v2";

// The seeded cooler, expressed as the receipts that would have produced it, so
// there is no state in the system that did not arrive as a movement.
function seed(): Movement[] {
  let id = 0;
  return variants.flatMap((v) =>
    v.lots.map((lot) => ({
      id: id++,
      key: keyOf(v),
      delta: lot.units,
      reason: "intake" as const,
      dateCode: lot.dateCode,
      farm: lot.farm,
      at: 0,
    })),
  );
}

// Everything the prototype holds. Movements are the ledger; the other two are
// what makes the catalogue able to grow.
//   `customs` are variants somebody typed in at the moment a box arrived with a
// flower nobody had filed yet. That is the right moment to create one: the
// alternative is a settings screen nobody opens, or seeding a cross product of
// 201 varieties by 8 grades, most of which the shop never buys.
//   `aliases` map the text a label or a florist's list actually used onto the
// variant it turned out to be — "TIFANNY" to Tiffany, "High & Y. Magic Flame 40
// 25" to High & Magic. Written on every confirmation, so the second box from the
// same farm matches without asking. This is the table that makes scanning get
// quieter over weeks instead of asking forever.
export type State = {
  movements: Movement[];
  customs: Variant[];
  aliases: Record<string, string>;
};

const SERVER: State = { movements: seed(), customs: [], aliases: {} };

let state: State = SERVER;
let nextId = SERVER.movements.length;

// Read at module load rather than in an effect, so the first client render is
// already correct and React is never told a value changed when the component
// simply learned it — the same argument client-env.ts makes.
if (typeof window !== "undefined") {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<State>;
      if (parsed && Array.isArray(parsed.movements) && parsed.movements.length) {
        state = {
          movements: parsed.movements,
          customs: parsed.customs ?? [],
          aliases: parsed.aliases ?? {},
        };
        nextId = Math.max(...parsed.movements.map((m) => m.id)) + 1;
      }
    }
  } catch {
    // A corrupt or unavailable store is not worth a broken screen: fall back to
    // the seed and carry on.
  }
}

const listeners = new Set<() => void>();

function commit(next: State) {
  state = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Private browsing, quota, whatever. The screen still works for this
    // session; only the persistence is lost.
  }
  listeners.forEach((notify) => notify());
}

export function post(entries: Array<Omit<Movement, "id" | "at">>) {
  const at = Date.now();
  commit({
    ...state,
    movements: [...state.movements, ...entries.map((entry) => ({ ...entry, id: nextId++, at }))],
  });
}

// A flower nobody had filed, typed in at the moment a box of it turned up.
// Returns the key so the caller can post against it straight away.
export function addVariant(variant: Variant, labelText?: string) {
  const key = keyOf(variant);
  commit({
    ...state,
    customs: state.customs.some((v) => keyOf(v) === key) ? state.customs : [...state.customs, variant],
    aliases: labelText ? { ...state.aliases, [aliasKey(labelText)]: key } : state.aliases,
  });
  return key;
}

// Remember that this piece of label text meant this variant.
export function addAlias(labelText: string, key: string) {
  commit({ ...state, aliases: { ...state.aliases, [aliasKey(labelText)]: key } });
}

// Matched loosely, because the same flower is written a dozen ways across farms:
// accents off, case folded, and the packing digits farms tack on the end
// ("Queen Crown 40 25", "HIGH & MAGIC 70CM 25 LA ROSALEDA") dropped, since they
// repeat what the grade and bunch columns already say.
export const aliasKey = (text: string) =>
  normalize(text).replace(/\b\d+\s*cm\b/g, " ").replace(/\b\d+\b/g, " ").replace(/\s+/g, " ").trim();

export function resetToSeed() {
  nextId = SERVER.movements.length;
  commit({ movements: seed(), customs: [], aliases: {} });
}

function useStore() {
  return useSyncExternalStore(
    (notify) => {
      listeners.add(notify);
      return () => listeners.delete(notify);
    },
    () => state,
    () => SERVER,
  );
}

export const useLedger = () => useStore().movements;

// The seeded catalogue plus whatever has been typed in since.
export const useVariants = () => {
  const { customs } = useStore();
  return customs.length ? [...variants, ...customs] : variants;
};

export const useAliases = () => useStore().aliases;

// ---------------------------------------------------------------------------
// Everything below reads the ledger. None of it stores anything.
// ---------------------------------------------------------------------------

export const balance = (ledger: Movement[], key: string) =>
  ledger.reduce((sum, m) => (m.key === key ? sum + m.delta : sum), 0);

export type OpenLot = { dateCode: string; farm?: string; units: number };

// What is physically left, lot by lot, oldest first. Outflow is drawn off the
// oldest lot first because that is what happens in the room and because any
// other assumption would flatter the aging figures.
//   The date code sorts as a date once its digits are put back in order, which
// is why it is reversed here rather than parsed into a Date: the comparison is
// the only thing needed and MMDD compares correctly as a string.
export function openLots(ledger: Movement[], key: string): OpenLot[] {
  const rows = ledger.filter((m) => m.key === key);
  const lots = rows
    .filter((m) => m.delta > 0 && m.dateCode)
    .map((m) => ({ dateCode: m.dateCode!, farm: m.farm, units: m.delta }))
    .sort((a, b) => sortable(a.dateCode).localeCompare(sortable(b.dateCode)));

  // Anything received without a lot, plus every outflow, is settled against the
  // dated lots from the oldest end.
  let loose = rows.reduce((sum, m) => sum + (m.delta > 0 && m.dateCode ? 0 : m.delta), 0);
  const open: OpenLot[] = [];
  for (const lot of lots) {
    if (loose < 0) {
      const taken = Math.min(lot.units, -loose);
      loose += taken;
      if (lot.units - taken > 0) open.push({ ...lot, units: lot.units - taken });
      continue;
    }
    open.push(lot);
  }
  // A positive remainder is stock with no lot behind it — a plain correction
  // upward. It is the newest thing there is, so it goes on the end.
  if (loose > 0) open.push({ dateCode: "", units: loose });
  return open;
}

const sortable = (code: string) => code.split("").reverse().join("");

export const soldToday = (ledger: Movement[], on: Date) => {
  const start = new Date(on.getFullYear(), on.getMonth(), on.getDate()).getTime();
  return ledger.filter((m) => m.reason === "sale" && m.at >= start);
};

export const wastedThisMonth = (ledger: Movement[], on: Date) => {
  const start = new Date(on.getFullYear(), on.getMonth(), 1).getTime();
  return ledger.filter((m) => m.reason === "waste" && m.at >= start);
};

export const variantFor = (key: string): Variant | undefined =>
  [...variants, ...state.customs].find((v) => keyOf(v) === key);
