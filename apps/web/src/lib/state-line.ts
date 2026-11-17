/**
 * The state line under each app name (DESIGN.md section 7):
 *
 *   <state> · <where it runs> · improved <date>
 *
 * The date is shown as month and year only ("Oct 2026"), never the day; the
 * full date stays in the content file and the 120-day rule is computed from it.
 * It is shown only while it is at most 120 days old; after that the line
 * carries the state and platforms only, because a stale date costs as much
 * trust as a fresh one earns. The site is static and ships no script, so the
 * age is judged when the site is built, against `siteToday()`: the one place
 * the build reads "today" from. A test, or a rebuild of a past day, fixes it
 * with the SITE_TODAY environment variable (YYYY-MM-DD).
 *
 * This file is self-contained (no Astro imports) so `node --test` can run its
 * tests directly; see state-line.test.ts.
 */

export const MAX_DATE_AGE_DAYS = 120;

const DAY_MS = 24 * 60 * 60 * 1000;

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/** Display names for the content files' platform values, in display order. */
const PLATFORM_NAMES: ReadonlyArray<readonly [string, string]> = [
  ['iOS', 'iPhone'],
  ['iPadOS', 'iPad'],
  ['macOS', 'Mac'],
  ['Web', 'Web'],
];

/** Midnight UTC of a date's calendar day, so ages count whole days. */
function utcDay(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

/** Parse a strict YYYY-MM-DD string as a UTC calendar day. */
export function parseDay(value: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!m) throw new Error(`expected a date as YYYY-MM-DD, got "${value}"`);
  const date = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  if (date.toISOString().slice(0, 10) !== value.trim()) {
    throw new Error(`not a calendar date: "${value}"`);
  }
  return date;
}

/**
 * "Today" for the build: SITE_TODAY when it is set, otherwise the build
 * machine's current date (UTC). The only source of "today" in the site.
 */
export function siteToday(
  env: Record<string, string | undefined> = process.env,
  now: Date = new Date()
): Date {
  const fixed = env.SITE_TODAY;
  return fixed ? parseDay(fixed) : new Date(utcDay(now));
}

/** Whole days from `date` to `today`; negative when `date` is in the future. */
export function ageInDays(date: Date, today: Date): number {
  return Math.round((utcDay(today) - utcDay(date)) / DAY_MS);
}

/**
 * True while a release date may be shown: not in the future (a typo or a
 * release merged ahead of its day would publish a date that has not happened)
 * and at most 120 days old.
 */
export function isDateShown(date: Date, today: Date): boolean {
  const age = ageInDays(date, today);
  return age >= 0 && age <= MAX_DATE_AGE_DAYS;
}

/** "Oct 2026": month and year only, never the day. */
export function formatMonth(date: Date): string {
  return `${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/** "macOS, iOS and iPadOS" -> "iPhone, iPad, Mac". */
export function platformNames(platform: string): string {
  const parts = platform
    .split(/,\s*|\s+and\s+/)
    .map((p) => p.trim())
    .filter(Boolean);
  return PLATFORM_NAMES.filter(([key]) => parts.includes(key))
    .map(([, name]) => name)
    .join(', ');
}

export interface StateLineInput {
  status: string;
  platform: string;
  releasedOn?: Date;
}

export function stateLine(input: StateLineInput, today: Date): string {
  const parts = [input.status, platformNames(input.platform)];
  if (input.releasedOn && isDateShown(input.releasedOn, today)) {
    parts.push(`improved ${formatMonth(input.releasedOn)}`);
  }
  return parts.filter(Boolean).join(' · ');
}
