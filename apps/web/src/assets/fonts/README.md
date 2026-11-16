# Self-hosted fonts (adr/0009, DESIGN.md section 8)

Served from this repository by the site itself; no font CDN, no request to
another host. Both families are licensed under the SIL Open Font License 1.1;
the licence files beside the fonts were copied from each family's own
repository and checked there on 2026-11-16.

| File | Family | Subset | Source |
| --- | --- | --- | --- |
| `hanken-grotesk-latin-wght.woff2` | Hanken Grotesk (variable weight, 100–900) | Latin | Fontsource `@fontsource-variable/hanken-grotesk` 5.3.0, built from github.com/marcologous/hanken-grotesk |
| `hanken-grotesk-latin-ext-wght.woff2` | Hanken Grotesk (variable weight) | Latin Extended | as above |
| `IBMPlexMono-Regular-Latin1.woff2` | IBM Plex Mono Regular | Latin 1 | github.com/IBM/plex, `packages/plex-mono/fonts/split/woff2` (commit bc6a7e4) |
| `IBMPlexMono-Regular-Latin2.woff2` | IBM Plex Mono Regular | Latin 2 (Latin Extended) | as above |
| `IBMPlexMono-Regular-Latin3.woff2` | IBM Plex Mono Regular | Latin 3 (Latin Extended) | as above |
| `OFL-HankenGrotesk.txt` | licence | | github.com/marcologous/hanken-grotesk `OFL.txt` (commit eff37d1) |
| `OFL-IBMPlexMono.txt` | licence | | github.com/IBM/plex `packages/plex-mono/LICENSE.txt` |

IBM Plex carries the Reserved Font Name "Plex", so the mono files are IBM's own
subsets, unmodified, rather than a third-party re-subset. Hanken Grotesk has no
reserved name.

The `@font-face` rules and the family tokens live in `src/styles/fonts.css`.
To change the typeface (still an open point, DESIGN.md section 13), replace the
files and the `@font-face` rules there; components read only the tokens.
