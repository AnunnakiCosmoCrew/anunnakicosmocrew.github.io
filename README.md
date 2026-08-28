# CosmoCrew Web

The public website for **CosmoCrew**, an independent software company building
calm, capable products for focus and learning. It is a fast, minimal, static
site that showcases our live products and links to their App Store pages,
support, and docs.

- **Framework:** [Astro](https://astro.build) (static output, TypeScript)
- **Styling:** hand-written modern CSS with design tokens (no UI framework)
- **Hosting:** GitHub Pages, deployed via GitHub Actions
- **Canonical URL:** https://cosmocrew.dev/ (see `adr/0008`)

This repo is a small **npm-workspaces monorepo**:

| Workspace                  | What it is                                       | Deploys to                                |
| -------------------------- | ------------------------------------------------ | ----------------------------------------- |
| `apps/web`                 | the public website (this README's subject)       | GitHub Pages                              |
| `apps/metrics`             | private metrics dashboard (crew-only)            | Cloudflare Pages @ `metrics.cosmocrew.dev` |
| `services/metrics-api`     | gated Worker that serves the dashboard's data    | Cloudflare Workers                        |
| `packages/design`          | shared design tokens (single source of truth)    | —                                         |
| `packages/metrics-contract`| shared types for the metrics API payload         | —                                         |

**The public GitHub Pages build (`apps/web`) contains public content only** — no
private data and no authentication. The metrics dashboard lives in the same repo
but is built and deployed **separately** and is never part of the Pages build —
see [Private metrics dashboard](#private-metrics-dashboard) and `adr/0002`, `adr/0005`.

## Requirements

- **Node.js 24+** (an `.nvmrc` is included). With [nvm](https://github.com/nvm-sh/nvm):

  ```bash
  nvm use        # or: nvm install 24
  ```

## Commands

Run from the repo root (scripts fan out to the workspaces):

| Command                 | Action                                                             |
| ----------------------- | ----------------------------------------------------------------- |
| `npm install`           | Install all workspace dependencies                                |
| `npm run dev`           | Start the **public site** dev server at `http://localhost:4321/`  |
| `npm run dev:metrics`   | Start the **metrics dashboard** dev server (served from `/`)      |
| `npm run dev:api`       | Run the **metrics API** Worker locally (`wrangler dev`)           |
| `npm run build:web`     | Build the public site to `apps/web/dist/` (this is what ships)    |
| `npm run build:metrics` | Build the dashboard to `apps/metrics/dist/`                       |
| `npm run build`         | Build every workspace                                             |
| `npm run check`         | Type-check every workspace (`astro check` / `tsc`)               |
| `npm run deploy:api`    | Deploy the metrics API Worker (`wrangler deploy`)                 |

> Both apps are served from the root (`/`): the repo is the org Pages site
> (`anunnakicosmocrew.github.io`), published on the custom domain
> `cosmocrew.dev`, so there is no sub-path — see `adr/0006` and `adr/0008`.

## Project structure

```
apps/
├── web/                    # PUBLIC site → GitHub Pages
│   ├── src/
│   │   ├── components/      # Nav, Footer, Hero, ProductCard, Button, Prose, …
│   │   ├── layouts/         # BaseLayout (the page shell)
│   │   ├── lib/url.ts       # withBase() / absoluteUrl() — base-path-safe links
│   │   ├── content/products/# one Markdown file per product
│   │   ├── content.config.ts# content collection schemas
│   │   ├── pages/           # routes: home, products, about, support, 404
│   │   └── styles/          # global.css (imports the shared tokens)
│   └── public/              # favicon, og image, robots.txt, .nojekyll
└── metrics/                # PRIVATE dashboard → Cloudflare (deployed separately)
    └── src/
        ├── layouts/         # DashboardLayout (+ Chart.js hydrator)
        ├── components/       # StatCard, MetricChart, DashboardNav
        ├── lib/              # metrics.ts (SAMPLE data), source.ts (data seam), format.ts
        └── pages/            # overview + apps/[slug]
services/
└── metrics-api/            # PRIVATE Worker → Cloudflare (Access-gated data API)
    ├── wrangler.toml       # Worker config: KV binding, cron, Access vars
    └── src/                # index.ts (routes + scheduled), access.ts (JWT verify), sample.ts
packages/
├── design/                 # shared design tokens (tokens.css)
└── metrics-contract/       # shared types for the /api/metrics payload
adr/                        # architecture decision records
```

Significant architecture decisions are recorded in [`adr/`](adr/).

### Editing content

- **Products** live in `apps/web/src/content/products/*.md` — one file per product.
  Frontmatter is validated by the schema in `apps/web/src/content.config.ts`. Each
  product renders as a card (on Home and Products) whose body links to the
  app's website; the `links` block only renders the chips you provide.
- The Home and Products pages derive entirely from the products collection, so
  there is a single source of truth for the lineup.

### Linking rule (important)

Even though the site is served from the root today, **never hand-write internal
links as `/path`** — always build internal URLs with the helper, so the site
keeps working if the base path ever changes again:

```astro
---
import { withBase } from '../lib/url';
---
<a href={withBase('products')}>Products</a>   <!-- → /products/ -->
```

External links (App Store, GitHub, `mailto:`) are used as-is. This indirection
is also what makes the custom-domain switch below a one-line change.

## Deployment

The **public site** is deployed automatically with GitHub Actions
(`.github/workflows/deploy.yml`): on every push to `main` (or a manual run from
the **Actions** tab) it installs the workspace from the root lockfile, runs
`npm run build:web`, and publishes **only `apps/web/dist`** with
`actions/deploy-pages`. The metrics app is never built or uploaded here.

**One-time setup:** in the repository, go to **Settings → Pages → Build and
deployment → Source** and select **GitHub Actions**. After that, every push to
`main` deploys automatically.

The **metrics dashboard** (`apps/metrics`) deploys separately to Cloudflare Pages
— see [Private metrics dashboard](#private-metrics-dashboard).

## Switching to the custom domain

We own `cosmocrew.dev`. To serve the **public site** there instead of the GitHub
org URL, make these three changes:

1. In `apps/web/astro.config.mjs`, set:
   ```js
   site: 'https://cosmocrew.dev',
   ```
2. Add a file `apps/web/public/CNAME` containing exactly:
   ```
   cosmocrew.dev
   ```
3. Point DNS at GitHub Pages (a `CNAME`/`ALIAS` record for the apex domain) and
   set the custom domain under **Settings → Pages**. Update the `Sitemap:` URL in
   `apps/web/public/robots.txt` to the new domain.

No template or content edits are needed — every internal link uses `withBase()`,
which automatically resolves against the new base.

## Private metrics dashboard

Crew members view **private CosmoCrew metrics** (downloads, revenue, usage) in the
`apps/metrics` dashboard. It lives in this monorepo but is **built and deployed
entirely separately** from the public site, and must **never** become part of the
GitHub Pages build.

**The public GitHub Pages build (`apps/web`) is world-readable.** Anything in it —
HTML, JavaScript, JSON, Markdown, environment variables — ships to every visitor.
GitHub Pages cannot host private data or perform real authentication, and
client-side "checks" such as `if (isCrewMember) showMetrics()` are **not**
security. So the Pages artifact contains **zero** private metrics and **no**
gating logic — the CI job builds only `apps/web`.

The dashboard is served from a **separate, authenticated deployment** on its own
subdomain:

| Surface                 | What it serves                              | Deploy          | Auth                          |
| ----------------------- | ------------------------------------------- | --------------- | ----------------------------- |
| `cosmocrew.dev`         | public site (`apps/web`, product showcase)  | GitHub Pages    | None — public                 |
| `metrics.cosmocrew.dev` | private dashboard (`apps/metrics`)          | Cloudflare Pages | Cloudflare Access (GitHub org) |

**Authentication** (per `adr/0003`): the dashboard sits behind **Cloudflare
Access** with **GitHub login** as the identity provider, restricted to members of
the **`AnunnakiCosmoCrew`** organization, enforced at the edge before the app
loads. Secrets and API keys stay server-side; no private data reaches the browser
build.

### Data flow

```
App Store Connect ┐                    ┌ services/metrics-api (Worker)
Firebase / GA     ┼─ scheduled pull ─▶ │  • verifies the Cloudflare Access JWT
                  ┘                    │  • reads the aggregate from KV
                                       └────────────── /api/metrics ──────────▶ apps/metrics
                                                    (MetricsPayload contract)      (charts)
```

- **`packages/metrics-contract`** is the single shape both sides agree on
  (`MetricsPayload`). The dashboard reads its data through one seam,
  `apps/metrics/src/lib/source.ts` — sample data today, a runtime `fetch` of
  `/api/metrics` in production.
- **`services/metrics-api`** is a Cloudflare Worker. It independently verifies the
  Access JWT (`cf-access-jwt-assertion` → Cloudflare JWKS, `iss`/`aud` checked) as
  defense in depth, then serves the aggregate from a KV store. A cron-triggered
  `scheduled()` handler is where the App Store Connect / Firebase pull will land.
  All credentials are Worker **secrets** (`wrangler secret put …`), never committed.

### Status by phase (see `adr/0005`)

- **Phase 1 — done.** Dashboard UI renders **synthetic sample data**
  (`apps/metrics/src/lib/metrics.ts`); no real numbers in the repo. The Worker
  skeleton exists and its `/api/metrics` returns a labelled sample.
- **Phase 2 — external.** Deploy `apps/metrics` to Cloudflare Pages, point DNS at
  `metrics.cosmocrew.dev`, and add the Cloudflare Access policy. Set the Worker's
  `POLICY_AUD` / `TEAM_DOMAIN` and create the `METRICS_KV` namespace.
- **Phase 3 — the pipeline.** Implement `scheduled()` (App Store Connect + Firebase
  → aggregate → KV) and switch the dashboard's `source.ts` to fetch `/api/metrics`.

## License

© CosmoCrew. All rights reserved.
