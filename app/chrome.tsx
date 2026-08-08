"use client";

import { useState } from "react";

export function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

export function SiteHeader({ home = false }: { home?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const prefix = home ? "" : "/";

  return (
    <header className="site-header">
      <a href={home ? "#top" : "/"} className="wordmark" aria-label="New York Garden Flower Wholesale home">New York Garden <i>/ Flower Wholesale</i><small>Est. 1990</small></a>
      <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label="Toggle menu">{menuOpen ? "Close" : "Menu"}</button>
      <nav className={menuOpen ? "nav open" : "nav"} aria-label="Main navigation">
        <a href="/catalogue" onClick={() => setMenuOpen(false)}>Catalogue</a>
        <a href={`${prefix}#about`} onClick={() => setMenuOpen(false)}>Our story</a>
        <a href={`${prefix}#services`} onClick={() => setMenuOpen(false)}>For the trade</a>
      </nav>
      <a className="header-cta" href="https://wa.me/12018151040?text=Hello%2C%20I%27d%20like%20to%20ask%20about%20today%27s%20flower%20availability." target="_blank" rel="noreferrer">Today&apos;s availability</a>
    </header>
  );
}

export function SiteFooter({ home = false }: { home?: boolean }) {
  return (
    <footer>
      <a href={home ? "#top" : "/"} className="wordmark">New York Garden <i>/ Flower Wholesale</i><small>Est. 1990</small></a>
      <p>Direct-import wholesale cut flowers.</p>
      <div>
        <span>© 2026 New York Garden Flower Wholesale, Inc.</span>
        <a href={home ? "#top" : "/"}>{home ? "Back to top ↑" : "Back home ↑"}</a>
      </div>
    </footer>
  );
}
