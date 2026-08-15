"use client";

import { useEffect } from "react";
import { motion } from "motion/react";
import { useWorldStore } from "@/world/state/useWorldStore";
import { getProject } from "@/content/projects";

/**
 * The Lab's deep-dive panel — architecture, outcome, visuals, per
 * docs/03-scene-graph.md §5. Shown when `deepDiveId` matches a project
 * slug; see chrome/DeepDiveLayer.tsx for the registry-lookup that routes
 * here vs. a future Observatory deep-dive.
 */
export function ProjectDeepDive({ slug }: { slug: string }) {
  const closeDeepDive = useWorldStore((s) => s.closeDeepDive);
  const project = getProject(slug);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeDeepDive();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeDeepDive]);

  if (!project) return null;

  return (
    <div className="pointer-events-auto fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        transition={{ type: "spring", stiffness: 140, damping: 22 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="deep-dive-title"
        className="max-h-[80vh] w-full max-w-xl overflow-y-auto rounded-lg bg-[var(--paper)] p-8 text-[var(--ink)] shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id="deep-dive-title" className="font-[family-name:var(--font-display)] text-3xl">
            {project.title}
          </h2>
          <button
            onClick={closeDeepDive}
            aria-label="Close"
            className="rounded px-2 py-1 text-[var(--muted-foreground)] outline-offset-2 hover:text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
          >
            Close ✕
          </button>
        </div>
        <p className="mt-1 text-sm tracking-wide text-[var(--muted-foreground)] uppercase">{project.role}</p>
        <p className="mt-4 text-[var(--ink)]">{project.description}</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {project.stack.map((tech) => (
            <span
              key={tech}
              className="rounded-full bg-[var(--secondary)] px-3 py-1 font-[family-name:var(--font-mono)] text-xs text-[var(--secondary-foreground)]"
            >
              {tech}
            </span>
          ))}
        </div>

        <dl className="mt-6 grid grid-cols-3 gap-4 border-t border-[var(--border)] pt-4">
          {project.metrics.map((metric) => (
            <div key={metric.label}>
              <dt className="text-xs text-[var(--muted-foreground)]">{metric.label}</dt>
              {/* --primary, not --accent — see LearningJourney.tsx's comment
                  (same fix, same root cause: --accent on --paper is 2.2:1,
                  fails AA). */}
              <dd className="font-[family-name:var(--font-mono)] text-xl text-[var(--primary)]">
                {metric.value}
              </dd>
            </div>
          ))}
        </dl>

        {project.links.length > 0 && (
          <div className="mt-6 flex gap-4 border-t border-[var(--border)] pt-4">
            {project.links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-[var(--primary)] underline-offset-4 hover:underline"
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
