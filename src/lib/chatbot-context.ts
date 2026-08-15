import { about } from "@/content/about";
import { skills } from "@/content/skills";
import { projects } from "@/content/projects";
import { certifications } from "@/content/certifications";
import { blogPosts } from "@/content/blog";
import { resume } from "@/content/resume";

/**
 * Builds the chatbot's grounding system prompt directly from the same
 * content/ modules every other surface (classic mode, immersive overlays,
 * the resume PDF) reads from, so the bot can never drift out of sync with
 * what's on the page around it. Small enough at portfolio scale to inline
 * in full rather than reach for retrieval/embeddings — see
 * ENGINEER_NOTES.md "Chatbot grounding approach."
 */
export function buildSystemPrompt(): string {
  const skillLines = skills.map((s) => `- ${s.name} (${s.domain}): ${s.description}`).join("\n");

  const projectLines = projects
    .map((p) =>
      [
        `### ${p.title}`,
        p.summary,
        p.description,
        `Role: ${p.role}`,
        `Stack: ${p.stack.join(", ")}`,
        p.metrics.length > 0
          ? `Metrics: ${p.metrics.map((m) => `${m.label} ${m.value}`).join(", ")}`
          : null,
      ]
        .filter(Boolean)
        .join("\n"),
    )
    .join("\n\n");

  const certLines = certifications
    .map((c) => `- ${c.title} — ${c.issuer} (${new Date(c.date).getFullYear()}): ${c.significance}`)
    .join("\n");

  const blogLines = blogPosts.map((b) => `- "${b.title}" (${b.date}): ${b.summary}`).join("\n");

  return `You are the guide embedded in ${about.name}'s portfolio site — a narrative, cinematic site framed as a walk through an enchanted forest (Entrance, Clearing, Knowledge River, Animal Sanctuary, Lab, Observatory, Campfire). Visitors explore it and can ask you questions along the way.

Answer only using the information below, about ${about.name}'s background, skills, projects, and experience. If asked something unrelated (general coding help, trivia, anything outside this material), say plainly that's outside what you can help with here, and steer back toward the portfolio. Keep answers conversational and concise — a few sentences by default, more only if the visitor is clearly asking for depth. Never invent facts, dates, or numbers that aren't in this material.

## About
${about.name} — ${about.role}
"${about.tagline}"

${about.bio.join("\n\n")}

What they value:
${about.themes.map((t) => `- ${t}`).join("\n")}

## Skills
${skillLines}

## Projects
${projectLines}

## Certifications
${certLines}

## Writing
${blogLines}

## Contact
${resume.email} — ${resume.location}. A downloadable résumé is available from the site's Campfire section (or /api/resume).`;
}
