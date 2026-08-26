# Hank — Travel × Life

Hank's personal travel and life archive, published as a static site with GitHub Pages.

Every folder under the local media library represents one trip or one life chapter. The homepage turns those folders into a world map and an interactive coverflow; every card opens a chronological, curated gallery of photographs and films.

## Live site

https://hank187548.github.io/

## Local source of truth

```text
E:\Codex\Website\Photovideo
├── 2023_0726-Bali_Australia
├── 2024_0510-Thai
├── 2025_0709-Tibet_Japen
├── 2025_0827-Okinawa
├── 2026_0122-Thai_Vietnam
├── 2026_0820-Italy
└── Toolmen
```

The original media stays in that local folder. Only selected, web-optimized copies are committed to this repository.

## Site structure

- `index.html`, `styles.css`, `script.js`: homepage, map, and folder carousel
- `content/journeys.js`: chapter titles, dates, source-folder names, covers, and destinations
- `content/archive.js`: chronological media selection for every chapter
- `travel/story.css`, `travel/story.js`: shared journey-gallery layout and interaction
- `travel/<slug>/index.html`: one clean URL per folder
- `assets/archive/<slug>/`: WebP photographs, compressed MP4 clips, posters, and covers
- `assets/maps/world-map.png`: homepage map
- `.nojekyll`: serves the static files directly on GitHub Pages

## Local preview

From the repository root:

```powershell
python -m http.server 8123
```

Then open `http://127.0.0.1:8123/`.

## Adding another folder

1. Add the original photos and videos as a new folder under `E:\Codex\Website\Photovideo`.
2. Create a web-optimized folder under `assets/archive/`.
3. Add the chapter metadata to `content/journeys.js`.
4. Add its chronological selection to `content/archive.js`.
5. Add a matching `travel/<slug>/index.html` page.

## Deployment

The `main` branch is the GitHub Pages source. Pushing a commit publishes the updated static site automatically.
