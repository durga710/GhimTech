import type { Metadata } from "next";
import { TopNav } from "@/components/shared/top-nav";
import { SiteFooter } from "@/components/shared/site-footer";
import { ProjectsIndexHero } from "@/components/projects/projects-index-hero";
import { ProjectsIndexFeatured } from "@/components/projects/projects-index-featured";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "One mission, built end-to-end. RayHealthEVV™ — a unified operating system for home-care agencies.",
  openGraph: {
    title: "Projects · Durga Ghimeray",
    description: "RayHealthEVV™ — home-care operations, unified.",
    url: "https://ghimtech.org/projects",
  },
};

export default function ProjectsIndexPage() {
  return (
    <main className="relative overflow-x-clip">
      <TopNav />
      <ProjectsIndexHero />
      <ProjectsIndexFeatured />
      <SiteFooter />
    </main>
  );
}
