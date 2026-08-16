import { aboutContent, glanceContent } from "@/content/sections";
import { SectionShell, Panel } from "./SectionShell";

/**
 * Short by design. Three paragraphs is a professional summary; ten is an essay
 * nobody reads.
 *
 * Two tiles: the prose keeps a readable measure on the left, and the facts a
 * reader would otherwise have to dig for sit beside it. Every row in the
 * glance tile is a fact already stated elsewhere on the page — this is a
 * shortcut, not new content, which is why it can be this terse.
 */
export function AboutSection() {
  return (
    <SectionShell id="about" heading={aboutContent.heading}>
      <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr] lg:items-start">
        <div className="space-y-4 text-[17px] leading-relaxed text-[var(--ink-muted)]">
          {aboutContent.bio.map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}
        </div>

        <Panel as="div">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--accent-ink)]">
            At a glance
          </h3>
          <dl className="mt-4 space-y-3">
            {glanceContent.map((row) => (
              <div key={row.label}>
                <dt className="font-mono text-[11px] uppercase tracking-wider text-[var(--ink-muted)]">
                  {row.label}
                </dt>
                <dd className="mt-0.5 text-[15px] leading-snug text-[var(--ink)]">{row.value}</dd>
              </div>
            ))}
          </dl>
        </Panel>
      </div>
    </SectionShell>
  );
}
