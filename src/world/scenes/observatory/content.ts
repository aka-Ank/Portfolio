import { certifications } from "@/content/certifications";
import { blogPosts } from "@/content/blog";

// Observatory — achievements, certifications, blog, metrics. See
// docs/03-scene-graph.md §6. The most "instrumented" chapter — this is
// where JetBrains Mono appears (docs/01-design-specification.md §2).
export const observatoryContent = {
  heading: "Moonlit Observatory",
  intro: "A record, not a highlight reel — what's certified, what's written, what's measured.",
  certifications: [...certifications].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  ),
  blogPosts,
};
