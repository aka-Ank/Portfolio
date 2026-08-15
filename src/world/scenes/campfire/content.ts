import { resume, contact } from "@/content/resume";

// Campfire — calm, emotionally memorable close. See docs/03-scene-graph.md §7.
export const campfireContent = {
  heading: "Thank you for staying a while.",
  body: "If any of this resonated, I'd like to hear from you.",
  email: resume.email,
  links: [
    { label: "GitHub", href: contact.github },
    { label: "LinkedIn", href: contact.linkedin },
  ],
};
