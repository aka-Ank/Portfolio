import type { SkillGroup } from "./schema";

// Grouped exactly the way the resume groups them, with two additions that are
// evidenced elsewhere in this file set rather than in the resume's own Skills
// block: "Core CS" comes from the listed coursework (see education.coursework),
// and "Web & Databases" from the two SDE projects. Nothing here is a claim the
// rest of the site cannot back up.
export const skillGroups: SkillGroup[] = [
  {
    id: "languages",
    label: "Languages",
    items: ["Python", "Java", "C++", "SQL"],
  },
  {
    id: "core-cs",
    label: "Core CS",
    items: [
      "Data Structures & Algorithms",
      "Database Management Systems",
      "Operating Systems",
      "Probability & Statistics",
    ],
  },
  {
    id: "machine-learning",
    label: "Machine Learning",
    items: ["PyTorch", "TensorFlow", "Scikit-learn", "XGBoost", "Pandas", "NumPy"],
  },
  {
    id: "data-modeling",
    label: "Data & Modeling",
    items: [
      "PySpark",
      "Feature Engineering",
      "Data Preprocessing",
      "Exploratory Data Analysis",
      "Cross Validation",
      "Model Evaluation",
    ],
  },
  {
    id: "web-databases",
    label: "Web & Databases",
    items: ["React", "Node.js", "Express", "MongoDB", "MySQL"],
  },
  {
    id: "tools",
    label: "Tools",
    items: ["Git", "GitHub", "Linux", "VS Code", "Jupyter Notebook"],
  },
];
