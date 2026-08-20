// Orders do not arrive as forms. They arrive as a typed list from the florist,
// which gets printed, pinned to a corkboard, and worked over with a pen. This
// parses that list, so the pinning step can become a screen without asking any
// florist to change how they send it.
//
// Taken off two real slips, which do not agree with each other. Both have to work.
//
//   Natasha #0823. Florentine gardn        Coco
//   Hydrangea white 4410(126 box)          pick up on 8/20( Thursday)
//   Mondial 3225                           Black Magic  x 5 bunches,
//   Over time 250 bunch                    Freedom red roses x 6
//   Stock white 40 bunch                   bunches,
//                                          spray red Roses x7bunches ,
//                                          White hydrangeas ( premium) x 200 pcs,
//
// What the two conventions share is that the unit is only ever named when it is
// bunches or pieces; a bare number is stems.
//
// Three things the second slip forces:
//   THE UNIT WRAPS ONTO THE NEXT LINE. "Freedom red roses x 6" / "bunches," is
// one line of an order that a text editor broke in two. A row that is nothing
// but a unit word belongs to the row above it.
//   THE SEPARATOR MAY BE "x", WITH OR WITHOUT A SPACE. "x 5 bunches" and
// "x7bunches" are the same thing.
//   THE HEADER IS PROSE. "pick up on 8/20( Thursday)" carries the fulfilment
// method and the date in a sentence, where the other slip carries the date as
// "#0823" and the venue as a bare word.
//
// On dates: "#0823" and "8/20" are both MMDD and both read forwards. **Neither
// is reversed.** The four-digit code written on the cooler boxes IS reversed —
// see app/lib/date-code.ts. Two four-digit date conventions in one building, and
// confusing them would put orders in the wrong week without ever looking wrong.

export type ParsedLine = {
  raw: string;
  name: string;
  stems: number | null;
  bunches: number | null;
};

export type ParsedList = {
  customer: string | null;
  neededOn: { month: number; day: number } | null;
  venue: string | null;
  fulfilment: "pickup" | "delivery" | null;
  lines: ParsedLine[];
};

// "Natasha #0823. Florentine gardn" / "Natasha # 0826 palazzo"
const HEADER_HASH = /^(.+?)\s*#\s*(\d{4})\s*\.?\s*(.*)$/;
// "pick up on 8/20( Thursday)" / "delivery 9/2"
const HEADER_PROSE = /\b(pick\s*-?\s*up|pickup|deliver(?:y|ed)?)\b[^0-9]*(\d{1,2})\s*\/\s*(\d{1,2})/i;

const UNIT = "bunch|bunches|box|boxes|stem|stems|pc|pcs|piece|pieces";
// A trailing "(126 box)" or "(175 stems)".
const PAREN = new RegExp(`\\s*\\(\\s*(\\d+)\\s*(${UNIT})\\s*\\)\\s*$`, "i");
// A trailing quantity. The separator is whitespace, a hyphen ("Mandala-450"), or
// an "x" that may not be spaced off from its number ("x7bunches").
const QUANTITY = new RegExp(`[\\s-]*\\bx?\\s*(\\d+)\\s*(${UNIT})?\\s*[.,]?\\s*$`, "i");
// A row that is only a unit, left behind when a line wrapped.
const ORPHAN_UNIT = new RegExp(`^(${UNIT})\\s*[.,]?$`, "i");

const isBunch = (unit?: string) => !!unit && /^(bunch|bunches|box|boxes)$/i.test(unit);

export function parseOrderLine(raw: string): ParsedLine | null {
  const text = raw.trim().replace(/[,;]+$/, "").trim();
  if (!text) return null;

  let rest = text;
  let stems: number | null = null;
  let bunches: number | null = null;

  const paren = rest.match(PAREN);
  if (paren) {
    // A "box" is counted as a unit rather than converted into stems. A hydrangea
    // box and a hydrangea bunch are both 35 stems here, but guessing a
    // conversion the shop did not write down would be inventing stock.
    if (isBunch(paren[2])) bunches = Number(paren[1]);
    else stems = Number(paren[1]);
    rest = rest.slice(0, paren.index).trim();
  }

  const qty = rest.match(QUANTITY);
  if (!qty) return { raw: text, name: rest, stems, bunches };

  const value = Number(qty[1]);
  if (isBunch(qty[2])) bunches ??= value;
  else stems ??= value;

  const name = rest.slice(0, qty.index).replace(/[\sx]+$/i, "").trim();
  // A row that is only a number is not a line. Hand it back whole rather than
  // filing a quantity against no flower.
  if (!name) return { raw: text, name: text, stems: null, bunches: null };

  return { raw: text, name, stems, bunches };
}

// Rejoin lines a text editor wrapped, before anything tries to read them.
function unwrap(rows: string[]): string[] {
  const joined: string[] = [];
  for (const row of rows) {
    if (joined.length && ORPHAN_UNIT.test(row)) joined[joined.length - 1] += ` ${row}`;
    else joined.push(row);
  }
  return joined;
}

export function parseOrderList(text: string): ParsedList {
  const rows = unwrap(text.split("\n").map((r) => r.trim()).filter(Boolean));
  const out: ParsedList = { customer: null, neededOn: null, venue: null, fulfilment: null, lines: [] };
  if (!rows.length) return out;

  const body: string[] = [];
  for (const [index, row] of rows.entries()) {
    const hash = row.match(HEADER_HASH);
    if (hash && index === 0) {
      out.customer = hash[1].trim() || null;
      const month = Number(hash[2].slice(0, 2));
      const day = Number(hash[2].slice(2));
      if (month >= 1 && month <= 12 && day >= 1 && day <= 31) out.neededOn = { month, day };
      out.venue = hash[3].trim() || null;
      continue;
    }

    const prose = row.match(HEADER_PROSE);
    if (prose) {
      out.fulfilment = /deliver/i.test(prose[1]) ? "delivery" : "pickup";
      const month = Number(prose[2]);
      const day = Number(prose[3]);
      if (month >= 1 && month <= 12 && day >= 1 && day <= 31) out.neededOn ??= { month, day };
      continue;
    }

    // A first row carrying no quantity is the customer's name on its own.
    if (index === 0 && !QUANTITY.test(row)) {
      out.customer = row;
      continue;
    }

    body.push(row);
  }

  out.lines = body.map(parseOrderLine).filter((l): l is ParsedLine => l !== null);
  return out;
}

// The cross-check the shop already does in its head: a line that stated both
// counts implies a bunch size, and it should be a whole number.
export function stemsPerBunch(line: ParsedLine): number | null {
  if (!line.stems || !line.bunches) return null;
  const per = line.stems / line.bunches;
  return Number.isInteger(per) ? per : null;
}
