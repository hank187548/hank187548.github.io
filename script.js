(() => {
  "use strict";

  const loadBaseScript = () => new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "./script-base.js?v=20260818-live-drag-1";
    script.async = false;
    script.onload = resolve;
    script.onerror = reject;
    document.head.append(script);
  });

  function installDesktopCoverflow() {
    const desktop = window.matchMedia("(min-width: 961px) and (hover: hover) and (pointer: fine)");
    const coverflow = document.querySelector("[data-coverflow]");
    const stage = coverflow?.querySelector("[data-coverflow-stage]");
    const cards = coverflow ? [...coverflow.querySelectorAll("[data-travel-card]")] : [];
    const previousButton = coverflow?.querySelector("[data-coverflow-prev]");
    const nextButton = coverflow?.querySelector("[data-coverflow-next]");
    const currentLabel = coverflow?.querySelector("[data-coverflow-current]");
    const journeyLabel = coverflow?.querySelector("[data-coverflow-label]");
    if (!coverflow || !stage || cards.length < 2) return;

    const count = cards.length;
    const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let position = Math.max(0, cards.findIndex((card) => card.classList.contains("is-active")));
    let drag = null;
    let settleFrame = 0;
    let suppressClickUntil = 0;

    const indexAt = (value) => ((Math.round(value) % count) + count) % count;
    const spacing = () => Math.min(stage.clientWidth * 0.245, 320);

    function wrappedDistance(index, value) {
      let distance = index - value;
      const midpoint = count / 2;
      while (distance > midpoint) distance -= count;
      while (distance < -midpoint) distance += count;
      return distance;
    }

    function updateMeta(activeIndex) {
      if (currentLabel) currentLabel.textContent = String(activeIndex + 1).padStart(2, "0");
      if (journeyLabel) journeyLabel.textContent = cards[activeIndex]?.dataset.title || "Journey";
    }

    function render(value = position) {
      const pitch = spacing();
      const activeIndex = indexAt(value);
      cards.forEach((card, index) => {
        const distance = wrappedDistance(index, value);
        const absoluteDistance = Math.abs(distance);
        const direction = Math.sign(distance);
        card.style.setProperty("--travel-x", `${distance * pitch}px`);
        card.style.setProperty("--travel-z", `${-absoluteDistance * 180}px`);
        card.style.setProperty("--travel-rotate", `${direction * -42}deg`);
        card.style.setProperty("--travel-scale", String(Math.max(0.7, 1 - absoluteDistance * 0.08)));
        card.style.setProperty("--travel-opacity", String(absoluteDistance > 3 ? 0 : Math.max(0.3, 1 - absoluteDistance * 0.18)));
        card.style.zIndex = String(30 - Math.round(absoluteDistance * 3));
        card.classList.toggle("is-active", index === activeIndex);
        card.tabIndex = index === activeIndex ? 0 : -1;
        card.setAttribute("aria-hidden", String(absoluteDistance > 3));
      });
      updateMeta(activeIndex);
    }

    function cancelSettle() {
      if (!settleFrame) return;
      window.cancelAnimationFrame(settleFrame);
      settleFrame = 0;
      coverflow.classList.remove("is-settling");
    }

    function settleTo(target, focusCard = false) {
      cancelSettle();
      const start = position;
      const delta = target - start;
      const activeIndex = indexAt(target);
      const duration = Math.min(620, 360 + Math.abs(delta) * 100);
      const startedAt = performance.now();
      coverflow.classList.remove("is-dragging");

      if (reducedMotion() || Math.abs(delta) < 0.001) {
        position = target;
        render();
        if (focusCard) cards[activeIndex]?.focus({ preventScroll: true });
        return;
      }

      coverflow.classList.add("is-settling");
      const step = (now) => {
        const t = Math.min(1, (now - startedAt) / duration);
        const eased = 1 - Math.pow(1 - t, 4);
        position = start + delta * eased;
        render();
        if (t < 1) {
          settleFrame = window.requestAnimationFrame(step);
          return;
        }
        position = target;
        render();
        settleFrame = 0;
        coverflow.classList.remove("is-settling");
        if (focusCard) cards[activeIndex]?.focus({ preventScroll: true });
      };
      settleFrame = window.requestAnimationFrame(step);
    }

    function goTo(index, focusCard = false) {
      const target = index + Math.round((position - index) / count) * count;
      settleTo(target, focusCard);
    }

    function nudge(direction) {
      settleTo(Math.round(position) + direction);
    }

    function handlePointerDown(event) {
      if (!desktop.matches || event.button !== 0) return;
      event.stopImmediatePropagation();
      cancelSettle();
      const now = performance.now();
      drag = {
        id: event.pointerId,
        startX: event.clientX,
        startPosition: position,
        lastPosition: position,
        lastTime: now,
        velocity: 0,
        moved: false,
      };
      coverflow.classList.add("is-dragging");
      stage.setPointerCapture?.(event.pointerId);
    }

    function handlePointerMove(event) {
      if (!desktop.matches || !drag || drag.id !== event.pointerId) return;
      event.stopImmediatePropagation();
      event.preventDefault();
      const pitch = Math.max(spacing(), 1);
      const deltaX = event.clientX - drag.startX;
      const nextPosition = drag.startPosition - deltaX / pitch;
      const now = performance.now();
      const elapsed = Math.max(8, now - drag.lastTime);
      drag.velocity = ((nextPosition - drag.lastPosition) / elapsed) * 1000;
      drag.lastPosition = nextPosition;
      drag.lastTime = now;
      drag.moved ||= Math.abs(deltaX) > 5;
      position = nextPosition;
      render();
    }

    function finishPointer(event) {
      if (!desktop.matches || !drag || drag.id !== event.pointerId) return;
      event.stopImmediatePropagation();
      const finished = drag;
      drag = null;
      if (finished.moved) suppressClickUntil = performance.now() + 320;
      const inertia = Math.max(-1.35, Math.min(1.35, finished.velocity * 0.16));
      settleTo(Math.round(position + inertia));
    }

    stage.addEventListener("pointerdown", handlePointerDown, true);
    stage.addEventListener("pointermove", handlePointerMove, true);
    stage.addEventListener("pointerup", finishPointer, true);
    stage.addEventListener("pointercancel", finishPointer, true);
    stage.addEventListener("dragstart", (event) => {
      if (!desktop.matches) return;
      event.preventDefault();
      event.stopImmediatePropagation();
    }, true);

    stage.addEventListener("wheel", (event) => {
      if (!desktop.matches) return;
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY) && !event.shiftKey) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      nudge(event.deltaX + event.deltaY > 0 ? 1 : -1);
    }, { capture: true, passive: false });

    coverflow.addEventListener("click", (event) => {
      if (!desktop.matches) return;
      const previous = event.target.closest?.("[data-coverflow-prev]");
      const next = event.target.closest?.("[data-coverflow-next]");
      const card = event.target.closest?.("[data-travel-card]");
      if (!previous && !next && !card) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      if (performance.now() < suppressClickUntil) return;
      if (previous) return nudge(-1);
      if (next) return nudge(1);

      const index = cards.indexOf(card);
      const activeIndex = indexAt(position);
      if (index !== activeIndex) {
        goTo(index, true);
        return;
      }
      const href = card.getAttribute("href");
      if (href) window.location.assign(href);
    }, true);

    coverflow.addEventListener("keydown", (event) => {
      if (!desktop.matches || (event.key !== "ArrowLeft" && event.key !== "ArrowRight")) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      nudge(event.key === "ArrowRight" ? 1 : -1);
    }, true);

    previousButton?.setAttribute("title", "Previous journey");
    nextButton?.setAttribute("title", "Next journey");
    window.addEventListener("resize", () => {
      if (desktop.matches) render();
    }, { passive: true });

    if (desktop.matches) render();
  }

  loadBaseScript().then(installDesktopCoverflow).catch(() => installDesktopCoverflow());
})();
