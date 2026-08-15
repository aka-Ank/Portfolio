import type { Metadata } from "next";
import { Hero } from "@/components/classic/Hero";
import { About } from "@/components/classic/About";
import { LearningJourney } from "@/components/classic/LearningJourney";
import { Skills } from "@/components/classic/Skills";
import { Projects } from "@/components/classic/Projects";
import { Achievements } from "@/components/classic/Achievements";
import { Contact } from "@/components/classic/Contact";

export const metadata: Metadata = {
  title: "Portfolio — Classic",
  description: "The lightweight, fast-by-default version of the portfolio.",
};

// The classic route — semantic HTML, minimal JS, same content as the
// immersive site (every section imports from the same content/ and
// world/scenes/*/content.ts modules the 3D scenes read from). See
// docs/08-roadmap.md Phase 4 and docs/02-architecture.md.
export default function ClassicPage() {
  return (
    <main id="main-content">
      <Hero />
      <About />
      <LearningJourney />
      <Skills />
      <Projects />
      <Achievements />
      <Contact />
    </main>
  );
}
