"use client";

import { useMemo, useState } from "react";
import { variants, keyOf, label } from "../data";
import { normalizeQuery } from "../../lib/text";
import { useLedger, balance, openLots, post } from "../store";
import { daysInCooler } from "../../lib/date-code";

type Line = { key: string; name: string; units: number };

// Selling at the counter. The other half of the loop, and the half without
// which none of the rest is believable: a count that only ever goes up is wrong
// by the end of the first morning, and a number somebody has caught out once is
// a number they stop reading.
//   Built as the same loop as receiving, in reverse, because it is the same
// hands doing it and the muscle memory should carry over. Search, quantity,
// add, back to the search box.
//   No prices. The shop's prices move with the market every morning and are the
// one thing this prototype has no business inventing. What it takes instead is
// what was actually charged, typed by the person who charged it, so the record
// is true without the system pretending to know a price list it has never seen.
export default function Sell() {
  const ledger = useLedger();
  const now = useMemo(() => new Date(), []);
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<string | null>(null);
  const [units, setUnits] = useState(1);
  const [lines, setLines] = useState<Line[]>([]);
  const [buyer, setBuyer] = useState("");
  const [charged, setCharged] = useState("");
  const [done, setDone] = useState<number | null>(null);

  const needle = normalizeQuery(query);
  const matches = needle
    ? variants.filter((v) => normalizeQuery(`${v.name} ${v.category}`).includes(needle)).slice(0, 6)
    : [];

  const chosen = picked ? variants.find((v) => keyOf(v) === picked) : undefined;
  // What is left after everything already on this sale, so two lines of the
  // same flower cannot between them sell more than exists.
  const committed = (key: string) => lines.reduce((sum, l) => (l.key === key ? sum + l.units : sum), 0);
  const freeNow = chosen ? balance(ledger, picked!) - committed(picked!) : 0;

  const add = () => {
    if (!chosen) return;
    setLines((current) => [{ key: picked!, name: label(chosen), units }, ...current]);
    setPicked(null);
    setQuery("");
    setUnits(1);
  };

  const complete = () => {
    post(
      lines.map((line) => ({
        key: line.key,
        delta: -line.units,
        reason: "sale" as const,
        note: buyer.trim() || undefined,
      })),
    );
    setDone(lines.reduce((sum, l) => sum + l.units, 0));
    setLines([]);
    setBuyer("");
    setCharged("");
  };

  if (done !== null) {
    return (
      <>
        <h1>Sold</h1>
        <p className="admin-lede">
          {done} {done === 1 ? "unit" : "units"} came off the cooler.
        </p>
        <button className="admin-button" type="button" onClick={() => setDone(null)}>Start Another</button>
        <a className="admin-button admin-button-quiet" style={{ textAlign: "center" }} href="/admin/cooler">See The Cooler</a>
      </>
    );
  }

  return (
    <>
      <h1>Sell</h1>
      <p className="admin-date">Comes off the cooler as soon as you finish the sale.</p>

      <label className="admin-group" htmlFor="buyer">Who is buying</label>
      <input
        id="buyer"
        className="admin-search"
        value={buyer}
        onChange={(event) => setBuyer(event.target.value)}
        placeholder="Walk-in"
      />

      {lines.length > 0 && (
        <div className="admin-tally">
          {lines.map((line, i) => (
            <div className="admin-tally-line" key={`${line.key}-${i}`}>
              <span>{line.name}</span>
              <span>
                {line.units}
                <button type="button" onClick={() => setLines((c) => c.filter((_, j) => j !== i))}>undo</button>
              </span>
            </div>
          ))}
        </div>
      )}

      <h2>Add What They Took</h2>
      <input
        className="admin-search"
        type="search"
        placeholder="Search flowers"
        value={query}
        onChange={(event) => { setQuery(event.target.value); setPicked(null); }}
        autoComplete="off"
      />

      {!picked && matches.map((v) => {
        const left = balance(ledger, keyOf(v)) - committed(keyOf(v));
        const oldest = openLots(ledger, keyOf(v))[0];
        const age = oldest?.dateCode ? daysInCooler(oldest.dateCode, now) : null;
        return (
          <button className="admin-jump" type="button" key={keyOf(v)} onClick={() => { setPicked(keyOf(v)); setQuery(label(v)); }} disabled={left <= 0}>
            <span>
              {label(v)}
              {/* The oldest lot is shown at the moment of choosing, because this
                  is the one screen where knowing it changes what somebody
                  reaches for. */}
              {oldest?.dateCode && age !== null && (
                <span className="admin-row-sub"> {oldest.dateCode} · {age} days in</span>
              )}
            </span>
            <span className={left <= 0 ? "admin-jump-none" : "admin-jump-count"}>{left <= 0 ? "none left" : left}</span>
          </button>
        );
      })}

      {chosen && (
        <>
          <p className="admin-group">How many</p>
          <div className="admin-row">
            <div className="admin-row-main">
              <div className="admin-row-name">{label(chosen)}</div>
              <div className="admin-row-sub">{freeNow} left</div>
            </div>
            <div className="admin-count">{units}</div>
            <div className="admin-step">
              <button type="button" onClick={() => setUnits((u) => Math.max(1, u - 1))} aria-label="One fewer">−</button>
              {/* Cannot sell what is not there. The cooler count is allowed to
                  go negative through a correction, because that records a real
                  discrepancy — but not through a sale, which would be inventing
                  stock rather than reporting it. */}
              <button type="button" onClick={() => setUnits((u) => Math.min(freeNow, u + 1))} disabled={units >= freeNow} aria-label="One more">+</button>
            </div>
          </div>
          <button className="admin-button" type="button" onClick={add} disabled={freeNow < 1}>
            Add {units} {label(chosen)}
          </button>
        </>
      )}

      <label className="admin-group" htmlFor="charged">What they paid, if you took it now</label>
      <input
        id="charged"
        className="admin-search"
        inputMode="decimal"
        value={charged}
        onChange={(event) => setCharged(event.target.value)}
        placeholder="Leave empty to bill later"
      />

      <button className="admin-button" type="button" disabled={lines.length === 0} onClick={complete}>
        Finish Sale{lines.length > 0 ? ` · ${lines.reduce((s, l) => s + l.units, 0)}` : ""}
      </button>
    </>
  );
}
