# nepsemyak.com.np

Website of **Nepsemyak Sewa Pvt. Ltd.** in English (`/`) and Nepali (`/ne/`).
Built with [Astro](https://astro.build) and deployed on Netlify.

## Run locally

Requires Node.js 22.12 or newer.

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # production build into dist/
npm run check    # type-check .astro and .ts files
```

## Where things live

| Path | What it holds |
|---|---|
| `src/data/` | Page content in both languages: branches, statistics, services, about, FAQ, team, downloads, news feeds |
| `src/i18n/ui.ts` | Interface text (menus, buttons, headings) in English and Nepali |
| `src/i18n/utils.ts` | Language helpers: Nepali digits, Bikram Sambat dates, localized links |
| `src/views/` | One file per page; each renders either language |
| `src/pages/` and `src/pages/ne/` | Thin route files that pick the view and language |
| `src/components/` | Header, footer, charts, cards and other shared pieces |
| `src/styles/global.css` | Design tokens (brand colors, type scale) and shared styles |
| `src/assets/images/` | Logo, chairman and team photos (optimized to WebP at build) |
| `public/` | Favicon, share image, robots.txt |
| `netlify.toml` | Build settings, redirects from old URLs, caching and security headers |

## Editing content (until the admin panel is ready)

Every piece of content has an `en` and an `ne` value, for example:

```ts
{ en: 'Waste segregation', ne: 'फोहोर छुट्याउने काम' }
```

- **Statistics:** `src/data/stats.ts` — update the numbers and the `asOf` date.
  Years of service and experience are calculated automatically.
- **Offices and phone numbers:** `src/data/site.ts`
- **Team:** `src/data/team.ts` (add the photo to `src/assets/images/team/`)
- **Downloads:** files are managed in the Google Drive folders listed in `src/data/resources.ts`.

## Deploying

Every push to `master` triggers a Netlify production build.

On Netlify's credit-based Free plan (300 credits/month) **each production deploy costs 15 credits**, and the
site is paused if credits run out. Batch changes into a few pushes a month. Deploy previews from pull
requests are free.

### One-time Netlify settings

1. **HTTPS:** Domain management → HTTPS → Verify DNS configuration → Provision certificate. Then enable *Force HTTPS*.
2. **Contact form:** Forms → Enable form detection, then add an email notification so queries reach the office inbox.

## Roadmap

- **Admin panel:** staff sign in to edit notices, news, jobs, statistics and team without touching code.
  Planned on Neon's free Postgres (separate from Netlify credits) with content cached at Netlify's edge.
- **Photos:** real photographs of crews, vehicles and the compost plant.
