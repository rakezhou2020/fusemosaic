# FuseMosaic administration v1 setup

Do these steps only after reviewing the migration. This repository deliberately does not name or create production resources.

1. Create one D1 database in Cloudflare. Add a Worker D1 binding named `PATTERNS_DB`, then add its real `database_name` and `database_id` to `wrangler.jsonc` with `migrations_dir: "migrations"`.
2. Create one private R2 bucket. Add a Worker R2 binding named `PATTERNS_BUCKET` and its real `bucket_name` to `wrangler.jsonc`.
3. Enable Cloudflare Images for the account and add the Worker Images binding `{ "images": { "binding": "IMAGES" } }`. Image processing uses this binding to contain the original image on a white 4:5 canvas and encode the required WebP/JPG outputs.
4. Add two Worker secrets, never variables: `ADMIN_PASSWORD` (a long unique administrator password) and `ADMIN_SESSION_SECRET` (at least 32 random characters). The application has no public registration route.
5. Apply the migrations using `npx wrangler d1 migrations apply <your-database-name> --remote`. They create categories, patterns and audit_log; the latest migration also publishes the original Taotie product in Chinese Style.
6. Regenerate bindings with `npx wrangler types`, run `npm run typecheck`, `npm run lint`, and `npm run build`, then deploy with the established `npm run deploy` command.

R2 keys use immutable pattern IDs, so changing a slug never moves files:

```text
patterns/{pattern-id}/original.{jpg|png|webp}
patterns/{pattern-id}/preview.webp
patterns/{pattern-id}/pattern.jpg
```

`/rake` uses a signed, HttpOnly, Secure, SameSite=Strict twelve-hour administrator session. Every `/api/rake/*` mutation checks this session on the server. Owner-created work marked `Original` is automatically approved and can be published directly. All other rights statuses still require approval. The public media endpoint only exposes preview and JPG files when a pattern is both `published` and `approved`; originals require an authenticated administrator request.
