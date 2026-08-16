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
 * Live GitHub and LeetCode figures, shared by both modes.
 *
 * Renders nothing at all when neither API reports available — no error state,
 * no empty skeleton, no "couldn't load" apology. A section that quietly isn't
 * there reads as intentional; a broken widget reads as an unfinished site.
 */
export function LiveStats() {
  const [github, setGithub] = useState<GitHubStats | null>(null);
  const [leetcode, setLeetcode] = useState<LeetCodeStats | null>(null);

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
    <div className="flex flex-col gap-6 font-mono text-sm text-[var(--ink)] sm:flex-row sm:gap-12">
      {github?.available && (
        <div>
          <div className="text-[11px] uppercase tracking-wider text-[var(--accent-ink)]">GitHub</div>
          <div className="mt-2 flex gap-4">
            <span>{github.publicRepos} repos</span>
            <span>{github.followers} followers</span>
          </div>
          {github.highlights && github.highlights.length > 0 && (
            <ul className="mt-2 flex flex-col gap-1 text-xs text-[var(--ink-muted)]">
              {github.highlights.slice(0, 3).map((highlight, index) => (
                <li key={index}>
                  {highlight.type} · {highlight.repo.split("/")[1] ?? highlight.repo}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {leetcode?.available && (
        <div>
          <div className="text-[11px] uppercase tracking-wider text-[var(--accent-ink)]">
            LeetCode
          </div>
          <div className="mt-2">{leetcode.total} solved</div>
          <div className="mt-2 flex gap-3 text-xs text-[var(--ink-muted)]">
            <span>{leetcode.easy} easy</span>
            <span>{leetcode.medium} medium</span>
            <span>{leetcode.hard} hard</span>
          </div>
        </div>
      )}
    </div>
  );
}
