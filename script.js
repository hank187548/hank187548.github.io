const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

const revealItems = document.querySelectorAll(
  ".hero-copy, .section-heading, .chapter-card, .theme-card, .project-card, .work-meta-grid article, .contact-panel"
);

revealItems.forEach((item) => item.classList.add("reveal"));

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
const heroIntervalMs = 4000;
let activeHeroSlide = 0;
let heroTimer;

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
  if (motionQuery.matches || heroSlides.length < 2) return;
  stopHeroTimer();
  heroTimer = window.setInterval(() => {
    setHeroSlide(activeHeroSlide + 1);
  }, heroIntervalMs);
}

function syncHeroMotionPreference() {
  stopHeroTimer();

  if (motionQuery.matches) {
    setHeroSlide(0);
    return;
  }

  startHeroTimer();
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

document.querySelectorAll("details").forEach((panel) => {
  const summary = panel.querySelector("summary");

  syncSummaryState(panel);

  if (summary) {
    summary.addEventListener("click", () => {
      window.setTimeout(() => {
        if (panel.open) {
          loadPanelMedia(panel);
        }
      }, 0);
    });
  }

  panel.addEventListener("toggle", () => {
    syncSummaryState(panel);

    if (panel.open) {
      loadPanelMedia(panel);
    }
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
    target.open = true;
    syncSummaryState(target);
    loadPanelMedia(target);
  }

  target.scrollIntoView({
    behavior: options.instant ? "auto" : scrollBehavior(),
    block: "start",
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
