// The filter chips, in the order they render. The six stem chips are sized so
// none of them comes back with only two or three cards, which is the failure
// this replaced — a new stem category has to be able to carry a grid before it
// earns one. Bouquets is the exception and sits last on purpose: it is the one
// chip that isn't stems by the bunch at all, so a short list under it reads as
// the whole of what is made up rather than as a category that fell short.
//   A label is display copy in two places, not one: it is the chip, and it is
// the group line printed under every card in that category. Title Case, as
// every heading on the site is — the lower-case colour that some cards add
// after it is the only part of that line set as running text.
export const categories = [
  { id: "roses", label: "Roses" },
  { id: "carnations", label: "Carnations" },
  { id: "lilies", label: "Lilies and Callas" },
  { id: "orchids", label: "Orchids and Tropicals" },
  { id: "seasonal", label: "Seasonal and Specialty" },
  { id: "greens", label: "Greens and Filler" },
  { id: "bouquets", label: "Bouquets" },
] as const;

export type CategoryId = (typeof categories)[number]["id"];

export type CatalogueItem = {
  name: string;
  // The item's own address, at /catalogue/<slug>. Written down rather than
  // derived from the name when a link is drawn: a computed slug moves the
  // moment someone corrects a spelling, and every URL a florist has saved or a
  // search engine has indexed moves with it. Correcting a name should be one
  // edit that changes what the page says, not where it lives.
  slug: string;
  // Exactly one category per item, and every item has one — this field is the
  // only place a flower's chip is decided, so adding a variety is one line here
  // and nothing in the page component.
  category: CategoryId;
  // Photography. To add one: drop the original in public/media, run
  // `npm run media` to convert it to WebP, then set the path here. An item
  // without an image falls back to a flat tile rather than breaking the grid.
  image?: string;
  // A set of frames, for a record photographed more than once. Where `image` is
  // one picture of a stem that is always the same stem, this is for the ones
  // made up to order: a bouquet is a different object every time it is tied, so
  // one frame of it is a claim the next delivery has to live up to and three is
  // closer to the truth. The card cycles them where this is set and falls back
  // to `image` where it isn't, so it stays opt-in — nothing else on the list
  // wants it.
  images?: string[];
  // Neither of these is filled in yet, and neither should be guessed — the
  // Korean names on file were seed-translated and never reviewed, and no
  // botanical name has been confirmed against what the shop actually buys. The
  // search box already reads both fields, so a buyer can type either the moment
  // the owner fills one in.
  korean?: string;
  botanical?: string;
  // The colour group a variety is bought by. Only the named roses carry one so
  // far, and they are the reason it exists: "Roses" is what the chip says, and
  // between ten of them the colour is the thing that actually tells one card
  // from the next. It reads as the second half of the card's meta line and goes
  // into the search haystack below, so typing "white" reaches Vendela and
  // Mondial. Written in the case it reads in mid-sentence, since that is the
  // only place it appears.
  colour?: string;

  // ------------------------------------------------------------------------
  // The detail page. Every field below is optional and every one of them is
  // rendered only if it is there: no empty row, no dash, no "N/A". A record
  // filled in halfway makes a shorter page, not a broken one.
  //   None of these may be filled in from general knowledge of flowers. They
  // come off the shop's own reference sheet or they stay empty — a stem length
  // or a vase life invented here is a promise the cooler has to keep.
  //   The sheet marks its own provenance per record: the packing counts are
  // either confirmed by the Colombia procurement office or they are trade
  // figures, and that distinction is carried below as `packingConfirmed`. Every
  // other field on the sheet is currently trade-sourced across the whole list,
  // which is one value for fifty-one records and so isn't stored — if the shop
  // ever confirms specs variety by variety, that is when it earns a field.
  // ------------------------------------------------------------------------
  // Two to four sentences of prose, in the shop's voice.
  description?: string;
  // Prose, not tags: what this comes in, written the way it would be said on
  // the phone. Distinct from `colour` above, which is the one-word group the
  // card is filed under.
  colours?: string;
  stemLength?: string;
  headSize?: string;
  stemsPerBunch?: string;
  stemsPerBox?: string;
  // Which of two places the two counts above came from, as the reference sheet
  // marks it: the Colombia procurement office confirmed the packing for part of
  // the list, and the rest of the numbers in the trade are figures nobody has
  // checked against what actually lands here.
  //   Only a true lets the counts print. Everything else prints the line asking
  // for them instead — a florist who plans an order around a wrong bunch count
  // has a real problem on their hands, and a missing number is far better than a
  // guessed one. No unconfirmed record carries a count at all today, so nothing
  // is currently being withheld; the gate is there for the day one arrives.
  packingConfirmed?: boolean;
  vaseLife?: string;
  care?: string;
  boughtFor?: string;
  // Bouquets only. They are finished work rather than stems, so nothing about
  // stem length, head size or packing applies to them and these two take the
  // place of that block: what tends to go into one, and how one is sold.
  contains?: string;
  soldAs?: string;
  // Hand-picked neighbours by slug, for the cases where the four that follow
  // this one in its category aren't the four worth showing. Left unset, the
  // page walks the category on its own — see relatedFlowers below.
  related?: string[];
};

// The list, and everything each page of it says. Transcribed from the owner's
// reference sheet: the prose, the counts and the neighbours are all hers, and
// nothing in here was written from general knowledge of flowers.
//   To correct one, edit the record. To add one, copy a record's shape, drop the
// photograph in public/media and run `npm run media` — the page, the card, the
// sitemap entry and the search haystack all come off this array, so there is no
// second place to remember.
//   Two things that look like omissions and aren't: a record without
// `packingConfirmed` gets the line asking for its bunch and box counts rather
// than a figure, and a bouquet carries no stem fields at all because there is no
// stem count in a made-up piece.
const items: CatalogueItem[] = [
  {
    name: "Red Rose",
    slug: "red-rose",
    category: "roses",
    image: "/media/red-rose.webp",
    packingConfirmed: true,
    description: "The standard long-stem hybrid tea in red, and the highest volume single product on any New York wholesale floor. Graded by stem length, which is the main thing separating one price from another. Bred for head size and shipping durability.",
    colours: "Red, across a range of named varieties",
    stemLength: "40, 50, 60, 70 and 80cm. 50 and 60 are the everyday grades",
    stemsPerBunch: "25",
    stemsPerBox: "Quarter box about 100. Half box 250 to 350 depending on box size",
    vaseLife: "7 to 10 days",
    care: "Cut on an angle and strip the lower foliage. Clean water, changed often. Keep away from ripening fruit.",
    boughtFor: "Retail bouquets, restaurant weekly, hotel work and sympathy arrangements. Valentine's is the largest red rose week of the year.",
    related: ["vendela", "mandala", "pink-floyd", "garden-rose"],
  },
  {
    name: "Spray Rose",
    slug: "spray-rose",
    category: "roses",
    image: "/media/spray-rose.webp",
    description: "Several smaller blooms branching off a single stem, giving a florist multiple heads for the price of one. Fills a bouquet quickly and softens a design that would look stiff with standard roses alone.",
    colours: "White, cream, blush, pink, hot pink, red, peach, apricot, yellow, lavender and bicolour",
    stemLength: "40 to 60cm, with 3 to 5 usable blooms per stem",
    vaseLife: "7 to 10 days. Smaller heads open faster than standard roses",
    care: "Cut on an angle, strip lower foliage, clean water. Remove spent blooms so the rest keep opening.",
    boughtFor: "Bridesmaid work, boutonnieres, small arrangements and retail mixed bouquets.",
    related: ["red-rose", "garden-rose", "mini-carnation"],
  },
  {
    name: "Garden Rose",
    slug: "garden-rose",
    category: "roses",
    image: "/media/garden-rose.webp",
    packingConfirmed: true,
    description: "A full cupped or rosette head with a high petal count, and often real scent. The premium rose product. Shorter lived and more fragile than a standard rose, so it is bought close to the date it is needed.",
    colours: "White, ivory, blush, pink, peach, apricot, coral, burgundy, mauve, and the toffee novelty shades",
    stemLength: "40 to 60cm. Head size matters more than length",
    stemsPerBunch: "25",
    stemsPerBox: "Quarter box about 100. Half box 250 to 350 depending on box size",
    vaseLife: "4 to 7 days",
    care: "Arrives closed and needs warmth and two to three days to open. Order ahead of the event rather than the morning of.",
    boughtFor: "Weddings and luxury event work, editorial shoots, and high-end hotel arrangements.",
    related: ["red-rose", "vendela", "spray-rose", "peony"],
  },
  // The three above are grades; these are the varieties bought by name, so they
  // sit under the same chip rather than taking one of their own.
  //   Every colour here is read off the photograph beside it rather than off a
  // variety's reputation: Mondial and Momentum are a white and a red in the
  // trade at large, and the shop's own stems are the blush and the yellow the
  // pictures show. The photograph is what a buyer is choosing from, so it wins.
  //   Which makes the three pinks a scale rather than three guesses at one word:
  // light pink, pink, hot pink, palest first. They are the only colours on the
  // list a reader has to tell apart from each other.
  //   Tinted Rose is the one with no colour of its own: it is a treatment
  // rather than a group, and the name has already said so by the time the meta
  // line would repeat it.
  {
    name: "Vendela",
    slug: "vendela",
    category: "roses",
    image: "/media/vendela.webp",
    colour: "white and cream",
    packingConfirmed: true,
    description: "Cream to ivory with a faint blush, a medium head and exceptionally clean form. One of the most specified wedding roses in the world, and the default when a warm white is wanted rather than a stark one.",
    colours: "Cream, ivory, very pale blush",
    stemLength: "40 to 70cm",
    stemsPerBunch: "25",
    stemsPerBox: "Quarter box about 100. Half box 250 to 350 depending on box size",
    vaseLife: "8 to 12 days, above average for a soft-toned rose",
    care: "Cut on an angle, clean water, cool storage. Guard petals can be left on for a softer tone or removed for a cleaner white.",
    boughtFor: "Weddings above all, plus hotel and corporate work.",
    related: ["mondial", "red-rose", "garden-rose", "mandala"],
  },
  {
    name: "Mondial",
    slug: "mondial",
    category: "roses",
    image: "/media/mondial.webp",
    colour: "light pink",
    packingConfirmed: true,
    description: "A large full head with strong, mostly thornless stems and a high petal count. Mondial carries a green cast on the outer petals at bud stage that fades as the bloom opens.",
    colours: "Ivory white with green guard petals. Pink Mondial is a separate variety in soft light pink",
    stemLength: "40 to 70cm",
    stemsPerBunch: "25, packed in two layers of 12 and 13",
    stemsPerBox: "Quarter box about 100. Half box 250 to 350 depending on box size",
    vaseLife: "8 to 12 days. Around 30 to 37 petals",
    care: "Leave the green guard petals on for a soft green tone, or remove them for a clean white. Cut and hydrate on arrival.",
    boughtFor: "Weddings, quinceañeras, sympathy work, hotel lobby arrangements and large-scale designs.",
    related: ["vendela", "mandala", "red-rose", "garden-rose"],
  },
  {
    name: "Mandala",
    slug: "mandala",
    category: "roses",
    image: "/media/mandala.webp",
    colour: "pink",
    packingConfirmed: true,
    description: "A pink standard rose with a large well-formed head and good petal count. Reliable colour and a dependable performer through the year.",
    colours: "Pink, medium to soft depending on season",
    stemLength: "50 to 70cm",
    stemsPerBunch: "25",
    stemsPerBox: "Quarter box about 100. Half box 250 to 350 depending on box size",
    vaseLife: "7 to 10 days",
    care: "Cut on an angle, strip lower foliage, clean water. Keep away from ripening fruit.",
    boughtFor: "Weddings, retail bouquets, Mother's Day and general event work.",
    related: ["pink-floyd", "vendela", "mondial", "red-rose"],
  },
  {
    name: "Momentum",
    slug: "momentum",
    category: "roses",
    image: "/media/momentum.webp",
    colour: "yellow",
    packingConfirmed: true,
    description: "A clear golden yellow with a large head on strong straight stems, bred by Dümmen Orange. Yellow is a steady year-round seller rather than a holiday spike, which makes this a useful standing item.",
    colours: "Yellow",
    stemLength: "50 to 70cm",
    stemsPerBunch: "25",
    stemsPerBox: "Quarter box about 100. Half box 250 to 350 depending on box size",
    vaseLife: "8 to 12 days",
    care: "Cut on an angle, strip lower foliage, clean water. Keep away from ripening fruit.",
    boughtFor: "Retail bouquets, birthday and celebration work, graduation season, autumn arrangements and restaurant weekly.",
    related: ["high-and-magic", "red-rose", "mandala", "tinted-rose"],
  },
  {
    name: "High & Magic",
    slug: "high-and-magic",
    category: "roses",
    image: "/media/high-and-magic.webp",
    colour: "bicolor",
    packingConfirmed: true,
    description: "A bicolour rose, yellow petals with an orange to red edge that deepens as the bloom opens. Highly recognisable and consistently popular, and one of the stronger performers in the vase.",
    colours: "Yellow with an orange or red edge",
    stemLength: "50 to 70cm",
    stemsPerBunch: "25",
    stemsPerBox: "Quarter box about 100. Half box 250 to 350 depending on box size",
    vaseLife: "8 to 12 days",
    care: "Cut on an angle, clean water. The edge colour deepens over the first few days, which is normal.",
    boughtFor: "Retail bouquets, birthday and celebration work, autumn arrangements and restaurant weekly.",
    related: ["momentum", "red-rose", "tinted-rose", "mandala"],
  },
  {
    name: "Pink Floyd",
    slug: "pink-floyd",
    category: "roses",
    image: "/media/pink-floyd.webp",
    colour: "hot pink",
    packingConfirmed: true,
    description: "Vivid hot pink to magenta with a large head. Holds its colour rather than fading toward blue, which is why designers reach for it when a saturated pink is the point.",
    colours: "Hot pink, magenta",
    stemLength: "50 to 70cm",
    stemsPerBunch: "25",
    stemsPerBox: "Quarter box about 100. Half box 250 to 350 depending on box size",
    vaseLife: "7 to 10 days",
    care: "Cut on an angle, strip lower foliage, clean water. Keep away from ripening fruit.",
    boughtFor: "Party and celebration work, retail bunches, and event design needing saturated colour.",
    related: ["mandala", "red-rose", "tinted-rose", "momentum"],
  },
  {
    name: "Tinted Rose",
    slug: "tinted-rose",
    category: "roses",
    image: "/media/tinted-rose.webp",
    packingConfirmed: true,
    description: "White roses dyed or infused with colour at the farm. A finished product rather than a grown variety, which is what makes the colour range effectively unlimited.",
    colours: "Blue, black, rainbow, metallic, glitter-tipped, and pastels not achievable naturally",
    stemLength: "50 to 70cm",
    stemsPerBunch: "25",
    stemsPerBox: "Quarter box about 100. Half box 250 to 350 depending on box size",
    vaseLife: "7 to 10 days",
    care: "Colour can transfer to hands and fabric while wet. Handle with care when arranging and keep off pale linens.",
    boughtFor: "Graduation, proms, quinceañeras, birthdays, school and team colour work, and novelty retail. A significant seasonal line in New York through May and June.",
    related: ["red-rose", "pink-floyd", "high-and-magic", "momentum"],
  },

  {
    name: "Select-grade Carnation",
    slug: "select-grade-carnation",
    category: "carnations",
    image: "/media/select-carnations.webp",
    packingConfirmed: true,
    description: "The standard single-head carnation, and the most durable common cut flower on any floor. Long lasting, inexpensive, and available in a wider colour range than anything else here. Colombia is the dominant source.",
    colours: "White, red, pink, hot pink, burgundy, peach, orange, yellow, lavender, purple, green and bicolour, plus painted and tinted",
    stemLength: "55 to 70cm",
    stemsPerBunch: "25",
    stemsPerBox: "Quarter box 300 to 450",
    vaseLife: "14 to 21 days, the longest of any common cut flower",
    care: "Very sensitive to ethylene. Keep away from ripening fruit, exhaust, smoke and dying flowers. Cut between the nodes rather than at them.",
    boughtFor: "Sympathy and funeral work, restaurant weekly where longevity matters, budget event work, and increasingly serious design work.",
    related: ["mini-carnation", "chrysanthemum", "red-rose"],
  },
  {
    name: "Mini Carnation",
    slug: "mini-carnation",
    category: "carnations",
    image: "/media/mini-carnation.webp",
    packingConfirmed: true,
    description: "A branching carnation carrying several smaller heads per stem. The same durability as the standard, in a lighter form that spreads further through an arrangement.",
    colours: "The same broad range as the standard carnation",
    stemLength: "50 to 65cm",
    stemsPerBunch: "10",
    stemsPerBox: "Quarter box about 300",
    vaseLife: "14 to 21 days",
    care: "Same ethylene sensitivity as the standard. Keep away from fruit and dying flowers.",
    boughtFor: "Filler in mixed bouquets, sympathy work, supermarket and retail bunch programs, and party work.",
    related: ["select-grade-carnation", "spray-rose", "daisy"],
  },

  {
    name: "Premium Lilies",
    slug: "premium-lilies",
    category: "lilies",
    image: "/media/premium-lilies.webp",
    packingConfirmed: true,
    description: "Top grade lily graded by bud count rather than length. A five to seven bud stem opens in sequence over about a week, which means one stem can carry an entire design.",
    colours: "White, cream, pink, hot pink, red, orange, yellow and bicolour",
    stemLength: "80 to 110cm, 5 to 7 buds",
    stemsPerBunch: "5 or 10, depending on bloom count",
    stemsPerBox: "Quarter box 80 to 100",
    vaseLife: "10 to 14 days as the buds open in sequence",
    care: "Remove the pollen anthers as each bloom opens. Pollen stains fabric permanently and shortens the life of the flower.",
    boughtFor: "Hotel lobby arrangements, large event pieces and sympathy work.",
    related: ["oriental-lily", "asiatic-lily", "hybrid-lilies"],
  },
  {
    name: "Oriental Lily",
    slug: "oriental-lily",
    category: "lilies",
    image: "/media/oriental-lilies.webp",
    packingConfirmed: true,
    description: "The fragrant lily, with wide recurved petals. Stargazer is the best known variety. The scent is strong enough that some venues welcome it and others ban it outright, so it is worth asking before specifying.",
    colours: "White, pink, hot pink and crimson, usually speckled with a pale edge",
    stemLength: "80 to 100cm, 3 to 5 buds",
    stemsPerBunch: "5 or 10, depending on bloom count",
    stemsPerBox: "Quarter box 80 to 100",
    vaseLife: "10 to 14 days",
    care: "Arrives in tight bud and opens over several days. Pull the anthers as each flower opens.",
    boughtFor: "Sympathy and funeral arrangements, church flowers, hotel work and retail bouquets. Peaks at Easter and Mother's Day.",
    related: ["premium-lilies", "asiatic-lily", "hybrid-lilies"],
  },
  {
    name: "Asiatic Lily",
    slug: "asiatic-lily",
    category: "lilies",
    image: "/media/asiatic-lilies.webp",
    packingConfirmed: true,
    description: "Upward facing, unscented, and brighter and more saturated than the Oriental. The practical choice anywhere fragrance is a problem, which covers a lot of restaurant and hospital work.",
    colours: "White, yellow, orange, red, pink and bicolour",
    stemLength: "60 to 80cm, 3 to 5 buds",
    stemsPerBunch: "5 or 10, depending on bloom count",
    stemsPerBox: "Quarter box 80 to 100",
    vaseLife: "7 to 12 days",
    care: "Remove anthers as the blooms open. Strip foliage below the waterline.",
    boughtFor: "Restaurant weekly where scent is unwelcome, hospital and office arrangements, and mixed retail bouquets.",
    related: ["oriental-lily", "premium-lilies", "hybrid-lilies"],
  },
  {
    name: "Hybrid Lilies",
    slug: "hybrid-lilies",
    category: "lilies",
    image: "/media/hybrid-lilies.webp",
    packingConfirmed: true,
    description: "Crosses such as the Oriental Trumpet, bought for scale. Very large heads on very tall stems, with some fragrance. Where height is the brief, this is the stem.",
    colours: "White, cream, yellow, pink and deep red",
    stemLength: "100 to 130cm, 4 to 7 buds",
    stemsPerBunch: "5 or 10, depending on bloom count",
    stemsPerBox: "Quarter box 80 to 100",
    vaseLife: "10 to 14 days",
    care: "Remove anthers as blooms open. Heavy heads on tall stems need a weighted or well-anchored vessel.",
    boughtFor: "Ballroom and lobby installations, and tall pedestal arrangements.",
    related: ["premium-lilies", "oriental-lily", "asiatic-lily"],
  },
  {
    name: "Calla Lilies",
    slug: "calla-lilies",
    category: "lilies",
    image: "/media/calla-lilies.webp",
    description: "A large trumpet calla with a thick fleshy stem and a sculptural line. Bought for shape rather than mass, and the reason a modern arrangement reads as architectural.",
    colours: "White, ivory, cream, blush, pink, peach, mango, yellow, orange, burgundy, near black and green",
    stemLength: "60 to 90cm with a large head",
    vaseLife: "7 to 10 days",
    care: "Stems rot easily. Use shallow clean water in a spotless vessel, change it often, and never crush or hammer the stem end.",
    boughtFor: "Modern and minimal wedding work, corporate and hotel arrangements, and sympathy pieces.",
    related: ["mini-calla-lilies", "premium-lilies", "cymbidium-orchid"],
  },
  {
    name: "Mini Calla Lilies",
    slug: "mini-calla-lilies",
    category: "lilies",
    image: "/media/mini-calla-lilies.webp",
    description: "The smaller calla, in a far wider colour range than the standard. More versatile and much more common in day to day work, especially in bridal pieces.",
    colours: "White, cream, blush, pink, hot pink, peach, mango, yellow, orange, lavender, purple, burgundy, near black, green and bicolour",
    stemLength: "40 to 60cm",
    vaseLife: "7 to 10 days",
    care: "Shallow clean water and a spotless vessel. Do not crush the stem end.",
    boughtFor: "Bridal bouquets and boutonnieres, event centerpieces, retail bouquets and corporate weekly.",
    related: ["calla-lilies", "spray-rose", "dendrobium"],
  },

  {
    name: "Cymbidium Orchid",
    slug: "cymbidium-orchid",
    category: "orchids",
    image: "/media/cymbidium-orchid.webp",
    description: "A spray of large waxy blooms on a long arching stem, sold either whole or as individual blooms in a padded box. Expensive, and extremely long lasting in return.",
    colours: "White, cream, green, yellow, pink, burgundy, chocolate, and spotted or lipped bicolours",
    stemLength: "60 to 90cm sprays carrying 8 to 14 blooms",
    vaseLife: "2 to 3 weeks on the spray",
    care: "Individual blooms hold well in water tubes. Mist lightly and keep out of direct heat.",
    boughtFor: "Luxury hotel and corporate lobby work, high-end weddings, and congratulatory opening displays, which are a real market in Flushing.",
    related: ["phalaenopsis", "dendrobium", "bird-of-paradise"],
  },
  {
    name: "Dendrobium",
    slug: "dendrobium",
    category: "orchids",
    image: "/media/dendrobium.webp",
    description: "A slim spray of small to medium orchid blooms, mostly out of Thailand. The workhorse orchid: affordable, durable and available year round.",
    colours: "White, green, lavender, purple, magenta and bicolour",
    stemLength: "40 to 60cm, 8 to 14 blooms per spray",
    vaseLife: "10 to 14 days, often longer",
    care: "Ships and rehydrates readily. Cut and place in clean water on arrival.",
    boughtFor: "Event and banquet work, tropical arrangements, restaurant weekly, and buffet and hotel displays.",
    related: ["cymbidium-orchid", "phalaenopsis", "mini-calla-lilies"],
  },
  {
    name: "Phalaenopsis (Moth Orchid)",
    slug: "phalaenopsis",
    category: "orchids",
    image: "/media/phalaenopsis.webp",
    description: "Broad flat blooms on an arching stem. Sold cut for design work and, more often in wholesale, as a potted plant.",
    colours: "White, blush, pink, magenta, yellow, spotted and striped",
    stemLength: "Cut sprays 40 to 60cm. Plants graded by stem and spike count",
    vaseLife: "2 to 3 weeks cut in tubes. Plants hold for months",
    care: "Cut stems need water tubes. Keep out of cold draughts and direct sun.",
    boughtFor: "Luxury weddings and cascading bouquets, spa and hotel styling, corporate gifting, and business opening displays.",
    related: ["cymbidium-orchid", "dendrobium"],
  },
  {
    name: "Bird of Paradise",
    slug: "bird-of-paradise",
    category: "orchids",
    image: "/media/bird-of-paradise.webp",
    description: "The tropical statement stem. One large orange and blue crane-shaped bloom, with more folded inside the bract waiting to be drawn out.",
    colours: "Orange with a blue tongue. A white and blue form exists but is uncommon",
    stemLength: "70 to 100cm",
    vaseLife: "7 to 14 days",
    care: "Do not store below 50°F, it chills and blackens easily. Blooms can be coaxed open by hand from the bract.",
    boughtFor: "Tropical and Caribbean themed events, hotel and restaurant statement pieces, large lobby arrangements and summer party work.",
    related: ["tropical-bouquet", "cymbidium-orchid", "molucella"],
  },

  {
    name: "Premium Hydrangea",
    slug: "premium-hydrangea",
    category: "seasonal",
    image: "/media/hydrangea.webp",
    packingConfirmed: true,
    description: "A large mophead on a woody stem, giving more visual coverage per stem than anything else on the floor. Sold by the single stem at premium grade, which is why event designers buy it by the box.",
    colours: "White, cream, green, antique green, blush, pink, hot pink, blue, lavender, purple and burgundy, plus the antique tones that appear late in the season",
    stemLength: "40 to 70cm",
    headSize: "Heads graded select, premium or jumbo",
    stemsPerBunch: "Sold by the single stem at premium grade",
    stemsPerBox: "Quarter box about 35",
    vaseLife: "5 to 10 days when hydrated properly",
    care: "Hydrangea drinks through the head as well as the stem. If it wilts, submerge the whole head in cool water for about thirty minutes, then recut and stand it in deep water.",
    boughtFor: "Wedding centerpieces, hotel lobby work, and event coverage where volume matters. Peaks at Mother's Day.",
    related: ["peony", "garden-rose", "premium-lilies"],
  },
  {
    name: "Tulips",
    slug: "tulips",
    category: "seasonal",
    image: "/media/tulips.webp",
    description: "A bulb flower sold in tight bud. Tulips keep growing after cutting, sometimes by several centimetres, and bend toward the light, which is either a problem or the whole charm depending on the design.",
    colours: "White, cream, yellow, orange, peach, pink, hot pink, red, purple, burgundy and bicolour. Parrot, double and fringed forms carry a premium",
    stemLength: "35 to 50cm",
    vaseLife: "5 to 7 days",
    care: "Store upright and wrapped or the stems curve. Cold water, no flower food needed. Sensitive to ethylene.",
    boughtFor: "Winter and spring retail bouquets, restaurant weekly, and event work from December through April. Valentine's and Easter.",
    related: ["ranunculus", "anemone", "peony"],
  },
  {
    name: "Sunflowers",
    slug: "sunflowers",
    category: "seasonal",
    image: "/media/sunflowers.webp",
    description: "A large daisy-form bloom on a thick stem. Sold by centre colour, dark or green, which is a real buying decision rather than a detail.",
    colours: "Golden yellow as standard, plus mahogany, bronze and pale lemon in season",
    stemLength: "50 to 80cm",
    headSize: "Head 4 to 6 inches",
    vaseLife: "6 to 10 days",
    care: "A heavy drinker, so keep the water topped up. Strip the foliage well, it fouls water quickly.",
    boughtFor: "Restaurant and cafe weekly, summer and autumn events, and rustic wedding work. Peaks June through September.",
    related: ["gerbera", "solidago", "daisy"],
  },
  {
    name: "Peony",
    slug: "peony",
    category: "seasonal",
    image: "/media/peonies.webp",
    packingConfirmed: true,
    description: "A short season, high demand flower sold in tight bud. The most anticipated stem of the spring calendar and the one most likely to sell out, so it is worth asking early.",
    colours: "White, blush, soft pink, hot pink, coral and red",
    stemLength: "50 to 70cm, buds graded by size",
    stemsPerBunch: "10",
    stemsPerBox: "80 to 120 per eighth box or quarter box",
    vaseLife: "5 to 7 days once open",
    care: "Buy in firm bud that gives slightly under the thumb, then allow two to four days in warmth to open. Cold holds them closed if you need to slow them down.",
    boughtFor: "Spring weddings above all, luxury event work and Mother's Day.",
    related: ["garden-rose", "ranunculus", "premium-hydrangea"],
  },
  {
    name: "Ranunculus",
    slug: "ranunculus",
    category: "seasonal",
    image: "/media/ranunculus.webp",
    packingConfirmed: true,
    description: "Layered tissue-paper petals on a hollow stem. It looks far more delicate than it performs, which is part of why it has become a wedding staple.",
    colours: "White, cream, blush, pink, hot pink, peach, apricot, orange, yellow, red, burgundy, purple and picotee edged",
    stemLength: "30 to 45cm",
    stemsPerBunch: "10",
    stemsPerBox: "80 to 120 per eighth box or quarter box",
    vaseLife: "5 to 7 days",
    care: "Hollow stems bruise and bend easily. Handle gently and use clean shallow water.",
    boughtFor: "Wedding and bridal work, spring event design and retail bouquets.",
    related: ["butterfly-ranunculus", "anemone", "peony", "tulips"],
  },
  {
    name: "Butterfly Ranunculus",
    slug: "butterfly-ranunculus",
    category: "seasonal",
    image: "/media/butterfly-ranunculus.webp",
    description: "A Japanese-bred type with translucent shimmering petals and several buds on each branching stem. A premium product priced well above standard ranunculus, and one buyers ask for by name.",
    colours: "Cream, blush, peach, apricot, salmon, pink, orange, red and copper",
    stemLength: "40 to 55cm, branching with 3 to 6 blooms and buds",
    vaseLife: "7 to 10 days, notably longer than standard ranunculus, and the buds keep opening",
    care: "Handle gently. Clean shallow water. The buds continue opening in the vase, so leave room around each stem.",
    boughtFor: "High-end bridal bouquets, editorial and photo work, and luxury event design.",
    related: ["ranunculus", "anemone", "garden-rose"],
  },
  {
    name: "Anemone",
    slug: "anemone",
    category: "seasonal",
    image: "/media/anemone.webp",
    description: "A flat open bloom with a dark centre on a slender stem. The contrast between the petal and the black eye is the reason designers reach for it.",
    colours: "White with a black centre is the signature. Also blush, pink, red, burgundy, purple and blue",
    stemLength: "30 to 45cm",
    vaseLife: "5 to 7 days",
    care: "A heavy drinker, so check the water daily. Blooms close in cold and dark and open again in warmth, which is normal.",
    boughtFor: "Winter and early spring weddings, moody and modern design work, and editorial.",
    related: ["ranunculus", "butterfly-ranunculus", "tulips"],
  },
  {
    name: "Sweet Pea",
    slug: "sweet-pea",
    category: "seasonal",
    image: "/media/sweet-pea.webp",
    description: "A ruffled, strongly fragrant bloom on a short delicate stem. One of the most requested wedding flowers and the most fragile thing on the floor, so it is bought for immediate use.",
    colours: "White, cream, blush, pink, lavender, purple, burgundy and bicolour",
    stemLength: "25 to 40cm, short by nature",
    vaseLife: "3 to 5 days, the shortest of anything here",
    care: "Very sensitive to ethylene. Keep well away from fruit and dying flowers, and use it the week you buy it rather than holding it.",
    boughtFor: "Bridal bouquets, luxury event work, and spring arrangements where scent is part of the brief.",
    related: ["ranunculus", "butterfly-ranunculus", "lisianthus"],
  },
  {
    name: "Lisianthus",
    slug: "lisianthus",
    category: "seasonal",
    image: "/media/lisianthus.webp",
    description: "A rose-like ruffled bloom on a branching stem, with buds that open in sequence. Excellent value, because one stem gives several usable heads over the life of the arrangement.",
    colours: "White, cream, blush, pink, hot pink, lavender, purple, apricot and picotee edged",
    stemLength: "50 to 70cm, branching with 3 to 5 blooms and buds",
    vaseLife: "7 to 14 days, among the best of the soft-looking flowers",
    care: "Strip lower foliage and use clean water. Remove spent blooms so the remaining buds keep opening.",
    boughtFor: "Weddings, hotel and corporate weekly, retail bouquets, and as a rose substitute where budget is tight.",
    related: ["garden-rose", "spray-rose", "sweet-pea"],
  },
  {
    name: "Chrysanthemum",
    slug: "chrysanthemum",
    category: "seasonal",
    image: "/media/chrysanthemum.webp",
    packingConfirmed: true,
    description: "The disbud or football mum, carrying one large head per stem. Durable, inexpensive, and the foundation of a great deal of everyday work.",
    colours: "White, cream, yellow, green, bronze, orange, pink, lavender and burgundy",
    stemLength: "60 to 80cm",
    headSize: "Head 3 to 5 inches",
    stemsPerBunch: "5 or 10",
    stemsPerBox: "Quarter box 100 to 120",
    vaseLife: "14 to 21 days",
    care: "Strip foliage below the waterline, it decays quickly and fouls the water.",
    boughtFor: "Sympathy and funeral work, autumn arrangements, budget event coverage and retail programs. Central to memorial work in several communities.",
    related: ["spider-chrysanthemum", "daisy", "select-grade-carnation"],
  },
  {
    name: "Spider Chrysanthemum",
    slug: "spider-chrysanthemum",
    category: "seasonal",
    image: "/media/spider-chrysanthemum.webp",
    packingConfirmed: true,
    description: "Long tubular petals radiating out in a loose spidery head, often hooked at the tips. A different product from the standard mum, bought for texture and drama rather than as a workhorse.",
    colours: "White, cream, yellow, green, bronze, pink, lavender and burgundy",
    stemLength: "70 to 80cm",
    headSize: "Head 5 to 7 inches",
    stemsPerBunch: "5 or 10",
    stemsPerBox: "Quarter box 100 to 120",
    vaseLife: "14 to 21 days",
    care: "Petals tangle in transit. Unpack early and let them relax before arranging. Strip foliage below the waterline.",
    boughtFor: "Modern and architectural design, sympathy work, autumn events, and East Asian ceremonial and memorial arrangements.",
    related: ["chrysanthemum", "gerbera", "daisy"],
  },
  {
    name: "Delphinium",
    slug: "delphinium",
    category: "seasonal",
    image: "/media/delphinium.webp",
    packingConfirmed: true,
    description: "A tall spike densely packed with florets. A line flower that gives height, and one of the very few sources of a true blue that has not been dyed.",
    colours: "Blue, lavender, purple, white and pale pink",
    stemLength: "70 to 110cm",
    stemsPerBunch: "5 to 10",
    stemsPerBox: "Quarter box 80 to 100",
    vaseLife: "5 to 8 days",
    care: "Shatters florets when knocked or moved, so handle gently. Sensitive to ethylene. Keep the water topped up, it drinks hard.",
    boughtFor: "Tall pedestal and lobby arrangements, garden-style wedding work, summer events, and any brief calling for real blue.",
    related: ["snapdragon", "molucella", "premium-lilies"],
  },
  // Peruvian lily by its common name, but not a true one, and the trade buys it
  // as its own line rather than off the lily list — so it sits with the other
  // year-round mainstays here rather than under the Lilies chip. Moving it is a
  // one-word edit if the shop reads it the other way.
  {
    name: "Alstroemeria",
    slug: "alstroemeria",
    category: "seasonal",
    image: "/media/alstroemeria.webp",
    packingConfirmed: true,
    description: "Also called Peruvian lily. Several trumpet-shaped florets cluster on each stem, usually with throat speckling. One of the best value stems on any floor, because the buds keep opening for a fortnight.",
    colours: "White, cream, yellow, orange, peach, pink, hot pink, red, burgundy, purple and bicolour, most with throat speckling",
    stemLength: "60 to 80cm, 4 to 6 florets per stem",
    stemsPerBunch: "10",
    vaseLife: "10 to 14 days, and the buds keep opening",
    care: "Strip the lower foliage, it yellows well before the flowers fade. The sap can irritate skin on prolonged handling.",
    boughtFor: "Retail and supermarket bunch programs, restaurant and office weekly, mixed bouquets and budget event work.",
    related: ["premium-lilies", "daisy", "select-grade-carnation"],
  },
  {
    name: "Daisy",
    slug: "daisy",
    category: "seasonal",
    image: "/media/daisies.webp",
    description: "A spray chrysanthemum in daisy form, with several small blooms on each branching stem. The cheerful, inexpensive everyday flower that goes into more mixed bunches than almost anything else.",
    colours: "White with a yellow or green centre, plus pink, lavender, yellow and bronze",
    stemLength: "55 to 70cm",
    vaseLife: "10 to 14 days",
    care: "Strip foliage below the waterline, as with all mums.",
    boughtFor: "Retail bunches, restaurant weekly, hospital and office arrangements, and party work.",
    related: ["chrysanthemum", "gerbera", "alstroemeria"],
  },
  {
    name: "Gerbera",
    slug: "gerbera",
    category: "seasonal",
    image: "/media/gerbera.webp",
    description: "A large flat daisy head on a leafless hollow stem. Bold and graphic, available in almost any colour, and handled carefully because the head is heavy and the stem is soft.",
    colours: "White, cream, yellow, orange, peach, coral, pink, hot pink, red, burgundy and bicolour. Dark centre and light centre are separate buying decisions",
    stemLength: "45 to 60cm",
    headSize: "Head 3 to 5 inches. Mini gerbera runs smaller",
    vaseLife: "5 to 10 days",
    care: "Very sensitive to bacteria. Shallow clean water in a spotless vessel, recut often. Stems bend toward the light, so turn the arrangement.",
    boughtFor: "Party and birthday work, corporate and office weekly, retail bouquets and celebration events.",
    related: ["daisy", "sunflowers", "spider-chrysanthemum"],
  },
  {
    name: "Snapdragon",
    slug: "snapdragon",
    category: "seasonal",
    image: "/media/snapdragon.webp",
    description: "A tall spike of blooms that opens from the bottom up. A line flower, giving an arrangement height and shape rather than a focal point.",
    colours: "White, cream, yellow, peach, orange, pink, hot pink, red, burgundy and lavender",
    stemLength: "70 to 100cm",
    vaseLife: "5 to 8 days",
    care: "Strongly geotropic: the tips curve upward if stored flat, so always store and transport upright. Sensitive to ethylene.",
    boughtFor: "Tall event and pedestal arrangements, garden-style wedding work and hotel lobby pieces.",
    related: ["delphinium", "molucella", "lisianthus"],
  },
  {
    name: "Molucella",
    slug: "molucella",
    category: "seasonal",
    image: "/media/molucella.webp",
    description: "Also called Bells of Ireland. A tall spike of green cup-shaped bracts with no petals at all. Pure structure and colour, used as a green line through a design.",
    colours: "Bright apple green",
    stemLength: "70 to 100cm",
    vaseLife: "7 to 14 days, and it dries well",
    care: "Stems are brittle and the bracts hide small thorns, so handle with care. Store upright.",
    boughtFor: "Tall arrangements needing green height, St Patrick's Day, and spring and summer event work.",
    related: ["snapdragon", "delphinium", "lepidium"],
  },

  {
    name: "Eucalyptus",
    slug: "eucalyptus",
    category: "greens",
    image: "/media/eucalyptus.webp",
    packingConfirmed: true,
    description: "The dominant greenery of the last decade. Silver-grey aromatic foliage, sold in several distinct forms that buyers ask for by name: silver dollar, seeded, baby blue, willow, gunnii and true blue. These are separate products rather than interchangeable options.",
    colours: "Silver-green to blue-grey. Tinted and preserved versions exist",
    stemLength: "60 to 90cm",
    stemsPerBunch: "10",
    stemsPerBox: "Varies with box size",
    vaseLife: "10 to 21 days fresh, and it dries well holding its shape",
    care: "Recut and hydrate on arrival. Strip anything sitting below the waterline.",
    boughtFor: "Wedding garlands, tablescapes and installations, hotel and restaurant weekly, and retail bouquets. The default greenery for most modern event work.",
    related: ["israeli-ruscus", "lepidium", "wax-flower"],
  },
  {
    name: "Israeli Ruscus",
    slug: "israeli-ruscus",
    category: "greens",
    image: "/media/israeli-ruscus.webp",
    packingConfirmed: true,
    description: "Stiff upright stems with glossy dark green pointed leaves. The most durable greenery on the floor and the standard base for arrangement work.",
    colours: "Deep glossy green",
    stemLength: "60 to 90cm",
    stemsPerBunch: "10",
    stemsPerBox: "About 350 per quarter box",
    vaseLife: "2 to 3 weeks and often longer",
    care: "Tolerates heat and poor water better than almost anything else. Recut on arrival.",
    boughtFor: "Structural greenery in nearly every arrangement type, sympathy and funeral work, banquet arrangements and everyday shop use.",
    related: ["eucalyptus", "solidago", "babys-breath"],
  },
  {
    name: "Baby's Breath",
    slug: "babys-breath",
    category: "greens",
    image: "/media/babys-breath.webp",
    packingConfirmed: true,
    description: "A cloud of tiny white blooms on fine branching stems. It went out of fashion, came back hard, and is now bought as a mass flower in its own right as much as a filler.",
    colours: "White as standard, plus tinted or dyed in almost any colour, and a blush form",
    stemLength: "60 to 80cm",
    stemsPerBunch: "5 to 6 stems, about 300g per bunch",
    stemsPerBox: "Quarter box about 160",
    vaseLife: "7 to 14 days, and it dries well",
    care: "There is a noticeable smell when it first rehydrates, which fades within a day. Recut and give it deep water.",
    boughtFor: "Wedding installations and mass arrangements, retail bouquets, budget event coverage and general filler.",
    related: ["solidago", "wax-flower", "statice"],
  },
  {
    name: "Solidago",
    slug: "solidago",
    category: "greens",
    image: "/media/solidago.webp",
    packingConfirmed: true,
    description: "Also called goldenrod. Feathery sprays of tiny yellow blooms. Inexpensive, durable, and one of the most used everyday fillers in mixed work.",
    colours: "Golden yellow. Tinted versions available",
    stemLength: "60 to 80cm",
    stemsPerBunch: "10",
    stemsPerBox: "Quarter box 100 to 150",
    vaseLife: "7 to 14 days, and it dries well",
    care: "Strip lower foliage and recut on arrival.",
    boughtFor: "Mixed retail bouquets, restaurant weekly, autumn arrangements and sympathy work.",
    related: ["babys-breath", "statice", "israeli-ruscus"],
  },
  {
    name: "Statice",
    slug: "statice",
    category: "greens",
    image: "/media/statice.webp",
    description: "Papery clustered blooms on a winged stem. It holds its colour when dried, which is most of the appeal and the reason it turns up in so much preserved work.",
    colours: "White, yellow, apricot, pink, lavender, purple and blue",
    stemLength: "50 to 70cm",
    vaseLife: "7 to 14 days fresh, and it dries in place without wilting",
    care: "Very forgiving. Recut on arrival and it will hold whether or not it stays in water.",
    boughtFor: "Mixed bouquets, dried and preserved arrangements, and rustic wedding work.",
    related: ["babys-breath", "solidago", "wax-flower"],
  },
  {
    name: "Wax Flower",
    slug: "wax-flower",
    category: "greens",
    image: "/media/wax-flower.webp",
    description: "Fine woody stems carrying small waxy blooms and needle foliage. Aromatic, long lasting, and a favourite filler for garden-style work.",
    colours: "White, blush, pink, hot pink, lavender and purple",
    stemLength: "50 to 70cm",
    vaseLife: "10 to 14 days",
    care: "Very durable. It drops small blooms as it ages, so an arrangement using it needs tidying.",
    boughtFor: "Wedding and garden-style work, retail bouquets, texture in mixed arrangements and boutonnieres.",
    related: ["babys-breath", "eucalyptus", "statice"],
  },
  {
    name: "Queen of Lace",
    slug: "queen-of-lace",
    category: "greens",
    image: "/media/queen-of-lace.webp",
    description: "Flat umbrella-shaped heads of tiny blooms giving an airy, wild look. It softens the edge of an arrangement in a way nothing structural can.",
    colours: "White and cream",
    stemLength: "60 to 80cm",
    vaseLife: "5 to 8 days",
    care: "The heads are delicate, so handle gently and keep it well hydrated.",
    boughtFor: "Garden-style and wild wedding design, spring and summer event work, and texture in bridal bouquets.",
    related: ["babys-breath", "wax-flower", "lepidium"],
  },
  {
    name: "Lepidium",
    slug: "lepidium",
    category: "greens",
    image: "/media/lepidium.webp",
    description: "Sold under several names including green ball and pepper grass. Branching stems of tight round green clusters, bought purely as a texture item.",
    colours: "Green, occasionally cream or tinted",
    stemLength: "60 to 80cm",
    vaseLife: "7 to 10 days",
    care: "Strip the lower foliage. Some varieties carry a peppery smell.",
    boughtFor: "Texture and filler in event work, garden-style arrangements and modern design.",
    related: ["molucella", "eucalyptus", "queen-of-lace"],
  },
  // The plume is the flower, but the hanging cut is bought to trail out of an
  // arrangement the way the rest of this chip is, so it is filed by what it does
  // rather than by what it is.
  {
    name: "Hanging Amaranthus",
    slug: "hanging-amaranthus",
    category: "greens",
    image: "/media/hanging-amaranthus.webp",
    description: "Long trailing rope-like tassels of tiny densely packed flowers, also called love lies bleeding. Bought entirely for the cascade, and one of the defining stems of the trailing bouquet look.",
    colours: "Deep red to burgundy, and bright green",
    stemLength: "60 to 90cm, with tassels trailing 30 to 60cm below",
    vaseLife: "7 to 14 days",
    care: "Drinks heavily, so keep the water topped up. Tassels tangle in transit, so hang or lay them loose to recover. It can drop small seed on surfaces.",
    boughtFor: "Cascading bridal bouquets, tablescapes and installations that need to spill over an edge, autumn arrangements and editorial design.",
    related: ["eucalyptus", "molucella", "israeli-ruscus"],
  },

  // Made up rather than sold by the stem, so they close the list: everything
  // above is what goes into one.
  //   Each of these takes three photographs rather than one, on `images` — see
  // the field's note above for why, and .flower-slide in globals.css for the
  // turn itself. The order here is the order they are shown in, so the frame
  // that best answers "what is this" belongs first: it is the one a card is
  // holding when a reader arrives, and the only one described to a screen
  // reader.
  //   Their fact block is a different shape: the reference sheet gives them
  // colours, vase life, care and what they are bought for, and nothing about
  // stems, because there is no stem count in a made-up piece.
  {
    name: "Rose Bouquet",
    slug: "rose-bouquet",
    category: "bouquets",
    images: ["/media/rose-bouquet1.webp", "/media/rose-bouquet2.webp", "/media/rose-bouquet3.webp"],
    description: "A finished bouquet built on roses, either a single colour or a graded blend, usually with a greenery collar. Bought ready to sell or ready to give.",
    colours: "Follows the rose range: red, white, pink, hot pink, yellow, lavender, bicolour and tinted",
    vaseLife: "As for roses, 7 to 10 days",
    care: "Recut on arrival and stand in clean water. Keep cool and away from ripening fruit.",
    boughtFor: "Retail resale, corporate and hotel accounts, and gift programs. Valentine's and Mother's Day drive most of the volume.",
    related: ["mixed-bouquet", "tropical-bouquet", "red-rose"],
  },
  {
    name: "Mixed Bouquet",
    slug: "mixed-bouquet",
    category: "bouquets",
    images: ["/media/mixed-bouquet1.webp", "/media/mixed-bouquet2.webp", "/media/mixed-bouquet3.webp"],
    description: "A designed blend of focal flowers, secondary blooms, filler and greenery in one finished wrapped piece. The core product of supermarket and corner-shop flower programs.",
    colours: "Sold by palette rather than by variety: brights, pastels, whites and autumn tones",
    vaseLife: "Lasts as long as its shortest-lived component",
    care: "Recut and hydrate immediately. Remove any spent stems so the rest of the bouquet keeps its life.",
    boughtFor: "Retail and grocery resale, restaurant and office weekly, event gifting and walk-in trade.",
    related: ["rose-bouquet", "tropical-bouquet", "alstroemeria"],
  },
  {
    name: "Tropical Bouquet",
    slug: "tropical-bouquet",
    category: "bouquets",
    images: ["/media/tropical-bouquet1.webp", "/media/tropical-bouquet2.webp", "/media/tropical-bouquet3.webp"],
    description: "A finished arrangement built on tropical material. Bold shapes, heavy texture and a long life, put together from whatever is strongest that week.",
    colours: "Saturated. Orange, red, hot pink, yellow and deep green",
    vaseLife: "Long, often two weeks or more",
    care: "Do not chill below 50°F. Tropicals damage at standard flower storage temperatures. Mist the foliage rather than relying on the water alone.",
    boughtFor: "Summer events, Caribbean and tropical themed parties, hotel and restaurant statement pieces, and hospitality accounts.",
    related: ["bird-of-paradise", "rose-bouquet", "mixed-bouquet"],
  },
];

// Dutch, wedding and tropical flowers are offerings, not stems sold by the
// bunch, so they live in their own section rather than the filterable grid.
// Kept in step with the order kinds the contact form offers: a buyer who reads
// about one here has to be able to pick it there.
// The photograph is the card's ground rather than a picture sitting on it, so
// it is decorative: the heading over it already names the offering, and the
// card carries no alt text for that reason. Same pipeline as the catalogue
// stems — drop the original in public/media, run `npm run media`, point here.
export const services = [
  { name: "Dutch Flowers", image: "/media/dutch-flowers.webp" },
  { name: "Wedding Flowers", image: "/media/wedding-flowers.webp" },
  { name: "Tropical Flowers", image: "/media/tropical-flowers.webp" },
];

const categoryLabels = new Map<CategoryId, string>(categories.map(({ id, label }) => [id, label]));

// One spelling for both sides of the search: lower case, and accents pulled off
// the letters they sit on, so "peonies" finds Peony's neighbours and a typed
// "e" still reaches an "é". The query runs through the same function, so the two
// strings are always compared in the same form.
function normalize(value: string) {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

export function normalizeQuery(value: string) {
  return normalize(value.trim());
}

// The haystack is built once, at module load, rather than per keystroke: name
// first, then the colour group and the Korean and botanical names if the record
// carries them.
export const flowers = items.map((item) => ({
  ...item,
  group: categoryLabels.get(item.category)!,
  href: `/catalogue/${item.slug}`,
  search: normalize([item.name, item.colour, item.korean, item.botanical].filter(Boolean).join(" ")),
}));

export type Flower = (typeof flowers)[number];

// One item per URL. A slug typed twice would quietly hand two varieties the same
// page and drop one of them out of the build, which is the kind of thing that
// goes unnoticed until a buyer follows a link to the wrong flower — so it takes
// the build down here instead, at module load, the way previewFlowers below
// asserts its own names rather than checking them.
export const flowerBySlug = new Map<string, Flower>(flowers.map((flower) => [flower.slug, flower]));
if (flowerBySlug.size !== flowers.length) {
  throw new Error("catalogue-data: two items share a slug");
}

// The cards under a detail page. A record that names its own neighbours gets
// them; the rest walk forward through their category and wrap, so each item in a
// group offers a different few rather than every rose page showing the same
// first four roses. A category smaller than the count asked for simply returns
// what it has, and a category of one returns nothing.
export function relatedFlowers(flower: Flower, count = 4) {
  if (flower.related?.length) {
    return flower.related.flatMap((slug) => {
      const match = flowerBySlug.get(slug);
      return match && match.slug !== flower.slug ? [match] : [];
    }).slice(0, count);
  }
  const siblings = flowers.filter((sibling) => sibling.category === flower.category);
  const start = siblings.findIndex((sibling) => sibling.slug === flower.slug);
  return Array.from({ length: Math.min(count, siblings.length - 1) }, (_, step) => siblings[(start + 1 + step) % siblings.length]);
}

// Where this item sits in its own category, so someone comparing roses can step
// through them without going back to the grid. No wrap: the first item has no
// previous and the last has no next, and the page renders whichever it has.
export function categoryNeighbours(flower: Flower) {
  const siblings = flowers.filter((sibling) => sibling.category === flower.category);
  const index = siblings.findIndex((sibling) => sibling.slug === flower.slug);
  return { previous: siblings[index - 1] as Flower | undefined, next: siblings[index + 1] as Flower | undefined };
}

// The home field leads with photographed stems rather than grey placeholders.
// Order matters: PLACEMENT in flower-field.tsx scatters them by index.
// These are names, so renaming an item above means renaming it here too — the
// lookup below asserts the match rather than checking it, and a miss would take
// the home page down rather than dropping one stem out of the field.
const previewNames = ["Red Rose", "Premium Hydrangea", "Premium Lilies", "Peony", "Tulips", "Ranunculus", "Sunflowers", "Calla Lilies", "Anemone"];
export const previewFlowers = previewNames.map((name) => flowers.find((flower) => flower.name === name)!);
