# Design brief for the cosmocrew.dev rebuild

Status: target for the rebuild, decided by the founder on 2026-11-16 ("round 2").
The live site still follows the "Design brief" section of `CLAUDE.md`,
`packages/design/tokens.css` and `adr/0007` until the rebuild lands. Small fixes
to the live site follow the live rules; the rebuild follows this file. Do not
mix the two.

Sources: the company constitution (`luvita-docs/strategy/constitution.md`,
"Brand identity", private) and `adr/0009`. Where this file and the hard rules in
`CLAUDE.md` disagree, the hard rules win.

This brief covers the public site (`apps/web`) only. The metrics dashboard
(`apps/metrics`) is not part of it and must not change.

## 1. Who reads the page, and what they should believe

Two readers: someone who already uses one of the apps and wonders who made it,
and a grant or programme evaluator.

After the first screen they should believe: **these apps are made by people who
use them every day, who will keep looking after them, and who will treat me
fairly.**

## 2. The feeling

A good library, somewhere in space: a quiet place to settle into and work. The
library is a feeling, never a picture. No shelves, no books, no planets, no
starfield. Space is the setting, not the subject.

- A place to settle into: nothing on the page asks for attention twice.
- Warm light, by night and by day. The dark theme is the library at night, lit
  like a reading lamp, never neon. The light theme is the same room by day and
  must give the same feeling. Neither is the lesser one.
- No hurry: no countdowns, no urgency, nothing that moves by itself.

## 3. What stays from the current rules

All hard rules in `CLAUDE.md` stay:

- The footer reads `© {year} CosmoCrew — a brand of Luvita Teknoloji Ltd. Şti.`,
  with the company name as the link to `https://luvita.tr/`. Exact string.
- Only the three CosmoCrew apps appear. Luvita's other products do not.
- App links go to each app's own site (`adr/0004`).
- No private data, no authentication, no request to any outside server.
- Internal links through `withBase()`.
- No script in the browser. So there is **no theme switch**: both themes ship
  and follow `prefers-color-scheme`.
- WCAG 2.2 Level AA, a skip link, visible focus, `prefers-reduced-motion`.

## 4. What changes

| | Live site | Rebuild |
| --- | --- | --- |
| Accent | periwinkle, violet glow in dark | one warm "lamp" colour |
| Dark theme | starfield, nebula wash, glowing cards | plain deep blue-grey, no effects |
| Type | system stack | one self-hosted family, plus a mono for state lines |
| Home page | hero formula, then cards | one line, then all three apps on the first screen |
| Proof of upkeep | none | a state and date line under each app name |
| App picture | icon | a real screen, with the app's own icon beside the name |

`adr/0009` records this and supersedes `adr/0007` when the rebuild lands. The
font change replaces "no web fonts" with "self-hosted fonts only".

## 5. Home page structure

The structure is the one a visitor expects. It is kept simple on purpose:
research on first impressions finds that familiar, simple pages are trusted
more at first sight than unusual ones. What is CosmoCrew's own sits in the
content, the apps' icons and the light, not in an unusual layout.

In order:

1. **Header.** Name left; Apps, Fair terms, Contact right.
2. **One line and one sentence**, side by side at desktop width: the line large
   and light (about 60 px, weight 300) on the left, the sentence on the right.
   Not centred. No buttons.
3. **The three apps**, side by side, each on a quiet panel. Top to bottom:
   - the app's icon (44 px) and its name;
   - the state line, in the mono face, muted;
   - one sentence that starts with who it is for;
   - a real screen, cropped square from the top;
   - one text link to the app's own site.
   At 1280 × 720 all three apps are visible without scrolling. On a phone they
   stack; the three names must still be reachable on the first screen.
4. **Fair terms.** The lock-screen picture beside the line "The app waits for
   you." and four plain rows: no hurry, trials, if you say no, reminders.
5. **Contact.** One sentence and the address.
6. **Footer.** The attribution line, and Privacy.

## 6. How an app is shown

- **Real screens only**: no stock pictures, no generated pictures, no device
  frames drawn around a screen. Use the screen that matches the theme where the
  app has both (With Handlebars does).
- **The app's own icon is its mark.** Do not draw new marks for the apps.
- Images live in the repository. Every image has alt text that says what the
  screen shows.

## 7. Proof of upkeep: the state line

Format: `<state> · <where it runs> · improved <date>`, for example
"Live · iPhone, iPad, Mac · improved 27 Oct 2026".

- The state and platforms come from each app's content file. The date comes
  from a field that the app's release process updates. Nobody types a date by
  hand.
- A date older than 120 days is not shown; the line then carries the state and
  platforms only. A stale date costs as much trust as a fresh one earns.
- No log of releases on the home page.

## 8. Type

- One family for headings and text, one mono for state lines. Round 2 uses
  Hanken Grotesk (light weight for the large lines) and IBM Plex Mono.
- **Open:** the final typeface. Build so the family is one token.
- Font files are self-hosted WOFF2 in the repository, subset to Latin and Latin
  Extended, with `font-display: swap` and a system fallback of similar width.
  Confirm each font's licence in its own repository before adding the files.
- Mono is never used for running text.
- Light weights on a dark background need care: the large lines may be weight
  300, running text is 400 or heavier.
- Text lines stay between 55 and 75 characters. Text survives 200 % zoom.

## 9. Colour

Light is the default; dark follows the system.

| Token | Dark | Light |
| --- | --- | --- |
| Background | `#0E1217` | `#ECEEF0` |
| Ink | `#E7E4DC` | `#131920` |
| Soft text | `#C4C7CC` | `#3A424C` |
| Muted text | `#A9AEB5` | `#56606B` |
| Rule | `#2A313A` | `#C9CED4` |
| Panel | `#161B22` | `#FAFAF8` |
| Lamp (the one accent) | `#E9C9A0` | `#75501A` |

Measured contrast: ink on background 14.8:1 (dark) and 15.2:1 (light); lamp on
background 11.9:1 and 6.2:1. Re-measure soft and muted text, on background and
on panel, when the tokens are written; body text must reach 4.5:1.

The new values belong in a web-only theme file. `packages/design/tokens.css` is
shared with the metrics dashboard and stays theme-neutral.

The lamp colour appears on link underlines and on hover. No gradients, no glow,
no starfield, no second accent.

## 10. Voice and copy

Warm, plain, unhurried. "We" is the crew, who are also users. "Resilient
ambition" describes the user first.

The site does not describe how the apps are built. No copy claims "hand-made",
"no AI" or a team that does not exist. Read `project-templates/brand/BRAND.md`
live before changing copy.

### Home page copy (English; the site is English only today)

| Place | Text |
| --- | --- |
| Line | Sit down. The rest can wait. |
| Sentence | Three quiet apps for people who keep working on themselves. Made by a crew that uses them every day. |
| SliceFocus | For people who open their phone without deciding to. Plan the day as one circle and keep the distracting apps closed while you focus. |
| LexiPower | For people learning a language one word at a time. A notebook that brings each word back just before you would forget it. |
| With Handlebars | For people learning the guitar neck. Every chord and scale tone, across every fret, in any tuning. |
| Links | Open SliceFocus / Open LexiPower / Open With Handlebars |
| Fair terms, line | The app waits for you. |
| No hurry | No countdowns and no streaks to protect. |
| Trials | For any app with a paid plan, a trial starts without a card and nothing is charged unless you say yes. |
| If you say no | The basic features stay yours. |
| Reminders | A reminder never interrupts your work. |
| Contact | If something gets in your way, it has probably got in ours too. Tell us and we will fix it. |

The fair-terms rows are promises. Each must be true of every app it covers on
the day the page ships; a row that is not yet true is left out.

## 11. Template signs to avoid

A page fails review if it shows any of these. The first four are the defaults
that page generators are documented to fall back on; the rest are our own list.

Look:

- A default face as the brand type: Inter, Roboto, Arial, Open Sans, Lato, or
  the bare system stack. Also the fonts that became the fashionable way out of
  those.
- Purple or violet gradients, gradient text, glow, glass panels, floating blobs.
- A centred opening block with a slogan, a sub-line and two buttons.
- A grid of boxes, each with an icon, a heading and two lines and nothing real
  in it. (The app panels are allowed because each carries a real screen.)
- A small coloured or upper-cased label above a heading.
- Pill badges; soft shadows as the default container.
- Picture and text rows that alternate left and right down the page.
- An arrow after link text; emoji used as icons.
- Elements that fade or slide in while scrolling; anything that twinkles.
- Download counters, star ratings or testimonials that nobody measured.
- Stock or generated illustrations; device frames around screens.

Words:

- "Seamless", "empower", "unlock", "elevate", "supercharge", "next-level",
  "AI-powered" used as decoration.
- Three-beat slogans ("Focus. Learn. Play.").
- "Get started" and "Learn more" as link text. A link says what happens.
- Any sentence that would be equally true on another app maker's site.

## 12. Before the rebuild is accepted

- `npm run build:web` passes; the brand check and the accessibility check pass.
- Zero failed requests, zero requests to another host, no `<script>` in the
  public site.
- Keyboard walk of the home page; visible focus everywhere.
- Both themes checked at 390 px, 768 px and 1280 px.
- The date lines are filled from data, and the 120-day rule is tested with an
  old date.
- The metrics dashboard looks exactly as before.
- **The blind check.** Two or three people who do not know the brand see the
  home page for five seconds, without the founder in the room, and answer:
  "What is this?", "Who do you think made this page, and what makes you say
  that?", "Which parts have you seen somewhere before?" If they name it a
  template, the page goes back to design.

## 13. Open points

1. The final typeface.
2. Where each app's release date comes from, and who updates it.
3. Whether every fair-terms row is true of all three apps today.
4. The other pages (products, about, support, privacy) follow these rules;
   their structure is not designed yet.
5. A Turkish version is not planned here.
