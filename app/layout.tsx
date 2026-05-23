import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mistrihub.in";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "MistriHub - Find trusted local workers in India",
    template: "%s | MistriHub"
  },
  description:
    "Find trusted electricians, plumbers, drivers, carpenters, mechanics, painters, AC repair technicians, helpers, labourers, and masons near you in India.",
  keywords: [
    "MistriHub",
    "local workers India",
    "electrician near me",
    "plumber near me",
    "mason near me",
    "helper labour near me",
    "AC repair near me"
  ],
  alternates: {
    canonical: siteUrl
  },
  openGraph: {
    title: "MistriHub",
    description: "Connect with trusted local workers on WhatsApp.",
    url: siteUrl,
    siteName: "MistriHub",
    locale: "en_IN",
    type: "website"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "MistriHub",
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/?location={search_term_string}#workers`,
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang="en">
      <body>
        <Script id="mistrihub-jsonld" type="application/ld+json" strategy="beforeInteractive">
          {JSON.stringify(structuredData)}
        </Script>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
