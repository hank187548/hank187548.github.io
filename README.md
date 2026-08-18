# Hank — Systems & Stories

Personal portfolio and visual archive published at `https://hank187548.github.io/`.

The site combines two sides of the same person: quantitative research / ML / computer vision, and a visual archive of travel and everyday life.

## Architecture

The homepage is a React application while the detailed travel chapters remain stable static pages.

```text
app/                 React + TypeScript homepage source
assets/              existing photos, maps, video and trip media
travel/              existing static journey pages
index.html           generated production homepage
app-assets/          generated Vite JS/CSS bundles
```

### Homepage stack

- React 19
- TypeScript
- Vite 8
- Tailwind CSS 4 via the Vite plugin
- Motion for React

The repository-root `index.html` and `app-assets/` are production build output and should not be edited by hand.

### Migration boundary

The existing `/travel/.../` URLs already contain substantial curated media and route-specific behavior. Keeping them independent lets the homepage evolve without risking regressions across every story page.

## Homepage structure

1. Cinematic photo-first hero
2. Profile / work-life positioning
3. Selected research work
4. Editorial journey rail
5. Interactive world atlas
6. Contact

The map remains part of the identity, but now acts as a journey index instead of competing with the first-screen photography.

## Development

```bash
cd app
npm install
npm run dev
```

Production validation:

```bash
npm run build
```

## Deployment

Pushing changes under `app/` to `main` triggers `.github/workflows/build-homepage.yml`. The workflow installs pinned dependencies, type-checks, runs the Vite production build, then commits generated `index.html` and `app-assets/` back to `main`. This preserves the existing branch-based GitHub Pages setup.

## Legacy files

The former root `styles.css` and `script.js` are intentionally left in place for now. The new homepage does not reference them; they can be removed after the React deployment has been stable and the travel pages have been checked for accidental dependencies.
