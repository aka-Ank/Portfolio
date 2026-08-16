import type { Certification } from "./schema";

// Real certifications only. The resume lists exactly one — this stays at one
// rather than being padded out. An honest short list beats an invented long one.
export const certifications: Certification[] = [
  {
    id: "nptel-advanced-r",
    title: "Advanced R Programming for Data Analytics in Business",
    issuer: "NPTEL — IIT Kanpur",
    year: "2025",
    detail: "Elite certificate. Statistical computing and business analytics.",
  },
];
