"use client";

import { useSyncExternalStore } from "react";
import { variants, keyOf, type Variant } from "./data";

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

const STORAGE_KEY = "nygf-admin-prototype-v1";

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

const SERVER: Movement[] = seed();

let movements: Movement[] = SERVER;
let nextId = SERVER.length;

// Read at module load rather than in an effect, so the first client render is
// already correct and React is never told a value changed when the component
// simply learned it — the same argument client-env.ts makes.
if (typeof window !== "undefined") {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as Movement[];
      if (Array.isArray(parsed) && parsed.length) {
        movements = parsed;
        nextId = Math.max(...parsed.map((m) => m.id)) + 1;
      }
    }
  } catch {
    // A corrupt or unavailable store is not worth a broken screen: fall back to
    // the seed and carry on.
  }
}

const listeners = new Set<() => void>();

function commit(next: Movement[]) {
  movements = next;
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
  commit([...movements, ...entries.map((entry) => ({ ...entry, id: nextId++, at }))]);
}

export function resetToSeed() {
  nextId = SERVER.length;
  commit(seed());
}

export function useLedger() {
  return useSyncExternalStore(
    (notify) => {
      listeners.add(notify);
      return () => listeners.delete(notify);
    },
    () => movements,
    () => SERVER,
  );
}

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
  variants.find((v) => keyOf(v) === key);
