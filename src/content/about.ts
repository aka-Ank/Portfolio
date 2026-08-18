import type { AboutContent } from "./schema";

// Grounded in the resume. Written as a professional summary — who he is, what
// he builds, and what kind of work he wants. No narrative framing.
//
// Three short lines, deliberately. The previous version was three full
// paragraphs restating the projects and the internship, both of which have
// their own sections further down the page with more detail than a summary can
// carry — so it was the longest block on the site and the least informative.
// Anything here that a reader has to take on trust should be a fact they can
// check somewhere else on the page.
export const about: AboutContent = {
  name: "Ankit Chaudhary",
  role: "Software & AI/ML Engineer",
  tagline: "I build software systems and the machine learning that runs inside them.",
  // A personal principle, not a second tagline. It stays out of the hero and
  // out of the Person schema on purpose — see `Motto` for why.
  motto: "Embrace Imperfection. Chase Excellence.",
  // Two lines. The institution is deliberately absent: it is already in the
  // "At a glance" row directly below this and again in Education, and a summary
  // that repeats the fact sheet next to it is just noise.
  bio: [
    "I'm a B.Tech Computer Engineering student working across two tracks: full-stack software engineering, and applied machine learning end to end — preprocessing, training, and evaluation that's actually measured.",
    "The work I care about is the part that makes the rest reusable: clear structure, real metrics, and documentation someone else can pick up.",
  ],
};
