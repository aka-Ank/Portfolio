"use client";

import { motion } from "motion/react";
import { sanctuaryContent } from "./content";

// The 3D creatures reveal their skill via pointer hover only — mouse-only,
// with no keyboard focus and no touch equivalent (R3F meshes aren't part of
// the accessibility tree). This panel is the parallel semantic structure
// docs/07-accessibility-and-testing.md requires: every skill, always
// present in the DOM, reachable without ever touching the canvas. See
// ENGINEER_NOTES.md "Creature/milestone hover has no keyboard equivalent."
export function SanctuaryOverlay() {
  return (
    <div className="pointer-events-none flex h-full flex-col items-start justify-between px-8 py-28">
      <div>
        <motion.h2
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 110, damping: 20 }}
          className="font-[family-name:var(--font-display)] text-4xl text-[var(--ink-inverse)]"
        >
          {sanctuaryContent.heading}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 0.85, x: 0 }}
          transition={{ type: "spring", stiffness: 110, damping: 20, delay: 0.15 }}
          className="mt-2 max-w-sm text-[var(--ink-inverse)]"
        >
          {sanctuaryContent.intro}
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        // tabIndex/role/label: this panel scrolls but holds only text, so a
        // keyboard user had no way to scroll it and no way to reach the
        // skills below the fold. axe flagged it as scrollable-region-focusable
        // (serious) at the Sanctuary chapter. Panels whose children are
        // already focusable (LabOverlay's project buttons) don't need this.
        tabIndex={0}
        role="region"
        aria-label="Skills"
        className="pointer-events-auto max-h-[60vh] max-w-sm overflow-y-auto rounded-lg bg-[var(--scrim)] p-5 backdrop-blur-sm outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
      >
        <div className="font-[family-name:var(--font-mono)] text-xs tracking-wide text-[var(--ink-inverse)] uppercase opacity-70">
          Skills
        </div>
        <dl className="mt-2 flex flex-col gap-3">
          {sanctuaryContent.skills.map((skill) => (
            <div key={skill.id}>
              <dt className="text-sm font-semibold text-[var(--ink-inverse)]">{skill.name}</dt>
              <dd className="mt-0.5 text-xs text-[var(--ink-inverse)]/70">{skill.description}</dd>
            </div>
          ))}
        </dl>
      </motion.div>
    </div>
  );
}
