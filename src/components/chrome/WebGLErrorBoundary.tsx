"use client";

import { Component, type ReactNode } from "react";
import { WebGLFallback } from "./WebGLFallback";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * A class component is required here — React error boundaries
 * (getDerivedStateFromError/componentDidCatch) have no hook equivalent.
 * Catches Canvas/renderer initialization failures that useWebGLSupport's
 * proactive check can't (WebGL context creation succeeds but Three.js's
 * renderer setup still throws for some other reason) — the reactive
 * safety net for docs/07-accessibility-and-testing.md's "never a blank
 * canvas or console-only error."
 */
export class WebGLErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("WebGL/Canvas failed to initialize:", error);
  }

  render() {
    if (this.state.hasError) return <WebGLFallback />;
    return this.props.children;
  }
}
