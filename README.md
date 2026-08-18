# Hank — Travel & Life Archive

Personal travel and life archive published with GitHub Pages.

The site is intentionally not a professional portfolio. It is a visual journal of journeys, people, water, cities, and everyday life.

## Production architecture

```text
index.html           Complete semantic homepage content
site.css             Production styling and responsive overrides
site.js              Progressive enhancement for navigation, hero, coverflow, and atlas
assets/               Photos, maps, video, and trip media
travel/               Dedicated static journey pages
app/                  React + TypeScript source retained for development
```

The homepage remains readable without JavaScript. JavaScript upgrades the Travel section into the 3D coverflow and makes the Atlas interactive.

## Homepage structure

1. Cinematic photo-first hero
2. Life / visual archive introduction
3. Travel coverflow
4. Journey atlas
5. Contact

## Atlas

`assets/maps/world-map.png` is the 1357×628 Wikimedia `Blank-Map-World.png`, which uses a Robinson projection centered around 11°15′ E rather than a linear equirectangular projection. Marker positions are therefore calculated with a Robinson projection in both the production JavaScript and React source. Markers are rendered inside the same aspect-ratio canvas as the image, and multi-stop journeys highlight their recorded route together.

## Local preview

```bash
python3 -m http.server 8123
```

## React source

```bash
cd app
npm install
npm run dev
npm run build
```

The root `index.html`, `site.css`, and `site.js` remain the canonical GitHub Pages production files.

## Notes

- Existing `/travel/.../` URLs and media paths are preserved.
- The homepage supports mobile safe areas and `prefers-reduced-motion`.
- Journey pages remain focused on Travel × Life.
