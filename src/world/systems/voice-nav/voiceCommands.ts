import { CHAPTER_ORDER, type ChapterId } from "@/types/world";

export type VoiceIntent =
  | { type: "goToChapter"; chapter: ChapterId }
  | { type: "relativeChapter"; direction: "next" | "previous" }
  | { type: "toggleReducedMotion" }
  | { type: "switchMode" }
  | { type: "help" }
  | { type: "stop" };

// Small, explicit keyword table — deliberately NOT open-ended NLU. Voice nav
// is a secondary/optional layer per the Phase 1 brief; the command surface
// should be as narrow and predictable as the keyboard shortcuts it mirrors,
// not a general-purpose assistant (that's the chatbot's job). See
// ENGINEER_NOTES.md "Voice navigation intent mapping."
const CHAPTER_ALIASES: Record<ChapterId, string[]> = {
  entrance: ["entrance", "start", "beginning", "go home", "home"],
  clearing: ["clearing"],
  river: ["river", "knowledge river"],
  sanctuary: ["sanctuary", "animal sanctuary", "animals"],
  lab: ["lab", "projects", "project lab"],
  observatory: ["observatory", "achievements", "certifications"],
  campfire: ["campfire", "contact", "the end"],
};

/**
 * Matches a raw speech transcript to one of the small set of navigation
 * intents above. Pure and synchronous so it's trivially testable without
 * mocking the Web Speech API. Order matters: more specific phrases are
 * checked before generic ones (e.g. "next chapter" before a bare chapter
 * alias that happens to be a substring).
 */
export function matchVoiceCommand(transcript: string): VoiceIntent | null {
  const text = transcript.trim().toLowerCase();
  if (!text) return null;

  if (/\b(stop listening|cancel|never ?mind)\b/.test(text)) return { type: "stop" };
  if (/\b(help|what can i say|list commands)\b/.test(text)) return { type: "help" };
  if (/\b(next( chapter)?|forward|move on)\b/.test(text)) {
    return { type: "relativeChapter", direction: "next" };
  }
  if (/\b(previous( chapter)?|go back|back up)\b/.test(text)) {
    return { type: "relativeChapter", direction: "previous" };
  }
  if (/\b(reduce motion|reduced motion|stop the motion|calm( it)? down)\b/.test(text)) {
    return { type: "toggleReducedMotion" };
  }
  if (/\b(classic mode|immersive mode|switch mode|change mode)\b/.test(text)) {
    return { type: "switchMode" };
  }

  for (const chapter of CHAPTER_ORDER) {
    for (const alias of CHAPTER_ALIASES[chapter]) {
      if (text.includes(alias)) return { type: "goToChapter", chapter };
    }
  }

  return null;
}
