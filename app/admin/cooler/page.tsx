"use client";

import { useMemo, useState } from "react";
import { variants, byCategory, keyOf, label, isAging, isSuspect, type Variant } from "../data";
import { normalizeQuery } from "../../lib/text";
import { useLedger, balance, openLots, post } from "../store";
import { daysInCooler } from "../../lib/date-code";

// What is in the cooler, and the screen that replaces the count the owner keeps
// in his head. Grouped in the order the public catalogue runs in, which is also
// roughly the order the room is arranged in.
//   Every number here is the sum of a ledger and not a stored figure, so what
// is on screen is whatever receiving and selling have actually done to it. The
// steppers post corrections rather than overwriting anything.
export default function Cooler() {
  const ledger = useLedger();
  const now = useMemo(() => new Date(), []);
  const [query, setQuery] = useState("");

  const needle = normalizeQuery(query);
  const shown = variants.filter(
    (v) => !needle || normalizeQuery(`${v.name} ${v.category}`).includes(needle),
  );

  const correct = (v: Variant, delta: number) =>
    post([{ key: keyOf(v), delta, reason: "adjustment", note: "counted at the shelf" }]);

  return (
    <>
      <h1>The Cooler</h1>
      <p className="admin-date">Tap a number to correct it. Saves as you go.</p>

      <input
        className="admin-search"
        type="search"
        placeholder="Search flowers"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        autoComplete="off"
      />

      {shown.length === 0 && <p className="admin-empty">Nothing matches “{query}”.</p>}

      {byCategory(shown).map(([category, group]) => (
        <div key={category}>
          <p className="admin-group">{category}</p>
          {group.map((v) => {
            const key = keyOf(v);
            const left = balance(ledger, key);
            const oldest = openLots(ledger, key).find((lot) => lot.dateCode);
            const age = oldest ? daysInCooler(oldest.dateCode, now) : null;
            const worrying = age !== null && isAging(age) && !isSuspect(age);
            return (
              <div className="admin-row" key={key}>
                <div className="admin-row-main">
                  <div className="admin-row-name">
                    {v.name}
                    {v.grade && <span className="admin-row-grade">, {v.grade}cm</span>}
                  </div>
                  <div className={`admin-row-sub${worrying ? " admin-old" : ""}`}>
                    {oldest && age !== null ? (
                      <>
                        <span className="admin-code">{oldest.dateCode}</span>
                        {" · "}
                        {isSuspect(age) ? "check this code" : age === 0 ? "in today" : `${age} days in`}
                        {v.reserved > 0 && <span className="admin-held"> · {v.reserved} held</span>}
                      </>
                    ) : left > 0 ? (
                      "no date on it"
                    ) : (
                      "none left"
                    )}
                  </div>
                </div>
                {/* Allowed to go negative. A count below zero is a real
                    discrepancy somebody has to go and resolve, and hiding it is
                    how a system starts being lied to. */}
                <div className={`admin-count${left < 0 ? " admin-neg" : ""}`}>{left}</div>
                <div className="admin-step">
                  <button type="button" onClick={() => correct(v, -1)} aria-label={`One fewer ${label(v)}`}>−</button>
                  <button type="button" onClick={() => correct(v, 1)} aria-label={`One more ${label(v)}`}>+</button>
                </div>
              </div>
            );
          })}
        </div>
      ))}

      <p className="admin-note">
        Numbers are what is on the shelf. Anything already promised to an order is
        shown as held beside it.
      </p>
    </>
  );
}
