import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // NOTE: cacheComponents/partialPrefetching from the scaffold are disabled —
  // catalog reads use no-store so unpublished products and expired signed URLs
  // are not retained in a persistent Next.js cache.
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
