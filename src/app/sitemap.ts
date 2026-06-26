import type { MetadataRoute } from "next";
import { PRODUCTS } from "@/lib/products";

const BASE = "https://ghimtech.org";

/**
 * Sitemap for ghimtech.org.
 * Product detail routes are generated from the product registry.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "", priority: 1, freq: "weekly" },
    { path: "/products", priority: 0.9, freq: "weekly" },
    { path: "/technology", priority: 0.8, freq: "monthly" },
    { path: "/about", priority: 0.8, freq: "monthly" },
    { path: "/careers", priority: 0.7, freq: "weekly" },
    { path: "/blog", priority: 0.7, freq: "weekly" },
    { path: "/open-source", priority: 0.6, freq: "weekly" },
    { path: "/contact", priority: 0.6, freq: "monthly" },
  ];

  const productRoutes = PRODUCTS.map((p) => ({
    path: p.href,
    priority: 0.9,
    freq: "weekly" as const,
  }));

  return [...staticRoutes, ...productRoutes].map(({ path, priority, freq }) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: freq,
    priority,
  }));
}
