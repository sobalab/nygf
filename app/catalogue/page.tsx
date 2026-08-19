"use client";

import { Fragment, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { Ask } from "../ask";
import { categories, colourGroups, flowers, normalizeQuery, services, type CategoryId, type ColourGroupId } from "../catalogue-data";
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

// Colour rides in the query string rather than the hash, because the hash is
// already spoken for: it carries the category every variety page links back
// with, and it is also a real anchor on this page. Two filters, two surfaces,
// and /catalogue?colour=white#roses says both at once.
//   Subscribed the same way the hash is, and for the same reason — the URL is
// the browser's value and not this component's. Read as a string rather than an
// array because useSyncExternalStore compares snapshots by identity, and a fresh
// array every read is a new value every render, which is a loop and not a filter.
function subscribeToSearchParams(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
}

function readSearchColours(): string {
  const raw = new URLSearchParams(window.location.search).get("colour");
  if (!raw) return "";
  // Anything not a chip is dropped rather than obeyed: a typed or stale colour
  // should leave the reader looking at the whole wall, not an empty one.
  const wanted = new Set(raw.split(",").map((value) => value.trim()));
  return colourGroups.filter(({ id }) => wanted.has(id)).map(({ id }) => id).join(",");
}

function noSearchColours() {
  return "";
}

// Written back with replaceState and not pushState. A buyer building a palette
// presses four chips to get to it, and each one would be a step the back button
// has to walk out of before it reaches the page they arrived from.
function writeColourParam(next: readonly ColourGroupId[]) {
  const url = new URL(window.location.href);
  if (next.length) url.searchParams.set("colour", next.join(","));
  else url.searchParams.delete("colour");
  window.history.replaceState(null, "", url);
}

// What the chip says, for the toggle above it to repeat while the chips are
// folded away. Read off the same array the row is drawn from rather than kept as
// a second copy of the same fact.
const categoryLabel = (id: CategoryId) => categories.find((category) => category.id === id)!.label;

// A screenful of cards rather than the whole cooler at once. Divisible by 4, 3
// and 2, which are the column counts the grid steps through, so a full page is
// always whole rows at every width — a remainder row of one card reads as the
// list having been cut off rather than paged.
const PER_PAGE = 36;

// The numbers to draw. Every page while there are few enough of them, and the
// ends plus the neighbours of the current one once there are not: a reader
// needs the way to the far end and the way one step either side, and the run in
// between is a list nobody reads.
function pageNumbers(current: number, total: number): (number | "gap")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const from = Math.max(2, current - 1);
  const to = Math.min(total - 1, current + 1);
  const out: (number | "gap")[] = [1];
  if (from > 2) out.push("gap");
  for (let i = from; i <= to; i++) out.push(i);
  if (to < total - 1) out.push("gap");
  out.push(total);
  return out;
}

export default function Catalogue() {
  const searchId = useId();
  const colourPanelId = useId();
  const typePanelId = useId();
  const searchRef = useRef<HTMLInputElement>(null);
  const hashCategory = useSyncExternalStore(subscribeToHash, readHashCategory, noHashCategory);
  // Three states rather than two, and the third is the point: `undefined` is a
  // reader who hasn't touched a chip yet, and only then does the hash get to
  // say which one is down. Once they have, their choice holds — including the
  // deliberate null, which is the all state. There is no "All" chip, and
  // pressing the chip that is already down comes back here.
  const [chosen, setChosen] = useState<CategoryId | null | undefined>(undefined);
  const active = chosen === undefined ? hashCategory : chosen;

  // The same bargain for colour: untouched defers to the URL, and a reader who
  // has pressed a chip keeps what they pressed. Memoised because it is an array
  // the filter below depends on, and a new one each render would rebuild the
  // grid on every keystroke aimed at the search box.
  const urlColours = useSyncExternalStore(subscribeToSearchParams, readSearchColours, noSearchColours);
  const [chosenColours, setChosenColours] = useState<ColourGroupId[] | undefined>(undefined);
  const colours = useMemo(
    () => chosenColours ?? (urlColours ? (urlColours.split(",") as ColourGroupId[]) : []),
    [chosenColours, urlColours],
  );

  // One panel at a time, and that is what makes the tray beneath legible: with
  // both open there were two trays under two toggles and nothing saying which
  // belonged to which. One open panel sits under one raised toggle and the
  // question is answered by position.
  //   Nothing is hidden by closing the other: each toggle carries its own
  // selection, so a reader can see both filters at once while only editing one.
  //   Shut unless the reader arrived with a filter already set, in which case
  // its chips are what the page has to explain — a variety page's back link
  // carries /catalogue#roses, which is exactly the path where somebody returns
  // to a wall that is already narrowed. Type wins when both arrive at once,
  // being the first of the two.
  const [panel, setPanel] = useState<"type" | "colour" | null | undefined>(undefined);
  const openPanel = panel !== undefined ? panel : hashCategory !== null ? "type" : urlColours !== "" ? "colour" : null;
  const typesShown = openPanel === "type";
  const coloursShown = openPanel === "colour";

  function toggleColour(id: ColourGroupId) {
    const next = colours.includes(id) ? colours.filter((colour) => colour !== id) : [...colours, id];
    // Held in the row's own order rather than the order they were pressed in, so
    // the same two colours always write the same URL.
    const ordered = colourGroups.filter((group) => next.includes(group.id)).map((group) => group.id);
    setChosenColours(ordered);
    writeColourParam(ordered);
  }
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
  // Category AND colour AND search, not or: each narrows the list the next is run
  // against, so the three compose rather than replacing one another. Within
  // colour it is or — a buyer picking blush and peach and cream is describing one
  // palette, not asking for a stem that is somehow all three.
  const visibleFlowers = useMemo(
    () =>
      flowers.filter(
        (flower) =>
          (active === null || flower.category === active) &&
          (colours.length === 0 || flower.colourIds.some((id) => colours.includes(id))) &&
          (needle === "" || flower.search.includes(needle)),
      ),
    [active, colours, needle],
  );

  // What each colour would leave on the wall, given everything else already set.
  // A chip that would empty the grid is turned off rather than removed: taking it
  // out reflows the row under the thumb about to press it, and a reader watching
  // chips appear and vanish learns less than one watching them dim.
  const colourCounts = useMemo(() => {
    const counts = new Map<ColourGroupId, number>();
    for (const flower of flowers) {
      if (active !== null && flower.category !== active) continue;
      if (needle !== "" && !flower.search.includes(needle)) continue;
      for (const id of flower.colourIds) counts.set(id, (counts.get(id) ?? 0) + 1);
    }
    return counts;
  }, [active, needle]);

  const narrowed = active !== null || colours.length > 0 || query !== "";

  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(visibleFlowers.length / PER_PAGE));
  // Narrowing the list puts the reader back at the front of it. Compared during
  // the render and corrected there rather than synced in an effect: the page
  // number is derived from the filter, so it should be right before anything is
  // drawn, not after a first pass has drawn page 4 of a list that now has one.
  // React re-runs this component immediately and nothing reaches the screen in
  // between. The hash can change the category too, which is why this watches
  // the resolved filter rather than sitting in the chip handlers.
  const filterKey = `${active ?? ""}|${colours.join(",")}|${needle}`;
  const [lastFilter, setLastFilter] = useState(filterKey);
  if (lastFilter !== filterKey) {
    setLastFilter(filterKey);
    setPage(1);
  }
  const current = Math.min(page, pageCount);
  const start = (current - 1) * PER_PAGE;
  const pageFlowers = visibleFlowers.slice(start, start + PER_PAGE);

  // Turning a page puts the reader back at the controls, not at the top of the
  // document — the filters they set are what the new page is a page of, and
  // they should be able to see them and the count that just changed without
  // scrolling back up. It used to seat the grid itself, which left the search
  // field and the chips above the top of the window: the page turned and the
  // first thing on screen was a row of photographs with nothing saying what
  // list they belonged to. The scroll-margin on the controls is what keeps them
  // clear of the floating header.
  const controlsRef = useRef<HTMLDivElement>(null);
  function goTo(next: number) {
    setPage(next);
    controlsRef.current?.scrollIntoView({ block: "start" });
  }

  function clearSearch() {
    setQuery("");
    setTerm("");
  }

  function clearAll() {
    setChosen(null);
    setChosenColours([]);
    writeColourParam([]);
    clearSearch();
  }

  return (
    // The offerings band is the last thing before the footer, so it is what
    // the footer lifts off — see the --footer-well note in globals.css.
    <main style={{ "--footer-well": "var(--band-trade)" } as CSSProperties}>
      <SiteHeader />

      <section className="page-head section-pad">
        <h1>Our Flowers</h1>
        <p className="section-note">Our regular range. Availability extends beyond what is listed here and changes weekly, so please call for current stock. Pricing follows the daily market and is quoted on request. Photographs are provided as a visual reference. Variety, colour and form vary by crop and by season.</p>
      </section>

      <section className="catalogue section-pad" id="catalogue">
        <div className="catalogue-controls" ref={controlsRef}>
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

          {/* Both filters are shut at rest, and the two toggles sit on one line
              so the whole control is a single row until a reader asks it for
              more. Eleven type chips and ten colour chips wrap to nine lines
              between them on a phone, which would put the first photograph off
              the bottom of the screen on the page whose whole job is
              photographs.
                They open independently rather than one closing the other: they
              are two questions about the same wall and a buyer narrowing by both
              should be able to see both answers.
                Each toggle carries its own selection, because a panel can be
              shut over a filter that is still on — without that the grid would
              be short for a reason the page had folded away. The type says which
              one, since only one can be down; the colour says how many, since
              several can. */}
          <div className="filter-row filter-bar">
            <button
              type="button"
              className="filter-disclosure"
              aria-expanded={typesShown}
              aria-controls={typePanelId}
              aria-pressed={active !== null}
              onClick={() => setPanel(typesShown ? null : "type")}
            >
              {active !== null ? `Flower Type: ${categoryLabel(active)}` : "Flower Type"}
            </button>
            <button
              type="button"
              className="filter-disclosure"
              aria-expanded={coloursShown}
              aria-controls={colourPanelId}
              aria-pressed={colours.length > 0}
              onClick={() => setPanel(coloursShown ? null : "colour")}
            >
              {colours.length > 0 ? `Colour (${colours.length})` : "Colour"}
            </button>

            <div
              id={typePanelId}
              className="filter-panel"
              role="group"
              aria-label="Filter flowers by category"
              hidden={!typesShown}
            >
              {/* The way back to the whole list, and the state the page opens in.
                  It doesn't toggle off the way the ones after it do: there is
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

            <div
              id={colourPanelId}
              className="filter-panel"
              role="group"
              aria-label="Filter flowers by colour"
              hidden={!coloursShown}
            >
              {colourGroups.map((group) => {
                const pressed = colours.includes(group.id);
                const count = colourCounts.get(group.id) ?? 0;
                return (
                  <button
                    key={group.id}
                    type="button"
                    aria-pressed={pressed}
                    disabled={count === 0 && !pressed}
                    onClick={() => toggleColour(group.id)}
                  >
                    {/* The dot is what makes this row legible as colour at a
                        glance. It is decoration and the word beside it is the
                        name, so it is not read out twice. */}
                    <span className="swatch" data-colour={group.id} aria-hidden="true" />
                    {group.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="catalogue-status">
            {/* Reads itself out as it changes, and holds its width while it does
                — the figures are tabular, so the line doesn't shuffle sideways
                between 8 and 11. */}
            <p className="result-count" role="status">
              {visibleFlowers.length > PER_PAGE
                ? `${start + 1}\u2013${start + pageFlowers.length} of ${visibleFlowers.length} varieties`
                : `${visibleFlowers.length} of ${flowers.length} varieties`}
            </p>
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
            {pageFlowers.map((flower, offset) => {
              // Numbered against the whole filtered list, not against the page:
              // the break below asks what came before this card, and on the
              // second page of bouquets what came before the first card is
              // another bouquet, on the page turned away from.
              const index = start + offset;
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

        {pageCount > 1 ? (
          // A nav rather than a row of buttons: it is a set of links between
          // parts of one list, and naming it is what tells a screen reader
          // reaching it that the list has more than what was just read.
          <nav className="pagination" aria-label="Catalogue pages">
            <button type="button" className="page-step" onClick={() => goTo(current - 1)} disabled={current === 1}>
              <span aria-hidden="true">&larr;</span> Previous
            </button>
            <div className="page-numbers">
              {pageNumbers(current, pageCount).map((entry, i) =>
                entry === "gap" ? (
                  // Not a button and not read out: it stands for the pages
                  // between, and a screen reader announcing an ellipsis in a
                  // list of numbers is announcing punctuation.
                  <span className="page-gap" key={`gap${i}`} aria-hidden="true">&hellip;</span>
                ) : (
                  <button
                    type="button"
                    key={entry}
                    className="page-number"
                    aria-current={entry === current ? "page" : undefined}
                    aria-label={`Page ${entry}`}
                    onClick={() => goTo(entry)}
                  >
                    {entry}
                  </button>
                ),
              )}
            </div>
            <button type="button" className="page-step" onClick={() => goTo(current + 1)} disabled={current === pageCount}>
              Next <span aria-hidden="true">&rarr;</span>
            </button>
          </nav>
        ) : null}

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
