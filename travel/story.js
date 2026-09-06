(() => {
  "use strict";

  document.addEventListener("gesturestart", (event) => event.preventDefault(), { passive: false });

  const root = "../../";
  const slug = document.body.dataset.journey;
  const journeys = window.JOURNEYS || [];
  const journey = journeys.find((item) => item.slug === slug);
  const media = window.JOURNEY_MEDIA?.[slug] || [];
  if (!journey) return;

  const mediaVersion = "20260828-primary-media";
  // Preserve the HDR originals; serve tone-mapped 8-bit copies in the web player.
  const mobileVideoCopies = new Set([
    "2025-07-22_20-47-38_video_002403.mp4",
    "2024-11-26_01-29-48_video_002235.mp4"
  ]);
  const absolute = (path) => root + path.replace(/^\.\//, "");
  const assetBase = `${root}assets/archive/${slug}/`;
  const assetUrl = (filename) => `${assetBase}${filename}?v=${mediaVersion}`;
  const formatDate = (filename) => {
    const match = filename.match(/^(\d{4})-(\d{2})-(\d{2})_(\d{2})-(\d{2})/);
    if (!match) return journey.dates;
    const date = new Date(`${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:00`);
    return new Intl.DateTimeFormat("en", { month: "short", day: "2-digit", year: "numeric" }).format(date);
  };

  document.title = `${journey.title} — Hank`;
  document.querySelector('[name="description"]')?.setAttribute("content", `${journey.title}: ${journey.note}`);
  document.querySelector('[property="og:title"]')?.setAttribute("content", `${journey.title} — Hank`);
  document.querySelector('[property="og:description"]')?.setAttribute("content", journey.note);
  document.querySelector('[property="og:image"]')?.setAttribute("content", `https://hank187548.github.io/assets/archive/${slug}/cover.webp?v=${mediaVersion}`);

  const hero = document.querySelector("[data-story-hero]");
  if (hero) hero.style.backgroundImage = `url("${absolute(journey.cover)}")`;
  document.querySelectorAll("[data-title]").forEach((node) => { node.textContent = journey.title; });
  document.querySelectorAll("[data-dates]").forEach((node) => { node.textContent = journey.dates; });
  document.querySelectorAll("[data-route]").forEach((node) => { node.textContent = journey.route; });
  document.querySelectorAll("[data-note]").forEach((node) => { node.textContent = journey.note; });
  document.querySelector("[data-folder]").textContent = journey.sourceFolder;
  document.querySelector("[data-count]").textContent = `${String(media.length).padStart(2, "0")} selected frames`;

  const gallery = document.querySelector("[data-gallery]");
  media.forEach((filename, index) => {
    const isVideo = filename.endsWith(".mp4");
    const figure = document.createElement("figure");
    figure.className = `media-item media-item--${index % 7 === 0 || index % 7 === 4 ? "wide" : index % 5 === 0 ? "tall" : "standard"}`;
    const caption = `<figcaption><span>${formatDate(filename)}</span><span>${String(index + 1).padStart(2, "0")} / ${String(media.length).padStart(2, "0")}</span></figcaption>`;
    if (isVideo) {
      const poster = filename.replace(/\.mp4$/, "-poster.webp");
      const playbackFile = mobileVideoCopies.has(filename) ? filename.replace(/\.mp4$/, "-web.mp4") : filename;
      figure.classList.add("media-item--video");
      figure.innerHTML = `<video controls playsinline preload="metadata" poster="${assetUrl(poster)}" aria-label="${journey.title}, ${formatDate(filename)}"><source src="${assetUrl(playbackFile)}" type="video/mp4" /></video>${caption}`;
    } else {
      figure.innerHTML = `<button type="button" class="photo-button" data-photo data-index="${index}" aria-label="Open photo ${index + 1}"><img src="${assetUrl(filename)}" alt="${journey.title}, ${formatDate(filename)}" loading="lazy" decoding="async" /></button>${caption}`;
    }
    gallery?.append(figure);
  });

  const index = journeys.indexOf(journey);
  const previous = journeys[(index - 1 + journeys.length) % journeys.length];
  const next = journeys[(index + 1) % journeys.length];
  const setJourneyLink = (selector, item) => {
    const link = document.querySelector(selector);
    if (!link) return;
    link.href = `../${item.slug}/`;
    link.querySelector("strong").textContent = item.title;
  };
  setJourneyLink("[data-previous-journey]", previous);
  setJourneyLink("[data-next-journey]", next);

  const photos = media.filter((filename) => !filename.endsWith(".mp4"));
  const lightbox = document.querySelector("[data-lightbox]");
  const lightboxImage = document.querySelector("[data-lightbox-image]");
  const lightboxMeta = document.querySelector("[data-lightbox-meta]");
  let activePhoto = 0;
  let photoDrag = null;
  let photoAnimation = null;
  let returnFocus = null;
  let ignoreBackdropClick = false;
  const resetPhotoDrag = () => {
    photoDrag = null;
    lightboxImage.style.transform = "";
    lightboxImage.classList.remove("is-dragging");
  };
  const showPhoto = (photoIndex, direction = 0) => {
    if (!photos.length) return;
    photoAnimation?.cancel();
    resetPhotoDrag();
    activePhoto = ((photoIndex % photos.length) + photos.length) % photos.length;
    lightboxImage.src = assetUrl(photos[activePhoto]);
    lightboxImage.alt = `${journey.title}, ${formatDate(photos[activePhoto])}`;
    lightboxMeta.textContent = `${formatDate(photos[activePhoto])} · ${activePhoto + 1} / ${photos.length}`;
    if (direction && lightboxImage.animate) {
      photoAnimation = lightboxImage.animate([
        { opacity: .35, transform: `translateX(${direction * 36}px)` },
        { opacity: 1, transform: "translateX(0)" }
      ], { duration: 240, easing: "ease-out" });
    }
  };
  const openLightbox = (filename) => {
    const photoIndex = photos.indexOf(filename);
    if (photoIndex < 0) return;
    returnFocus = document.activeElement;
    showPhoto(photoIndex);
    lightbox.hidden = false;
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");
    lightbox.querySelector("[data-lightbox-close]")?.focus();
  };
  const closeLightbox = () => {
    photoAnimation?.cancel();
    resetPhotoDrag();
    lightbox.hidden = true;
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-open");
    returnFocus?.focus({ preventScroll: true });
  };
  gallery?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-photo]");
    if (!button) return;
    openLightbox(media[Number(button.dataset.index)]);
  });
  lightbox?.querySelector("[data-lightbox-close]")?.addEventListener("click", closeLightbox);
  lightbox?.querySelector("[data-lightbox-previous]")?.addEventListener("click", () => showPhoto(activePhoto - 1, -1));
  lightbox?.querySelector("[data-lightbox-next]")?.addEventListener("click", () => showPhoto(activePhoto + 1, 1));
  lightbox?.addEventListener("click", (event) => {
    if (ignoreBackdropClick) { ignoreBackdropClick = false; return; }
    if (event.target === lightbox) closeLightbox();
  });
  lightboxImage.draggable = false;
  lightboxImage.addEventListener("dragstart", (event) => event.preventDefault());
  lightboxImage.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || event.isPrimary === false || photoDrag) return;
    ignoreBackdropClick = false;
    photoAnimation?.cancel();
    photoDrag = { id: event.pointerId, x: event.clientX, y: event.clientY, moved: false };
  });
  lightboxImage.addEventListener("pointermove", (event) => {
    if (!photoDrag || photoDrag.id !== event.pointerId) return;
    const dx = event.clientX - photoDrag.x;
    const dy = event.clientY - photoDrag.y;
    if (!photoDrag.moved) {
      if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) { resetPhotoDrag(); return; }
      if (Math.abs(dx) <= 10) return;
      photoDrag.moved = true;
      lightboxImage.setPointerCapture(event.pointerId);
      lightboxImage.classList.add("is-dragging");
    }
    event.preventDefault();
    lightboxImage.style.transform = `translateX(${Math.max(-100, Math.min(100, dx * .65))}px)`;
  });
  const finishPhotoDrag = (event) => {
    if (!photoDrag || photoDrag.id !== event.pointerId) return;
    const delta = event.clientX - photoDrag.x;
    const moved = photoDrag.moved;
    resetPhotoDrag();
    if (lightboxImage.hasPointerCapture(event.pointerId)) lightboxImage.releasePointerCapture(event.pointerId);
    if (!moved) return;
    event.preventDefault();
    ignoreBackdropClick = true;
    if (event.type === "pointerup" && Math.abs(delta) >= 35) {
      const direction = delta < 0 ? 1 : -1;
      showPhoto(activePhoto + direction, direction);
    }
  };
  lightboxImage.addEventListener("pointerup", finishPhotoDrag);
  lightboxImage.addEventListener("pointercancel", finishPhotoDrag);
  lightboxImage.addEventListener("lostpointercapture", finishPhotoDrag);
  document.addEventListener("keydown", (event) => {
    if (lightbox?.hidden) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      const direction = event.key === "ArrowRight" ? 1 : -1;
      showPhoto(activePhoto + direction, direction);
    }
    if (event.key === "Tab") {
      const controls = [...lightbox.querySelectorAll("button")];
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
})();
