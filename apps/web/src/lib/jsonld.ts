/**
 * schema.org JSON-LD builders. Public facts only: no address, phone, registry
 * IDs or metrics. The parent company uses the short name (CLAUDE.md).
 */
import type { CollectionEntry } from 'astro:content';
import { absoluteUrl } from './url';

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

export function softwareApplicationsJsonLd(
  products: CollectionEntry<'products'>[]
): JsonLd {
  return {
    '@context': CONTEXT,
    '@type': 'ItemList',
    itemListElement: products.map(({ data }, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'SoftwareApplication',
        name: data.name,
        description: data.description,
        applicationCategory: data.category,
        operatingSystem: data.platform,
        url: data.links.website ?? data.links.appStore,
        publisher: { '@type': 'Organization', name: 'CosmoCrew', url: absoluteUrl() },
      },
    })),
  };
}
