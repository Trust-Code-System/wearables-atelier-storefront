import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Local QA only: lets a second dev server run beside the default one.
  distDir: process.env.NEXT_DIST_DIR || ".next",
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
  // Local QA only: when DEV_API_PROXY_TARGET is set, /api-proxy/* is forwarded to
  // that backend so a localhost origin avoids the staging API's CORS allow-list.
  // Unset in every deployed environment, so no rewrite is registered there.
  async rewrites() {
    const target = process.env.DEV_API_PROXY_TARGET?.replace(/\/+$/, "");
    if (!target) return [];
    return [{ source: "/api-proxy/:path*", destination: `${target}/:path*` }];
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
