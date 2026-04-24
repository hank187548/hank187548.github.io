const revealItems = document.querySelectorAll(
  ".section, .signal-board, .panel, .feature-card, .timeline, .education-item, .skill-group"
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
    threshold: 0.18,
  }
);

revealItems.forEach((item) => observer.observe(item));
