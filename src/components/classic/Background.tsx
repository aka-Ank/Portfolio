import { educationContent } from "@/content/sections";

/** Education and the internship. Two cards, never a timeline — same reasoning
 * as the immersive route's EducationSection. */
export function Background() {
  const { education, experience } = educationContent;

  return (
    <section
      id="education"
      aria-labelledby="classic-education-heading"
      className="mx-auto max-w-3xl px-6 py-16"
    >
      <h2
        id="classic-education-heading"
        className="font-[family-name:var(--font-display)] text-4xl text-[var(--ink)]"
      >
        {educationContent.heading}
      </h2>

      <div className="mt-8 grid gap-8 sm:grid-cols-2">
        <article>
          <p className="font-mono text-[11px] uppercase tracking-wider text-[var(--accent-ink)]">
            Education
          </p>
          <h3 className="mt-3 text-xl text-[var(--ink)]">{education.institution}</h3>
          <p className="mt-2 text-[15px] text-[var(--ink)]">{education.degree}</p>
          <p className="mt-2 font-mono text-xs text-[var(--ink-muted)]">
            {education.period} · CGPA {education.cgpa} · {education.location}
          </p>
          <ul className="mt-4 flex flex-wrap gap-2 border-t border-[var(--border-soft)] pt-4">
            {education.coursework.map((course) => (
              <li
                key={course}
                className="rounded-full border border-[var(--border-soft)] px-3 py-1 text-xs text-[var(--ink-muted)]"
              >
                {course}
              </li>
            ))}
          </ul>
        </article>

        <article>
          <p className="font-mono text-[11px] uppercase tracking-wider text-[var(--accent-ink)]">
            Internship
          </p>
          <h3 className="mt-3 text-xl text-[var(--ink)]">{experience.company}</h3>
          <p className="mt-2 text-[15px] text-[var(--ink)]">{experience.role}</p>
          <p className="mt-2 font-mono text-xs text-[var(--ink-muted)]">{experience.period}</p>
          <ul className="mt-4 space-y-3 border-t border-[var(--border-soft)] pt-4">
            {experience.highlights.map((highlight) => (
              <li key={highlight} className="flex gap-3 text-sm leading-relaxed text-[var(--ink-muted)]">
                <span aria-hidden className="mt-[0.6em] h-px w-4 shrink-0 bg-[var(--accent-ink)]" />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
