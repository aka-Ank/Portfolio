import type { BlogPostMeta } from "./schema";

// PLACEHOLDER metadata only — full MDX post bodies and /blog routes are a
// Phase 4 deliverable (docs/08-roadmap.md). The Observatory scene only needs
// the metadata to render a "latest posts" area.
export const blogPosts: BlogPostMeta[] = [
  {
    slug: "why-frame-time-is-a-product-decision",
    title: "Why Frame Time Is a Product Decision",
    summary: "Notes on treating 60fps as a design constraint, not a stretch goal.",
    date: "2026-06-02",
    tags: ["performance", "webgl"],
  },
  {
    slug: "agents-that-remember-what-they-were-doing",
    title: "Agents That Remember What They Were Doing",
    summary: "State machines for long-running, interruptible LLM tasks.",
    date: "2026-04-18",
    tags: ["ai", "systems"],
  },
];
