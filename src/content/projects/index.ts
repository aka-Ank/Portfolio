import type { Project } from "../schema";

// PLACEHOLDER PROJECTS — real case studies replace these before launch.
// Kept to two for now; the Lab scene's layout should stay legible whether
// there are two projects or twelve.
export const projects: Project[] = [
  {
    slug: "realtime-render-pipeline",
    title: "Real-Time Render Pipeline",
    summary: "A WebGL rendering pipeline built for large scenes on modest hardware.",
    description:
      "Rebuilt a customer-facing 3D configurator's render path around instancing, texture streaming, and an adaptive quality governor, targeting 60fps on mid-tier laptops without a visible drop in fidelity on high-end ones.",
    role: "Lead engineer",
    stack: ["TypeScript", "Three.js", "WebGL", "React"],
    metrics: [
      { label: "Frame time", value: "-62%" },
      { label: "Load size", value: "-48%" },
      { label: "Devices supported", value: "3x" },
    ],
    links: [{ label: "Case study", href: "#" }],
    featured: true,
  },
  {
    slug: "agent-orchestration-service",
    title: "Agent Orchestration Service",
    summary: "A backend service coordinating multiple LLM agents against a shared task queue.",
    description:
      "Designed the state machine and retry/backoff logic for a multi-agent system handling long-running, interruptible tasks — the part of agent infrastructure that doesn't show up in demos but is the difference between a toy and a product.",
    role: "Backend engineer",
    stack: ["Node.js", "PostgreSQL", "Redis", "TypeScript"],
    metrics: [
      { label: "Task success rate", value: "+34%" },
      { label: "P99 latency", value: "-40%" },
    ],
    links: [{ label: "Case study", href: "#" }],
    featured: true,
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
