import { View3DIcon } from "./icons";

/**
 * Bottom-left entry point to the original's 3D product viewer.
 * The viewer itself is out of scope; the control reproduces its exact chrome.
 */
export function View3DPill() {
  return (
    <button
      type="button"
      className="pointer-events-auto flex h-8 items-center gap-1 rounded-[2px] border border-[var(--gucci-pill-border)] bg-[var(--gucci-pill-surface)] px-2 text-[var(--gucci-on-pill)] backdrop-blur-[15px] transition-opacity hover:opacity-80"
      style={{
        fontSize: "var(--gucci-text-chrome)",
        lineHeight: "var(--gucci-leading-chrome)",
        letterSpacing: "var(--gucci-tracking-chrome)",
        fontWeight: 500,
      }}
    >
      <View3DIcon />
      Visualizza in 3D
    </button>
  );
}
