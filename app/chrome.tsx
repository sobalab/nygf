"use client";

import { Fragment, useState } from "react";
import { shop } from "./site";

// The address and hours are stored as single strings with newlines, so they read
// correctly in the WhatsApp draft too. Break them for the page.
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

export function SiteHeader({ home = false }: { home?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const prefix = home ? "" : "/";

  return (
    <header className="site-header">
      <a href={home ? "#top" : "/"} className="wordmark" aria-label="New York Garden Flower Wholesale home">
        NYGF
      </a>
      <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label={menuOpen ? "Close menu" : "Open menu"}>
        <span className="menu-icon" aria-hidden="true"><span /><span /><span /></span>
      </button>
      <nav className={menuOpen ? "nav open" : "nav"} aria-label="Main navigation">
        <a href="/catalogue" onClick={() => setMenuOpen(false)}>Catalogue</a>
        <a href={`${prefix}#about`} onClick={() => setMenuOpen(false)}>Our story</a>
        <a href={`${prefix}#services`} onClick={() => setMenuOpen(false)}>Our Services</a>
        {/* The header CTA is hidden below 800px, so the menu carries contact there. */}
        <a className="nav-contact" href="/contact" onClick={() => setMenuOpen(false)}>Contact us</a>
      </nav>
      <a className="header-cta" href="/contact">Contact us</a>
    </header>
  );
}

export function SiteFooter({ home = false }: { home?: boolean }) {
  return (
    <footer>
      <div className="footer-brand">
        <a href={home ? "#top" : "/"} className="wordmark wordmark-full">New York Garden Flower Wholesale Inc.</a>
        <p className="footer-tagline">Direct-Import Wholesale Cut Flowers</p>
      </div>

      <div className="footer-details">
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
        <p>
          <span>Contact</span>
          <a href={`mailto:${shop.email}?subject=Wholesale%20flower%20inquiry`}>{shop.email}</a>
          <br />
          <i>Store: </i>
          <a href={shop.storePhoneHref}>{shop.storePhone}</a>
          <br />
          {/* The cell takes WhatsApp and SMS but not voice, so it can't be a
              tel: link. Which app opens is left to the accessible name rather
              than set in the column, where it would crowd the number. */}
          <i>Cell: </i>
          <a href={`https://wa.me/${shop.whatsappNumber}`} target="_blank" rel="noreferrer" aria-label={`${shop.ownerPhone} on WhatsApp`}>{shop.ownerPhone}</a>
        </p>
      </div>

      <div className="footer-base">
        <span>© 2026 New York Garden Flower Wholesale, Inc.</span>
      </div>
    </footer>
  );
}
