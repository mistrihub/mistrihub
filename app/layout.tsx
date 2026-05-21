import Script from "next/script";
import type { Metadata } from "next";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mistrihub.in";
const gtmId = "GTM-NM3ZC5D2";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "MistriHub - Find trusted local workers in India",
    template: "%s | MistriHub"
  },
  description:
    "Find electricians, plumbers, drivers, mechanics, painters, carpenters, and AC repair technicians near you in India.",
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
  return (
    <html lang="en">
      <body>
        <noscript>
  <iframe
    src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
    height="0"
    width="0"
    style={{ display: "none", visibility: "hidden" }}
  />
</noscript>

<Script id="google-tag-manager" strategy="afterInteractive">
  {`
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','${gtmId}');
  `}
</Script>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
