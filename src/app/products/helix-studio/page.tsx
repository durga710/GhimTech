import type { Metadata } from "next";
import { TopNav } from "@/components/shared/top-nav";
import { SiteFooter } from "@/components/shared/site-footer";
import { HelixHero } from "@/components/products/helix/helix-hero";
import { HelixFeatureExplorer } from "@/components/products/helix/helix-feature-explorer";
import { HelixPipeline } from "@/components/products/helix/helix-pipeline";
import { HelixRoadmap } from "@/components/products/helix/helix-roadmap";
import { HelixLive } from "@/components/products/helix/helix-live";
import { CompanyCta } from "@/components/landing/company-cta";
import { HELIX } from "@/lib/products";

export const metadata: Metadata = {
  title: "Helix Studio — AI development platform",
  description: HELIX.oneLiner,
  openGraph: {
    title: "Helix Studio — From prompt to production",
    description: HELIX.oneLiner,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Helix Studio",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  description: HELIX.oneLiner,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  publisher: { "@type": "Organization", name: "GhimTech", url: "https://ghimtech.org" },
};

export default function HelixStudioPage() {
  return (
    <main className="relative overflow-x-clip">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TopNav />
      <HelixHero />
      <HelixFeatureExplorer />
      <HelixPipeline />
      <HelixRoadmap />
      <HelixLive />
      <CompanyCta
        eyebrow="Build with Helix"
        title={
          <>
            Describe it. <span className="text-gradient-signal">Ship it.</span>
          </>
        }
        sub="Open the studio and turn your next idea into a running app — in a real repository, with the model you choose."
        primary={{ label: "Open the studio", href: "/dashboard/gcode" }}
        secondary={{ label: "Explore all products", href: "/products" }}
      />
      <SiteFooter />
    </main>
  );
}
