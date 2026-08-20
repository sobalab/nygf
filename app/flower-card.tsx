import type { CSSProperties } from "react";
import type { Flower } from "./catalogue-data";

// One card, drawn the same way in both places it appears: the catalogue grid and
// the row of neighbours under a variety page. It was inline in the grid until
// the detail pages wanted the same object, and a second copy of it is how the
// two would drift apart.
//   The whole card is the link, not the name inside it — a photograph the size
// of this one is the thing a reader aims at, and a title-only target on a grid
// of stems is a target most people miss.
export function FlowerCard({ flower }: { flower: Flower }) {
  // One field for both cases, so the markup below doesn't branch: a record with
  // a set of frames hands over all of them, a record with one hands over the
  // one, and a record with neither hands over nothing and keeps its flat tile.
  const frames = flower.images ?? (flower.image ? [flower.image] : []);

  return (
    <a className="flower-card" href={flower.href}>
      {/* The photographs are decorative here, and that is a consequence of the
          card becoming a link: the link's name is built from everything inside
          it, so an alt on the plate would have a screen reader say the variety's
          name twice before it reached the colour. The heading below is the name,
          and the descriptive alt lives on the detail page's own photograph,
          which is where an image search lands anyway. */}
      <div className="flower-image-wrap">
        {frames.map((src, frame) => (
          <img
            key={src}
            src={src}
            alt=""
            loading="lazy"
            className={frames.length > 1 ? "flower-slide" : undefined}
            style={frames.length > 1 ? ({ "--i": frame } as CSSProperties) : undefined}
          />
        ))}
      </div>
      {/* The chip's own label, and only that. The category stays said whatever
          else is on the card: a search crosses the chips, so a card found by
          name has to place itself without one being pressed.
            The colour used to follow it here. It came off once the varieties
          started carrying more than one — "Standard Roses, orange, pink and
          bicolour" is three lines under a card two to a phone screen, and it
          told a reader what they are already looking at. The colour is still on
          the record, still what the chips filter on and still in the search
          haystack; it just isn't printed under the photograph of itself. */}
      <div className="flower-meta"><h3>{flower.name}</h3><p>{flower.group}</p></div>
    </a>
  );
}
