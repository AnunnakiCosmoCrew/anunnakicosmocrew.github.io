// Link and metadata check over the built public site (apps/web/dist).
// Dependency-free (Node built-ins only). Usage:
//   node .github/scripts/link-check.mjs [--dist apps/web/dist] [--external]
// Internal checks always run: internal hrefs/srcs resolve to files in dist, and every
// page has a canonical URL, a description and a sitemap entry. --external also
// requests every external http(s) link and expects 2xx/3xx.
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

  const canonical = html.match(/<link\b[^>]*\brel=["']canonical["'][^>]*>/i);
  if (!canonical || !attr(canonical[0], 'href')) fail(name, 'missing canonical link');
  const desc = html.match(/<meta\b[^>]*\bname=["']description["'][^>]*>/i);
  if (!desc || !(attr(desc[0], 'content') ?? '').trim()) fail(name, 'missing meta description');
  if (!html.includes('http-equiv="refresh"') && !sitemapPaths.has(pagePath)) fail(name, `not in sitemap (${pagePath})`);

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
    if (/^https?:$/.test(u.protocol) && (u.host !== 'cosmocrew.dev' || isCrossRepo(u.pathname))) {
      if (m[1].toLowerCase() === 'a') (externals.get(u.href.split('#')[0]) ?? externals.set(u.href.split('#')[0], new Set()).get(u.href.split('#')[0])).add(name);
      continue;
    }
    if (!resolveInternal(u.pathname)) fail(name, `broken internal link ${ref}`);
  }
}

if (external) {
  const check = async (href) => {
    for (const method of ['HEAD', 'GET']) {
      try {
        const r = await fetch(href, { method, redirect: 'follow', signal: AbortSignal.timeout(20000), headers: { 'user-agent': 'cosmocrew-link-check' } });
        if (r.status < 400) return null;
        if (method === 'GET') return `HTTP ${r.status}`;
      } catch (e) {
        if (method === 'GET') return String(e.cause?.code ?? e.message);
      }
    }
  };
  const list = [...externals.keys()];
  const results = await Promise.all(list.map(check));
  list.forEach((h, i) => results[i] && fail([...externals.get(h)].join(', '), `external link ${h} -> ${results[i]}`));
}

console.log(`Checked ${pages.length} pages, ${externals.size} external links${external ? '' : ' (not requested)'}.`);
if (errors.length) {
  console.error(`\n${errors.length} problem(s):\n` + errors.map((e) => ' - ' + e).join('\n'));
  process.exit(1);
}
console.log('OK');
