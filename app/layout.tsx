import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const incoming = await headers();
  const host = incoming.get("x-forwarded-host") ?? incoming.get("host") ?? "localhost:3000";
  const protocol = incoming.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const metadataBase = new URL(`${protocol}://${host}`);
  const title = "New York Garden Flower Wholesale — Direct Importer Since 1990";
  const description = "Direct-import wholesale cut flowers in Flushing, NY, with refrigerated delivery across the New York metropolitan area and nearby Connecticut.";

  return {
    metadataBase,
    title,
    description,
    openGraph: { title, description, type: "website", images: [{ url: "/og.png", width: 1200, height: 630, alt: "New York Garden Flower Wholesale — Direct importer since 1990." }] },
    twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
