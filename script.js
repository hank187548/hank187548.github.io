(() => {
"use strict";
function installLayoutRefinements() {
const style = document.createElement("style");
style.dataset.layoutFix = "20260803";
style.textContent = `
:root {
--shell: min(1440px, calc(100% - 64px));
}
body {
overflow-x: hidden;
overflow-x: clip;
}
.shell,
.profile-grid,
.profile-grid > *,
.profile-copy,
.work-heading > *,
.stories-heading > *,
.case-study > a > *,
.case-copy,
.case-metrics,
.story-title,
.story-intro > *,
.footer-meta > * {
min-width: 0;
max-width: 100%;
}
.profile-copy p,
.work-heading > p,
.stories-heading > p,
.case-description,
.story-title em,
.footer-meta p,
.case-kicker {
overflow-wrap: anywhere;
}
.profile::before {
right: max(0px, calc((100% - var(--shell)) / 2));
}
.profile-grid {
grid-template-columns: minmax(0, 1fr) max-content;
gap: clamp(48px, 6vw, 96px);
}
.profile-copy {
width: 100%;
max-width: none;
justify-self: end;
padding: 0 clamp(12px, 1.2vw, 18px) 8px 0;
}
.profile-copy p {
max-width: none;
white-space: nowrap;
}
.work-heading {
grid-template-columns: 1fr;
gap: clamp(44px, 6vw, 108px);
}
.stories-heading {
grid-template-columns: minmax(0, 1.48fr) minmax(260px, 0.54fr);
gap: clamp(44px, 6vw, 108px);
}
.work-heading > p,
.stories-heading > p {
max-width: 40ch;
}
.story-card {
overflow: hidden;
overflow: clip;
}
.mobile-menu {
width: 100%;
height: 100vh;
height: 100dvh;
min-height: 100lvh;
overflow-y: auto;
overscroll-behavior: contain;
padding-bottom: max(30px, env(safe-area-inset-bottom));
}
.case-copy,
.case-study:not(.case-study--featured) .case-copy {
grid-template-columns: minmax(0, 1fr);
}
@media (max-width: 1180px) {
:root {
--shell: min(1440px, calc(100% - 48px));
}
}
@media (max-width: 1080px) {
.profile-grid,
.work-heading,
.stories-heading {
grid-template-columns: 1fr;
}
.profile-grid {
gap: 42px;
align-items: start;
}
.profile-copy {
max-width: 620px;
justify-self: start;
padding-right: 0;
}
.work-heading,
.stories-heading {
gap: 34px;
}
.work-heading > p,
.stories-heading > p {
max-width: 620px;
}
.case-study:not(.case-study--featured) .case-copy {
grid-template-columns: minmax(0, 1fr);
gap: 18px;
}
.case-study:not(.case-study--featured) .case-description {
max-width: 620px;
}
}
@media (max-width: 720px) {
.mobile-menu {
padding-bottom: max(24px, env(safe-area-inset-bottom));
}
.profile-copy {
max-width: none;
padding-right: 0;
}
.profile-copy p {
max-width: 100%;
white-space: normal;
}
}
@media (max-width: 430px) {
.case-study > a,
.case-study:not(.case-study--featured) > a {
grid-template-columns: 30px minmax(0, 1fr);
gap: 12px;
}
.case-arrow {
display: none;
}
}
`;
document.head.append(style);
const order = ["profile", "stories", "work", "contact"];
const main = document.querySelector("main");
const stories = document.getElementById("stories");
const work = document.getElementById("work");
if (main && stories && work) main.insertBefore(stories, work);
[document.querySelector(".desktop-nav"), document.querySelector(".mobile-menu nav")].forEach((nav) => {
if (!nav) return;
order.forEach((id) => {
const link = nav.querySelector(`a[href="#${id}"]`);
if (link) nav.append(link);
});
});
const mobileNumbers = { profile: "01", stories: "02", work: "03", contact: "04" };
document.querySelectorAll('.mobile-menu nav a[href^="#"]').forEach((link) => {
const id = link.getAttribute("href")?.slice(1);
const number = link.querySelector("span");
if (number && id && mobileNumbers[id]) number.textContent = mobileNumbers[id];
});
const heroActions = document.querySelector(".hero-actions");
const archiveAction = heroActions?.querySelector('a[href="#stories"]');
if (heroActions && archiveAction) heroActions.prepend(archiveAction);
const storyMarker = stories?.querySelector(".section-marker span");
const workMarker = work?.querySelector(".section-marker span");
if (storyMarker) storyMarker.textContent = "02";
if (workMarker) workMarker.textContent = "03";
}
installLayoutRefinements();
const documentElement = document.documentElement;
const body = document.body;
const finePointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
const header = document.querySelector("[data-header]");
const themeColorMeta = document.querySelector('meta[name="theme-color"]');
const progressBar = document.querySelector(".scroll-progress span");
const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector(".mobile-menu");
const mobileMenuLinks = mobileMenu ? [...mobileMenu.querySelectorAll("a[href]")] : [];
const navLinks = [...document.querySelectorAll('.desktop-nav a[href^="#"]')];
const sectionTargets = [...document.querySelectorAll("[data-section-theme]")];
const reducedMotion = () => false;
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
const themeColors = { dark: "#090b09", light: "#0d100c", accent: "#111510" };
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
function heroInViewport() {
if (!hero) return true;
const rect = hero.getBoundingClientRect();
return rect.bottom > 0 && rect.top < window.innerHeight;
}
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
if ((!heroIsVisible && !heroInViewport()) || document.hidden || heroSlides.length < 2) return;
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
window.addEventListener("resize", () => {
heroIsVisible = heroInViewport();
startHeroTimer();
}, { passive: true });
document.addEventListener("visibilitychange", () => {
if (document.hidden) stopHeroTimer();
else startHeroTimer();
});
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
const lightbox = document.querySelector("[data-lightbox]");
const lightboxImage = lightbox?.querySelector("[data-lightbox-image]");
const lightboxCaption = lightbox?.querySelector("[data-lightbox-caption]");
const lightboxCounter = lightbox?.querySelector("[data-lightbox-counter]");
const lightboxCloseButton = lightbox?.querySelector("[data-lightbox-close]");
const lightboxPreviousButton = lightbox?.querySelector("[data-lightbox-prev]");
const lightboxNextButton = lightbox?.querySelector("[data-lightbox-next]");
let lightboxItems = [];
let activeLightboxIndex = 0;
let lightboxReturnFocus = null;
let lightboxHideTimer = 0;
function lightboxIsOpen() {
return Boolean(lightbox && !lightbox.hidden);
}
function photoSource(image) {
return image.currentSrc || image.getAttribute("src") || image.getAttribute("data-src") || "";
}
function preloadLightboxNeighbor(index) {
if (!lightboxItems.length) return;
const item = lightboxItems[(index + lightboxItems.length) % lightboxItems.length];
const source = photoSource(item.image);
if (!source) return;
const preloadImage = new Image();
preloadImage.src = source;
}
function setLightboxPhoto(index) {
if (!lightboxImage || !lightboxItems.length) return;
activeLightboxIndex = (index + lightboxItems.length) % lightboxItems.length;
const item = lightboxItems[activeLightboxIndex];
const source = photoSource(item.image);
lightboxImage.src = source;
lightboxImage.alt = item.image.alt || item.caption || "Travel photograph";
if (lightboxCaption) lightboxCaption.textContent = item.caption;
if (lightboxCounter) lightboxCounter.textContent = `${formatIndex(activeLightboxIndex)} / ${String(lightboxItems.length).padStart(2, "0")}`;
const hasMultiplePhotos = lightboxItems.length > 1;
if (lightboxPreviousButton) lightboxPreviousButton.hidden = !hasMultiplePhotos;
if (lightboxNextButton) lightboxNextButton.hidden = !hasMultiplePhotos;
preloadLightboxNeighbor(activeLightboxIndex - 1);
preloadLightboxNeighbor(activeLightboxIndex + 1);
}
function openLightbox(tile) {
if (!lightbox || !lightboxImage) return;
const gallery = tile.closest(".media-grid");
if (!gallery) return;
lightboxItems = [...gallery.querySelectorAll(".media-tile--zoomable")]
.map((galleryTile) => {
const image = galleryTile.querySelector("img");
const caption = galleryTile.querySelector("figcaption")?.textContent?.trim() || image?.alt || "";
return image ? { tile: galleryTile, image, caption } : null;
})
.filter(Boolean);
const selectedIndex = lightboxItems.findIndex((item) => item.tile === tile);
if (selectedIndex < 0) return;
window.clearTimeout(lightboxHideTimer);
lightboxReturnFocus = tile;
lightbox.hidden = false;
lightbox.setAttribute("aria-hidden", "false");
body.classList.add("lightbox-open");
stopHeroTimer();
setLightboxPhoto(selectedIndex);
window.requestAnimationFrame(() => lightbox.classList.add("is-open"));
lightboxCloseButton?.focus({ preventScroll: true });
}
function closeLightbox() {
if (!lightboxIsOpen()) return;
lightbox.classList.remove("is-open");
lightbox.setAttribute("aria-hidden", "true");
body.classList.remove("lightbox-open");
lightboxHideTimer = window.setTimeout(() => {
lightbox.hidden = true;
lightboxImage?.removeAttribute("src");
}, 220);
if (lightboxReturnFocus instanceof HTMLElement) lightboxReturnFocus.focus({ preventScroll: true });
lightboxReturnFocus = null;
startHeroTimer();
}
function moveLightbox(direction) {
if (!lightboxIsOpen() || lightboxItems.length < 2) return;
setLightboxPhoto(activeLightboxIndex + direction);
}
document.querySelectorAll(".media-grid .media-tile").forEach((tile) => {
const image = tile.querySelector("img");
if (!image) return;
tile.classList.add("media-tile--zoomable");
tile.tabIndex = 0;
tile.setAttribute("role", "button");
const caption = tile.querySelector("figcaption")?.textContent?.trim() || image.alt || "photo";
tile.setAttribute("aria-label", `Open photo: ${caption}`);
tile.addEventListener("click", () => openLightbox(tile));
tile.addEventListener("keydown", (event) => {
if (event.key !== "Enter" && event.key !== " ") return;
event.preventDefault();
openLightbox(tile);
});
});
lightboxCloseButton?.addEventListener("click", closeLightbox);
lightboxPreviousButton?.addEventListener("click", () => moveLightbox(-1));
lightboxNextButton?.addEventListener("click", () => moveLightbox(1));
lightbox?.addEventListener("click", (event) => {
if (event.target === lightbox) closeLightbox();
});
document.addEventListener("keydown", (event) => {
if (!lightboxIsOpen()) return;
if (event.key === "Escape") {
event.preventDefault();
closeLightbox();
} else if (event.key === "ArrowLeft") {
event.preventDefault();
moveLightbox(-1);
} else if (event.key === "ArrowRight") {
event.preventDefault();
moveLightbox(1);
} else if (event.key === "Tab") {
const controls = [lightboxCloseButton, lightboxPreviousButton, lightboxNextButton].filter((control) => control && !control.hidden);
if (!controls.length) return;
const firstControl = controls[0];
const lastControl = controls[controls.length - 1];
if (event.shiftKey && document.activeElement === firstControl) {
event.preventDefault();
lastControl.focus();
} else if (!event.shiftKey && document.activeElement === lastControl) {
event.preventDefault();
firstControl.focus();
}
}
});
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
