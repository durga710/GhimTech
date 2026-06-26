import { TopNav } from "@/components/shared/top-nav";
import { SiteFooter } from "@/components/shared/site-footer";
import { AmbientBackdrop } from "@/components/landing/ambient-backdrop";
import { CompanyHero } from "@/components/landing/company-hero";
import { FocusAreas } from "@/components/landing/focus-areas";
import { ProductsShowcase } from "@/components/landing/products-showcase";
import { CultureSection } from "@/components/landing/culture-section";
import { CompanyCta } from "@/components/landing/company-cta";
import { COMPANY, SOCIAL } from "@/lib/company";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://ghimtech.org/#organization",
      name: COMPANY.name,
      url: "https://ghimtech.org",
      email: COMPANY.email,
      description: COMPANY.mission,
      foundingDate: COMPANY.founded,
      sameAs: [SOCIAL.github, SOCIAL.linkedin],
    },
    {
      "@type": "WebSite",
      "@id": "https://ghimtech.org/#website",
      url: "https://ghimtech.org",
      name: COMPANY.name,
      publisher: { "@id": "https://ghimtech.org/#organization" },
    },
  ],
};

/**
 * Home — the front door of GhimTech.
 *
 * Composition (top → bottom):
 *   1. TopNav (fixed)
 *   2. Company hero + ambient backdrop + product roster + ticker
 *   3. What we build — focus areas
 *   4. Our products — Helix Studio + RayHealthEVV
 *   5. How we build — engineering culture + stats
 *   6. Closing CTA
 *   7. Footer
 */
export default function HomePage() {
  return (
    <main className="relative overflow-x-clip">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TopNav />

      <div className="relative">
        <AmbientBackdrop />
        <CompanyHero />
      </div>

      <FocusAreas />
      <ProductsShowcase />
      <CultureSection />
      <CompanyCta />
      <SiteFooter />
    </main>
  );
}
