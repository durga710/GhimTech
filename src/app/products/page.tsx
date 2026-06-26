import type { Metadata } from "next";
import { TopNav } from "@/components/shared/top-nav";
import { SiteFooter } from "@/components/shared/site-footer";
import { ProductsIndex } from "@/components/products/products-index";
import { CompanyCta } from "@/components/landing/company-cta";

export const metadata: Metadata = {
  title: "Products",
  description:
    "GhimTech products — Helix Studio, an AI development platform, and RayHealthEVV, an enterprise healthcare operations platform.",
  openGraph: {
    title: "GhimTech Products",
    description: "Helix Studio and RayHealthEVV — real software, in production.",
  },
};

export default function ProductsPage() {
  return (
    <main className="relative overflow-x-clip">
      <TopNav />
      <ProductsIndex />
      <CompanyCta
        eyebrow="Work with us"
        title={
          <>
            Have a product worth <span className="text-gradient-signal">building right</span>?
          </>
        }
        sub="We partner on a small number of serious problems. If yours is one, let's talk."
        primary={{ label: "Get in touch", href: "/contact" }}
        secondary={{ label: "About GhimTech", href: "/about" }}
      />
      <SiteFooter />
    </main>
  );
}
