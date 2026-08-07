"use client";

import { useState } from "react";

const flowers = [
  { name: "Ranunculus", color: "Buttercream", length: "40 cm", group: "Seasonal", image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1000&q=88" },
  { name: "Garden Rose", color: "Quicksand", length: "50 cm", group: "Roses", image: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1000&q=88" },
  { name: "Lisianthus", color: "White", length: "70 cm", group: "Classics", image: "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=1000&q=88" },
  { name: "Delphinium", color: "Sky blue", length: "90 cm", group: "Classics", image: "https://images.unsplash.com/photo-1469259943454-aa100abba749?auto=format&fit=crop&w=1000&q=88" },
  { name: "Anemone", color: "Panda", length: "35 cm", group: "Seasonal", image: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1000&q=88" },
  { name: "Spray Rose", color: "Blush", length: "50 cm", group: "Roses", image: "https://images.unsplash.com/photo-1562690868-60bbe7293e94?auto=format&fit=crop&w=1000&q=88" },
];

const categories = ["All flowers", "Roses", "Classics", "Seasonal"];

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

export default function Home() {
  const [active, setActive] = useState("All flowers");
  const [menuOpen, setMenuOpen] = useState(false);
  const visibleFlowers = active === "All flowers" ? flowers : flowers.filter((flower) => flower.group === active);

  return (
    <main>
      <header className="site-header">
        <a href="#top" className="wordmark" aria-label="New York Garden Flower Wholesale home">New York Garden <i>/ Flower Wholesale</i><small>Est. 1990</small></a>
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label="Toggle menu">{menuOpen ? "Close" : "Menu"}</button>
        <nav className={menuOpen ? "nav open" : "nav"} aria-label="Main navigation">
          <a href="#catalogue" onClick={() => setMenuOpen(false)}>Catalogue</a>
          <a href="#about" onClick={() => setMenuOpen(false)}>Our story</a>
          <a href="#services" onClick={() => setMenuOpen(false)}>For the trade</a>
        </nav>
        <a className="header-cta" href="https://wa.me/12018151040?text=Hello%2C%20I%27d%20like%20to%20ask%20about%20today%27s%20flower%20availability." target="_blank" rel="noreferrer">Today&apos;s availability <Arrow /></a>
      </header>

      <section className="hero" id="top">
        <img className="hero-image" src="https://images.unsplash.com/photo-1487412912498-0447578fcca8?auto=format&fit=crop&w=2200&q=90" alt="A quiet arrangement of soft seasonal flowers" />
        <div className="hero-shade" />
        <div className="hero-copy">
          <p className="eyebrow light">Direct importer in Flushing, New York since 1990</p>
          <h1>Exceptional Flowers,<br /><em>Chosen With Care.</em></h1>
          <div className="hero-bottom">
            <p>Wholesale cut flowers, imported directly from farm to shop for florists, planners, hospitality, and walk-in buyers.</p>
            <a href="#catalogue" className="circle-link" aria-label="Explore the catalogue">Explore<br />the collection <span>↓</span></a>
          </div>
        </div>
      </section>

      <section className="intro section-pad" id="about">
        <div className="intro-copy">
          <h2>Direct From the Farm.<br />Closer to Your Work.</h2>
          <div className="intro-detail">
            <p>We clear our own shipments, with no broker between grower and shop. Our flowers arrive from Ecuador, Colombia, Costa Rica, Mexico, Poland, and Canada.</p>
            <a className="text-link" href="#story">Our story <Arrow /></a>
          </div>
        </div>
        <div className="statement-image-wrap">
          <img className="statement-image" src="https://images.unsplash.com/photo-1455659817273-f96807779a8a?auto=format&fit=crop&w=1800&q=90" alt="Fresh flower stems arranged in a workroom" />
          <span className="vertical-note">Selected daily, delivered fresh</span>
        </div>
      </section>

      <section className="catalogue section-pad" id="catalogue">
        <div className="section-heading">
          <h2>The Flower Edit</h2>
          <p className="section-note">Browse a sample of our changing selection. Market prices move daily and are never posted—call or WhatsApp for today&apos;s availability and price.</p>
        </div>
        <div className="filter-row" aria-label="Filter flower catalogue">
          {categories.map((category) => <button key={category} className={active === category ? "active" : ""} onClick={() => setActive(category)}>{category}</button>)}
        </div>
        <div className="flower-grid">
          {visibleFlowers.map((flower, index) => (
            <article className="flower-card" key={flower.name}>
              <div className="flower-image-wrap"><img src={flower.image} alt={`${flower.color} ${flower.name}`} /></div>
              <div className="flower-meta"><h3>{flower.name}</h3><p>{flower.color}<br />{flower.length}</p></div>
            </article>
          ))}
        </div>
        <a href="https://wa.me/12018151040?text=Hello%2C%20could%20you%20send%20me%20today%27s%20flower%20availability%20and%20pricing%3F" target="_blank" rel="noreferrer" className="outline-button">Ask on WhatsApp <Arrow /></a>
      </section>

      <section className="trade section-pad" id="services">
        <div className="trade-title"><h2>Built for the Way<br /><em>You Work.</em></h2></div>
        <div className="service-list">
          <article><h3>Direct Importing</h3><p>We import and clear our own shipments, removing the broker between farm and shop.</p></article>
          <article><h3>Refrigerated Delivery</h3><p>Cold-chain delivery across the New York metropolitan area and nearby Connecticut, plus pickup in Flushing.</p></article>
          <article><h3>Bilingual Service</h3><p>Practical, personal recommendations in English and Korean for buyers of every size.</p></article>
        </div>
      </section>

      <section className="story section-pad" id="story">
        <div className="story-image"><img src="https://images.unsplash.com/photo-1487070183336-b863922373d4?auto=format&fit=crop&w=1500&q=90" alt="Florist carefully preparing flowers by hand" /></div>
        <div className="story-copy"><blockquote>“Flowers are perishable.<br />Trust is what lasts.”</blockquote><p>For more than three decades, New York Garden Flower Wholesale has imported cut flowers directly and served the people who make New York&apos;s spaces and celebrations bloom—from florists and wedding planners to restaurants, hotels, and neighborhood walk-ins.</p><p className="signature">— New York Garden Flower Wholesale, Inc.</p></div>
      </section>

      <section className="contact section-pad" id="contact">
        <p className="eyebrow light">오늘의 가격과 재고를 문의하세요<br />Ask for today&apos;s price and availability</p>
        <h2>What Are You<br /><em>Making Next?</em></h2>
        <a className="contact-button" href="https://wa.me/12018151040?text=Hello%2C%20I%27d%20like%20to%20ask%20about%20today%27s%20flowers." target="_blank" rel="noreferrer">Message on WhatsApp <Arrow /></a>
        <div className="contact-details"><p><span>Store phone (voice only)</span><a href="tel:+17188861190">718-886-1190</a></p><p><span>Owner (WhatsApp or SMS)</span><a href="https://wa.me/12018151040" target="_blank" rel="noreferrer">201-815-1040</a><br /><a href="sms:+12018151040">Send SMS</a></p><p><span>Visit / Pickup</span><a href="https://maps.google.com/?q=171-10+39th+Ave+Flushing+NY+11358" target="_blank" rel="noreferrer">171-10 39th Ave<br />Flushing, NY 11358</a></p><p><span>Hours</span>Mon–Sat, 6 AM–2 PM<br />Sunday, 6 AM–12 PM</p></div>
        <a className="email-link" href="mailto:nyflowergarden@hotmail.com?subject=Wholesale%20flower%20inquiry">nyflowergarden@hotmail.com</a>
      </section>

      <footer><a href="#top" className="wordmark">New York Garden <i>/ Flower Wholesale</i><small>Est. 1990</small></a><p>Direct-import wholesale cut flowers.</p><div><span>© 2026 New York Garden Flower Wholesale, Inc.</span><a href="#top">Back to top ↑</a></div></footer>
    </main>
  );
}

