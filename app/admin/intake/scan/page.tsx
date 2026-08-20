"use client";

import { useState } from "react";
import { fromDateCode } from "../../../lib/date-code";
import { variants } from "../../data";
import { normalizeQuery } from "../../../lib/text";

// Scanning a label. 33 close-ups of the real labels say this is worth building
// and also say exactly what shape it has to be.
//   Every farm prints the same eight facts — farm, variety, grade, stems per
// bunch, bunches, total stems, box type, box N of M — but no two print them the
// same way. Column headings disagree (CM|BCH|ST|TOT, LENGHT|BUNCH|STEMS|PESO,
// Bunch|Size|Stems), one farm ticks a column in a grade grid, one writes it
// inline as "25 X 12 MONDIAL 80 cm", and one prints the whole thing in Spanish.
// Stable fields, unstable presentation: a vision model with a fixed output
// schema, not a template per farm.
//
// Two things the labels forced on this screen:
//   A box is USUALLY MANY LINES. The Galaxytrade box below is real and holds ten
// varieties. A Ceres box held Be Sweet at 60, 70 and 80cm. Luanflowers shipped
// Pink Floyd at two grades. An earlier version of this screen returned one
// reading and would have been wrong for most of the cooler.
//   NOTHING SAVES ITSELF. The Pine Ridge gerbera box is printed RED and has
// "orange / two tone yellow" written on it in marker by the owner; a Kontikiflor
// box has "+10" in blue pen under a printed 80. The label is evidence and the
// marker is the correction, so the scan proposes and a person disposes.

type Line = {
  printed: string;      // exactly as the label writes it
  grade: string | null; // "70", "60-65", "3/5 BLM" — not always a number
  bunches: number;
  stemsPerBunch: number;
  matched: string | null;
};

type Reading = {
  farm: string; awb: string; boxOf: string; dateCode: string | null;
  boxType: string; lines: Line[];
};

// Transcribed from a real box, so the shape is the shape a model has to return.
const SAMPLE: Reading = {
  farm: "Galaxytrade Corp", awb: "145-1151-4543", boxOf: "1 of 5",
  dateCode: "6080", boxType: "HB",
  lines: [
    { printed: "Queen Crown 40 25", grade: "40", bunches: 2, stemsPerBunch: 25, matched: null },
    { printed: "Full Monty 40 25", grade: "40", bunches: 2, stemsPerBunch: 25, matched: "Full Monty" },
    { printed: "Hearts 40 25", grade: "40", bunches: 1, stemsPerBunch: 25, matched: null },
    { printed: "High & Y. Magic Flame 40 25", grade: "40", bunches: 1, stemsPerBunch: 25, matched: "High & Magic" },
    { printed: "Mondial 40 25", grade: "40", bunches: 1, stemsPerBunch: 25, matched: "Mondial" },
    { printed: "Jessika 40 25", grade: "40", bunches: 1, stemsPerBunch: 25, matched: null },
    { printed: "Parmida 40 25", grade: "40", bunches: 1, stemsPerBunch: 25, matched: null },
    { printed: "Vendela 40 25", grade: "40", bunches: 1, stemsPerBunch: 25, matched: null },
    // Listed twice on the real label. Not a duplicate to be merged — the farm
    // packed it as two bunches from two lots, and silently summing rows would
    // lose that.
    { printed: "Jessika 40 25", grade: "40", bunches: 1, stemsPerBunch: 25, matched: null },
    { printed: "White Ohara 40 25", grade: "40", bunches: 1, stemsPerBunch: 25, matched: null },
  ],
};

export default function Scan() {
  const [reading, setReading] = useState<Reading | null>(null);
  const [busy, setBusy] = useState(false);
  const [lines, setLines] = useState<Line[]>([]);
  const [naming, setNaming] = useState<number | null>(null);

  // The real one posts the photograph to a Server Action, which calls a vision
  // model through the AI Gateway with this schema and gets the lines back.
  const capture = () => {
    setBusy(true);
    setTimeout(() => { setReading(SAMPLE); setLines(SAMPLE.lines); setBusy(false); }, 700);
  };

  const arrived = reading?.dateCode ? fromDateCode(reading.dateCode) : null;
  const unmatched = lines.filter((l) => !l.matched).length;
  const totalBunches = lines.reduce((sum, l) => sum + l.bunches, 0);

  const name = (index: number, to: string) => {
    setLines((current) => current.map((l, i) => (i === index ? { ...l, matched: to } : l)));
    setNaming(null);
  };

  if (!reading) {
    return (
      <>
        <h1>Scan The Label</h1>
        <p className="admin-date">Point the camera at the box.</p>
        <label className="admin-button" style={{ textAlign: "center" }}>
          {busy ? "Reading the label…" : "Take A Photo"}
          {/* capture="environment" opens the rear camera straight to the
              viewfinder on a phone and degrades to a file picker elsewhere. */}
          <input type="file" accept="image/*" capture="environment" hidden onChange={capture} />
        </label>
        <p className="admin-note">
          Reads the printed label. Anything written on the box in marker still has
          to be typed in.
        </p>
      </>
    );
  }

  return (
    <>
      <h1>What The Label Says</h1>
      <p className="admin-date">
        {reading.farm} · box {reading.boxOf} · {reading.boxType}
        {arrived && ` · ${reading.dateCode} · ${arrived.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
      </p>

      {unmatched > 0 && (
        <p className="admin-flag">
          {unmatched} of {lines.length} {unmatched === 1 ? "line is" : "lines are"} not
          on the catalogue yet. Tap one to say what it is. It will be remembered
          next time this farm ships it.
        </p>
      )}

      {lines.map((line, i) => (
        <div key={`${line.printed}-${i}`}>
          <div className="admin-row">
            <div className="admin-row-main">
              <div className="admin-row-name">
                {line.matched ?? line.printed}
                {line.grade && <span className="admin-row-grade">, {line.grade}cm</span>}
              </div>
              {/* What the label actually said stays on screen next to what it
                  resolved to. A match is a claim, and the reader should be able
                  to check it without reopening the photograph. */}
              <div className={`admin-row-sub${line.matched ? "" : " admin-old"}`}>
                {line.matched ? `label: ${line.printed}` : "not matched yet"}
                {" · "}{line.bunches * line.stemsPerBunch} stems
              </div>
            </div>
            <div className="admin-count">{line.bunches}</div>
            <div className="admin-step">
              <button type="button" onClick={() => setLines((c) => c.map((l, j) => j === i ? { ...l, bunches: Math.max(0, l.bunches - 1) } : l))} aria-label="One fewer">−</button>
              <button type="button" onClick={() => setLines((c) => c.map((l, j) => j === i ? { ...l, bunches: l.bunches + 1 } : l))} aria-label="One more">+</button>
            </div>
          </div>
          {!line.matched && (
            naming === i ? (
              <div style={{ paddingBottom: 10 }}>
                {[...new Map(variants.map((v) => [v.name, v])).values()]
                  .filter((v) => normalizeQuery(v.name).includes(normalizeQuery(line.printed.split(" ")[0])) || true)
                  .slice(0, 5)
                  .map((v) => (
                    <button className="admin-jump" type="button" key={v.name} onClick={() => name(i, v.name)}>
                      <span>{v.name}</span><span className="admin-jump-none">{v.category}</span>
                    </button>
                  ))}
              </div>
            ) : (
              <button className="admin-button admin-button-quiet" style={{ marginTop: 0, marginBottom: 10 }} type="button" onClick={() => setNaming(i)}>
                Say what “{line.printed}” is
              </button>
            )
          )}
        </div>
      ))}

      <p className="admin-flag">
        Check this against what is actually in the box before saving. Labels are
        wrong often enough to matter.
      </p>

      <button className="admin-button" type="button" disabled={unmatched > 0}>
        {unmatched > 0 ? `${unmatched} still to name` : `Add ${totalBunches} Bunches To Shipment`}
      </button>
      <button className="admin-button admin-button-quiet" type="button" onClick={() => { setReading(null); setLines([]); }}>
        Scan Another Box
      </button>
    </>
  );
}
