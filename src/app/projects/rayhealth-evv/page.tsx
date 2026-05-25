import type { Metadata } from "next";
import { TopNav } from "@/components/shared/top-nav";
import { SiteFooter } from "@/components/shared/site-footer";
import { RayHealthHero } from "@/components/projects/rayhealth-hero";
import { RayHealthModules } from "@/components/projects/rayhealth-modules";
import { RayHealthFeatures } from "@/components/projects/rayhealth-features";
import { RayHealthRoadmap } from "@/components/projects/rayhealth-roadmap";
import { RayHealthOperations } from "@/components/projects/rayhealth-operations";
import { RayHealthCompliance } from "@/components/projects/rayhealth-compliance";
import { ClosingCta } from "@/components/landing/closing-cta";

export const metadata: Metadata = {
  title: "RayHealthEVV™ — The platform",
  description:
    "RayHealthEVV™ — a unified operating system for home-care agencies. Designed to support EVV and state Medicaid requirements. Care. Verified. Delivered.",
  openGraph: {
    title: "RayHealthEVV™ — Care. Verified. Delivered.",
    description:
      "A unified operating system for home-care agencies. Owner-first. Designed to support EVV.",
    url: "https://ghimtech.org/projects/rayhealth-evv",
  },
};

/**
 * RayHealthEVV deep-dive page composition.
 *
 *   1. Hero          — product wordmark + thesis + Command Glass mockup
 *   2. Modules       — 12 production modules as HUD inventory
 *   3. Features      — 6 marquee features with abstract animated visuals
 *   4. Roadmap       — Now / Next / Horizon / Vision quarterly cards
 *   5. Operations    — Deployment feed + sprint throughput chart
 *   6. Compliance    — "Designed to support" posture (brand governance)
 *   7. Closing CTA   — Dashboard / Contact paths
 */
export default function RayHealthDeepDive() {
  return (
    <main className="relative overflow-x-clip">
      <TopNav />
      <RayHealthHero />
      <RayHealthModules />
      <RayHealthFeatures />
      <RayHealthRoadmap />
      <RayHealthOperations />
      <RayHealthCompliance />
      <ClosingCta />
      <SiteFooter />
    </main>
  );
}
