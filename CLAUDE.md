# cosmocrew-web

Public site for the **CosmoCrew** apps brand (SliceFocus, LexiPower, With
Handlebars), served from **cosmocrew.dev**, plus the org-gated metrics
dashboard. Astro static site on GitHub Pages. See README.md for the stack and
domain configuration, and `adr/` for the site-level decisions behind them.

CosmoCrew is a brand of Luvita Teknoloji Ltd. Şti. — the company, and the sole
copyright holder for everything here.

## Hard rules

- **The Luvita attribution line is mandatory.** The footer
  (`apps/web/src/components/Footer.astro`) must read
  `© {year} CosmoCrew — a brand of Luvita Teknoloji Ltd. Şti.`, with
  `Luvita Teknoloji Ltd. Şti.` as the **link text** and `https://luvita.tr/` as
  the target. Never remove it, never reduce it to a bare `luvita.tr` link
  sitting next to the sentence, and never route the attribution through another
  site — a reviewer who goes no further than the page they land on must still
  learn who owns the software. This is the defect that cost a vendor
  application; see `AnunnakiCosmoCrew/luvita-docs` ADR 0001, which carries the
  exact strings. Do not re-derive the wording.
- **Short form of the company name only.** `Luvita Teknoloji Ltd. Şti.`, never
  the full registered trade name — it contains "Enerji", and spreading it
  across software surfaces undoes the software-only positioning that
  `luvita-web/adr/0003` protects. The full name belongs in legal-identity
  blocks on luvita.tr.
- **`© CosmoCrew` leads; it is never replaced by `© Luvita`.** CosmoCrew is a
  deliberate consumer brand with its own indie, ambitious voice. The
  attribution clause is appended to it, and the site is not rebranded. Do not
  list Luvita's non-CosmoCrew products (Umay, Luvi Engine, Pelerin) here —
  that is luvita.tr's job, and Pelerin is in stealth.
- **Never hand-write internal links as `/path`.** Build them with `withBase()`
  from `apps/web/src/lib/url.ts` so the site keeps working if the base path
  changes again (README.md, "Linking rule"). External links are written as-is
  with `rel="noopener noreferrer" target="_blank"`.
- **No private data or authentication in the public site** (`adr/0002`). The
  metrics dashboard is separately gated (`adr/0003`, `adr/0005`).

## Design brief

For any visible UI change, use the `frontend-design` skill
(`.claude/skills/frontend-design/`) within these constraints. The tokens live in
`packages/design/tokens.css` (shared with `apps/metrics`, so keep them
theme-neutral); the public site's dark "cosmic" layer is
`apps/web/src/styles/theme-cosmic.css` (`adr/0007`).

- **Character:** calm, near-monochrome, capable, with a single restrained
  periwinkle accent (`--c-accent`). Indie and ambitious, not corporate. The
  only sanctioned secondary tint is the cosmic layer's `--c-nebula-2` (violet),
  used for glow washes; add no other accent colours.
- **Colour tokens:** accent `--c-accent` `#6e72d6` (dark `#8c90f0`), background
  `--c-bg` `#fafaf8` (dark `#0e0f13`, cosmic `#0b0c11`), surface `--c-surface`,
  ink `--c-ink` `#1a1b20`, border `--c-border`. Light by default, dark through
  `prefers-color-scheme`; both must stay AA-contrast. Use the tokens: literal hex
  belongs only in the token files and `<meta name="theme-color">`, never in
  components.
- **Fonts:** system stack only (`--font-sans`, `--font-mono`). No web fonts and
  no external resources (fonts, CDNs, trackers): the site makes no third-party
  requests.
- **Scale:** type `--fs-300`…`--fs-900` and `--fs-hero`, spacing `--sp-1`…`--sp-9`,
  radii `--radius-sm|--radius|--radius-lg`, widths `--maxw` / `--maxw-prose`.
  Styling is hand-written CSS; no UI framework.
- **Hard rules still apply:** the footer attribution, `withBase()` links, no
  private data. A UI change must not touch them.

## Brand and copy

Before writing or changing any copy, read
`project-templates/brand/BRAND.md` live from
<https://github.com/AnunnakiCosmoCrew/project-templates/blob/main/brand/BRAND.md>.
This file and `brand-rules.json` win on anything they cover; the
`brand-check` run is the enforced floor.

## Cloud preview notes

The `preview-check` skill (`.claude/skills/preview-check/`) runs after a visible
UI change. Start the server yourself in the background; `npm run dev` may be
refused in auto mode, so build and serve the output instead:

1. `npm run build:web`, then `npm run preview --workspace @cosmocrew/web -- --host 127.0.0.1`
   (Astro defaults to port 4321; read the actual port from the server log).
2. The site is served from `/` (no base path). Routes: `/`, `/products/`, `/about/`,
   `/support/`, `/privacy/`, and `/404.html` for the not-found page.
3. Stop the server when finished. The metrics dashboard (`apps/metrics`) is not
   part of the public preview.

The repo pins Node 24; if the session has Node 22, `npm run build:web` still
works for a preview check but report it.
