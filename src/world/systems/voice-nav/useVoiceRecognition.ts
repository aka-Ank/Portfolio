"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

function noopSubscribe() {
  // Support never changes after mount — no real external event to
  // subscribe to, just the SSR/client snapshot split below.
  return () => {};
}

function getSupportedSnapshot(): boolean {
  return !!(window.SpeechRecognition ?? window.webkitSpeechRecognition);
}

function getServerSnapshot(): boolean {
  return false;
}

/**
 * Thin wrapper around the browser's native SpeechRecognition (Web Speech
 * API). No server round-trip, no external speech vendor — entirely
 * client-side and feature-detected, since browser support is partial
 * (Firefox has none). `supported` gates whether any voice-nav UI renders
 * at all — this is a secondary/optional layer, not something to polyfill
 * or work around for unsupported browsers. Uses useSyncExternalStore
 * (server snapshot always false) rather than a useState+useEffect pair, so
 * there's no synchronous setState-in-effect and no SSR/hydration mismatch.
 */
export function useVoiceRecognition(onResult: (transcript: string) => void) {
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supported = useSyncExternalStore(noopSubscribe, getSupportedSnapshot, getServerSnapshot);

  // `onResult` (VoiceNavControl's handleTranscript) is a useCallback whose
  // identity legitimately changes whenever currentChapter/reducedMotion/
  // router change — which happens during ordinary scrolling. Reading it
  // through a ref, rather than putting it in the setup effect's deps, keeps
  // the recognition instance alive across those changes instead of
  // tearing it down (and aborting any in-progress listening) every time.
  const onResultRef = useRef(onResult);
  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Ctor) return;

    const recognition = new Ctor();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? "";
      onResultRef.current(transcript);
    };
    recognition.onerror = (event) => {
      // "no-speech"/"aborted" are routine (silence timeout, user stopped
      // early) — surface only genuine failures like a denied mic permission.
      if (event.error !== "no-speech" && event.error !== "aborted") {
        setError(event.error);
      }
      setListening(false);
    };
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    return () => {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.abort();
    };
  }, []);

  const start = useCallback(() => {
    if (!recognitionRef.current || listening) return;
    setError(null);
    recognitionRef.current.start();
    setListening(true);
  }, [listening]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  return { supported, listening, error, start, stop };
}
