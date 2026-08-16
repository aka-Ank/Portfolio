import { educationContent } from "@/content/sections";
import { SectionShell, Panel } from "./SectionShell";

/**
 * Education and the internship, as two compact cards.
 *
 * Explicitly **not** a timeline. Two entries strung along a vertical rule
 * would inflate a short, honest record into a career narrative it does not
 * have yet — and a timeline invites the reader to look for the gaps rather
 * than at the work.
 */
export function EducationSection() {
  const { education, experience } = educationContent;

  return (
    <SectionShell id="education" heading={educationContent.heading} width="wide">
      <div className="grid gap-4 md:grid-cols-2">
        <Panel as="article">
          <p className="font-mono text-[11px] uppercase tracking-wider text-[var(--accent-ink)]">
            Education
          </p>
          <h3 className="mt-3 font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
            {education.institution}
          </h3>
          <p className="mt-2 text-[15px] text-[var(--ink)]">{education.degree}</p>
          <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 font-mono text-xs text-[var(--ink-muted)]">
            <div className="flex gap-2">
              <dt className="sr-only">Period</dt>
              <dd>{education.period}</dd>
            </div>
            <div className="flex gap-2">
              <dt>CGPA</dt>
              <dd className="text-[var(--accent-ink)]">{education.cgpa}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="sr-only">Location</dt>
              <dd>{education.location}</dd>
            </div>
          </dl>
          <div className="mt-5 border-t border-[var(--border-soft)] pt-4">
            <p className="text-xs uppercase tracking-wider text-[var(--ink-muted)]">Coursework</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {education.coursework.map((course) => (
                <li
                  key={course}
                  className="rounded-full border border-[var(--border-soft)] px-3 py-1 text-xs text-[var(--ink-muted)]"
                >
                  {course}
                </li>
              ))}
            </ul>
          </div>
        </Panel>

        <Panel as="article">
          <p className="font-mono text-[11px] uppercase tracking-wider text-[var(--accent-ink)]">
            Internship
          </p>
          <h3 className="mt-3 font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
            {experience.company}
          </h3>
          <p className="mt-2 text-[15px] text-[var(--ink)]">{experience.role}</p>
          <p className="mt-2 font-mono text-xs text-[var(--ink-muted)]">{experience.period}</p>
          <ul className="mt-5 space-y-3 border-t border-[var(--border-soft)] pt-4">
            {experience.highlights.map((highlight) => (
              <li key={highlight} className="flex gap-3 text-sm leading-relaxed text-[var(--ink-muted)]">
                <span aria-hidden className="mt-[0.6em] h-px w-4 shrink-0 bg-[var(--accent-ink)]" />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </SectionShell>
  );
}
