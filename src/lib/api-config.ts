/** Shared backend address for future browser and server API calls. */
export function getApiBaseUrl(): string {
  // Keep this direct reference so Next.js can inline it in browser builds.
  const configuredUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (!configuredUrl) {
    throw new Error("Set NEXT_PUBLIC_API_BASE_URL before making API requests.");
  }

  const url = new URL(configuredUrl);
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username || url.password || url.search || url.hash
  ) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL must be an HTTP(S) base URL without credentials, query or fragment.");
  }

  return url.href.replace(/\/+$/, "");
}
