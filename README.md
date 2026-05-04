# Hank Life Log

This repository contains the source for Hank's personal website, published with GitHub Pages.

The main site is organized around Hank as the central subject: travel,
diving, friends, lab life, everyday memories, and professional work. Larger
experiences are grouped into expandable story chapters with timelines, notes,
photos, and clips.

One current story chapter covers the route:

```text
Taiwan -> Hong Kong -> Tibet -> Chongqing -> Japan
```

That route is one chapter inside the life log, not the whole site. Professional
material is still included, but it lives in one compact expandable work section.

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
- `script.js`: Scroll reveal animation and expandable chapter navigation
- `convert_heic_to_jpg.py`: Helper script for converting HEIC/HEIF images to JPG
- `CV1_Hank_quant.pdf`: Downloadable CV
- `assets/photos/`: Web-optimized travel, life, and lab photos used by the site
- `assets/trips/china-japan/`: Media for the Taiwan, Hong Kong, Tibet, Chongqing, and Japan story chapter
- `assets/videos/`: Short MP4 clips used by the Motion Notes section
- `assets/video-posters/`: Lightweight poster images for the video cards
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
- The CV file is served directly from the repository.
- Contact links currently include email, GitHub, and the downloadable CV.
- `Videoplusimage/` is ignored by Git. Move publishable media into `assets/` before referencing it from `index.html`.
