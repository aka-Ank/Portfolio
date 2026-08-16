// Shared content types. Both the main site and /classic read only from
// src/content/*, never duplicate copy between the two.

export interface AboutContent {
  name: string;
  role: string;
  /** One line under the name in the hero. */
  tagline: string;
  /** Short professional summary — a few sentences, not an essay. */
  bio: string[];
}

/** A named group of skills, mirroring how the resume itself groups them. No
 * proficiency ratings: the resume states none, and inventing them would be an
 * unearned claim. */
export interface SkillGroup {
  id: string;
  label: string;
  items: string[];
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
  /** One line, shown directly under the title. */
  summary: string;
  /** The problem the project solves — why it exists. */
  problem: string;
  /** What was actually built, in the first person. */
  contribution: string;
  stack: string[];
  /** Only facts that appear in the resume. No invented numbers — several of
   * these projects genuinely have no published metrics, and an empty list is
   * the honest representation of that. */
  metrics: ProjectMetric[];
  links: { label: string; href: string }[];
  year: string;
}

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  year: string;
  detail: string;
  credentialUrl?: string;
}

export interface ResumeData {
  name: string;
  role: string;
  email: string;
  location: string;
  summary: string;
}
