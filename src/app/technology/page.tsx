import type { Metadata } from "next";
import { TopNav } from "@/components/shared/top-nav";
import { SiteFooter } from "@/components/shared/site-footer";
import { TechnologyContent } from "@/components/technology/technology-content";
import { CompanyCta } from "@/components/landing/company-cta";

export const metadata: Metadata = {
  title: "Technology",
  description:
    "How GhimTech builds: Next.js 15, TypeScript, Prisma, Supabase, and a provider-agnostic AI layer — typed end-to-end, validated at every boundary, audited on every write.",
  openGraph: {
    title: "GhimTech Technology",
    description: "Our stack and the engineering guarantees behind it.",
  },
};

export default function TechnologyPage() {
  return (
    <main className="relative overflow-x-clip">
      <TopNav />
      <TechnologyContent />
      <CompanyCta
        eyebrow="Engineers"
        title={
          <>
            If this is how you like to <span className="text-gradient-signal">build</span>, talk to us.
          </>
        }
        sub="We care about the fundamentals. If you do too, we'd love to hear from you."
        primary={{ label: "See open roles", href: "/careers" }}
        secondary={{ label: "Open source", href: "/open-source" }}
      />
      <SiteFooter />
    </main>
  );
}
