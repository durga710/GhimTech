import type { Metadata, Viewport } from "next";
import { Fraunces, Hanken_Grotesk, IBM_Plex_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { FOUNDER } from "@/lib/content";
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
    default: `Ghimtech — ${FOUNDER.name} · Founder & USMC Veteran`,
    template: `%s · Ghimtech`,
  },
  description: FOUNDER.bio,
  keywords: [
    "Durga Ghimeray",
    "Ghimtech",
    "RayHealthEVV",
    "EVV",
    "home care",
    "founder",
    "USMC veteran",
    "healthcare operations",
  ],
  authors: [{ name: FOUNDER.name }],
  creator: FOUNDER.name,
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
    title: `Ghimtech — Building healthcare operations, calmly.`,
    description: FOUNDER.bio,
    siteName: "Ghimtech",
    images: [
      {
        url: "/brand/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Ghimtech — Durga Ghimeray, Founder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Ghimtech — ${FOUNDER.name}`,
    description: FOUNDER.bio,
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
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#3aa4ff",
          fontFamily: "var(--font-sans), system-ui, sans-serif",
        },
      }}
    >
      <html
        lang="en"
        className={`${fontDisplay.variable} ${fontSans.variable} ${fontMono.variable} dark`}
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
    </ClerkProvider>
  );
}
