# New York Garden Flower Wholesale — business facts

Everything factual in the project, extracted so it can move to a new build.
Grouped by how much the source actually vouches for it.

---

## 1. Confirmed real

The business identity and contact details, from `src/data/siteConfig.ts`. The
old README also states hours and delivery zones are confirmed values.

| Field | Value |
| --- | --- |
| Legal name | New York Garden Flower Wholesale, Inc. |
| Wordmark | New York Garden / Flower Wholesale |
| Established | 1990 |
| Street | 171-10 39th Ave |
| City / State / ZIP | Flushing, NY 11358 |
| Store landline (voice only) | 718-886-1190 → `tel:+17188861190` |
| Owner cell (WhatsApp + SMS) | 201-815-1040 → wa `12018151040`, sms `+12018151040` |
| Email | nyflowergarden@hotmail.com |

**Hours**

| Days | Open |
| --- | --- |
| Mon to Sat | 6:00 AM to 2:00 PM |
| Sunday | 6:00 AM to 12:00 PM |

**Business model**

- Wholesale cut flowers. No e-commerce, no cart, no checkout.
- Prices move with the market daily and are never published. Buyers browse,
  then call or WhatsApp for the day's price.
- Direct importer. Clears its own shipments, no broker between farm and cooler.
- Bilingual English / Korean audience.

**Delivery and pickup**

- Delivery zones: New York metropolitan area and nearby Connecticut.
- Cold chain: refrigerated van, door to cooler.
- Pickup: at 171-10 39th Ave, Flushing, during business hours.

**Sourcing countries (6)**

Ecuador, Colombia, Costa Rica, Mexico, Holland, Canada. Importing direct since
1990.

**Who they supply**

Florists, event and wedding planners, restaurants and hotels, walk-ins and
small buyers.

---

## 2. Catalogue — 18 items

Names, Latin names and sold-by units come from the original data and were never
flagged as placeholder. Colour and season tags in the same file **were** flagged
`TODO(owner)`, so treat those as unconfirmed.

| # | Name (EN) | Name (KO) | Latin | Sold by |
| --- | --- | --- | --- | --- |
| 1 | Rose 'Freedom' | 장미 '프리덤' | Rosa hybrid | Bunch of 25 stems |
| 2 | Spray Rose 'Playa Blanca' | 스프레이 장미 '플라야 블랑카' | Rosa hybrid | Bunch of 25 stems |
| 3 | Garden Rose 'Keira' | 가든로즈 '케이라' | Rosa hybrid | Bunch of 10 stems |
| 4 | Garden Rose 'Juliet' | 가든로즈 '줄리엣' | Rosa hybrid | Bunch of 10 stems |
| 5 | Standard Carnation | 스탠다드 카네이션 | Dianthus caryophyllus | Bunch of 20 stems |
| 6 | Mini Carnation (Spray) | 미니 카네이션 (스프레이) | Dianthus caryophyllus | Bunch of 10 stems |
| 7 | Oriental Lily 'Stargazer' | 오리엔탈 백합 '스타게이저' | Lilium orientalis | Bunch of 10 stems |
| 8 | Asiatic Lily | 아시아틱 백합 | Lilium hybrid | Bunch of 10 stems |
| 9 | Hydrangea, Lavender | 수국 (라벤더) | Hydrangea macrophylla | Bunch of 5 stems |
| 10 | Hydrangea, White | 수국 (화이트) | Hydrangea macrophylla | Bunch of 5 stems |
| 11 | Eucalyptus | 유칼립투스 | Eucalyptus cinerea | Bunch of 10 stems |
| 12 | Israeli Ruscus | 이스라엘 러스커스 | Ruscus hypoglossum | Bunch of 10 stems |
| 13 | Baby's Breath | 안개꽃 | Gypsophila paniculata | Bunch of 10 stems |
| 14 | Solidago | 솔리다고 | Solidago canadensis | Bunch of 10 stems |
| 15 | Bird of Paradise | 극락조화 | Strelitzia reginae | Bunch of 5 stems |
| 16 | Anthurium | 안스리움 | Anthurium andraeanum | Bunch of 5 stems |
| 17 | Peony | 작약 | Paeonia lactiflora | Bunch of 10 stems |
| 18 | Ranunculus | 라넌큘러스 | Ranunculus asiaticus | Bunch of 10 stems |

**Taxonomy used for filtering**

- Types: rose, garden-rose, carnation, lily, hydrangea, greens-foliage, filler,
  tropical, seasonal.
- Blossom colours: white, ivory, blush, pink, red, burgundy, orange, yellow,
  lavender, purple, green, mixed.
- Seasons: year-round, spring, summer, fall, winter.

---

## 3. Flagged placeholder in the original project

Do not carry these forward as fact.

- Every catalogue item's **colour** and **season** tags (`TODO(owner)`).
- The entire **daily availability / cooler list** contents (`TODO(owner)`).
- `web3formsAccessKey` is still the literal string `YOUR_WEB3FORMS_ACCESS_KEY`.
  Nobody has signed up yet, so the contact form has never auto-emailed.

## 4. Invented by me during this session

I generated these to give a ledger layout something to print. **None of it came
from you and none of it is verified.** Discard unless you confirm it.

- A per-item **origin country** and **stem length in cm** for all 18 items.
- The **three-letter origin codes** (ECU, COL, CRI, MEX, POL, CAN).
- The **"what we bring in" note** on each of the six countries, e.g. "Ecuador:
  long-stem roses, 50 to 70cm".
- The **sample cooler list** in `src/data/availability.ts`, including notes like
  "short crop this week, 14 bunches left".

---

## 5. Infrastructure worth knowing

- Contact form was wired to **Web3Forms** (free, static-site friendly, no
  server). Sign up with nyflowergarden@hotmail.com, paste the access key, done.
  The key is public-safe and fine to commit.
- Deploy target was a static `dist/` on Netlify or Vercel. No env vars, no
  server, no database.
- Assets on disk: `public/nygf-logo.svg`, `public/favicon.svg`, and five
  reference flower photos in `public/images/flowers/` (rose, peony, sunflower,
  lily, orchid). No product photography exists for any catalogue item.
- Korean copy throughout was seed-translated, never reviewed by a native
  speaker.

---

## 6. Standing design constraint

One preference you flagged twice, worth keeping whatever the new direction is:
**never uppercase copy via CSS**, especially headings. Keep every string's
written letter case. Hierarchy through size, weight and colour instead.
