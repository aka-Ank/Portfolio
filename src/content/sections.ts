import { about } from "./about";
import { resume, contact, education, experience } from "./resume";
import { getProjectsByTrack } from "./projects";
import { skills } from "./skills";
import { certifications } from "./certifications";
import { blogPosts } from "./blog";

/** The eight sections, in journey order. One source of truth for the
 * navigator, the scroll observer, the footer, and /classic's anchors. */
export type SectionId =
  | "hero"
  | "about"
  | "sde"
  | "aiml"
  | "skills"
  | "education"
  | "signals"
  | "contact";

/** Atmospheric identity. Six moods across eight sections — the Jungle and the
 * Observatory each carry two beats, so the palette drifts within a mood
 * rather than resetting at every section boundary. */
export type MoodId =
  | "meadow"
  | "valley"
  | "grove"
  | "jungle"
  | "observatory"
  | "campfire";

export interface SectionMeta {
  id: SectionId;
  /** Shown in the navigator and the classic-mode header. */
  label: string;
  /** The mood's own name, shown as a section eyebrow. */
  place: string;
  mood: MoodId;
  /** Position on the 0–1 time-of-day ring when time follows the journey.
   * Monotonic across the eight sections: dawn at the meadow, deep night at
   * the campfire, so the progression is felt without being labelled. */
  timeOfDay: number;
}

export const SECTIONS: SectionMeta[] = [
  { id: "hero", label: "Welcome", place: "Entrance Meadow", mood: "meadow", timeOfDay: 0.04 },
  { id: "about", label: "About", place: "Moss River Valley", mood: "valley", timeOfDay: 0.16 },
  { id: "sde", label: "Engineering", place: "Ancient Grove", mood: "grove", timeOfDay: 0.3 },
  { id: "aiml", label: "AI / ML", place: "Mechanical Jungle", mood: "jungle", timeOfDay: 0.44 },
  { id: "skills", label: "Skills", place: "Mechanical Jungle", mood: "jungle", timeOfDay: 0.56 },
  { id: "education", label: "Background", place: "Moonlit Observatory", mood: "observatory", timeOfDay: 0.68 },
  { id: "signals", label: "Signals", place: "Moonlit Observatory", mood: "observatory", timeOfDay: 0.82 },
  { id: "contact", label: "Contact", place: "Campfire Terminal", mood: "campfire", timeOfDay: 0.94 },
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
  eyebrow: about.role,
  name: about.name,
  tagline: about.tagline,
  /** The SDE + AIML split, stated plainly on the first screen. */
  split: [
    {
      track: "sde" as const,
      label: "Software Engineering",
      line: "Full-stack systems — access control, allocation logic, the parts that have to hold.",
    },
    {
      track: "aiml" as const,
      label: "AI / Machine Learning",
      line: "End-to-end pipelines — preprocessing, training, and evaluation that's actually measured.",
    },
  ],
  primaryCta: { label: "See the work", target: "sde" as SectionId },
  secondaryCta: { label: "Get in touch", target: "contact" as SectionId },
};

export const aboutContent = {
  heading: "Two tracks, one engineer",
  role: about.role,
  bio: about.bio,
  themes: about.themes,
};

export const sdeContent = {
  heading: "Systems that have to hold",
  blurb:
    "Software work, where the interesting problem is usually structure rather than storage — who may see what, and what happens when the ordinary path doesn't apply.",
  projects: getProjectsByTrack("sde"),
};

export const aimlContent = {
  heading: "Models, measured honestly",
  blurb:
    "Applied machine learning end to end — preprocessing, training, and evaluation against real metrics rather than a single flattering number.",
  projects: getProjectsByTrack("aiml"),
};

export const skillsContent = {
  heading: "What I work with",
  blurb: "Every skill here traces to shipped project work or the internship — the description says which.",
  skills,
};

export const educationContent = {
  heading: "Where this comes from",
  education,
  experience,
};

export const signalsContent = {
  heading: "A record, not a highlight reel",
  blurb: "What's certified, what's written, what's measured.",
  certifications: [...certifications].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  ),
  blogPosts,
};

export const contactContent = {
  heading: "Thank you for staying a while.",
  body: "If any of this resonated, I'd like to hear from you.",
  email: resume.email,
  links: [
    { label: "GitHub", href: contact.github },
    { label: "LinkedIn", href: contact.linkedin },
  ],
};
