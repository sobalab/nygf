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

// Taking a colour off is as real a review decision as putting one on — a stem
// nobody can file under one chip is better with none than with a wrong one — but
// an empty cell already means "not reviewed yet", and the two must not be the
// same gesture. So a removal is written out as a word.
const CLEAR = "none";

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
const unmapped = confirmed.filter(({ colour }) => colour !== CLEAR && colourGroupsOf(colour).length === 0);
if (unmapped.length) {
  console.error("These confirmed colours match no chip. Reword them, or add the word to `colourWords`:\n");
  for (const { slug, colour } of unmapped) console.error(`  ${slug.padEnd(24)} "${colour}"`);
  process.exit(1);
}

const file = path.join(root, "app/catalogue-data.ts");
let source = readFileSync(file, "utf8");
const added = [];
const cleared = [];
const changed = [];
const same = [];
const failed = [];

// Each record is one of three shapes, and a colour either goes on for the first
// time or replaces one already there. The review sheet now covers roses that
// have a colour as well as ones that don't — a first pass read them off their
// photographs and this is where a person overrules that — so every shape has to
// be able to overwrite, not only to fill a gap. A confirmed value identical to
// what is already written is reported as unchanged rather than rewritten, so a
// sheet handed back untouched leaves the file byte for byte as it was.
for (const { slug, colour } of confirmed) {
  const quoted = JSON.stringify(colour);

  if (colour === CLEAR) {
    const shapes = [
      // the fifth argument of a helper call, and the comma before it
      new RegExp(`((?:packedRose|listedOnly)\\(\\s*"[^"]*",\\s*"${slug}",\\s*"[a-z]+"(?:,\\s*"[^"]*")?),\\s*"[^"]*"(\\))`),
      // a colour on its own line inside a full record
      new RegExp(`(slug: "${slug}",\\n(?:.*\\n)*?)\\s*colour: "[^"]*",\\n`),
      // a colour inside a one-line record
      new RegExp(`(\\{ name: [^\\n]*?slug: "${slug}",[^\\n]*?), colour: "[^"]*"( \\})`),
    ];
    const shape = shapes.find((re) => re.test(source));
    if (!shape) { same.push(slug); continue; }
    cleared.push(slug);
    source = source.replace(shape, (_m, a, b) => `${a}${b ?? ""}`);
    continue;
  }
  const record = (existing) => {
    if (existing === colour) { same.push(slug); return true; }
    (existing === undefined ? added : changed).push(slug);
    return false;
  };

  // Shape one: a helper call, whose signature is (name, slug, category, image?,
  // colour?). The trailing arguments are read as a list rather than matched
  // positionally, because a record with an image and no colour and one with
  // both are the same shape to a regex and only the count tells them apart.
  const helper = new RegExp(`(packedRose|listedOnly)\\((\\s*"[^"]*",\\s*"${slug}",\\s*"[a-z]+")([^)]*)\\)`);
  const hit = helper.exec(source);
  if (hit) {
    const rest = hit[3].match(/"[^"]*"/g) ?? [];
    const existing = rest.length >= 2 ? JSON.parse(rest[1]) : undefined;
    if (record(existing)) continue;
    const image = rest.length >= 1 ? rest[0] : null;
    const args = [hit[2], image, quoted].filter(Boolean).join(", ");
    source = source.slice(0, hit.index) + `${hit[1]}(${args})` + source.slice(hit.index + hit[0].length);
    continue;
  }

  // Shape two: a full record. Replace the colour line if it has one, otherwise
  // open a new one directly under the category.
  const literalColour = new RegExp(`(slug: "${slug}",\\n(?:.*\\n)*?\\s*colour: )"([^"]*)"`);
  const lc = literalColour.exec(source);
  if (lc) {
    if (record(lc[2])) continue;
    source = source.slice(0, lc.index) + `${lc[1]}${quoted}` + source.slice(lc.index + lc[0].length);
    continue;
  }
  const literal = new RegExp(`(slug: "${slug}",\\n(\\s*)category: "[a-z]+",\\n)`);
  if (literal.test(source)) {
    record(undefined);
    source = source.replace(literal, (_m, head, indent) => `${head}${indent}colour: ${quoted},\n`);
    continue;
  }

  // Shape three: the same record written on one line, which a handful of the
  // garden roses are. There is no line under the category to hang it on, so it
  // goes last inside the braces, which is where the multi-line shape would put
  // it if that record were folded onto one line too.
  const oneLineColour = new RegExp(`(\\{ name: [^\\n]*?slug: "${slug}",[^\\n]*?colour: )"([^"]*)"`);
  const olc = oneLineColour.exec(source);
  if (olc) {
    if (record(olc[2])) continue;
    source = source.slice(0, olc.index) + `${olc[1]}${quoted}` + source.slice(olc.index + olc[0].length);
    continue;
  }
  const oneLine = new RegExp(`(\\{ name: [^\\n]*?slug: "${slug}",[^\\n]*?)( \\})`);
  if (oneLine.test(source)) {
    record(undefined);
    source = source.replace(oneLine, (_m, body, close) => `${body}, colour: ${quoted}${close}`);
    continue;
  }

  failed.push(slug);
}

if (failed.length) {
  console.error(`\nCould not place a colour on ${failed.length} record(s):`);
  for (const slug of failed) console.error(`  ${slug}`);
  console.error("\nThe slug in the TSV does not match any record in the catalogue.");
}

const touched = added.length + changed.length + cleared.length;
console.log(`\n  new colour   ${added.length}`);
console.log(`  changed      ${changed.length}${changed.length ? "   " + changed.join(", ") : ""}`);
console.log(`  cleared      ${cleared.length}${cleared.length ? "   " + cleared.join(", ") : ""}`);
console.log(`  unchanged    ${same.length}`);

if (dry) {
  console.log(`\n--dry: ${touched} record(s) would be written. Nothing written.`);
} else if (!touched) {
  console.log("\nNothing to write.");
} else {
  writeFileSync(file, source);
  console.log(`\nWrote ${touched} colour(s) into app/catalogue-data.ts.`);
  console.log("Read the diff, then run `npm test`.");
}
