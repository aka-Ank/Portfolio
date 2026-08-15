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

/** The two tracks the portfolio splits projects into — software engineering
 * vs. applied ML. Deliberately strict: a visitor should immediately see that
 * both are real, not that one is a side interest. */
export type ProjectTrack = "sde" | "aiml";

export interface Project {
  slug: string;
  title: string;
  track: ProjectTrack;
  summary: string;
  description: string;
  role: string;
  stack: string[];
  /** Only facts that appear in the resume. No invented numbers — several of
   * these projects genuinely have no published metrics yet, and an empty
   * list is the honest representation of that. */
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
