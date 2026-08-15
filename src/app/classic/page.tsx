import type { Metadata } from "next";

// Placeholder — the real classic experience (semantic HTML/CSS, minimal JS,
// same content as the immersive route) is built in Phase 4. See
// docs/08-roadmap.md and docs/02-architecture.md `app/classic/`.
export const metadata: Metadata = {
  title: "Portfolio — Classic",
  description: "The lightweight, fast-by-default version of the portfolio.",
};

export default function ClassicPage() {
  return (
    <main id="main-content" className="mx-auto max-w-2xl px-6 py-24">
      <h1 className="font-[family-name:var(--font-display)] text-4xl text-[var(--ink)]">
        Classic mode
      </h1>
      <p className="mt-4 text-[var(--muted-foreground)]">
        This route is a placeholder scaffolded in Phase 2. The full semantic, fast-by-default
        classic experience — reading from the same content layer as the immersive site — is
        built in Phase 4.
      </p>
    </main>
  );
}
