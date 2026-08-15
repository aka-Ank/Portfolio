"use client";

import { motion } from "motion/react";
import { observatoryContent } from "./content";
import { LiveStats } from "@/components/shared/LiveStats";

export function ObservatoryOverlay() {
  return (
    <div className="pointer-events-none flex h-full flex-col items-start justify-between px-8 py-28">
      <div>
        <motion.h2
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 110, damping: 20 }}
          className="font-[family-name:var(--font-display)] text-4xl text-[var(--ink-inverse)]"
        >
          {observatoryContent.heading}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 0.85, x: 0 }}
          transition={{ type: "spring", stiffness: 110, damping: 20, delay: 0.15 }}
          className="mt-2 max-w-sm text-[var(--ink-inverse)]"
        >
          {observatoryContent.intro}
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="pointer-events-auto max-w-sm rounded-lg bg-[var(--scrim)] p-5 backdrop-blur-sm"
      >
        <div className="font-[family-name:var(--font-mono)] text-xs tracking-wide text-[var(--ink-inverse)] uppercase opacity-70">
          Latest writing
        </div>
        <ul className="mt-2 flex flex-col gap-2">
          {observatoryContent.blogPosts.map((post) => (
            <li key={post.slug} className="text-sm text-[var(--ink-inverse)]">
              <span className="font-[family-name:var(--font-mono)] text-xs opacity-60">
                {post.date}
              </span>{" "}
              — {post.title}
            </li>
          ))}
        </ul>
        <div className="mt-4 border-t border-white/15 pt-3">
          <LiveStats tone="dark" />
        </div>
      </motion.div>
    </div>
  );
}
