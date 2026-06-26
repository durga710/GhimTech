import type { Metadata } from "next";
import { TopNav } from "@/components/shared/top-nav";
import { SiteFooter } from "@/components/shared/site-footer";
import { CareersContent } from "@/components/careers/careers-content";
import { CompanyCta } from "@/components/landing/company-cta";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Join GhimTech — a small, founder-led team building AI-powered software with real ownership and a high bar for craft.",
  openGraph: {
    title: "Careers at GhimTech",
    description: "Build software that earns trust. Small team, real ownership.",
  },
};

export default function CareersPage() {
  return (
    <main className="relative overflow-x-clip">
      <TopNav />
      <CareersContent />
      <CompanyCta
        eyebrow="Get in touch"
        title={
          <>
            Think you&apos;d be a <span className="text-gradient-vital">great fit</span>?
          </>
        }
        sub="Tell us what you've built and what you want to build next. We read every message."
        primary={{ label: "Introduce yourself", href: "/contact" }}
        secondary={{ label: "How we build", href: "/technology" }}
      />
      <SiteFooter />
    </main>
  );
}
