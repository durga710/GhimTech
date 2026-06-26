import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { JetBrains_Mono } from "next/font/google";
import { COMPANY } from "@/lib/company";
import "./globals.css";

// Type system — Geist (display + body) + JetBrains Mono (labels + data).
// Clean, engineering-credible sans in the lineage of Stripe / Linear / Vercel.
// Geist ships via the `geist` package; JetBrains Mono via next/font.
const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ghimtech.org"),
  title: {
    default: `${COMPANY.name} — ${COMPANY.tagline}`,
    template: `%s · ${COMPANY.name}`,
  },
  description: COMPANY.mission,
  keywords: [
    "GhimTech",
    "AI software",
    "Helix Studio",
    "RayHealthEVV",
    "AI app builder",
    "healthcare technology",
    "developer tools",
    "business automation",
    "Durga Ghimeray",
  ],
  authors: [{ name: COMPANY.name }],
  creator: COMPANY.name,
  publisher: COMPANY.name,
  // Brand identity surfaces — favicon + Apple touch icon + OG image
  icons: {
    icon: [
      { url: "/brand/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/brand/icon-512.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
    shortcut: "/brand/favicon.svg",
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ghimtech.org",
    title: `${COMPANY.name} — ${COMPANY.tagline}`,
    description: COMPANY.mission,
    siteName: COMPANY.name,
    images: [
      {
        url: "/brand/og-image.svg",
        width: 1200,
        height: 630,
        alt: `${COMPANY.name} — ${COMPANY.tagline}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${COMPANY.name} — ${COMPANY.tagline}`,
    description: COMPANY.mission,
    images: ["/brand/og-image.svg"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#040508",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${fontMono.variable} dark`}
      suppressHydrationWarning
    >
      <body className="font-sans">
        {/* Ambient atmosphere — fixed, never scrolls */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 -z-10 bg-noise opacity-[0.35] mix-blend-overlay"
        />
        {children}
      </body>
    </html>
  );
}
