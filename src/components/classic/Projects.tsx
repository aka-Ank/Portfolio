import { sdeContent, aimlContent } from "@/content/sections";
import type { Project } from "@/content/schema";

/**
 * Two separate sections, not one "Projects" block — the SDE/AIML split is the
 * point a visitor should leave with, and classic mode makes exactly the same
 * point the immersive route does. Native `<details>` keeps it zero-JS.
 */
export function Projects() {
  return (
    <>
      <TrackSection
        id="sde"
        heading={sdeContent.heading}
        label="Software Engineering"
        blurb={sdeContent.blurb}
        projects={sdeContent.projects}
        instrumented={false}
      />
      <TrackSection
        id="aiml"
        heading={aimlContent.heading}
        label="AI / Machine Learning"
        blurb={aimlContent.blurb}
        projects={aimlContent.projects}
        instrumented
      />
    </>
  );
}

function TrackSection({
  id,
  heading,
  label,
  blurb,
  projects,
  instrumented,
}: {
  id: string;
  heading: string;
  label: string;
  blurb: string;
  projects: Project[];
  instrumented: boolean;
}) {
  return (
    <section id={id} aria-labelledby={`classic-${id}-heading`} className="mx-auto max-w-3xl px-6 py-16">
      <p className="font-mono text-[11px] uppercase tracking-wider text-[var(--accent-ink)]">
        {label}
      </p>
      <h2
        id={`classic-${id}-heading`}
        className="mt-3 font-[family-name:var(--font-display)] text-4xl text-[var(--ink)]"
      >
        {heading}
      </h2>
      <p className="mt-3 max-w-xl text-[var(--ink-muted)]">{blurb}</p>

      <div className="mt-8 flex flex-col gap-4">
        {projects.map((project) => (
          <details
            key={project.slug}
            className={`group border border-[var(--border-soft)] p-6 open:bg-[var(--surface-raised)] ${
              instrumented ? "rounded-md" : "rounded-2xl"
            }`}
          >
            <summary className="cursor-pointer list-none rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]">
              <div className="flex items-start justify-between gap-6">
                <h3
                  className={`text-[var(--ink)] ${
                    instrumented
                      ? "text-xl font-medium tracking-tight"
                      : "font-[family-name:var(--font-display)] text-2xl"
                  }`}
                >
                  {project.title}
                </h3>
                <span
                  aria-hidden
                  className="mt-1 shrink-0 text-xl leading-none text-[var(--ink-muted)] transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </div>
              <p className="mt-2 text-[15px] leading-relaxed text-[var(--ink-muted)]">
                {project.summary}
              </p>
            </summary>

            <div className="mt-5 border-t border-[var(--border-soft)] pt-5">
              <p className="font-mono text-[11px] uppercase tracking-wider text-[var(--ink-muted)]">
                {project.role}
              </p>
              <p className="mt-3 leading-relaxed text-[var(--ink)]">{project.description}</p>

              <ul className="mt-5 flex flex-wrap gap-2">
                {project.stack.map((tech) => (
                  <li
                    key={tech}
                    className={`border border-[var(--border-soft)] px-3 py-1 font-mono text-xs text-[var(--ink-muted)] ${
                      instrumented ? "rounded-sm" : "rounded-full"
                    }`}
                  >
                    {tech}
                  </li>
                ))}
              </ul>

              {project.metrics.length > 0 && (
                <dl className="mt-5 flex flex-wrap gap-x-10 gap-y-3">
                  {project.metrics.map((metric) => (
                    <div key={metric.label}>
                      <dt className="font-mono text-[11px] uppercase tracking-wider text-[var(--ink-muted)]">
                        {metric.label}
                      </dt>
                      <dd className="mt-1 font-mono text-sm text-[var(--accent-ink)]">
                        {metric.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}

              {project.links.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-4">
                  {project.links.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded text-sm text-[var(--accent-ink)] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
                    >
                      {link.label} ↗
                    </a>
                  ))}
                </div>
              )}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
