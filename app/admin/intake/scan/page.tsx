"use client";

import { useState } from "react";
import { fromDateCode } from "../../../lib/date-code";

// Scanning a label. The photographs of the cooler show why this is worth
// building: every farm prints the same handful of facts on the box — variety,
// grade, bunches, stems, farm, box N of M — and somebody is currently reading
// them off and typing them in, thirty times a morning.
//   What is stubbed here is only the model call. The screen around it is the
// real design, and the design's whole argument is the confirm step: a Pine Ridge
// gerbera box in the cooler is printed RED and has "orange / two tone yellow"
// written on it in marker by the owner. The label is evidence, not truth, so a
// scan proposes and a person disposes. Nothing here ever saves itself.

type Reading = {
  variety: string; grade: number | null; bunches: number; stemsPerBunch: number;
  farm: string; boxOf: string; dateCode: string | null;
  matched: string | null;      // the variant this resolved to, if it did
  labelClaim: string | null;   // what the label said, where it may be wrong
  confidence: number;
};

// Stands in for the vision call. Transcribed from a real box, so the shape is
// the shape a model would have to return.
const SAMPLE: Reading = {
  variety: "EXPLORER", grade: 80, bunches: 12, stemsPerBunch: 25,
  farm: "Ceres Farms", boxOf: "30 of 47", dateCode: "0370",
  matched: "Explorer", labelClaim: null, confidence: 0.96,
};

export default function Scan() {
  const [reading, setReading] = useState<Reading | null>(null);
  const [busy, setBusy] = useState(false);

  // The real one posts the photograph to a Server Action, which calls a vision
  // model through the AI Gateway with a schema and gets these fields back.
  const capture = () => {
    setBusy(true);
    setTimeout(() => { setReading(SAMPLE); setBusy(false); }, 700);
  };

  const arrived = reading?.dateCode ? fromDateCode(reading.dateCode) : null;

  return (
    <>
      <h1>Scan The Label</h1>
      <p className="admin-date">Point the camera at the box. Check what it read before saving.</p>

      {!reading && (
        <>
          {/* capture="environment" opens the rear camera straight to the
              viewfinder on a phone, and degrades to a file picker elsewhere. */}
          <label className="admin-button" style={{ textAlign: "center" }}>
            {busy ? "Reading the label…" : "Take A Photo"}
            <input type="file" accept="image/*" capture="environment" hidden onChange={capture} />
          </label>
          <p className="admin-note">
            Works on the farm labels and the printed inventory tags. Handwriting on
            the box still has to be typed in.
          </p>
        </>
      )}

      {reading && (
        <>
          <div className="admin-scan">
            <dl>
              <dt>Flower</dt><dd>{reading.matched ?? reading.variety}</dd>
              <dt>Length</dt><dd>{reading.grade ? `${reading.grade}cm` : "none"}</dd>
              <dt>Bunches</dt><dd>{reading.bunches}</dd>
              <dt>Stems</dt><dd>{reading.bunches * reading.stemsPerBunch} · {reading.stemsPerBunch} to a bunch</dd>
              <dt>Farm</dt><dd>{reading.farm}</dd>
              <dt>Box</dt><dd>{reading.boxOf}</dd>
              <dt>Date</dt>
              <dd>
                {reading.dateCode}
                {arrived && ` · ${arrived.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
              </dd>
            </dl>
          </div>

          {/* The scan is a proposal. This sentence is the whole reason the
              screen exists rather than the box being filed automatically. */}
          <p className="admin-flag">
            Read from the printed label. Check it against what is actually in the
            box before saving. Labels are wrong often enough to matter.
          </p>

          <button className="admin-button" type="button">Add To Shipment</button>
          <button className="admin-button admin-button-quiet" type="button" onClick={() => setReading(null)}>
            Scan Another
          </button>
        </>
      )}
    </>
  );
}
