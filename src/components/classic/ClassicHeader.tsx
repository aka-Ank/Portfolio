import Link from "next/link";
import { about } from "@/content/about";
import { SECTIONS } from "@/content/sections";
import { sectionElementId } from "@/systems/scroll/scrollToSection";

/**
 * Plain anchor links, no JS — classic mode's replacement for the floating
 * navigator.
 *
 * The hrefs are built from `sectionElementId`, the same helper the sections
 * use to set their own `id`. Hand-writing `#about` here instead is how these
 * links silently rot the moment the id scheme changes.
 */
export function ClassicHeader() {
  const navSections = SECTIONS.filter((section) => section.id !== "hero");

  return (
    <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-soft)] bg-[var(--surface)] px-6 py-3 backdrop-blur-md">
      <a
        href={`#${sectionElementId("hero")}`}
        className="rounded font-[family-name:var(--font-display)] text-lg text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
      >
        {about.name}
      </a>

      <nav aria-label="Sections" className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        {navSections.map((section) => (
          <a
            key={section.id}
            href={`#${sectionElementId(section.id)}`}
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
        Full mode
      </Link>
    </header>
  );
}
