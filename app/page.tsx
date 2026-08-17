import { Ask } from "./ask";
import { BandBackdrop } from "./band-backdrop";
import { previewFlowers } from "./catalogue-data";
import { CutReveal } from "./cut-reveal";
import { SiteFooter, SiteHeader } from "./chrome";
import { FlowerField } from "./flower-field";
import { Reveal, RevealCut, RevealItem } from "./reveal";
import { StoryPanel, StoryScroll } from "./story-scroll";

export default function Home() {
  return (
    <main className="home">
      <BandBackdrop />
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
      {/* Every scene takes the same shape — photo left, heading and copy right —
          so each turn reads as one frame changing its contents rather than the
          page relaying itself. The numbers are where each scene is whole on the
          track: the first never arrives on it (it arrives on the approach) and
          never comes back once it has gone, the middle one both arrives and
          leaves, and the last only arrives. */}
      <StoryScroll title="Our Story">
        <StoryPanel
          index={0}
          className="intro-setup"
          image="/media/our-story.webp"
          alt="Wrapped bunches of tulips in red, pink, orange and purple on the market floor"
          copyDrift={[0, -38]}
          headingAt={[0, 0.2]}
          copyAt={[0, 0.18]}
          heading={<>Direct From the Farm,<br />Closer to Your Needs.</>}
        >
          We opened in Flushing in 1990 and started importing direct from the beginning. Today we bring flowers in from several farms located in Ecuador, Colombia, Costa Rica, Mexico, Poland, Canada, and more.
        </StoryPanel>

        <StoryPanel
          index={1}
          className="origin-setup"
          image="/media/colombia-farm.webp"
          alt="A worker walking a planted row on a Colombian flower farm with a freshly cut bunch on their shoulder"
          // The only landscape source of the three, so the portrait plate takes a
          // much narrower slice of it. Held off centre so the slice keeps the
          // figure and the row they are walking.
          objectPosition="68% center"
          copyDrift={[18.86, -27.14]}
          headingAt={[0.28, 0.54]}
          copyAt={[0.3, 0.52]}
          headingClassName="story-oneline"
          heading="Fusagasugá to Flushing."
        >
          Being a direct importer means more than skipping the middleman. We employ our own procurement staff in Colombia, based in Fusagasugá, in the Cundinamarca flower belt where most of the country&apos;s cut flowers are grown. They are at the farms, and we are on the floor in Flushing. Nobody in between.
        </StoryPanel>

        <StoryPanel
          index={2}
          className="story-setup"
          image="/media/story.webp"
          alt="A wrapped bouquet of pink roses, gerberas and eucalyptus on a dark wood bench"
          copyDrift={[26, 0]}
          headingAt={[0.62]}
          copyAt={[0.64]}
          heading={<>Flowers Are Perishable,<br />Trust is What Lasts.</>}
        >
          For more than three decades, we have served the people who make New York&apos;s spaces and celebrations bloom, from florists and wedding planners to restaurants, hotels, and neighborhood walk-ins.
        </StoryPanel>
      </StoryScroll>

      <section className="trade section-pad" id="services">
        <div className="trade-title"><h2>Our Services</h2></div>
        {/* The cards rise into place one after another every time the band is
            scrolled to; the order is the DOM order, left to right. */}
        <Reveal className="service-list">
          <RevealItem><h3>Direct Importing</h3><p>We import and clear our own shipments, removing the broker between farm and shop. Our own procurement staff work in Fusagasugá, Colombia.</p></RevealItem>
          <RevealItem><h3>Delivery</h3><p>We deliver across the New York metropolitan area and nearby Connecticut, with pickup options in our Flushing warehouse.</p></RevealItem>
          <RevealItem><h3>Every Occasion</h3><p>Flowers are not limited to any type of occasions, events, and needs. Inform us and we will take care of supplying for you.</p></RevealItem>
        </Reveal>
      </section>

      <section className="contact section-pad" id="contact">
        {/* The same cut as the hero, but this one is below the fold, so it
            waits for the band to be reached rather than for the clock — the
            reveal mark is what releases it, and dropping the mark on the way
            out is what lets it play again next time. */}
        <RevealCut className="contact-title">
          <h2>
            <CutReveal text={"What Are You\nCelebrating Next?"} splitBy="characters" emphasizeFrom={1} />
          </h2>
        </RevealCut>
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
