import { useEffect, useRef, type DependencyList, type RefObject } from "react";

interface UseScrollToEndOptions {
  /** Container with overflow-y: auto */
  containerRef: RefObject<HTMLElement | null>;
  /** Sentinel element placed at the very end of the scrollable list */
  endRef: RefObject<HTMLElement | null>;
  /** Re-run scroll when these change (messages, thinking, busy, etc.) */
  deps: DependencyList;
  /** When true, attaches a ResizeObserver to the container so DOM growth inside it (e.g. ThinkingBlock steps) also triggers scroll. */
  observeResize?: boolean;
  /** Disable smooth scroll for the very first run to avoid janky animation on mount. */
  instantOnMount?: boolean;
}

export function useScrollToEnd({
  containerRef,
  endRef,
  deps,
  observeResize = true,
  instantOnMount = true,
}: UseScrollToEndOptions) {
  const firstRunRef = useRef(true);

  useEffect(() => {
    const container = containerRef.current;
    const end = endRef.current;
    if (!container || !end) return;

    const scrollNow = (behavior: ScrollBehavior) => {
      container.scrollTo({ top: container.scrollHeight, behavior });
    };

    const raf = window.requestAnimationFrame(() => {
      const behavior: ScrollBehavior =
        firstRunRef.current && instantOnMount ? "auto" : "smooth";
      scrollNow(behavior);
      firstRunRef.current = false;
    });

    let ro: ResizeObserver | undefined;
    if (observeResize && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => {
        const distanceFromBottom =
          container.scrollHeight - container.scrollTop - container.clientHeight;
        if (distanceFromBottom < 240) {
          scrollNow("auto");
        }
      });
      ro.observe(container);
      if (container.firstElementChild) {
        ro.observe(container.firstElementChild);
      }
    }

    return () => {
      window.cancelAnimationFrame(raf);
      ro?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
