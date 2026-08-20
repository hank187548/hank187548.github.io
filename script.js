(() => {
  "use strict";

  const desktopPointer = window.matchMedia("(min-width: 961px) and (hover: hover) and (pointer: fine)");

  function simplifyHomepageLayout() {
    // Keep the world map as the hero and reduce the copy to one word.
    document.querySelector(".hero-topline")?.remove();
    document.querySelector(".hero-bottom")?.remove();
    document.querySelector(".hero-heading .section-code")?.remove();
    document.querySelector(".manifesto")?.remove();

    const heroInner = document.querySelector(".hero-inner");
    const heroTitle = document.querySelector("#hero-title");
    heroInner?.classList.add("hero-inner--minimal");
    if (heroTitle) heroTitle.textContent = "Journeys";

    const scrollCue = document.querySelector(".scroll-cue");
    if (scrollCue) {
      scrollCue.setAttribute("href", "#stories");
      scrollCue.setAttribute("aria-label", "Scroll to travel archive");
    }

    // Travel becomes section 01 and sits immediately after the ticker.
    const ticker = document.querySelector(".ticker");
    const stories = document.querySelector("#stories");
    const profile = document.querySelector("#profile");
    if (ticker && stories) ticker.after(stories);
    else if (profile && stories) profile.before(stories);

    const storiesNumber = stories?.querySelector(".section-marker > span");
    const profileNumber = profile?.querySelector(".section-marker > span");
    if (storiesNumber) storiesNumber.textContent = "01";
    if (profileNumber) profileNumber.textContent = "02";

    // Match navigation order to the page order.
    const reorderNav = (nav) => {
      if (!nav) return;
      const travel = nav.querySelector('a[href="#stories"]');
      const life = nav.querySelector('a[href="#profile"]');
      if (travel && life) nav.insertBefore(travel, life);
      [...nav.querySelectorAll("a")].forEach((link, index) => {
        const number = link.querySelector("span");
        if (number) number.textContent = String(index + 1).padStart(2, "0");
      });
    };

    reorderNav(document.querySelector(".desktop-nav"));
    reorderNav(document.querySelector(".mobile-menu nav"));

    if (!document.querySelector("style[data-minimal-hero]")) {
      const style = document.createElement("style");
      style.dataset.minimalHero = "true";
      style.textContent = `
        .hero-inner--minimal {
          grid-template-rows: 1fr;
        }
        .hero-inner--minimal .hero-heading {
          align-self: center;
          padding: 0;
        }
        .hero-inner--minimal .hero-heading h1 {
          max-width: none;
          font-size: clamp(5rem, 10vw, 11rem);
          line-height: .86;
          letter-spacing: -.075em;
        }
        @media (max-width: 720px) {
          .hero-inner--minimal .hero-heading h1 {
            font-size: clamp(4.2rem, 19vw, 6.8rem);
          }
        }
      `;
      document.head.append(style);
    }
  }

  simplifyHomepageLayout();

  const simpleCardLabels = [
    { title: "Italy", html: "Italy", aria: "Open Italy journey" },
    { title: "China → Tokyo", html: "China →<br />Tokyo", aria: "Open China to Tokyo journey" },
    { title: "Okinawa", html: "Okinawa", aria: "Open Okinawa journey" },
    { title: "Bali → Australia", html: "Bali →<br />Australia", aria: "Open Bali to Australia journey" },
    { title: "Southeast Asia", html: "Southeast<br />Asia", aria: "Open Southeast Asia journey" },
  ];

  function simplifyTravelCards() {
    const cards = [...document.querySelectorAll("[data-travel-card]")];
    cards.forEach((card, index) => {
      const label = simpleCardLabels[index];
      if (!label) return;
      card.dataset.title = label.title;
      card.setAttribute("aria-label", label.aria);
      const copy = card.querySelector(".travel-card__copy");
      if (!copy) return;
      copy.classList.add("travel-card__copy--simple");
      copy.innerHTML = `<strong>${label.html}</strong>`;
    });

    const statusLabel = document.querySelector("[data-coverflow-label]");
    if (statusLabel) statusLabel.textContent = simpleCardLabels[0].title;

    if (!document.querySelector("style[data-simple-travel-cards]")) {
      const style = document.createElement("style");
      style.dataset.simpleTravelCards = "true";
      style.textContent = `
        .travel-card__copy--simple { gap: 0; }
        .travel-card__copy--simple strong {
          max-width: 92%;
          font-size: clamp(2.15rem, 3.25vw, 3.9rem);
          line-height: .92;
          letter-spacing: -.055em;
        }
        @media (max-width: 720px) {
          .travel-card__copy--simple strong {
            font-size: clamp(2rem, 10vw, 3.25rem);
          }
        }
      `;
      document.head.append(style);
    }
  }

  const loadBaseScript = () => new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "./script-base.js?v=20260820-minimal-hero";
    script.async = false;
    script.onload = resolve;
    script.onerror = reject;
    document.head.append(script);
  });

  function installDesktopCoverflow() {
    if (!desktopPointer.matches) return;

    const coverflow = document.querySelector("[data-coverflow]");
    const originalStage = coverflow?.querySelector("[data-coverflow-stage]");
    const currentLabel = coverflow?.querySelector("[data-coverflow-current]");
    const journeyLabel = coverflow?.querySelector("[data-coverflow-label]");
    if (!coverflow || !originalStage) return;

    const stage = originalStage.cloneNode(true);
    originalStage.replaceWith(stage);
    const cards = [...stage.querySelectorAll("[data-travel-card]")];
    if (cards.length < 2) return;

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
      const viewportHeight = Math.max(window.innerHeight, 1);
      const cardWidth = Math.max(cards[0]?.getBoundingClientRect().width || 0, 260);
      const aspectRatio = stageWidth / viewportHeight;
      const wideBoost = clamp((aspectRatio - 1.72) / 0.78, 0, 1);
      const responsivePitch = stageWidth * (0.205 + wideBoost * 0.052);
      const minimumPitch = cardWidth * 0.72;
      const maximumPitch = cardWidth * (1.12 + wideBoost * 0.52);
      const pitch = clamp(responsivePitch, minimumPitch, maximumPitch);

      return {
        cardWidth,
        pitch,
        depth: cardWidth * 0.48,
        wideBoost,
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
      const { pitch, depth, wideBoost } = metrics();
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
        const outerSpread = 1 + Math.max(0, absoluteDistance - 1) * wideBoost * 0.09;

        card.style.setProperty("--travel-x", `${distance * pitch * outerSpread}px`);
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

    previousButton?.addEventListener("click", (event) => {
      if (!desktopPointer.matches) return;
      event.preventDefault();
      nudge(-1, true);
    });

    nextButton?.addEventListener("click", (event) => {
      if (!desktopPointer.matches) return;
      event.preventDefault();
      nudge(1, true);
    });

    function handlePointerDown(event) {
      if (!desktopPointer.matches || event.button !== 0) return;
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
        captured: false,
      };
    }

    function handlePointerMove(event) {
      if (!desktopPointer.matches || !drag || drag.id !== event.pointerId) return;
      const pitch = Math.max(metrics().pitch, 1);
      const deltaX = event.clientX - drag.startX;

      if (!drag.moved && Math.abs(deltaX) > 4) {
        drag.moved = true;
        drag.captured = true;
        coverflow.classList.add("is-dragging");
        stage.setPointerCapture?.(event.pointerId);
      }

      if (!drag.moved) return;
      event.preventDefault();

      const nextPosition = drag.startPosition - deltaX / pitch;
      const now = performance.now();
      const elapsed = Math.max(5, now - drag.lastTime) / 1000;
      const instantaneousVelocity = (nextPosition - drag.lastPosition) / elapsed;

      drag.velocity = drag.velocity * 0.68 + instantaneousVelocity * 0.32;
      drag.lastPosition = nextPosition;
      drag.lastTime = now;
      position = nextPosition;
      render();
    }

    function finishPointer(event) {
      if (!desktopPointer.matches || !drag || drag.id !== event.pointerId) return;
      const finished = drag;
      drag = null;

      if (finished.captured) stage.releasePointerCapture?.(event.pointerId);
      coverflow.classList.remove("is-dragging");

      if (!finished.moved) return;

      event.preventDefault();
      suppressClickUntil = performance.now() + 320;
      const projectedMomentum = clamp(finished.velocity * 0.18, -1.8, 1.8);
      const target = Math.round(position + projectedMomentum);
      settleTo(target, finished.velocity * 0.45);
    }

    stage.addEventListener("pointerdown", handlePointerDown);
    stage.addEventListener("pointermove", handlePointerMove, { passive: false });
    stage.addEventListener("pointerup", finishPointer);
    stage.addEventListener("pointercancel", finishPointer);
    stage.addEventListener("dragstart", (event) => event.preventDefault());

    stage.addEventListener("wheel", (event) => {
      if (!desktopPointer.matches) return;
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY) && !event.shiftKey) return;
      event.preventDefault();
      nudge(event.deltaX + event.deltaY > 0 ? 1 : -1);
    }, { passive: false });

    cards.forEach((card, index) => {
      card.addEventListener("click", (event) => {
        if (!desktopPointer.matches) return;
        if (performance.now() < suppressClickUntil) {
          event.preventDefault();
          return;
        }

        const activeIndex = indexAt(position);
        if (index === activeIndex) return;

        event.preventDefault();
        goTo(index, true);
      });
    });

    coverflow.addEventListener("keydown", (event) => {
      if (!desktopPointer.matches || (event.key !== "ArrowLeft" && event.key !== "ArrowRight")) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      nudge(event.key === "ArrowRight" ? 1 : -1);
    }, true);

    previousButton?.setAttribute("title", "Previous journey");
    nextButton?.setAttribute("title", "Next journey");

    window.addEventListener("resize", () => {
      if (desktopPointer.matches) render();
    }, { passive: true });

    render();
  }

  loadBaseScript()
    .then(() => {
      simplifyTravelCards();
      installDesktopCoverflow();
    })
    .catch(() => {
      simplifyTravelCards();
      installDesktopCoverflow();
    });
})();
