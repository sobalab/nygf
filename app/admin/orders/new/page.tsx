"use client";

import { useMemo, useState } from "react";
import { parseOrderList, type ParsedLine } from "../../../lib/order-list";
import { variants, keyOf, label } from "../../data";
import { normalizeQuery } from "../../../lib/text";
import { useLedger, balance } from "../../store";

// Taking an order. Built from the corkboard rather than from a form library:
// orders arrive as a typed list from the florist, get printed, pinned, and
// worked over with a pen. The pen is the interesting part.
//   On one slip: "White stock 90 bunch" struck through with "(PNK STOCK)"
// written beside it; "Kahala rose 1100" with "(400)" circled; "800 Pink
// Mondial" added at the foot. On another, a column of numbers down the right
// margin — 6, 6, 7, 5, 4 — against a list that asked for 5, 6, 7, 4, 4.
//   So an order line is two numbers, not one: what was asked for, and what is
// actually going. This screen is that, and nothing more clever.

type Line = ParsedLine & { asked: number; giving: number; unit: "bunch" | "stem"; matched: string | null };

const toLine = (parsed: ParsedLine): Line => {
  const unit = parsed.bunches !== null ? "bunch" : "stem";
  const asked = parsed.bunches ?? parsed.stems ?? 0;
  const needle = normalizeQuery(parsed.name);
  // A first pass only. Anything it gets wrong is meant to be corrected here,
  // which is why the label it read stays on screen underneath.
  const hit = variants.find((v) => needle.includes(normalizeQuery(v.name)));
  return { ...parsed, asked, giving: asked, unit, matched: hit ? label(hit) : null };
};

export default function NewOrder() {
  const ledger = useLedger();
  const [paste, setPaste] = useState("");
  const [customer, setCustomer] = useState("");
  const [venue, setVenue] = useState("");
  const [needed, setNeeded] = useState("");
  const [fulfilment, setFulfilment] = useState<"pickup" | "delivery" | null>(null);
  const [lines, setLines] = useState<Line[] | null>(null);

  const read = () => {
    const list = parseOrderList(paste);
    setCustomer(list.customer ?? "");
    setVenue(list.venue ?? "");
    setFulfilment(list.fulfilment);
    if (list.neededOn) {
      const { month, day } = list.neededOn;
      setNeeded(`${String(month).padStart(2, "0")}/${String(day).padStart(2, "0")}`);
    }
    setLines(list.lines.map(toLine));
  };

  const set = (i: number, patch: Partial<Line>) =>
    setLines((c) => c!.map((l, j) => (j === i ? { ...l, ...patch } : l)));

  const short = useMemo(
    () => (lines ?? []).filter((l) => l.giving < l.asked).length,
    [lines],
  );

  if (!lines) {
    return (
      <>
        <h1>Take An Order</h1>
        <p className="admin-date">Paste what they sent. Type it if they called.</p>
        <textarea
          className="admin-search"
          style={{ minHeight: 220, fontFamily: "var(--sans)", lineHeight: 1.5 }}
          value={paste}
          onChange={(event) => setPaste(event.target.value)}
          placeholder={"Natasha #0823. Florentine gardn\nHydrangea white 4410(126 box)\nMondial 3225\nOver time 250 bunch"}
        />
        <button className="admin-button" type="button" onClick={read} disabled={!paste.trim()}>
          Read It
        </button>
        <p className="admin-note">
          Reads both ways the lists come in. A bare number is stems, a number with
          “bunch” after it is bunches. Nothing is saved until you have checked it.
        </p>
      </>
    );
  }

  return (
    <>
      <h1>{customer || "New Order"}</h1>
      <p className="admin-date">
        {venue && `${venue} · `}
        {/* The Natasha slips never say pickup or delivery. Defaulting to one
            would put a claim on the screen that nobody made. */}
        {fulfilment === "pickup" ? "Pick up" : fulfilment === "delivery" ? "Delivery" : "Pickup or delivery not said"}
        {needed && ` · ${needed}`}
      </p>

      {short > 0 && (
        <p className="admin-flag">
          {short} {short === 1 ? "line is" : "lines are"} short of what was asked
          for. Tell them before this goes out.
        </p>
      )}

      {lines.map((line, i) => {
        const variant = variants.find((v) => label(v) === line.matched);
        // The cooler counts in the variant's own unit, usually bunches, and a
        // line may be written in stems. Showing "3225 asked, 4 in cooler"
        // against each other is worse than showing nothing, so the count is
        // converted into the unit the line is written in, or withheld when
        // there is no stems-per-bunch on file to convert with.
        const held = variant ? balance(ledger, keyOf(variant)) : null;
        const inCooler =
          held === null ? null
          : line.unit === "bunch" ? { count: held, unit: "bunch" }
          : variant?.stemsPerUnit ? { count: held * variant.stemsPerUnit, unit: "stem" }
          : null;
        return (
          <div className="admin-row" key={`${line.raw}-${i}`}>
            <div className="admin-row-main">
              <div className="admin-row-name">{line.matched ?? line.name}</div>
              {/* What the slip said stays visible under what it resolved to, so
                  a match can be checked without going back to the paper. */}
              <div className={`admin-row-sub${line.matched ? "" : " admin-old"}`}>
                {line.matched ? `asked ${line.asked} ${line.unit}` : `not matched · ${line.raw}`}
                {inCooler && ` · ${inCooler.count} ${inCooler.unit}s in cooler`}
              </div>
            </div>
            {/* Two numbers, because the pen on the corkboard writes two. */}
            <div className={`admin-count${line.giving < line.asked ? " admin-neg" : ""}`}>{line.giving}</div>
            <div className="admin-step">
              <button type="button" onClick={() => set(i, { giving: Math.max(0, line.giving - 1) })} aria-label={`One fewer ${line.name}`}>−</button>
              <button type="button" onClick={() => set(i, { giving: line.giving + 1 })} aria-label={`One more ${line.name}`}>+</button>
            </div>
          </div>
        );
      })}

      <button className="admin-button" type="button">
        Save Order · {lines.reduce((s, l) => s + l.giving, 0)} across {lines.length} lines
      </button>
      <button className="admin-button admin-button-quiet" type="button" onClick={() => setLines(null)}>
        Start Again
      </button>
    </>
  );
}
