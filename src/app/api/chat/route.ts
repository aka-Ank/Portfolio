import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt } from "@/lib/chatbot-context";

const MAX_MESSAGES = 12;
const MAX_MESSAGE_LENGTH = 2000;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function isValidMessage(value: unknown): value is ChatMessage {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    (record.role === "user" || record.role === "assistant") &&
    typeof record.content === "string" &&
    record.content.trim().length > 0 &&
    record.content.length <= MAX_MESSAGE_LENGTH
  );
}

// Streams a grounded reply from the embedded portfolio guide. Fails
// gracefully (available:false-style shape, matching github-stats /
// leetcode-stats) when ANTHROPIC_API_KEY isn't configured, rather than
// throwing — the widget shows a friendly note instead of an error state.
export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "not-configured" }, { status: 200 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid-request" }, { status: 400 });
  }

  const rawMessages = (body as { messages?: unknown } | null)?.messages;
  if (!Array.isArray(rawMessages) || rawMessages.length === 0 || !rawMessages.every(isValidMessage)) {
    return Response.json({ error: "invalid-request" }, { status: 400 });
  }

  const messages = rawMessages.slice(-MAX_MESSAGES);
  if (messages[messages.length - 1].role !== "user") {
    return Response.json({ error: "invalid-request" }, { status: 400 });
  }

  const client = new Anthropic();
  const claudeStream = client.messages.stream({
    model: "claude-opus-5",
    max_tokens: 1024,
    system: buildSystemPrompt(),
    output_config: { effort: "low" },
    messages,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of claudeStream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch {
        controller.enqueue(
          encoder.encode("\n\n(The connection to the guide dropped — please try again.)"),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
