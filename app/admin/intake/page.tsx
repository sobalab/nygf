"use client";

import { useMemo, useState } from "react";
import { variants, GRADES, FARMS, keyOf } from "../data";
import { normalizeQuery } from "../../lib/text";
import { fromDateCode, toDateCode } from "../../lib/date-code";
import { post } from "../store";

type Line = { key: string; name: string; grade: number | null; units: number };

// Receiving. The highest-frequency screen in the building and the one to
// optimise hardest: thirty boxes come off a truck and each one is a search, a
// grade, a number and a save. Every tap saved here is a tap saved thirty times.
//   The loop returns to the search box after each line rather than to a form,
// because the next thing in somebody's hands is always another box.
export default function Intake() {
  const today = useMemo(() => new Date(), []);
  const [dateCode, setDateCode] = useState(() => toDateCode(today));
  const [farm, setFarm] = useState("");
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<string | null>(null);
  const [grade, setGrade] = useState<number | null>(null);
  const [units, setUnits] = useState(1);
  const [lines, setLines] = useState<Line[]>([]);
  const [saved, setSaved] = useState<number | null>(null);

  const reading = fromDateCode(dateCode, today);

  const needle = normalizeQuery(query);
  const matches = needle
    ? [...new Map(variants.filter((v) => normalizeQuery(v.name).includes(needle)).map((v) => [v.name, v])).values()].slice(0, 6)
    : [];

  // Only the grades this variety actually ships at, so the row is two or three
  // buttons and not the whole grid. Falls back to the full grid for something
  // never received before, which is how a new grade gets in.
  const unitFor = (name: string) => {
    const unit = variants.find((v) => v.name === name)?.unit ?? "unit";
    return units === 1 ? unit : `${unit}es`;
  };

  const gradesFor = (name: string) => {
    const known = variants.filter((v) => v.name === name && v.grade !== null).map((v) => v.grade as number);
    return known.length ? [...new Set(known)].sort((a, b) => a - b) : [...GRADES];
  };

  const choose = (name: string) => {
    setPicked(name);
    setQuery(name);
    const grades = gradesFor(name);
    const hasNoGrade = variants.some((v) => v.name === name && v.grade === null);
    setGrade(hasNoGrade ? null : grades[grades.length - 1]);
  };

  const add = () => {
    if (!picked) return;
    const variant = variants.find((v) => v.name === picked && v.grade === grade);
    if (!variant) return;
    setLines((current) => [{ key: keyOf(variant), name: picked, grade, units }, ...current]);
    setPicked(null);
    setQuery("");
    setGrade(null);
    setUnits(1);
  };

  const entries = lines.length;

  return (
    <>
      <h1>What Came In</h1>
      <p className="admin-date">One shipment at a time. Add every box, then save once.</p>

      {/* The code as written on the box, because that is the number already in
          front of them. Typing 0280 fills the date; nobody converts anything. */}
      <label className="admin-group" htmlFor="code">Date on the box</label>
      <input
        id="code"
        className="admin-search"
        inputMode="numeric"
        value={dateCode}
        onChange={(event) => setDateCode(event.target.value.replace(/\D/g, "").slice(0, 4))}
        placeholder="0280"
      />
      <p className="admin-note" style={{ marginTop: 0 }}>
        {reading
          ? reading.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
          : "Not a date yet."}
      </p>

      <label className="admin-group" htmlFor="farm">Farm</label>
      <input
        id="farm"
        className="admin-search"
        list="farms"
        value={farm}
        onChange={(event) => setFarm(event.target.value)}
        placeholder="Ceres Farms"
      />
      <datalist id="farms">{FARMS.map((f) => <option key={f} value={f} />)}</datalist>

      {lines.length > 0 && (
        <div className="admin-tally">
          {lines.map((line, i) => (
            <div className="admin-tally-line" key={`${line.name}-${line.grade}-${i}`}>
              <span>{line.name}{line.grade ? `, ${line.grade}cm` : ""}</span>
              <span>
                {line.units}
                <button type="button" onClick={() => setLines((c) => c.filter((_, j) => j !== i))}>undo</button>
              </span>
            </div>
          ))}
        </div>
      )}

      <h2>Add A Box</h2>
      <a className="admin-jump" href="/admin/intake/scan">
        <span>Scan The Label</span>
        <span className="admin-jump-count">›</span>
      </a>

      <input
        className="admin-search"
        style={{ marginTop: 9 }}
        type="search"
        placeholder="Or type the flower"
        value={query}
        onChange={(event) => { setQuery(event.target.value); setPicked(null); }}
        autoComplete="off"
      />

      {!picked && matches.map((v) => (
        <button className="admin-jump" type="button" key={v.name} onClick={() => choose(v.name)}>
          <span>{v.name}</span>
          <span className="admin-jump-none">{v.category}</span>
        </button>
      ))}

      {picked && (
        <>
          {/* The farms print this grid on their own boxes and tick a column.
              Two taps, no dropdown. */}
          {variants.some((v) => v.name === picked && v.grade !== null) && (
            <>
              <p className="admin-group">Length</p>
              <div className="admin-grades">
                {gradesFor(picked).map((g) => (
                  <button className="admin-grade" type="button" key={g} aria-pressed={grade === g} onClick={() => setGrade(g)}>
                    {g}cm
                  </button>
                ))}
              </div>
            </>
          )}

          <p className="admin-group">How many</p>
          <div className="admin-row">
            <div className="admin-row-main">
              <div className="admin-row-name">{picked}{grade ? `, ${grade}cm` : ""}</div>
              <div className="admin-row-sub">{unitFor(picked)}</div>
            </div>
            <div className="admin-count">{units}</div>
            <div className="admin-step">
              <button type="button" onClick={() => setUnits((u) => Math.max(1, u - 1))} aria-label="One fewer">−</button>
              <button type="button" onClick={() => setUnits((u) => u + 1)} aria-label="One more">+</button>
            </div>
          </div>

          <button className="admin-button" type="button" onClick={add}>
            Add {units} {picked}
          </button>
        </>
      )}

      <button
        className="admin-button"
        type="button"
        disabled={lines.length === 0 || !reading}
        onClick={() => {
          // One post for the whole shipment rather than one per line: Server
          // Actions dispatch sequentially per client, so thirty boxes sent one
          // at a time would crawl. The real version is one action, one
          // transaction, for exactly this reason.
          post(lines.map((line) => ({
            key: line.key, delta: line.units, reason: "intake" as const,
            dateCode, farm: farm.trim() || undefined,
          })));
          setLines([]);
          setSaved(lines.length);
        }}
      >
        Save Shipment{entries > 0 ? ` · ${entries} ${entries === 1 ? "line" : "lines"}` : ""}
      </button>
      {saved !== null && (
        <p className="admin-note">
          Saved {saved} {saved === 1 ? "line" : "lines"}. It is on the cooler now.
        </p>
      )}
      <p className="admin-note">
        Everything on the list saves together, in one go. Nothing is counted until
        you save.
      </p>
    </>
  );
}
