"use client";

import { Fragment, useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "motion/react";
import { shop } from "./site";

// The address and hours are stored as single strings with newlines, so they read
// correctly in a text draft too. Break them for the page.
function Lines({ text }: { text: string }) {
  return text.split("\n").map((line, index) => (
    <Fragment key={line}>
      {index > 0 ? <br /> : null}
      {line}
    </Fragment>
  ));
}

export function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

// Below this, a scroll is the tail of a gesture rather than a change of mind —
// trackpad momentum gives up a pixel or two the other way as it stops, and
// answering those flickers the bar.
const TURN_PX = 5;

export function SiteHeader({ home = false }: { home?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const prefix = home ? "" : "/";
  const ref = useRef<HTMLElement>(null);
  const still = useReducedMotion();
  const [away, setAway] = useState(false);
  const { scrollY } = useScroll();
  const last = useRef(0);

  // Every page opens with a block that introduces it — the hero on the home
  // page, the page head everywhere else — and the bar belongs over that block
  // and not much past it: it names the shop while the reader is arriving, and
  // is gone once they have committed to reading down. Half of the lead is where
  // that changes over. Going back up is a reader looking for something, which is
  // exactly when a nav should be there, so it returns on the first upward travel
  // wherever they are rather than only at the top.
  //
  // Measured as how far the lead's top has gone above the window against its own
  // height, so it is the same half whatever the window is sized to and whatever
  // the lead happens to be. A page with neither block falls back to most of a
  // screenful, which is the same idea without something to measure it against.
  //
  // useMotionValueEvent rather than a scroll listener and a frame of our own:
  // Motion is already reading the scroll elsewhere on the page, so this rides
  // that same read instead of adding a second one.
  useMotionValueEvent(scrollY, "change", (y) => {
    // An open menu is the nav being used. Nothing takes it away mid-reach.
    if (menuOpen) return;
    const moved = y - last.current;
    if (Math.abs(moved) < TURN_PX) return;
    last.current = y;
    if (moved < 0) return setAway(false);
    const lead = document.querySelector<HTMLElement>(".hero, .page-head");
    if (!lead) return setAway(y >= window.innerHeight * 0.6);
    const box = lead.getBoundingClientRect();
    if (-box.top >= box.height / 2) setAway(true);
  });


  return (
    // Away means fully away: its own height, then the 14px it is held down from
    // the top, then enough again for the shadow to go with it. A bar that leaves
    // all but a few pixels of itself reads as broken rather than as gone.
    //   The spring is what keeps this from reading as a switch. It is the one
    // element on the page whose movement the reader did not ask for, which is
    // the argument for it being the gentlest: low stiffness and heavy damping,
    // so it withdraws and returns without a bounce at either end.
    <motion.header
      className="site-header"
      ref={ref}
      onFocus={() => setAway(false)}
      // An open menu is the nav being used, so the bar is held wherever it is
      // rather than being taken away mid-reach — read here rather than synced
      // into `away`, which would be storing something already known.
      animate={{ y: away && !menuOpen ? "calc(-100% - 30px)" : 0 }}
      transition={still ? { duration: 0 } : { type: "spring", stiffness: 110, damping: 26, mass: 1.1 }}
    >
      <a href={home ? "#top" : "/"} className="wordmark" aria-label="New York Garden Flower Wholesale home">
        NYGF
      </a>
      <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label={menuOpen ? "Close menu" : "Open menu"}>
        <span className="menu-icon" aria-hidden="true"><span /><span /><span /></span>
      </button>
      <nav className={menuOpen ? "nav open" : "nav"} aria-label="Main navigation">
        <a href="/catalogue" onClick={() => setMenuOpen(false)}>Catalogue</a>
        <a href={`${prefix}#story`} onClick={() => setMenuOpen(false)}>Our story</a>
        <a href={`${prefix}#services`} onClick={() => setMenuOpen(false)}>Our Services</a>
        {/* The header CTA is hidden below 800px, so the menu carries contact there. */}
        <a className="nav-contact" href="/contact" onClick={() => setMenuOpen(false)}>Contact us</a>
      </nav>
      <a className="header-cta" href="/contact">Contact us</a>
    </motion.header>
  );
}

// How far the panel travels on its way in. It overlaps the band above it by its
// own corner radius and no more: the ground behind the footer is painted in that
// band's colour for the whole page (see --footer-well in globals.css), so the
// corners are cut out of colour for the whole of the travel without the panel
// having to sit on top of the section to manage it. An overlap deep enough to
// cover the travel would eat the foot of that section instead, and the gap above
// the panel would close up.
const FOOTER_RISE = 90;

export function SiteFooter({ home = false }: { home?: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const still = useReducedMotion();
  // Read against the footer's own approach: 0 with its top edge at the foot of
  // the window, 1 once that edge has climbed to the middle of it. The panel is
  // taller than that stretch on every page, so it is fully settled well before
  // the page runs out of scroll — which is what keeps it flush at the very
  // bottom instead of leaving a strip of ground under it.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start center"] });
  const rise = useTransform(scrollYProgress, [0, 1], [FOOTER_RISE, 0]);
  const grow = useTransform(scrollYProgress, [0, 1], [0.93, 1]);

  return (
    // Anchored at the bottom edge, so the growth reads as the panel opening
    // upward out of the foot of the window rather than swelling from its middle
    // — the bottom is the one edge that is already where it belongs.
    <motion.footer
      ref={ref}
      style={{
        marginTop: `calc(-1 * var(--card-radius))`,
        ...(still ? null : { y: rise, scale: grow, transformOrigin: "center bottom" }),
      }}
    >
      <div className="footer-brand">
        <a href={home ? "#top" : "/"} className="wordmark wordmark-full">New York Garden Flower Wholesale Inc.</a>
        <p className="footer-tagline">Direct-Import Wholesale Cut Flowers</p>
        {/* The other half of what "direct" means, and the only place on the site
            that says where the buying end of it sits. It is a fact rather than a
            claim, so it takes the body tier under the line instead of a second
            slanted one. */}
        <p className="footer-origin">Procurement office in Fusagasugá, Cundinamarca, Colombia</p>
      </div>

      {/* Contact leads: with the home page's own reach/visit/hours columns gone,
          this is the only place the numbers appear, and the number is what a
          buyer comes down here for. */}
      <div className="footer-details">
        <p>
          <span>Contact</span>
          <a href={`mailto:${shop.email}?subject=Wholesale%20flower%20inquiry`}>{shop.email}</a>
          <br />
          <i>Store: </i>
          <a href={shop.storePhoneHref}>{shop.storePhone}</a>
          <br />
          {/* The cell takes iMessage and SMS but not voice, so it can't be a
              tel: link. It opens a message to the number instead, which is what
              the accessible name says rather than the column, where it would
              crowd the number. */}
          <i>Cell: </i>
          <a href={shop.smsHref} aria-label={`Text ${shop.ownerPhone}`}>{shop.ownerPhone}</a>
        </p>
        <p>
          {/* The address reads as an address, so it carries no standing rule —
              the map link is there on hover for anyone who reaches for it. */}
          <span>Visit &amp; pickup</span>
          <a className="plain" href={shop.mapsHref} target="_blank" rel="noreferrer"><Lines text={shop.address} /></a>
        </p>
        <p>
          <span>Hours</span>
          <Lines text={shop.hours} />
        </p>
      </div>

      <div className="footer-base">
        <span>© 2026 New York Garden Flower Wholesale, Inc.</span>
      </div>
    </motion.footer>
  );
}
