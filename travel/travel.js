(() => {
"use strict";
const journeys = {
"italy-2026": {
intro: "Fourteen days from Milano to the Ligurian coast — old stone, summer light, long trains, and friends by the sea.",
timeline: [
["Jun 21–22", "Milano arrival."],
["Jun 23–26", "Northern Italy with friends."],
["Jun 27–28", "Vatican and Roma."],
["Jun 29–Jul 02", "Firenze and the Arno."],
["Jul 03", "Pisa and Cinque Terre."],
["Jul 04–06", "Sea, friends, and home."],
],
media: [
{ src: "../../assets/trips/italy-2026/milan-galleria.jpg", alt: "Galleria Vittorio Emanuele II in Milan", caption: "Jun 22 · Milano", shape: "portrait" },
{ src: "../../assets/trips/italy-2026/milan-street.jpg", alt: "A street in Milan at dusk", caption: "Jun 22 · City lines", shape: "wide" },
{ src: "../../assets/trips/italy-2026/friends-north.jpg", alt: "Friends walking together in northern Italy", caption: "Jun 23 · Together" },
{ type: "video", src: "../../assets/trips/italy-2026/vatican-fountain.mp4", poster: "../../assets/video-posters/italy-2026/vatican-fountain.jpg", alt: "Fountain at Vatican City", caption: "Jun 27 · Vatican light" },
{ src: "../../assets/trips/italy-2026/rome-castel-sant-angelo.jpg", alt: "Castel Sant'Angelo in Rome", caption: "Jun 27 · Castel Sant'Angelo" },
{ src: "../../assets/trips/italy-2026/rome-trevi.jpg", alt: "Trevi Fountain in Rome", caption: "Jun 27 · Trevi", shape: "wide" },
{ src: "../../assets/trips/italy-2026/rome-colosseum.jpg", alt: "Inside the Colosseum in Rome", caption: "Jun 28 · Colosseum", shape: "wide" },
{ src: "../../assets/trips/italy-2026/roman-forum.jpg", alt: "Roman Forum under a blue sky", caption: "Jun 28 · Roman Forum", shape: "wide" },
{ src: "../../assets/trips/italy-2026/florence-duomo.jpg", alt: "Florence Cathedral seen from the street", caption: "Jun 30 · Firenze", shape: "portrait" },
{ src: "../../assets/trips/italy-2026/florence-skyline.jpg", alt: "Panoramic view over Florence", caption: "Jul 01 · Skyline", shape: "wide" },
{ src: "../../assets/trips/italy-2026/florence-ceiling.jpg", alt: "Painted cathedral ceiling in Florence", caption: "Jul 02 · Looking up", shape: "portrait" },
{ src: "../../assets/trips/italy-2026/florence-arno.jpg", alt: "The Arno river at sunset", caption: "Jul 02 · Arno evening", shape: "portrait" },
{ src: "../../assets/trips/italy-2026/pisa.jpg", alt: "Leaning Tower of Pisa", caption: "Jul 03 · Pisa", shape: "portrait" },
{ src: "../../assets/trips/italy-2026/cinque-terre-cover.jpg", alt: "Colourful village in Cinque Terre", caption: "Jul 03 · Cinque Terre", shape: "wide" },
{ src: "../../assets/trips/italy-2026/cinque-terre-coast.jpg", alt: "Ligurian coastline seen from above", caption: "Jul 03 · Ligurian blue", shape: "wide" },
{ src: "../../assets/trips/italy-2026/cinque-terre-rocks.jpg", alt: "Rocky swimming cove in Cinque Terre", caption: "Jul 03 · The cove", shape: "portrait" },
{ type: "video", src: "../../assets/trips/italy-2026/cinque-terre.mp4", poster: "../../assets/video-posters/italy-2026/cinque-terre.jpg", alt: "Cinque Terre coast", caption: "Jul 03 · Coast in motion" },
{ type: "video", src: "../../assets/trips/italy-2026/sea-swim.mp4", poster: "../../assets/video-posters/italy-2026/sea-swim.jpg", alt: "Friends swimming in Cinque Terre", caption: "Jul 04 · Into the water" },
{ src: "../../assets/trips/italy-2026/friends-swim.jpg", alt: "Friends by the sea in Cinque Terre", caption: "Jul 04 · By the sea", shape: "portrait" },
{ src: "../../assets/trips/italy-2026/friends-night.jpg", alt: "Friends together on the final night", caption: "Jul 04 · Last night", shape: "wide" },
],
previous: ["../thailand-vietnam/", "Thailand + Vietnam"],
next: ["../asia-2025/", "Asia overland"],
},
"asia-2025": {
intro: "A long route across altitude and neon — departing Taiwan, crossing Tibet by train, then moving through Chongqing and Japan.",
timeline: [
["Taiwan", "Departure."],
["Hong Kong", "Transfer north."],
["Tibet", "Trains, temples, and highlands."],
["Chongqing", "Bridges and city lights."],
["Japan", "Friends and fireworks."],
],
media: [
{ src: "../../assets/trips/china-japan/Depature_to_Hongkong.jpg", alt: "Departure to Hong Kong", caption: "Departure", shape: "wide" },
{ src: "../../assets/trips/china-japan/Take_train_to_Tibet.jpg", alt: "Train to Tibet", caption: "Train" },
{ src: "../../assets/trips/china-japan/Heighest_template_tibet.jpg", alt: "Temple in Tibet", caption: "Temple", shape: "portrait" },
{ src: "../../assets/trips/china-japan/Tibet_landscape.jpg", alt: "Road through Tibet", caption: "Road", shape: "wide" },
{ src: "../../assets/trips/china-japan/Me_in_Tibet_2.jpg", alt: "Portrait in Tibet", caption: "Altitude", shape: "wide" },
{ src: "../../assets/trips/china-japan/Me_In_tibet.jpg", alt: "Portrait in Tibet", caption: "Tibet", shape: "portrait" },
{ src: "../../assets/trips/china-japan/The_height_moutain_tibet.jpg", alt: "Tibet mountain", caption: "Mountain", shape: "wide" },
{ src: "../../assets/trips/china-japan/The_height_pool_tibet.jpg", alt: "High-altitude pool in Tibet", caption: "Water" },
{ src: "../../assets/trips/china-japan/Tibet3.jpg", alt: "Tibet landscape", caption: "Tibet view", shape: "wide" },
{ src: "../../assets/trips/china-japan/monk_in_tibet.jpg", alt: "Monk in Tibet", caption: "Monk", shape: "portrait" },
{ src: "../../assets/trips/china-japan/Bye_Tibet_to_chongqing.jpg", alt: "Leaving Tibet for Chongqing", caption: "Next city" },
{ src: "../../assets/trips/china-japan/Chongqing.jpg", alt: "Chongqing city", caption: "Chongqing", shape: "wide" },
{ src: "../../assets/trips/china-japan/Chongqing_bridge.jpg", alt: "Chongqing bridge", caption: "Bridge", shape: "wide" },
{ src: "../../assets/trips/china-japan/Chongqing_Hongya_Cave.jpg", alt: "Hongya Cave", caption: "Hongya Cave", shape: "portrait" },
{ src: "../../assets/trips/china-japan/Chongqing_night.jpg", alt: "Chongqing at night", caption: "Night", shape: "wide" },
{ type: "video", src: "../../assets/trips/china-japan/Chongqing_performance.mp4", poster: "../../assets/video-posters/chongqing-performance-first-frame.jpg", alt: "Chongqing performance", caption: "Show" },
{ src: "../../assets/trips/china-japan/Me_Japen_3.jpg", alt: "Portrait in Japan", caption: "Japan", shape: "portrait" },
{ src: "../../assets/trips/china-japan/Take_train_to_see_firework_Japen.png", alt: "Train to see fireworks in Japan", caption: "Firework train", shape: "portrait" },
{ src: "../../assets/trips/china-japan/Firework.jpg", alt: "Fireworks", caption: "Firework", shape: "wide" },
{ src: "../../assets/trips/china-japan/Firework%202.jpg", alt: "Fireworks", caption: "Firework", shape: "wide" },
{ src: "../../assets/trips/china-japan/Sleep_in_park.jpg", alt: "Resting in a park", caption: "Rest" },
{ type: "video", src: "../../assets/trips/china-japan/Train_inside.mp4", poster: "../../assets/video-posters/train-inside-first-frame.jpg", alt: "Inside a train", caption: "Inside train" },
],
previous: ["../italy-2026/", "Italy, in motion"],
next: ["../okinawa/", "Okinawa blue"],
},
"okinawa": {
intro: "Open-water training in Okinawa, where every lesson changed the way the ocean looked from above and below.",
timeline: [
["Arrival", "Meet the island and the dive team."],
["Training", "Skills, breathing, and buoyancy."],
["Open water", "The first full descent."],
["Surface", "A new view of Okinawa."],
],
media: [
{ src: "../../assets/trips/diving/Diving_in_okinawa.jpg", alt: "Diving in Okinawa", caption: "Okinawa", shape: "wide" },
{ src: "../../assets/trips/diving/Div2.jpg", alt: "Dive moment", caption: "Dive", shape: "portrait" },
{ src: "../../assets/trips/diving/Diving_test_PADI_OW.jpg", alt: "PADI open-water training", caption: "PADI training", shape: "wide" },
{ src: "../../assets/photos/diving-open-water.jpg", alt: "Open water", caption: "Open water" },
{ type: "video", src: "../../assets/trips/diving/Diving.mp4", poster: "../../assets/video-posters/diving-first-frame.jpg", alt: "Diving clip", caption: "Below the surface" },
],
previous: ["../asia-2025/", "Asia overland"],
next: ["../bali-australia/", "Southbound"],
},
"bali-australia": {
intro: "Island cliffs, surf, Sydney Harbour, and the red centre — a southbound chapter shaped by distance and open sky.",
timeline: [
["Bali", "Beaches and island roads."],
["Diamond Beach", "Cliffs above the water."],
["Sydney", "Harbour light and surf."],
["Uluru", "Red earth with family."],
],
media: [
{ src: "../../assets/trips/bali-australia/Bali_beach.jpg", alt: "Bali beach", caption: "Bali", shape: "wide" },
{ src: "../../assets/trips/bali-australia/Diamond_beach.jpg", alt: "Diamond Beach", caption: "Diamond Beach", shape: "portrait" },
{ src: "../../assets/trips/bali-australia/Surf.jpg", alt: "Surfing", caption: "Surf", shape: "wide" },
{ src: "../../assets/trips/bali-australia/Sydney.jpg", alt: "Sydney Harbour", caption: "Sydney", shape: "wide" },
{ src: "../../assets/trips/bali-australia/Sydney_bridge.jpg", alt: "Sydney Harbour Bridge", caption: "Harbour bridge" },
{ src: "../../assets/trips/bali-australia/Uluru_with_brother.jpg", alt: "Uluru with brother", caption: "Uluru", shape: "portrait" },
{ type: "video", src: "../../assets/trips/bali-australia/Camel_with_brother.mp4", poster: "../../assets/video-posters/camel-with-brother-first-frame.jpg", alt: "Camel ride with brother", caption: "Red centre" },
],
previous: ["../okinawa/", "Okinawa blue"],
next: ["../thailand-vietnam/", "Friends & streets"],
},
"thailand-vietnam": {
intro: "A trip remembered through people — night streets, local guides, humid afternoons, and the friends who shared the route.",
timeline: [
["Thailand", "Temples, markets, and city nights."],
["Local route", "Seeing the streets with a guide."],
["Vietnam", "A new city and slower mornings."],
["Together", "The people inside the journey."],
],
media: [
{ src: "../../assets/trips/thailand-vietnam/Thai.jpg", alt: "Thailand travel", caption: "Thailand", shape: "wide" },
{ src: "../../assets/trips/thailand-vietnam/vietnam.jpg", alt: "Vietnam", caption: "Vietnam", shape: "wide" },
{ src: "../../assets/trips/thailand-vietnam/US.jpg", alt: "Friends travelling in Thailand", caption: "Together", shape: "portrait" },
{ src: "../../assets/trips/thailand-vietnam/With_our_guide.jpg", alt: "With a local guide", caption: "Our guide", shape: "wide" },
{ src: "../../assets/trips/thailand-vietnam/Weed.jpg", alt: "Thailand street", caption: "Street" },
{ type: "video", src: "../../assets/trips/thailand-vietnam/Thai_2_with_master.mp4", poster: "../../assets/video-posters/thailand-first-frame.jpg", alt: "Thailand travel clip", caption: "In motion" },
],
previous: ["../bali-australia/", "Southbound"],
next: ["../italy-2026/", "Italy, in motion"],
},
};
const page = document.body;
const journey = journeys[page.dataset.journey];
if (!journey) return;
const timeline = document.querySelector("[data-journey-timeline]");
const intro = document.querySelector("[data-journey-intro]");
const gallery = document.querySelector("[data-journey-gallery]");
const galleryCount = document.querySelector("[data-gallery-count]");
const previousLink = document.querySelector("[data-journey-previous]");
const nextLink = document.querySelector("[data-journey-next]");
if (intro) intro.textContent = journey.intro;
if (timeline) {
timeline.innerHTML = journey.timeline.map(([date, label]) => `<li><span>${date}</span><strong>${label}</strong></li>`).join("");
}
function mediaMarkup(item, index) {
const shapeClass = item.shape ? ` journey-media--${item.shape}` : "";
if (item.type === "video") {
return `<figure class="journey-media journey-media--video journey-reveal"><video controls playsinline preload="metadata" poster="${item.poster}" aria-label="${item.alt}"><source src="${item.src}" type="video/mp4" /></video><figcaption>${item.caption}</figcaption></figure>`;
}
return `<figure class="journey-media${shapeClass} journey-reveal" tabindex="0" role="button" aria-label="Open photo: ${item.caption}" data-photo-index="${index}"><img src="${item.src}" alt="${item.alt}" loading="lazy" decoding="async" /><figcaption>${item.caption}</figcaption></figure>`;
}
if (gallery) gallery.innerHTML = journey.media.map(mediaMarkup).join("");
if (galleryCount) galleryCount.textContent = `${journey.media.length} frames · click a photo to expand`;
if (previousLink) {
previousLink.href = journey.previous[0];
previousLink.querySelector("strong").textContent = journey.previous[1];
}
if (nextLink) {
nextLink.href = journey.next[0];
nextLink.querySelector("strong").textContent = journey.next[1];
}
const progress = document.querySelector(".scroll-progress span");
const header = document.querySelector("[data-trip-header]");
function updateScroll() {
const range = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
const ratio = Math.min(Math.max(window.scrollY / range, 0), 1);
progress?.style.setProperty("transform", `scaleX(${ratio})`);
header?.classList.toggle("is-compact", window.scrollY > 36);
}
window.addEventListener("scroll", updateScroll, { passive: true });
updateScroll();
const revealItems = [...document.querySelectorAll(".journey-reveal")];
if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
const observer = new IntersectionObserver((entries, instance) => {
entries.forEach((entry) => {
if (!entry.isIntersecting) return;
entry.target.classList.add("is-visible");
instance.unobserve(entry.target);
});
}, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
revealItems.forEach((item) => observer.observe(item));
}
const lightbox = document.querySelector("[data-lightbox]");
const lightboxImage = lightbox?.querySelector("[data-lightbox-image]");
const lightboxCaption = lightbox?.querySelector("[data-lightbox-caption]");
const lightboxCounter = lightbox?.querySelector("[data-lightbox-counter]");
const lightboxClose = lightbox?.querySelector("[data-lightbox-close]");
const lightboxPrevious = lightbox?.querySelector("[data-lightbox-prev]");
const lightboxNext = lightbox?.querySelector("[data-lightbox-next]");
const photoItems = journey.media.filter((item) => item.type !== "video");
let activePhoto = 0;
let returnFocus = null;
function showPhoto(index) {
if (!lightboxImage || !photoItems.length) return;
activePhoto = (index + photoItems.length) % photoItems.length;
const item = photoItems[activePhoto];
lightboxImage.src = item.src;
lightboxImage.alt = item.alt;
if (lightboxCaption) lightboxCaption.textContent = item.caption;
if (lightboxCounter) lightboxCounter.textContent = `${String(activePhoto + 1).padStart(2, "0")} / ${String(photoItems.length).padStart(2, "0")}`;
}
function openLightbox(tile) {
if (!lightbox) return;
const mediaIndex = Number(tile.dataset.photoIndex);
const selectedItem = journey.media[mediaIndex];
const photoIndex = photoItems.indexOf(selectedItem);
if (photoIndex < 0) return;
returnFocus = tile;
lightbox.hidden = false;
lightbox.setAttribute("aria-hidden", "false");
document.body.classList.add("lightbox-open");
showPhoto(photoIndex);
requestAnimationFrame(() => lightbox.classList.add("is-open"));
lightboxClose?.focus({ preventScroll: true });
}
function closeLightbox() {
if (!lightbox || lightbox.hidden) return;
lightbox.classList.remove("is-open");
lightbox.setAttribute("aria-hidden", "true");
document.body.classList.remove("lightbox-open");
window.setTimeout(() => {
lightbox.hidden = true;
lightboxImage?.removeAttribute("src");
}, 220);
returnFocus?.focus({ preventScroll: true });
returnFocus = null;
}
document.querySelectorAll("[data-photo-index]").forEach((tile) => {
tile.addEventListener("click", () => openLightbox(tile));
tile.addEventListener("keydown", (event) => {
if (event.key !== "Enter" && event.key !== " ") return;
event.preventDefault();
openLightbox(tile);
});
});
lightboxClose?.addEventListener("click", closeLightbox);
lightboxPrevious?.addEventListener("click", () => showPhoto(activePhoto - 1));
lightboxNext?.addEventListener("click", () => showPhoto(activePhoto + 1));
lightbox?.addEventListener("click", (event) => { if (event.target === lightbox) closeLightbox(); });
document.addEventListener("keydown", (event) => {
if (!lightbox || lightbox.hidden) return;
if (event.key === "Escape") closeLightbox();
if (event.key === "ArrowLeft") showPhoto(activePhoto - 1);
if (event.key === "ArrowRight") showPhoto(activePhoto + 1);
});
document.querySelectorAll("[data-year]").forEach((item) => { item.textContent = String(new Date().getFullYear()); });
})();
