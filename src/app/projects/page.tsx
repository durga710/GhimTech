import type { Metadata } from "next";
import { TopNav } from "@/components/shared/top-nav";
import { SiteFooter } from "@/components/shared/site-footer";
import { ProjectsIndexHero } from "@/components/projects/projects-index-hero";
import { ProjectsIndexFeatured } from "@/components/projects/projects-index-featured";

export const metadata: Metadata = {
  title: "Products",
  description:
    "The GhimTech product portfolio: RayHealthEVV™, a home-care operations platform, and Helix Studio, a prompt-to-production developer platform direction.",
  openGraph: {
    title: "Products · GhimTech",
    description:
      "RayHealthEVV™ home-care operations and the Helix Studio developer platform direction.",
    url: "https://ghimtech.org/projects",
  },
};

export default function ProjectsIndexPage() {
  return (
    <main className="public-shell relative overflow-x-clip">
      <TopNav />
      <ProjectsIndexHero />
      <ProjectsIndexFeatured />
      <SiteFooter />
    </main>
  );
}
