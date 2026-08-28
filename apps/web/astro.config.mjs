// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// --- Deployment target -------------------------------------------------------
// Deployed as the GitHub *org* Pages site (repo: anunnakicosmocrew.github.io),
// served from the domain root on the custom domain:
//   https://cosmocrew.dev/
//
// `site` is the canonical host: it is what @astrojs/sitemap and the absolute
// OG/canonical URLs are built from, so it must match the domain the site is
// actually served on. `public/CNAME` is what tells GitHub Pages to serve the
// artifact on that domain — the deploy uploads `apps/web/dist`, so the CNAME
// has to ship *inside the build output* or each deploy clears the custom
// domain. See adr/0008.
//
// The redirect from `anunnakicosmocrew.github.io` is a property of the Pages
// custom-domain setting, not of this file: with the domain set, that host
// 301s here; without it, GitHub keeps serving the site there instead.
//
// Every internal link is built with `withBase()` (src/lib/url.ts), so the base
// path stays `/` and nothing else needs to change.
// -----------------------------------------------------------------------------
export default defineConfig({
  site: 'https://cosmocrew.dev',
  base: '/',
  trailingSlash: 'ignore',
  output: 'static',
  integrations: [sitemap()],
});
