import type { Metadata } from "next";
import { TopNav } from "@/components/shared/top-nav";
import { SiteFooter } from "@/components/shared/site-footer";
import { ExperienceIntro } from "@/components/experience/experience-intro";
import { ExperienceTimeline } from "@/components/experience/experience-timeline";
import { ServiceSummary } from "@/components/experience/service-summary";
import { ClosingCta } from "@/components/landing/closing-cta";

export const metadata: Metadata = {
  title: "Experience",
  description:
    "A timeline of execution — from United States Marine Corps service through founding RayHealthEVV™. The same operating standard runs the length of the line.",
  openGraph: {
    title: "Experience · Durga Ghimeray",
    description:
      "USMC service · Healthcare ops · Founder of RayHealthEVV™. The record.",
    url: "https://ghimtech.org/experience",
  },
};

/**
 * Experience page composition.
 *
 *   1. Intro — compact tactical briefing
 *   2. Timeline — vertical spine, scroll-progress fill, tone-coded nodes,
 *                 alternating cards (centerpiece)
 *   3. Service summary — three-card distillation
 *   4. Closing CTA — reused, ties back to dashboard
 */
export default function ExperiencePage() {
  return (
    <main className="relative overflow-x-clip">
      <TopNav />
      <ExperienceIntro />
      <ExperienceTimeline />
      <ServiceSummary />
      <ClosingCta />
      <SiteFooter />
    </main>
  );
}
