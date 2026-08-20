"use client";

import { useMemo } from "react";
import { variants, byCategory, keyOf, label, isAging, isSuspect } from "./data";
import { useLedger, balance, openLots, soldToday, variantFor } from "./store";
import { daysInCooler } from "../lib/date-code";

// Today. The first screen of the morning, and the only one that gets to say
// what is worth doing next.
//   No takings figure, deliberately: this is read standing in a cooler with the
// door open and other people around. Counts of work, not money.
export default function Today() {
  const ledger = useLedger();
  const now = useMemo(() => new Date(), []);

  const rows = variants.map((v) => {
    const key = keyOf(v);
    const left = balance(ledger, key);
    const oldest = openLots(ledger, key).find((lot) => lot.dateCode);
    const age = oldest ? daysInCooler(oldest.dateCode, now) : null;
    return { v, key, left, oldest, age };
  });

  const aging = rows
    .filter((r) => r.left > 0 && r.age !== null && isAging(r.age) && !isSuspect(r.age))
    .sort((a, b) => b.age! - a.age!);
  const suspect = rows.filter((r) => r.left > 0 && r.age !== null && isSuspect(r.age));
  const low = rows.filter((r) => r.v.par !== null && r.left - r.v.reserved <= r.v.par);

  const sold = soldToday(ledger, now);
  const soldUnits = sold.reduce((sum, m) => sum - m.delta, 0);

  return (
    <>
      <h1>Today</h1>
      <p className="admin-date">
        {now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
      </p>

      {/* A sentence rather than tiles. Four numbers in boxes get read one at a
          time; one line is read at a glance, which is all the attention this
          screen gets at six in the morning. */}
      <p className="admin-lede">
        {aging.length > 0
          ? `${aging.length} ${aging.length === 1 ? "flower has" : "flowers have"} been in a week or more. `
          : "Nothing aging. "}
        {low.length} running low.
        {soldUnits > 0 && ` ${soldUnits} sold so far.`}
      </p>

      <a className="admin-jump" href="/admin/sell"><span>Sell</span><span className="admin-jump-count">−</span></a>
      <a className="admin-jump" href="/admin/intake"><span>Log What Came In</span><span className="admin-jump-count">＋</span></a>
      <a className="admin-jump" href="/admin/cooler"><span>Count The Cooler</span><span className="admin-jump-count">{variants.length}</span></a>

      {/* The payoff screen, and the reason the project exists. Oldest first,
          because that is the order they have to go out in. */}
      <h2>Move These First</h2>
      {aging.length === 0 ? (
        <p className="admin-empty">Nothing has been sitting a week. Good.</p>
      ) : (
        aging.map(({ v, key, left, oldest, age }) => (
          <div className="admin-row" key={key}>
            <div className="admin-row-main">
              <div className="admin-row-name">{label(v)}</div>
              <div className="admin-row-sub admin-old">
                <span className="admin-code">{oldest!.dateCode}</span>
                {" · "}{age} days in{oldest!.farm ? ` · ${oldest!.farm}` : ""}
              </div>
            </div>
            <div className="admin-count">{left}</div>
          </div>
        ))
      )}

      {suspect.length > 0 && (
        <>
          <h2>Check These Codes</h2>
          {suspect.map(({ v, key, left, oldest, age }) => (
            <div className="admin-row" key={key}>
              <div className="admin-row-main">
                <div className="admin-row-name">{label(v)}</div>
                <div className="admin-row-sub admin-old">
                  <span className="admin-code">{oldest!.dateCode}</span>
                  {" · "}reads as {age} days, which cannot be right
                </div>
              </div>
              <div className="admin-count">{left}</div>
            </div>
          ))}
        </>
      )}

      {/* What has gone out today, newest first. The check somebody makes at the
          end of a morning against what they remember happening. */}
      {sold.length > 0 && (
        <>
          <h2>Sold Today</h2>
          {[...sold].reverse().map((m) => (
            <div className="admin-row" key={m.id}>
              <div className="admin-row-main">
                <div className="admin-row-name">{variantFor(m.key) ? label(variantFor(m.key)!) : m.key}</div>
                <div className="admin-row-sub">{m.note ?? "Walk-in"}</div>
              </div>
              <div className="admin-count">{-m.delta}</div>
            </div>
          ))}
        </>
      )}

      <h2>Running Low</h2>
      {low.length === 0 ? (
        <p className="admin-empty">Nothing below its mark.</p>
      ) : (
        byCategory(low.map((r) => r.v)).map(([category, group]) => (
          <div key={category}>
            <p className="admin-group">{category}</p>
            {group.map((v) => {
              const left = balance(ledger, keyOf(v)) - v.reserved;
              return (
                <div className="admin-row" key={keyOf(v)}>
                  <div className="admin-row-main">
                    <div className="admin-row-name">{label(v)}</div>
                    <div className="admin-row-sub">
                      keeps {v.par} {v.par === 1 ? v.unit : `${v.unit}es`} on hand
                    </div>
                  </div>
                  <div className={`admin-count${left < 0 ? " admin-neg" : ""}`}>{left}</div>
                </div>
              );
            })}
          </div>
        ))
      )}
    </>
  );
}
