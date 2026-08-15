import type { AboutContent } from "./schema";

// PLACEHOLDER CONTENT — replace with the real bio before launch. Structure
// and tone are final; the specifics are a stand-in so the Clearing scene has
// something real to render and test against. See SESSION.md Phase 1
// "deferred" notes.
export const about: AboutContent = {
  name: "Jordan Vale",
  role: "Software Engineer",
  tagline: "I build things that feel considered, not just functional.",
  themes: [
    "Craft over speed — most things worth building are worth building well",
    "Systems thinking — the interesting bugs live at the seams between parts",
    "Calm technology — software should earn attention, not demand it",
  ],
  bio: [
    "I'm a software engineer who cares as much about how something feels to use as whether it works. Most of my time goes into the seams — the state machines, the loading states, the moments where a system either holds together or quietly falls apart.",
    "I move between the front and back of the stack depending on what a problem actually needs, not what's comfortable. Lately that's meant a lot of time in 3D web, real-time systems, and the unglamorous work of making something fast enough that its craft is even visible.",
    "Outside of work, I'm usually taking something apart to see how it's built — a rendering pipeline, a synth patch, a hiking trail's elevation profile. The through-line is the same curiosity either way.",
  ],
};
