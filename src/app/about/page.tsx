import type { Metadata } from "next";
import { TopNav } from "@/components/shared/top-nav";
import { SiteFooter } from "@/components/shared/site-footer";
import { AboutIntro } from "@/components/about/about-intro";
import { ChapterSection } from "@/components/about/chapter-section";
import { AchievementsStrip } from "@/components/about/achievements-strip";
import { PhilosophySection } from "@/components/about/philosophy-section";
import { ClosingCta } from "@/components/landing/closing-cta";

export const metadata: Metadata = {
  title: "About",
  description:
    "From the mountains of Nepal to the United States Marine Corps to building healthcare operating systems — the story of Durga Ghimeray, founder of RayHealthEVV™.",
  openGraph: {
    title: "About · Durga Ghimeray",
    description:
      "USMC Veteran. Nepali entrepreneur. Founder of RayHealthEVV™. The story behind the work.",
    url: "https://ghimtech.org/about",
  },
};

/**
 * About page composition.
 *
 *   1. Intro — split-grid identity + headline (different shape from landing hero)
 *   2. Chapters — five cinematic narrative blocks, alternating left/right
 *   3. Achievements — count-up telemetry strip
 *   4. Philosophy — four operating principles
 *   5. Closing CTA — reused from landing, ties the page back to the dashboard
 */
export default function AboutPage() {
  return (
    <main className="relative overflow-x-clip">
      <TopNav />
      <AboutIntro />
      <ChapterSection />
      <AchievementsStrip />
      <PhilosophySection />
      <ClosingCta />
      <SiteFooter />
    </main>
  );
}
