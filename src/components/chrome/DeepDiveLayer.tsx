"use client";

import { AnimatePresence } from "motion/react";
import { useWorldStore } from "@/world/state/useWorldStore";
import { getProject } from "@/content/projects";
import { ProjectDeepDive } from "@/world/scenes/lab/ProjectDeepDive";

/**
 * Renders the deep-dive panel for whatever `deepDiveId` currently is, by
 * checking each content registry in turn — projects today, certifications
 * once the Observatory scene wires its own deep-dive. See
 * docs/04-state-machines.md §2 "DeepDive" state.
 */
export function DeepDiveLayer() {
  const deepDiveId = useWorldStore((s) => s.deepDiveId);
  const phase = useWorldStore((s) => s.phase);

  if (phase !== "deep-dive" || !deepDiveId) return null;

  return (
    <AnimatePresence>
      {getProject(deepDiveId) && <ProjectDeepDive key={deepDiveId} slug={deepDiveId} />}
    </AnimatePresence>
  );
}
