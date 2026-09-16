# nepsemyak.com.np

Website of **Nepsemyak Sewa Pvt. Ltd.** in English (`/`) and Nepali (`/ne/`), with an admin panel at `/admin`.
Built with [Astro](https://astro.build), hosted on Netlify, with data and sign-in on [Neon](https://neon.com)
(Postgres + Managed Better Auth).

## How it fits together

```text
Visitor ──► Netlify CDN ──► pre-built pages (about, services, team…)
                   │
                   └──► cached on-demand pages (home, news, careers, /api/notice.json, /media/*)
                              │   cache miss only
                              ▼
                        Netlify function (Astro) ──► Neon Postgres (content, images)

Staff ──► /admin ──► Netlify function ──► Neon Auth (email code sign-in) + Neon Postgres
                          │
                          └── on save: purge the matching cache tag (notice / news / jobs)
```

Public pages that read the database are cached at Netlify's edge until an admin saves a change, so normal
visits don't run a function or touch the database, and edits don't need a rebuild or deploy.

## Run locally

Requires Node.js 22.12+ and the [Neon CLI](https://neon.com/docs/cli/install) (`npm i -g neon`).

```bash
npm install
neon login                 # once
neon checkout production   # writes DATABASE_URL etc. to .env.local
npm run dev                # http://localhost:4321
```

`.env.local` also needs `NEON_AUTH_COOKIE_SECRET` (32+ random characters; must match the value on Netlify).

To use the admin panel locally without email codes, create `.env.development.local` with
`DEV_ADMIN_EMAIL=you@example.com` (an allowlisted email). This only works in `npm run dev` and is stripped from
production builds. Remove it to test the real sign-in flow.

Other commands:

```bash
npm run build        # production build (dist/ + .netlify/)
npm run check        # type-check
npm run db:status    # migrations applied on the branch in .env.local
npm run db:migrate   # apply pending db/migrations/*.sql
npm run db:add-admin -- someone@example.com editor "Their Name"
```

Try risky changes on a throwaway database branch first: `neon checkout dev --create` (auto-deleted after
7 days, see `neon.ts`), then `neon checkout production` to switch back.

## Where things live

| Path | What it holds |
|---|---|
| `src/data/` | Fixed page content in both languages: branches, statistics, services, about, FAQ, team, downloads |
| `src/lib/content.ts` | Database queries for notices, news, jobs, images and admin users |
| `src/lib/auth.ts`, `src/middleware.ts` | Sign-in proxy to Neon Auth and `/admin` protection |
| `src/lib/cache.ts` | Edge-cache headers and purge on save |
| `src/pages/admin/` | Admin panel pages |
| `src/i18n/` | Interface text and language helpers (Nepali digits, Bikram Sambat dates) |
| `src/views/` | One file per public page; each renders either language |
| `db/migrations/` | Database schema changes, applied in order |
| `neon.ts` | Neon services (Auth) and branch policy |
| `netlify.toml` | Build settings, redirects from old URLs, headers |

## Admin panel

- **Sign-in:** staff enter their email at `/admin/login` and receive a 6-digit code. Public sign-up is disabled
  in Neon Auth; only emails on the admin list can request codes.
- **Roles:** *editors* manage notices, news and jobs; *owners* can also add and remove people under **Users**.
- **Adding staff:** an owner adds them under **Users**. This creates their Neon Auth account (owners need the
  Neon Auth `admin` role: `neon neon-auth user set-role <user-id> --roles admin`).
- **Languages:** every field has English and Nepali boxes. If one is empty, visitors see the other.
- **Images:** resized in the browser to WebP (max 1600 px) and stored in Postgres (`media` table).

Content not yet in the admin panel (statistics, team, branches, services, FAQ) is edited in `src/data/`.

## Deploying

Every push to `master` triggers a Netlify production build. On the credit-based Free plan (300 credits/month)
**each production deploy costs 15 credits** and the site pauses if credits run out, so batch changes.
Content edits made in the admin panel don't need a deploy.

### Netlify settings

1. **Environment variables** (Site configuration → Environment variables), same values as `.env.local`:
   `DATABASE_URL`, `NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET`.
2. **HTTPS:** Domain management → HTTPS → Verify DNS configuration → Provision certificate, then *Force HTTPS*.
3. **Contact form:** Forms → Enable form detection, and add an email notification.

### Neon Auth settings (production branch)

- Trusted domains: `https://nepsemyak.com.np`, `https://www.nepsemyak.com.np` (`neon neon-auth domain list`).
- Sign-up disabled (`neon neon-auth config email-password get`).
- Emails currently use Neon's shared sender. Before inviting many staff, configure your own SMTP:
  `neon neon-auth config email-provider update …`.
