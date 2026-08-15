// Minimal ambient types for the Web Speech API's SpeechRecognition interface.
// TypeScript's lib.dom.d.ts already declares SpeechRecognitionAlternative /
// SpeechRecognitionResult / SpeechRecognitionResultList (used by other Web
// Speech APIs) but not SpeechRecognition itself — this fills only that gap,
// kept to the shape src/world/systems/voice-nav actually uses. Vendor-
// prefixed on Safari and older Chromium, hence the two Window properties.

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((event: Event) => void) | null;
}

interface Window {
  SpeechRecognition?: { new (): SpeechRecognition };
  webkitSpeechRecognition?: { new (): SpeechRecognition };
}
