import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";

import { BottomNav } from "@/components/BottomNav";

import "./globals.css";

/**
 * Fonts are self-hosted by next/font rather than fetched from Google at
 * runtime: one less round trip on a Lagos 3G connection, and no layout shift
 * when they land.
 */
const display = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-fraunces",
  display: "swap",
});

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ONEESTORE — fresh seafood, weighed for you",
    template: "%s · ONEESTORE",
  },
  description:
    "Fresh seafood sold by the kilogram at the morning's market price, cleaned the way you ask and delivered across Lagos the same day.",
};

export const viewport: Viewport = {
  themeColor: "#0B2B2E",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>
        {/* Floating chrome overlays content, so every page ends clear of it. */}
        <div>{children}</div>
        <BottomNav />
      </body>
    </html>
  );
}
