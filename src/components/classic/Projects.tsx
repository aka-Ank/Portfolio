import { labContent } from "@/world/scenes/lab/content";

// Native <details>/<summary> for expand/collapse — zero JS needed, in
// keeping with classic mode's "minimal JS" brief (docs/08-roadmap.md Phase 4).
export function Projects() {
  return (
    <section id="lab" aria-label="Projects" className="mx-auto max-w-3xl px-6 py-24">
      <h2 className="font-[family-name:var(--font-display)] text-4xl text-[var(--ink)]">
        {labContent.heading}
      </h2>
      <p className="mt-3 text-[var(--muted-foreground)]">{labContent.intro}</p>

      <div className="mt-8 flex flex-col gap-4">
        {labContent.projects.map((project) => (
          <details
            key={project.slug}
            className="group rounded-lg border border-[var(--border)] p-5 open:bg-[var(--secondary)]"
          >
            <summary className="cursor-pointer list-none rounded outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]">
              <div className="flex items-center justify-between gap-4">
                <span className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
                  {project.title}
                </span>
                <span
                  aria-hidden
                  className="text-[var(--muted-foreground)] transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </div>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">{project.summary}</p>
            </summary>

            <div className="mt-4 border-t border-[var(--border)] pt-4">
              <p className="text-sm tracking-wide text-[var(--muted-foreground)] uppercase">
                {project.role}
              </p>
              <p className="mt-3 text-[var(--ink)]">{project.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {project.stack.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full bg-[var(--secondary)] px-3 py-1 font-[family-name:var(--font-mono)] text-xs text-[var(--secondary-foreground)]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
              <dl className="mt-4 grid grid-cols-3 gap-4">
                {project.metrics.map((metric) => (
                  <div key={metric.label}>
                    <dt className="text-xs text-[var(--muted-foreground)]">{metric.label}</dt>
                    {/* --primary, not --accent — see LearningJourney.tsx's
                        comment (--accent on --paper is 2.2:1, fails AA). */}
                    <dd className="font-[family-name:var(--font-mono)] text-lg text-[var(--primary)]">
                      {metric.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
