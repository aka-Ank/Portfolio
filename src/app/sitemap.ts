import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Only the two real routes — anchors within them (/classic#lab etc.) are
// not separately crawlable resources, so they don't belong in a sitemap.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/classic`, changeFrequency: "monthly", priority: 0.8 },
  ];
}
