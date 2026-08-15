import type { BlogPostMeta } from "./schema";

// Intentionally empty: there are no published posts yet, and inventing
// plausible-looking ones would be exactly the "placeholder text pretending
// to be real work" this project rules out. Both the Observatory overlay and
// classic mode's Achievements section hide their "Latest writing" block
// entirely when this is empty, so the layout stays correct at zero posts.
// Add real entries here as they're written.
export const blogPosts: BlogPostMeta[] = [];
