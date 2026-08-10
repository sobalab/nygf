import type { MetadataRoute } from "next";
import { flowers } from "./catalogue-data";
import { siteUrl } from "./site";

// The whole site, built from the same list the grid is: a variety added to
// catalogue-data.ts gets a page, a card and a line here without anyone
// remembering to come back for the third one.
//   The catalogue leads the priorities rather than the home page, because the
// variety pages are the reason this file exists — a florist searching for a
// named rose should be able to land on it directly rather than on the front
// door.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: new URL("/", siteUrl).href, changeFrequency: "monthly" as const, priority: 1 },
    { url: new URL("/catalogue", siteUrl).href, changeFrequency: "weekly" as const, priority: 0.9 },
    { url: new URL("/contact", siteUrl).href, changeFrequency: "yearly" as const, priority: 0.6 },
    ...flowers.map((flower) => ({
      url: new URL(flower.href, siteUrl).href,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
