import { education, experience } from "@/content/resume";

// Knowledge River — learning, iteration, growth. See docs/03-scene-graph.md §3.
// Milestones are the real timeline from the resume (degree start, project
// years, internship, expected graduation) — no invented "formative incident"
// beats, which is what used to live here.
export const riverContent = {
  heading: "Knowledge River",
  intro:
    "Learning has never been a straight line — more like a current: constant, occasionally rough, always moving somewhere.",
  education,
  experience,
  // `id` rather than `year` as the React key — two real milestones share
  // 2026 (the ML projects and the internship), which would collide.
  milestones: [
    {
      id: "degree-start",
      year: "2023",
      label: `Started ${education.degree} at ${education.institution}.`,
    },
    {
      id: "first-data-scale",
      year: "2025",
      label:
        "First data-scale work — distributed traffic analysis in PySpark, TensorFlow regression, and an NPTEL elite certificate in advanced R.",
    },
    {
      id: "applied-ml",
      year: "2026",
      label:
        "Deeper into applied ML — anti-money-laundering detection on SAML-D and spatio-temporal flood forecasting.",
    },
    {
      id: "internship",
      year: "2026",
      label: `${experience.role} at ${experience.company} — modular pipelines, honest evaluation, documented handoff.`,
    },
    { id: "graduation", year: "2027", label: "Expected graduation." },
  ],
};
