import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@ghimtech/ui", "@ghimtech/tax-domain"],
  // Standalone output is for the self-hosted Docker image; Vercel manages
  // its own build output.
  output: process.env.VERCEL ? undefined : "standalone",
  poweredByHeader: false,
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        {
          key: "Content-Security-Policy",
          value:
            "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' http://localhost:4000 https://*.ghimtech.org; frame-ancestors 'none'",
        },
      ],
    },
  ],
};

export default nextConfig;
