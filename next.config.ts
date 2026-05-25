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
      { protocol: "https", hostname: "img.clerk.com" },
    ],
  },
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
