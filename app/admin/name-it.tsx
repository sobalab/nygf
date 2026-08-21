"use client";

import { useState } from "react";
import { GRADES, keyOf, label, type Variant } from "./data";
import { catalogueProducts } from "./catalogue-products";
import { normalizeQuery } from "../lib/text";
import { addVariant, addAlias, useVariants } from "./store";

// What happens when a label or a florist's list names a flower the catalogue has
// never heard of. It happens constantly: one Galaxytrade box listed ten
// varieties and seven of them were new, because the catalogue is what the shop
// has photographed and written up, while a box is whatever the farm had that
// morning.
//   So this offers two answers rather than one. Pick the flower it turned out to
// be, or type it in as a new one. Without the second, an unmatched line is a
// dead end and the only way out is to abandon the box and go find a laptop.
//   Either answer writes an alias, so the same wording resolves silently next
// time. That is the difference between a scanner that gets quieter over a few
// weeks and one that asks the same question every Tuesday forever.
export function NameIt({
  text,
  onResolved,
  onCancel,
}: {
  text: string;
  onResolved: (key: string, name: string) => void;
  onCancel: () => void;
}) {
  const variants = useVariants();
  const [query, setQuery] = useState(text);
  const [making, setMaking] = useState(false);

  // Prefilled from the label, with the packing digits farms tack on the end
  // stripped out — "Queen Crown 40 25" is a rose called Queen Crown.
  const [name, setName] = useState(() => text.replace(/\b\d+\b/g, "").replace(/\s+/g, " ").trim());
  const [category, setCategory] = useState("Standard Roses");
  const [grade, setGrade] = useState<number | null>(null);
  const [unit, setUnit] = useState("bunch");
  const [stemsPerUnit, setStemsPerUnit] = useState("25");

  const needle = normalizeQuery(query);

  // Two pools, and the order matters. A variant is a flower already being
  // counted at a length — "Freedom, 70cm" — and picking one is the end of the
  // question. A catalogue product is a flower the shop has written up but has no
  // stock line for yet; picking one still needs a length, because Hearts at 40cm
  // and Hearts at 60cm are different things to count.
  //   Creating from scratch is last, and should be rare. Every one of the 201
  //   varieties in the catalogue is already here.
  const stocked = [...new Map(variants.map((v) => [label(v), v])).values()]
    .filter((v) => !needle || normalizeQuery(v.name).includes(needle) || needle.includes(normalizeQuery(v.name)))
    .slice(0, 5);

  const known = catalogueProducts
    .filter((p) => {
      const name = normalizeQuery(p.name);
      if (!needle) return false;
      if (!(name.includes(needle) || needle.includes(name))) return false;
      // Anything already offered above is not offered twice.
      return !stocked.some((v) => normalizeQuery(v.name) === name);
    })
    .slice(0, 5);

  const pick = (variant: Variant) => {
    addAlias(text, keyOf(variant));
    onResolved(keyOf(variant), label(variant));
  };

  // A catalogue flower picked but not yet stocked at any length: carry its name
  // and category into the form so only the length is left to answer.
  const fromCatalogue = (product: { name: string; category: string }) => {
    setName(product.name);
    setCategory(product.category);
    setMaking(true);
  };

  const create = () => {
    const variant: Variant = {
      slug: normalizeQuery(name).replace(/\s+/g, "-"),
      name: name.trim(),
      category,
      grade,
      unit,
      stemsPerUnit: stemsPerUnit ? Number(stemsPerUnit) : null,
      par: null,
      lots: [],
      reserved: 0,
    };
    const key = addVariant(variant, text);
    onResolved(key, label(variant));
  };

  if (making) {
    return (
      <div className="admin-scan" style={{ marginBottom: 14 }}>
        <label className="admin-group" htmlFor="new-name">Name</label>
        <input id="new-name" className="admin-search" value={name} onChange={(e) => setName(e.target.value)} />

        <label className="admin-group" htmlFor="new-cat">Where it goes</label>
        <select id="new-cat" className="admin-search" value={category} onChange={(e) => setCategory(e.target.value)}>
          {["Standard Roses", "Garden Roses", "Spray Roses", "Tinted/Dyed Roses", "Carnations",
            "Lilies and Callas", "Orchids and Tropicals", "Seasonal and Specialty",
            "Greens and Filler", "Bouquets"].map((c) => <option key={c}>{c}</option>)}
        </select>

        <p className="admin-group">Length</p>
        <div className="admin-grades">
          {/* None is a real answer, not a blank: greens, hydrangea and poms are
              not sold by stem length and should not be made to pretend. */}
          <button className="admin-grade" type="button" aria-pressed={grade === null} onClick={() => setGrade(null)}>none</button>
          {GRADES.map((g) => (
            <button className="admin-grade" type="button" key={g} aria-pressed={grade === g} onClick={() => setGrade(g)}>{g}cm</button>
          ))}
        </div>

        <p className="admin-group">Sold as</p>
        <div className="admin-grades">
          {["bunch", "box", "stem", "piece"].map((u) => (
            <button className="admin-grade" type="button" key={u} aria-pressed={unit === u} onClick={() => setUnit(u)}>{u}</button>
          ))}
        </div>

        <label className="admin-group" htmlFor="new-spu">Stems in one {unit}</label>
        <input id="new-spu" className="admin-search" inputMode="numeric" value={stemsPerUnit}
               onChange={(e) => setStemsPerUnit(e.target.value.replace(/\D/g, ""))} placeholder="leave empty if it varies" />

        <button className="admin-button" type="button" onClick={create} disabled={!name.trim()}>
          Add {name.trim() || "it"}{grade ? `, ${grade}cm` : ""}
        </button>
        <button className="admin-button admin-button-quiet" type="button" onClick={() => setMaking(false)}>Back</button>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 10 }}>
      <input
        className="admin-search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search the catalogue"
        autoComplete="off"
      />
      {stocked.map((v) => (
        <button className="admin-jump" type="button" key={label(v)} onClick={() => pick(v)}>
          <span>{label(v)}</span><span className="admin-jump-none">{v.category}</span>
        </button>
      ))}
      {known.map((p) => (
        <button className="admin-jump" type="button" key={p.slug} onClick={() => fromCatalogue(p)}>
          <span>{p.name}</span><span className="admin-jump-none">{p.category} · needs a length</span>
        </button>
      ))}
      {stocked.length === 0 && known.length === 0 && (
        <p className="admin-empty">Nothing in the catalogue matches “{query}”.</p>
      )}
      <button className="admin-button admin-button-quiet" type="button" onClick={() => setMaking(true)}>
        Not in the catalogue. Add “{name || text}”
      </button>
      <button className="admin-button admin-button-quiet" type="button" onClick={onCancel}>Cancel</button>
    </div>
  );
}
