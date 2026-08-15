// Canonical site origin, used by metadata/OG tags, robots.ts, sitemap.ts,
// and the JSON-LD Person schema. Set NEXT_PUBLIC_SITE_URL in production —
// the fallback is a deliberately obvious non-domain so a misconfigured
// deploy is visible in the OG tags rather than silently wrong.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";
