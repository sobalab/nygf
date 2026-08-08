import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <head>
        <link rel="preload" href="/fonts/Flaviotte.otf" as="font" type="font/otf" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
