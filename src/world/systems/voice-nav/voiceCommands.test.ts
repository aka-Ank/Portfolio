import { describe, expect, it } from "vitest";
import { matchVoiceCommand } from "./voiceCommands";

describe("matchVoiceCommand", () => {
  it("matches chapter aliases, including multi-word ones", () => {
    expect(matchVoiceCommand("go to the lab")).toEqual({ type: "goToChapter", chapter: "lab" });
    expect(matchVoiceCommand("take me to the animal sanctuary")).toEqual({
      type: "goToChapter",
      chapter: "sanctuary",
    });
    expect(matchVoiceCommand("show me the knowledge river")).toEqual({
      type: "goToChapter",
      chapter: "river",
    });
  });

  it("prefers relative navigation over a coincidental chapter substring", () => {
    expect(matchVoiceCommand("next chapter please")).toEqual({
      type: "relativeChapter",
      direction: "next",
    });
    expect(matchVoiceCommand("go back")).toEqual({ type: "relativeChapter", direction: "previous" });
  });

  it("matches reduced-motion, mode-switch, help, and stop intents", () => {
    expect(matchVoiceCommand("reduce motion")).toEqual({ type: "toggleReducedMotion" });
    expect(matchVoiceCommand("switch mode")).toEqual({ type: "switchMode" });
    expect(matchVoiceCommand("what can I say")).toEqual({ type: "help" });
    expect(matchVoiceCommand("stop listening")).toEqual({ type: "stop" });
  });

  it("is case-insensitive and tolerant of surrounding words", () => {
    expect(matchVoiceCommand("Hey, can you take me to the OBSERVATORY please?")).toEqual({
      type: "goToChapter",
      chapter: "observatory",
    });
  });

  it("returns null for unrecognized speech rather than guessing", () => {
    expect(matchVoiceCommand("what's the weather like today")).toBeNull();
    expect(matchVoiceCommand("")).toBeNull();
    expect(matchVoiceCommand("   ")).toBeNull();
  });
});
