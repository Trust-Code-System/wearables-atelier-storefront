import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // NOTE: cacheComponents/partialPrefetching from the scaffold are disabled —
  // the storefront is intentionally client-driven (localStorage stores) until
  // the backend lands. Re-enable with `"use cache"` on real data fetching.
  cacheComponents: false,
  partialPrefetching: false,
  turbopack: {
    root: process.cwd(),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
