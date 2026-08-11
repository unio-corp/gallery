"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { trackOffset } from "./trackOffset";

/** Movement, in px, above which a pointer gesture counts as a drag not a click. */
const DRAG_THRESHOLD = 5;

interface UseGalleryScrollerOptions {
  slideFractions: readonly number[];
  slideCount: number;
}

interface GalleryScroller {
  scrollerRef: React.RefObject<HTMLDivElement | null>;
  activeIndex: number;
  isDragging: boolean;
  goTo: (index: number) => void;
  goPrev: () => void;
  goNext: () => void;
  /** Spread onto the scroll container. */
  handlers: {
    onScroll: () => void;
    onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
    onPointerMove: (event: React.PointerEvent<HTMLDivElement>) => void;
    onPointerUp: (event: React.PointerEvent<HTMLDivElement>) => void;
    onPointerCancel: (event: React.PointerEvent<HTMLDivElement>) => void;
  };
  /** True when the pointer moved far enough that a click should be ignored. */
  wasDragged: () => boolean;
}

/**
 * Drives the gallery as a native horizontal scroller.
 *
 * Native scrolling gives trackpad gestures, touch swiping, momentum, keyboard
 * arrows and screen-reader behaviour for free. The only gesture it lacks is
 * click-and-drag with a mouse, which is added here on top.
 *
 * Snap positions come from `trackOffset`, the same formula the transform-based
 * version used, so the resting positions are unchanged.
 */
export function useGalleryScroller({
  slideFractions,
  slideCount,
}: UseGalleryScrollerOptions): GalleryScroller {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const dragState = useRef({ startX: 0, startScroll: 0, moved: 0, active: false });
  // Ignore scroll-derived index updates while we animate to a chosen slide,
  // otherwise the intermediate positions fight the user's choice.
  const isSettling = useRef(false);

  const offsetPx = useCallback(
    (index: number) => {
      const el = scrollerRef.current;
      if (!el) return 0;
      return (trackOffset(slideFractions, index) / 100) * el.clientWidth;
    },
    [slideFractions],
  );

  const nearestIndex = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return 0;

    let best = 0;
    let bestDistance = Infinity;
    for (let i = 0; i < slideCount; i += 1) {
      const distance = Math.abs(offsetPx(i) - el.scrollLeft);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = i;
      }
    }
    return best;
  }, [offsetPx, slideCount]);

  const goTo = useCallback(
    (index: number) => {
      const el = scrollerRef.current;
      if (!el) return;

      const clamped = Math.min(Math.max(index, 0), slideCount - 1);
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      isSettling.current = true;
      setActiveIndex(clamped);
      el.scrollTo({
        left: offsetPx(clamped),
        behavior: reduced ? "auto" : "smooth",
      });

      window.setTimeout(() => {
        isSettling.current = false;
      }, reduced ? 0 : 700);
    },
    [offsetPx, slideCount],
  );

  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);
  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);

  const onScroll = useCallback(() => {
    if (isSettling.current || dragState.current.active) return;
    setActiveIndex(nearestIndex());
  }, [nearestIndex]);

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const el = scrollerRef.current;
      if (!el) return;

      // Clear the previous gesture's travel first, whatever the pointer type:
      // the click handler reads it, and a stale value from an earlier mouse
      // drag would otherwise make the next tap be ignored.
      dragState.current = {
        startX: event.clientX,
        startScroll: el.scrollLeft,
        moved: 0,
        // Touch and pen already scroll natively; only the mouse needs help.
        active: event.pointerType === "mouse",
      };

      if (event.pointerType !== "mouse") return;
      setIsDragging(true);
      el.setPointerCapture(event.pointerId);
    },
    [],
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragState.current;
      const el = scrollerRef.current;
      if (!drag.active || !el) return;

      const travel = event.clientX - drag.startX;
      drag.moved = Math.max(drag.moved, Math.abs(travel));
      el.scrollLeft = drag.startScroll - travel;
    },
    [],
  );

  const endDrag = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragState.current;
      const el = scrollerRef.current;
      if (!drag.active || !el) return;

      drag.active = false;
      setIsDragging(false);
      if (el.hasPointerCapture(event.pointerId)) {
        el.releasePointerCapture(event.pointerId);
      }
      // Settle on whichever slide the drag ended nearest to.
      if (drag.moved > DRAG_THRESHOLD) goTo(nearestIndex());
    },
    [goTo, nearestIndex],
  );

  const wasDragged = useCallback(
    () => dragState.current.moved > DRAG_THRESHOLD,
    [],
  );

  // Re-align when the breakpoint changes the slide widths under us.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ left: offsetPx(activeIndex), behavior: "auto" });
    // Intentionally keyed on the widths only: this corrects the position when
    // the layout changes, not every time the active slide changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slideFractions.join(",")]);

  return {
    scrollerRef,
    activeIndex,
    isDragging,
    goTo,
    goPrev,
    goNext,
    wasDragged,
    handlers: {
      onScroll,
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
    },
  };
}
