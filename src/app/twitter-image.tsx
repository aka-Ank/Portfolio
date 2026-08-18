import { ogCard } from "@/lib/og-card";

/**
 * The same card as `opengraph-image`.
 *
 * X falls back to `og:image` when `twitter:image` is absent, so this is
 * belt-and-braces — but `summary_large_image` is declared in the root metadata
 * and a card that declares a large image without naming one is the kind of thing
 * that renders differently on every client.
 */
export { size, contentType, alt } from "@/lib/og-card";

export default function Image() {
  return ogCard();
}
