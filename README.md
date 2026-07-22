# Elijah Mathai Portfolio

A multi-page portfolio for a full-stack product engineer working across UI/UX, backend architecture, and practical AI systems.

Production: [elijah-mathai-portfolio.netlify.app](https://elijah-mathai-portfolio.netlify.app)

Article studio: [elijah-mathai-portfolio.netlify.app/admin/](https://elijah-mathai-portfolio.netlify.app/admin/)

## Publishing stack

- Eleventy generates the portfolio and article pages as fast static HTML.
- Decap CMS provides the visual article editor at `/admin/`.
- Markdown articles live in `content/articles/` and remain portable.
- Netlify builds every published change from the GitHub repository.
- The sitemap, canonical URLs, social metadata, and article schema are generated automatically.

## Manage articles

After the site is connected to Netlify and GitHub OAuth, visit `/admin/` to create, edit, preview, publish, or delete an article. Publishing through Decap commits the Markdown and uploaded cover image to GitHub; Netlify then rebuilds the public site.

Articles can also be edited directly in `content/articles/`. Front matter controls the title, URL, SEO description, category, cover image, publication date, and related project link.

## Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:8080`. For local CMS editing, run `npx decap-server` in a second terminal and visit `http://localhost:8080/admin/`.

## Deploy on Netlify

1. Import `Elijah-cod/my-portfolio` as a new Netlify project.
2. Netlify reads `netlify.toml`, runs `npm run build`, and publishes `_site`.
3. In GitHub, open `Settings` -> `Developer settings` -> `OAuth Apps`, then register an application with `https://api.netlify.com/auth/done` as its callback URL.
4. In Netlify, open `Project configuration` -> `Access & security` -> `OAuth`, install the GitHub provider, and enter the OAuth app's client ID and secret.
5. Set the production URL in Netlify; its build-provided `URL` variable updates all canonical and sitemap URLs automatically.
6. Open the deployed `/admin/` route and sign in with a GitHub account that has repository write access.

The CMS uses Decap's direct GitHub backend rather than Git Gateway. Keep repository access limited to trusted editors because publishing creates repository commits.
