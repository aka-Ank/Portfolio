import { describe, expect, it } from "vitest";
import robots from "./robots";
import { SITE_URL } from "@/lib/site";

describe("robots", () => {
  it("allows all crawlers and points to the sitemap", () => {
    const result = robots();
    expect(result.rules).toEqual({ userAgent: "*", allow: "/" });
    expect(result.sitemap).toBe(`${SITE_URL}/sitemap.xml`);
  });
});
