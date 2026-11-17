// Run with: npm run test --workspace @cosmocrew/web (part of `check`).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fairTerms, hasFairTerms, type FairTerm } from './home-copy.ts';

const row = (confirmed: boolean): FairTerm => ({ id: 'x', topic: 'x', text: 'x', confirmed });

test('with no confirmed row, Fair terms and its link are hidden', () => {
  assert.equal(hasFairTerms([row(false), row(false)]), false);
  assert.equal(hasFairTerms([]), false);
});

test('one confirmed row brings Fair terms and its link back', () => {
  assert.equal(hasFairTerms([row(false), row(true)]), true);
});

test('the shipped rows match what the page shows today', () => {
  // None is confirmed yet (founder, 2026-11-17). When the first one is,
  // update this expectation in the same pull request.
  assert.equal(fairTerms.some((t) => t.confirmed), false);
  assert.equal(hasFairTerms(), false);
});
