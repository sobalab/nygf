"use client";

import { Fragment, useEffect, useId, useMemo, useRef, useState, type CSSProperties } from "react";
import { categories, flowers, normalizeQuery, services, type CategoryId } from "../catalogue-data";
import { Arrow, SiteFooter, SiteHeader } from "../chrome";
import { shop, whatsappHref } from "../site";

const AVAILABILITY_ASK = "Hello, could you send me today's flower availability and pricing?";
const SERVICES_ASK = "Hello, I'd like to ask about your services.";

// Decoration, not information: the label and the placeholder both already say
// what the box is, so this is hidden from a screen reader rather than read out
// as a third name for it. Drawn on the hairline the menu bars and the section
// rules are, so it sits in the same hand as the rest of the page.
function SearchGlass() {
  return (
    <svg className="search-glass" width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" focusable="false">
      <circle cx="7.6" cy="7.6" r="5.35" stroke="currentColor" strokeWidth="1.3" />
      <path d="M11.5 11.5 15.4 15.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export default function Catalogue() {
  const searchId = useId();
  const searchRef = useRef<HTMLInputElement>(null);
  // null is the all state: there is no "All" chip, and pressing the chip that
  // is already down comes back here.
  const [active, setActive] = useState<CategoryId | null>(null);
  // Two pieces of state for one field. `query` is what the input shows and has
  // to update on every keystroke; `term` is what the grid reads, and follows a
  // beat behind so a buyer typing a name doesn't rebuild 37 cards per letter.
  const [query, setQuery] = useState("");
  const [term, setTerm] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setTerm(query), 150);
    return () => clearTimeout(timer);
  }, [query]);

  const needle = normalizeQuery(term);
  // Category AND search, not or: a chip narrows the list the query is run
  // against, so the two compose rather than replacing one another.
  const visibleFlowers = useMemo(
    () => flowers.filter((flower) => (active === null || flower.category === active) && (needle === "" || flower.search.includes(needle))),
    [active, needle],
  );

  const narrowed = active !== null || query !== "";

  function clearSearch() {
    setQuery("");
    setTerm("");
  }

  function clearAll() {
    setActive(null);
    clearSearch();
  }

  return (
    <main>
      <SiteHeader />

      <section className="page-head section-pad">
        <h1>Our Flowers</h1>
        <p className="section-note">What we carry regularly. We bring in more than this and the cooler changes week to week, so call for what you need. Prices move with the market daily and are never posted.</p>
      </section>

      <section className="catalogue section-pad" id="catalogue">
        <div className="catalogue-controls">
          <search className="catalogue-search">
            {/* The placeholder says what to type; the label says what the box
                is, and stays said once there is text in it. */}
            <label className="visually-hidden" htmlFor={searchId}>Search flowers by name</label>
            <div className="search-field">
              <input
                id={searchId}
                ref={searchRef}
                type="search"
                value={query}
                placeholder="Search by name"
                autoComplete="off"
                spellCheck={false}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") clearSearch();
                }}
              />
              {/* One lane at the right end of the field, holding whichever of
                  the two the field currently wants: the glass while it is empty,
                  and the clear once there is something to clear. Focus stays in
                  the field after a clear, so the next keystroke lands where it
                  did and the glass comes back under the cursor. */}
              {query === "" ? (
                <SearchGlass />
              ) : (
                <button type="button" className="search-clear" aria-label="Clear search" onClick={() => { clearSearch(); searchRef.current?.focus(); }}>
                  <span aria-hidden="true">&times;</span>
                </button>
              )}
            </div>
          </search>

          <div className="filter-row" role="group" aria-label="Filter flowers by category">
            {/* The way back to the whole list, and the state the page opens in.
                It doesn't toggle off the way the six below it do: there is
                nowhere for it to go, since it is already the resting state. */}
            <button type="button" aria-pressed={active === null} onClick={() => setActive(null)}>
              All Flowers
            </button>
            {categories.map((category) => {
              const pressed = active === category.id;
              return (
                <button key={category.id} type="button" aria-pressed={pressed} onClick={() => setActive(pressed ? null : category.id)}>
                  {category.label}
                </button>
              );
            })}
          </div>

          <div className="catalogue-status">
            {/* Reads itself out as it changes, and holds its width while it does
                — the figures are tabular, so the line doesn't shuffle sideways
                between 8 and 11. */}
            <p className="result-count" role="status">{visibleFlowers.length} of {flowers.length} varieties</p>
            {narrowed ? <button type="button" className="clear-all" onClick={clearAll}>Clear</button> : null}
          </div>
        </div>

        {/* Cards that don't match are dropped from the markup rather than hidden
            with CSS, so a screen reader and a keyboard both reach exactly what
            is on screen. */}
        {visibleFlowers.length === 0 ? (
          <div className="catalogue-empty">
            <p>Nothing on this list matches that, and the cooler often holds more than the list does.</p>
            <p>
              <button type="button" className="clear-all" onClick={clearAll}>Clear the filter</button> to see the list again, or ask what came in this week: call{" "}
              <a href={shop.storePhoneHref}>{shop.storePhone}</a> or message{" "}
              <a href={whatsappHref(AVAILABILITY_ASK)} target="_blank" rel="noreferrer">{shop.ownerPhone} on WhatsApp</a>.
            </p>
          </div>
        ) : (
          <div className="flower-grid">
            {visibleFlowers.map((flower, index) => {
              // Bouquets close the list, and the break that opens them names them
              // rather than only parting them from the stems. It falls once, on
              // the first of them, however the grid has been narrowed — where a
              // bare rule needed something above it to divide from, a heading is
              // worth having even when the section is all that is on screen. The
              // rule it carries is what steps aside in that case, in CSS.
              const opensBouquets =
                flower.category === "bouquets" && (index === 0 || visibleFlowers[index - 1].category !== "bouquets");
              // One field for both cases, so the markup below doesn't branch:
              // a record with a set of frames hands over all of them, a record
              // with one hands over the one, and a record with neither hands
              // over nothing and keeps its flat tile.
              const frames = flower.images ?? (flower.image ? [flower.image] : []);
              return (
                <Fragment key={flower.name}>
                  {opensBouquets ? <h2 className="grid-break">Seasonal</h2> : null}
                  <article className="flower-card">
                    {/* Every frame after the first is the same subject again, so
                        only the first is described — three identical alts would
                        have a screen reader read the bouquet's name three times
                        over for one card. The cycling is decoration either way:
                        nothing is said in a later frame that the first doesn't
                        already say. */}
                    <div className="flower-image-wrap">
                      {frames.map((src, frame) => (
                        <img
                          key={src}
                          src={src}
                          alt={frame === 0 ? flower.name : ""}
                          loading="lazy"
                          className={frames.length > 1 ? "flower-slide" : undefined}
                          style={frames.length > 1 ? ({ "--i": frame } as CSSProperties) : undefined}
                        />
                      ))}
                    </div>
                    {/* The chip's own label, then the colour group where the
                        record carries one. The category stays said either way: a
                        search crosses the chips, so a card found by name has to
                        place itself without one being pressed. */}
                    <div className="flower-meta"><h3>{flower.name}</h3><p>{flower.colour ? `${flower.group}, ${flower.colour}` : flower.group}</p></div>
                  </article>
                </Fragment>
              );
            })}
          </div>
        )}

        <a href={whatsappHref(AVAILABILITY_ASK)} target="_blank" rel="noreferrer" className="solid-button">Ask on WhatsApp</a>
      </section>

      <section className="offerings section-pad">
        <h2>Services</h2>
        <div className="offerings-list">
          {services.map((service) => (
            <article className="offering" key={service.name}>
              {/* The card's ground, not a picture in it: empty alt, because the
                  heading sitting on top of it is already the card's name and a
                  screen reader announcing the backdrop as well would say the
                  same thing twice. */}
              <img className="offering-photo" src={service.image} alt="" loading="lazy" />
              <h3>{service.name}</h3>
              <a href={whatsappHref(SERVICES_ASK)} target="_blank" rel="noreferrer" className="text-link">Ask about this <Arrow /></a>
            </article>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
