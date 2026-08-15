import { describe, expect, it } from "vitest";
import sitemap from "./sitemap";
import { SITE_URL } from "@/lib/site";

describe("sitemap", () => {
  it("lists exactly the two real routes, not in-page chapter anchors", () => {
    const urls = sitemap().map((entry) => entry.url);
    expect(urls).toEqual([SITE_URL, `${SITE_URL}/classic`]);
  });
});
