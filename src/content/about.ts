import type { AboutContent } from "./schema";

// Real content — grounded in the resume. The narrative framing is written
// for this site's voice, but every concrete claim (what he studies, where,
// what he's built, what he's worked with) traces back to the resume.
export const about: AboutContent = {
  name: "Ankit Chaudhary",
  role: "Software & AI/ML Engineer",
  tagline: "I build on both tracks — the system and the model.",
  themes: [
    "Two tracks, one engineer — full-stack systems and applied machine learning",
    "Pipelines over one-offs — reusable modules beat scripts that run once",
    "Measured, not assumed — models get evaluated properly or they don't ship",
  ],
  bio: [
    "I'm a B.Tech Computer Engineering student at Pandit Deendayal Energy University in Gandhinagar, working across two tracks that usually get treated as separate careers: building software systems, and building the machine learning that runs inside them.",
    "On the software side that's meant full-stack work — a genealogy platform handling multiple family trees under one shared user base, a MERN hostel management system with real allocation logic. On the ML side it's meant end-to-end pipelines: anti-money-laundering detection on the SAML-D dataset, spatio-temporal flood forecasting over station graphs, distributed traffic analysis in PySpark.",
    "As an ML intern at Multitech Support & Development I spent my time on the unglamorous half of that work — modular preprocessing and training pipelines, honest evaluation against real metrics, and documentation that let someone else pick the work up. That's the part I keep coming back to.",
  ],
};
