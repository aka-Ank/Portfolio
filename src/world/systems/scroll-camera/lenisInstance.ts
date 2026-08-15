import type Lenis from "lenis";

// Module-level handle to the single Lenis instance ScrollProvider owns, so
// non-React code (keyboard shortcuts, bookmarks, the classic->immersive
// chapter jump) can call scrollTo without threading the instance through
// props. Set once by ScrollProvider on mount.
let instance: Lenis | null = null;

export function setLenisInstance(lenis: Lenis | null) {
  instance = lenis;
}

export function getLenisInstance(): Lenis | null {
  return instance;
}
