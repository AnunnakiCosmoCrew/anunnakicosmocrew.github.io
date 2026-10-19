/**
 * A product's `platform` is display text ("Web, iOS and iPadOS") that the
 * JSON-LD also reads, so its format is pinned here: known platform names
 * joined by ", " or " and ". The content schema rejects anything else at build
 * time, so a value this parser would misread never reaches the site.
 */
export const PLATFORMS = ['Web', 'macOS', 'iOS', 'iPadOS'] as const;

export function splitPlatforms(platform: string): string[] {
  return platform
    .split(/,\s*|\s+and\s+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function isKnownPlatformList(platform: string): boolean {
  const parts = splitPlatforms(platform);
  return (
    parts.length > 0 &&
    parts.every((p) => (PLATFORMS as readonly string[]).includes(p))
  );
}
