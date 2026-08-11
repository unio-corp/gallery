import { CarouselWidget } from "./CarouselWidget";
import { ProductSummaryCard } from "./ProductSummaryCard";
import { View3DPill } from "./View3DPill";
import type { GallerySlide } from "./slides";

interface GalleryOverlayProps {
  slides: readonly GallerySlide[];
  activeIndex: number;
  onSelect: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
}

/**
 * Chrome layer above the carousel. The layer itself ignores pointer events so
 * dragging the media still works; each control re-enables them for itself.
 */
export function GalleryOverlay({
  slides,
  activeIndex,
  onSelect,
  onPrev,
  onNext,
}: GalleryOverlayProps) {
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-end">
      {/*
        Sticky to the bottom of the viewport, 40px clear of it, so the controls
        stay reachable while the gallery is taller than the screen. They come to
        rest 40px above the gallery's own bottom edge once it scrolls into view.
      */}
      <div
        className="sticky flex items-center justify-between"
        style={{
          bottom: "var(--gucci-chrome-bottom)",
          height: "var(--gucci-chrome-height)",
          marginBottom: "var(--gucci-chrome-bottom)",
          marginInline: "var(--gucci-chrome-inset)",
        }}
      >
        <View3DPill />
        <ProductSummaryCard />
        <CarouselWidget
          slides={slides}
          activeIndex={activeIndex}
          onSelect={onSelect}
          onPrev={onPrev}
          onNext={onNext}
        />
      </div>
    </div>
  );
}
