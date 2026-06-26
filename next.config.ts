import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the file-tracing root to this project. A stray package-lock.json
  // higher up the tree (e.g. in $HOME) can make Next mis-infer the
  // workspace root. Harmless on Vercel (isolated build) but keeps local
  // builds clean and deterministic.
  outputFileTracingRoot: process.cwd(),
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "recharts"],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  poweredByHeader: false,
  reactStrictMode: true,
  // Retire the old founder-era IA — point legacy URLs at the new company pages.
  async redirects() {
    return [
      { source: "/projects", destination: "/products", permanent: true },
      { source: "/projects/rayhealth-evv", destination: "/products/rayhealth-evv", permanent: true },
      { source: "/experience", destination: "/about", permanent: true },
    ];
  },
};

export default nextConfig;
