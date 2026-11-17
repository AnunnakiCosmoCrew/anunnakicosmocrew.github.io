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
      /**
       * The home page sentence: one sentence that starts with who the app is
       * for (DESIGN.md section 10).
       */
      summary: z.string(),
      /**
       * A real screen of the app (DESIGN.md section 6), shown cropped square
       * from the top. `screenDark` is the dark-theme screen where the app has
       * both; it is used under `prefers-color-scheme: dark`. No stock or
       * generated pictures, no device frames.
       */
      screen: image().optional(),
      screenDark: image().optional(),
      /** What the screen shows; required with a screen. */
      screenAlt: z.string().optional(),
      /**
       * The day of the app's latest release, YYYY-MM-DD. Updated by the app's
       * release pull request, never typed in by hand for the site. Shown in the
       * state line while it is at most 120 days old (src/lib/state-line.ts).
       */
      releasedOn: z.coerce.date().optional(),
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
    })
    .refine((d) => !d.screen || Boolean(d.screenAlt), {
      message: 'a screen needs screenAlt saying what it shows',
      path: ['screenAlt'],
    })
    .refine((d) => !d.screenDark || Boolean(d.screen), {
      message: 'screenDark needs a light-theme screen as well',
      path: ['screen'],
    }),
});

export const collections = { products };
