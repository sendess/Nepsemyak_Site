// @ts-check
import { defineConfig, envField, fontProviders } from 'astro/config';
import netlify from '@astrojs/netlify';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://nepsemyak.com.np',
  trailingSlash: 'ignore',

  // Pages are pre-rendered by default. Pages that read the database
  // (news, careers, home, admin) opt out with `export const prerender = false`.
  adapter: netlify({
    // Build-time image optimization only; on-demand pages use pre-sized files in public/.
    imageCDN: false,
    // No edge functions are used; skip the local Deno emulator.
    devFeatures: { images: false, environmentVariables: false, edgeFunctions: false },
  }),
  // Astro sessions are unused (sign-in is handled by Neon Auth), so no Netlify Blobs store is created.
  session: false,

  env: {
    schema: {
      DATABASE_URL: envField.string({ context: 'server', access: 'secret' }),
      NEON_AUTH_BASE_URL: envField.string({ context: 'server', access: 'secret' }),
      NEON_AUTH_COOKIE_SECRET: envField.string({ context: 'server', access: 'secret', min: 32 }),
      // Encrypts admin authenticator-app secrets stored in the database.
      ADMIN_SECRETS_KEY: envField.string({ context: 'server', access: 'secret', min: 32 }),
      // Read-only Cloudflare API token for visitor numbers on the admin dashboard (optional).
      CF_ANALYTICS_TOKEN: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },

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
      filter: (page) => !page.includes('/contact/sent') && !page.includes('/admin'),
    }),
  ],
});
