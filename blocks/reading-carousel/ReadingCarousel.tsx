"use client";

/**
 * ReadingCarousel: a row of things that are read, a few in view at a time.
 *
 * A block of the MD3 kit: it is copied into your project to be edited. It is
 * yours from then on: an update of the kit does not touch it. It is built
 * from the kit's `IconButton`, chevron icons and type primitives.
 *
 *   <ReadingCarousel aria-label="What customers say">
 *     {quotes.map((q) => <QuoteCard key={q.id} quote={q} />)}
 *   </ReadingCarousel>
 *
 * The kit's `Carousel` is Material's: its items are pressed, at one height.
 * This one is for content that is read and not pressed (quotes, cards of
 * text), each as tall as it is. It is a row that scrolls and snaps: by
 * touch, by the scrollbar, by its previous and next buttons, and by the
 * arrow keys when the row holds the focus. One, two or three slides are in
 * view by the width (`slides`). A slide is a group named "2 of 5".
 *
 * Neither Material 3 nor React Aria describes it. It borrows Material's
 * icon buttons (https://m3.material.io/components/icon-buttons/specs) and
 * the 16dp gap of its carousel
 * (https://m3.material.io/components/carousel/specs is 8dp between items;
 * text wants more).
 */
import {
  Body,
  ChevronLeftIcon,
  ChevronRightIcon,
  IconButton,
} from "@/registry/ds/ui/ds";
import {
  Children,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

export type ReadingCarouselProps = {
  children: ReactNode;
  /** The carousel's name: what these slides are. */
  "aria-label": string;
  /** How many slides are in view at most: one where the carousel is
   *  narrow, two from 36rem of its own width, three from 56rem. */
  slides?: 1 | 2 | 3;
  className?: string;
};

const WIDTHS = {
  1: "basis-full",
  2: "basis-full @xl:basis-[calc((100%-1rem)/2)]",
  3: "basis-full @xl:basis-[calc((100%-1rem)/2)] @4xl:basis-[calc((100%-2rem)/3)]",
} as const;

export function ReadingCarousel({
  children,
  "aria-label": label,
  slides = 3,
  className = "",
}: ReadingCarouselProps) {
  const row = useRef<HTMLDivElement>(null);
  const items = Children.toArray(children);
  const [range, setRange] = useState({ first: 1, last: 1 });
  const [ends, setEnds] = useState({ start: true, end: false });

  // What is in view, read from the row: the buttons and the status follow
  // a scroll by any means.
  useEffect(() => {
    const el = row.current;
    if (!el) return;
    const read = () => {
      const box = el.getBoundingClientRect();
      const inView = [...el.children]
        .map((child, index) => ({ index, box: child.getBoundingClientRect() }))
        .filter(
          ({ box: b }) => b.left >= box.left - 1 && b.right <= box.right + 1,
        );
      if (inView.length) {
        setRange({
          first: inView[0]!.index + 1,
          last: inView[inView.length - 1]!.index + 1,
        });
      }
      const max = el.scrollWidth - el.clientWidth;
      const at = Math.abs(el.scrollLeft);
      setEnds({ start: at <= 1, end: at >= max - 1 });
    };
    read();
    el.addEventListener("scroll", read, { passive: true });
    const resized = new ResizeObserver(read);
    resized.observe(el);
    return () => {
      el.removeEventListener("scroll", read);
      resized.disconnect();
    };
  }, [items.length]);

  const step = (by: 1 | -1) => {
    const el = row.current;
    const slide = el?.children[0];
    if (!el || !slide) return;
    const rtl = getComputedStyle(el).direction === "rtl";
    const width = slide.getBoundingClientRect().width + 16;
    el.scrollBy({ left: by * width * (rtl ? -1 : 1), behavior: "smooth" });
  };

  // A button pressed up to an end is disabled under the focus and would
  // drop it: the other one takes it.
  const previous = useRef<HTMLButtonElement>(null);
  const next = useRef<HTMLButtonElement>(null);
  const pressed = useRef<"previous" | "next" | null>(null);
  useEffect(() => {
    // Only where the focus is still where the press left it: on the button,
    // or on the page's body once the button was disabled.
    const active = document.activeElement;
    const left = (button: HTMLButtonElement | null) =>
      active === document.body || active === button;
    if (pressed.current === "previous" && ends.start) {
      if (left(previous.current)) next.current?.focus();
      pressed.current = null;
    }
    if (pressed.current === "next" && ends.end) {
      if (left(next.current)) previous.current?.focus();
      pressed.current = null;
    }
  }, [ends.start, ends.end]);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.target !== row.current) return;
    const rtl = getComputedStyle(row.current).direction === "rtl";
    if (e.key === "ArrowRight") step(rtl ? -1 : 1);
    else if (e.key === "ArrowLeft") step(rtl ? 1 : -1);
    else if (e.key === "Home") row.current.scrollTo({ left: 0 });
    else if (e.key === "End") {
      row.current.scrollTo({ left: row.current.scrollWidth * (rtl ? -1 : 1) });
    } else return;
    e.preventDefault();
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label={label}
      className={`@container flex flex-col gap-3 ${className}`}
    >
      <div
        ref={row}
        // A press of Next is forgotten once the focus is here: the row may
        // then reach an end by itself, and takes no focus from anyone.
        onFocus={() => {
          pressed.current = null;
        }}
        // The row is a stop so the arrow keys scroll it.
        tabIndex={0}
        role="group"
        aria-label={`${label}: use the arrow keys to see more`}
        onKeyDown={onKeyDown}
        className="outline-ring rounded-shape-medium flex snap-x snap-mandatory gap-4 overflow-x-auto outline-offset-2 focus-visible:outline-3"
      >
        {items.map((child, index) => (
          <div
            key={index}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${items.length}`}
            className={`min-w-0 shrink-0 grow-0 snap-start ${WIDTHS[slides]}`}
          >
            {child}
          </div>
        ))}
      </div>
      <div className="text-on-surface-variant flex items-center justify-end gap-2">
        <Body component="span" aria-live="polite">
          {range.first === range.last
            ? `${range.first} of ${items.length}`
            : `${range.first} to ${range.last} of ${items.length}`}
        </Body>
        <IconButton
          variant="standard"
          icon={ChevronLeftIcon}
          aria-label="Previous"
          ref={previous}
          isDisabled={ends.start}
          onPress={() => {
            pressed.current = "previous";
            step(-1);
          }}
          className="rtl:-scale-x-100"
        />
        <IconButton
          variant="standard"
          icon={ChevronRightIcon}
          aria-label="Next"
          ref={next}
          isDisabled={ends.end}
          onPress={() => {
            pressed.current = "next";
            step(1);
          }}
          className="rtl:-scale-x-100"
        />
      </div>
    </section>
  );
}
