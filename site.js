(() => {
  "use strict";

  const doc = document;
  const body = doc.body;
  const header = doc.querySelector("[data-header]");
  const progress = doc.querySelector("[data-scroll-progress]");
  const menuButton = doc.querySelector("[data-menu-toggle]");
  const mobileMenu = doc.querySelector("[data-mobile-menu]");

  const setMenu = (open) => {
    if (!menuButton || !mobileMenu) return;
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.textContent = open ? "Close" : "Menu";
    mobileMenu.classList.toggle("is-open", open);
    mobileMenu.setAttribute("aria-hidden", String(!open));
    body.classList.toggle("menu-open", open);
  };

  menuButton?.addEventListener("click", () => {
    setMenu(menuButton.getAttribute("aria-expanded") !== "true");
  });

  mobileMenu?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });

  doc.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenu(false);
  });

  let frame = 0;
  const updateScrollUi = () => {
    frame = 0;
    const y = window.scrollY || doc.documentElement.scrollTop;
    header?.classList.toggle("is-compact", y > 32);
    if (progress) {
      const max = doc.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
      progress.style.transform = `scaleX(${ratio})`;
    }
  };

  window.addEventListener("scroll", () => {
    if (!frame) frame = window.requestAnimationFrame(updateScrollUi);
  }, { passive: true });
  updateScrollUi();

  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const slides = [...doc.querySelectorAll("[data-hero-slide]")];
  const dots = [...doc.querySelectorAll("[data-hero-dot]")];
  const current = doc.querySelector("[data-hero-current]");
  const label = doc.querySelector("[data-hero-label]");
  let activeSlide = 0;
  let heroTimer = 0;

  const showSlide = (index, restart = true) => {
    if (!slides.length) return;
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => slide.classList.toggle("is-active", slideIndex === activeSlide));
    dots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === activeSlide;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-pressed", String(isActive));
    });
    if (current) current.textContent = String(activeSlide + 1).padStart(2, "0");
    if (label) label.textContent = slides[activeSlide].dataset.label || "";
    if (restart && !reduceMotion) startHeroTimer();
  };

  const startHeroTimer = () => {
    window.clearInterval(heroTimer);
    heroTimer = window.setInterval(() => showSlide(activeSlide + 1, false), 6500);
  };

  dots.forEach((dot, index) => dot.addEventListener("click", () => showSlide(index)));
  if (!reduceMotion && slides.length > 1) startHeroTimer();

  const atlasStops = [...doc.querySelectorAll("[data-atlas-stop]")];
  const atlasImage = doc.querySelector("[data-atlas-image]");
  const atlasEyebrow = doc.querySelector("[data-atlas-eyebrow]");
  const atlasTitle = doc.querySelector("[data-atlas-title]");
  const atlasRoute = doc.querySelector("[data-atlas-route]");
  const atlasLink = doc.querySelector("[data-atlas-link]");

  const activateStop = (stop) => {
    if (!stop) return;
    atlasStops.forEach((item) => {
      const active = item === stop;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    if (atlasImage) {
      atlasImage.src = stop.dataset.image || atlasImage.src;
      atlasImage.alt = stop.dataset.alt || "Journey image";
    }
    if (atlasEyebrow) atlasEyebrow.textContent = stop.dataset.eyebrow || "";
    if (atlasTitle) atlasTitle.textContent = stop.dataset.title || "";
    if (atlasRoute) atlasRoute.textContent = stop.dataset.route || "";
    if (atlasLink) atlasLink.href = stop.dataset.href || "#journeys";
  };

  atlasStops.forEach((stop) => {
    stop.addEventListener("click", () => activateStop(stop));
    stop.addEventListener("mouseenter", () => activateStop(stop));
    stop.addEventListener("focus", () => activateStop(stop));
  });
})();
