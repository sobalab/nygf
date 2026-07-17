# Catalog photos

Drop real photos here to replace the placeholders on the Catalogue cards.

**Shot style**

- Single stem or a single bunch, shot against a plain, light/neutral ground
  (paper, seamless, or a plain wall — nothing busy behind the flower).
- Soft, even lighting — no hard flash shadows.
- Aspect ratio ~4:5 (portrait). The card frame crops to 4:5 with `object-fit:
  cover`, so compose with some breathing room around the stem.
- No illustrations, no stock photography with people/props — just the flower.

**Wiring a photo up**

1. Save the photo here, named to match the item, e.g. `rose-freedom.jpg`.
2. Open `src/data/catalog.ts` and set that item's `image` field to
   `/images/catalog/rose-freedom.jpg`.
3. That's it — no other code changes. Until a file exists at that path, the
   card automatically falls back to a plain placeholder showing the item's
   Latin name.
