// Canonical site origin, used by metadata/OG tags, robots.ts, sitemap.ts,
// and the JSON-LD Person schema. Set NEXT_PUBLIC_SITE_URL in production;
// the fallback is an obvious placeholder, matching resume.ts's placeholder
// email — both get replaced together when this becomes a real deployment.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";
