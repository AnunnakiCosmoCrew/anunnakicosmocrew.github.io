// Run with: npm run test --workspace @cosmocrew/web (part of `check`).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ageInDays,
  formatDay,
  isDateShown,
  parseDay,
  platformNames,
  siteToday,
  stateLine,
} from './state-line.ts';

const TODAY = '2026-11-16';

function daysBefore(today: string, days: number): Date {
  const d = parseDay(today);
  return new Date(d.getTime() - days * 24 * 60 * 60 * 1000);
}

test('a date 119 days old is shown', () => {
  const today = siteToday({ SITE_TODAY: TODAY });
  const released = daysBefore(TODAY, 119);
  assert.equal(ageInDays(released, today), 119);
  assert.equal(
    stateLine({ status: 'Live', platform: 'macOS, iOS and iPadOS', releasedOn: released }, today),
    `Live · iPhone, iPad, Mac · improved ${formatDay(released)}`
  );
});

test('a date 121 days old is hidden', () => {
  const today = siteToday({ SITE_TODAY: TODAY });
  const released = daysBefore(TODAY, 121);
  assert.equal(ageInDays(released, today), 121);
  assert.equal(
    stateLine({ status: 'Live', platform: 'macOS, iOS and iPadOS', releasedOn: released }, today),
    'Live · iPhone, iPad, Mac'
  );
});

test('the limit is 120 days inclusive', () => {
  const today = parseDay(TODAY);
  assert.equal(isDateShown(daysBefore(TODAY, 120), today), true);
  assert.equal(isDateShown(daysBefore(TODAY, 0), today), true);
});

test('no release date gives state and platforms only', () => {
  assert.equal(
    stateLine({ status: 'Live', platform: 'Web, iOS and iPadOS' }, parseDay(TODAY)),
    'Live · iPhone, iPad, Web'
  );
});

test('the design example formats as written', () => {
  assert.equal(
    stateLine(
      { status: 'Live', platform: 'macOS, iOS and iPadOS', releasedOn: parseDay('2026-10-27') },
      parseDay(TODAY)
    ),
    'Live · iPhone, iPad, Mac · improved 27 Oct 2026'
  );
});

test('siteToday reads SITE_TODAY, else the current UTC day', () => {
  assert.equal(siteToday({ SITE_TODAY: TODAY }).toISOString(), '2026-11-16T00:00:00.000Z');
  assert.equal(
    siteToday({}, new Date('2027-01-02T23:59:00Z')).toISOString(),
    '2027-01-02T00:00:00.000Z'
  );
  assert.throws(() => siteToday({ SITE_TODAY: '2026-02-30' }));
  assert.throws(() => siteToday({ SITE_TODAY: 'tomorrow' }));
});

test('platform names', () => {
  assert.equal(platformNames('iOS'), 'iPhone');
  assert.equal(platformNames('macOS, iOS and iPadOS'), 'iPhone, iPad, Mac');
});
