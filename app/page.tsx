import { previewFlowers } from "./catalogue-data";
import { SiteFooter, SiteHeader } from "./chrome";
import { FlowerField } from "./flower-field";
import { StoryScroll } from "./story-scroll";

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

      {/* Our Story absorbs the two bands that used to sit apart — the nav
          pointed at the first while the second, unheaded, carried the actual
          story. Each keeps its own copy, photo and layout; the section pins and
          turns from one to the other as you scroll through it. */}
      <StoryScroll>
        {/* Constant across both panels — it names the section, so it holds
            while the scenes underneath it turn over. */}
        <h2 className="story-title">Our Story</h2>

        <div className="story-panel intro-setup">
          <div className="intro-copy">
            {/* A step below the section title, and in the roman rather than the
                small-caps cut, so the two headings don't read as one voice. */}
            <h3>Direct From the Farm.<br />Closer to Your Needs.</h3>
            <div className="intro-detail">
              <p>For more than three decades, New York Garden Flower Wholesale has imported cut flowers directly and served the people who make New York&apos;s spaces and celebrations bloom, from florists and wedding planners to restaurants, hotels, and neighborhood walk-ins.</p>
            </div>
          </div>
          <div className="statement-image-wrap">
            <img className="statement-image" src="/media/our-story.webp" alt="Wrapped bunches of tulips in red, pink, orange and purple on the market floor" loading="lazy" />
          </div>
        </div>

        <div className="story-panel story-setup">
          <div className="story-image"><img src="/media/story.webp" alt="A wrapped bouquet of pink roses, gerberas and eucalyptus on a dark wood bench" loading="lazy" /></div>
          <div className="story-copy">
            <blockquote>“Flowers are perishable.<br />Trust is what lasts.”</blockquote>
            <p>We clear our own shipments, with no broker between grower and shop. Our flowers arrive from Ecuador, Colombia, Costa Rica, Mexico, Holland, and Canada.</p>
          </div>
        </div>
      </StoryScroll>

      <section className="catalogue flower-field section-pad" id="catalogue">
        <FlowerField flowers={previewFlowers} />
        <div className="field-center">
          <h2>Our Flowers</h2>
          <p className="section-note">Market prices move daily and are never posted. Call or WhatsApp for today&apos;s availability and price.</p>
          <a href="/catalogue" className="solid-button">View full catalogue</a>
        </div>
      </section>

      <section className="trade section-pad" id="services">
        <div className="trade-title"><h2>Our Services</h2></div>
        <div className="service-list">
          <article><h3>Direct Importing</h3><p>We import and clear our own shipments, removing the broker between farm and shop.</p></article>
          <article><h3>Refrigerated Delivery</h3><p>Cold-chain delivery across the New York metropolitan area and nearby Connecticut, plus pickup in Flushing.</p></article>
          <article><h3>Bilingual Service</h3><p>Practical, personal recommendations in English and Korean for buyers of every size.</p></article>
        </div>
      </section>

      <section className="contact section-pad" id="contact">
        <p className="eyebrow light">오늘의 가격과 재고를 문의하세요<br />Ask for today&apos;s price and availability</p>
        <h2>What Are You<br /><em>Celebrating Next?</em></h2>
        {/* The reach/visit/hours columns that used to sit under this live in the
            footer, which is directly beneath — they were the same three columns
            twice in one screenful. */}
        <a className="contact-button" href="https://wa.me/12018151040?text=Hello%2C%20I%27d%20like%20to%20ask%20about%20today%27s%20flowers." target="_blank" rel="noreferrer">Message on WhatsApp</a>
      </section>

      <SiteFooter home />
    </main>
  );
}
