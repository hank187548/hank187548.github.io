(() => {
  "use strict";

  const journeys = Array.isArray(window.JOURNEYS) ? window.JOURNEYS : [];
  const pad = (value) => String(value + 1).padStart(2, "0");

  const menuButton = document.querySelector("[data-menu-button]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");
  const setMenu = (open) => {
    menuButton?.setAttribute("aria-expanded", String(open));
    menuButton?.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    mobileMenu?.classList.toggle("is-open", open);
    mobileMenu?.setAttribute("aria-hidden", String(!open));
    document.body.style.overflow = open ? "hidden" : "";
  };
  menuButton?.addEventListener("click", () => setMenu(menuButton.getAttribute("aria-expanded") !== "true"));
  mobileMenu?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));

  const year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();

  const markerLayer = document.querySelector("[data-map-markers]");
  const mapIndex = document.querySelector("[data-map-index]");
  const mapLabel = document.querySelector("[data-map-label]");
  const markers = journeys.map((journey, index) => {
    const marker = document.createElement("button");
    marker.type = "button";
    marker.className = "map-marker";
    marker.style.setProperty("--x", `${journey.map.x}%`);
    marker.style.setProperty("--y", `${journey.map.y}%`);
    marker.setAttribute("aria-label", journey.title);
    marker.addEventListener("click", () => select(index));
    markerLayer?.append(marker);
    return marker;
  });

  const coverflow = document.querySelector("[data-coverflow]");
  const stage = document.querySelector("[data-coverflow-stage]");
  const current = document.querySelector("[data-current]");
  const currentTitle = document.querySelector("[data-current-title]");
  const currentFolder = document.querySelector("[data-current-folder]");
  const cards = journeys.map((journey, index) => {
    const card = document.createElement("a");
    card.className = "archive-card";
    card.href = journey.href;
    card.dataset.index = index;
    card.setAttribute("aria-label", `Open ${journey.title}`);
    card.innerHTML = `
      <img src="${journey.cover}" alt="${journey.title}" ${index ? 'loading="lazy"' : ""} decoding="async" draggable="false" />
      <span class="archive-card-number">${pad(index)} / ${String(journeys.length).padStart(2, "0")}</span>
      <span class="archive-card-type">${journey.type}</span>
      <span class="archive-card-copy">
        <small>${journey.dates}</small>
        <strong>${journey.title}</strong>
        <em>${journey.route}</em>
      </span>`;
    stage?.append(card);
    return card;
  });

  let selected = 0;
  let drag = null;
  let suppressClick = false;
  const wrappedDistance = (index) => {
    let distance = index - selected;
    const half = journeys.length / 2;
    if (distance > half) distance -= journeys.length;
    if (distance < -half) distance += journeys.length;
    return distance;
  };

  function render() {
    const cardWidth = cards[0]?.getBoundingClientRect().width || 300;
    const pitch = Math.min(window.innerWidth * .245, cardWidth * 1.02);
    cards.forEach((card, index) => {
      const distance = wrappedDistance(index);
      const abs = Math.abs(distance);
      card.style.setProperty("--x", `${distance * pitch}px`);
      card.style.setProperty("--z", `${-abs * cardWidth * .36}px`);
      card.style.setProperty("--rotate", `${-Math.sign(distance) * Math.min(48, abs * 36)}deg`);
      card.style.setProperty("--scale", String(Math.max(.72, 1 - abs * .075)));
      card.style.setProperty("--opacity", String(abs > 3 ? 0 : Math.max(.2, 1 - abs * .18)));
      card.style.zIndex = String(20 - Math.round(abs * 3));
      card.classList.toggle("is-active", index === selected);
      card.tabIndex = index === selected ? 0 : -1;
      card.setAttribute("aria-hidden", String(abs > 3));
    });

    const journey = journeys[selected];
    if (!journey) return;
    if (current) current.textContent = `${pad(selected)} / ${String(journeys.length).padStart(2, "0")}`;
    if (currentTitle) currentTitle.textContent = journey.title;
    if (currentFolder) currentFolder.textContent = journey.sourceFolder;
    if (mapIndex) mapIndex.textContent = `${pad(selected)} / ${String(journeys.length).padStart(2, "0")}`;
    if (mapLabel) mapLabel.textContent = `${journey.title} · ${journey.dates}`;
    markers.forEach((marker, index) => marker.classList.toggle("is-active", index === selected));
  }

  function select(index) {
    if (!journeys.length) return;
    selected = (index + journeys.length) % journeys.length;
    render();
  }

  document.querySelector("[data-previous]")?.addEventListener("click", () => select(selected - 1));
  document.querySelector("[data-next]")?.addEventListener("click", () => select(selected + 1));
  coverflow?.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    select(selected + (event.key === "ArrowRight" ? 1 : -1));
  });

  stage?.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    drag = { id: event.pointerId, x: event.clientX, moved: false };
  });
  stage?.addEventListener("pointermove", (event) => {
    if (!drag || drag.id !== event.pointerId) return;
    if (Math.abs(event.clientX - drag.x) > 8) drag.moved = true;
  });
  const finishDrag = (event) => {
    if (!drag || drag.id !== event.pointerId) return;
    const delta = event.clientX - drag.x;
    if (drag.moved) {
      event.preventDefault();
      suppressClick = true;
      select(selected + (delta < 0 ? 1 : -1));
      window.setTimeout(() => { suppressClick = false; }, 250);
    }
    drag = null;
  };
  stage?.addEventListener("pointerup", finishDrag);
  stage?.addEventListener("pointercancel", finishDrag);
  stage?.addEventListener("click", (event) => {
    const card = event.target.closest(".archive-card");
    if (!card) return;
    if (suppressClick) { event.preventDefault(); return; }
    const index = Number(card.dataset.index);
    if (index !== selected) { event.preventDefault(); select(index); }
  });
  stage?.addEventListener("dragstart", (event) => event.preventDefault());

  let resizeFrame;
  window.addEventListener("resize", () => {
    window.cancelAnimationFrame(resizeFrame);
    resizeFrame = window.requestAnimationFrame(render);
  }, { passive: true });

  if (journeys.length) render();
})();
