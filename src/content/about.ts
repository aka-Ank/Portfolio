import type { AboutContent } from "./schema";

// Grounded in the resume. Written as a professional summary — who he is, what
// he builds, and what kind of work he wants. No narrative framing.
export const about: AboutContent = {
  name: "Ankit Chaudhary",
  role: "Software & AI/ML Engineer",
  tagline: "I build software systems and the machine learning that runs inside them.",
  bio: [
    "I'm a B.Tech Computer Engineering student at Pandit Deendayal Energy University, working across two tracks: full-stack software engineering and applied machine learning.",
    "On the software side I've built a genealogy platform with a three-tier role hierarchy and a MERN hostel management system with real allocation logic. On the ML side I've built end-to-end pipelines — anti-money-laundering detection, spatio-temporal flood forecasting, and distributed traffic analysis in PySpark.",
    "As an ML intern at Multitech Support & Development I focused on the part that makes the rest reusable: modular preprocessing and training pipelines, evaluation against real metrics, and documentation someone else can pick up. That's the work I want more of.",
  ],
};
