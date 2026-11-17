/**
 * Home page copy that is a promise or a claim about the makers (DESIGN.md
 * section 10). Each item ships only once the founder has confirmed it is true
 * of all three apps on the day the page ships (issue 51, "Decisions that are
 * the founder's"). Until then:
 *
 * - a fair-terms row with `confirmed: false` is left out of the page, and
 *   while no row is confirmed the whole section and its header link are
 *   hidden (founder, 2026-11-17: a section with no rows reads as an empty
 *   promise). Confirming the first row brings both back;
 * - the sentence uses the fallback wording.
 *
 * To ship a row, set its `confirmed` to true in the pull request that records
 * the founder's confirmation.
 */

export interface FairTerm {
  id: string;
  /** Short name for review; not shown on the page. */
  topic: string;
  text: string;
  confirmed: boolean;
}

/**
 * True once at least one row is confirmed: the section and its header link
 * show. Both call this one function, so they cannot drift apart.
 */
export function hasFairTerms(rows: FairTerm[] = fairTerms): boolean {
  return rows.some((t) => t.confirmed);
}

export const fairTerms: FairTerm[] = [
  {
    id: 'no-hurry',
    topic: 'No hurry',
    text: 'No countdowns and no streaks to protect.',
    confirmed: false,
  },
  {
    id: 'trials',
    topic: 'Trials',
    text: 'For any app with a paid plan, a trial starts without a card and nothing is charged unless you say yes.',
    confirmed: false,
  },
  {
    id: 'if-you-say-no',
    topic: 'If you say no',
    text: 'The basic features stay yours.',
    confirmed: false,
  },
  {
    id: 'reminders',
    topic: 'Reminders',
    text: 'A reminder never interrupts your work.',
    confirmed: false,
  },
];

export const line = 'Sit down. The rest can wait.';

export const sentence =
  'Three quiet apps for people who keep working on themselves.';

export const fairTermsLine = 'The app waits for you.';

export const contactSentence =
  'If something gets in your way, it has probably got in ours too. Tell us and we will fix it.';

export const contactAddress = 'contact@cosmocrew.dev';
