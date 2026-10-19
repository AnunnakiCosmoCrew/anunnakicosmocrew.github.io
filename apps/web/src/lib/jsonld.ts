/**
 * schema.org JSON-LD builders. Public facts only: no address, phone, registry
 * IDs or metrics. The parent company uses the short name (CLAUDE.md).
 */
import type { CollectionEntry } from 'astro:content';
import { absoluteUrl } from './url';
import { splitPlatforms } from './platforms';

const CONTEXT = 'https://schema.org';

export type JsonLd = Record<string, unknown>;

export function organizationJsonLd(): JsonLd {
  return {
    '@context': CONTEXT,
    '@type': 'Organization',
    name: 'CosmoCrew',
    url: absoluteUrl(),
    logo: absoluteUrl('favicon.svg'),
    parentOrganization: {
      '@type': 'Organization',
      name: 'Luvita Teknoloji Ltd. Şti.',
      url: 'https://luvita.tr/',
    },
    sameAs: ['https://github.com/AnunnakiCosmoCrew'],
  };
}

/** Display category -> Google/schema.org application category. */
const APPLICATION_CATEGORY: Record<string, string> = {
  Education: 'EducationalApplication',
  Music: 'MusicApplication',
  Productivity: 'BusinessApplication',
};

export function softwareApplicationsJsonLd(
  products: CollectionEntry<'products'>[]
): JsonLd {
  const items = products.flatMap(({ data }) => {
    const url = data.links.website ?? data.links.appStore;
    if (!url) return [];
    const platforms = splitPlatforms(data.platform);
    // A product on the web stays a WebApplication even when it also ships
    // native apps; the web itself is never an operatingSystem.
    const isWeb = platforms.includes('Web');
    const operatingSystems = platforms.filter((p) => p !== 'Web');
    return [
      {
        '@type': isWeb ? 'WebApplication' : 'SoftwareApplication',
        name: data.name,
        description: data.description,
        applicationCategory: APPLICATION_CATEGORY[data.category],
        ...(operatingSystems.length
          ? { operatingSystem: operatingSystems.join(', ') }
          : {}),
        url,
        publisher: { '@type': 'Organization', name: 'CosmoCrew', url: absoluteUrl() },
      },
    ];
  });
  return {
    '@context': CONTEXT,
    '@type': 'ItemList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item,
    })),
  };
}
