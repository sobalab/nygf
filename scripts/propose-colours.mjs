// Proposes a colour for every photographed variety that has no `colour` yet, by
// reading the photograph — which is the only way this file is allowed to answer
// the question. See the notes in app/catalogue-data.ts: a colour read off a
// variety's name instead of its picture is a guess printed as a fact, and 29 of
// these names carry a colour word that would make exactly that guess easy.
//
// Nothing here writes to the catalogue. It emits a TSV with a blank `confirmed`
// column for the owner to fill, and scripts/apply-colours.mjs writes back only
// what that column says. The proposal is a first pass to make review triage
// rather than 139 equal decisions: `conf` is the share of the bloom that agrees
// with the answer, and a low one means go and look at the picture.
//
//   node --experimental-strip-types scripts/propose-colours.mjs > colours.tsv
//   node --experimental-strip-types scripts/propose-colours.mjs --check
//
// `--check` scores the proposal against the colours the owner has already
// written by hand. Those 39 are the whole evidence that this is worth trusting
// on the ones nobody has looked at yet, so run it after touching any threshold.

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { flowers, colourGroupsOf } = await import(path.join(root, "app/catalogue-data.ts"));

// Decoded small and square. The aspect distortion is free: everything below is a
// count of pixels by colour and none of it cares about shape.
const SIZE = 160;

// ---------------------------------------------------------------------------
// Decoding

function decode(file) {
  const ppm = execFileSync("dwebp", [file, "-ppm", "-scale", String(SIZE), String(SIZE), "-o", "-"], {
    maxBuffer: 64 * 1024 * 1024,
    stdio: ["ignore", "pipe", "ignore"],
  });
  // P6 <w> <h> <max> then raw RGB triples. The single byte after the maxval is
  // the separator, so pixels start one past it rather than at a fixed offset.
  let pos = 0;
  const ws = (c) => c === 32 || c === 10 || c === 13 || c === 9;
  const token = () => {
    while (ws(ppm[pos])) pos++;
    const start = pos;
    while (pos < ppm.length && !ws(ppm[pos])) pos++;
    return ppm.subarray(start, pos).toString("ascii");
  };
  if (token() !== "P6") throw new Error(`not a P6 ppm: ${file}`);
  const w = Number(token());
  const h = Number(token());
  token();
  pos++;
  return { w, h, data: ppm.subarray(pos) };
}

function toHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l };
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h *= 60;
  if (h < 0) h += 360;
  return { h, s, l };
}

// ---------------------------------------------------------------------------
// Which chip a bloom belongs to.
//
// Read off the aggregate rather than pixel by pixel, because that is the shape
// the thresholds were measured in: the numbers below come from the 39 colours
// the owner wrote by hand, and every boundary is a gap between two of those
// clusters rather than a round number.
//
//   white/cream vs yellow  — the same hue. These roses were lit warm and a white
//     one reads at hue 43-53, right on top of the yellows. Saturation is what
//     tells them apart, and it is not close: white 0.29-0.49, yellow 0.86-0.95.
//   red vs hot pink        — hue 355-358 against 346-350, and lightness 0.20-0.28
//     against 0.34-0.39. Taken together they separate cleanly; either alone does
//     not, since a dark pink and a light red meet in the middle.
//   peach vs orange        — also the same hue, 13-26 for both. Saturation again:
//     peach 0.52-0.63, orange 0.89-0.92.
//   pink vs peach          — hue does this one. The pinks sit at 3-15 and the
//     peaches at 20-26.
//   lavender               — hue 308-328, plus the desaturated exception: Andrea
//     reads at hue 346 with saturation 0.18, which is a lavender wearing pink's
//     hue, and the low saturation is the tell.

function classify({ h, s, l }) {
  if (l < 0.14) return "red";                    // near-black reads as a deep red
  if (s < 0.10) return l > 0.62 ? "white" : null;

  // Pale and warm is the white band, and it has to be caught before the hue
  // table below files a washed-out ivory under peach or yellow — which is what
  // happened to Queen of Lace, Baby's Breath and White Majolika, all of them
  // shot pale on the pale ground where there is least contrast to read.
  //   Two rules, because the band is not one shape. Anything this desaturated is
  // a white whatever hue the lighting gave it. Above hue 30 a white can carry
  // more colour than that and still be a white: Mondial reads 0.49 and is one.
  // Below hue 30 that same saturation is a light pink instead — Felicity at 0.52
  // is a peach and Novia at 0.39 is a pink — so the second rule starts at 30,
  // which is the gap between the two clusters rather than a round number.
  if (h < 75) {
    if (s < 0.30) return "white";
    if (h >= 30 && s < 0.58 && l > 0.48) return "white";
  }

  if (h >= 75 && h < 170) return "green";
  // Blue is a dye and lavender is a rose, and the two do not meet: the three
  // dyed blues read 201, 217 and 220, and the lavenders run 283 to 348 with
  // nothing in between. The boundary sits in that gap rather than on a number.
  if (h >= 170 && h < 260) return "blue";
  if (h >= 260 && h < 335) return "lavender";

  // The rose seam, hue 335 round through 0 to 8.
  if (h >= 335 || h < 8) {
    if (s < 0.30 && l > 0.55) return "lavender";
    if (l < 0.32 && s > 0.85) return "red";
    return "pink";
  }
  if (h < 16) {
    if (s > 0.80 && l < 0.60) return "orange";
    return "pink";
  }
  if (h < 40) return s > 0.75 ? "orange" : "peach";

  // Hue 40-75: yellow, or a warm white. Nothing else lands here.
  if (s < 0.60 && l > 0.60) return "white";
  return "yellow";
}

// ---------------------------------------------------------------------------
// Reading one photograph
//
// The background is measured rather than assumed: these were shot on two, a dark
// green for the single stems and a warm off-white for the bunches, and taking it
// off the border finds either without being told which. Rejecting pixels near it
// clears the leaves along with the backdrop, since the leaves are the same green
// the backdrop is.

function backgroundOf(w, h, data) {
  const band = Math.max(2, Math.round(Math.min(w, h) * 0.05));
  let r = 0, g = 0, b = 0, n = 0;
  for (let y = 0; y < h; y++) {
    const edgeRow = y < band || y >= h - band;
    for (let x = 0; x < w; x++) {
      if (!edgeRow && x >= band && x < w - band) continue;
      const i = (y * w + x) * 3;
      r += data[i]; g += data[i + 1]; b += data[i + 2]; n++;
    }
  }
  return { r: r / n, g: g / n, b: b / n };
}

function analyse(file, category) {
  const { w, h, data } = decode(file);
  const bg = backgroundOf(w, h, data);
  const cx = w / 2, cy = h / 2, radius = Math.min(w, h) / 2;
  // Foliage is green in every one of these frames, and outside the greens chip it
  // is never the answer — dropping it is reading the bloom, not guessing at it.
  const foliageIsSubject = category === "greens";

  function sample(rejectBackground) {
    // Hue is circular, so it averages as a vector and not as a number: the pinks
    // sit either side of 0 and a plain mean of 350 and 10 is 180, which is a
    // green that is not in the picture.
    let vx = 0, vy = 0, ss = 0, sl = 0, n = 0;
    const px = [];
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const dist = Math.hypot(x - cx, y - cy) / radius;
        if (dist > 0.75) continue;
        const i = (y * w + x) * 3;
        const r = data[i], g = data[i + 1], b = data[i + 2];
        if (rejectBackground && Math.hypot(r - bg.r, g - bg.g, b - bg.b) < 40) continue;
        const c = toHsl(r, g, b);
        if (c.l < 0.10) continue;
        if (c.s < 0.12 && c.l < 0.62) continue;
        if (!foliageIsSubject && c.h >= 75 && c.h < 170 && c.s > 0.15) continue;
        const rad = (c.h * Math.PI) / 180;
        vx += Math.cos(rad) * c.s; vy += Math.sin(rad) * c.s;
        ss += c.s; sl += c.l; n++;
        px.push(c);
      }
    }
    if (!n) return null;
    let mh = (Math.atan2(vy, vx) * 180) / Math.PI;
    if (mh < 0) mh += 360;
    return { h: mh, s: ss / n, l: sl / n, n, px };
  }

  // A white bloom on the off-white ground is the one case where the subject is
  // the same colour as the backdrop, so rejecting the backdrop rejects the flower
  // and leaves nothing but stems. When almost nothing survives, read the frame
  // again without the rejection and let the centre weighting carry it.
  let agg = sample(true);
  const total = Math.PI * (radius * 0.75) ** 2;
  const pale = !agg || agg.n / total < 0.10;
  if (pale) agg = sample(false);
  if (!agg) return { proposed: "", alt: "", conf: 0, second: 0, pale };

  const proposed = classify(agg);
  if (process.env.EXPLAIN) {
    console.error(
      `    ${path.basename(file).padEnd(26)} h=${agg.h.toFixed(0).padStart(3)} s=${agg.s.toFixed(2)} l=${agg.l.toFixed(2)}` +
        ` n=${String(agg.n).padStart(5)} pale=${pale ? "y" : "n"} -> ${proposed}`,
    );
  }

  // Confidence is how much of the bloom agrees with the answer, and the runner-up
  // is whatever the rest of it said. A rose with a differently coloured edge is
  // the case this is here to surface: it comes back with a real second colour
  // rather than a low score on the first.
  const votes = new Map();
  for (const c of agg.px) {
    const g = classify(c);
    if (g) votes.set(g, (votes.get(g) ?? 0) + 1);
  }
  const ranked = [...votes.entries()].sort((a, b) => b[1] - a[1]);
  const mass = ranked.reduce((sum, [, v]) => sum + v, 0) || 1;

  // The average colour of the frame is a good answer for one bloom filling the
  // middle of it, which is what most of these are, and a poor one for a spray of
  // small flowers with the backdrop showing through: averaging a wisp of white
  // statice against the paper behind it lands between the two, on a colour
  // neither of them is. When the average disagrees with most of the pixels it
  // was drawn from, the pixels are the better witness.
  const majority = ranked[0]?.[0] ?? proposed;
  const aggregateShare = (votes.get(proposed) ?? 0) / mass;
  const settled = aggregateShare < 0.35 ? majority : proposed;

  const conf = (votes.get(settled) ?? 0) / mass;
  const alt = ranked.find(([g]) => g !== settled);
  return { proposed: settled, alt: alt ? alt[0] : "", conf, second: alt ? alt[1] / mass : 0, pale };
}

// ---------------------------------------------------------------------------
// Bicolour is raised as a question and never as an answer. Three of the 199 are
// bicolours, so a detector that guesses wrongly costs far more than one that
// stays quiet: pink shading into peach is one bloom in two lights, and no
// threshold told that from Magic's yellow petal with a red edge without also
// calling half the pale roses bicolour. So the runner-up is reported with its
// share and the owner decides, which is the same bargain as the rest of this
// file.

// Reported as a share rather than a verdict. A rose with a red edge and a rose
// photographed in two lights make the same shape here, and the number says which
// is more likely far better than a word guessing between them would.
const altShare = (alt, second) => (alt ? `${alt} ${Math.round(second * 100)}%` : "");

// ---------------------------------------------------------------------------

const checking = process.argv.includes("--check");

// Tinted roses were left out of the first pass on the grounds that the data file
// calls a tint a treatment rather than a colour group, "which is what makes the
// range of them unlimited" — a chip would claim the shop stocks one dye when it
// stocks whatever the farm ran that week.
//   They are read now by the shop's decision: a buyer filtering the wall is
// asking what is in the cooler today, and the tinted stems in it are the colour
// they were dyed. The objection above is still true and is what the review
// column is for — a tint confirmed here is a colour this batch came in, not a
// standing claim about what can be ordered.
const SKIP_CATEGORIES = new Set();

const rows = [];
for (const flower of flowers) {
  if (SKIP_CATEGORIES.has(flower.category)) continue;
  if (!flower.image) continue;
  const file = path.join(root, "public", flower.image);
  if (!existsSync(file)) continue;
  if (checking !== Boolean(flower.colour)) continue;
  rows.push({ flower, read: analyse(file, flower.category) });
}

if (checking) {
  // Agreement is measured against the chip the written colour maps to, not against
  // its wording: the script is not trying to reproduce "light pink", only to land
  // in Pink.
  let hit = 0, near = 0;
  const misses = [];
  const bicolours = [];
  for (const { flower, read } of rows) {
    const truth = colourGroupsOf(flower.colour);
    // The bicolours are scored apart: the script does not propose that chip, so
    // counting them as failures would measure a thing it is not trying to do.
    // What it owes them is a visible runner-up, which is what is checked.
    if (truth.includes("bicolour")) {
      bicolours.push({ flower, read, flagged: read.second > 0.2 });
      continue;
    }
    const answered = read.proposed;
    if (truth.includes(answered)) hit++;
    else if (truth.includes(read.alt)) {
      near++;
      misses.push({ flower, read, truth, answered, near: true });
    } else misses.push({ flower, read, truth, answered, near: false });
  }
  const n = rows.length - bicolours.length;
  console.log(`checked ${n} hand-written colours`);
  console.log(`  correct            ${hit}/${n}  (${Math.round((hit / n) * 100)}%)`);
  console.log(`  runner-up correct  ${near}/${n}`);
  console.log(`  missed entirely    ${n - hit - near}/${n}\n`);
  for (const m of misses) {
    console.log(
      `  ${m.near ? "alt " : "MISS"}  ${m.flower.slug.padEnd(22)} written "${m.flower.colour}" -> ${m.truth.join("/")}` +
        `   read ${m.answered}${m.read.alt ? "/" + m.read.alt : ""} ${(m.read.conf * 100).toFixed(0)}%${m.read.pale ? " (pale)" : ""}`,
    );
  }
  if (bicolours.length) {
    console.log(`\nbicolours, scored on whether a second colour is visible at all:`);
    for (const b of bicolours) {
      console.log(
        `  ${b.flagged ? "flagged " : "MISSED  "}${b.flower.slug.padEnd(22)} read ${b.read.proposed}` +
          ` + ${b.read.alt || "nothing"} ${(b.read.second * 100).toFixed(0)}%`,
      );
    }
  }
} else {
  console.log(["slug", "name", "category", "current", "proposed", "alt", "conf", "confirmed"].join("\t"));
  for (const { flower, read } of rows) {
    console.log(
      [
        flower.slug,
        flower.name,
        flower.category,
        flower.colour ?? "",
        read.proposed,
        altShare(read.alt, read.second),
        read.conf.toFixed(2),
        "",
      ].join("\t"),
    );
  }
}
