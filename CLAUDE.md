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
