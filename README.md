# Wei-Han Yu Portfolio Website

This repository contains the source for Wei-Han Yu's personal CV and portfolio website, published with GitHub Pages.

The site highlights quantitative research, machine learning, market data pipelines, algorithmic execution, and computer vision research experience. It also links directly to the PDF CV included in the repository.

## Live Site

```text
https://hank187548.github.io/
```

## Contents

- `index.html`: Main portfolio page
- `styles.css`: Responsive visual design and layout
- `script.js`: Scroll reveal animation
- `CV1_Hank_quant.pdf`: Downloadable CV
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
