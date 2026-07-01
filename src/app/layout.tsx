import type { Metadata, Viewport } from "next";
import { Fraunces, Hanken_Grotesk, IBM_Plex_Mono } from "next/font/google";
import { COMPANY, FOUNDER } from "@/lib/content";
import "./globals.css";

// Editorial type system — Fraunces (display serif) + Hanken Grotesk (body)
// + IBM Plex Mono (labels/data). Self-hosted via next/font.
const fontDisplay = Fraunces({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const fontSans = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const fontMono = IBM_Plex_Mono({
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
  description: COMPANY.positioning,
  keywords: [
    "GhimTech",
    "AI-native software company",
    "RayHealthEVV",
    "Helix Studio",
    "healthcare operations software",
    "developer tools",
    "business automation",
    "founder-led software company",
    "Durga Ghimeray",
    "USMC veteran founder",
  ],
  authors: [{ name: FOUNDER.name }],
  creator: FOUNDER.name,
  icons: {
    icon: [{ url: "/brand/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/brand/icon-512.svg", sizes: "512x512", type: "image/svg+xml" }],
    shortcut: "/brand/favicon.svg",
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ghimtech.org",
    title: `${COMPANY.name} — ${COMPANY.tagline}`,
    description: COMPANY.positioning,
    siteName: COMPANY.name,
    images: [
      {
        url: "/brand/og-image.svg",
        width: 1200,
        height: 630,
        alt: "GhimTech — AI-native software for serious work",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${COMPANY.name} — ${COMPANY.tagline}`,
    description: COMPANY.positioning,
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
      className={`${fontDisplay.variable} ${fontSans.variable} ${fontMono.variable} dark`}
      suppressHydrationWarning
    >
      <body className="font-sans">
        {/* Global atmosphere — deeper than the previous single-noise pass. */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 -z-20 bg-[radial-gradient(circle_at_top_right,rgba(86,168,255,0.12),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(49,227,154,0.08),transparent_30%),radial-gradient(circle_at_center,rgba(255,255,255,0.03),transparent_52%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 -z-10 bg-carbon-grid bg-grid-md opacity-[0.13] [mask-image:radial-gradient(circle_at_center,black_28%,transparent_84%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 -z-10 bg-noise opacity-[0.3] mix-blend-overlay"
        />
        {children}
      </body>
    </html>
  );
}
