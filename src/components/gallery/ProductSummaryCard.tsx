import { BagIcon } from "./icons";
import { PRODUCT } from "./slides";

/**
 * Centred sticky summary: product name, price and an add-to-bag affordance.
 * Hidden below the 768px breakpoint, matching the original.
 */
export function ProductSummaryCard() {
  return (
    <div
      className="pointer-events-auto absolute left-1/2 hidden h-8 w-[264px] -translate-x-1/2 items-center justify-between rounded-[4px] py-1 pl-2 pr-1 text-[var(--gucci-on-scrim)] backdrop-blur-[15px] md:flex"
      style={{ backgroundColor: "var(--gucci-scrim)" }}
    >
      <div
        className="flex min-w-0 flex-1 items-center justify-between gap-2"
        style={{
          fontSize: "var(--gucci-text-chrome)",
          lineHeight: "var(--gucci-leading-chrome)",
          letterSpacing: "var(--gucci-tracking-chrome)",
        }}
      >
        <span className="truncate">{PRODUCT.name}</span>
        <span className="shrink-0">{PRODUCT.price}</span>
      </div>
      <button
        type="button"
        aria-label="Aggiungi al carrello"
        className="ml-2 flex size-6 shrink-0 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30"
      >
        <BagIcon />
      </button>
    </div>
  );
}
