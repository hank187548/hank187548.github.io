# Hank Life Log

This repository contains the source for Hank's personal website, published with GitHub Pages.

The homepage combines quantitative-research work with a visual travel archive.
The hero uses a world map with visited destinations, while Travel is presented
as an interactive 3D coverflow. Each card opens a dedicated journey page with
its own route, timeline, photographs, and clips.

One current story chapter covers the route:

```text
Taiwan -> Hong Kong -> Tibet -> Chongqing -> Japan
```

The newest chapter follows a 2026 Italy route through Milan, Rome, Florence,
Pisa, and Cinque Terre, using a curated set of web-optimized photos, MP4 clips,
and lightweight video posters.

That route is one chapter inside the life log, not the whole site. Professional
material remains available in the selected-work section.

The work section highlights:

- Qlib Taiwan equity trading workflow
- BTC trend forecasting
- Image-processing research for automated native breeder chicken selection
- Downloadable CV

## Live Site

```text
https://hank187548.github.io/
```

## Contents

- `index.html`: Main life log page
- `styles.css`: Responsive visual design and layout
- `script.js`: Homepage navigation, world-map rotation, and Travel coverflow interaction
- `travel/`: Dedicated static journey pages plus their shared gallery styles and behavior
- `convert_heic_to_jpg.py`: Helper script for converting HEIC/HEIF images to JPG
- `CV1_Hank_quant.pdf`: Downloadable CV
- `assets/photos/`: Web-optimized travel, life, and lab photos used by the site
- `assets/trips/china-japan/`: Media for the Taiwan, Hong Kong, Tibet, Chongqing, and Japan story chapter
- `assets/trips/italy-2026/`: Curated and web-optimized media for the 2026 Italy story chapter
- `assets/videos/`: Short MP4 clips used by the Motion Notes section
- `assets/video-posters/`: Lightweight poster images for the video cards
- `assets/maps/world-map.png`: Public-domain blank world map used by the homepage hero
- `.nojekyll`: Ensures GitHub Pages serves static files directly

## Local Preview

Open `index.html` directly in a browser, or run a local static server:

```bash
python3 -m http.server 8123
```

Then open:

```text
http://localhost:8123
```

## HEIC Conversion

Convert all HEIC/HEIF images in the main trip folder to JPG:

```bash
python3 convert_heic_to_jpg.py
```

Convert into a publishable assets folder:

```bash
python3 convert_heic_to_jpg.py Videoplusimage/China_Japen -o assets/trips/china-japan --overwrite
```

If HEIC support is missing, install:

```bash
python3 -m pip install --user pillow-heif pillow
```

## Deployment

This repository is intended for GitHub Pages using the `main` branch.

If you need to push updates:

```bash
git add .
git commit -m "Update portfolio website"
git push
```

GitHub Pages will rebuild the site automatically after the push.

## Notes

- The homepage is fully static and does not require a backend.
- The world map is based on Wikimedia Commons `Blank-Map-World.png`, released into the public domain.
- The CV file is served directly from the repository.
- Contact links currently include email, GitHub, and the downloadable CV.
- `Videoplusimage/` is ignored by Git. Move publishable media into `assets/` before referencing it from `index.html`.
