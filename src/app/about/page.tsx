import type { Metadata } from "next";
import { TopNav } from "@/components/shared/top-nav";
import { SiteFooter } from "@/components/shared/site-footer";
import { AboutCompany } from "@/components/about/about-company";
import { ChapterSection } from "@/components/about/chapter-section";
import { CompanyCta } from "@/components/landing/company-cta";

export const metadata: Metadata = {
  title: "About",
  description:
    "GhimTech is a founder-led technology company building AI-powered software. From the Marine Corps to building operating systems — the standard is the same.",
  openGraph: {
    title: "About GhimTech",
    description:
      "A founder-led technology company building intelligent, beautifully engineered software.",
    url: "https://ghimtech.org/about",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "GhimTech",
  url: "https://ghimtech.org",
  foundingDate: "2024",
  description:
    "A technology company building AI-powered software — Helix Studio and RayHealthEVV.",
  founder: { "@type": "Person", name: "Durga Ghimeray" },
};

/**
 * About — company-first, with the founder origin story retained.
 *
 *   1. AboutCompany   — company positioning, beliefs, leadership
 *   2. ChapterSection — five-chapter origin story (how we got here)
 *   3. CompanyCta     — closing
 */
export default function AboutPage() {
  return (
    <main className="relative overflow-x-clip">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TopNav />
      <AboutCompany />
      <div className="container">
        <div className="hairline" />
      </div>
      <ChapterSection />
      <CompanyCta
        eyebrow="Join the story"
        title={
          <>
            Want to build with <span className="text-gradient-signal">people who care</span>?
          </>
        }
        sub="We hire selectively and partner deliberately. If our standard resonates, reach out."
        primary={{ label: "See open roles", href: "/careers" }}
        secondary={{ label: "Get in touch", href: "/contact" }}
      />
      <SiteFooter />
    </main>
  );
}
