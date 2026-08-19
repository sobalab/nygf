// Writes reviewed colours from the TSV back into app/catalogue-data.ts.
//
// Only the `confirmed` column is read. A blank one is skipped, so a half-reviewed
// file applies the half that was reviewed and leaves the rest alone — which is
// the point: nothing reaches the catalogue that the owner has not written down.
// The `proposed` column is never used here. It exists to make the review quick,
// not to be accepted by default.
//
//   node --experimental-strip-types scripts/apply-colours.mjs colours-review.tsv
//   node --experimental-strip-types scripts/apply-colours.mjs colours-review.tsv --dry
//
// Run the dry pass first and read the diff. Every edit is one of two shapes and
// both are mechanical, but this file is hand-written and heavily commented, and a
// script that rewrites it deserves to be watched.

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { colourGroupsOf } = await import(path.join(root, "app/catalogue-data.ts"));

const args = process.argv.slice(2);
const dry = args.includes("--dry");
const tsvPath = args.find((a) => !a.startsWith("--"));
if (!tsvPath) {
  console.error("usage: apply-colours.mjs <reviewed.tsv> [--dry]");
  process.exit(1);
}

const lines = readFileSync(tsvPath, "utf8").split("\n").filter(Boolean);
const header = lines[0].split("\t");
const col = Object.fromEntries(header.map((h, i) => [h, i]));
for (const required of ["slug", "confirmed"]) {
  if (col[required] === undefined) {
    console.error(`the TSV has no \`${required}\` column`);
    process.exit(1);
  }
}

const confirmed = [];
for (const line of lines.slice(1)) {
  const cells = line.split("\t");
  const slug = cells[col.slug]?.trim();
  const colour = cells[col.confirmed]?.trim();
  if (!slug || !colour) continue;
  confirmed.push({ slug, colour });
}

if (!confirmed.length) {
  console.log("Nothing confirmed yet. Fill the `confirmed` column and run again.");
  process.exit(0);
}

// A colour no chip claims would vanish from the filter while still printing on
// the card, which is the one failure the wall cannot show. Caught here rather
// than at build time so the typo is reported next to the slug that caused it.
const unmapped = confirmed.filter(({ colour }) => colourGroupsOf(colour).length === 0);
if (unmapped.length) {
  console.error("These confirmed colours match no chip. Reword them, or add the word to `colourWords`:\n");
  for (const { slug, colour } of unmapped) console.error(`  ${slug.padEnd(24)} "${colour}"`);
  process.exit(1);
}

const file = path.join(root, "app/catalogue-data.ts");
let source = readFileSync(file, "utf8");
const applied = [];
const failed = [];

for (const { slug, colour } of confirmed) {
  const quoted = JSON.stringify(colour);

  // Shape one: a helper call, which takes the colour as its fifth argument.
  const helper = new RegExp(
    `(packedRose|listedOnly)\\((\\s*"[^"]*",\\s*"${slug}",\\s*"[a-z]+"(?:,\\s*"[^"]*")?)\\)`,
  );
  if (helper.test(source)) {
    source = source.replace(helper, (_m, fn, argsText) => `${fn}(${argsText}, ${quoted})`);
    applied.push(slug);
    continue;
  }

  // Shape two: a full record, where it goes on its own line under the category.
  const literal = new RegExp(`(slug: "${slug}",\\n(\\s*)category: "[a-z]+",\\n)`);
  if (literal.test(source)) {
    source = source.replace(literal, (_m, head, indent) => `${head}${indent}colour: ${quoted},\n`);
    applied.push(slug);
    continue;
  }

  failed.push(slug);
}

if (failed.length) {
  console.error(`\nCould not place a colour on ${failed.length} record(s):`);
  for (const slug of failed) console.error(`  ${slug}`);
  console.error("\nEither the slug is misspelled in the TSV, or the record already carries a colour.");
}

if (dry) {
  console.log(`\n--dry: ${applied.length} record(s) would take a colour. Nothing written.`);
} else {
  writeFileSync(file, source);
  console.log(`\nWrote ${applied.length} colour(s) into app/catalogue-data.ts.`);
  console.log("Read the diff, then run `npm test`.");
}
