import * as React from "react";
import type { Journey } from "../data/content";
import "../coverflow.css";

const useIsoLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

type CoverflowCarouselProps = {
  slides: Journey[];
  rotate?: number;
  depth?: number;
  perspective?: number;
  falloff?: number;
  fade?: number;
  cardWidth?: string;
  gap?: number;
  label?: string;
};

export function CoverflowCarousel({
  slides,
  rotate = 44,
  depth = 0.6,
  perspective = 3,
  falloff = 0.56,
  fade = 0.1,
  cardWidth = "clamp(210px, 28vw, 380px)",
  gap = 0.05,
  label = "Travel journeys",
}: CoverflowCarouselProps) {
  const count = slides.length;
  const frameRef = React.useRef<HTMLDivElement>(null);
  const cardRefs = React.useRef<(HTMLAnchorElement | null)[]>([]);
  const posRef = React.useRef(0);
  const targetRef = React.useRef(0);
  const widthRef = React.useRef(0);
  const rafRef = React.useRef<number | null>(null);
  const suppressClickUntilRef = React.useRef(0);
  const dragRef = React.useRef<{
    id: number;
    x: number;
    pos: number;
    v: number;
    t: number;
    moved: boolean;
  } | null>(null);
  const [selected, setSelected] = React.useState(0);

  const indexAt = React.useCallback(
    (pos: number) => ((Math.round(pos) % count) + count) % count,
    [count],
  );

  const paint = React.useCallback(() => {
    const width = widthRef.current;
    if (!width || count === 0) return;
    const pitch = width * (1 + gap);
    const pos = posRef.current;

    cardRefs.current.forEach((card, index) => {
      if (!card) return;
      let offset = index - pos;
      offset = ((offset % count) + count) % count;
      if (offset > count / 2) offset -= count;

      const distance = Math.abs(offset);
      const ramp = Math.pow(distance, falloff);
      const tilt = Math.min(rotate * ramp, 82) * Math.sign(offset);
      const edge = Math.min(1, Math.max(0, count / 2 - distance));

      card.style.transform =
        `translateX(calc(-50% + ${offset * pitch}px)) ` +
        `translateZ(${-depth * width * ramp}px) rotateY(${-tilt}deg)`;
      card.style.opacity = String(Math.max(0, 1 - fade * distance) * edge);
      card.style.zIndex = String(100 - Math.round(distance * 10));
    });
  }, [count, depth, fade, falloff, gap, rotate]);

  const settle = React.useCallback(
    (target: number) => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      targetRef.current = target;
      setSelected(indexAt(target));

      const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      if (reduced) {
        posRef.current = target;
        paint();
        rafRef.current = null;
        return;
      }

      const step = () => {
        const remaining = target - posRef.current;
        if (Math.abs(remaining) < 0.0004) {
          posRef.current = target;
          paint();
          rafRef.current = null;
          return;
        }
        posRef.current += remaining * 0.16;
        paint();
        rafRef.current = requestAnimationFrame(step);
      };
      rafRef.current = requestAnimationFrame(step);
    },
    [indexAt, paint],
  );

  const goTo = React.useCallback(
    (index: number) => {
      const target = index + Math.round((targetRef.current - index) / count) * count;
      settle(target);
    },
    [count, settle],
  );

  const nudge = React.useCallback(
    (by: number) => settle(Math.round(targetRef.current) + by),
    [settle],
  );

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    targetRef.current = posRef.current;
    dragRef.current = {
      id: event.pointerId,
      x: event.clientX,
      pos: posRef.current,
      v: 0,
      t: performance.now(),
      moved: false,
    };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    const pitch = widthRef.current * (1 + gap);
    if (!pitch) return;

    const delta = event.clientX - drag.x;
    if (Math.abs(delta) > 5) drag.moved = true;
    const now = performance.now();
    const previous = posRef.current;
    posRef.current = drag.pos - delta / pitch;
    drag.v = ((posRef.current - previous) / Math.max(now - drag.t, 1)) * 1000;
    drag.t = now;

    const index = indexAt(posRef.current);
    if (index !== selected) setSelected(index);
    paint();
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    dragRef.current = null;
    if (drag.moved) suppressClickUntilRef.current = performance.now() + 260;
    const carried = Math.max(-2, Math.min(2, drag.v * 0.18));
    settle(Math.round(posRef.current + carried));
  };

  useIsoLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame || count === 0) return;
    const measure = () => {
      const card = cardRefs.current[0];
      if (!card) return;
      widthRef.current = card.offsetWidth;
      paint();
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [count, paint]);

  React.useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  if (count === 0) return null;
  const active = slides[selected];
  const style = {
    "--cf-card": cardWidth,
    "--line": "var(--line-l)",
    "--line-strong": "var(--line-l)",
    "--muted": "var(--muted-l)",
  } as React.CSSProperties;

  return (
    <div className="coverflow-carousel" style={style}>
      <div
        ref={frameRef}
        className="coverflow-frame"
        style={{ perspective: `calc(var(--cf-card) * ${perspective})` }}
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label={label}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            nudge(-1);
          } else if (event.key === "ArrowRight") {
            event.preventDefault();
            nudge(1);
          }
        }}
      >
        <div className="coverflow-stage">
          {slides.map((slide, index) => (
            <a
              key={slide.id}
              ref={(node) => {
                cardRefs.current[index] = node;
              }}
              href={slide.href}
              className={`coverflow-card ${index === selected ? "is-active" : ""}`}
              aria-current={index === selected ? "true" : undefined}
              aria-label={`${index + 1} of ${count}: ${slide.title}`}
              onClick={(event) => {
                if (performance.now() < suppressClickUntilRef.current) {
                  event.preventDefault();
                  return;
                }
                if (index !== selected) {
                  event.preventDefault();
                  goTo(index);
                }
              }}
            >
              <img src={slide.image} alt={slide.alt} draggable={false} loading={index === 0 ? "eager" : "lazy"} decoding="async" />
              <span className="coverflow-card__shade" aria-hidden="true" />
              <span className="coverflow-card__number">{slide.number}</span>
              <span className="coverflow-card__open" aria-hidden="true">↗</span>
            </a>
          ))}
        </div>
      </div>

      <div className="coverflow-meta">
        <div className="coverflow-caption" aria-live="polite">
          <span className="coverflow-caption__eyebrow">{active.eyebrow}</span>
          <h3>{active.title}</h3>
          <p>{active.route}</p>
          <a className="coverflow-caption__link" href={active.href}>Open journey <span>↗</span></a>
        </div>
        <div className="coverflow-controls">
          <div className="coverflow-count"><span>{String(selected + 1).padStart(2, "0")}</span><i /><span>{String(count).padStart(2, "0")}</span></div>
          <button className="coverflow-nav" type="button" aria-label="Previous journey" onClick={() => nudge(-1)}>←</button>
          <button className="coverflow-nav" type="button" aria-label="Next journey" onClick={() => nudge(1)}>→</button>
        </div>
      </div>
    </div>
  );
}
