# FuseMosaic

FuseMosaic is a responsive, SEO-ready fuse bead pattern library for [fusemosaic.com](https://fusemosaic.com). The first release is a free content archive with pattern listings, category pages, a Chinese-inspired collection, and reusable JPG/PDF pattern detail pages.

## Stack

- Next.js 16, TypeScript, App Router
- React Server Components by default
- vinext and the Cloudflare Vite plugin for Cloudflare Workers
- Wrangler 4 configuration in `wrangler.jsonc`
- Local TypeScript data in `data/patterns.ts` (no database or external API)
- Plain CSS design system with no paid dependencies

Cloudflare currently recommends vinext for new Next.js projects on Workers. OpenNext remains an option for existing applications with compatibility gaps.

## Local development

```bash
npm install
npm run dev
```

Open the local URL printed by vinext (normally `http://localhost:3000`).

Useful checks:

```bash
npm run typecheck
npm run lint
npm run build
npm run preview
```

## Cloudflare Workers Git deployment

Connect the GitHub repository to Workers Builds and use:

- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`

This is the recommended configuration: Workers Builds runs the vinext build once, then Wrangler deploys its generated Worker configuration. `npm run build` creates `.wrangler/deploy/config.json`, which redirects Wrangler from the source adapter entry in `wrangler.jsonc` to `dist/server/wrangler.json`. The generated configuration uses `dist/server/index.js` as the actual Worker entry point.

If the Cloudflare dashboard does not retain or run a separate Build command, use this fail-safe pair instead:

- Build command: leave empty
- Deploy command: `npm run deploy`

The `deploy` script deliberately runs `npm run build` before `wrangler deploy`; do not configure both a Build command and this fail-safe deploy command, because that would build twice.

Use `npm run deploy:dry-run` for a non-production local deployment check. No environment variables, databases, secrets, or paid bindings are required for this first version. The Cloudflare Root directory must be the repository root. After the first successful Worker deployment, add `fusemosaic.com` as a custom domain in the Cloudflare dashboard and point the domain's DNS to Cloudflare.

## Content model

Patterns live in `data/patterns.ts`. Each record contains routing, preview, JPG/PDF download paths, dimensions, palette, bead count, difficulty, status, and feature flags. Add final JPG/PDF files under `public/` and update one record to publish another pattern.

The current Celestial Deer example uses a lightweight WebP on listing pages and real JPG/PDF downloads on its detail page. Other entries are clearly structured mock content with CSS mosaic artwork, ready to be replaced by final assets.
