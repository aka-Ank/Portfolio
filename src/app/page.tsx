import { Backdrop } from "@/backdrop/Backdrop";
import { HeroSection } from "@/sections/HeroSection";
import { AboutSection } from "@/sections/AboutSection";
import { ExperienceSection } from "@/sections/ExperienceSection";
import { SdeSection, AimlSection } from "@/sections/ProjectsSection";
import { SkillsSection } from "@/sections/SkillsSection";
import { EducationSection } from "@/sections/EducationSection";
import { ContactSection } from "@/sections/ContactSection";
import { SideNavigator } from "@/components/chrome/SideNavigator";
import { CommandFooter } from "@/components/chrome/CommandFooter";
import { KeyboardShortcuts } from "@/components/chrome/KeyboardShortcuts";
import { AmbienceBridge } from "@/systems/audio/AmbienceBridge";
import { EasterEggController } from "@/systems/easter-egg/EasterEggController";
import { SectionObserver } from "@/systems/scroll/SectionObserver";

/**
 * The main route: eight sections over one fixed backdrop.
 *
 * Deliberately a **server** component. Only the pieces that genuinely need the
 * browser are client components — the chrome, the hero's jump buttons, the
 * reveal wrapper and the observer. Every section's content is server-rendered,
 * which is most of the page's DOM.
 *
 * The scroll model is entirely native and unmodified: sections are sized by
 * their content and the browser scrolls them normally. Nothing here listens to
 * a wheel event or moves the page itself, so the visitor's own scrolling
 * always wins. `SectionObserver` only *reports* where they have arrived, which
 * is what drives the navigator's active state.
 */
export default function HomePage() {
  return (
    <>
      <Backdrop />
      <SectionObserver />
      <AmbienceBridge />
      <EasterEggController />
      <KeyboardShortcuts />
      <SideNavigator />

      {/* Bottom padding clears the fixed command strip, plus the navigator's
          mobile position above it. */}
      <main id="main-content" className="pb-32 md:pb-20">
        <HeroSection />
        <AboutSection />
        <ExperienceSection />
        <SdeSection />
        <AimlSection />
        <SkillsSection />
        <EducationSection />
        <ContactSection />
      </main>

      <CommandFooter variant="full" />
    </>
  );
}
