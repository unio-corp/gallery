"use client";

import { cn } from "@/lib/utils";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlayPauseIcon,
} from "./icons";
import { VISIBLE_THUMBNAILS, type GallerySlide } from "./slides";

interface CarouselWidgetProps {
  slides: readonly GallerySlide[];
  activeIndex: number;
  onSelect: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
}

/**
 * Bottom-right cluster: thumbnail strip, overflow counter, prev/next arrows.
 *
 * Note on the active state: the original changes *only* the thumbnail's width
 * (24px → 28px) — no opacity, border or outline shift. Hover and focus reuse
 * that same widened state.
 */
export function CarouselWidget({
  slides,
  activeIndex,
  onSelect,
  onPrev,
  onNext,
}: CarouselWidgetProps) {
  const shown = slides.slice(0, VISIBLE_THUMBNAILS);
  const overflow = slides.length - VISIBLE_THUMBNAILS;

  return (
    <div className="pointer-events-auto flex h-8 items-center gap-2">
      {/* Visible slide counter — hidden on desktop, shown on mobile. */}
      <span
        className="rounded-[2px] px-1 py-0.5 text-[var(--gucci-on-scrim)] md:hidden"
        style={{
          backgroundColor: "var(--gucci-scrim)",
          fontSize: "var(--gucci-text-counter)",
          letterSpacing: "var(--gucci-tracking-counter)",
          fontWeight: 500,
        }}
      >
        {activeIndex + 1} / {slides.length}
      </span>

      <ul
        className="hidden max-w-[300px] items-center gap-0.5 overflow-hidden md:flex"
        style={{
          transition: "max-width var(--gucci-duration) var(--gucci-ease)",
        }}
      >
        {shown.map((slide, index) => (
          <li key={slide.src} className="h-7 shrink-0">
            <button
              type="button"
              onClick={() => onSelect(index)}
              aria-label={`Vai all'immagine ${index + 1}`}
              aria-current={index === activeIndex}
              className={cn(
                "relative block h-7 overflow-hidden outline-none focus-visible:outline-1 focus-visible:outline-white",
                index === activeIndex ? "w-7" : "w-6 hover:w-7 focus:w-7",
              )}
              style={{
                transition: "width var(--gucci-duration) var(--gucci-ease)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- 64px local crops */}
              <img
                className="h-full w-full object-cover"
                src={slide.thumb}
                alt=""
                width={64}
                height={64}
              />
              {slide.variant === "video-full" && (
                <span className="absolute inset-0 flex items-center justify-center text-white">
                  <PlayPauseIcon isPlaying={index === activeIndex} />
                </span>
              )}
            </button>
          </li>
        ))}

        {overflow > 0 && (
          <li
            className="flex h-7 w-6 shrink-0 items-center justify-center rounded-[2px] text-[var(--gucci-on-scrim)]"
            style={{
              backgroundColor: "var(--gucci-scrim)",
              fontSize: "var(--gucci-text-counter)",
              letterSpacing: "var(--gucci-tracking-counter)",
              fontWeight: 500,
            }}
          >
            + {overflow}
          </li>
        )}
      </ul>

      <div className="flex gap-0.5">
        <ArrowButton
          label="Immagine precedente"
          onClick={onPrev}
          disabled={activeIndex === 0}
        >
          <ChevronLeftIcon />
        </ArrowButton>
        <ArrowButton
          label="Immagine successiva"
          onClick={onNext}
          disabled={activeIndex === slides.length - 1}
        >
          <ChevronRightIcon />
        </ArrowButton>
      </div>
    </div>
  );
}

interface ArrowButtonProps {
  label: string;
  onClick: () => void;
  disabled: boolean;
  children: React.ReactNode;
}

function ArrowButton({ label, onClick, disabled, children }: ArrowButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="flex size-6 items-center justify-center rounded-full text-[var(--gucci-on-scrim)] transition-opacity hover:opacity-70 disabled:opacity-30"
    >
      {children}
    </button>
  );
}
