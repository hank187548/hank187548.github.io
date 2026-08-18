# Hank — Travel & Life Archive

Personal travel and life archive published with GitHub Pages.

The site is intentionally not a professional portfolio. It is a visual journal of journeys, people, water, cities, and everyday life.

## Production architecture

The public homepage is static-first:

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

The world-map markers are positioned inside the same aspect-ratio canvas as `assets/maps/world-map.png`, so geographic percentages are measured against the image rather than the padded container. Multi-stop journeys show their individual recorded stops and highlight their route together.

## Local preview

```bash
python3 -m http.server 8123
```

Then open `http://localhost:8123`.

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
