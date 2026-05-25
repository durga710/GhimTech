import type { MetadataRoute } from "next";

const BASE = "https://ghimtech.org";

/**
 * Sitemap for ghimtech.org.
 * Add new public routes here as they ship.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes = ["", "/about", "/experience", "/projects", "/contact"];

  return routes.map((path) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.8,
  }));
}
