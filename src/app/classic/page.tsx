import type { Metadata } from "next";
import { HeroSection } from "@/sections/HeroSection";
import { AboutSection } from "@/sections/AboutSection";
import { ExperienceSection } from "@/sections/ExperienceSection";
import { SdeSection, AimlSection } from "@/sections/ProjectsSection";
import { SkillsSection } from "@/sections/SkillsSection";
import { EducationSection } from "@/sections/EducationSection";
import { ContactSection } from "@/sections/ContactSection";
import { Motto } from "@/sections/Motto";
import { CommandFooter } from "@/components/chrome/CommandFooter";
import { about } from "@/content/about";
import { SITE_URL } from "@/lib/site";

const title = `${about.name} — Portfolio (Classic)`;
const description = "The fast, plainly-scrolling version of the portfolio. Same content, no motion.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/classic` },
  openGraph: { title, description, url: `${SITE_URL}/classic`, type: "website" },
  twitter: { card: "summary_large_image", title, description },
};

/**
 * Classic mode. A plainly scrolling document: no backdrop, no reveals, no
 * floating navigator, no observers, no audio.
 *
 * It renders the **same section components** as the main route rather than a
 * parallel set of its own. An earlier version forked every section into a
 * `components/classic/*` twin, which meant every content change had to be made
 * twice and the two drifted — the classic hero had already lost the contact
 * details the main one gained. Sharing the components makes parity structural
 * instead of a promise.
 *
 * `data-plain` is what makes it classic: one CSS rule switches off the reveal
 * animation for everything inside, so no component needs a mode prop and the
 * sections all stay server components.
 */
export default function ClassicPage() {
  return (
    <>
      {/* The header comes from `classic/layout.tsx`, not from here. Rendering
          it in both is how this route ended up with two stacked navigation
          bars. */}
      <main id="main-content" data-plain>
        <HeroSection />
        <AboutSection />
        <ExperienceSection />
        <SdeSection />
        <AimlSection />
        <SkillsSection />
        <EducationSection />
        <ContactSection />
        <Motto />
      </main>
      <CommandFooter variant="classic" />
    </>
  );
}
