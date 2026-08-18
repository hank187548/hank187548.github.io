(() => {
  "use strict";

  const desktopPointer = window.matchMedia("(min-width: 961px) and (hover: hover) and (pointer: fine)");

  const loadBaseScript = () => new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "./script-base.js?v=20260819-coverflow-arrow-clean";
    script.async = false;
    script.onload = resolve;
    script.onerror = reject;
    document.head.append(script);
  });

  function installDesktopCoverflow() {
    const desktop = desktopPointer;
    const coverflow = document.querySelector("[data-coverflow]");
    const stage = coverflow?.querySelector("[data-coverflow-stage]");
    const cards = coverflow ? [...coverflow.querySelectorAll("[data-travel-card]")] : [];
    const currentLabel = coverflow?.querySelector("[data-coverflow-current]");
    const journeyLabel = coverflow?.querySelector("[data-coverflow-label]");
    if (!coverflow || !stage || cards.length < 2) return;

    // The legacy base script already attached click listeners directly to the two
    // arrow buttons. Replace the DOM nodes after base initialization so those
    // listeners are physically gone instead of trying to race/cancel them.
    const replaceButtonWithoutListeners = (selector) => {
      const oldButton = coverflow.querySelector(selector);
      if (!oldButton) return null;
      const freshButton = oldButton.cloneNode(true);
      oldButton.replaceWith(freshButton);
      return freshButton;
    };

    const previousButton = replaceButtonWithoutListeners("[data-coverflow-prev]");
    const nextButton = replaceButtonWithoutListeners("[data-coverflow-next]");

    const count = cards.length;
    const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let position = Math.max(0, cards.findIndex((card) => card.classList.contains("is-active")));
    let drag = null;
    let springFrame = 0;
    let springTarget = position;
    let suppressClickUntil = 0;

    const indexAt = (value) => ((Math.round(value) % count) + count) % count;
    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

    function metrics() {
      const stageWidth = Math.max(stage.clientWidth, window.innerWidth, 1);
      const cardWidth = Math.max(cards[0]?.getBoundingClientRect().width || 0, 260);
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

    function settleTo(target, initialVelocity = 0, focusCard = false, forceMotion = false) {
      cancelSpring();
      springTarget = target;
      const activeIndex = indexAt(target);
      coverflow.classList.remove("is-dragging");

      if (reducedMotion() && !forceMotion) {
        position = target;
        render();
        if (focusCard) cards[activeIndex]?.focus({ preventScroll: true });
        return;
      }

      const stiffness = 205;
      const damping = 24;
      const mass = 0.92;
      let velocity = initialVelocity;
      let lastTime = performance.now();
      coverflow.classList.add("is-settling");

      const step = (now) => {
        const dt = Math.min(0.028, Math.max(0.001, (now - lastTime) / 1000));
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

    function nudge(direction, forceMotion = false) {
      const baseTarget = springFrame ? springTarget : Math.round(position);
      const target = baseTarget + direction;
      const arrowVelocity = direction * 1.55;
      settleTo(target, arrowVelocity, false, forceMotion);
    }

    // These cloned buttons have no legacy listeners. A click can therefore only
    // take the spring path below.
    previousButton?.addEventListener("click", (event) => {
      if (!desktop.matches) return;
      event.preventDefault();
      nudge(-1, true);
    });

    nextButton?.addEventListener("click", (event) => {
      if (!desktop.matches) return;
      event.preventDefault();
      nudge(1, true);
    });

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
      const card = event.target.closest?.("[data-travel-card]");
      if (!card) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      if (performance.now() < suppressClickUntil) return;

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
