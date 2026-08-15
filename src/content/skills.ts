import type { Skill } from "./schema";

// Real skills, taken from the resume's own Skills section.
//
// On `proficiency`: the resume states no self-ratings, and inventing them
// would be exactly the kind of unearned claim this project forbids. So the
// value here is *derived from evidence*, by one consistent rule:
//   0.9  — used in the internship AND in shipped project work
//   0.8  — used across multiple projects
//   0.7  — used in one project, or covered in formal coursework
// Each description states the evidence, so the number is checkable rather
// than asserted. If the rule changes, change it here and nowhere else.
export const skills: Skill[] = [
  {
    id: "python",
    domain: "ai-ml",
    name: "Python",
    proficiency: 0.9,
    creature: "raven",
    description:
      "The through-line of every ML project and the internship — pipelines, preprocessing, evaluation.",
  },
  {
    id: "ml-pipelines",
    domain: "ai-ml",
    name: "ML Pipelines & Evaluation",
    proficiency: 0.9,
    creature: "owl",
    description:
      "Modular preprocessing and training pipelines at Multitech; Stratified K-Fold and full metric suites on AML.",
  },
  {
    id: "pytorch",
    domain: "ai-ml",
    name: "PyTorch",
    proficiency: 0.8,
    creature: "hare",
    description:
      "Spatio-temporal flood forecasting models, plus PyTorch Geometric for transaction-graph analysis.",
  },
  {
    id: "tensorflow-xgboost",
    domain: "ai-ml",
    name: "TensorFlow / XGBoost / Scikit-learn",
    proficiency: 0.8,
    creature: "hawk",
    description:
      "XGBoost ensembles on AML detection; TensorFlow regression on house price prediction.",
  },
  {
    id: "pyspark",
    domain: "cloud-infra",
    name: "PySpark / Distributed ETL",
    proficiency: 0.7,
    creature: "deer",
    description:
      "Scalable ETL and distributed congestion analysis over large-scale traffic datasets.",
  },
  {
    id: "react-node",
    domain: "frontend",
    name: "React / Node.js / Express",
    proficiency: 0.8,
    creature: "fox",
    description:
      "The MERN side of the work — hostel management, and the genealogy platform's interface.",
  },
  {
    id: "databases",
    domain: "backend",
    name: "MongoDB / MySQL / SQL",
    proficiency: 0.8,
    creature: "beaver",
    description:
      "Data layers behind both full-stack projects, plus formal DBMS coursework.",
  },
  {
    id: "core-cs",
    domain: "backend",
    name: "DSA / Operating Systems / Java / C++",
    proficiency: 0.7,
    creature: "badger",
    description:
      "The foundations — formal coursework in data structures, algorithms, and operating systems.",
  },
];
