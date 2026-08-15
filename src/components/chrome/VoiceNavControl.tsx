"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useWorldStore } from "@/world/state/useWorldStore";
import { CHAPTER_ORDER, type ChapterId } from "@/types/world";
import { scrollToChapter } from "@/world/systems/scroll-camera/scrollToChapter";
import { useVoiceRecognition } from "@/world/systems/voice-nav/useVoiceRecognition";
import { matchVoiceCommand } from "@/world/systems/voice-nav/voiceCommands";

const EXAMPLE_COMMANDS = [
  '"Go to the lab"',
  '"Next chapter" / "previous chapter"',
  '"Switch mode"',
  '"Reduce motion"',
  '"Stop listening"',
];

/**
 * Voice navigation — a deliberately optional, secondary layer per the
 * Phase 1 brief, never the primary way to move through the site. Renders
 * nothing when the browser has no SpeechRecognition support (Firefox has
 * none) rather than showing a broken control. Mirrors the same small
 * command set KeyboardShortcuts exposes via keys, not an open-ended
 * assistant — that's the chatbot's job (see ENGINEER_NOTES.md).
 */
export function VoiceNavControl() {
  const router = useRouter();
  const pathname = usePathname();
  const isClassic = pathname?.startsWith("/classic") ?? false;

  const currentChapter = useWorldStore((s) => s.currentChapter);
  const reducedMotion = useWorldStore((s) => s.reducedMotion);
  const setManualReducedMotion = useWorldStore((s) => s.setManualReducedMotion);

  const [feedback, setFeedback] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const feedbackTimer = useRef<number | null>(null);
  // useVoiceRecognition needs handleTranscript to construct itself, but
  // handleTranscript's "stop" intent needs the hook's own stop() — a ref
  // sidesteps the circular dependency instead of restructuring the hook.
  const stopRef = useRef<() => void>(() => {});

  useEffect(() => () => {
    if (feedbackTimer.current) window.clearTimeout(feedbackTimer.current);
  }, []);

  const navigateToChapter = useCallback(
    (chapter: ChapterId) => {
      if (isClassic) {
        document.getElementById(chapter)?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        scrollToChapter(chapter);
      }
    },
    [isClassic],
  );

  const showFeedback = useCallback((message: string) => {
    setFeedback(message);
    if (feedbackTimer.current) window.clearTimeout(feedbackTimer.current);
    feedbackTimer.current = window.setTimeout(() => setFeedback(null), 3000);
  }, []);

  const handleTranscript = useCallback(
    (transcript: string) => {
      const intent = matchVoiceCommand(transcript);
      if (!intent) {
        showFeedback(`Didn't catch a command in "${transcript}"`);
        return;
      }

      switch (intent.type) {
        case "goToChapter":
          navigateToChapter(intent.chapter);
          showFeedback(`Heading to ${intent.chapter}`);
          break;
        case "relativeChapter": {
          const index = CHAPTER_ORDER.indexOf(currentChapter);
          const nextIndex = intent.direction === "next" ? index + 1 : index - 1;
          const clamped = Math.min(Math.max(nextIndex, 0), CHAPTER_ORDER.length - 1);
          const target = CHAPTER_ORDER[clamped];
          navigateToChapter(target);
          showFeedback(`Heading to ${target}`);
          break;
        }
        case "toggleReducedMotion":
          setManualReducedMotion(!reducedMotion);
          showFeedback(reducedMotion ? "Motion restored" : "Motion reduced");
          break;
        case "switchMode":
          router.push(isClassic ? "/" : `/classic#${currentChapter}`);
          break;
        case "help":
          setShowHelp(true);
          break;
        case "stop":
          stopRef.current();
          break;
      }
    },
    [currentChapter, isClassic, navigateToChapter, reducedMotion, router, setManualReducedMotion, showFeedback],
  );

  const { supported, listening, error, start, stop } = useVoiceRecognition(handleTranscript);

  useEffect(() => {
    stopRef.current = stop;
  }, [stop]);

  if (!supported) return null;

  return (
    <>
      <button
        onClick={() => (listening ? stop() : start())}
        aria-pressed={listening}
        aria-label={listening ? "Stop voice navigation" : "Start voice navigation"}
        className={`pointer-events-auto fixed bottom-24 left-5 z-50 flex h-12 w-12 items-center justify-center rounded-full text-xl shadow-lg outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] ${
          listening
            ? "animate-pulse bg-[var(--accent)] text-[var(--accent-foreground)]"
            : "bg-[var(--secondary)] text-[var(--secondary-foreground)]"
        }`}
      >
        {listening ? "🎙️" : "🎤"}
      </button>

      <AnimatePresence>
        {(feedback || error) && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            role="status"
            className="pointer-events-none fixed bottom-40 left-5 z-50 max-w-xs rounded-md bg-[var(--scrim)] px-3 py-2 text-sm text-[var(--ink-inverse)] backdrop-blur-sm"
          >
            {error ? `Voice navigation error: ${error}` : feedback}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showHelp && (
          <div className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ type: "spring", stiffness: 140, damping: 22 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="voice-help-title"
              className="w-full max-w-sm rounded-lg bg-[var(--paper)] p-6 text-[var(--ink)] shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <h2 id="voice-help-title" className="font-[family-name:var(--font-display)] text-2xl">
                  Things you can say
                </h2>
                <button
                  onClick={() => setShowHelp(false)}
                  aria-label="Close"
                  className="rounded px-2 py-1 text-[var(--muted-foreground)] outline-offset-2 hover:text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
                >
                  ✕
                </button>
              </div>
              <ul className="mt-4 flex flex-col gap-2 text-sm text-[var(--muted-foreground)]">
                {EXAMPLE_COMMANDS.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
