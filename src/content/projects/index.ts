import type { Project, ProjectTrack } from "../schema";

// Real projects, sourced from Ankit_Chaudhary_SDE_Resume.tex and
// Ankit_Chaudhary_AI_ML_Resume.tex.
//
// Two deliberate omissions, not oversights: the SDE resume carries its own
// "[ADD REAL NUMBER IF AVAILABLE]" (Smart Traffic dataset size) and
// "[ADD IF TRUE]" (Smart Hostel auth/deployment) markers. Those bullets are
// left out entirely rather than guessed at — an empty `metrics` array is the
// honest representation of a project whose numbers aren't published yet.
export const projects: Project[] = [
  // ---------- SDE track ----------
  {
    slug: "hamro-vanshavali",
    title: "Hamro Vanshavali",
    track: "sde",
    summary: "A full-stack genealogy platform for multiple family trees under one shared user base.",
    description:
      "A genealogy platform supporting independent family trees for multiple clans under a shared user base. The interesting problem is access rather than storage: a Super Admin / Admin / User role hierarchy layered over an authentication flow, so separate clans stay isolated from each other while still living in one system.",
    role: "Contributor",
    stack: ["Full-stack", "Authentication", "RBAC"],
    metrics: [
      { label: "Status", value: "In progress" },
      { label: "Access model", value: "3-tier RBAC" },
    ],
    links: [{ label: "GitHub", href: "https://github.com/aka-Ank/hamro-vanshavali" }],
    featured: true,
  },
  {
    slug: "smart-hostel-management",
    title: "Smart Hostel Management System",
    track: "sde",
    summary: "A MERN-stack hostel system where wardens configure layouts and allocation runs both ways.",
    description:
      "A MERN-stack hostel management application built around the warden's actual workflow: configure the room layout first, then assign students through either automatic or manual allocation. Supporting both paths matters — automatic allocation handles the bulk intake, manual handles every real-world exception that follows.",
    role: "Developer",
    stack: ["MongoDB", "Express", "React", "Node.js"],
    metrics: [
      { label: "Stack", value: "MERN" },
      { label: "Allocation", value: "Auto + manual" },
    ],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/aka-Ank/Smart-Hostel-Management-System-using-MERN",
      },
    ],
    featured: true,
  },

  // ---------- AI/ML track ----------
  {
    slug: "aml-detection",
    title: "Anti-Money Laundering Detection Pipeline",
    track: "aiml",
    summary: "An end-to-end AML detection pipeline on the SAML-D dataset, XGBoost + FT-Transformer.",
    description:
      "An end-to-end pipeline — preprocessing, feature engineering, training, evaluation — built on the SAML-D dataset using an XGBoost + FT-Transformer ensemble. Training and evaluation are reusable modules with Stratified K-Fold cross-validation rather than a single notebook run, and the evaluation covers Precision, Recall, F1, ROC-AUC and PR-AUC. Also includes exploratory GNN-based transaction-graph analysis with PyTorch Geometric.",
    role: "Developer",
    stack: ["Python", "XGBoost", "Scikit-learn", "Pandas", "PyTorch Geometric"],
    metrics: [
      { label: "Dataset", value: "SAML-D" },
      { label: "Validation", value: "Stratified K-Fold" },
      { label: "Year", value: "2026" },
    ],
    links: [{ label: "GitHub", href: "https://github.com/aka-Ank/AML-Detection" }],
    featured: true,
  },
  {
    slug: "flood-prediction-stgcn",
    title: "Flood Prediction with Spatio-Temporal GNNs",
    track: "aiml",
    summary: "Spatio-temporal forecasting over a graph of meteorological and hydrological stations.",
    description:
      "Flood forecasting modelled as a graph problem: meteorological and hydrological stations become nodes, and a PyTorch spatio-temporal model learns over both the spatial relationships between stations and the temporal signal at each one. A large part of the work was upstream of the model — missing-value handling and temporal preprocessing on station data that is rarely complete.",
    role: "Developer",
    stack: ["Python", "PyTorch", "STGCN"],
    metrics: [
      { label: "Approach", value: "Spatio-temporal GNN" },
      { label: "Year", value: "2026" },
    ],
    links: [],
    featured: true,
  },
  {
    slug: "smart-traffic-pyspark",
    title: "Smart Traffic Management with PySpark",
    track: "aiml",
    summary: "Scalable ETL and distributed congestion analysis over large-scale traffic datasets.",
    description:
      "Scalable ETL pipelines built with Apache Spark to process large-scale traffic datasets, feeding distributed congestion analysis that turns raw traffic records into usable insight for traffic management.",
    role: "Developer",
    stack: ["PySpark", "Apache Spark", "Python"],
    metrics: [
      { label: "Engine", value: "Apache Spark" },
      { label: "Year", value: "2025" },
    ],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/aka-Ank/Smart-Traffic-Management-System-Using-PySpark",
      },
    ],
    featured: false,
  },
  {
    slug: "house-price-prediction",
    title: "House Price Prediction with Neural Networks",
    track: "aiml",
    summary: "TensorFlow regression models with preprocessing and hyperparameter tuning.",
    description:
      "TensorFlow regression models for house price prediction, with the pipeline work — preprocessing and hyperparameter tuning — treated as part of the model rather than an afterthought.",
    role: "Developer",
    stack: ["Python", "TensorFlow"],
    metrics: [
      { label: "Framework", value: "TensorFlow" },
      { label: "Year", value: "2025" },
    ],
    links: [],
    featured: false,
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getProjectsByTrack(track: ProjectTrack): Project[] {
  return projects.filter((p) => p.track === track);
}
