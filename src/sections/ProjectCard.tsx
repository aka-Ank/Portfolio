import { ArrowUpRight, Plus } from "lucide-react";
import type { Project } from "@/content/schema";

/**
 * One project, collapsed to what you skim for and expandable to the rest.
 *
 * The collapsed face carries the title, the year, the one-line summary **and
 * the stack** — the four things someone decides on. An earlier version hid the
 * stack behind the toggle, which made the collapsed state useless and is why
 * it was flattened; the fix was to promote the stack, not to abandon
 * disclosure.
 *
 * A native `<details>` with a shared `name`, which makes the group an
 * exclusive accordion — opening one closes the others — with **no JavaScript
 * at all**. It is keyboard- and screen-reader-correct for free, works before
 * hydration, and the open/close easing is the pure-CSS `::details-content`
 * transition in globals.css. Where `interpolate-size` is unsupported the card
 * simply opens instantly, which is a perfectly good outcome.
 */
export function ProjectCard({ project, group }: { project: Project; group: string }) {
  return (
    <details
      name={group}
      className="group rounded-xl border border-[var(--border-soft)] bg-[var(--surface)] backdrop-blur-md transition-colors duration-300 hover:border-[var(--accent-ink)] open:border-[var(--accent-ink)]"
    >
      <summary className="cursor-pointer list-none rounded-[inherit] p-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-[family-name:var(--font-display)] text-2xl leading-tight text-[var(--ink)]">
            {project.title}
          </h3>
          <span className="shrink-0 font-mono text-xs text-[var(--ink-muted)]">{project.year}</span>
        </div>

        <p className="mt-2.5 text-[15px] leading-relaxed text-[var(--ink)]">{project.summary}</p>

        <div className="mt-4 flex items-end justify-between gap-4">
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

          {/* The affordance has to read as "there is more here", so it is a
              labelled control rather than a bare icon. The label is inside the
              summary, so it is part of the disclosure's accessible name. */}
          <span className="flex shrink-0 items-center gap-1.5 text-[13px] text-[var(--accent-ink)]">
            <span>Details</span>
            <Plus
              aria-hidden
              className="h-4 w-4 transition-transform duration-300 group-open:rotate-45 motion-reduce:transition-none"
            />
          </span>
        </div>
      </summary>

      {/* No wrapper div for the animation: `::details-content` already targets
          everything after the <summary>, so the easing has nothing to hang on
          that this element would provide. */}
      <div className="border-t border-[var(--border-soft)] px-6 pb-6 pt-5">
          <dl className="space-y-3 text-[15px] leading-relaxed">
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
            <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2">
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

          {project.links.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-4">
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
    </details>
  );
}
