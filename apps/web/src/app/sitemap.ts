import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { articles, projects } from "@/lib/content";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "/",
    "/work",
    "/services",
    "/about",
    "/insights",
    "/contact",
    "/privacy",
    ...projects.map((p) => "/work/" + p.slug),
    ...articles.map((a) => "/insights/" + a.slug),
  ].map((path) => ({
    url: siteUrl + path,
    changeFrequency: path === "/" ? "monthly" : "yearly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
