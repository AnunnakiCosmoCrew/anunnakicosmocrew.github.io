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

The live public site follows [`DESIGN.md`](DESIGN.md) ("round 2", `adr/0009`,
which supersedes `adr/0007`). Read it before any visible change; the hard rules
above win over it.

For any visible UI change, use the `frontend-design` skill
(`.claude/skills/frontend-design/`) within these constraints.

- **Character:** a good library, somewhere in space: quiet, warm, unhurried.
  The library is a feeling, never a picture; space is the setting, not the
  subject. Nothing moves by itself, nothing asks for attention twice.
- **Colour:** one warm "lamp" accent (`--c-lamp`, also `--c-accent`) on a
  deep blue-grey (dark) or cool light grey (light). Light by default, dark
  through `prefers-color-scheme`; both are designed as equals and both stay AA.
  The values live in the web-only theme file `apps/web/src/styles/theme.css`,
  with measured contrast in its header. The lamp appears on link underlines,
  hover and focus only. No gradients, no glow, no starfield, no second accent.
  Literal hex belongs only in `theme.css` and `<meta name="theme-color">`.
- **Shared tokens:** `packages/design/tokens.css` is shared with `apps/metrics`;
  keep it theme-neutral and untouched by public-site work. `theme.css`
  overrides its colour names for `apps/web` only. Scale tokens (`--fs-*`,
  `--sp-*`, `--radius*`, `--maxw*`) still come from it.
- **Fonts:** self-hosted only (`adr/0009`). Hanken Grotesk (text) and IBM Plex
  Mono (state lines only, never running text), WOFF2 in
  `apps/web/src/assets/fonts/` with their OFL licences; `@font-face` rules and
  the family tokens (`--font-text`, `--font-code`) in
  `apps/web/src/styles/fonts.css`. The typeface is still open: change it there.
  No font CDN, no request to another host.
- **Home page:** header, the line and sentence, three app panels (icon, state
  line, sentence, a real screen cropped square, one text link), fair terms,
  contact, footer. At 1280 x 720 all three panels are visible. Copy that is a
  promise lives in `apps/web/src/lib/home-copy.ts` and ships only once the
  founder confirms it.
- **State line:** `<state> · <platforms> · improved <date>`, built by
  `apps/web/src/lib/state-line.ts` from each product's `releasedOn`; a date
  older than 120 days is hidden. "Today" comes from `siteToday()` only
  (`SITE_TODAY=YYYY-MM-DD` fixes it); tests run in the web workspace's `check`.
- **App pictures:** real screens only, stored in this repository, with alt
  text that says what the screen shows; no device frames, no stock or
  generated pictures. The app's own icon is its mark.
- **No script:** no theme switch; the only `<script>` is JSON-LD data.
- Styling is hand-written CSS; no UI framework.
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

## Accessibility

Follows [luvita-docs ADR 0011](https://github.com/AnunnakiCosmoCrew/luvita-docs/blob/main/adr/0011-front-end-platform-and-accessibility-baseline.md)
§5.1, the row for anything rendered in a browser: **WCAG 2.2 Level AA**, semantic
landmarks, a skip link, visible focus, `prefers-reduced-motion`,
`prefers-color-scheme`, `lang` on `<html>`.

- **Automated check:** the `Accessibility check` step in `.github/workflows/ci.yml`
  (shared `project-templates/actions/a11y-check`, axe-core on `apps/web/dist`) fails
  on any serious or critical violation. Exceptions go in `.a11y-allow.json` at the
  repo root, each with a reason; the file is reviewed in every PR that grows it.
- **Manual pass:** keyboard-only walk of the main tasks per release. Last recorded
  pass: none yet.
