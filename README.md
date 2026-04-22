# Elijah Mathai Portfolio

Single-page portfolio site focused on full-stack engineering, AI-integrated workspaces, and architecture-driven case studies.

## Files

- `assets/` stores local media used by the portfolio, including the hero portrait and site logo.
- `index.html` contains the page structure and content.
- `styles.css` defines the visual system, layout, and dark-mode experience.
- `script.js` powers the command palette, project-aware semantic-search demo, and reveal animations.

## Run locally

Open `index.html` directly in a browser, or serve the folder with a simple local server:

```bash
python3 -m http.server 8000
```

## Deploy on GitHub Pages

This repo includes a GitHub Actions workflow at `.github/workflows/deploy-pages.yml`.

1. Push the latest commits to `main`.
2. In GitHub, open `Settings` -> `Pages`.
3. Set the source to `GitHub Actions`.
4. Wait for the `Deploy Portfolio to GitHub Pages` workflow to finish.

Project sites publish at:

```text
https://<github-username>.github.io/<repository-name>/
```

For this repository, the default URL should be:

```text
https://elijah-cod.github.io/my-portfolio/
```
