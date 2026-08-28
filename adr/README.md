# Architecture Decision Records

Significant architecture decisions for CosmoCrew Web and the surrounding
public / private architecture, in a short [MADR](https://adr.github.io/madr/)-style format.

ADRs are immutable once **Accepted**. To change a decision, add a new ADR that
supersedes the old one and mark the old one **Superseded**.

| #                                                | Decision                                                       | Status            |
| ------------------------------------------------ | -------------------------------------------------------------- | ----------------- |
| [0001](0001-static-astro-site-on-github-pages.md) | Public site is an Astro static site on GitHub Pages            | Accepted; base path amended by 0006 |
| [0002](0002-no-private-data-in-the-public-site.md) | No private data or auth in the public site                     | Accepted          |
| [0003](0003-org-gated-metrics-dashboard.md)       | Org-gated metrics dashboard via Cloudflare Access + GitHub     | Accepted (planned); placement superseded by 0005 |
| [0004](0004-cards-link-to-app-sites.md)           | Product cards link to the apps' own sites; no detail pages     | Accepted          |
| [0005](0005-metrics-dashboard-in-monorepo.md)     | Metrics dashboard lives in this monorepo, deployed separately  | Accepted          |
| [0006](0006-serve-site-at-org-root.md)            | Public site served at the org root (repo renamed to the org Pages name) | Accepted; host amended by 0008 |
| [0007](0007-dark-cosmic-visual-identity.md)       | Cosmic dark visual identity, scoped to dark mode in apps/web   | Accepted          |
| [0008](0008-serve-the-site-at-cosmocrew-dev.md)   | Public site served at the custom domain `cosmocrew.dev`        | Accepted          |

> ADR 0003's security design (Cloudflare Access + pipeline) still stands. Per ADR
> 0005 the dashboard code lives here as `apps/metrics`, deployed *separately* to
> Cloudflare — never to GitHub Pages — so the ADR 0002 boundary is preserved.
