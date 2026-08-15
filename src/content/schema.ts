// Shared content types — both the immersive world and /classic read only
// from src/content/*, never duplicate copy between the two. See
// docs/02-architecture.md "content/" and docs/08-roadmap.md Phase 3.

export interface AboutContent {
  name: string;
  role: string;
  tagline: string;
  themes: string[];
  bio: string[];
}

export type SkillDomain = "frontend" | "backend" | "ai-ml" | "cloud-infra";

export interface Skill {
  id: string;
  domain: SkillDomain;
  name: string;
  /** 0-1 — drives the Sanctuary creature's Aether-marking intensity/size. */
  proficiency: number;
  /** Symbolic creature representing this skill domain — see docs/03 §4. */
  creature: string;
  description: string;
}

export interface ProjectMetric {
  label: string;
  value: string;
}

export interface Project {
  slug: string;
  title: string;
  summary: string;
  description: string;
  role: string;
  stack: string[];
  metrics: ProjectMetric[];
  links: { label: string; href: string }[];
  featured: boolean;
}

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  date: string;
  significance: string;
  credentialUrl?: string;
}

export interface BlogPostMeta {
  slug: string;
  title: string;
  summary: string;
  date: string;
  tags: string[];
}

export interface ResumeData {
  name: string;
  role: string;
  email: string;
  location: string;
  summary: string;
}
