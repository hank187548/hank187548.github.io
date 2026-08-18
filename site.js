(() => {
  "use strict";

  const doc = document;
  const body = doc.body;
  const header = doc.querySelector("[data-header]");
  const progress = doc.querySelector("[data-scroll-progress]");
  const menuButton = doc.querySelector("[data-menu-toggle]");
  const mobileMenu = doc.querySelector("[data-mobile-menu]");
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const setMenu = (open) => {
    if (!menuButton || !mobileMenu) return;
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.textContent = open ? "Close" : "Menu";
    mobileMenu.classList.toggle("is-open", open);
    mobileMenu.setAttribute("aria-hidden", String(!open));
    body.classList.toggle("menu-open", open);
  };
  menuButton?.addEventListener("click", () => setMenu(menuButton.getAttribute("aria-expanded") !== "true"));
  mobileMenu?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));
  doc.addEventListener("keydown", (event) => { if (event.key === "Escape") setMenu(false); });

  let scrollFrame = 0;
  const updateScrollUi = () => {
    scrollFrame = 0;
    const y = window.scrollY || doc.documentElement.scrollTop;
    header?.classList.toggle("is-compact", y > 32);
    if (progress) {
      const max = doc.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = `scaleX(${max > 0 ? Math.min(1, Math.max(0, y / max)) : 0})`;
    }
  };
  window.addEventListener("scroll", () => { if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateScrollUi); }, { passive: true });
  updateScrollUi();

  const heroSlides = [...doc.querySelectorAll("[data-hero-slide]")];
  const heroDots = [...doc.querySelectorAll("[data-hero-dot]")];
  const heroCurrent = doc.querySelector("[data-hero-current]");
  const heroLabel = doc.querySelector("[data-hero-label]");
  let activeSlide = 0;
  let heroTimer = 0;
  const showSlide = (index, restart = true) => {
    if (!heroSlides.length) return;
    activeSlide = (index + heroSlides.length) % heroSlides.length;
    heroSlides.forEach((slide, i) => slide.classList.toggle("is-active", i === activeSlide));
    heroDots.forEach((dot, i) => { const active = i === activeSlide; dot.classList.toggle("is-active", active); dot.setAttribute("aria-pressed", String(active)); });
    if (heroCurrent) heroCurrent.textContent = String(activeSlide + 1).padStart(2, "0");
    if (heroLabel) heroLabel.textContent = heroSlides[activeSlide].dataset.label || "";
    if (restart && !reduceMotion) startHeroTimer();
  };
  const startHeroTimer = () => { window.clearInterval(heroTimer); heroTimer = window.setInterval(() => showSlide(activeSlide + 1, false), 6500); };
  heroDots.forEach((dot, index) => dot.addEventListener("click", () => showSlide(index)));
  if (!reduceMotion && heroSlides.length > 1) startHeroTimer();

  const coverflow = doc.querySelector(".journey-rail");
  if (coverflow) {
    const cards = [...coverflow.querySelectorAll(".journey-card")];
    const count = cards.length;
    let ui = doc.querySelector("[data-coverflow-ui]");
    if (!ui) {
      ui = doc.createElement("div");
      ui.className = "coverflow-static-ui";
      ui.setAttribute("data-coverflow-ui", "");
      ui.innerHTML = `<div class="coverflow-caption" aria-live="polite"><span class="coverflow-caption__eyebrow" data-coverflow-eyebrow></span><h3 data-coverflow-title></h3><p data-coverflow-route></p><a class="coverflow-caption__link" data-coverflow-link href="#journeys">Open journey <span>↗</span></a></div><div class="coverflow-controls"><div class="coverflow-count"><span data-coverflow-current>01</span><i></i><span>${String(count).padStart(2, "0")}</span></div><button class="coverflow-nav" type="button" data-coverflow-prev aria-label="Previous journey">←</button><button class="coverflow-nav" type="button" data-coverflow-next aria-label="Next journey">→</button></div>`;
      coverflow.insertAdjacentElement("afterend", ui);
    }
    if (count) {
      const captionEyebrow = ui.querySelector("[data-coverflow-eyebrow]");
      const captionTitle = ui.querySelector("[data-coverflow-title]");
      const captionRoute = ui.querySelector("[data-coverflow-route]");
      const captionLink = ui.querySelector("[data-coverflow-link]");
      const currentIndex = ui.querySelector("[data-coverflow-current]");
      const prevButton = ui.querySelector("[data-coverflow-prev]");
      const nextButton = ui.querySelector("[data-coverflow-next]");
      const rotate = 44, depth = 0.6, falloff = 0.56, fade = 0.1, gap = 0.05;
      let pos = 0, target = 0, selected = 0, cardWidth = 0, raf = 0, suppressClickUntil = 0, drag = null;
      const indexAt = (value) => ((Math.round(value) % count) + count) % count;
      const updateCaption = (index) => {
        selected = ((index % count) + count) % count;
        const card = cards[selected];
        const meta = card.querySelector(".journey-card__meta");
        cards.forEach((item, i) => { const active = i === selected; item.classList.toggle("is-active", active); item.setAttribute("aria-current", active ? "true" : "false"); });
        if (captionEyebrow) captionEyebrow.textContent = meta?.querySelector("span")?.textContent || "";
        if (captionTitle) captionTitle.textContent = meta?.querySelector("h3")?.textContent || "";
        if (captionRoute) captionRoute.textContent = meta?.querySelector("p")?.textContent || "";
        if (captionLink) captionLink.href = card.getAttribute("href") || "#journeys";
        if (currentIndex) currentIndex.textContent = String(selected + 1).padStart(2, "0");
      };
      const paint = () => {
        if (!cardWidth) return;
        const pitch = cardWidth * (1 + gap);
        cards.forEach((card, index) => {
          let offset = index - pos;
          offset = ((offset % count) + count) % count;
          if (offset > count / 2) offset -= count;
          const distance = Math.abs(offset);
          const ramp = Math.pow(distance, falloff);
          const tilt = Math.min(rotate * ramp, 82) * Math.sign(offset);
          const edge = Math.min(1, Math.max(0, count / 2 - distance));
          card.style.transform = `translateX(calc(-50% + ${offset * pitch}px)) translateZ(${-depth * cardWidth * ramp}px) rotateY(${-tilt}deg)`;
          card.style.opacity = String(Math.max(0, 1 - fade * distance) * edge);
          card.style.zIndex = String(100 - Math.round(distance * 10));
        });
      };
      const settle = (nextTarget) => {
        if (raf) window.cancelAnimationFrame(raf);
        target = nextTarget;
        updateCaption(indexAt(target));
        if (reduceMotion) { pos = target; paint(); raf = 0; return; }
        const step = () => {
          const remaining = target - pos;
          if (Math.abs(remaining) < 0.0004) { pos = target; paint(); raf = 0; return; }
          pos += remaining * 0.16;
          paint();
          raf = window.requestAnimationFrame(step);
        };
        raf = window.requestAnimationFrame(step);
      };
      const goTo = (index) => settle(index + Math.round((target - index) / count) * count);
      const nudge = (by) => settle(Math.round(target) + by);
      const measure = () => { cardWidth = cards[0]?.offsetWidth || 0; paint(); };
      coverflow.classList.add("is-coverflow");
      coverflow.setAttribute("tabindex", "0");
      coverflow.setAttribute("role", "region");
      coverflow.setAttribute("aria-roledescription", "carousel");
      coverflow.setAttribute("aria-label", "Travel journeys");
      cards.forEach((card, index) => {
        card.setAttribute("aria-label", `${index + 1} of ${count}`);
        card.addEventListener("click", (event) => {
          if (performance.now() < suppressClickUntil) { event.preventDefault(); return; }
          if (index !== selected) { event.preventDefault(); goTo(index); }
        });
      });
      ui.classList.add("is-ready");
      const railNote = doc.querySelector(".rail-note");
      if (railNote) { const spans = railNote.querySelectorAll("span"); if (spans[0]) spans[0].textContent = "Drag / swipe / arrow keys"; if (spans[1]) spans[1].textContent = "Tap the centre card to open ↗"; }
      updateCaption(0); measure();
      const observer = "ResizeObserver" in window ? new ResizeObserver(measure) : null;
      observer?.observe(coverflow);
      window.addEventListener("resize", measure, { passive: true });
      coverflow.addEventListener("pointerdown", (event) => {
        if (event.button !== 0) return;
        if (raf) { window.cancelAnimationFrame(raf); raf = 0; }
        coverflow.setPointerCapture?.(event.pointerId);
        target = pos;
        drag = { id:event.pointerId, x:event.clientX, pos, v:0, t:performance.now(), moved:false };
        coverflow.classList.add("is-dragging");
      });
      coverflow.addEventListener("pointermove", (event) => {
        if (!drag || drag.id !== event.pointerId || !cardWidth) return;
        const pitch = cardWidth * (1 + gap);
        const delta = event.clientX - drag.x;
        if (Math.abs(delta) > 5) drag.moved = true;
        const now = performance.now(), previous = pos;
        pos = drag.pos - delta / pitch;
        drag.v = ((pos - previous) / Math.max(now - drag.t, 1)) * 1000;
        drag.t = now;
        const nextSelected = indexAt(pos);
        if (nextSelected !== selected) updateCaption(nextSelected);
        paint();
      });
      const endDrag = (event) => {
        if (!drag || drag.id !== event.pointerId) return;
        const ended = drag; drag = null; coverflow.classList.remove("is-dragging");
        if (ended.moved) suppressClickUntil = performance.now() + 260;
        settle(Math.round(pos + Math.max(-2, Math.min(2, ended.v * 0.18))));
      };
      coverflow.addEventListener("pointerup", endDrag);
      coverflow.addEventListener("pointercancel", endDrag);
      coverflow.addEventListener("keydown", (event) => { if (event.key === "ArrowLeft") { event.preventDefault(); nudge(-1); } else if (event.key === "ArrowRight") { event.preventDefault(); nudge(1); } });
      prevButton?.addEventListener("click", () => nudge(-1));
      nextButton?.addEventListener("click", () => nudge(1));
    }
  }

  const journeyMeta = {
    "italy-2026": { eyebrow:"Italy / 2026", title:"Italy, in motion.", route:"Milano → Roma → Firenze → Pisa → Cinque Terre", image:"/assets/trips/italy-2026/cinque-terre-cover.jpg", alt:"Cinque Terre village on the Ligurian coast", href:"/travel/italy-2026/" },
    "asia-2025": { eyebrow:"Asia overland / 2025", title:"Asia overland.", route:"Taiwan → Hong Kong → Tibet → Chongqing → Japan", image:"/assets/trips/china-japan/Tibet_landscape_2.jpg", alt:"Mountain landscape in Tibet", href:"/travel/asia-2025/" },
    okinawa: { eyebrow:"Okinawa / Open water", title:"Okinawa blue.", route:"Okinawa → Training → Open water", image:"/assets/trips/diving/Diving_in_okinawa.jpg", alt:"Diving in Okinawa", href:"/travel/okinawa/" },
    "bali-australia": { eyebrow:"Bali · Sydney · Uluru", title:"Southbound.", route:"Bali → Sydney → Uluru", image:"/assets/trips/bali-australia/Sydney.jpg", alt:"Sydney Harbour and Opera House", href:"/travel/bali-australia/" },
    "thailand-vietnam": { eyebrow:"Thailand · Vietnam", title:"Friends & streets.", route:"Thailand → Vietnam → Together", image:"/assets/trips/thailand-vietnam/Thai.jpg", alt:"Thailand travel moment", href:"/travel/thailand-vietnam/" },
  };

  const stopGeo = {
    "Milano":[45.4642,9.19], "Roma":[41.9028,12.4964], "Firenze":[43.7696,11.2558], "Pisa":[43.7228,10.4017], "Cinque Terre":[44.1194,9.7086],
    "Hong Kong":[22.3193,114.1694], "Tibet":[31.7,88.1], "Chongqing":[29.563,106.5516], "Japan":[36.2048,138.2529], "Okinawa":[26.3344,127.8056],
    "Bali":[-8.4095,115.1889], "Sydney":[-33.8688,151.2093], "Uluru":[-25.3444,131.0369], "Thailand":[15.87,100.9925], "Vietnam":[14.0583,108.2772]
  };
  const routeLabels = {
    "italy-2026":["Milano","Roma","Firenze","Pisa","Cinque Terre"],
    "asia-2025":["Taipei","Hong Kong","Tibet","Chongqing","Japan"],
    "bali-australia":["Bali","Sydney","Uluru"],
    "thailand-vietnam":["Thailand","Vietnam"]
  };
  const ROBINSON_X=[1,0.9986,0.9954,0.99,0.9822,0.973,0.96,0.9427,0.9216,0.8962,0.8679,0.835,0.7986,0.7597,0.7186,0.6732,0.6213,0.5722,0.5322];
  const ROBINSON_Y=[0,0.062,0.124,0.186,0.248,0.31,0.372,0.434,0.4958,0.5571,0.6176,0.6769,0.7346,0.7903,0.8435,0.8936,0.9394,0.9761,1];
  const projectRobinson = (lat, lon) => {
    const a = Math.min(90, Math.abs(lat));
    const band = Math.min(17, Math.floor(a / 5));
    const t = (a - band * 5) / 5;
    const xc = ROBINSON_X[band] + (ROBINSON_X[band + 1] - ROBINSON_X[band]) * t;
    const yc = ROBINSON_Y[band] + (ROBINSON_Y[band + 1] - ROBINSON_Y[band]) * t;
    const deltaLon = ((((lon - 11.25) + 180) % 360) + 360) % 360 - 180;
    const xRaw = 0.8487 * (deltaLon * Math.PI / 180) * xc;
    const yRaw = 1.3523 * yc * Math.sign(lat || 1) * 0.95623;
    const xMax = 0.8487 * Math.PI, yMax = 1.3523 * 0.95623;
    return { x:((xRaw + xMax) / (2 * xMax)) * 100, y:((yMax - yRaw) / (2 * yMax)) * 100 };
  };

  const atlasStops = [...doc.querySelectorAll("[data-atlas-stop]")];
  const atlasLines = [...doc.querySelectorAll("[data-atlas-route-line]")];
  const atlasBase = doc.querySelector(".atlas-map__canvas .atlas-base");
  const taipei = projectRobinson(25.033,121.5654);
  if (atlasBase) { atlasBase.style.setProperty("--x", `${taipei.x}%`); atlasBase.style.setProperty("--y", `${taipei.y}%`); }
  atlasStops.forEach((stop) => {
    const geo = stopGeo[stop.dataset.label];
    if (!geo) return;
    const p = projectRobinson(geo[0],geo[1]);
    stop.style.setProperty("--x", `${p.x}%`);
    stop.style.setProperty("--y", `${p.y}%`);
  });
  atlasLines.forEach((line) => {
    const labels = routeLabels[line.dataset.atlasRouteLine] || [];
    const points = labels.map((label) => label === "Taipei" ? taipei : (() => { const g=stopGeo[label]; return g ? projectRobinson(g[0],g[1]) : null; })()).filter(Boolean);
    line.setAttribute("points", points.map((p) => `${p.x.toFixed(3)},${p.y.toFixed(3)}`).join(" "));
  });

  const atlasImage = doc.querySelector("[data-atlas-image]");
  const atlasEyebrow = doc.querySelector("[data-atlas-eyebrow]");
  const atlasTitle = doc.querySelector("[data-atlas-title]");
  const atlasRoute = doc.querySelector("[data-atlas-route]");
  const atlasLink = doc.querySelector("[data-atlas-link]");
  const activateAtlasStop = (stop) => {
    if (!stop) return;
    const journeyId = stop.dataset.journey;
    const meta = journeyMeta[journeyId];
    if (!meta) return;
    atlasStops.forEach((item) => {
      const selected = item === stop;
      item.classList.toggle("is-selected", selected);
      item.classList.toggle("is-route-active", item.dataset.journey === journeyId);
      item.setAttribute("aria-pressed", String(selected));
    });
    atlasLines.forEach((line) => line.classList.toggle("is-active", line.dataset.atlasRouteLine === journeyId));
    if (atlasImage) { atlasImage.src = meta.image; atlasImage.alt = meta.alt; }
    if (atlasEyebrow) atlasEyebrow.textContent = `${meta.eyebrow} · ${stop.dataset.label || ""}`;
    if (atlasTitle) atlasTitle.textContent = meta.title;
    if (atlasRoute) atlasRoute.textContent = meta.route;
    if (atlasLink) atlasLink.href = meta.href;
  };
  atlasStops.forEach((stop) => { stop.addEventListener("click", () => activateAtlasStop(stop)); stop.addEventListener("mouseenter", () => activateAtlasStop(stop)); stop.addEventListener("focus", () => activateAtlasStop(stop)); });
  if (atlasStops.length) activateAtlasStop(atlasStops[0]);
})();
