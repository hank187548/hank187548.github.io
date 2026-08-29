(() => {
  "use strict";

  const journeySource = Array.isArray(window.JOURNEYS) ? window.JOURNEYS : [];
  const projectStop = (stop) => {
    if (!Number.isFinite(stop.lat) || !Number.isFinite(stop.lon)) return stop;
    return {
      ...stop,
      x: (stop.lon + 180) / 360 * 100,
      y: (90 - stop.lat) / 180 * 100
    };
  };
  const journeys = journeySource.map((journey) => journey.stops ? {
    ...journey,
    stops: journey.stops.map(projectStop)
  } : journey);
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
  const cameraTransitionMs = 1850;
  const routeCycleMs = 8800;
  let activeRoute = 0;
  let routeTimer = 0;
  let transitionTimer = 0;
  let flightTimer = 0;
  let routeAnimation = 0;
  let routeProgress = 0;
  let heroVisible = true;
  let routeDensity = 1;
  let currentProjection = null;
  let routeGeometry = null;
  let routeViewport = { width: 0, height: 0 };

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
    window.clearTimeout(flightTimer);
    window.cancelAnimationFrame(routeAnimation);
  };

  const yearFrom = (dates) => dates.match(/\d{4}(?!.*\d{4})/)?.[0] || "";
  const shortDates = (dates) => dates.replace(/\s*·\s*\d{4}\s*$/, "");
  const cameraSettleDelay = () => reducedMotion.matches ? 0 : cameraTransitionMs + 80;

  function applyMapFocus(journey) {
    if (!mapFrame) return;
    const focus = journey.focus || { x: 50, y: 50, mobileScale: 1, desktopScale: 1 };
    const routeStops = journey.stops?.length ? journey.stops : [{ x: focus.x, y: focus.y }];
    const xs = routeStops.map((stop) => stop.x);
    const ys = routeStops.map((stop) => stop.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const scaleLimit = mobileLayout.matches ? (focus.mobileScale || 1) : (focus.desktopScale || 1);
    const width = mapFrame.offsetWidth;
    const height = mapFrame.offsetHeight;
    const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
    const viewportHeight = hero?.clientHeight || document.documentElement.clientHeight || window.innerHeight;
    const paddedRouteWidth = Math.max(maxX - minX + (mobileLayout.matches ? 4 : 3), 1) / 100 * width;
    const paddedRouteHeight = Math.max(maxY - minY + 4, 1) / 100 * height;
    const fitX = viewportWidth * (mobileLayout.matches ? .76 : .82) / paddedRouteWidth;
    const fitY = viewportHeight * (mobileLayout.matches ? .48 : .62) / paddedRouteHeight;
    const scale = Math.max(1, Math.min(scaleLimit, fitX, fitY));
    const panX = -((centerX / 100) - .5) * width * scale;
    const lift = viewportHeight * (mobileLayout.matches ? .07 : .025);
    const panY = -((centerY / 100) - .5) * height * scale - lift;
    currentProjection = { mapWidth: width, mapHeight: height, viewportWidth, viewportHeight, scale, panX, panY };
    mapFrame.style.setProperty("--map-scale", String(scale));
    mapFrame.style.setProperty("--map-pan-x", `${panX}px`);
    mapFrame.style.setProperty("--map-pan-y", `${panY}px`);
  }

  function projectRouteStop(stop) {
    if (!currentProjection) return { x: 0, y: 0 };
    const { mapWidth, mapHeight, viewportWidth, viewportHeight, scale, panX, panY } = currentProjection;
    return {
      x: viewportWidth / 2 + panX + (stop.x / 100 * mapWidth - mapWidth / 2) * scale,
      y: viewportHeight / 2 + panY + (stop.y / 100 * mapHeight - mapHeight / 2) * scale
    };
  }

  function buildRouteGeometry(journey) {
    if (!journey?.stops?.length || !currentProjection) return null;
    const stops = journey.stops.map(projectRouteStop);
    const segments = [];
    let totalLength = 0;

    stops.slice(0, -1).forEach((start, index) => {
      const end = stops[index + 1];
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const direct = Math.max(1, Math.hypot(dx, dy));
      const bend = Math.min(routeViewport.height * .11, direct * .22);
      const direction = index % 2 === 0 ? -1 : 1;
      const control = {
        x: (start.x + end.x) / 2 + (-dy / direct) * bend * direction,
        y: (start.y + end.y) / 2 + (dx / direct) * bend * direction - routeViewport.height * .012
      };
      const points = [];
      let length = 0;
      const samples = Math.max(72, Math.min(180, Math.ceil(direct / 3)));
      for (let step = 0; step <= samples; step += 1) {
        const t = step / samples;
        const inverse = 1 - t;
        const point = {
          x: inverse * inverse * start.x + 2 * inverse * t * control.x + t * t * end.x,
          y: inverse * inverse * start.y + 2 * inverse * t * control.y + t * t * end.y,
          distance: length,
          t
        };
        if (points.length) {
          const previous = points[points.length - 1];
          length += Math.hypot(point.x - previous.x, point.y - previous.y);
          point.distance = length;
        }
        points.push(point);
      }
      segments.push({ start, end, control, points, length, offset: totalLength });
      totalLength += length;
    });

    let travelled = 0;
    const stopProgress = [0];
    segments.forEach((segment) => {
      travelled += segment.length;
      stopProgress.push(totalLength ? travelled / totalLength : 1);
    });
    return { stops, segments, totalLength, stopProgress };
  }

  function routePositionAtProgress(progress) {
    if (!routeGeometry?.segments.length) {
      return { point: routeGeometry?.stops[0] || null, segment: null, t: 0, distance: 0 };
    }
    const target = routeGeometry.totalLength * Math.max(0, Math.min(1, progress));
    const segment = routeGeometry.segments.find((item) => target <= item.offset + item.length) || routeGeometry.segments.at(-1);
    const localDistance = Math.max(0, Math.min(segment.length, target - segment.offset));
    const nextIndex = segment.points.findIndex((point) => point.distance >= localDistance);
    let t = 0;
    if (nextIndex < 0) {
      t = 1;
    } else if (nextIndex > 0) {
      const previous = segment.points[nextIndex - 1];
      const next = segment.points[nextIndex];
      const span = Math.max(.001, next.distance - previous.distance);
      const amount = (localDistance - previous.distance) / span;
      t = previous.t + (next.t - previous.t) * amount;
    }
    const inverse = 1 - t;
    return {
      point: {
        x: inverse * inverse * segment.start.x + 2 * inverse * t * segment.control.x + t * t * segment.end.x,
        y: inverse * inverse * segment.start.y + 2 * inverse * t * segment.control.y + t * t * segment.end.y
      },
      segment,
      t,
      distance: target
    };
  }

  function sizeRouteCanvas() {
    if (!routeCanvas || !routeContext) return null;
    const width = routeCanvas.parentElement?.clientWidth || document.documentElement.clientWidth || window.innerWidth;
    const height = hero?.clientHeight || document.documentElement.clientHeight || window.innerHeight;
    routeDensity = Math.min(3, Math.max(2, window.devicePixelRatio || 1));
    const pixelWidth = Math.round(width * routeDensity);
    const pixelHeight = Math.round(height * routeDensity);
    if (routeCanvas.width !== pixelWidth || routeCanvas.height !== pixelHeight) {
      routeCanvas.width = pixelWidth;
      routeCanvas.height = pixelHeight;
    }
    routeCanvas.style.width = `${width}px`;
    routeCanvas.style.height = `${height}px`;
    routeContext.setTransform(routeDensity, 0, 0, routeDensity, 0, 0);
    routeViewport = { width, height };
    return routeViewport;
  }

  function drawRoute(progress) {
    if (!routeContext || !routeCanvas || !routeGeometry?.totalLength) return;
    const normalized = Math.max(0, Math.min(1, progress));
    routeContext.clearRect(0, 0, routeViewport.width, routeViewport.height);
    if (normalized <= 0) return;

    const xs = routeGeometry.stops.map((stop) => stop.x);
    const ys = routeGeometry.stops.map((stop) => stop.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const gradientEndX = Math.abs(maxX - minX) < 1 ? minX + 1 : maxX;
    const gradientEndY = Math.abs(maxY - minY) < 1 ? minY + 1 : maxY;
    const gradient = routeContext.createLinearGradient(minX, minY, gradientEndX, gradientEndY);
    gradient.addColorStop(0, "rgba(255,255,255,.9)");
    gradient.addColorStop(.5, "#d7ff72");
    gradient.addColorStop(1, "rgba(199,255,61,.72)");

    const position = routePositionAtProgress(normalized);
    const visiblePath = new Path2D();
    visiblePath.moveTo(routeGeometry.stops[0].x, routeGeometry.stops[0].y);
    routeGeometry.segments.some((segment) => {
      const localDistance = position.distance - segment.offset;
      if (localDistance <= 0) return true;
      if (localDistance >= segment.length - .001) {
        visiblePath.quadraticCurveTo(segment.control.x, segment.control.y, segment.end.x, segment.end.y);
        return false;
      }
      const partialT = position.segment === segment ? position.t : 0;
      if (partialT > 0) {
        const partialControlX = segment.start.x + (segment.control.x - segment.start.x) * partialT;
        const partialControlY = segment.start.y + (segment.control.y - segment.start.y) * partialT;
        visiblePath.quadraticCurveTo(partialControlX, partialControlY, position.point.x, position.point.y);
      }
      return true;
    });

    routeContext.save();
    routeContext.strokeStyle = gradient;
    routeContext.lineWidth = mobileLayout.matches ? 1.45 : 1.7;
    routeContext.lineCap = "round";
    routeContext.lineJoin = "round";
    routeContext.shadowColor = "rgba(199,255,61,.58)";
    routeContext.shadowBlur = mobileLayout.matches ? 4 : 7;
    routeContext.stroke(visiblePath);
    routeContext.restore();

    const movingPoint = position.point;
    if (movingPoint && normalized < 1) {
      routeContext.save();
      routeContext.shadowColor = "rgba(225,255,148,.9)";
      routeContext.shadowBlur = mobileLayout.matches ? 8 : 12;
      routeContext.fillStyle = "#fbfff1";
      routeContext.beginPath();
      routeContext.arc(movingPoint.x, movingPoint.y, mobileLayout.matches ? 2.2 : 2.7, 0, Math.PI * 2);
      routeContext.fill();
      routeContext.restore();
    }
  }

  function renderCities(journey) {
    if (!routeCities || !routeGeometry) return;
    routeCities.replaceChildren();
    const seen = new Set();
    journey.stops.forEach((stop, index) => {
      if (seen.has(stop.name)) return;
      seen.add(stop.name);
      const point = routeGeometry.stops[index];
      const city = document.createElement("div");
      city.className = "route-city";
      if (point.x > routeViewport.width - 110) city.classList.add("route-city--left");
      if (point.y > routeViewport.height - 90) city.classList.add("route-city--above");
      city.style.setProperty("--city-x", `${point.x}px`);
      city.style.setProperty("--city-y", `${point.y}px`);
      city.style.setProperty("--label-x", `${stop.labelX || 0}px`);
      city.style.setProperty("--label-y", `${stop.labelY || 0}px`);
      city.dataset.reveal = String(routeGeometry.stopProgress[index] || 0);
      city.innerHTML = `<i></i><span>${stop.name}</span>`;
      routeCities.append(city);
    });
    updateCities(routeProgress);
  }

  function updateCities(progress) {
    routeCities?.querySelectorAll(".route-city").forEach((city) => {
      city.classList.toggle("is-visible", Number(city.dataset.reveal || 0) <= progress + .002);
    });
  }

  function animateRoute() {
    if (reducedMotion.matches) {
      routeProgress = 1;
      drawRoute(1);
      updateCities(1);
      return;
    }
    const start = performance.now();
    const duration = 3200;
    const frame = (now) => {
      const elapsed = Math.min(1, (now - start) / duration);
      routeProgress = elapsed;
      drawRoute(routeProgress);
      updateCities(routeProgress);
      if (elapsed < 1) routeAnimation = window.requestAnimationFrame(frame);
    };
    routeAnimation = window.requestAnimationFrame(frame);
  }

  function scheduleNextRoute() {
    window.clearTimeout(routeTimer);
    if (reducedMotion.matches || !heroVisible || document.hidden) return;
    routeTimer = window.setTimeout(() => activateRoute(activeRoute + 1), routeCycleMs);
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
    applyMapFocus(journey);
    sizeRouteCanvas();
    routeGeometry = buildRouteGeometry(journey);
    routeProgress = 0;
    renderCities(journey);
    drawRoute(0);
  }

  function activateRoute(index, instant = false) {
    if (!travelJourneys.length) return;
    clearRouteTimers();
    const nextIndex = (index + travelJourneys.length) % travelJourneys.length;
    hero?.classList.add("route-changing");
    if (!instant) routeCopy?.classList.add("route-copy--changing");
    const change = () => {
      activeRoute = nextIndex;
      updateRouteContent(travelJourneys[activeRoute], activeRoute);
      window.requestAnimationFrame(() => {
        routeCopy?.classList.remove("route-copy--changing");
        flightTimer = window.setTimeout(() => {
          hero?.classList.remove("route-changing");
          animateRoute();
        }, cameraSettleDelay());
        scheduleNextRoute();
      });
    };

    if (instant) {
      change();
      return;
    }
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
    const wasVisible = heroVisible;
    heroVisible = entry.isIntersecting;
    if (heroVisible && !wasVisible) activateRoute(activeRoute, true);
    else if (!heroVisible && wasVisible) clearRouteTimers();
  }, { threshold: .18 });
  if (hero) heroObserver.observe(hero);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) clearRouteTimers();
    else if (heroVisible) activateRoute(activeRoute, true);
  });

  let resizeFrame = 0;
  let lastLayoutWidth = document.documentElement.clientWidth || window.innerWidth;
  window.addEventListener("resize", () => {
    const nextWidth = document.documentElement.clientWidth || window.innerWidth;
    if (mobileLayout.matches && Math.abs(nextWidth - lastLayoutWidth) < 2) return;
    lastLayoutWidth = nextWidth;
    window.cancelAnimationFrame(resizeFrame);
    resizeFrame = window.requestAnimationFrame(() => {
      renderCoverflow();
      applyMapFocus(travelJourneys[activeRoute]);
      sizeRouteCanvas();
      routeGeometry = buildRouteGeometry(travelJourneys[activeRoute]);
      renderCities(travelJourneys[activeRoute]);
      drawRoute(routeProgress);
      updateCities(routeProgress);
    });
  }, { passive: true });

  if (journeys.length) renderCoverflow();
  if (travelJourneys.length) activateRoute(0, true);
})();
