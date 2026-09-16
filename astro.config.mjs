// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://nepsemyak.com.np',
  trailingSlash: 'ignore',

  i18n: {
    locales: ['en', 'ne'],
    defaultLocale: 'en',
    routing: { prefixDefaultLocale: false },
  },

  fonts: [
    {
      name: 'Mukta',
      cssVariable: '--font-body',
      provider: fontProviders.google(),
      weights: [400, 600],
      subsets: ['latin', 'devanagari'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
    {
      name: 'Poppins',
      cssVariable: '--font-display',
      provider: fontProviders.google(),
      weights: [600, 700],
      subsets: ['latin', 'devanagari'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
  ],

  integrations: [
    sitemap({
      i18n: { defaultLocale: 'en', locales: { en: 'en-NP', ne: 'ne-NP' } },
      filter: (page) => !page.includes('/contact/sent'),
    }),
  ],
});
