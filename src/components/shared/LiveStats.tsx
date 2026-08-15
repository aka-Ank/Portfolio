"use client";

import { useEffect, useState } from "react";

interface GitHubStats {
  available: boolean;
  username?: string;
  publicRepos?: number;
  followers?: number;
  profileUrl?: string;
  highlights?: { type: string; repo: string; date: string }[];
}

interface LeetCodeStats {
  available: boolean;
  total?: number;
  easy?: number;
  medium?: number;
  hard?: number;
}

/**
 * Live GitHub activity + compact LeetCode stats — used by both the classic
 * Achievements section and the immersive Observatory overlay, so it lives
 * outside both (docs/02-architecture.md's shared/ layer for cross-mode
 * presentational components, not just data). Fails gracefully: each stat
 * block simply omits itself if its API route reports unavailable, per
 * docs/08-roadmap.md's "fail gracefully... no dead end" rule.
 */
export function LiveStats({ tone = "light" }: { tone?: "light" | "dark" }) {
  const [github, setGithub] = useState<GitHubStats | null>(null);
  const [leetcode, setLeetcode] = useState<LeetCodeStats | null>(null);
  // On a light surface (classic mode's --paper), --muted-foreground has the
  // contrast it was calibrated for. Inside the immersive overlay's dark
  // --scrim, that same token reads too low-contrast — the established
  // pattern there (see ClearingOverlay) is --ink-inverse at reduced opacity
  // instead. See docs/01-design-specification.md §3.2.
  const mutedClass = tone === "dark" ? "text-[var(--ink-inverse)]/70" : "text-[var(--muted-foreground)]";
  const textClass = tone === "dark" ? "text-[var(--ink-inverse)]" : "text-[var(--ink)]";

  useEffect(() => {
    fetch("/api/github-stats")
      .then((r) => r.json())
      .then(setGithub)
      .catch(() => setGithub({ available: false }));
    fetch("/api/leetcode-stats")
      .then((r) => r.json())
      .then(setLeetcode)
      .catch(() => setLeetcode({ available: false }));
  }, []);

  if (github?.available !== true && leetcode?.available !== true) return null;

  return (
    <div
      className={`flex flex-col gap-4 font-[family-name:var(--font-mono)] text-sm sm:flex-row sm:gap-8 ${textClass}`}
    >
      {github?.available && (
        <div>
          <div className={`text-xs tracking-wide uppercase ${mutedClass}`}>GitHub</div>
          <div className="mt-1 flex gap-4">
            <span>{github.publicRepos} repos</span>
            <span>{github.followers} followers</span>
          </div>
          {github.highlights && github.highlights.length > 0 && (
            <ul className={`mt-2 flex flex-col gap-1 text-xs ${mutedClass}`}>
              {github.highlights.slice(0, 3).map((h, i) => (
                <li key={i}>
                  {h.type} · {h.repo.split("/")[1] ?? h.repo}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {leetcode?.available && (
        <div>
          <div className={`text-xs tracking-wide uppercase ${mutedClass}`}>LeetCode</div>
          <div className="mt-1 flex gap-4">
            <span>{leetcode.total} solved</span>
          </div>
          <div className={`mt-2 flex gap-3 text-xs ${mutedClass}`}>
            <span>{leetcode.easy} easy</span>
            <span>{leetcode.medium} medium</span>
            <span>{leetcode.hard} hard</span>
          </div>
        </div>
      )}
    </div>
  );
}
