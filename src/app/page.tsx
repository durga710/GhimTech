import { TopNav } from "@/components/shared/top-nav";
import { SiteFooter } from "@/components/shared/site-footer";
import { AmbientBackdrop } from "@/components/landing/ambient-backdrop";
import { Hero } from "@/components/landing/hero";
import { ValuesSection } from "@/components/landing/values-section";
import { FeaturedProject } from "@/components/landing/featured-project";
import { ClosingCta } from "@/components/landing/closing-cta";
import { SignalStrip } from "@/components/marketing/signal-strip";
import { TechnologyGrid } from "@/components/marketing/technology-grid";
import { FounderPanel } from "@/components/marketing/founder-panel";
import { MarketingSection, MarketingSectionHeader } from "@/components/marketing/marketing-section";

/**
 * Landing — the GhimTech company front door.
 *
 * Composition (top → bottom):
 *   1. TopNav (fixed)
 *   2. Hero with ambient backdrop — company positioning + product previews
 *   3. Signal strip — company scope ticker
 *   4. Product roster — RayHealthEVV + Helix Studio
 *   5. How we build — operating principles
 *   6. Technology & infrastructure pillars
 *   7. Founder-led company panel
 *   8. Closing CTA
 *   9. Footer
 */
export default function LandingPage() {
  return (
    <main className="relative overflow-x-clip">
      <TopNav />

      <div className="relative">
        <AmbientBackdrop />
        <Hero />
      </div>

      <SignalStrip />
      <FeaturedProject />
      <ValuesSection />
      <TechnologyGrid />
      <MarketingSection>
        <MarketingSectionHeader
          eyebrow="Founder-led"
          title={<>Small team. High standards. Real products.</>}
          body="GhimTech is shaped by Durga Ghimeray's operator background: USMC discipline, Nepali entrepreneurial grit, and a bias toward software that earns trust under pressure."
        />
        <div className="mt-10">
          <FounderPanel />
        </div>
      </MarketingSection>
      <ClosingCta />
      <SiteFooter />
    </main>
  );
}
