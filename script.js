(() => {
  "use strict";

  const loadBaseScript = () => new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "./script-base.js?v=20260818-coverflow-physics-2";
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
    let springFrame = 0;
    let suppressClickUntil = 0;

    const indexAt = (value) => ((Math.round(value) % count) + count) % count;
    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

    function metrics() {
      const stageWidth = Math.max(stage.clientWidth, window.innerWidth, 1);
      const cardWidth = Math.max(cards[0]?.getBoundingClientRect().width || 0, 260);
      // Adapt the centre-to-centre distance to both card size and viewport width.
      // Smaller desktops stay compact; wide displays naturally breathe without a fixed px cap.
      const responsivePitch = stageWidth * 0.205;
      const cardPitch = cardWidth + Math.max(18, stageWidth * 0.018);
      const pitch = clamp(Math.min(responsivePitch, cardPitch), cardWidth * 0.72, cardWidth * 1.12);
      return {
        cardWidth,
        pitch,
        depth: cardWidth * 0.48,
      };
    }

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
      const { pitch, depth } = metrics();
      const activeIndex = indexAt(value);

      cards.forEach((card, index) => {
        const distance = wrappedDistance(index, value);
        const absoluteDistance = Math.abs(distance);
        const direction = Math.sign(distance);
        const depthRamp = Math.pow(absoluteDistance, 0.82);
        const centreBlend = Math.min(1, absoluteDistance);
        const rotation = -direction * 44 * Math.pow(centreBlend, 0.72);
        const scale = clamp(1 - depthRamp * 0.075, 0.72, 1);
        const opacity = absoluteDistance > 3 ? 0 : clamp(1 - depthRamp * 0.17, 0.28, 1);

        card.style.setProperty("--travel-x", `${distance * pitch}px`);
        card.style.setProperty("--travel-z", `${-depth * depthRamp}px`);
        card.style.setProperty("--travel-rotate", `${rotation}deg`);
        card.style.setProperty("--travel-scale", String(scale));
        card.style.setProperty("--travel-opacity", String(opacity));
        card.style.zIndex = String(40 - Math.round(absoluteDistance * 4));
        card.classList.toggle("is-active", index === activeIndex);
        card.tabIndex = index === activeIndex ? 0 : -1;
        card.setAttribute("aria-hidden", String(absoluteDistance > 3));
      });

      updateMeta(activeIndex);
    }

    function cancelSpring() {
      if (!springFrame) return;
      window.cancelAnimationFrame(springFrame);
      springFrame = 0;
      coverflow.classList.remove("is-settling");
    }

    function settleTo(target, initialVelocity = 0, focusCard = false) {
      cancelSpring();
      const activeIndex = indexAt(target);
      coverflow.classList.remove("is-dragging");

      if (reducedMotion()) {
        position = target;
        render();
        if (focusCard) cards[activeIndex]?.focus({ preventScroll: true });
        return;
      }

      // Near-critically damped spring: physical rather than a fixed-duration tween.
      // Values are tuned to the same family of spring behaviour used by Ruixen-style carousels.
      const stiffness = 230;
      const damping = 28;
      const mass = 0.9;
      let velocity = initialVelocity;
      let lastTime = performance.now();
      coverflow.classList.add("is-settling");

      const step = (now) => {
        const dt = Math.min(0.032, Math.max(0.001, (now - lastTime) / 1000));
        lastTime = now;
        const displacement = position - target;
        const springForce = -stiffness * displacement;
        const dampingForce = -damping * velocity;
        const acceleration = (springForce + dampingForce) / mass;

        velocity += acceleration * dt;
        position += velocity * dt;
        render();

        if (Math.abs(target - position) < 0.0007 && Math.abs(velocity) < 0.008) {
          position = target;
          render();
          springFrame = 0;
          coverflow.classList.remove("is-settling");
          if (focusCard) cards[activeIndex]?.focus({ preventScroll: true });
          return;
        }
        springFrame = window.requestAnimationFrame(step);
      };

      springFrame = window.requestAnimationFrame(step);
    }

    function goTo(index, focusCard = false) {
      const target = index + Math.round((position - index) / count) * count;
      settleTo(target, 0, focusCard);
    }

    function nudge(direction) {
      settleTo(Math.round(position) + direction);
    }

    function handlePointerDown(event) {
      if (!desktop.matches || event.button !== 0) return;
      event.stopImmediatePropagation();
      event.preventDefault();
      cancelSpring();
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
      const pitch = Math.max(metrics().pitch, 1);
      const deltaX = event.clientX - drag.startX;
      const nextPosition = drag.startPosition - deltaX / pitch;
      const now = performance.now();
      const elapsed = Math.max(5, now - drag.lastTime) / 1000;
      const instantaneousVelocity = (nextPosition - drag.lastPosition) / elapsed;

      // Smooth noisy mouse samples before using velocity for release momentum.
      drag.velocity = drag.velocity * 0.68 + instantaneousVelocity * 0.32;
      drag.lastPosition = nextPosition;
      drag.lastTime = now;
      drag.moved ||= Math.abs(deltaX) > 4;
      position = nextPosition;
      render();
    }

    function finishPointer(event) {
      if (!desktop.matches || !drag || drag.id !== event.pointerId) return;
      event.stopImmediatePropagation();
      event.preventDefault();
      const finished = drag;
      drag = null;
      stage.releasePointerCapture?.(event.pointerId);

      if (finished.moved) suppressClickUntil = performance.now() + 320;
      const projectedMomentum = clamp(finished.velocity * 0.18, -1.8, 1.8);
      const target = Math.round(position + projectedMomentum);
      settleTo(target, finished.velocity * 0.45);
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