import { previewFlowers } from "./catalogue-data";
import { Arrow, SiteFooter, SiteHeader } from "./chrome";

export default function Home() {
  return (
    <main className="home">
      <SiteHeader home />

      <section className="hero" id="top">
        <img className="hero-image" src="/media/hero.webp" alt="Buckets of freshly cut roses, lilies, tulips and chrysanthemums on the wholesale floor" fetchPriority="high" />
        <div className="hero-shade" />
        <div className="hero-copy">
          <p className="eyebrow light">Direct importer in Flushing, New York since 1990</p>
          <h1>Exceptional Flowers,<br /><em>Sourced With Care.</em></h1>
          <div className="hero-bottom">
            <p>Wholesale cut flowers, imported directly from farm to shop for florists, planners, hospitality, and walk-in buyers.</p>
            <a href="/catalogue" className="hero-button">View our catalogue</a>
          </div>
        </div>
      </section>

      <section className="intro section-pad" id="about">
        <div className="intro-copy">
          <h2>Direct From the Farm.<br />Closer to Your Needs.</h2>
          <div className="intro-detail">
            <p>We clear our own shipments, with no broker between grower and shop. Our flowers arrive from Ecuador, Colombia, Costa Rica, Mexico, Poland, and Canada.</p>
            <a className="text-link" href="#story">Our story <Arrow /></a>
          </div>
        </div>
        <div className="statement-image-wrap">
          <img className="statement-image" src="/media/our-story.webp" alt="Wrapped bunches of tulips in red, pink, orange and purple on the market floor" loading="lazy" />
          <span className="vertical-note">Selected daily, delivered fresh</span>
        </div>
      </section>

      <section className="catalogue section-pad" id="catalogue">
        <div className="section-heading">
          <h2>The Flower Edit</h2>
          <p className="section-note">Market prices move daily and are never posted. Call or WhatsApp for today&apos;s availability and price.</p>
        </div>
        <div className="flower-grid">
          {previewFlowers.map((flower) => (
            <a className="flower-card" key={flower.name} href="/catalogue">
              <div className="flower-image-wrap">{flower.image ? <img src={flower.image} alt={flower.name} /> : null}</div>
              <div className="flower-meta"><h3>{flower.name}</h3><p>{flower.group}</p></div>
            </a>
          ))}
        </div>
        <a href="/catalogue" className="solid-button">View full catalogue</a>
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
        <div className="story-image"><img src="/media/story.webp" alt="A wrapped bouquet of pink roses, gerberas and eucalyptus on a dark wood bench" loading="lazy" /></div>
        <div className="story-copy"><blockquote>“Flowers are perishable.<br />Trust is what lasts.”</blockquote><p>For more than three decades, New York Garden Flower Wholesale has imported cut flowers directly and served the people who make New York&apos;s spaces and celebrations bloom, from florists and wedding planners to restaurants, hotels, and neighborhood walk-ins.</p><p className="signature">— New York Garden Flower Wholesale, Inc.</p></div>
      </section>

      <section className="contact section-pad" id="contact">
        <p className="eyebrow light">오늘의 가격과 재고를 문의하세요<br />Ask for today&apos;s price and availability</p>
        <h2>What Are You<br /><em>Celebrating Next?</em></h2>
        <a className="contact-button" href="https://wa.me/12018151040?text=Hello%2C%20I%27d%20like%20to%20ask%20about%20today%27s%20flowers." target="_blank" rel="noreferrer">Message on WhatsApp</a>
        <div className="contact-details"><p><span>Reach Us</span><a href="tel:+17188861190">718-886-1190</a> <i>store, voice only</i><br /><a href="https://wa.me/12018151040" target="_blank" rel="noreferrer">201-815-1040</a> <i>WhatsApp or SMS</i><br /><a href="mailto:nyflowergarden@hotmail.com?subject=Wholesale%20flower%20inquiry">nyflowergarden@hotmail.com</a></p><p><span>Visit / Pickup</span><a href="https://maps.google.com/?q=171-10+39th+Ave+Flushing+NY+11358" target="_blank" rel="noreferrer">171-10 39th Ave<br />Flushing, NY 11358</a></p><p><span>Hours</span>Mon–Sat, 6 AM–2 PM<br />Sunday, 6 AM–12 PM</p></div>
      </section>

      <SiteFooter home />
    </main>
  );
}
