# Elijah Mathai Portfolio

A multi-page portfolio for a full-stack product engineer working across UI/UX, backend architecture, and practical AI systems.

## Site structure

- `index.html` is the portfolio homepage and selected-work overview.
- `articles/index.html` is the public article archive.
- `articles/<slug>/index.html` contains each long-form article.
- `assets/` contains the logo and optimized portrait.
- `styles.css` defines the shared responsive design system.
- `script.js` powers mobile navigation, scroll reveals, the contact email handoff, and copyright year.
- `sitemap.xml` and `robots.txt` help search engines discover the public pages.

## Add an article

1. Duplicate one folder inside `articles/` and rename it with a short, lowercase URL slug.
2. Update the article page title, description, canonical URL, publish date, headings, and `BlogPosting` JSON-LD.
3. Add the article to `articles/index.html` and the homepage writing section.
4. Add its public URL and `lastmod` date to `sitemap.xml`.
5. Use one clear search topic per article, write an accurate description, and link to relevant projects or related articles.

## Run locally

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Deploy on GitHub Pages

The GitHub Actions workflow at `.github/workflows/deploy-pages.yml` deploys the static site.

1. Push the latest commits to `main`.
2. In GitHub, open `Settings` -> `Pages`.
3. Set the source to `GitHub Actions`.
4. Wait for `Deploy Portfolio to GitHub Pages` to finish.

Default URL: `https://elijah-cod.github.io/my-portfolio/`
