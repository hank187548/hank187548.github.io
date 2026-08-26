(() => {
  "use strict";

  const root = "../../";
  const slug = document.body.dataset.journey;
  const journeys = window.JOURNEYS || [];
  const journey = journeys.find((item) => item.slug === slug);
  const media = window.JOURNEY_MEDIA?.[slug] || [];
  if (!journey) return;

  const absolute = (path) => root + path.replace(/^\.\//, "");
  const assetBase = `${root}assets/archive/${slug}/`;
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
  document.querySelector('[property="og:image"]')?.setAttribute("content", `https://hank187548.github.io/assets/archive/${slug}/cover.webp`);

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
      figure.classList.add("media-item--video");
      figure.innerHTML = `<video controls playsinline preload="metadata" poster="${assetBase}${poster}" aria-label="${journey.title}, ${formatDate(filename)}"><source src="${assetBase}${filename}" type="video/mp4" /></video>${caption}`;
    } else {
      figure.innerHTML = `<button type="button" class="photo-button" data-photo data-index="${index}" aria-label="Open photo ${index + 1}"><img src="${assetBase}${filename}" alt="${journey.title}, ${formatDate(filename)}" loading="lazy" decoding="async" /></button>${caption}`;
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
  const showPhoto = (photoIndex) => {
    activePhoto = (photoIndex + photos.length) % photos.length;
    lightboxImage.src = assetBase + photos[activePhoto];
    lightboxImage.alt = `${journey.title}, ${formatDate(photos[activePhoto])}`;
    lightboxMeta.textContent = `${formatDate(photos[activePhoto])} · ${activePhoto + 1} / ${photos.length}`;
  };
  const openLightbox = (filename) => {
    const photoIndex = photos.indexOf(filename);
    if (photoIndex < 0) return;
    showPhoto(photoIndex);
    lightbox.hidden = false;
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");
    lightbox.querySelector("[data-lightbox-close]")?.focus();
  };
  const closeLightbox = () => {
    lightbox.hidden = true;
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-open");
  };
  gallery?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-photo]");
    if (!button) return;
    openLightbox(media[Number(button.dataset.index)]);
  });
  lightbox?.querySelector("[data-lightbox-close]")?.addEventListener("click", closeLightbox);
  lightbox?.querySelector("[data-lightbox-previous]")?.addEventListener("click", () => showPhoto(activePhoto - 1));
  lightbox?.querySelector("[data-lightbox-next]")?.addEventListener("click", () => showPhoto(activePhoto + 1));
  lightbox?.addEventListener("click", (event) => { if (event.target === lightbox) closeLightbox(); });
  document.addEventListener("keydown", (event) => {
    if (lightbox?.hidden) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") showPhoto(activePhoto - 1);
    if (event.key === "ArrowRight") showPhoto(activePhoto + 1);
  });
})();
