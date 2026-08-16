import type { Metadata } from "next";
import { Hero } from "@/components/classic/Hero";
import { About } from "@/components/classic/About";
import { Projects } from "@/components/classic/Projects";
import { Skills } from "@/components/classic/Skills";
import { Background } from "@/components/classic/Background";
import { Achievements } from "@/components/classic/Achievements";
import { Contact } from "@/components/classic/Contact";
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
 * Classic mode. Server-rendered, no atmosphere, no snap points, no observers —
 * a plainly scrolling document.
 *
 * It is not a fallback: section order and copy match the immersive route
 * exactly (both read `src/content/sections.ts`), and it renders against the
 * same theme tokens, so a visitor's palette and weather choices carry across
 * the mode switch. What it drops is motion, not content.
 */
export default function ClassicPage() {
  return (
    <main id="main-content">
      <Hero />
      <About />
      <Projects />
      <Skills />
      <Background />
      <Achievements />
      <Contact />
      <CommandFooter variant="classic" />
    </main>
  );
}
