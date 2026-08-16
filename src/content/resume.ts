import type { ResumeData } from "./schema";

// Real resume data, sourced from resume/Ankit_Chaudhary_AI_ML_Resume.pdf.
// Nothing here is invented; if a fact isn't in that document, it doesn't
// belong in this file.
export const resume: ResumeData = {
  name: "Ankit Chaudhary",
  role: "Software & AI/ML Engineer",
  email: "chaudharyankit159@gmail.com",
  location: "Gandhinagar, Gujarat, India",
  summary:
    "B.Tech Computer Engineering student at Pandit Deendayal Energy University, building across both tracks — full-stack systems and applied machine learning pipelines.",
};

export const contact = {
  github: "https://github.com/aka-Ank",
  linkedin: "https://linkedin.com/in/ankit-chaudhary-ba4762295",
  /** Served by /api/resume as a generated PDF. */
  resume: "/api/resume",
};

/** The hero's status pill. Short by design — a pill that wraps stops being a
 * pill. Change the copy here; nothing else reads it. */
export const availability = "Open to internships";

export const education = {
  institution: "Pandit Deendayal Energy University",
  location: "Gandhinagar, Gujarat",
  degree: "B.Tech in Computer Engineering",
  period: "2023 – 2027",
  cgpa: "8.78 / 10",
  coursework: [
    "Machine Learning",
    "Data Structures & Algorithms",
    "Database Management Systems",
    "Operating Systems",
    "Probability & Statistics",
  ],
};

export const experience = {
  company: "Multitech Support & Development",
  role: "Machine Learning Intern",
  period: "May 2026 – Jul 2026",
  location: "India",
  highlights: [
    "Built machine learning solutions in Python against real-world datasets.",
    "Performed preprocessing, feature engineering, exploratory data analysis and model evaluation.",
    "Prepared technical documentation and collaborated with mentors on AI projects.",
  ],
};
