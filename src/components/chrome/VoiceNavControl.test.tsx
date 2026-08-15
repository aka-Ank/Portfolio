import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { VoiceNavControl } from "./VoiceNavControl";
import { useWorldStore } from "@/world/state/useWorldStore";

const push = vi.fn();
let pathname = "/";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => pathname,
}));

interface MockRecognitionResult {
  0: { transcript: string };
}

class MockSpeechRecognition extends EventTarget {
  static instances: MockSpeechRecognition[] = [];

  continuous = false;
  interimResults = false;
  lang = "en-US";
  onresult: ((event: { results: MockRecognitionResult[] }) => void) | null = null;
  onerror: ((event: { error: string }) => void) | null = null;
  onend: (() => void) | null = null;
  start = vi.fn();
  stop = vi.fn();
  abort = vi.fn();

  constructor() {
    super();
    MockSpeechRecognition.instances.push(this);
  }

  emit(transcript: string) {
    this.onresult?.({ results: [{ 0: { transcript } }] });
  }
}

function latestRecognitionInstance() {
  return MockSpeechRecognition.instances.at(-1);
}

describe("VoiceNavControl", () => {
  beforeEach(() => {
    pathname = "/";
    push.mockClear();
    document.body.innerHTML = "";
    MockSpeechRecognition.instances = [];
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders nothing when the browser has no SpeechRecognition support", () => {
    render(<VoiceNavControl />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("starts and stops listening on click when supported", async () => {
    vi.stubGlobal("SpeechRecognition", MockSpeechRecognition);

    const user = userEvent.setup();
    render(<VoiceNavControl />);

    const button = screen.getByRole("button", { name: "Start voice navigation" });
    await user.click(button);
    expect(latestRecognitionInstance()?.start).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Stop voice navigation" })).toBeInTheDocument();
  });

  it("navigates to the chapter named in a recognized command", async () => {
    vi.stubGlobal("SpeechRecognition", MockSpeechRecognition);
    const scrollIntoView = vi.fn();
    pathname = "/classic";
    const lab = document.createElement("div");
    lab.id = "jungle";
    lab.scrollIntoView = scrollIntoView;
    document.body.appendChild(lab);

    const user = userEvent.setup();
    render(<VoiceNavControl />);
    await user.click(screen.getByRole("button", { name: "Start voice navigation" }));

    latestRecognitionInstance()?.emit("open the mechanical jungle");

    await waitFor(() => expect(scrollIntoView).toHaveBeenCalled());
    expect(screen.getByRole("status")).toHaveTextContent(/heading to jungle/i);
  });

  it("toggles reduced motion on the matching voice command", async () => {
    vi.stubGlobal("SpeechRecognition", MockSpeechRecognition);

    const user = userEvent.setup();
    render(<VoiceNavControl />);
    await user.click(screen.getByRole("button", { name: "Start voice navigation" }));

    const before = useWorldStore.getState().reducedMotion;
    latestRecognitionInstance()?.emit("reduce motion");

    await waitFor(() => expect(useWorldStore.getState().reducedMotion).toBe(!before));
  });
});
