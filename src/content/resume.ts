import type { ResumeData } from "./schema";

// Real resume data — sourced from Ankit_Chaudhary_SDE_Resume.tex and
// Ankit_Chaudhary_AI_ML_Resume.tex. Nothing here is invented; if a fact
// isn't in one of those two documents, it doesn't belong in this file.
export const resume: ResumeData = {
  name: "Ankit Chaudhary",
  role: "Software & AI/ML Engineer",
  email: "chaudharyankit159@gmail.com",
  location: "Gandhinagar, Gujarat, India",
  summary:
    "B.Tech Computer Engineering student at Pandit Deendayal Energy University who builds across both tracks — full-stack systems and applied machine learning pipelines.",
};

export const contact = {
  phone: "+91-9429258575",
  github: "https://github.com/aka-Ank",
  linkedin: "https://linkedin.com/in/ankit-chaudhary-ba4762295",
};

export const education = {
  institution: "Pandit Deendayal Energy University",
  location: "Gandhinagar, Gujarat",
  degree: "B.Tech in Computer Engineering",
  period: "2023 – 2027",
  cgpa: "8.78/10",
  coursework: [
    "Data Structures & Algorithms",
    "Database Management Systems",
    "Operating Systems",
    "Machine Learning",
    "Probability & Statistics",
  ],
};

export const experience = {
  company: "Multitech Support & Development",
  role: "Machine Learning Intern",
  period: "May 2026 – Jul 2026",
  highlights: [
    "Designed modular Python pipelines for data preprocessing and model training, improving reusability across experiments",
    "Implemented and evaluated multiple prediction/classification models against standard ML metrics",
    "Performed preprocessing, feature engineering, exploratory data analysis and model evaluation on real-world datasets",
    "Collaborated using Git for version control; documented technical workflows and presented progress to mentors",
  ],
};
