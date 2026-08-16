"use client";

import { AtmosphereStage } from "@/scenes/atmosphere/AtmosphereStage";
import { HeroSection } from "@/scenes/sections/HeroSection";
import { AboutSection } from "@/scenes/sections/AboutSection";
import { SdeSection, AimlSection } from "@/scenes/sections/ProjectsSection";
import { SkillsSection } from "@/scenes/sections/SkillsSection";
import { EducationSection } from "@/scenes/sections/EducationSection";
import { SignalsSection } from "@/scenes/sections/SignalsSection";
import { ContactSection } from "@/scenes/sections/ContactSection";
import { SideNavigator } from "@/components/chrome/SideNavigator";
import { CommandFooter } from "@/components/chrome/CommandFooter";
import { KeyboardShortcuts } from "@/components/chrome/KeyboardShortcuts";
import { AmbienceBridge } from "@/systems/audio/AmbienceBridge";
import { EasterEggController } from "@/systems/easter-egg/EasterEggController";
import { useSectionObserver } from "@/systems/scroll/useSectionObserver";

/**
 * The immersive route: eight sections over one fixed atmospheric backdrop.
 *
 * The scroll model is entirely native — `snap-y snap-mandatory` on the
 * document, `snap-start` on each section. Nothing here listens to a wheel
 * event or moves the page itself, so the visitor's own scrolling always wins.
 * `useSectionObserver` only *reports* where they have arrived, which is what
 * drives the atmosphere and the navigator.
 */
export default function ImmersivePage() {
  useSectionObserver();

  return (
    <>
      <AtmosphereStage />
      <AmbienceBridge />
      <EasterEggController />
      <KeyboardShortcuts />
      <SideNavigator />

      {/* Bottom padding clears the fixed command strip, plus the navigator's
          mobile position above it. */}
      <main id="main-content" className="snap-y snap-mandatory pb-32 md:pb-16">
        <HeroSection />
        <AboutSection />
        <SdeSection />
        <AimlSection />
        <SkillsSection />
        <EducationSection />
        <SignalsSection />
        <ContactSection />
      </main>

      <CommandFooter variant="immersive" />
    </>
  );
}
