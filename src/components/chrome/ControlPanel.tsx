"use client";

import { useAppStore, selectReducedMotion } from "@/state/useAppStore";
import type { ColorMode, TimeMode, Weather } from "@/state/uiSlice";
import { useModalFocusTrap } from "@/hooks/useModalFocusTrap";
import { VolumeSlider } from "./VolumeSlider";

interface Option<T> {
  value: T;
  label: string;
}

const COLOR_MODES: Option<ColorMode>[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "auto", label: "Auto" },
];

const TIME_MODES: Option<TimeMode>[] = [
  { value: "sync", label: "Live" },
  { value: "dawn", label: "Dawn" },
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "dusk", label: "Dusk" },
  { value: "night", label: "Night" },
];

/** Labels are the visitor's vocabulary, not the code's: `breeze` reads as
 * "Windy" and `rain` as "Rainy". The identifiers stay as they are because they
 * are persisted — see the note on `Weather`. */
const WEATHERS: Option<Weather>[] = [
  { value: "clear", label: "Clear" },
  { value: "breeze", label: "Windy" },
  { value: "misty", label: "Misty" },
  { value: "rain", label: "Rainy" },
  { value: "cloudy", label: "Cloudy" },
  { value: "snowy", label: "Snowy" },
];

/**
 * One compact panel for every world control, rather than a row of icons
 * scattered across the chrome. Grouped and labelled so it reads as a short
 * list of choices — the brief's "elegant and compact, not a settings mess."
 */
export function ControlPanel({ onClose }: { onClose: () => void }) {
  const containerRef = useModalFocusTrap<HTMLDivElement>();

  const colorMode = useAppStore((s) => s.colorMode);
  const timeMode = useAppStore((s) => s.timeMode);
  const weather = useAppStore((s) => s.weather);
  const soundEnabled = useAppStore((s) => s.soundEnabled);
  const manualReducedMotion = useAppStore((s) => s.manualReducedMotion);
  const systemReducedMotion = useAppStore((s) => s.systemReducedMotion);
  const reducedMotion = useAppStore(selectReducedMotion);

  const setColorMode = useAppStore((s) => s.setColorMode);
  const setTimeMode = useAppStore((s) => s.setTimeMode);
  const setWeather = useAppStore((s) => s.setWeather);
  const setSoundEnabled = useAppStore((s) => s.setSoundEnabled);
  const setManualReducedMotion = useAppStore((s) => s.setManualReducedMotion);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4 backdrop-blur-[2px] sm:items-center"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={containerRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="controls-title"
        className="w-full max-w-md rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-solid)] p-6 shadow-2xl outline-none"
      >
        <div className="flex items-center justify-between">
          <h2
            id="controls-title"
            className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]"
          >
            Settings
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close controls"
            className="rounded-md px-2 py-1 text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
          >
            ✕
          </button>
        </div>

        <div className="mt-6 space-y-5">
          {/* These two are one setting seen from two sides, and the panel says
              so rather than letting a visitor discover it by watching the other
              control move on its own. Light is the sun's arc and dark is the
              moon's, so choosing either end also chooses a time — which is what
              makes a coherent sky possible at all. */}
          <Segmented
            label="Appearance"
            options={COLOR_MODES}
            value={colorMode}
            onChange={setColorMode}
            hint={
              colorMode === "auto"
                ? "Follows your local clock."
                : colorMode === "dark"
                  ? "Dark is night — the moon's half of the day."
                  : "Light runs dawn to dusk, with the sun up."
            }
          />
          <Segmented
            label="Time of day"
            options={TIME_MODES}
            value={timeMode}
            onChange={setTimeMode}
            hint={
              timeMode === "sync"
                ? "Follows your local clock. The sun and moon track it."
                : "Sets where the sun sits, and the light follows."
            }
          />

          <Segmented
            label="Weather"
            options={WEATHERS}
            value={weather}
            onChange={setWeather}
            hint={
              weather === "clear"
                ? "Changes the light, the wind, the water and the soundscape."
                : weather === "snowy"
                  ? "The calmest of the six: less wind than clear, and the stillest water."
                  : weather === "breeze"
                    ? "No overlay — it only moves what is already moving, which is what wind is."
                    : "Changes the light, the wind, the water and the soundscape."
            }
          />

          <div className="space-y-3 border-t border-[var(--border-soft)] pt-5">
            <Toggle
              label="Ambient sound"
              checked={soundEnabled}
              onChange={setSoundEnabled}
            />

            {/* The panel is where the level lives on mobile — the footer's
                inline slider is desktop-only, so without this there would be
                no way to set it on a phone. */}
            {soundEnabled && (
              <div className="flex items-center gap-3">
                <label htmlFor="panel-volume" className="text-sm text-[var(--ink-muted)]">
                  Volume
                </label>
                <VolumeSlider id="panel-volume" className="flex-1" />
              </div>
            )}
            <Toggle
              label="Motion"
              checked={!reducedMotion}
              onChange={(next) => setManualReducedMotion(!next)}
              hint={
                manualReducedMotion === null && systemReducedMotion
                  ? "Reduced, following your system setting."
                  : manualReducedMotion !== null
                    ? "Set here, overriding your system setting."
                    : undefined
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * A radio group styled as a segment bar. Real `<input type="radio">`s rather
 * than buttons with `aria-pressed`: a set of mutually exclusive options is
 * what a radio group is for, and it gets arrow-key navigation for free.
 */
function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
  hint,
}: {
  label: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  hint?: string;
}) {
  return (
    <fieldset>
      <legend className="font-mono text-[11px] uppercase tracking-wider text-[var(--ink-muted)]">
        {label}
      </legend>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {options.map((option) => {
          const checked = option.value === value;
          return (
            <label
              key={option.value}
              className={[
                "cursor-pointer rounded-lg border px-3 py-1.5 text-sm transition-colors",
                "has-focus-visible:outline has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-[var(--focus-ring)]",
                checked
                  ? "border-[var(--accent-ink)] bg-[var(--accent-ink)] text-[var(--surface-solid)]"
                  : "border-[var(--border-soft)] text-[var(--ink-muted)] hover:text-[var(--ink)]",
              ].join(" ")}
            >
              <input
                type="radio"
                name={label}
                value={option.value}
                checked={checked}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              {option.label}
            </label>
          );
        })}
      </div>
      {hint && <p className="mt-2 text-xs text-[var(--ink-muted)]">{hint}</p>}
    </fieldset>
  );
}

function Toggle({
  label,
  checked,
  onChange,
  hint,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  hint?: string;
}) {
  return (
    <div>
      <label className="flex cursor-pointer items-center justify-between gap-4">
        <span className="text-sm text-[var(--ink)]">{label}</span>
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden
          className={[
            "relative h-6 w-11 shrink-0 rounded-full border transition-colors",
            "peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--focus-ring)]",
            checked
              ? "border-[var(--accent-ink)] bg-[var(--accent-ink)]"
              : "border-[var(--border-soft)] bg-transparent",
          ].join(" ")}
        >
          <span
            className={[
              "absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full transition-all duration-200 motion-reduce:transition-none",
              checked
                ? "left-[calc(100%-1.25rem)] bg-[var(--surface-solid)]"
                : "left-1 bg-[var(--ink-muted)]",
            ].join(" ")}
          />
        </span>
      </label>
      {hint && <p className="mt-1 text-xs text-[var(--ink-muted)]">{hint}</p>}
    </div>
  );
}
