import { riverContent } from "@/world/scenes/river/content";

export function LearningJourney() {
  return (
    <section id="river" aria-label="Learning journey" className="mx-auto max-w-2xl px-6 py-24">
      <h2 className="font-[family-name:var(--font-display)] text-4xl text-[var(--ink)]">
        {riverContent.heading}
      </h2>
      <p className="mt-3 text-[var(--muted-foreground)]">{riverContent.intro}</p>

      <div className="mt-8 border-t border-[var(--border)] pt-6">
        <h3 className="font-[family-name:var(--font-mono)] text-xs tracking-wide text-[var(--primary)] uppercase">
          Education
        </h3>
        <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-[var(--ink)]">{riverContent.education.institution}</span>
          <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--muted-foreground)]">
            {riverContent.education.period}
          </span>
        </div>
        <p className="text-sm text-[var(--muted-foreground)]">
          {riverContent.education.degree} · CGPA {riverContent.education.cgpa}
        </p>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Coursework: {riverContent.education.coursework.join(", ")}
        </p>
      </div>

      <div className="mt-8 border-t border-[var(--border)] pt-6">
        <h3 className="font-[family-name:var(--font-mono)] text-xs tracking-wide text-[var(--primary)] uppercase">
          Experience
        </h3>
        <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-[var(--ink)]">{riverContent.experience.company}</span>
          <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--muted-foreground)]">
            {riverContent.experience.period}
          </span>
        </div>
        <p className="text-sm text-[var(--muted-foreground)]">{riverContent.experience.role}</p>
        <ul className="mt-3 flex flex-col gap-2">
          {riverContent.experience.highlights.map((highlight) => (
            <li key={highlight} className="text-sm text-[var(--muted-foreground)]">
              · {highlight}
            </li>
          ))}
        </ul>
      </div>

      <h3 className="mt-10 font-[family-name:var(--font-mono)] text-xs tracking-wide text-[var(--primary)] uppercase">
        Timeline
      </h3>
      <ol className="mt-4 flex flex-col gap-6 border-l border-[var(--border)] pl-6">
        {riverContent.milestones.map((milestone) => (
          <li key={milestone.id}>
            {/* --primary, not --accent: same Aether teal hue, but --accent
                on --paper is only 2.2:1 (fails AA) — --primary is the
                darker variant of the same hue built for exactly this,
                already proven at 5.4:1 elsewhere. Caught by a real
                Lighthouse/axe-core run, not the token-pair contrast audit
                (that audit only covers explicit bg+text pairs in one
                className; this is text-only, inheriting the ambient page
                background — see ENGINEER_NOTES.md). */}
            <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--primary)]">
              {milestone.year}
            </span>
            <p className="mt-1 text-[var(--ink)]">{milestone.label}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
