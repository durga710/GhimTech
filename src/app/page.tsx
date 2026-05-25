import { TopNav } from "@/components/shared/top-nav";
import { SiteFooter } from "@/components/shared/site-footer";
import { AmbientBackdrop } from "@/components/landing/ambient-backdrop";
import { Hero } from "@/components/landing/hero";
import { ValuesSection } from "@/components/landing/values-section";
import { FeaturedProject } from "@/components/landing/featured-project";
import { ClosingCta } from "@/components/landing/closing-cta";

/**
 * Landing — the front door of Durga OS.
 *
 * Composition (top → bottom):
 *   1. TopNav (fixed)
 *   2. Hero with ambient backdrop
 *   3. Values — operating principles
 *   4. Featured project — RayHealthEVV
 *   5. Closing CTA
 *   6. Footer
 *
 * Each section is independently scrollable and reveals on viewport entry.
 */
export default function LandingPage() {
  return (
    <main className="relative overflow-x-clip">
      <TopNav />

      {/* Hero with its own ambient layer so the backdrop doesn't bleed into the whole page */}
      <div className="relative">
        <AmbientBackdrop />
        <Hero />
      </div>

      <ValuesSection />
      <FeaturedProject />
      <ClosingCta />
      <SiteFooter />
    </main>
  );
}
