"use client";

import { Fragment, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Ask } from "../ask";
import { categories, flowers, normalizeQuery, services, type CategoryId } from "../catalogue-data";
import { Arrow, SiteFooter, SiteHeader } from "../chrome";
import { FlowerCard } from "../flower-card";
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

// A variety page's back link carries the category it belongs to, and this pair
// is what makes that link honest: /catalogue#roses opens with the Standard Roses chip
// already down rather than dropping a reader into the whole list to find their
// place in it again.
//   The hash is the browser's value, not this component's, so it is subscribed
// to rather than copied into state on mount — a copy is a second version of
// somebody else's fact, and it has to be kept in step for as long as it exists.
// A hash naming no category reads as no category: it may be #catalogue, which is
// a real anchor on this page.
function subscribeToHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

function readHashCategory(): CategoryId | null {
  const hash = window.location.hash.slice(1);
  return categories.some((category) => category.id === hash) ? (hash as CategoryId) : null;
}

// Prerendering has no location to read, so the build makes the same page it
// always did — the whole grid — and the hash is applied once React takes over.
function noHashCategory() {
  return null;
}

export default function Catalogue() {
  const searchId = useId();
  const searchRef = useRef<HTMLInputElement>(null);
  const hashCategory = useSyncExternalStore(subscribeToHash, readHashCategory, noHashCategory);
  // Three states rather than two, and the third is the point: `undefined` is a
  // reader who hasn't touched a chip yet, and only then does the hash get to
  // say which one is down. Once they have, their choice holds — including the
  // deliberate null, which is the all state. There is no "All" chip, and
  // pressing the chip that is already down comes back here.
  const [chosen, setChosen] = useState<CategoryId | null | undefined>(undefined);
  const active = chosen === undefined ? hashCategory : chosen;
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
    setChosen(null);
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
                It doesn't toggle off the way the ones below it do: there is
                nowhere for it to go, since it is already the resting state. */}
            <button type="button" aria-pressed={active === null} onClick={() => setChosen(null)}>
              All Flowers
            </button>
            {categories.map((category) => {
              const pressed = active === category.id;
              return (
                <button key={category.id} type="button" aria-pressed={pressed} onClick={() => setChosen(pressed ? null : category.id)}>
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
              return (
                <Fragment key={flower.slug}>
                  {/* The break names what follows it, and what follows it is the
                      bouquets — it read "Seasonal" for a while, which is the
                      name of a different chip two rows up and left it looking
                      like a section label nobody had cleared out. */}
                  {opensBouquets ? <h2 className="grid-break">Bouquets</h2> : null}
                  <FlowerCard flower={flower} />
                </Fragment>
              );
            })}
          </div>
        )}

        <Ask className="solid-button" message={AVAILABILITY_ASK} inquiry="/contact">Ask About Availability</Ask>
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
              {/* The order kinds the form offers are these three plus the
                  general case, so an offering can hand the form its own name
                  and arrive with the right one already chosen. */}
              <Ask
                className="text-link"
                message={`Hello, I'd like to ask about ${service.name.toLowerCase()}.`}
                inquiry={`/contact?service=${encodeURIComponent(service.name)}`}
              >
                Ask about this <Arrow />
              </Ask>
            </article>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
