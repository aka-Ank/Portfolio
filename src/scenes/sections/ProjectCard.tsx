import type { Project } from "@/content/schema";
import { cn } from "@/lib/utils";

/** The two tracks get two skins of one card, never two components. Same
 * information architecture, different material: the Grove's is organic and
 * prose-led, the Jungle's is instrumented and data-led. */
type Skin = "organic" | "instrumented";

/**
 * A native `<details>` rather than JS state. It is keyboard- and
 * screen-reader-correct for free, works before hydration, and the open/close
 * easing is pure CSS (see globals.css) — so an expanding card costs nothing
 * and cannot desync from the DOM.
 */
export function ProjectCard({ project, skin }: { project: Project; skin: Skin }) {
  const instrumented = skin === "instrumented";

  return (
    <details
      className={cn(
        "group border bg-[var(--surface)] backdrop-blur-md transition-colors",
        "border-[var(--border-soft)] open:bg-[var(--surface-raised)]",
        instrumented ? "rounded-md" : "rounded-2xl",
      )}
    >
      <summary
        className={cn(
          "cursor-pointer list-none rounded-[inherit] p-6",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]",
        )}
      >
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <h3
              className={cn(
                "text-[var(--ink)]",
                instrumented
                  ? "font-[family-name:var(--font-sans)] text-xl font-medium tracking-tight"
                  : "font-[family-name:var(--font-display)] text-2xl",
              )}
            >
              {project.title}
            </h3>
            <p className="mt-2 text-[15px] leading-relaxed text-[var(--ink-muted)]">
              {project.summary}
            </p>
          </div>
          <span
            aria-hidden
            className="mt-1 shrink-0 text-xl leading-none text-[var(--ink-muted)] transition-transform duration-300 group-open:rotate-45"
          >
            +
          </span>
        </div>

        {/* The instrumented skin leads with its numbers; the organic skin
            keeps them inside, because its projects are about structure
            rather than measurement. */}
        {instrumented && project.metrics.length > 0 && (
          <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-3 border-t border-[var(--border-soft)] pt-4">
            {project.metrics.map((metric) => (
              <div key={metric.label}>
                <dt className="font-mono text-[11px] uppercase tracking-wider text-[var(--ink-muted)]">
                  {metric.label}
                </dt>
                <dd className="mt-1 font-mono text-sm text-[var(--accent-ink)]">{metric.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </summary>

      <div className="details-body">
        <div className="border-t border-[var(--border-soft)] px-6 pb-6 pt-5">
          <p className="font-mono text-[11px] uppercase tracking-wider text-[var(--ink-muted)]">
            {project.role}
          </p>
          <p className="mt-3 leading-relaxed text-[var(--ink)]">{project.description}</p>

          <ul className="mt-5 flex flex-wrap gap-2">
            {project.stack.map((tech) => (
              <li
                key={tech}
                className={cn(
                  "border border-[var(--border-soft)] px-3 py-1 font-mono text-xs text-[var(--ink-muted)]",
                  instrumented ? "rounded-sm" : "rounded-full",
                )}
              >
                {tech}
              </li>
            ))}
          </ul>

          {!instrumented && project.metrics.length > 0 && (
            <dl className="mt-5 flex flex-wrap gap-x-10 gap-y-3">
              {project.metrics.map((metric) => (
                <div key={metric.label}>
                  <dt className="text-xs text-[var(--ink-muted)]">{metric.label}</dt>
                  <dd className="mt-1 text-[var(--accent-ink)]">{metric.value}</dd>
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
      </div>
    </details>
  );
}
