import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const siteUrl = "https://fusemosaic.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "FuseMosaic — Free Fuse Bead Patterns & Mosaic Art", template: "%s | FuseMosaic" },
  description: "Discover free printable fuse bead patterns, Perler bead ideas, color guides and modern mosaic art projects.",
  applicationName: "FuseMosaic",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "FuseMosaic",
    url: siteUrl,
    title: "FuseMosaic — Free Fuse Bead Patterns & Mosaic Art",
    description: "A modern library of free printable fuse bead patterns and mosaic art.",
  },
  twitter: { card: "summary_large_image", title: "FuseMosaic", description: "Free fuse bead patterns and mosaic art." },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#f1ede3" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <SiteHeader />
        <main id="main-content">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
