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
      <a href={home ? "#top" : "/"} className="wordmark" aria-label="New York Garden Flower Wholesale home">
        <img className="wordmark-mark" src="/logo.svg" alt="" aria-hidden="true" />
        <span>New York Garden Flower Wholesale</span>
      </a>
      <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label={menuOpen ? "Close menu" : "Open menu"}>
        <span className="menu-icon" aria-hidden="true"><span /><span /><span /></span>
      </button>
      <nav className={menuOpen ? "nav open" : "nav"} aria-label="Main navigation">
        <a href="/catalogue" onClick={() => setMenuOpen(false)}>Catalogue</a>
        <a href={`${prefix}#about`} onClick={() => setMenuOpen(false)}>Our story</a>
        <a href={`${prefix}#services`} onClick={() => setMenuOpen(false)}>For the trade</a>
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
      <a href={home ? "#top" : "/"} className="wordmark"><span>New York Garden Flower Wholesale</span><small>INC.</small></a>
      <p>Direct-import wholesale cut flowers.</p>
      <div>
        <span>© 2026 New York Garden Flower Wholesale, Inc.</span>
        <a href={home ? "#top" : "/"}>{home ? "Back to top ↑" : "Back home ↑"}</a>
      </div>
    </footer>
  );
}
