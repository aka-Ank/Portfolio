"use client";

import { useEffect, useRef, useState } from "react";

/**
 * One control that opens or closes every disclosure beneath it.
 *
 * **One button, not two.** "Expand all" and "Collapse all" side by side is two
 * controls where one always does nothing, and the brief's condition for having
 * this at all was that it must not clutter. So it reflects the current state and
 * offers the opposite: with anything closed it offers to open everything, and
 * only once everything is open does it offer to close.
 *
 * It stays in sync with the cards themselves, which matters because they are
 * independent now — a visitor can open three of four by hand, and the button has
 * to know that. `toggle` does **not** bubble, so the listener is registered in
 * the capture phase; a plain bubbling listener on the container silently never
 * fires, which is the kind of bug that looks like a state problem for an hour.
 *
 * The cards work perfectly without this. It is progressive enhancement over
 * markup that is already correct: no JavaScript in the card itself, and if this
 * component never hydrates the disclosures still open and close natively.
 */
export function DisclosureToggle({ label }: { label: string }) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [allOpen, setAllOpen] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const scope = anchorRef.current?.parentElement;
    if (!scope) return;

    const sync = () => {
      const items = [...scope.querySelectorAll("details")];
      setCount(items.length);
      setAllOpen(items.length > 0 && items.every((item) => item.open));
    };

    sync();
    // `toggle` does not bubble; capture is what makes one listener enough.
    scope.addEventListener("toggle", sync, true);
    return () => scope.removeEventListener("toggle", sync, true);
  }, []);

  // Nothing to control before hydration, or if the section has no disclosures.
  if (count === 0) return <div ref={anchorRef} className="hidden" />;

  return (
    <div ref={anchorRef} className="flex justify-end">
      <button
        type="button"
        onClick={() => {
          const scope = anchorRef.current?.parentElement;
          if (!scope) return;
          const next = !allOpen;
          for (const item of scope.querySelectorAll("details")) item.open = next;
          setAllOpen(next);
        }}
        className="rounded-md px-2 py-1 font-mono text-[11px] uppercase tracking-wider text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
      >
        {allOpen ? `Collapse ${label}` : `Expand ${label}`}
      </button>
    </div>
  );
}
