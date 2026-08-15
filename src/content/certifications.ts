import type { Certification } from "./schema";

// Real certifications only. The AI/ML resume lists exactly one — this list
// stays at one rather than being padded out to fill the Observatory's
// layout. An honest short list beats an invented long one.
export const certifications: Certification[] = [
  {
    id: "nptel-advanced-r",
    title: "Advanced R Programming for Data Analytics in Business",
    issuer: "NPTEL — IIT Kanpur",
    date: "2025-01-01",
    significance:
      "Elite certificate. Statistical computing and business analytics, alongside the Python-first ML work.",
  },
];
