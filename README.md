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

Staff ──► /admin ──► Netlify function ──► Neon Auth (email + password) ─► authenticator code ─► Neon Postgres
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

`.env.local` also needs `NEON_AUTH_COOKIE_SECRET` and `ADMIN_SECRETS_KEY` (each 32+ random characters; must match the
values on Netlify). `ADMIN_SECRETS_KEY` encrypts authenticator secrets — if it changes, every admin must set up their
authenticator again.

To use the admin panel locally without signing in, create `.env.development.local` with
`DEV_ADMIN_EMAIL=you@example.com` (an allowlisted email). This only works in `npm run dev` and is stripped from
production builds. Remove it to test the real sign-in flow.

Other commands:

```bash
npm run build        # production build (dist/ + .netlify/)
npm run check        # type-check
npm run db:status    # migrations applied on the branch in .env.local
npm run db:migrate   # apply pending db/migrations/*.sql
npm run db:add-admin -- someone@example.com editor "Their Name"
npm run db:reset-2fa -- someone@example.com   # lost phone and recovery codes
```

Try risky changes on a throwaway database branch first: `neon checkout dev --create` (auto-deleted after
7 days, see `neon.ts`), then `neon checkout production` to switch back.

## Where things live

| Path | What it holds |
|---|---|
| `src/data/` | Fixed page content in both languages: branches, statistics, services, about, FAQ, team, downloads |
| `src/lib/content.ts` | Database queries for notices, news, jobs, images and admin users |
| `src/lib/auth.ts`, `src/middleware.ts` | Sign-in proxy to Neon Auth, authenticator codes, lockouts and `/admin` protection |
| `src/lib/audit.ts` | Activity log (content changes are recorded by database triggers) |
| `src/lib/requests.ts`, `src/lib/contact-form.ts` | Contact form handling and the admin inbox |
| `src/lib/cache.ts` | Edge-cache headers and purge on save |
| `src/pages/admin/` | Admin panel pages |
| `src/i18n/` | Interface text and language helpers (Nepali digits, Bikram Sambat dates) |
| `src/views/` | One file per public page; each renders either language |
| `db/migrations/` | Database schema changes, applied in order |
| `neon.ts` | Neon services (Auth) and branch policy |
| `netlify.toml` | Build settings, redirects from old URLs, headers |

## Admin panel

- **Sign-in:** email + password at `/admin/login`, then a 6-digit code from an authenticator app (Google Authenticator).
  Everyone must set up the authenticator at their first sign-in and save 10 one-time recovery codes. The code is
  asked for again after 12 hours. Five wrong passwords or codes from one device pause sign-in for 15 minutes.
- **Passwords:** new admins (and anyone who forgot) use **Set or reset password** (`/admin/reset-password`): an emailed
  6-digit code lets them choose a password. The authenticator is still required afterwards, so email access alone
  isn't enough to get in. Change it under **My account**.
- **Roles:** one *master admin* (role `owner`, enforced by the database) and any number of *sub-admins* (`editor`).
  Sub-admins manage notices, statistics, news and jobs. The master also manages people under **Users** (add, reset
  2FA, sign out everywhere, remove) and sees **Activity**.
- **Activity log:** every create/edit/delete of notices, news, jobs, statistics and admins is written by database
  triggers with who, when, IP address, browser and the changed fields; sign-ins, failed attempts and password/2FA
  events are logged too. The `audit_log` table rejects updates and deletes.
- **Statistics:** every figure on the home, Impact and Careers pages lives in `stat_groups` / `stat_items`. Each group
  has an “as of” date shown to visitors (“*Data as of …”, Bikram Sambat on Nepali pages). Figures the home page needs
  are marked `is_core` and cannot be removed. Totals for workforce and vehicles are calculated.
- **Requests:** the contact form saves straight to the database (no Netlify Forms). Each message gets a reference
  code like `NS-7K4P2Q` shown to the sender, and staff work through them under **Requests** — status (new, in progress,
  resolved, spam), which office is handling it, and internal notes. A hidden field catches bots and one visitor may
  send five messages an hour.
- **Notices:** a notice can show as a banner, a pop-up, or both. Pop-ups have their own title, details and optional
  image, open once per visitor (again after the notice is edited), and can be previewed at `/#notice-preview=<id>`
  by a signed-in admin.
- **Adding staff:** the master adds them under **Users**. This creates their Neon Auth account (the master needs the
  Neon Auth `admin` role: `neon neon-auth user set-role <user-id> --roles admin`). They then set a password and
  authenticator as above.
- **Languages:** every field has English and Nepali boxes. If one is empty, visitors see the other.
- **Images:** resized in the browser to WebP (max 1600 px) and stored in Postgres (`media` table).

Content not yet in the admin panel (team, branches, services, FAQ) is edited in `src/data/`.

`package.json` intentionally has no `"type": "module"`: the Netlify Emails integration installed on the site
generates a CommonJS function that Netlify refuses to bundle otherwise.

## Deploying

Every push to `master` triggers a Netlify production build. On the credit-based Free plan (300 credits/month)
**each production deploy costs 15 credits** and the site pauses if credits run out, so batch changes.
Content edits made in the admin panel don't need a deploy.

### Netlify settings

1. **Environment variables** (Site configuration → Environment variables), same values as `.env.local`:
   `DATABASE_URL`, `NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET`, `ADMIN_SECRETS_KEY`.
2. **HTTPS:** Domain management → HTTPS → Verify DNS configuration → Provision certificate, then *Force HTTPS*.
3. **Contact form:** nothing to configure — messages go to the database, not Netlify Forms.

### Neon Auth settings (production branch)

- Trusted domains: `https://nepsemyak.com.np`, `https://www.nepsemyak.com.np` (`neon neon-auth domain list`).
- Sign-up disabled (`neon neon-auth config email-password get`).
- Emails currently use Neon's shared sender. Before inviting many staff, configure your own SMTP:
  `neon neon-auth config email-provider update …`.
