"use client";

import { useState } from "react";
import { filters, flowers, services } from "../catalogue-data";
import { Arrow, SiteFooter, SiteHeader } from "../chrome";

export default function Catalogue() {
  const [active, setActive] = useState("all");
  const visibleFlowers = active === "all" ? flowers : flowers.filter((flower) => flower.groupId === active);

  return (
    <main>
      <SiteHeader />

      <section className="page-head section-pad">
        <h1>The Flower Edit</h1>
        <p className="section-note">Our full standing selection. Market prices move daily and are never posted. Call or WhatsApp for today&apos;s availability and price.</p>
      </section>

      <section className="catalogue section-pad" id="catalogue">
        <div className="filter-row" aria-label="Filter flower catalogue">
          {filters.map((filter) => <button key={filter.id} className={active === filter.id ? "active" : ""} aria-pressed={active === filter.id} onClick={() => setActive(filter.id)}>{filter.label}</button>)}
        </div>
        <div className="flower-grid">
          {visibleFlowers.map((flower) => (
            <article className="flower-card" key={flower.name}>
              <div className="flower-image-wrap" />
              <div className="flower-meta"><h3>{flower.name}</h3><p>{flower.group}</p></div>
            </article>
          ))}
        </div>
        <a href="https://wa.me/12018151040?text=Hello%2C%20could%20you%20send%20me%20today%27s%20flower%20availability%20and%20pricing%3F" target="_blank" rel="noreferrer" className="outline-button">Ask on WhatsApp <Arrow /></a>
      </section>

      <section className="offerings section-pad">
        <h2>Services</h2>
        <div className="offerings-list">
          {services.map((service) => (
            <article className="offering" key={service}>
              <h3>{service}</h3>
              <a href="https://wa.me/12018151040?text=Hello%2C%20I%27d%20like%20to%20ask%20about%20your%20services." target="_blank" rel="noreferrer" className="text-link">Ask about this <Arrow /></a>
            </article>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
