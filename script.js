const LIQUID_GLASS_VERSION = "20260803-1";

function installLiquidGlassStyles() {
  document.documentElement.classList.add("liquid-glass-enabled");

  const existing = document.querySelector(
    'link[data-liquid-glass], link[href*="liquid-glass.css"]'
  );
  if (existing) {
    existing.dataset.liquidGlass = LIQUID_GLASS_VERSION;
    return;
  }

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = new URL(
    `./liquid-glass.css?v=${LIQUID_GLASS_VERSION}`,
    document.baseURI
  ).href;
  link.dataset.liquidGlass = LIQUID_GLASS_VERSION;
  document.head.append(link);
}

installLiquidGlassStyles();

const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");

const revealItems = document.querySelectorAll(
  ".hero-copy, .section-heading, .chapter-card, .theme-card, .project-card, .work-meta-grid article, .contact-panel"
);

revealItems.forEach((item, index) => {
  item.classList.add("reveal");
  item.style.setProperty("--reveal-delay", `${Math.min(index % 6, 5) * 55}ms`);
});

if (motionQuery.matches) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      rootMargin: "0px 0px -8% 0px",
      threshold: 0.04,
    }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const hero = document.querySelector(".journey-hero");
const heroSlides = document.querySelectorAll("[data-hero-slide]");
const heroTones = ["cool", "warm", "cool", "warm"];
const heroIntervalMs = 5200;
let activeHeroSlide = 0;
let heroTimer;
let heroIsVisible = true;

function setHeroSlide(index) {
  if (!heroSlides.length) return;

  activeHeroSlide = (index + heroSlides.length) % heroSlides.length;

  heroSlides.forEach((slide, slideIndex) => {
    slide.classList.toggle("is-active", slideIndex === activeHeroSlide);
  });

  if (hero) {
    hero.dataset.heroTone = heroTones[activeHeroSlide] || "cool";
  }
}

function stopHeroTimer() {
  if (!heroTimer) return;
  window.clearInterval(heroTimer);
  heroTimer = undefined;
}

function startHeroTimer() {
  if (
    heroSlides.length < 2 ||
    document.hidden ||
    motionQuery.matches ||
    !heroIsVisible
  ) {
    return;
  }

  stopHeroTimer();
  heroTimer = window.setInterval(() => {
    setHeroSlide(activeHeroSlide + 1);
  }, heroIntervalMs);
}

function syncHeroMotionPreference() {
  stopHeroTimer();
  startHeroTimer();
}

if (hero && "IntersectionObserver" in window) {
  const heroObserver = new IntersectionObserver(
    ([entry]) => {
      heroIsVisible = Boolean(entry?.isIntersecting);
      syncHeroMotionPreference();
    },
    { threshold: 0.08 }
  );
  heroObserver.observe(hero);
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stopHeroTimer();
  } else {
    syncHeroMotionPreference();
  }
});

setHeroSlide(0);
syncHeroMotionPreference();

if (motionQuery.addEventListener) {
  motionQuery.addEventListener("change", syncHeroMotionPreference);
} else if (motionQuery.addListener) {
  motionQuery.addListener(syncHeroMotionPreference);
}

function loadPanelMedia(panel) {
  if (!panel) return;

  panel.querySelectorAll("img[data-src]").forEach((image) => {
    const source = image.getAttribute("data-src");
    if (!source) return;
    image.setAttribute("src", source);
    image.removeAttribute("data-src");
  });

  panel.querySelectorAll("video[data-poster]").forEach((video) => {
    const poster = video.getAttribute("data-poster");
    if (!poster) return;
    video.setAttribute("poster", poster);
    video.removeAttribute("data-poster");
  });

  panel.querySelectorAll("source[data-src]").forEach((source) => {
    const mediaSource = source.getAttribute("data-src");
    if (!mediaSource) return;
    source.setAttribute("src", mediaSource);
    source.removeAttribute("data-src");
  });

  panel.querySelectorAll("video").forEach((video) => {
    if (video.querySelector("source[src]")) {
      video.load();
    }
  });
}

function syncSummaryState(panel) {
  const summary = panel.querySelector("summary");
  if (!summary) return;
  summary.setAttribute("aria-expanded", panel.open ? "true" : "false");
}

const panelAnimations = new WeakMap();

function finishPanelAnimation(panel) {
  const running = panelAnimations.get(panel);
  if (!running) return;
  running.animation.finish();
  running.finalize();
}

function animatePanel(panel, shouldOpen, options = {}) {
  const summary = panel.querySelector("summary");
  if (!summary) return;

  finishPanelAnimation(panel);

  if (panel.open === shouldOpen) {
    syncSummaryState(panel);
    if (shouldOpen) loadPanelMedia(panel);
    return;
  }

  const animate = options.animate !== false && !motionQuery.matches;
  const content = Array.from(panel.children).find((child) => child !== summary);

  if (!animate || typeof panel.animate !== "function") {
    panel.open = shouldOpen;
    syncSummaryState(panel);
    if (shouldOpen) loadPanelMedia(panel);
    return;
  }

  const startHeight = panel.open ? panel.offsetHeight : summary.offsetHeight;

  if (shouldOpen) {
    panel.open = true;
    syncSummaryState(panel);
    loadPanelMedia(panel);
  }

  const endHeight = shouldOpen ? panel.scrollHeight : summary.offsetHeight;
  panel.style.height = `${startHeight}px`;
  panel.style.overflow = "clip";
  panel.classList.add("is-animating");
  panel.classList.toggle("is-opening", shouldOpen);
  panel.classList.toggle("is-closing", !shouldOpen);

  const duration = shouldOpen ? 560 : 420;
  const animation = panel.animate(
    {
      height: [`${startHeight}px`, `${endHeight}px`],
    },
    {
      duration,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    }
  );

  let contentAnimation;
  if (content && typeof content.animate === "function") {
    contentAnimation = content.animate(
      shouldOpen
        ? [
            { opacity: 0, transform: "translateY(-10px) scale(0.99)" },
            { opacity: 1, transform: "translateY(0) scale(1)" },
          ]
        : [
            { opacity: 1, transform: "translateY(0) scale(1)" },
            { opacity: 0, transform: "translateY(-8px) scale(0.992)" },
          ],
      {
        duration: shouldOpen ? 460 : 300,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "both",
      }
    );
  }

  let finalized = false;
  const finalize = () => {
    if (finalized) return;
    finalized = true;
    panel.open = shouldOpen;
    syncSummaryState(panel);
    panel.style.removeProperty("height");
    panel.style.removeProperty("overflow");
    panel.classList.remove("is-animating", "is-opening", "is-closing");
    contentAnimation?.cancel();
    panelAnimations.delete(panel);
  };

  animation.addEventListener("finish", finalize, { once: true });
  animation.addEventListener("cancel", finalize, { once: true });

  panelAnimations.set(panel, { animation, finalize });
}

document.querySelectorAll("details").forEach((panel) => {
  const summary = panel.querySelector("summary");

  syncSummaryState(panel);

  if (summary) {
    summary.addEventListener("click", (event) => {
      event.preventDefault();
      animatePanel(panel, !panel.open);
    });
  }

  panel.addEventListener("toggle", () => {
    syncSummaryState(panel);
    if (panel.open) loadPanelMedia(panel);
  });

  if (panel.open) {
    loadPanelMedia(panel);
  }
});

function scrollBehavior() {
  return motionQuery.matches ? "auto" : "smooth";
}

function openLinkedPanel(hash, options = {}) {
  if (!hash || hash === "#") return;

  let id = hash.slice(1);

  try {
    id = decodeURIComponent(id);
  } catch {
    return;
  }

  const target = document.getElementById(id);
  if (!target) return;

  if (target.tagName.toLowerCase() === "details") {
    animatePanel(target, true, { animate: !options.instant });
  }

  window.requestAnimationFrame(() => {
    target.scrollIntoView({
      behavior: options.instant ? "auto" : scrollBehavior(),
      block: "start",
    });
  });
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const hash = link.getAttribute("href");
    if (!hash || hash === "#") return;

    event.preventDefault();
    history.pushState(null, "", hash);
    openLinkedPanel(hash);
  });
});

window.addEventListener("popstate", () => {
  openLinkedPanel(window.location.hash);
});

openLinkedPanel(window.location.hash, { instant: true });

if (window.location.hash) {
  window.addEventListener(
    "load",
    () => {
      openLinkedPanel(window.location.hash, { instant: true });
    },
    { once: true }
  );
}

const nav = document.querySelector(".nav");
let navFrame;

function updateNavState() {
  navFrame = undefined;
  nav?.classList.toggle("is-scrolled", window.scrollY > 28);
}

function queueNavStateUpdate() {
  if (navFrame) return;
  navFrame = window.requestAnimationFrame(updateNavState);
}

updateNavState();
window.addEventListener("scroll", queueNavStateUpdate, { passive: true });

const navSectionLinks = Array.from(
  document.querySelectorAll('.nav-links a[href^="#"]')
).map((link) => {
  const id = link.getAttribute("href")?.slice(1);
  return {
    link,
    section: id ? document.getElementById(id) : null,
  };
});

function setActiveNavLink(activeLink) {
  navSectionLinks.forEach(({ link }) => {
    const isActive = link === activeLink;
    link.classList.toggle("is-active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;
      const match = navSectionLinks.find(({ section }) => section === visible.target);
      if (match) setActiveNavLink(match.link);
    },
    {
      rootMargin: "-24% 0px -58% 0px",
      threshold: [0.01, 0.18, 0.42],
    }
  );

  navSectionLinks.forEach(({ section }) => {
    if (section) sectionObserver.observe(section);
  });
}

const glassSurfaceSelector = [
  ".nav",
  ".hero-lower",
  ".glass-chip",
  ".glass-button",
  ".chapter-card",
  ".theme-card",
  ".project-card",
  ".work-meta-grid article",
  ".contact-panel",
].join(",");

const glassLightingState = new WeakMap();

function bindGlassLighting() {
  document.querySelectorAll(glassSurfaceSelector).forEach((surface) => {
    const state = { clientX: 0, clientY: 0, frame: 0 };
    glassLightingState.set(surface, state);

    surface.addEventListener(
      "pointermove",
      (event) => {
        if (!finePointerQuery.matches || motionQuery.matches) return;

        state.clientX = event.clientX;
        state.clientY = event.clientY;
        if (state.frame) return;

        state.frame = window.requestAnimationFrame(() => {
          state.frame = 0;
          const rect = surface.getBoundingClientRect();
          if (!rect.width || !rect.height) return;

          const x = ((state.clientX - rect.left) / rect.width) * 100;
          const y = ((state.clientY - rect.top) / rect.height) * 100;
          surface.style.setProperty("--glass-x", `${x.toFixed(2)}%`);
          surface.style.setProperty("--glass-y", `${y.toFixed(2)}%`);
          surface.classList.add("is-lit");
        });
      },
      { passive: true }
    );

    surface.addEventListener(
      "pointerleave",
      () => {
        if (state.frame) {
          window.cancelAnimationFrame(state.frame);
          state.frame = 0;
        }
        surface.classList.remove("is-lit");
        surface.style.removeProperty("--glass-x");
        surface.style.removeProperty("--glass-y");
      },
      { passive: true }
    );
  });
}

bindGlassLighting();
