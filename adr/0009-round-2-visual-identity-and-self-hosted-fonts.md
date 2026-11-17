# 9. Round 2 visual identity for the public site, and self-hosted fonts

- Status: Accepted; supersedes 0007 (the rebuild landed with issue 51)
- Date: 2026-11-16
- Deciders: the founder

## Context

`adr/0007` gave the public site a "cosmic" dark layer: a starfield, a nebula
wash and glowing cards. It made the site differ from its sibling sites, but the
founder judged the result generic all the same: a hero formula over a card
grid, a periwinkle accent with violet glow, and system fonts.

The company constitution (Brand identity, locked 2026-11-16) sets what the site
must do instead. The reader should believe the apps are made by people who use
them every day, who will keep looking after them, and who treat users fairly.
The feeling is a good library in space: a quiet place to settle into, where the
library is never drawn and space is the setting, not the subject.

Two rounds of mock-ups followed. Before the second, the choices were checked
against published research and established usability practice:

- Simple pages with the structure visitors expect are trusted more at first
  sight than unusual ones.
- Most attention stays on the first screen.
- Visible recency raises credibility, and visible staleness lowers it by about
  as much.
- Dark text on a light background reads better than the reverse, more so at
  small sizes.

Two existing rules were in the way. "System fonts only" makes the type differ
on every device. And the constitution first asked for a theme switch, which
needs a script that the site does not ship.

## Decision

1. The rebuild of `apps/web` follows `DESIGN.md` ("round 2"): one line, then
   all three apps on the first screen with a real screen each, a state and date
   line under each app name, deep blue-grey with one warm "lamp" accent, light
   by default and dark by system setting, both themes designed as equals.
2. The starfield, nebula wash and glow from `adr/0007` are removed in the
   rebuild.
3. **Fonts are self-hosted.** "No web fonts" becomes "self-hosted fonts only":
   font files live in the repository and are served by the site. No request
   leaves for another host.
4. **No theme switch.** Both themes follow `prefers-color-scheme`; the site
   stays script-free.
5. The new values live in a web-only theme file. `packages/design/tokens.css`
   stays theme-neutral, as `adr/0007` already required.

## Consequences

- `adr/0007` stays in force for the live site and is marked Superseded by the
  pull request that ships the rebuild.
- The site gains font files to maintain and a few tens of kilobytes on first
  load.
- Each app's content file needs a release date that the app's release process
  updates; a date older than 120 days is hidden. Because the site is static
  and script-free, that rule needs a scheduled daily build and deploy to hold
  between merges.
- The metrics dashboard must be shown unchanged by the rebuild.
- A visitor cannot override the theme on the page. Accepted.

## Alternatives considered

- **Keep the cosmic layer and tune it.** Space as the subject is what the
  constitution rules out. Rejected.
- **Keep system fonts.** The type cannot be owned and differs per device.
  Rejected by the founder.
- **A font CDN.** Breaks the no-external-request rule. Rejected.
- **A theme switch with a small script.** The site's first script, for little
  gain. Rejected by the founder.
