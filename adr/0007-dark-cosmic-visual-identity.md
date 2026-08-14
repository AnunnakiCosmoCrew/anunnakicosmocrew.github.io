# 7. Cosmic dark visual identity for the public site

- Status: Accepted
- Date: 2026-08-14
- Deciders: CosmoCrew

## Context

The public site shared its entire visual template — token values, layout
skeleton, hero formula — with the other sites in the family (luvita.tr and
umayconnect.org differ mainly by accent hue). Side by side, none of the three
communicated a distinct identity. CosmoCrew's naming (Anunnaki, Cosmo, orbit)
carries a ready-made cosmic identity the site did not use at all.

Two constraints shape the fix:

- `packages/design/tokens.css` is imported by **both** `apps/web` and
  `apps/metrics` — restyling the shared tokens would restyle the private
  metrics dashboard too.
- The site ships zero client-side JavaScript, and that is worth keeping.

## Decision

The public site (`apps/web`) gets a **cosmic dark treatment scoped to dark
mode**, dual-theme:

- Visitors with a dark OS preference see a deepened space background
  (`--c-bg: #0b0c11`), a CSS-only starfield and nebula wash (layered
  `radial-gradient`s on `body::before`/`body::after`), a strengthened two-hue
  hero glow, and product cards with a soft accent glow whose app icons act as
  the light sources.
- Light-mode visitors keep the existing light look unchanged.

Implementation: a new `apps/web/src/styles/theme-cosmic.css`, imported by
`global.css` immediately after the shared tokens, containing **only**
`@media (prefers-color-scheme: dark)` rules plus new cosmic tokens
(`--c-glow`, `--c-nebula-2`, `--shadow-glow`). The shared
`packages/design/tokens.css` is untouched and stays theme-neutral. Star
twinkle animates only under `prefers-reduced-motion: no-preference`.

## Consequences

- The dark-mode site is visually distinct from its sibling sites; light mode
  remains the calm baseline.
- `apps/metrics` is provably unaffected — it never imports `theme-cosmic.css`.
- The site remains zero-JS; the starfield costs two fixed-position
  pseudo-elements and no script.
- The brand impression depends on the visitor's OS color scheme; accepted as
  the price of keeping the familiar light variant.
- Follow-up (asset task, not in this change): real app screenshots for richer
  product cards — no screenshots exist in the repo today.

## Alternatives considered

- **Dark-only (ignore OS preference)** — strongest identity, but discards a
  designed, accessible light variant; rejected in favour of dual-theme.
- **Canvas/JS starfield** — would introduce the site's first client-side
  script for an effect CSS renders convincingly at this density; rejected.
- **Editing `packages/design/tokens.css` directly** — would leak the cosmic
  theme into the metrics dashboard; rejected.
