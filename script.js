const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");

const siteHeader = document.querySelector("[data-site-header]");
const scrollProgress = document.querySelector("[data-scroll-progress]");
const hero = document.querySelector("[data-hero]");
const navLinks = Array.from(document.querySelectorAll("[data-nav-link]"));
const currentYear = document.querySelector("[data-current-year]");

if (currentYear) {
  currentYear.textContent = String(new Date().getFullYear());
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function prefersReducedMotion() {
  return motionQuery.matches;
}

function getHeaderOffset() {
  const nav = siteHeader?.querySelector(".top-nav");
  return (nav?.getBoundingClientRect().height || 64) + 28;
}

function scrollToElement(target, behavior = prefersReducedMotion() ? "auto" : "smooth") {
  if (!target) return;

  const top = window.scrollY + target.getBoundingClientRect().top - getHeaderOffset();
  window.scrollTo({ top: Math.max(0, top), behavior });
}

function setActiveNavigation() {
  if (!navLinks.length) return;

  const marker = window.scrollY + window.innerHeight * 0.42;
  const sectionLinks = navLinks
    .map((link) => {
      const hash = link.getAttribute("href");
      const section = hash ? document.querySelector(hash) : null;
      return section ? { link, section } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.section.offsetTop - b.section.offsetTop);

  let activeId = "";

  sectionLinks.forEach(({ section }) => {
    if (marker >= section.offsetTop) {
      activeId = section.id;
    }
  });

  if (hero && marker < hero.offsetHeight * 0.82) {
    activeId = "";
  }

  navLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${activeId}`;
    link.classList.toggle("is-active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

let scrollFrame = 0;

function updateScrollUI() {
  scrollFrame = 0;

  const scrollTop = Math.max(0, window.scrollY);
  const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const progress = clamp(scrollTop / scrollable, 0, 1);

  if (scrollProgress) {
    scrollProgress.style.transform = `scaleX(${progress})`;
  }

  siteHeader?.classList.toggle("is-scrolled", scrollTop > 26);
  setActiveNavigation();
}

function requestScrollUI() {
  if (scrollFrame) return;
  scrollFrame = window.requestAnimationFrame(updateScrollUI);
}

window.addEventListener("scroll", requestScrollUI, { passive: true });
window.addEventListener("resize", requestScrollUI, { passive: true });
updateScrollUI();

const heroSlides = Array.from(document.querySelectorAll("[data-hero-slide]"));
const heroControls = Array.from(document.querySelectorAll("[data-hero-control]"));
let activeHeroIndex = 0;
let heroTimer = 0;
let heroIsVisible = true;
let heroIsPaused = false;
const heroInterval = 5600;

function setHeroSlide(index, userInitiated = false) {
  if (!heroSlides.length) return;

  activeHeroIndex = (index + heroSlides.length) % heroSlides.length;

  heroSlides.forEach((slide, slideIndex) => {
    slide.classList.toggle("is-active", slideIndex === activeHeroIndex);
  });

  heroControls.forEach((control, controlIndex) => {
    const isActive = controlIndex === activeHeroIndex;
    control.classList.toggle("is-active", isActive);
    control.setAttribute("aria-pressed", isActive ? "true" : "false");
  });

  if (userInitiated) {
    restartHeroTimer();
  }
}

function stopHeroTimer() {
  if (!heroTimer) return;
  window.clearInterval(heroTimer);
  heroTimer = 0;
}

function startHeroTimer() {
  stopHeroTimer();

  if (
    heroSlides.length < 2 ||
    prefersReducedMotion() ||
    document.hidden ||
    !heroIsVisible ||
    heroIsPaused
  ) {
    return;
  }

  heroTimer = window.setInterval(() => {
    setHeroSlide(activeHeroIndex + 1);
  }, heroInterval);
}

function restartHeroTimer() {
  stopHeroTimer();
  startHeroTimer();
}

heroControls.forEach((control) => {
  control.addEventListener("click", () => {
    const index = Number.parseInt(control.dataset.heroControl || "0", 10);
    setHeroSlide(Number.isNaN(index) ? 0 : index, true);
  });
});

if (hero) {
  hero.addEventListener("mouseenter", () => {
    if (!finePointerQuery.matches) return;
    heroIsPaused = true;
    stopHeroTimer();
  });

  hero.addEventListener("mouseleave", () => {
    heroIsPaused = false;
    startHeroTimer();
  });

  if ("IntersectionObserver" in window) {
    const heroObserver = new IntersectionObserver(
      ([entry]) => {
        heroIsVisible = Boolean(entry?.isIntersecting);
        if (heroIsVisible) {
          startHeroTimer();
        } else {
          stopHeroTimer();
        }
      },
      { threshold: 0.08 }
    );
    heroObserver.observe(hero);
  }

  window.requestAnimationFrame(() => {
    hero.classList.add("is-ready");
    hero.querySelectorAll(".reveal-item").forEach((item, index) => {
      item.style.setProperty("--reveal-delay", `${120 + index * 80}ms`);
      item.classList.add("is-visible");
    });
  });
}

setHeroSlide(0);
startHeroTimer();

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stopHeroTimer();
  } else {
    startHeroTimer();
  }
});

function syncMotionPreference() {
  if (prefersReducedMotion()) {
    stopHeroTimer();
    document.querySelectorAll(".reveal-item").forEach((item) => item.classList.add("is-visible"));
  } else {
    startHeroTimer();
  }
}

if (typeof motionQuery.addEventListener === "function") {
  motionQuery.addEventListener("change", syncMotionPreference);
} else if (typeof motionQuery.addListener === "function") {
  motionQuery.addListener(syncMotionPreference);
}

const revealItems = Array.from(document.querySelectorAll(".reveal-item")).filter(
  (item) => !item.closest(".hero")
);

revealItems.forEach((item, index) => {
  item.style.setProperty("--reveal-delay", `${Math.min(index % 4, 3) * 55}ms`);
});

if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.08,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

function loadStoryMedia(story) {
  if (!story || story.dataset.mediaLoaded === "true") return;

  story.querySelectorAll("video[data-poster]").forEach((video) => {
    const poster = video.dataset.poster;
    if (poster) {
      video.poster = poster;
    }
  });

  story.querySelectorAll("source[data-src]").forEach((source) => {
    const sourceUrl = source.dataset.src;
    if (sourceUrl && !source.src) {
      source.src = sourceUrl;
    }
  });

  story.querySelectorAll("video").forEach((video) => {
    if (video.querySelector("source[src]")) {
      video.load();
    }
  });

  story.dataset.mediaLoaded = "true";
}

function setStoryState(story) {
  const summary = story.querySelector(":scope > summary");
  if (!summary) return;
  summary.setAttribute("aria-expanded", story.open ? "true" : "false");
}

function animateStoryOpen(story) {
  const summary = story.querySelector(":scope > summary");
  if (!summary || story.dataset.animating === "true") return;

  story.dataset.animating = "true";
  story.style.overflow = "hidden";

  const startHeight = summary.getBoundingClientRect().height;
  story.open = true;
  loadStoryMedia(story);
  setStoryState(story);

  const endHeight = story.scrollHeight;
  story.style.height = `${startHeight}px`;

  const animation = story.animate(
    [{ height: `${startHeight}px` }, { height: `${endHeight}px` }],
    {
      duration: prefersReducedMotion() ? 1 : 620,
      easing: "cubic-bezier(0.16, 1, 0.3, 1)",
    }
  );

  animation.onfinish = () => {
    story.style.height = "";
    story.style.overflow = "";
    delete story.dataset.animating;
  };

  animation.oncancel = animation.onfinish;
}

function animateStoryClose(story) {
  const summary = story.querySelector(":scope > summary");
  if (!summary || story.dataset.animating === "true") return;

  story.dataset.animating = "true";
  story.style.overflow = "hidden";

  const startHeight = story.getBoundingClientRect().height;
  const endHeight = summary.getBoundingClientRect().height;
  story.style.height = `${startHeight}px`;

  const animation = story.animate(
    [{ height: `${startHeight}px` }, { height: `${endHeight}px` }],
    {
      duration: prefersReducedMotion() ? 1 : 480,
      easing: "cubic-bezier(0.16, 1, 0.3, 1)",
    }
  );

  animation.onfinish = () => {
    story.open = false;
    story.style.height = "";
    story.style.overflow = "";
    delete story.dataset.animating;
    setStoryState(story);
  };

  animation.oncancel = animation.onfinish;
}

function openStoryInstant(story) {
  if (!story) return;
  story.open = true;
  loadStoryMedia(story);
  setStoryState(story);
}

const stories = Array.from(document.querySelectorAll("details.story-card"));

stories.forEach((story) => {
  const summary = story.querySelector(":scope > summary");
  if (!summary) return;

  setStoryState(story);

  summary.addEventListener("click", (event) => {
    event.preventDefault();

    if (story.open) {
      animateStoryClose(story);
    } else {
      animateStoryOpen(story);
    }
  });

  story.addEventListener("toggle", () => {
    setStoryState(story);
    if (story.open) {
      loadStoryMedia(story);
    }
  });

  if (story.open) {
    loadStoryMedia(story);
  }
});

function resolveHashTarget(hash) {
  if (!hash || hash === "#") return null;

  let id = hash.slice(1);
  try {
    id = decodeURIComponent(id);
  } catch {
    return null;
  }

  return document.getElementById(id);
}

function navigateToHash(hash, updateHistory = true, instant = false) {
  const target = resolveHashTarget(hash);
  if (!target) return;

  if (target.matches("details.story-card")) {
    openStoryInstant(target);
  }

  if (updateHistory && window.location.hash !== hash) {
    window.history.pushState(null, "", hash);
  }

  window.requestAnimationFrame(() => {
    scrollToElement(target, instant ? "auto" : prefersReducedMotion() ? "auto" : "smooth");
  });
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const hash = link.getAttribute("href");
    if (!hash || hash === "#") return;

    const target = resolveHashTarget(hash);
    if (!target) return;

    event.preventDefault();
    navigateToHash(hash, true, false);
  });
});

window.addEventListener("popstate", () => {
  if (window.location.hash) {
    navigateToHash(window.location.hash, false, false);
  }
});

if (window.location.hash) {
  window.addEventListener(
    "load",
    () => navigateToHash(window.location.hash, false, true),
    { once: true }
  );
}

function installPointerEffects() {
  if (!finePointerQuery.matches || prefersReducedMotion()) return;

  document.querySelectorAll(".interactive-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty("--pointer-x", `${x}%`);
      card.style.setProperty("--pointer-y", `${y}%`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--pointer-x", "50%");
      card.style.setProperty("--pointer-y", "50%");
    });
  });

  document.querySelectorAll(".magnetic").forEach((element) => {
    element.addEventListener("pointermove", (event) => {
      const rect = element.getBoundingClientRect();
      const x = clamp((event.clientX - (rect.left + rect.width / 2)) * 0.16, -10, 10);
      const y = clamp((event.clientY - (rect.top + rect.height / 2)) * 0.16, -10, 10);
      element.style.setProperty("--magnetic-x", `${x}px`);
      element.style.setProperty("--magnetic-y", `${y}px`);
    });

    element.addEventListener("pointerleave", () => {
      element.style.setProperty("--magnetic-x", "0px");
      element.style.setProperty("--magnetic-y", "0px");
    });
  });
}

installPointerEffects();

const lightbox = document.querySelector("[data-lightbox-dialog]");
const lightboxContent = lightbox?.querySelector("[data-lightbox-content]");
const lightboxCaption = lightbox?.querySelector("[data-lightbox-caption]");
const lightboxCount = lightbox?.querySelector("[data-lightbox-count]");
const lightboxCloseButton = lightbox?.querySelector(".lightbox-close");
let lightboxItems = [];
let lightboxIndex = 0;
let lightboxLastFocus = null;
let touchStartX = 0;
let touchStartY = 0;

function getLightboxItems(trigger) {
  const story = trigger.closest("details.story-card");
  const scope = story || document;
  return Array.from(scope.querySelectorAll("[data-lightbox]"));
}

function getMediaSource(item) {
  const image = item.querySelector("img");
  if (image) {
    return {
      type: "image",
      src: image.currentSrc || image.src,
      alt: image.alt || "",
    };
  }

  const video = item.querySelector("video");
  const source = video?.querySelector("source");
  const src = source?.getAttribute("src") || source?.dataset.src || "";
  const poster = video?.getAttribute("poster") || video?.dataset.poster || "";

  if (video && src) {
    return {
      type: "video",
      src,
      poster,
      label: video.getAttribute("aria-label") || "Video",
    };
  }

  return null;
}

function renderLightbox() {
  if (!lightboxContent || !lightboxItems.length) return;

  const item = lightboxItems[lightboxIndex];
  loadStoryMedia(item.closest("details.story-card"));
  const media = getMediaSource(item);
  if (!media) return;

  lightboxContent.replaceChildren();

  if (media.type === "image") {
    const image = document.createElement("img");
    image.src = media.src;
    image.alt = media.alt;
    image.decoding = "async";
    lightboxContent.append(image);
  } else {
    const video = document.createElement("video");
    video.src = media.src;
    video.controls = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.setAttribute("aria-label", media.label);
    if (media.poster) video.poster = media.poster;
    lightboxContent.append(video);
  }

  const caption = item.querySelector("figcaption")?.textContent?.trim() || "Media";
  if (lightboxCaption) lightboxCaption.textContent = caption;
  if (lightboxCount) lightboxCount.textContent = `${lightboxIndex + 1} / ${lightboxItems.length}`;
}

function animateLightboxIn() {
  if (!lightbox || prefersReducedMotion()) return;
  lightbox.animate([{ opacity: 0 }, { opacity: 1 }], {
    duration: 260,
    easing: "ease-out",
  });

  lightbox.querySelector(".lightbox-shell")?.animate(
    [
      { opacity: 0, transform: "translateY(14px) scale(0.985)" },
      { opacity: 1, transform: "translateY(0) scale(1)" },
    ],
    { duration: 420, easing: "cubic-bezier(0.16, 1, 0.3, 1)" }
  );
}

function openLightbox(trigger) {
  if (!lightbox || !lightboxContent) return;

  lightboxItems = getLightboxItems(trigger);
  lightboxIndex = Math.max(0, lightboxItems.indexOf(trigger));
  lightboxLastFocus = document.activeElement;

  lightbox.hidden = false;
  document.body.classList.add("is-locked");
  renderLightbox();
  animateLightboxIn();
  lightboxCloseButton?.focus({ preventScroll: true });
}

function closeLightbox() {
  if (!lightbox || lightbox.hidden) return;

  const finish = () => {
    lightbox.hidden = true;
    lightboxContent?.replaceChildren();
    document.body.classList.remove("is-locked");
    if (lightboxLastFocus instanceof HTMLElement) {
      lightboxLastFocus.focus({ preventScroll: true });
    }
  };

  if (prefersReducedMotion()) {
    finish();
    return;
  }

  const animation = lightbox.animate([{ opacity: 1 }, { opacity: 0 }], {
    duration: 180,
    easing: "ease-in",
  });
  animation.onfinish = finish;
  animation.oncancel = finish;
}

function moveLightbox(direction) {
  if (!lightboxItems.length) return;
  lightboxIndex = (lightboxIndex + direction + lightboxItems.length) % lightboxItems.length;
  renderLightbox();

  if (!prefersReducedMotion()) {
    lightboxContent?.animate(
      [
        { opacity: 0.35, transform: `translateX(${direction > 0 ? "18px" : "-18px"})` },
        { opacity: 1, transform: "translateX(0)" },
      ],
      { duration: 300, easing: "cubic-bezier(0.16, 1, 0.3, 1)" }
    );
  }
}

document.querySelectorAll("[data-lightbox]").forEach((item) => {
  item.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("video")) return;
    openLightbox(item);
  });

  item.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openLightbox(item);
    }
  });
});

lightbox?.querySelectorAll("[data-lightbox-close]").forEach((control) => {
  control.addEventListener("click", closeLightbox);
});

lightbox?.querySelector("[data-lightbox-prev]")?.addEventListener("click", () => moveLightbox(-1));
lightbox?.querySelector("[data-lightbox-next]")?.addEventListener("click", () => moveLightbox(1));

lightbox?.addEventListener("pointerdown", (event) => {
  if (event.pointerType === "mouse") return;
  touchStartX = event.clientX;
  touchStartY = event.clientY;
});

lightbox?.addEventListener("pointerup", (event) => {
  if (event.pointerType === "mouse") return;

  const deltaX = event.clientX - touchStartX;
  const deltaY = event.clientY - touchStartY;
  if (Math.abs(deltaX) > 60 && Math.abs(deltaX) > Math.abs(deltaY) * 1.4) {
    moveLightbox(deltaX < 0 ? 1 : -1);
  }
});

function trapLightboxFocus(event) {
  if (!lightbox || lightbox.hidden || event.key !== "Tab") return;

  const focusable = Array.from(
    lightbox.querySelectorAll('button:not([disabled]), video[controls], [href], [tabindex]:not([tabindex="-1"])')
  ).filter((element) => !element.hasAttribute("hidden"));

  if (!focusable.length) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

document.addEventListener("keydown", (event) => {
  if (!lightbox || lightbox.hidden) return;

  if (event.key === "Escape") {
    event.preventDefault();
    closeLightbox();
  } else if (event.key === "ArrowLeft") {
    event.preventDefault();
    moveLightbox(-1);
  } else if (event.key === "ArrowRight") {
    event.preventDefault();
    moveLightbox(1);
  } else {
    trapLightboxFocus(event);
  }
});
