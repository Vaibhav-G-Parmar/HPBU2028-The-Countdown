# HPBU 2028

Single-page site for **Hariprabodham Bhakti Utsav (HPBU 2028)**: fullscreen image slideshow with a countdown to the event date and fixed header/footer typography.

Built with **React 18** and **Vite 5**. No router - one `Hero` view.

## Prerequisites

- **Node.js 20** (matches Netlify and GitHub Actions; older LTS may work but isn’t what CI uses).

## Getting started

```bash
npm install
npm run dev
```

Opens the dev server locally (default Vite port).

## Scripts

| Command           | Purpose                          |
|-------------------|----------------------------------|
| `npm run dev`     | Local dev server with HMR       |
| `npm run build`   | Production build → `dist/`      |
| `npm run preview` | Serve `dist/` after a build     |

## Changing copy, date, or slides

Almost everything configurable without touching layout code lives in **`src/config/event.js`**:

| Export                      | Role |
|-----------------------------|------|
| `EVENT_DATE`                | Midnight target for the countdown (ISO string); footer text is formatted from this. |
| `EVENT_TITLE`               | Main headline. |
| `images`                    | Filenames under **`public/images/`** (paths are **not** included - match `public` exactly). |
| `SLIDE_INTERVAL_MS`         | Time between crossfades (ms). |
| `SLIDE_BACKGROUND_POSITION` | Passed through as CSS `background-position` for every slide (`cover`); tweak if cropping feels wrong on your assets. |

To add an image: drop the file in `public/images/`, append its **filename** (e.g. `my-slide.jpg`) to the `images` array, redeploy.

## Deploy

- **Netlify**: build `npm run build`, publish **`dist/`**. SPA fallback is configured in `netlify.toml` (`/*` → `/index.html` with 200).

- **CI**: `.github/workflows/ci.yml` runs `npm ci` and `npm run build` on pushes and PRs targeting **`main`**.

## Layout of the repo

```
src/
  App.jsx           # mounts Hero
  main.jsx          # React entry
  index.css         # global tokens / reset
  config/event.js   # event + slideshow configuration
  components/       # Hero, Countdown, Slideshow (+ CSS modules)
public/
  images/           # slideshow assets (referenced from config only)
```

## Notes

- **Environment**: `.env*` is gitignored - there's nothing here that expects secrets today; avoid committing API keys if you extend the stack later.

- **Reduced motion**: `prefers-reduced-motion` trims transition timing in global CSS where it applies.

The package is **`private`**; treat distribution and imagery rights separately from this repo tooling.
