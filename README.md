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

Connect the GitHub repository to Workers Builds and use the vinext Cloudflare CLI:

- Build command: leave empty
- Deploy command: `npm run deploy`

`npm run deploy` runs `vinext build` and then the local `@vinext/cloudflare` CLI. That CLI validates the vinext Cloudflare setup and deploys the generated Worker configuration, rather than asking Wrangler to resolve the source adapter entry by itself. This makes the Git deployment self-contained when Workers Builds does not run a separate Build command.

The build generates `.wrangler/deploy/config.json`, which redirects deployment to the generated Worker configuration. The generated path is version-dependent; inspect the build output rather than hard-coding `dist/server`. Use `npm run deploy:dry-run` for a non-production local validation. No environment variables, databases, secrets, or paid bindings are required for this first version. The Cloudflare Root directory must be the repository root. After the first successful Worker deployment, add `fusemosaic.com` as a custom domain in the Cloudflare dashboard and point the domain's DNS to Cloudflare.

## Content model

Patterns live in `data/patterns.ts`. Each record contains routing, preview, JPG/PDF download paths, dimensions, palette, bead count, difficulty, status, and feature flags. Add final JPG/PDF files under `public/` and update one record to publish another pattern.

The current Taotie release appears in the Chinese Collection with its subject preview and real JPG/PDF downloads. Other entries are clearly structured mock content with CSS mosaic artwork, ready to be replaced by final assets.
