import type { Metadata } from "next";
import "./globals.css";
import { Splash, splashScript } from "./splash";

// Resolved at build time so every route stays static. Vercel sets
// VERCEL_PROJECT_PRODUCTION_URL to the production domain (no protocol) on every
// deployment, so preview builds still point OG tags at the live site. Set
// NEXT_PUBLIC_SITE_URL once a custom domain is attached.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

const title = "New York Garden Flower Wholesale — Direct Importer Since 1990";
const description = "Direct-import wholesale cut flowers in Flushing, NY, with refrigerated delivery across the New York metropolitan area and nearby Connecticut.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  openGraph: { title, description, type: "website", images: [{ url: "/og.png", width: 1200, height: 630, alt: "New York Garden Flower Wholesale — Direct importer since 1990." }] },
  twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // The head script stamps data-splash on this element before hydration, so
    // the live DOM is deliberately a step ahead of the JSX. Suppression stops
    // at <html>'s own attributes; everything below it still gets checked.
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preload" href="/fonts/Baskervville%5Bwght%5D.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        {/* The splash is the first paint, and it is set entirely in the small-caps
            cut, so that file is on the critical path ahead of the roman. */}
        <link rel="preload" href="/fonts/BaskervvilleSC%5Bwght%5D.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        {/* Runs before the body paints, so a return visit never flashes the
            splash it has already sat through. */}
        <script dangerouslySetInnerHTML={{ __html: splashScript }} />
      </head>
      <body>
        <Splash />
        {children}
      </body>
    </html>
  );
}
