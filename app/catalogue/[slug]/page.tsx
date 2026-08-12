import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Ask } from "../../ask";
import { categoryNeighbours, flowerBySlug, flowers, relatedFlowers, type Flower } from "../../catalogue-data";
import { SiteFooter, SiteHeader } from "../../chrome";
import { FlowerCard } from "../../flower-card";
import { shop } from "../../site";

// Every variety is a real page rather than a panel over the grid: these are
// meant to be sent to a buyer, kept in a tab and found from a search for
// "wholesale garden roses queens", and none of those survive a modal.
export function generateStaticParams() {
  return flowers.map((flower) => ({ slug: flower.slug }));
}

// The list is fixed and known at build time, so a slug that isn't on it is a
// typo or a stale link rather than something to render on demand.
export const dynamicParams = false;

// Bouquets are finished work rather than stems, so nothing about stem length,
// head size or packing applies to them and half this file branches on it. One
// predicate, named, so the reason reads at every branch.
function isBouquet(flower: Flower) {
  return flower.category === "bouquets";
}

// The group as it reads mid-sentence, for alt text and the fallback meta
// description. The labels are Title Case because they are chips and headings
// everywhere else; running text is the one place they aren't.
function groupPhrase(flower: Flower) {
  return flower.group.toLowerCase();
}

// Descriptive rather than a second printing of the name: the name is already the
// h1 directly beside it, so an alt that only repeats it tells a screen reader
// nothing it doesn't have and gives an image search nothing to file under.
function photoAlt(flower: Flower, frame: number) {
  // Every frame after the first is the same subject again, and nothing is said
  // in one that the lead frame doesn't already say — three descriptions of a
  // bouquet would have a screen reader read its name three times over for one
  // page. The card in the grid takes the same line.
  if (frame > 0) return "";
  if (isBouquet(flower)) return `${flower.name}, a finished cut flower bouquet made up by New York Garden Flower Wholesale in Flushing, New York.`;
  const colour = flower.colour ? `${flower.colour}, ` : "";
  return `${flower.name}, ${colour}wholesale cut ${groupPhrase(flower)} at New York Garden Flower Wholesale in Flushing, New York.`;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const flower = flowerBySlug.get(slug);
  if (!flower) return {};

  const title = `${flower.name}, Wholesale ${flower.group} | New York Garden Flower Wholesale`;
  // The owner's own sentences where the record carries them; otherwise a line
  // built from what the record already knows for certain. Nothing here reaches
  // for a fact the data file doesn't hold.
  const description =
    flower.description ??
    `${flower.name}, wholesale ${groupPhrase(flower)} from New York Garden Flower Wholesale, a direct importer in Flushing, New York. Call the store or message on WhatsApp for the day's availability and pricing.`;
  const photo = flower.images?.[0] ?? flower.image;

  return {
    title,
    description,
    // Absolute against metadataBase, which the root layout sets from the
    // deployment's own domain.
    alternates: { canonical: flower.href },
    openGraph: {
      title,
      description,
      type: "website",
      url: flower.href,
      images: photo ? [{ url: photo, alt: photoAlt(flower, 0) }] : undefined,
    },
    twitter: { card: "summary_large_image", title, description, images: photo ? [photo] : undefined },
  };
  // No Product schema. These pages carry no price and nothing on them can be
  // bought online, so the two fields the markup exists to expose would both have
  // to be invented — and a made-up price on a shop whose whole model is that
  // prices move daily is worse than no markup at all.
}

// A row prints only if the record has the value. There is no empty state for a
// fact: a dash or an "N/A" beside "Vase life" reads as a fact about the flower
// rather than a gap in the sheet, and most of this list is only partly filled in.
function Fact({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </>
  );
}

function Note({ heading, body }: { heading: string; body?: string }) {
  if (!body) return null;
  return (
    <div className="item-note">
      <h2>{heading}</h2>
      <p>{body}</p>
    </div>
  );
}

export default async function FlowerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const flower = flowerBySlug.get(slug);
  if (!flower) notFound();

  const bouquet = isBouquet(flower);
  const frames = flower.images ?? (flower.image ? [flower.image] : []);
  const related = relatedFlowers(flower);
  const { previous, next } = categoryNeighbours(flower);

  // Same shape as the catalogue's own ask, narrowed to the one variety the
  // reader is looking at, so whichever way they answer it — the form or the
  // thread — the shop already knows what is being asked about.
  const ask = `Hello, could you tell me about availability and pricing for ${flower.name}?`;

  // The counts print only where the Colombia office confirmed them. Everywhere
  // else the slot they would have taken says so plainly: a florist who plans an
  // order around a wrong bunch count has a real problem, and the shop can answer
  // in a sentence on the phone.
  const packing = flower.packingConfirmed
    ? { bunch: flower.stemsPerBunch, box: flower.stemsPerBox }
    : { bunch: undefined, box: undefined };
  const facts = bouquet
    ? [flower.contains, flower.colours, flower.soldAs, flower.vaseLife]
    : [flower.colours, flower.stemLength, flower.headSize, packing.bunch, packing.box, flower.vaseLife];
  const hasFacts = facts.some(Boolean);
  const asksForPacking = !bouquet && !flower.packingConfirmed;

  return (
    <main>
      <SiteHeader />

      {/* A record with no photograph yet loses the column rather than keeping an
          empty one: the grid card can fall back to a flat tile at its own size,
          but the same tile here is a grey rectangle half the page tall, which
          reads as a broken image rather than as a picture nobody has taken. The
          copy takes the width instead, capped to a measure. */}
      <article className={frames.length > 0 ? "item section-pad" : "item item-bare section-pad"}>
        {/* Photo first in the source as well as on screen, so the stacked phone
            order falls out of the document rather than out of a reordering
            property a screen reader wouldn't follow. */}
        {frames.length > 0 ? (
          <div className="item-photo">
            <img src={frames[0]} alt={photoAlt(flower, 0)} />
            {/* Bouquets are made up to order, so one frame of one is a claim the
                next delivery has to live up to. The rest of the set sits under
                the lead frame as a small gallery rather than turning over on its
                own the way the card does: a reader who came here to look at it
                should be able to look at all of it at once. */}
            {frames.length > 1 ? (
              <div className="item-gallery">
                {frames.slice(1).map((src, index) => (
                  <img key={src} src={src} alt={photoAlt(flower, index + 1)} loading="lazy" />
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="item-info">
          {/* Back to the grid with the chip for this category already pressed —
              /catalogue reads the hash on arrival. The category is named here
              rather than sitting above the heading as a label of its own. */}
          <a className="item-back" href={`/catalogue#${flower.category}`}>
            <span aria-hidden="true">←</span> Back to {flower.group}
          </a>

          <h1>{flower.name}</h1>

          {flower.description ? <p className="item-lede">{flower.description}</p> : null}

          {hasFacts || asksForPacking ? (
            <div className="item-facts">
              {hasFacts ? (
                <dl>
                  {bouquet ? (
                    <>
                      <Fact label="What's In It" value={flower.contains} />
                      <Fact label="Colours" value={flower.colours} />
                      <Fact label="How It's Sold" value={flower.soldAs} />
                      <Fact label="Vase Life" value={flower.vaseLife} />
                    </>
                  ) : (
                    <>
                      <Fact label="Colours" value={flower.colours} />
                      <Fact label="Stem Length" value={flower.stemLength} />
                      <Fact label="Head Size" value={flower.headSize} />
                      <Fact label="Stems per Bunch" value={packing.bunch} />
                      <Fact label="Stems per Box" value={packing.box} />
                      <Fact label="Vase Life" value={flower.vaseLife} />
                    </>
                  )}
                </dl>
              ) : null}
              {asksForPacking ? <p className="item-packing">Ask for bunch and box counts.</p> : null}
            </div>
          ) : null}

          <Note heading="Care" body={flower.care} />
          <Note heading="Usually Bought For" body={flower.boughtFor} />

          {/* The point of the page. Prices move with the market daily and are
              never posted, so there is nothing here to add to an order — every
              way forward from this page is a person answering. */}
          <div className="item-actions">
            <Ask className="item-action" message={ask} inquiry={`/contact?about=${encodeURIComponent(flower.name)}`}>
              Ask about {flower.name}
            </Ask>
            <a className="item-action item-action-quiet" href={shop.storePhoneHref}>
              Call {shop.storePhone}
            </a>
          </div>
        </div>
      </article>

      {related.length > 0 || previous || next ? (
        <section className="item-related section-pad">
          {related.length > 0 ? (
            <>
              {/* Not "More Roses": the sheet's neighbours cross the chips on
                  purpose — Garden Rose points at Peony, Bird of Paradise at the
                  Tropical Bouquet — because what a buyer wants beside a stem
                  isn't always filed with it. The prev/next pair below is the one
                  that stays inside the category. */}
              <h2>More From the Catalogue</h2>
              <div className="flower-grid">
                {related.map((neighbour) => (
                  <FlowerCard key={neighbour.slug} flower={neighbour} />
                ))}
              </div>
            </>
          ) : null}

          {/* Straight through the category, so someone comparing roses can keep
              moving without going back to the grid and finding their place in it
              again. No wrap: the first has no previous and the last no next. */}
          {previous || next ? (
            <nav className="item-steps" aria-label={`${flower.group}, previous and next`}>
              {previous ? (
                <a className="item-step" href={previous.href}>
                  <span className="item-step-label"><span aria-hidden="true">←</span> Previous</span>
                  <span className="item-step-name">{previous.name}</span>
                </a>
              ) : null}
              {next ? (
                <a className="item-step item-step-next" href={next.href}>
                  <span className="item-step-label">Next <span aria-hidden="true">→</span></span>
                  <span className="item-step-name">{next.name}</span>
                </a>
              ) : null}
            </nav>
          ) : null}
        </section>
      ) : null}

      <SiteFooter />
    </main>
  );
}
