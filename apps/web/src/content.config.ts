import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { PLATFORMS, isKnownPlatformList } from './lib/platforms';

/**
 * Products shown on the public site. Single source of truth — the Home and
 * Products pages both derive from this collection, so the lineup can never
 * drift to a product that does not exist here.
 *
 * `metricsEnabled` is part of the schema (per the data contract) but is never
 * rendered and carries no data. No private metrics live anywhere in this repo.
 */
const products = defineCollection({
  loader: glob({ base: './src/content/products', pattern: '**/*.md' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      slug: z.string(),
      tagline: z.string(),
      description: z.string(),
      status: z.enum(['Live', 'Beta', 'Archived']).default('Live'),
      category: z.string(),
      platform: z.string().refine(isKnownPlatformList, {
        message: `platform must be ${PLATFORMS.join(' / ')} joined by ", " or " and "`,
      }),
      icon: image(),
      links: z
        .object({
          website: z.url().optional(),
          appStore: z.url().optional(),
          github: z.url().optional(),
          support: z.url().optional(),
          docs: z.url().optional(),
        })
        .default({}),
      featured: z.boolean().default(false),
      metricsEnabled: z.boolean().default(false),
      order: z.number().default(0),
    }),
});

export const collections = { products };
