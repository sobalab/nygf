// The four-digit number written in marker on every box that comes through the
// door. It is the day the shipment landed, in the shop's own code: the date as
// MMDD, then the four digits written backwards. August the 20th is 0820 and is
// written 0280, which is why almost every box in the cooler ends in 80 and the
// ones from July end in 70.
//   The shop has been doing this by hand for years, and that is the whole reason
// aging is reachable at all: the arrival date is already being recorded on every
// box, it just cannot be counted while it only exists in marker pen. So the code
// is not something to replace. Every screen that shows a lot prints it beside
// the date, and intake takes it as input, because a screen that says "Aug 20"
// next to a box that says 0280 makes somebody do the conversion in their head
// every single time.
//
// Two things the code cannot say, both handled here rather than at the call
// site:
//   It carries no year. A code is resolved against a reference date and always
// reads as the most recent matching day that is not in the future — a box marked
// 0231 read on the 3rd of January is the 31st of December just gone, not one
// eleven months away.
//   It carries no time. Two shipments of the same variety on the same day share
// a code, so a code is never on its own an identifier for a lot.

// Written as MMDD reversed, so the string keeps its leading zeros and stays
// four characters wide. Takes the local calendar date, since the day a box
// landed is the day it was for the person who wrote on it.
export function toDateCode(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}${day}`.split("").reverse().join("");
}

// The inverse, resolved against `reference` — today, unless a test says
// otherwise. Returns null rather than throwing on anything that isn't a real
// date: this reads from a text field somebody is typing into at six in the
// morning, so a half-entered code is an ordinary state and not an error.
export function fromDateCode(code: string, reference: Date = new Date()): Date | null {
  if (!/^\d{4}$/.test(code)) return null;

  const [month, day] = [code.slice(2), code.slice(0, 2)]
    .map((pair) => Number(pair.split("").reverse().join("")));
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  // This year first, last year if that would be in the future. Constructed at
  // local midnight so the comparison is a comparison of days and not of hours.
  const today = new Date(reference.getFullYear(), reference.getMonth(), reference.getDate());
  for (const year of [today.getFullYear(), today.getFullYear() - 1]) {
    const candidate = new Date(year, month - 1, day);
    // Rejects the 31st of a thirty-day month, which JavaScript would otherwise
    // roll forward into the 1st of the next one without saying so. Skips to the
    // next candidate year rather than giving up, because the 29th of February is
    // a real day in one of the two years being tried and not in the other.
    if (candidate.getMonth() !== month - 1 || candidate.getDate() !== day) continue;
    if (candidate <= today) return candidate;
  }
  return null;
}

// How many days a lot has been in the cooler, which is the number the aging
// screens are actually built on.
export function daysInCooler(code: string, reference: Date = new Date()): number | null {
  const arrived = fromDateCode(code, reference);
  if (!arrived) return null;
  const today = new Date(reference.getFullYear(), reference.getMonth(), reference.getDate());
  return Math.round((today.getTime() - arrived.getTime()) / 86_400_000);
}
