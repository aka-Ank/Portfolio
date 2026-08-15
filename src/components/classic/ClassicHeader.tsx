import Link from "next/link";
import { about } from "@/content/about";

const SECTIONS = [
  { id: "clearing", label: "About" },
  { id: "river", label: "Learning" },
  { id: "sanctuary", label: "Skills" },
  { id: "lab", label: "Projects" },
  { id: "observatory", label: "Achievements" },
  { id: "campfire", label: "Contact" },
];

// Plain anchor links, no JS — matches docs/08-roadmap.md Phase 4's "minimal
// JS" brief for classic mode.
export function ClassicHeader() {
  return (
    <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] bg-[var(--paper)]/90 px-6 py-3 backdrop-blur-sm">
      <a href="#entrance" className="font-[family-name:var(--font-display)] text-lg text-[var(--ink)]">
        {about.name}
      </a>
      <nav aria-label="Sections" className="flex flex-wrap gap-4 text-sm">
        {SECTIONS.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="text-[var(--muted-foreground)] hover:text-[var(--ink)]"
          >
            {section.label}
          </a>
        ))}
      </nav>
      <Link
        href="/"
        className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--ink)] outline-offset-2 hover:bg-[var(--secondary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
      >
        Enter immersive mode
      </Link>
    </header>
  );
}
