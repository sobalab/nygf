import assert from "node:assert/strict";
import test from "node:test";
import { parseOrderList, parseOrderLine, stemsPerBunch } from "../app/lib/order-list.ts";

// Transcribed verbatim off the corkboard, wrapping and all. If a florist ever
// changes how they write, this is the file that should fail.
const NATASHA = `Natasha #0823. Florentine gardn
Hydrangea white 4410(126 box)
Mondial 3225
Over time 250 bunch
Stock white 40 bunch
Playa Blanca 7 bunch
Ranunculus white 3 bunch`;

const COCO = `Coco

pick up on 8/20( Thursday)
Black Magic  x 5 bunches,
Freedom red roses x 6
bunches,
spray red Roses x7bunches ,
pink Mondial roses x 4
bunches,
Frutteto pink roses x 4
bunches,
White hydrangeas ( premium) x 200 pcs,
white Lisanthus x 7 bunches,`;

test("reads the header of a hash-and-venue slip", () => {
  const list = parseOrderList(NATASHA);
  assert.equal(list.customer, "Natasha");
  assert.deepEqual(list.neededOn, { month: 8, day: 23 });
  assert.equal(list.venue, "Florentine gardn");
});

test("a bare number is stems, a named unit is bunches", () => {
  const { lines } = parseOrderList(NATASHA);
  assert.deepEqual(
    lines.map((l) => [l.name, l.stems, l.bunches]),
    [
      ["Hydrangea white", 4410, 126],
      ["Mondial", 3225, null],
      ["Over time", null, 250],
      ["Stock white", null, 40],
      ["Playa Blanca", null, 7],
      ["Ranunculus white", null, 3],
    ],
  );
});

test("the parenthetical cross-check divides evenly", () => {
  // 4410 stems in 126 units is 35 to a bunch, which is how hydrangea is packed.
  const [hydrangea] = parseOrderList(NATASHA).lines;
  assert.equal(stemsPerBunch(hydrangea), 35);
});

test("reads a prose header: method, date, and a name on its own line", () => {
  const list = parseOrderList(COCO);
  assert.equal(list.customer, "Coco");
  assert.equal(list.fulfilment, "pickup");
  assert.deepEqual(list.neededOn, { month: 8, day: 20 });
});

test("rejoins a unit that wrapped onto the next line", () => {
  const { lines } = parseOrderList(COCO);
  assert.deepEqual(
    lines.map((l) => [l.name, l.stems, l.bunches]),
    [
      ["Black Magic", null, 5],
      ["Freedom red roses", null, 6],      // "x 6" + "bunches,"
      ["spray red Roses", null, 7],        // "x7bunches" with no spaces
      ["pink Mondial roses", null, 4],
      ["Frutteto pink roses", null, 4],
      ["White hydrangeas ( premium)", 200, null],  // pcs are stems
      ["white Lisanthus", null, 7],
    ],
  );
});

test("handles the separators the slips actually use", () => {
  assert.deepEqual(parseOrderLine("Mandala-450"), { raw: "Mandala-450", name: "Mandala", stems: 450, bunches: null });
  assert.equal(parseOrderLine("Hydrangea white 2205 (63 box)").bunches, 63);
  assert.equal(parseOrderLine("Green hanging amarenthus 35 bunch (175 stems)").bunches, 35);
  assert.equal(parseOrderLine("Green hanging amarenthus 35 bunch (175 stems)").stems, 175);
  assert.equal(parseOrderLine("Silver Dollar 6 Bunch").bunches, 6);
});

test("does not file a quantity against no flower", () => {
  // A stray number keeps its whole text as the name so somebody looks at it,
  // rather than becoming 6 of nothing.
  const line = parseOrderLine("6");
  assert.equal(line.stems, null);
  assert.equal(line.bunches, null);
  assert.equal(parseOrderLine("   "), null);
});
