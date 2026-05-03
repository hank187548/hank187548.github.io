# Wei-Han Yu Life Log

This repository contains the source for Wei-Han Yu's personal website, published with GitHub Pages.

The main site is a life log for travel, friends, ocean days, lab moments, and personal memories. Professional material is still included, but it lives in one compact expandable work section.

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
- `script.js`: Scroll reveal animation and expandable work-panel navigation
- `CV1_Hank_quant.pdf`: Downloadable CV
- `assets/photos/`: Web-optimized travel, life, and lab photos used by the site
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
