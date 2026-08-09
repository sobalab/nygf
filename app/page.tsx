import { previewFlowers } from "./catalogue-data";
import { SiteFooter, SiteHeader } from "./chrome";
import { FlowerField } from "./flower-field";
import { Reveal } from "./reveal";
import { StoryScroll } from "./story-scroll";

export default function Home() {
  return (
    <main className="home">
      <SiteHeader home />

      <section className="hero" id="top">
        <img className="hero-image" src="/media/hero.webp" alt="Buckets of freshly cut roses, lilies, tulips and chrysanthemums on the wholesale floor" fetchPriority="high" />
        <div className="hero-shade" />
        <div className="hero-copy">
          <h1>Exceptional Flowers,<br /><em>Sourced With Care.</em></h1>
          <div className="hero-bottom">
            <p>Wholesale cut flowers, imported directly from farm to shop for florists, planners, hospitality, and walk-in buyers.</p>
            <a href="/catalogue" className="hero-button">View our catalogue</a>
          </div>
        </div>
      </section>

      <section className="catalogue flower-field section-pad" id="catalogue">
        <FlowerField flowers={previewFlowers} />
        <div className="field-center">
          <h2>Our Flowers</h2>
          <p className="section-note">Market prices move daily and are never posted. Contact us for today&apos;s availability and price.</p>
          <a href="/catalogue" className="solid-button">View full catalogue</a>
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

        {/* Both scenes take the same shape — photo left, heading and copy right —
            so the turn between them reads as one frame changing its contents
            rather than the page relaying itself. */}
        <div className="story-panel intro-setup">
          <div className="story-image"><img src="/media/our-story.webp" alt="Wrapped bunches of tulips in red, pink, orange and purple on the market floor" loading="lazy" /></div>
          <div className="story-copy">
            <h3>Direct From the Farm,<br />Closer to Your Needs.</h3>
            <p>Since 1990, New York Garden Flower Wholesale has imported cut flowers directly from Ecuador, Colombia, Costa Rica, Mexico, Holland, and Canada.</p>
          </div>
        </div>

        <div className="story-panel story-setup">
          <div className="story-image"><img src="/media/story.webp" alt="A wrapped bouquet of pink roses, gerberas and eucalyptus on a dark wood bench" loading="lazy" /></div>
          <div className="story-copy">
            <h3>Flowers Are Perishable,<br />Trust is What Lasts.</h3>
            <p>For more than three decades, we have served the people who make New York&apos;s spaces and celebrations bloom, from florists and wedding planners to restaurants, hotels, and neighborhood walk-ins.</p>
          </div>
        </div>
      </StoryScroll>

      <section className="trade section-pad" id="services">
        <div className="trade-title"><h2>Our Services</h2></div>
        {/* The cards rise into place one after another every time the band is
            scrolled to; the order is the DOM order, left to right. */}
        <Reveal className="service-list">
          <article><h3>Direct Importing</h3><p>We import and clear our own shipments, removing the broker between farm and shop.</p></article>
          <article><h3>Delivery</h3><p>We deliver across the New York metropolitan area and nearby Connecticut, with pickup options in our Flushing warehouse.</p></article>
          <article><h3>Every Occasion</h3><p>Flowers are not limited to any type of occasions, events, and needs. Inform us and we will take care of supplying.</p></article>
        </Reveal>
      </section>

      <section className="contact section-pad" id="contact">
        <h2>What Are You<br /><em>Celebrating Next?</em></h2>
        <p>Ask for today&apos;s price and availability</p>
        {/* The reach/visit/hours columns that used to sit under this live in the
            footer, which is directly beneath — they were the same three columns
            twice in one screenful. */}
        <a className="contact-button" href="https://wa.me/12018151040?text=Hello%2C%20I%27d%20like%20to%20ask%20about%20today%27s%20flowers." target="_blank" rel="noreferrer">Contact Us</a>
      </section>

      <SiteFooter home />
    </main>
  );
}
