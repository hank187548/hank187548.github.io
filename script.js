(() => {
  "use strict";

  const journeys = Array.isArray(window.JOURNEYS) ? window.JOURNEYS : [];
  const travelJourneys = journeys.filter((journey) => journey.type === "Travel" && journey.stops?.length > 1);
  const pad = (value) => String(value + 1).padStart(2, "0");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mobileLayout = window.matchMedia("(max-width: 700px)");

  document.addEventListener("gesturestart", (event) => event.preventDefault(), { passive: false });

  const menuButton = document.querySelector("[data-menu-button]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");
  const setMenu = (open) => {
    menuButton?.setAttribute("aria-expanded", String(open));
    menuButton?.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    mobileMenu?.classList.toggle("is-open", open);
    mobileMenu?.setAttribute("aria-hidden", String(!open));
    document.body.style.overflow = open ? "hidden" : "";
  };
  menuButton?.addEventListener("click", () => setMenu(menuButton.getAttribute("aria-expanded") !== "true"));
  mobileMenu?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));

  const year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();

  const hero = document.querySelector(".hero");
  const mapFrame = document.querySelector("[data-map-frame]");
  const routeCanvas = document.querySelector("[data-route-canvas]");
  const routeCities = document.querySelector("[data-route-cities]");
  const routeCopy = document.querySelector("[data-route-copy]");
  const routeIndexLabel = document.querySelector("[data-route-index]");
  const routeYear = document.querySelector("[data-route-year]");
  const routeTitle = document.querySelector("[data-route-title]");
  const routeDates = document.querySelector("[data-route-dates]");
  const routeOpen = document.querySelector("[data-route-open]");
  const routeNav = document.querySelector("[data-route-nav]");
  const routeLive = document.querySelector("[data-route-live]");
  const routeContext = routeCanvas?.getContext("2d");
  const routeButtons = [];
  const cityTimers = [];
  let activeRoute = 0;
  let routeTimer = 0;
  let transitionTimer = 0;
  let routeAnimation = 0;
  let routeProgress = 0;
  let heroVisible = true;
  let currentMapScale = 1;

  travelJourneys.forEach((journey, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("aria-label", `Show ${journey.title} route`);
    button.innerHTML = `<span>${pad(index)}</span>`;
    button.addEventListener("click", () => activateRoute(index));
    routeNav?.append(button);
    routeButtons.push(button);
  });

  const clearRouteTimers = () => {
    window.clearTimeout(routeTimer);
    window.clearTimeout(transitionTimer);
    cityTimers.splice(0).forEach((timer) => window.clearTimeout(timer));
    window.cancelAnimationFrame(routeAnimation);
  };

  const yearFrom = (dates) => dates.match(/\d{4}(?!.*\d{4})/)?.[0] || "";
  const shortDates = (dates) => dates.replace(/\s*·\s*\d{4}\s*$/, "");

  function applyMapFocus(journey, overview = false) {
    if (!mapFrame) return;
    const focus = overview ? { x: 50, y: 50, mobileScale: 1, desktopScale: 1 } : (journey.focus || { x: 50, y: 50, mobileScale: 1, desktopScale: 1 });
    const scale = mobileLayout.matches ? (focus.mobileScale || 1) : (focus.desktopScale || 1);
    const width = mapFrame.offsetWidth;
    const height = mapFrame.offsetHeight;
    const panX = -((focus.x / 100) - .5) * width * scale;
    const lift = overview ? 0 : window.innerHeight * (mobileLayout.matches ? .07 : .025);
    const panY = -((focus.y / 100) - .5) * height * scale - lift;
    currentMapScale = scale;
    mapFrame.style.setProperty("--map-scale", String(scale));
    mapFrame.style.setProperty("--map-pan-x", `${panX}px`);
    mapFrame.style.setProperty("--map-pan-y", `${panY}px`);
    mapFrame.style.setProperty("--label-scale", String(1 / scale));
  }

  function buildRouteSegments(journey, width, height) {
    return journey.stops.slice(0, -1).map((stop, index) => {
      const next = journey.stops[index + 1];
      const start = { x: stop.x / 100 * width, y: stop.y / 100 * height };
      const end = { x: next.x / 100 * width, y: next.y / 100 * height };
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const direct = Math.max(1, Math.hypot(dx, dy));
      const bend = Math.min(height * .1, direct * .22);
      const direction = index % 2 === 0 ? -1 : 1;
      const control = {
        x: (start.x + end.x) / 2 + (-dy / direct) * bend * direction,
        y: (start.y + end.y) / 2 + (dx / direct) * bend * direction - height * .012
      };
      const points = [];
      let length = 0;
      for (let step = 0; step <= 56; step += 1) {
        const t = step / 56;
        const inverse = 1 - t;
        const point = {
          x: inverse * inverse * start.x + 2 * inverse * t * control.x + t * t * end.x,
          y: inverse * inverse * start.y + 2 * inverse * t * control.y + t * t * end.y
        };
        if (points.length) {
          const previousPoint = points[points.length - 1];
          length += Math.hypot(point.x - previousPoint.x, point.y - previousPoint.y);
        }
        points.push(point);
      }
      return { points, length };
    });
  }

  function sizeRouteCanvas() {
    if (!routeCanvas || !routeContext || !mapFrame) return null;
    const width = mapFrame.offsetWidth;
    const height = mapFrame.offsetHeight;
    const density = Math.min(window.devicePixelRatio || 1, 2);
    routeCanvas.width = Math.round(width * density);
    routeCanvas.height = Math.round(height * density);
    routeCanvas.style.width = `${width}px`;
    routeCanvas.style.height = `${height}px`;
    routeContext.setTransform(density, 0, 0, density, 0, 0);
    return { width, height };
  }

  function drawRoute(progress) {
    if (!routeContext || !routeCanvas || !mapFrame || !travelJourneys[activeRoute]) return;
    const width = mapFrame.offsetWidth;
    const height = mapFrame.offsetHeight;
    routeContext.clearRect(0, 0, width, height);
    const segments = buildRouteSegments(travelJourneys[activeRoute], width, height);
    const totalLength = segments.reduce((sum, segment) => sum + segment.length, 0);
    let remaining = totalLength * progress;
    let movingPoint = segments[0]?.points[0];
    const gradient = routeContext.createLinearGradient(width * .45, height * .25, width * .92, height * .68);
    gradient.addColorStop(0, "rgba(255,255,255,.78)");
    gradient.addColorStop(.55, "#c7ff3d");
    gradient.addColorStop(1, "rgba(199,255,61,.35)");
    routeContext.strokeStyle = gradient;
    routeContext.lineWidth = (mobileLayout.matches ? 1.15 : 1.35) / currentMapScale;
    routeContext.lineCap = "round";
    routeContext.lineJoin = "round";
    routeContext.shadowColor = "rgba(199,255,61,.65)";
    routeContext.shadowBlur = mobileLayout.matches ? 3 : 7;

    segments.forEach((segment) => {
      if (remaining <= 0) return;
      routeContext.beginPath();
      routeContext.moveTo(segment.points[0].x, segment.points[0].y);
      let used = 0;
      for (let index = 1; index < segment.points.length; index += 1) {
        const previous = segment.points[index - 1];
        const point = segment.points[index];
        const piece = Math.hypot(point.x - previous.x, point.y - previous.y);
        if (used + piece <= remaining) {
          routeContext.lineTo(point.x, point.y);
          movingPoint = point;
          used += piece;
          continue;
        }
        const partial = Math.max(0, Math.min(1, (remaining - used) / piece));
        movingPoint = {
          x: previous.x + (point.x - previous.x) * partial,
          y: previous.y + (point.y - previous.y) * partial
        };
        routeContext.lineTo(movingPoint.x, movingPoint.y);
        used = remaining;
        break;
      }
      routeContext.stroke();
      remaining -= segment.length;
    });

    if (movingPoint && progress > 0 && progress < 1) {
      routeContext.shadowBlur = 12;
      routeContext.fillStyle = "#f7ffe7";
      routeContext.beginPath();
      routeContext.arc(movingPoint.x, movingPoint.y, mobileLayout.matches ? 1.8 : 2.5, 0, Math.PI * 2);
      routeContext.fill();
    }
  }

  function renderCities(journey) {
    if (!routeCities) return;
    routeCities.replaceChildren();
    const seen = new Set();
    const finalLabelScale = mobileLayout.matches ? (journey.focus?.mobileScale || 1) : (journey.focus?.desktopScale || 1);
    journey.stops.forEach((stop, index) => {
      if (seen.has(stop.name)) return;
      seen.add(stop.name);
      const city = document.createElement("div");
      city.className = "route-city";
      if (stop.x > 86) city.classList.add("route-city--left");
      if (stop.y > 63) city.classList.add("route-city--above");
      city.style.setProperty("--city-x", `${stop.x}%`);
      city.style.setProperty("--city-y", `${stop.y}%`);
      city.style.setProperty("--label-x", `${(stop.labelX || 0) * finalLabelScale}px`);
      city.style.setProperty("--label-y", `${(stop.labelY || 0) * finalLabelScale}px`);
      city.innerHTML = `<i></i><span>${stop.name}</span>`;
      routeCities.append(city);
      const timer = window.setTimeout(() => city.classList.add("is-visible"), 1650 + index * 300);
      cityTimers.push(timer);
    });
  }

  function animateRoute() {
    if (reducedMotion.matches) {
      routeProgress = 1;
      drawRoute(1);
      routeCities?.querySelectorAll(".route-city").forEach((city) => city.classList.add("is-visible"));
      return;
    }
    const start = performance.now();
    const duration = 3400;
    const frame = (now) => {
      const elapsed = Math.min(1, (now - start) / duration);
      routeProgress = 1 - Math.pow(1 - elapsed, 3);
      drawRoute(routeProgress);
      if (elapsed < 1) routeAnimation = window.requestAnimationFrame(frame);
    };
    routeAnimation = window.requestAnimationFrame(frame);
  }

  function scheduleNextRoute() {
    window.clearTimeout(routeTimer);
    if (reducedMotion.matches || !heroVisible || document.hidden) return;
    routeTimer = window.setTimeout(() => activateRoute(activeRoute + 1), 7200);
  }

  function updateRouteContent(journey, index) {
    const journeyYear = yearFrom(journey.dates);
    if (routeIndexLabel) routeIndexLabel.textContent = `${pad(index)} / ${String(travelJourneys.length).padStart(2, "0")}`;
    if (routeYear) routeYear.textContent = journeyYear;
    if (routeTitle) routeTitle.textContent = journey.title;
    if (routeDates) routeDates.textContent = shortDates(journey.dates);
    if (routeOpen) routeOpen.href = journey.href;
    if (routeLive) routeLive.textContent = `${journey.title}. ${journey.stops.filter((stop) => !stop.return).map((stop) => stop.name).join(" to ")}. ${journey.dates}.`;
    routeButtons.forEach((button, buttonIndex) => {
      button.classList.toggle("is-active", buttonIndex === index);
      button.toggleAttribute("aria-current", buttonIndex === index);
    });
    renderCities(journey);
    applyMapFocus(journey, !reducedMotion.matches);
    if (!reducedMotion.matches) {
      cityTimers.push(window.setTimeout(() => applyMapFocus(journey), 1450));
    }
    sizeRouteCanvas();
    routeProgress = 0;
    drawRoute(0);
  }

  function activateRoute(index, instant = false) {
    if (!travelJourneys.length) return;
    clearRouteTimers();
    const nextIndex = (index + travelJourneys.length) % travelJourneys.length;
    const change = () => {
      activeRoute = nextIndex;
      updateRouteContent(travelJourneys[activeRoute], activeRoute);
      window.requestAnimationFrame(() => {
        hero?.classList.remove("route-changing");
        routeCopy?.classList.remove("route-copy--changing");
        animateRoute();
        scheduleNextRoute();
      });
    };

    if (instant) {
      change();
      return;
    }
    hero?.classList.add("route-changing");
    routeCopy?.classList.add("route-copy--changing");
    transitionTimer = window.setTimeout(change, 520);
  }

  const coverflow = document.querySelector("[data-coverflow]");
  const stage = document.querySelector("[data-coverflow-stage]");
  const current = document.querySelector("[data-current]");
  const currentTitle = document.querySelector("[data-current-title]");
  const currentRoute = document.querySelector("[data-current-route]");
  const cards = journeys.map((journey, index) => {
    const card = document.createElement("a");
    card.className = "archive-card";
    card.href = journey.href;
    card.dataset.index = index;
    card.setAttribute("aria-label", `Open ${journey.title}`);
    card.innerHTML = `
      <img src="${journey.cover}" alt="${journey.title}" ${index ? 'loading="lazy"' : ""} decoding="async" draggable="false" />
      <span class="archive-card-number">${pad(index)} / ${String(journeys.length).padStart(2, "0")}</span>
      <span class="archive-card-type">${journey.type}</span>
      <span class="archive-card-copy">
        <small>${journey.dates}</small>
        <strong>${journey.title}</strong>
        <em>${journey.route}</em>
      </span>`;
    stage?.append(card);
    return card;
  });

  let selected = 0;
  let drag = null;
  let suppressClick = false;
  const wrappedDistance = (index) => {
    let distance = index - selected;
    const half = journeys.length / 2;
    if (distance > half) distance -= journeys.length;
    if (distance < -half) distance += journeys.length;
    return distance;
  };

  function renderCoverflow() {
    const cardWidth = cards[0]?.getBoundingClientRect().width || 300;
    const pitch = Math.min(window.innerWidth * .245, cardWidth * 1.02);
    cards.forEach((card, index) => {
      const distance = wrappedDistance(index);
      const absoluteDistance = Math.abs(distance);
      card.style.setProperty("--x", `${distance * pitch}px`);
      card.style.setProperty("--z", `${-absoluteDistance * cardWidth * .36}px`);
      card.style.setProperty("--rotate", `${-Math.sign(distance) * Math.min(48, absoluteDistance * 36)}deg`);
      card.style.setProperty("--scale", String(Math.max(.72, 1 - absoluteDistance * .075)));
      card.style.setProperty("--opacity", String(absoluteDistance > 3 ? 0 : Math.max(.2, 1 - absoluteDistance * .18)));
      card.style.zIndex = String(20 - Math.round(absoluteDistance * 3));
      card.classList.toggle("is-active", index === selected);
      card.tabIndex = index === selected ? 0 : -1;
      card.setAttribute("aria-hidden", String(absoluteDistance > 3));
    });

    const journey = journeys[selected];
    if (!journey) return;
    if (current) current.textContent = `${pad(selected)} / ${String(journeys.length).padStart(2, "0")}`;
    if (currentTitle) currentTitle.textContent = journey.title;
    if (currentRoute) currentRoute.textContent = journey.route;
  }

  function select(index) {
    if (!journeys.length) return;
    selected = (index + journeys.length) % journeys.length;
    renderCoverflow();
  }

  document.querySelector("[data-previous]")?.addEventListener("click", () => select(selected - 1));
  document.querySelector("[data-next]")?.addEventListener("click", () => select(selected + 1));
  coverflow?.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    select(selected + (event.key === "ArrowRight" ? 1 : -1));
  });

  stage?.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    drag = { id: event.pointerId, x: event.clientX, moved: false };
  });
  stage?.addEventListener("pointermove", (event) => {
    if (!drag || drag.id !== event.pointerId) return;
    if (Math.abs(event.clientX - drag.x) > 8) drag.moved = true;
  });
  const finishDrag = (event) => {
    if (!drag || drag.id !== event.pointerId) return;
    const delta = event.clientX - drag.x;
    if (drag.moved) {
      event.preventDefault();
      suppressClick = true;
      select(selected + (delta < 0 ? 1 : -1));
      window.setTimeout(() => { suppressClick = false; }, 250);
    }
    drag = null;
  };
  stage?.addEventListener("pointerup", finishDrag);
  stage?.addEventListener("pointercancel", finishDrag);
  stage?.addEventListener("click", (event) => {
    const card = event.target.closest(".archive-card");
    if (!card) return;
    if (suppressClick) { event.preventDefault(); return; }
    const index = Number(card.dataset.index);
    if (index !== selected) { event.preventDefault(); select(index); }
  });
  stage?.addEventListener("dragstart", (event) => event.preventDefault());

  const heroObserver = new IntersectionObserver(([entry]) => {
    heroVisible = entry.isIntersecting;
    if (heroVisible) activateRoute(activeRoute, true);
    else clearRouteTimers();
  }, { threshold: .18 });
  if (hero) heroObserver.observe(hero);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) clearRouteTimers();
    else if (heroVisible) activateRoute(activeRoute, true);
  });

  let resizeFrame = 0;
  window.addEventListener("resize", () => {
    window.cancelAnimationFrame(resizeFrame);
    resizeFrame = window.requestAnimationFrame(() => {
      renderCoverflow();
      applyMapFocus(travelJourneys[activeRoute]);
      sizeRouteCanvas();
      drawRoute(routeProgress);
    });
  }, { passive: true });

  if (journeys.length) renderCoverflow();
  if (travelJourneys.length) activateRoute(0, true);
})();
