import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { contact } from "./resume";

/**
 * The Resume button serves a static file rather than a generated document, so
 * the thing a visitor downloads is only correct as long as `public/` actually
 * holds a copy of the resume in `resume/`. Nothing in the type system or the
 * build can notice if those two drift — a stale copy in `public/` would ship
 * silently and keep serving last year's resume forever.
 */

const root = process.cwd();
const servedPath = path.join(root, "public", path.basename(contact.resume));

function sha(file: string) {
  return createHash("sha256").update(readFileSync(file)).digest("hex");
}

describe("resume file", () => {
  it("is served from public/ at the path the content layer links to", () => {
    expect(() => readFileSync(servedPath)).not.toThrow();
  });

  it("is a real PDF", () => {
    expect(readFileSync(servedPath).subarray(0, 5).toString("latin1")).toBe("%PDF-");
  });

  it("is byte-identical to the source PDF in resume/", () => {
    const sourceDir = path.join(root, "resume");
    const sources = readdirSync(sourceDir).filter((f) => f.toLowerCase().endsWith(".pdf"));

    // Exactly one, so there is never ambiguity about which document is the
    // source of truth for the site's content.
    expect(sources, "expected exactly one PDF in resume/").toHaveLength(1);
    expect(sha(servedPath)).toBe(sha(path.join(sourceDir, sources[0])));
  });
});
