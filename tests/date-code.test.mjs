import assert from "node:assert/strict";
import test from "node:test";
import { toDateCode, fromDateCode, daysInCooler } from "../app/lib/date-code.ts";

// Read off real boxes in the cooler on 2026-08-20. If the shop ever changes how
// it writes the code, this is the file that should fail.
const REAL = [
  ["0280", "Aug 20"], ["0370", "Jul 30"], ["2180", "Aug 12"], ["2270", "Jul 22"],
  ["3080", "Aug 3"], ["3180", "Aug 13"], ["6080", "Aug 6"], ["6180", "Aug 16"],
  ["8080", "Aug 8"], ["9070", "Jul 9"], ["9080", "Aug 9"],
];
const ON = new Date(2026, 7, 20);
const show = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

test("decodes the codes written on real boxes", () => {
  for (const [code, expected] of REAL) {
    assert.equal(show(fromDateCode(code, ON)), expected, `${code} should read ${expected}`);
  }
});

test("round-trips every day of a year", () => {
  for (let i = 0; i < 365; i++) {
    const day = new Date(2026, 0, 1 + i);
    assert.equal(show(fromDateCode(toDateCode(day), new Date(2026, 11, 31))), show(day));
  }
});

test("a code is never read as a future date", () => {
  // 1321 -> Dec 31. Read on Jan 3rd it is three days ago, not next December.
  const arrived = fromDateCode("1321", new Date(2026, 0, 3));
  assert.equal(arrived.getFullYear(), 2025);
  assert.equal(daysInCooler("1321", new Date(2026, 0, 3)), 3);
});

test("handles the 29th of February", () => {
  // 0229 is written 9220. Read in 2025 the most recent one was 2024.
  const leap = fromDateCode("9220", new Date(2025, 5, 1));
  assert.equal(leap.getFullYear(), 2024);
  assert.equal(leap.getMonth(), 1);
  assert.equal(leap.getDate(), 29);
});

test("rejects what is not a date", () => {
  // 1300 -> month 31; 0000 -> day 0; 1311 -> Nov 31, a day that does not exist
  // and which JavaScript would otherwise roll forward into Dec 1 in silence.
  for (const bad of ["1300", "0000", "1311", "", "28", "02800", "02a0"]) {
    assert.equal(fromDateCode(bad, ON), null, `${bad} should not decode`);
  }
});

test("counts days in the cooler", () => {
  assert.equal(daysInCooler("0280", ON), 0);   // landed today
  assert.equal(daysInCooler("6180", ON), 4);   // Aug 16
  assert.equal(daysInCooler("2270", ON), 29);  // Jul 22
});
