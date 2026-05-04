const revealItems = document.querySelectorAll(
  ".hero-copy, .collage-tile, .profile-card, .chapter-card, .theme-card, .work-panel, .contact-panel"
);

revealItems.forEach((item) => item.classList.add("reveal"));

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
    threshold: 0.02,
  }
);

revealItems.forEach((item) => observer.observe(item));

function openLinkedPanel(hash) {
  if (!hash) return;

  const target = document.getElementById(hash.slice(1));
  if (!target) return;

  if (target.tagName.toLowerCase() === "details") {
    target.open = true;
  }

  target.scrollIntoView({ behavior: "smooth", block: "start" });
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const hash = link.getAttribute("href");
    history.pushState(null, "", hash);
    openLinkedPanel(hash);
  });
});

openLinkedPanel(window.location.hash);

if (window.location.hash) {
  window.addEventListener(
    "load",
    () => {
      openLinkedPanel(window.location.hash);
    },
    { once: true }
  );
}
