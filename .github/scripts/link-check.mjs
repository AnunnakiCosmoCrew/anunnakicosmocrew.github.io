// Link and metadata check over the built public site (apps/web/dist).
// Dependency-free (Node built-ins only). Usage:
//   node .github/scripts/link-check.mjs [--dist apps/web/dist] [--external]
// Internal checks always run: internal hrefs/srcs resolve to files in dist, and every
// page has a canonical URL, a description and a sitemap entry. --external also
// requests every external http(s) link (a, link, img, script, source; 6 at a time, one retry
// on 429/5xx) and expects 2xx/3xx. Non-http(s) schemes and redirect stubs are skipped.
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, resolve, relative, sep } from 'node:path';

const args = process.argv.slice(2);
const external = args.includes('--external');
const di = args.indexOf('--dist');
const dist = resolve(di >= 0 ? args[di + 1] : 'apps/web/dist');
if (!existsSync(dist)) {
  console.error(`dist not found: ${dist} (run npm run build:web first)`);
  process.exit(2);
}

const walk = (dir) =>
  readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
const files = walk(dist);
const pages = files.filter((f) => f.endsWith('.html'));
const rel = (f) => relative(dist, f).split(sep).join('/');
const errors = [];
const fail = (page, msg) => errors.push(`${page}: ${msg}`);

// Sitemap entries (paths), from sitemap-*.xml.
const sitemapPaths = new Set();
for (const f of files.filter((f) => /sitemap-\d+\.xml$/.test(f))) {
  for (const m of readFileSync(f, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)) {
    sitemapPaths.add(new URL(m[1]).pathname.replace(/\/+$/, '') || '/');
  }
}
if (!sitemapPaths.size) errors.push('sitemap: no entries found in dist/sitemap-*.xml');

const attr = (tag, name) => tag.match(new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, 'i'))?.[2] ?? tag.match(new RegExp(`\\s${name}\\s*=\\s*'([^']*)'`, 'i'))?.[1];

function resolveInternal(pathname) {
  let p;
  try {
    p = decodeURIComponent(pathname).replace(/^\/+/, '');
  } catch {
    return false;
  }
  return [p, p + '.html', join(p, 'index.html')].map((c) => join(dist, c)).some((c) => existsSync(c) && statSync(c).isFile());
}

// Product pages that live in other repos' Pages sites but share this host.
// They are not in dist, so they are checked over the network (--external).
const CROSS_REPO = ['/lexipower-support', '/slicefocus-docs'];
const isCrossRepo = (p) => CROSS_REPO.some((c) => p === c || p.startsWith(c + '/'));

const externals = new Map();
for (const page of pages) {
  const name = rel(page);
  if (name === '404.html') continue;
  const html = readFileSync(page, 'utf8');
  const url = new URL('/' + name.replace(/(^|\/)index\.html$/, '').replace(/\.html$/, ''), 'https://cosmocrew.dev');
  const pagePath = url.pathname.replace(/\/+$/, '') || '/';

  // Redirect stubs carry no page metadata; skip them entirely.
  if (/<meta\b[^>]*http-equiv\s*=\s*["']?refresh/i.test(html)) continue;
  const canonical = html.match(/<link\b[^>]*\brel=["']canonical["'][^>]*>/i);
  if (!canonical || !attr(canonical[0], 'href')) fail(name, 'missing canonical link');
  const desc = html.match(/<meta\b[^>]*\bname=["']description["'][^>]*>/i);
  if (!desc || !(attr(desc[0], 'content') ?? '').trim()) fail(name, 'missing meta description');
  if (!sitemapPaths.has(pagePath)) fail(name, `not in sitemap (${pagePath})`);

  for (const m of html.matchAll(/<(a|link|img|script|source)\b[^>]*>/gi)) {
    const tag = m[0];
    const ref = attr(tag, m[1].toLowerCase() === 'a' || m[1].toLowerCase() === 'link' ? 'href' : 'src');
    if (!ref || /^(mailto:|tel:|data:|javascript:|#)/i.test(ref)) continue;
    let u;
    try {
      u = new URL(ref, url);
    } catch {
      fail(name, `unparseable link ${ref}`);
      continue;
    }
    if (!/^https?:$/.test(u.protocol)) continue;
    if ((u.host !== 'cosmocrew.dev' || isCrossRepo(u.pathname))) {
      const key = u.href.split('#')[0];
      if (!externals.has(key)) externals.set(key, new Set());
      externals.get(key).add(name);
      continue;
    }
    if (!resolveInternal(u.pathname)) fail(name, `broken internal link ${ref}`);
  }
}

if (external) {
  const once = async (href, method) => {
    try {
      const r = await fetch(href, { method, redirect: 'follow', signal: AbortSignal.timeout(20000), headers: { 'user-agent': 'cosmocrew-link-check' } });
      r.body?.cancel();
      return r.status;
    } catch (e) {
      return String(e.cause?.code ?? e.message);
    }
  };
  const check = async (href) => {
    let last;
    for (let attempt = 0; attempt < 2; attempt++) {
      for (const method of ['HEAD', 'GET']) {
        last = await once(href, method);
        if (typeof last === 'number' && last < 400) return null;
      }
      // Retry once, after a pause, only on rate limiting / server errors / network errors.
      if (typeof last === 'number' && last < 500 && last !== 429) break;
      await new Promise((r) => setTimeout(r, 2000));
    }
    return typeof last === 'number' ? `HTTP ${last}` : last;
  };
  const list = [...externals.keys()];
  const results = new Array(list.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: 6 }, async () => {
      while (next < list.length) {
        const i = next++;
        results[i] = await check(list[i]);
      }
    }),
  );
  list.forEach((h, i) => results[i] && fail([...externals.get(h)].join(', '), `external link ${h} -> ${results[i]}`));
}

console.log(`Checked ${pages.length} pages, ${externals.size} external links${external ? '' : ' (not requested)'}.`);
if (errors.length) {
  console.error(`\n${errors.length} problem(s):\n` + errors.map((e) => ' - ' + e).join('\n'));
  process.exit(1);
}
console.log('OK');
