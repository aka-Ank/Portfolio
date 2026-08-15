import { about } from "@/content/about";
import { resume } from "@/content/resume";
import { campfireContent } from "@/world/scenes/campfire/content";
import { SITE_URL } from "./site";

/**
 * schema.org Person JSON-LD, built from the same content/ modules the rest
 * of the site reads from — no separate copy to keep in sync. Emitted once,
 * site-wide, from the root layout (a Person represents site-wide identity,
 * not a single page). The `http`-prefix filter on sameAs stays as a guard:
 * the links are real profile URLs now, but a future in-page anchor added to
 * campfireContent would otherwise ship as a broken sameAs entry.
 */
export function buildPersonSchema() {
  const sameAs = campfireContent.links
    .map((link) => link.href)
    .filter((href) => href.startsWith("http"));

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: about.name,
    jobTitle: about.role,
    description: about.tagline,
    url: SITE_URL,
    email: `mailto:${resume.email}`,
    ...(resume.location ? { address: { "@type": "PostalAddress", addressLocality: resume.location } } : {}),
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}
