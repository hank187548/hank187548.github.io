# Hank — Systems & Stories

Personal portfolio and visual archive published with GitHub Pages.

The homepage presents quantitative research, machine learning, computer vision, and a visual archive of travel and everyday life. Detailed journey pages remain available under `/travel/`.

## Production architecture

The public homepage uses a static-first structure:

```text
index.html           Complete semantic homepage content
site.css             Production styling and responsive layout
site.js              Optional progressive enhancement
assets/               Photos, maps, video, and trip media
travel/               Existing static journey pages
app/                  React + TypeScript source retained for development
```

The important content is already present in `index.html`. JavaScript adds the mobile menu, hero rotation, scroll progress, and atlas interactions, but the page remains readable when JavaScript or a third-party CDN is unavailable. This avoids a blank client-rendered root on mobile browsers and keeps GitHub Pages deployment simple.

## Design structure

1. Cinematic photo-first hero
2. Profile and work-life positioning
3. Selected research work
4. Editorial journey rail
5. Interactive world atlas
6. Contact

The map remains part of the identity, but works as a journey index rather than competing with the first-screen photography.

## Local preview

Run a static server from the repository root:

```bash
python3 -m http.server 8123
```

Then open `http://localhost:8123`.

## React source

The componentized React + TypeScript implementation remains under `app/` for future development and experiments:

```bash
cd app
npm install
npm run dev
npm run build
```

The repository-root `index.html`, `site.css`, and `site.js` are the canonical GitHub Pages production files. A GitHub Actions workflow validates that the React source still type-checks and builds, but it does not overwrite the static-first production shell.

## Deployment

GitHub Pages serves the `main` branch directly. Updating the root production files and pushing to `main` publishes the site without a separate runtime or backend.

## Notes

- Existing `/travel/.../` URLs and media paths are preserved.
- `CV1_Hank_quant.pdf` is served directly from the repository.
- The homepage supports mobile safe areas and `prefers-reduced-motion`.
- Legacy root `styles.css` and `script.js` are retained temporarily for rollback/reference; the V2 homepage does not load them.
