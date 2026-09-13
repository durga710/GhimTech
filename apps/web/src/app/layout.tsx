import type { Metadata, Viewport } from "next";
import { Header } from "@/components/site-shell";
import { Footer } from "@/components/primitives";
import { contactEmail, siteUrl } from "@/lib/site";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "GhimTech | Software built around your business", template: "%s | GhimTech" },
  description:
    "GhimTech builds custom business software, CRM systems, and automated workflows around how your business operates. Founded by Durga Ghimeray.",
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: "GhimTech", locale: "en_US" },
  twitter: { card: "summary_large_image" },
};
export const viewport: Viewport = { themeColor: "#f5f3ed", width: "device-width", initialScale: 1 };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": siteUrl + "/#organization",
        name: "GhimTech",
        url: siteUrl,
        description: "Custom business software and operational systems.",
        email: contactEmail,
        founder: { "@id": siteUrl + "/#founder" },
      },
      {
        "@type": "Person",
        "@id": siteUrl + "/#founder",
        name: "Durga Ghimeray",
        jobTitle: "Founder",
        url: siteUrl + "/about",
        sameAs: ["https://github.com/durga710"],
      },
    ],
  };
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
        />
      </body>
    </html>
  );
}
