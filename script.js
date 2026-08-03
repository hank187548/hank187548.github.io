(() => {
"use strict";
const documentElement = document.documentElement;
const body = document.body;
const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
const header = document.querySelector("[data-header]");
const themeColorMeta = document.querySelector('meta[name="theme-color"]');
const progressBar = document.querySelector(".scroll-progress span");
const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector(".mobile-menu");
const mobileMenuLinks = mobileMenu ? [...mobileMenu.querySelectorAll("a[href]")] : [];
const navLinks = [...document.querySelectorAll('.desktop-nav a[href^="#"]')];
const sectionTargets = [...document.querySelectorAll("[data-section-theme]")];
const reducedMotion = () => motionQuery.matches;
let menuLastFocus = null;
document.querySelectorAll("[data-year]").forEach((item) => {
item.textContent = String(new Date().getFullYear());
});
function setMenu(open) {
if (!menuToggle || !mobileMenu) return;
menuToggle.setAttribute("aria-expanded", String(open));
mobileMenu.setAttribute("aria-hidden", String(!open));
mobileMenu.classList.toggle("is-open", open);
body.classList.toggle("menu-open", open);
if (open) {
menuLastFocus = document.activeElement;
window.setTimeout(() => mobileMenuLinks[0]?.focus(), reducedMotion() ? 0 : 360);
} else if (menuLastFocus instanceof HTMLElement) {
menuLastFocus.focus({ preventScroll: true });
menuLastFocus = null;
}
}
menuToggle?.addEventListener("click", () => {
setMenu(menuToggle.getAttribute("aria-expanded") !== "true");
});
mobileMenuLinks.forEach((link) => link.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (event) => {
if (event.key === "Escape" && mobileMenu?.classList.contains("is-open")) {
setMenu(false);
return;
}
if (event.key !== "Tab" || !mobileMenu?.classList.contains("is-open")) return;
const focusable = [menuToggle, ...mobileMenuLinks].filter(Boolean);
const first = focusable[0];
const last = focusable[focusable.length - 1];
if (event.shiftKey && document.activeElement === first) {
event.preventDefault();
last.focus();
} else if (!event.shiftKey && document.activeElement === last) {
event.preventDefault();
first.focus();
}
});
let scrollTicking = false;
function updateScrollUI() {
const scrollTop = window.scrollY || documentElement.scrollTop;
const scrollRange = Math.max(documentElement.scrollHeight - window.innerHeight, 1);
const progress = Math.min(Math.max(scrollTop / scrollRange, 0), 1);
progressBar?.style.setProperty("transform", `scaleX(${progress})`);
header?.classList.toggle("is-compact", scrollTop > 36);
if (!reducedMotion() && window.innerWidth > 720) {
documentElement.style.setProperty("--hero-parallax", `${Math.min(scrollTop * 0.12, 92)}px`);
}
scrollTicking = false;
}
function requestScrollUpdate() {
if (scrollTicking) return;
scrollTicking = true;
window.requestAnimationFrame(updateScrollUI);
}
window.addEventListener("scroll", requestScrollUpdate, { passive: true });
window.addEventListener("resize", requestScrollUpdate, { passive: true });
updateScrollUI();
if ("IntersectionObserver" in window) {
const themeObserver = new IntersectionObserver(
(entries) => {
const visible = entries
.filter((entry) => entry.isIntersecting)
.sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
if (!visible || !header) return;
const theme = visible.target.getAttribute("data-section-theme") || "light";
header.classList.remove("is-on-dark", "is-on-light", "is-on-accent");
header.classList.add(`is-on-${theme}`);
const themeColors = { dark: "#11110f", light: "#f3f0e8", accent: "#ff5a1f" };
themeColorMeta?.setAttribute("content", themeColors[theme] || themeColors.light);
},
{
rootMargin: "-12% 0px -70% 0px",
threshold: [0, 0.05, 0.2],
}
);
sectionTargets.forEach((section) => themeObserver.observe(section));
const activeObserver = new IntersectionObserver(
(entries) => {
entries.forEach((entry) => {
if (!entry.isIntersecting || !entry.target.id) return;
navLinks.forEach((link) => {
link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
});
});
},
{
rootMargin: "-32% 0px -58% 0px",
threshold: 0,
}
);
["profile", "work", "stories", "contact"].forEach((id) => {
const target = document.getElementById(id);
if (target) activeObserver.observe(target);
});
}
const revealItems = [...document.querySelectorAll("[data-reveal]")];
revealItems.forEach((item, index) => {
item.style.setProperty("--reveal-delay", `${Math.min(index % 4, 3) * 65}ms`);
});
if (reducedMotion() || !("IntersectionObserver" in window)) {
revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
const revealObserver = new IntersectionObserver(
(entries, observer) => {
entries.forEach((entry) => {
if (!entry.isIntersecting) return;
entry.target.classList.add("is-visible");
observer.unobserve(entry.target);
});
},
{
rootMargin: "0px 0px -9% 0px",
threshold: 0.05,
}
);
revealItems.forEach((item) => revealObserver.observe(item));
}
const hero = document.querySelector(".hero");
const heroSlides = [...document.querySelectorAll("[data-hero-slide]")];
const heroCurrent = document.querySelector("[data-hero-current]");
const heroTotal = document.querySelector("[data-hero-total]");
const heroLabel = document.querySelector("[data-hero-label]");
const previousHeroButton = document.querySelector("[data-hero-prev]");
const nextHeroButton = document.querySelector("[data-hero-next]");
const heroInterval = 5600;
let activeHeroIndex = 0;
let heroTimer = 0;
let heroIsVisible = true;
function formatIndex(index) {
return String(index + 1).padStart(2, "0");
}
function setHeroSlide(index, restart = true) {
if (!heroSlides.length) return;
activeHeroIndex = (index + heroSlides.length) % heroSlides.length;
const nextIndex = (activeHeroIndex + 1) % heroSlides.length;
[activeHeroIndex, nextIndex].forEach((slideIndex) => {
const image = heroSlides[slideIndex]?.querySelector("img");
if (image) image.loading = "eager";
});
heroSlides.forEach((slide, slideIndex) => {
slide.classList.toggle("is-active", slideIndex === activeHeroIndex);
});
if (heroCurrent) heroCurrent.textContent = formatIndex(activeHeroIndex);
if (heroTotal) heroTotal.textContent = formatIndex(heroSlides.length - 1);
if (heroLabel) heroLabel.textContent = heroSlides[activeHeroIndex].dataset.label || "Visual archive";
if (restart) startHeroTimer();
}
function stopHeroTimer() {
if (!heroTimer) return;
window.clearInterval(heroTimer);
heroTimer = 0;
}
function startHeroTimer() {
stopHeroTimer();
if (reducedMotion() || !heroIsVisible || document.hidden || heroSlides.length < 2) return;
heroTimer = window.setInterval(() => setHeroSlide(activeHeroIndex + 1, false), heroInterval);
}
previousHeroButton?.addEventListener("click", () => setHeroSlide(activeHeroIndex - 1));
nextHeroButton?.addEventListener("click", () => setHeroSlide(activeHeroIndex + 1));
if (hero && "IntersectionObserver" in window) {
const heroObserver = new IntersectionObserver(
([entry]) => {
heroIsVisible = entry?.isIntersecting ?? true;
if (heroIsVisible) startHeroTimer();
else stopHeroTimer();
},
{ threshold: 0.08 }
);
heroObserver.observe(hero);
}
document.addEventListener("visibilitychange", () => {
if (document.hidden) stopHeroTimer();
else startHeroTimer();
});
if (motionQuery.addEventListener) {
motionQuery.addEventListener("change", () => {
startHeroTimer();
if (reducedMotion()) revealItems.forEach((item) => item.classList.add("is-visible"));
});
}
setHeroSlide(0, false);
startHeroTimer();
function loadPanelMedia(panel) {
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
if (video.querySelector("source[src]") && video.readyState === 0) video.load();
});
}
function pausePanelMedia(panel) {
panel.querySelectorAll("video").forEach((video) => video.pause());
}
function syncStoryState(panel) {
const summary = panel.querySelector(":scope > summary");
summary?.setAttribute("aria-expanded", String(panel.open));
}
function animateStory(panel, opening) {
const summary = panel.querySelector(":scope > summary");
const content = panel.querySelector(":scope > .story-content");
if (!summary || !content || panel.dataset.animating === "true") return;
panel.dataset.animating = "true";
const startHeight = `${panel.offsetHeight}px`;
if (opening) {
panel.open = true;
loadPanelMedia(panel);
}
const endHeight = `${summary.offsetHeight + (opening ? content.offsetHeight : 0)}px`;
const heightAnimation = panel.animate(
[{ height: startHeight }, { height: endHeight }],
{
duration: reducedMotion() ? 1 : opening ? 720 : 560,
easing: "cubic-bezier(0.16, 1, 0.3, 1)",
}
);
if (opening && !reducedMotion()) {
content.animate(
[
{ opacity: 0, transform: "translateY(18px)" },
{ opacity: 1, transform: "translateY(0)" },
],
{
duration: 620,
delay: 100,
easing: "cubic-bezier(0.16, 1, 0.3, 1)",
fill: "both",
}
);
}
heightAnimation.onfinish = () => {
if (!opening) {
panel.open = false;
pausePanelMedia(panel);
}
panel.style.height = "";
panel.dataset.animating = "false";
syncStoryState(panel);
};
heightAnimation.oncancel = () => {
panel.style.height = "";
panel.dataset.animating = "false";
syncStoryState(panel);
};
}
const storyPanels = [...document.querySelectorAll("[data-story]")];
storyPanels.forEach((panel) => {
const summary = panel.querySelector(":scope > summary");
syncStoryState(panel);
summary?.addEventListener("click", (event) => {
event.preventDefault();
animateStory(panel, !panel.open);
});
});
function openHashTarget(hash, instant = false) {
if (!hash || hash === "#") return;
let id;
try {
id = decodeURIComponent(hash.slice(1));
} catch {
return;
}
const target = document.getElementById(id);
if (!target) return;
if (target.matches("[data-story]") && !target.open) {
target.open = true;
loadPanelMedia(target);
syncStoryState(target);
}
target.scrollIntoView({ behavior: instant || reducedMotion() ? "auto" : "smooth", block: "start" });
}
document.querySelectorAll('a[href^="#"]').forEach((link) => {
link.addEventListener("click", (event) => {
const hash = link.getAttribute("href");
if (!hash || hash === "#") return;
const target = document.querySelector(hash);
if (!target) return;
event.preventDefault();
window.history.pushState(null, "", hash);
openHashTarget(hash);
});
});
window.addEventListener("popstate", () => openHashTarget(window.location.hash));
if (window.location.hash) {
window.addEventListener("load", () => openHashTarget(window.location.hash, true), { once: true });
}
const cursorLight = document.querySelector(".cursor-light");
if (finePointerQuery.matches && cursorLight) {
let cursorX = -100;
let cursorY = -100;
let cursorFrame = 0;
function renderCursor() {
cursorLight.style.setProperty("--x", `${cursorX}px`);
cursorLight.style.setProperty("--y", `${cursorY}px`);
cursorFrame = 0;
}
window.addEventListener(
"pointermove",
(event) => {
cursorX = event.clientX;
cursorY = event.clientY;
cursorLight.classList.add("is-visible");
if (!cursorFrame) cursorFrame = window.requestAnimationFrame(renderCursor);
},
{ passive: true }
);
document.documentElement.addEventListener("mouseleave", () => cursorLight.classList.remove("is-visible"));
document.querySelectorAll("[data-pointer-card]").forEach((card) => {
card.addEventListener("pointermove", (event) => {
const bounds = card.getBoundingClientRect();
card.style.setProperty("--mx", `${event.clientX - bounds.left}px`);
card.style.setProperty("--my", `${event.clientY - bounds.top}px`);
});
});
document.querySelectorAll(".magnetic").forEach((item) => {
item.addEventListener("pointermove", (event) => {
if (reducedMotion()) return;
const bounds = item.getBoundingClientRect();
const x = event.clientX - bounds.left - bounds.width / 2;
const y = event.clientY - bounds.top - bounds.height / 2;
item.style.transform = `translate3d(${x * 0.12}px, ${y * 0.18}px, 0)`;
});
item.addEventListener("pointerleave", () => {
item.style.transform = "translate3d(0, 0, 0)";
});
});
}
})();
