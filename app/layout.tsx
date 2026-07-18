import type { Metadata } from "next";
import { Oswald, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Analytics } from "@vercel/analytics/next";

const display = Oswald({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display"
});

const body = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body"
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono"
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.nextmove.ca"),
  title: {
    default: "NextMove | Local & Long-Distance Movers in Fredericton, NB",
    template: "%s | NextMove"
  },
  description:
    "NextMove is a local, licensed & insured moving company based in Fredericton, NB. Local moves in the Fredericton area and long-distance moves across the Maritimes. Free, no-obligation quotes.",
  openGraph: {
    title: "NextMove | Local & Long-Distance Movers in Fredericton, NB",
    description:
      "Local moves in Fredericton & area, long-distance across the Maritimes. Free, no-obligation quotes — email your best rate after one quick form.",
    url: "https://www.nextmove.ca",
    siteName: "NextMove",
    locale: "en_CA",
    type: "website"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="flex min-h-screen flex-col font-sans">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <Analytics />
      </body>
    </html>
  );
}
