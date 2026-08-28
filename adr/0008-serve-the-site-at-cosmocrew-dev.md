# 8. Serve the public site at the custom domain cosmocrew.dev

- Status: Accepted
- Date: 2026-08-28
- Deciders: CosmoCrew
- Amends: [0006](0006-serve-site-at-org-root.md) (canonical host detail)

## Context

ADR 0006 moved the site to the org Pages root,
`https://anunnakicosmocrew.github.io/`, and left the custom-domain move as the
obvious next step: "change `site:`, add `public/CNAME`, point DNS (base is
already `/`)."

`cosmocrew.dev` was registered and delegated to Cloudflare, but only ever used
for adjacent services — Email Routing (MX + SPF) and `metrics.cosmocrew.dev`
(ADR 0005). The zone had **no apex or `www` address record at all**, so
`cosmocrew.dev` did not resolve, and GitHub Pages had no custom domain set.
The public site was reachable only at the `github.io` host.

## Decision

Publish the public site at **`https://cosmocrew.dev`** as its canonical host.

Three pieces are required, and all three must agree:

1. **DNS (Cloudflare).** Apex `cosmocrew.dev` → GitHub Pages' four A records
   (`185.199.108–111.153`); `www` → CNAME `anunnakicosmocrew.github.io`.
   Both **DNS-only (grey cloud)**, not proxied.
2. **GitHub Pages.** Custom domain set to `cosmocrew.dev` on the repo, then
   Enforce HTTPS once the certificate is issued.
3. **This repo.** `site: 'https://cosmocrew.dev'` in
   `apps/web/astro.config.mjs`, and `apps/web/public/CNAME` containing the
   domain.

The CNAME lives in `public/` deliberately. The deploy uploads `apps/web/dist`
as a Pages *artifact* rather than publishing from a branch, so the file has to
ship inside the build output; otherwise every deploy replaces a `dist` with no
CNAME and silently clears the custom-domain setting.

Records are grey-clouded because Cloudflare's proxy sits in front of GitHub's
own certificate issuance: a proxied record prevents GitHub from completing the
Let's Encrypt challenge, so the domain never gets a certificate and "Enforce
HTTPS" stays greyed out. Proxying can be enabled later, after the certificate
exists, if the edge features are ever wanted.

## Consequences

- The canonical public URL is `https://cosmocrew.dev/`. Once the Pages
  custom domain is set, GitHub 301s `anunnakicosmocrew.github.io` to it and
  old links keep working — the redirect comes from that setting, so it holds
  only while the domain is configured, and the `github.io` host serves the
  site directly whenever it is not.
- `site:` feeds `@astrojs/sitemap` and the absolute canonical/OG URLs, so the
  sitemap and social cards now reference the custom domain. `robots.txt` is a
  static file and was updated by hand — it is not templated from `site`.
- Between this landing and DNS going live there is a window where the built
  sitemap and canonical/OG URLs name a host that does not yet resolve.
  Accepted rather than engineered around: gating `site` behind a deploy-time
  env var would give the canonical host two sources of truth and contradict
  the config-only simplicity this and ADR 0006 are built on. The window is
  bounded by one DNS change, and the fix if it is ever mis-sequenced is to
  unset the Pages custom domain, not to change code.
- **Project Pages sites in the org inherit this domain**: repos with no custom
  domain of their own are now served at `cosmocrew.dev/<repo>/`. The
  `lexipower-support` and `slicefocus-docs` links in the site were updated to
  match. Setting a custom domain on one of those repos would opt it out.
- The repo name stays locked to `anunnakicosmocrew.github.io` (ADR 0006) — it
  is what makes this the *org* Pages site, and the custom domain rides on top
  of that rather than replacing it.
- `base` stays `/` and the `withBase()` linking rule (ADR 0001) is untouched.
- Deleting `apps/web/public/CNAME` would clear the custom domain on the next
  deploy. It is load-bearing, not decoration.
- The apex uses A records rather than a CNAME because a CNAME at the apex needs
  Cloudflare's flattening; the A records are the arrangement GitHub documents
  and are easier to reason about when debugging resolution.
