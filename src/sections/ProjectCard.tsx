import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/content/schema";

/**
 * One project, fully visible.
 *
 * Everything a reader needs to judge the work — what it is, the problem, what
 * was built, the stack, the links — is on the face of the card. An earlier
 * version hid all of it behind a `<details>` disclosure, which meant the
 * default state of the projects section was six titles and nothing else.
 * A recruiter skimming does not open six accordions.
 */
export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface)] p-6 backdrop-blur-md transition-colors duration-300 hover:border-[var(--accent-ink)] sm:p-7">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="font-[family-name:var(--font-display)] text-2xl leading-tight text-[var(--ink)]">
          {project.title}
        </h3>
        <span className="shrink-0 font-mono text-xs text-[var(--ink-muted)]">{project.year}</span>
      </div>

      <p className="mt-3 text-[15px] leading-relaxed text-[var(--ink)]">{project.summary}</p>

      <dl className="mt-5 space-y-3 border-t border-[var(--border-soft)] pt-5 text-[15px] leading-relaxed">
        <div>
          <dt className="font-mono text-[11px] uppercase tracking-wider text-[var(--ink-muted)]">
            Problem
          </dt>
          <dd className="mt-1 text-[var(--ink-muted)]">{project.problem}</dd>
        </div>
        <div>
          <dt className="font-mono text-[11px] uppercase tracking-wider text-[var(--ink-muted)]">
            What I built
          </dt>
          <dd className="mt-1 text-[var(--ink-muted)]">{project.contribution}</dd>
        </div>
      </dl>

      {project.metrics.length > 0 && (
        <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-2">
          {project.metrics.map((metric) => (
            <div key={metric.label} className="flex items-baseline gap-2">
              <dt className="font-mono text-[11px] uppercase tracking-wider text-[var(--ink-muted)]">
                {metric.label}
              </dt>
              <dd className="font-mono text-sm text-[var(--accent-ink)]">{metric.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <ul className="flex flex-wrap gap-1.5">
          {project.stack.map((tech) => (
            <li
              key={tech}
              className="rounded-md border border-[var(--border-soft)] px-2.5 py-1 font-mono text-[11px] text-[var(--ink-muted)]"
            >
              {tech}
            </li>
          ))}
        </ul>

        {project.links.length > 0 && (
          <ul className="flex flex-wrap gap-4">
            {project.links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 rounded text-sm text-[var(--accent-ink)] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
                >
                  {link.label}
                  <ArrowUpRight aria-hidden className="h-3.5 w-3.5" />
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
