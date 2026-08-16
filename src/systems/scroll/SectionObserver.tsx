"use client";

import { useSectionObserver } from "./useSectionObserver";

/**
 * The hook's mount point, as a component.
 *
 * This exists so `app/page.tsx` can stay a **server** component: a page that
 * called the hook directly would need `"use client"`, which would pull all
 * eight sections into the client bundle even though six of them are pure
 * markup with no interactivity at all.
 */
export function SectionObserver() {
  useSectionObserver();
  return null;
}
