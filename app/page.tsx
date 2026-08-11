import { Ask } from "./ask";
import { previewFlowers } from "./catalogue-data";
import { CutReveal } from "./cut-reveal";
import { SiteFooter, SiteHeader } from "./chrome";
import { FlowerField } from "./flower-field";
import { Reveal } from "./reveal";
import { SectionSettle } from "./section-settle";
import { StoryScroll } from "./story-scroll";

export default function Home() {
  return (
    <main className="home">
      {/* Finishes the last of a scroll onto whichever band it was heading for,
          so each one reads as a stop. Renders nothing. */}
      <SectionSettle />
      <SiteHeader home />

      <section className="hero" id="top">
        <img className="hero-image" src="/media/hero.webp" alt="Buckets of freshly cut roses, lilies, tulips and chrysanthemums on the wholesale floor" fetchPriority="high" />
        <div className="hero-shade" />
        <div className="hero-copy">
          {/* One string, not two lines and a <br>: the stagger is numbered
              across the whole heading, so carrying the break inside the text is
              what keeps the second line queueing behind the first instead of
              starting its own run. The italic survives the cut through
              emphasizeFrom, which sets that line in <em> as the markup did. */}
          <h1>
            <CutReveal
              text={"Exceptional Flowers,\nSourced With Care."}
              splitBy="characters"
              emphasizeFrom={1}
              delay="var(--hero-start)"
            />
          </h1>
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
        {/* Constant across all three panels — it names the section, so it holds
            while the scenes underneath it turn over. */}
        <h2 className="story-title">Our Story</h2>

        {/* Every scene takes the same shape — photo left, heading and copy right —
            so each turn reads as one frame changing its contents rather than the
            page relaying itself. */}
        <div className="story-panel intro-setup">
          <div className="story-image"><img src="/media/our-story.webp" alt="Wrapped bunches of tulips in red, pink, orange and purple on the market floor" loading="lazy" /></div>
          <div className="story-copy">
            <h3>Direct From the Farm,<br />Closer to Your Needs.</h3>
            <p>We opened in Flushing in 1990 and started importing direct from the beginning. Today we bring flowers in from Ecuador, Colombia, Costa Rica, Mexico, Poland and Canada.</p>
          </div>
        </div>

        <div className="story-panel origin-setup">
          <div className="story-image"><img src="/media/colombia-farm.webp" alt="A worker walking a planted row on a Colombian flower farm with a freshly cut bunch on their shoulder" loading="lazy" /></div>
          <div className="story-copy">
            <h3 className="story-oneline">Fusagasugá to Flushing.</h3>
            <p>Being a direct importer means more than skipping the middleman. We employ our own procurement staff in Colombia, based in Fusagasugá, in the Cundinamarca flower belt where most of the country&apos;s cut flowers are grown. They are at the farms, and we are on the floor in Flushing. Nobody in between.</p>
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
          <article><h3>Direct Importing</h3><p>We import and clear our own shipments, removing the broker between farm and shop. Our own procurement staff work in Fusagasugá, Colombia.</p></article>
          <article><h3>Delivery</h3><p>We deliver across the New York metropolitan area and nearby Connecticut, with pickup options in our Flushing warehouse.</p></article>
          <article><h3>Every Occasion</h3><p>Flowers are not limited to any type of occasions, events, and needs. Inform us and we will take care of supplying for you.</p></article>
        </Reveal>
      </section>

      <section className="contact section-pad" id="contact">
        {/* The same cut as the hero, but this one is below the fold, so it
            waits for the band to be reached rather than for the clock — the
            reveal mark is what releases it, and dropping the mark on the way
            out is what lets it play again next time. */}
        <Reveal className="contact-title">
          <h2>
            <CutReveal text={"What Are You\nCelebrating Next?"} splitBy="characters" emphasizeFrom={1} />
          </h2>
        </Reveal>
        <p>Ask for today&apos;s price and availability.</p>
        {/* The reach/visit/hours columns that used to sit under this live in the
            footer, which is directly beneath — they were the same three columns
            twice in one screenful. */}
        <Ask className="contact-button" message="Hello, I'd like to ask about today's flowers." inquiry="/contact">Contact Us</Ask>
      </section>

      <SiteFooter home />
    </main>
  );
}
