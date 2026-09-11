import type { Metadata } from "next";
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ghimtech.org";
export function pageMetadata(title: string, description: string, path: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: title + " | GhimTech",
      description,
      url: path,
      siteName: "GhimTech",
      type: "website",
      images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/opengraph-image"] },
  };
}
