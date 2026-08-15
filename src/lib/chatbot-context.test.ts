import { describe, expect, it } from "vitest";
import { buildSystemPrompt } from "./chatbot-context";
import { about } from "@/content/about";
import { skills } from "@/content/skills";
import { projects } from "@/content/projects";

describe("buildSystemPrompt", () => {
  it("grounds the prompt in the real content modules, not a hardcoded copy", () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toContain(about.name);
    expect(prompt).toContain(about.tagline);
    expect(prompt).toContain(skills[0].name);
    expect(prompt).toContain(projects[0].title);
  });

  it("instructs the bot to stay scoped to the portfolio content", () => {
    const prompt = buildSystemPrompt();
    expect(prompt.toLowerCase()).toContain("outside what you can help with");
  });
});
