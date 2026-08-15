import { describe, expect, it } from "vitest";
import { buildPersonSchema } from "./person-schema";
import { about } from "@/content/about";
import { resume } from "@/content/resume";

describe("buildPersonSchema", () => {
  it("builds a valid schema.org Person from the real content modules", () => {
    const schema = buildPersonSchema();
    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("Person");
    expect(schema.name).toBe(about.name);
    expect(schema.jobTitle).toBe(about.role);
    expect(schema.email).toBe(`mailto:${resume.email}`);
  });

  it("never emits a placeholder '#' href in sameAs", () => {
    const schema = buildPersonSchema();
    if (Array.isArray(schema.sameAs)) {
      for (const href of schema.sameAs) {
        expect(href.startsWith("http")).toBe(true);
      }
    }
  });
});
