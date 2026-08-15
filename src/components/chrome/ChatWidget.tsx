"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { about } from "@/content/about";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

type Status = "idle" | "streaming" | "error";

/**
 * Global, embedded guide chatbot — grounded in the same content/ modules
 * every other surface reads from (src/lib/chatbot-context.ts on the server
 * side), so it can never contradict what's on the page around it. Mounted
 * once in AppProviders so it's available in both immersive and classic
 * modes, per docs/08-roadmap.md Phase 4. KeyboardShortcuts already ignores
 * single-letter shortcuts while focus sits in an input/textarea, so this
 * widget's message box never fights the global hotkeys.
 */
export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [notConfigured, setNotConfigured] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function send() {
    const text = input.trim();
    if (!text || status === "streaming") return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setStatus("streaming");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      const contentType = res.headers.get("Content-Type") ?? "";

      if (contentType.includes("application/json")) {
        const json: { error?: string } = await res.json();
        const isNotConfigured = json.error === "not-configured";
        setNotConfigured(isNotConfigured);
        setStatus("error");
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content: isNotConfigured
              ? "I'm not switched on yet — everything I'd tell you is already right here on the page."
              : "Something went wrong reaching the guide. Try again in a moment.",
          },
        ]);
        return;
      }

      if (!res.ok || !res.body) {
        setStatus("error");
        setMessages((m) => [
          ...m,
          { role: "assistant", content: "Something went wrong reaching the guide. Try again in a moment." },
        ]);
        return;
      }

      setMessages((m) => [...m, { role: "assistant", content: "" }]);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assembled = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        assembled += decoder.decode(value, { stream: true });
        const snapshot = assembled;
        setMessages((m) => {
          const next = [...m];
          next[next.length - 1] = { role: "assistant", content: snapshot };
          return next;
        });
      }
      setStatus("idle");
    } catch {
      setStatus("error");
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Something went wrong reaching the guide. Try again in a moment." },
      ]);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="chat-widget-panel"
        aria-label={open ? "Close chat with the guide" : "Chat with the guide"}
        className="pointer-events-auto fixed right-5 bottom-5 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary)] text-xl text-[var(--primary-foreground)] shadow-lg outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
      >
        {open ? "✕" : "💬"}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id="chat-widget-panel"
            role="dialog"
            aria-label="Chat with the guide"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 220, damping: 24 }}
            className="pointer-events-auto fixed right-5 bottom-20 z-50 flex h-[28rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--paper)] text-[var(--ink)] shadow-2xl"
          >
            <div className="border-b border-[var(--border)] px-4 py-3">
              <h2 className="font-[family-name:var(--font-display)] text-lg">Ask about {about.name}</h2>
              <p className="text-xs text-[var(--muted-foreground)]">
                Grounded in what&rsquo;s on this site — background, skills, projects.
              </p>
            </div>

            <div
              ref={listRef}
              role="log"
              aria-label="Conversation"
              className="flex-1 space-y-3 overflow-y-auto px-4 py-3"
            >
              {messages.length === 0 && (
                <p className="text-sm text-[var(--muted-foreground)]">
                  Ask me anything about {about.name}&rsquo;s work, skills, or projects.
                </p>
              )}
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                    m.role === "user"
                      ? "ml-auto bg-[var(--accent)] text-[var(--accent-foreground)]"
                      : "bg-[var(--secondary)] text-[var(--secondary-foreground)]"
                  }`}
                >
                  {m.content || (status === "streaming" && i === messages.length - 1 ? "…" : "")}
                </div>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="flex items-end gap-2 border-t border-[var(--border)] p-3"
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                disabled={notConfigured}
                rows={1}
                placeholder="Ask a question…"
                aria-label="Message"
                className="flex-1 resize-none rounded-md border border-[var(--border)] bg-[var(--paper)] px-3 py-2 text-sm outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] disabled:opacity-40"
              />
              <button
                type="submit"
                disabled={!input.trim() || status === "streaming" || notConfigured}
                className="rounded-md bg-[var(--primary)] px-3 py-2 text-sm text-[var(--primary-foreground)] outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] disabled:opacity-40"
              >
                Send
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
