import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChatWidget } from "./ChatWidget";

function textStreamResponse(text: string) {
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(text));
      controller.close();
    },
  });
  return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

describe("ChatWidget", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("is closed by default and opens the panel on click", async () => {
    const user = userEvent.setup();
    render(<ChatWidget />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /chat with the guide/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("sends the message history to /api/chat and streams the reply into the transcript", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(textStreamResponse("The forest remembers every commit."));

    const user = userEvent.setup();
    render(<ChatWidget />);
    await user.click(screen.getByRole("button", { name: /chat with the guide/i }));

    await user.type(screen.getByLabelText("Message"), "What do you build?");
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/chat",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ messages: [{ role: "user", content: "What do you build?" }] }),
      }),
    );

    await waitFor(() =>
      expect(screen.getByText("The forest remembers every commit.")).toBeInTheDocument(),
    );
  });

  it("shows a graceful message and disables input when the guide isn't configured", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(Response.json({ error: "not-configured" }));

    const user = userEvent.setup();
    render(<ChatWidget />);
    await user.click(screen.getByRole("button", { name: /chat with the guide/i }));

    await user.type(screen.getByLabelText("Message"), "Hello?");
    await user.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() => expect(screen.getByLabelText("Message")).toBeDisabled());
    expect(screen.getByText(/not switched on yet/i)).toBeInTheDocument();
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    render(<ChatWidget />);
    await user.click(screen.getByRole("button", { name: /chat with the guide/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });
});
