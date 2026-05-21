import type { Metadata } from "next";
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
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
