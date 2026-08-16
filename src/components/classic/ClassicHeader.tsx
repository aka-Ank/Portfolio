import Link from "next/link";
import { about } from "@/content/about";
import { SECTIONS } from "@/content/sections";

/** Plain anchor links, no JS. Anchors are the shared section ids, so the mode
 * switch (`/classic#<activeSection>`) always lands on matching content. */
export function ClassicHeader() {
  const navSections = SECTIONS.filter((section) => section.id !== "hero");

  return (
    <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-soft)] bg-[var(--surface)] px-6 py-3 backdrop-blur-md">
      <a
        href="#hero"
        className="rounded font-[family-name:var(--font-display)] text-lg text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
      >
        {about.name}
      </a>

      <nav aria-label="Sections" className="flex flex-wrap gap-4 text-sm">
        {navSections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="rounded text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
          >
            {section.label}
          </a>
        ))}
      </nav>

      <Link
        href="/"
        prefetch={false}
        className="rounded-md border border-[var(--border-soft)] px-3 py-1.5 text-sm text-[var(--ink)] transition-colors hover:bg-[var(--surface-raised)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
      >
        Immersive mode
      </Link>
    </header>
  );
}
