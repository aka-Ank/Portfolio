import type { Skill } from "./schema";

// Skill -> symbolic creature mapping for the Animal Sanctuary (docs/03 §4).
// Proficiency values and the exact skill list are placeholders pending real
// input — the domain/creature pairing is the design decision worth keeping.
export const skills: Skill[] = [
  {
    id: "typescript",
    domain: "frontend",
    name: "TypeScript / React",
    proficiency: 0.9,
    creature: "fox",
    description: "Quick, precise, comfortable moving fast without breaking things.",
  },
  {
    id: "threejs",
    domain: "frontend",
    name: "Three.js / WebGL",
    proficiency: 0.75,
    creature: "owl",
    description: "Sees in the dark corners of the render pipeline others skip past.",
  },
  {
    id: "nodejs",
    domain: "backend",
    name: "Node.js / APIs",
    proficiency: 0.85,
    creature: "beaver",
    description: "Builds the structure everything else depends on, methodically.",
  },
  {
    id: "databases",
    domain: "backend",
    name: "Databases / Systems Design",
    proficiency: 0.8,
    creature: "badger",
    description: "Digs deep, defends the foundations, doesn't cut corners underground.",
  },
  {
    id: "ml",
    domain: "ai-ml",
    name: "Applied ML",
    proficiency: 0.65,
    creature: "raven",
    description: "Curious, pattern-hunting, comfortable with ambiguity.",
  },
  {
    id: "llm-tooling",
    domain: "ai-ml",
    name: "LLM Tooling / Agents",
    proficiency: 0.8,
    creature: "hare",
    description: "Fast-moving territory — learns and adapts before the terrain settles.",
  },
  {
    id: "cloud",
    domain: "cloud-infra",
    name: "Cloud / DevOps",
    proficiency: 0.7,
    creature: "deer",
    description: "Keeps a wide, watchful view of the whole system at once.",
  },
  {
    id: "perf",
    domain: "cloud-infra",
    name: "Performance Engineering",
    proficiency: 0.75,
    creature: "hawk",
    description: "Notices what's slow before anyone else does, moves to fix it directly.",
  },
];
