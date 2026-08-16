import type { Project, ProjectTrack } from "../schema";

// The AI/ML projects are sourced from resume/Ankit_Chaudhary_AI_ML_Resume.pdf
// and stay within what that document actually claims. The two SDE projects are
// not in that PDF; their details come from the project repositories.
//
// No invented numbers. Several of these have no published metrics, and an
// empty `metrics` array is the honest representation of that.
export const projects: Project[] = [
  // ---------- SDE track ----------
  {
    slug: "hamro-vanshavali",
    title: "Hamro Vanshavali",
    track: "sde",
    summary: "A full-stack genealogy platform hosting many independent family trees on one user base.",
    problem:
      "Genealogy tools assume one family. Supporting several clans in one deployment makes access control the hard part — each tree has to stay private to its own members while the platform stays a single system.",
    contribution:
      "Built the platform around a Super Admin / Admin / User role hierarchy layered over the authentication flow, so trees remain isolated from one another without running separate deployments.",
    stack: ["React", "Node.js", "Express", "MongoDB", "Authentication", "RBAC"],
    metrics: [{ label: "Access model", value: "3-tier RBAC" }],
    links: [{ label: "GitHub", href: "https://github.com/aka-Ank/hamro-vanshavali" }],
    year: "2025",
  },
  {
    slug: "smart-hostel-management",
    title: "Smart Hostel Management System",
    track: "sde",
    summary: "A MERN hostel system where wardens configure the layout and allocation runs both ways.",
    problem:
      "Hostel allocation is mostly bulk intake, but every real intake has exceptions — transfers, medical cases, roommate requests. A system that only automates the bulk case gets abandoned at the first exception.",
    contribution:
      "Built the warden's workflow end to end: configure the room layout first, then assign students through either automatic allocation for the bulk intake or manual allocation for everything that follows.",
    stack: ["MongoDB", "Express", "React", "Node.js"],
    metrics: [{ label: "Allocation", value: "Automatic + manual" }],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/aka-Ank/Smart-Hostel-Management-System-using-MERN",
      },
    ],
    year: "2025",
  },

  // ---------- AI/ML track ----------
  {
    slug: "aml-detection",
    title: "Anti-Money Laundering Detection",
    track: "aiml",
    summary: "An end-to-end AML detection pipeline on the SAML-D dataset, evaluated across five metrics.",
    problem:
      "Money-laundering detection is a severe class-imbalance problem: flagging almost nothing scores well on accuracy and is useless. It has to be measured on the metrics that survive imbalance.",
    contribution:
      "Built the pipeline end to end — preprocessing, feature engineering, and an XGBoost classifier validated with 5-fold cross validation — then evaluated it on Precision, Recall, F1, ROC-AUC and PR-AUC rather than a single flattering number.",
    stack: ["Python", "XGBoost", "Scikit-learn", "Pandas", "NumPy"],
    metrics: [
      { label: "Dataset", value: "SAML-D" },
      { label: "Validation", value: "5-fold CV" },
    ],
    links: [{ label: "GitHub", href: "https://github.com/aka-Ank/AML-Detection" }],
    year: "2026",
  },
  {
    slug: "flood-prediction-stgcn",
    title: "Flood Prediction with Spatio-Temporal GNNs",
    track: "aiml",
    summary: "Forecasting over a graph of meteorological and hydrological monitoring stations.",
    problem:
      "Flooding at one station depends on what is happening upstream and on what happened hours ago. Treating each station as an independent time series discards the spatial half of the signal.",
    contribution:
      "Built graph representations from meteorological and hydrological station data and implemented PyTorch spatio-temporal forecasting models over them, with the upstream work — missing-value handling and temporal preprocessing — treated as part of the model.",
    stack: ["Python", "PyTorch", "STGCN"],
    metrics: [{ label: "Approach", value: "Spatio-temporal GNN" }],
    links: [],
    year: "2026",
  },
  {
    slug: "smart-traffic-pyspark",
    title: "Smart Traffic Management with PySpark",
    track: "aiml",
    summary: "Distributed ETL and congestion analysis over large-scale traffic datasets.",
    problem:
      "Traffic datasets outgrow single-machine processing quickly, and congestion analysis needs the whole record set rather than a sample to be worth acting on.",
    contribution:
      "Designed scalable ETL pipelines on Apache Spark to process large-scale traffic datasets, then analysed congestion patterns across the processed data.",
    stack: ["PySpark", "Apache Spark", "Python"],
    metrics: [{ label: "Engine", value: "Apache Spark" }],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/aka-Ank/Smart-Traffic-Management-System-Using-PySpark",
      },
    ],
    year: "2025",
  },
  {
    slug: "house-price-prediction",
    title: "House Price Prediction",
    track: "aiml",
    summary: "TensorFlow regression models with preprocessing and hyperparameter tuning.",
    problem:
      "Price regression is where an untuned baseline looks deceptively fine — most of the achievable error reduction sits in preprocessing and hyperparameters, not in the architecture.",
    contribution:
      "Built TensorFlow regression models and treated the pipeline work — preprocessing and hyperparameter tuning — as part of the model rather than an afterthought.",
    stack: ["Python", "TensorFlow", "NumPy"],
    metrics: [{ label: "Framework", value: "TensorFlow" }],
    links: [],
    year: "2025",
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getProjectsByTrack(track: ProjectTrack): Project[] {
  return projects.filter((p) => p.track === track);
}
