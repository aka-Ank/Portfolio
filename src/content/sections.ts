import { about } from "./about";
import { resume, contact, availability, education, experience } from "./resume";
import { getProjectsByTrack } from "./projects";
import { skillGroups } from "./skills";
import { certifications } from "./certifications";

/** The eight sections, in reading order. One source of truth for the
 * navigator, the scroll observer, the footer, and /classic's anchors. */
export type SectionId =
  | "hero"
  | "about"
  | "experience"
  | "sde"
  | "aiml"
  | "skills"
  | "education"
  | "contact";

export interface SectionMeta {
  id: SectionId;
  /** Shown in the navigator and the classic-mode header. */
  label: string;
}

export const SECTIONS: SectionMeta[] = [
  { id: "hero", label: "Home" },
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "sde", label: "SDE Projects" },
  { id: "aiml", label: "AI/ML Projects" },
  { id: "skills", label: "Skills" },
  { id: "education", label: "Education" },
  { id: "contact", label: "Contact" },
];

export const SECTION_IDS = SECTIONS.map((s) => s.id);

export function sectionMeta(id: SectionId): SectionMeta {
  const found = SECTIONS.find((s) => s.id === id);
  if (!found) throw new Error(`Unknown section: ${id}`);
  return found;
}

// ---------------------------------------------------------------------------
// Section copy. Every concrete claim traces back to src/content/*, which in
// turn traces back to the resume — the framing is this site's voice, the facts
// are not invented here.
// ---------------------------------------------------------------------------

export const heroContent = {
  name: about.name,
  role: about.role,
  tagline: about.tagline,
  location: resume.location,
  email: resume.email,
  availability,
  links: [
    { label: "GitHub", href: contact.github },
    { label: "LinkedIn", href: contact.linkedin },
  ],
  resumeHref: contact.resume,
  primaryCta: { label: "View projects", target: "sde" as SectionId },
  secondaryCta: { label: "Get in touch", target: "contact" as SectionId },
};

export const aboutContent = {
  heading: "About",
  bio: about.bio,
};

/**
 * The About section's one meta line.
 *
 * Every entry restates a fact that already appears elsewhere on this page — it
 * is a shortcut for a skimming reader, never a place to introduce a claim the
 * resume does not support. That redundancy is exactly why it is a single line
 * of text rather than the four-row panel it used to be: as a panel it was
 * taller than the summary it sat beside, and none of it was new information.
 *
 * Each entry is self-describing, so the line needs no labels to be read.
 */
export const glanceContent = [
  resume.location,
  `${education.degree}, ${education.institution}`,
  `Graduating ${education.period.split("–")[1].trim()}`,
];

export const experienceContent = {
  heading: "Experience",
  experience,
};

export const sdeContent = {
  heading: "SDE Projects",
  blurb: "Full-stack work, where the interesting problem is usually structure rather than storage.",
  projects: getProjectsByTrack("sde"),
};

export const aimlContent = {
  heading: "AI/ML Projects",
  blurb: "Applied machine learning end to end — preprocessing, training, and evaluation that is actually measured.",
  projects: getProjectsByTrack("aiml"),
};

export const skillsContent = {
  heading: "Skills",
  groups: skillGroups,
};

export const educationContent = {
  heading: "Education",
  education,
  certifications,
};

export const contactContent = {
  heading: "Contact",
  body: "I'm open to internships and to talking about software or machine-learning work. The fastest way to reach me is email.",
  email: resume.email,
  resumeHref: contact.resume,
  links: [
    { label: "GitHub", href: contact.github },
    { label: "LinkedIn", href: contact.linkedin },
  ],
};
