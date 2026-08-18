import { educationContent } from "@/content/sections";
import { SectionShell, BentoGrid, Panel } from "./SectionShell";

/** Education and the one real certification, side by side. The certification
 * list stays at its true length rather than being padded to fill the row —
 * which is why it takes the narrower column. */
export function EducationSection() {
  const { education, certifications } = educationContent;

  return (
    <SectionShell id="education" heading={educationContent.heading}>
      <BentoGrid>
        <Panel as="article" className="lg:col-span-4">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h3 className="text-xl font-medium text-[var(--ink)]">{education.institution}</h3>
            <span className="font-mono text-xs text-[var(--ink-muted)]">{education.period}</span>
          </div>

          <div className="mt-1 flex flex-wrap items-baseline justify-between gap-x-4">
            <p className="text-[15px] text-[var(--ink-muted)]">{education.degree}</p>
            <p className="font-mono text-[13px] text-[var(--accent-ink)]">CGPA {education.cgpa}</p>
          </div>

          <div className="mt-4 border-t border-[var(--border-soft)] pt-4">
            <h4 className="font-mono text-[11px] uppercase tracking-wider text-[var(--ink-muted)]">
              Relevant coursework
            </h4>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {education.coursework.map((course) => (
                <li
                  key={course}
                  className="rounded-md border border-[var(--border-soft)] px-2.5 py-1 font-mono text-[11px] text-[var(--ink-muted)]"
                >
                  {course}
                </li>
              ))}
            </ul>
          </div>
        </Panel>

        {/* A flex column with growing children rather than `space-y`, so the
            certification card's bottom edge lines up with the degree card's
            instead of stopping short of it. With more than one certification
            they simply share the height. */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          {certifications.map((certification) => (
            <Panel key={certification.id} as="article" className="flex-1">
              <h3 className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--accent-ink)]">
                Certification
              </h3>
              <div className="mt-3 flex items-baseline justify-between gap-x-4">
                <p className="text-[17px] leading-snug text-[var(--ink)]">{certification.title}</p>
                <span className="shrink-0 font-mono text-xs text-[var(--ink-muted)]">
                  {certification.year}
                </span>
              </div>
              <p className="mt-1.5 text-[15px] text-[var(--ink-muted)]">{certification.issuer}</p>
              <p className="mt-2 text-[15px] leading-relaxed text-[var(--ink-muted)]">
                {certification.detail}
              </p>
            </Panel>
          ))}
        </div>
      </BentoGrid>
    </SectionShell>
  );
}
