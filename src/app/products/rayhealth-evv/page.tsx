import type { Metadata } from "next";
import { TopNav } from "@/components/shared/top-nav";
import { SiteFooter } from "@/components/shared/site-footer";
import { RayHealthHero } from "@/components/projects/rayhealth-hero";
import { RayHealthModules } from "@/components/projects/rayhealth-modules";
import { RayHealthFeatures } from "@/components/projects/rayhealth-features";
import { RayHealthRoadmap } from "@/components/projects/rayhealth-roadmap";
import { RayHealthOperations } from "@/components/projects/rayhealth-operations";
import { RayHealthCompliance } from "@/components/projects/rayhealth-compliance";
import { CompanyCta } from "@/components/landing/company-cta";

export const metadata: Metadata = {
  title: "RayHealthEVV™ — Healthcare operations platform",
  description:
    "RayHealthEVV™ — a unified operating system for home-care agencies. Designed to support EVV and state Medicaid requirements. Care. Verified. Delivered.",
  openGraph: {
    title: "RayHealthEVV™ — Care. Verified. Delivered.",
    description:
      "An enterprise platform for home-care agencies. Owner-first. Designed to support EVV.",
    url: "https://ghimtech.org/products/rayhealth-evv",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "RayHealthEVV",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web, iOS, Android",
  description:
    "A unified operating system for home-care agencies — caregiver, coordinator, billing, payroll, scheduling, training, and compliance.",
  publisher: { "@type": "Organization", name: "GhimTech", url: "https://ghimtech.org" },
};

/**
 * RayHealthEVV product page.
 *
 *   1. Hero        — product wordmark + thesis + Command Glass mockup
 *   2. Modules     — 12 production modules as HUD inventory
 *   3. Features    — 6 marquee features with abstract animated visuals
 *   4. Roadmap     — Now / Next / Horizon / Vision quarterly cards
 *   5. Operations  — Deployment feed + sprint throughput chart
 *   6. Compliance  — "Designed to support" posture (brand governance)
 *   7. CTA         — Contact / products paths
 */
export default function RayHealthProductPage() {
  return (
    <main className="relative overflow-x-clip">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TopNav />
      <RayHealthHero />
      <RayHealthModules />
      <RayHealthFeatures />
      <RayHealthRoadmap />
      <RayHealthOperations />
      <RayHealthCompliance />
      <CompanyCta
        eyebrow="For home-care agencies"
        title={
          <>
            Run your agency on <span className="text-gradient-vital">one calm surface</span>.
          </>
        }
        sub="See how RayHealthEVV brings visibility, verification, and compliance into a single command center."
        primary={{ label: "Request a walkthrough", href: "/contact" }}
        secondary={{ label: "All products", href: "/products" }}
      />
      <SiteFooter />
    </main>
  );
}
