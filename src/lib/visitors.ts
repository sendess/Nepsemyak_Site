// Visitor numbers for the admin dashboard, read from Cloudflare Web Analytics' GraphQL API.
// "Page views" = pages loaded; "visits" = page views that started from another website or a
// typed address (Cloudflare's definition — close to "sessions"). Figures are Cloudflare's
// sampled estimates, so small numbers may be rounded.
import { CF_ANALYTICS_TOKEN } from 'astro:env/server';
import { analytics, analyticsConfigured } from '~/data/analytics';
import type { Share } from './dashboard';

export type DayCount = { date: string; visits: number; views: number };

export type VisitorFigures = {
  days: DayCount[];
  visits7: number;
  visitsPrev7: number;
  views7: number;
  visits30: number;
  views30: number;
  pages: Share[];
  referrers: Share[];
  devices: Share[];
  countries: Share[];
};

export type VisitorResult = { status: 'off' } | { status: 'error'; message: string } | { status: 'ok'; data: VisitorFigures };

const DAYS = 30;
const CACHE_MS = 10 * 60_000;
let cache: { at: number; result: VisitorResult } | null = null;

type Group = { count?: number; sum?: { visits?: number }; dimensions?: Record<string, string> };

const OWN_HOSTS = new Set(['nepsemyak.com.np', 'www.nepsemyak.com.np']);

/** One small query per breakdown, so a problem with one doesn't hide the others. Bots are left out, as in Cloudflare's own view. */
function queries(since: string, until: string, excludeBots = true) {
  const filter = `{ siteTag: ${JSON.stringify(analytics.siteTag)},${excludeBots ? ' bot: 0,' : ''} datetime_geq: ${JSON.stringify(since)}, datetime_leq: ${JSON.stringify(until)} }`;
  const wrap = (body: string) => `{ viewer { accounts(filter: { accountTag: ${JSON.stringify(analytics.accountId)} }) { rows: ${body} } } }`;
  const groups = (limit: number, order: string, fields: string) =>
    wrap(`rumPageloadEventsAdaptiveGroups(limit: ${limit}, filter: ${filter}, orderBy: [${order}]) { ${fields} }`);
  return {
    daily: groups(40, 'date_ASC', 'count sum { visits } dimensions { date }'),
    pages: groups(8, 'count_DESC', 'count dimensions { requestPath }'),
    referrers: groups(12, 'count_DESC', 'count sum { visits } dimensions { refererHost }'),
    devices: groups(5, 'count_DESC', 'count dimensions { deviceType }'),
    countries: groups(6, 'count_DESC', 'count dimensions { countryName }'),
  };
}

type Answer = { rows: Group[] } | { error: string };

async function ask(query: string): Promise<Answer> {
  let res: Response;
  try {
    res = await fetch('https://api.cloudflare.com/client/v4/graphql', {
      method: 'POST',
      headers: { authorization: `Bearer ${CF_ANALYTICS_TOKEN}`, 'content-type': 'application/json' },
      body: JSON.stringify({ query }),
      signal: AbortSignal.timeout(6000),
    });
  } catch (err) {
    return { error: err instanceof Error && err.name === 'TimeoutError' ? 'Cloudflare took too long to answer' : 'Could not reach Cloudflare' };
  }
  const body = (await res.json().catch(() => null)) as {
    data?: { viewer?: { accounts?: { rows?: Group[] }[] } };
    errors?: { message: string }[] | null;
  } | null;
  const rows = body?.data?.viewer?.accounts?.[0]?.rows;
  if (!res.ok || body?.errors?.length || !rows) return { error: body?.errors?.[0]?.message ?? `Cloudflare answered ${res.status}` };
  return { rows };
}

/** "2026-09-21" for each of the last `DAYS` days (UTC, as Cloudflare reports them). */
function lastDays(): string[] {
  const today = new Date();
  return Array.from({ length: DAYS }, (_, i) => new Date(today.getTime() - (DAYS - 1 - i) * 86_400_000).toISOString().slice(0, 10));
}

const DEVICE: Record<string, string> = { desktop: 'Computer', mobile: 'Phone', tablet: 'Tablet' };
const pageLabel = (path: string) => (path === '/' ? 'Home (English)' : path === '/ne/' ? 'Home (Nepali)' : path);

export async function visitorFigures(): Promise<VisitorResult> {
  if (!analyticsConfigured() || !CF_ANALYTICS_TOKEN) return { status: 'off' };
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.result;

  const days = lastDays();
  let result: VisitorResult;
  try {
    const since = `${days[0]}T00:00:00Z`;
    const until = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
    const run = (excludeBots: boolean) => {
      const q = queries(since, until, excludeBots);
      return Promise.all([q.daily, q.pages, q.referrers, q.devices, q.countries].map(ask));
    };
    let answers = await run(true);
    // If Cloudflare ever stops accepting the bot filter, show numbers including bots rather than nothing.
    if ('error' in answers[0] && /\bbot\b/i.test(answers[0].error)) answers = await run(false);
    const [daily, pages, referrers, devices, countries] = answers;
    if ('error' in daily) {
      result = { status: 'error', message: daily.error };
    } else {
      const byDate = new Map(daily.rows.map((g) => [g.dimensions?.date ?? '', g]));
      const series = days.map((date) => ({ date, views: byDate.get(date)?.count ?? 0, visits: byDate.get(date)?.sum?.visits ?? 0 }));
      const total = (list: DayCount[], key: 'views' | 'visits') => list.reduce((sum, d) => sum + d[key], 0);
      const share = (answer: Answer, dim: string, label: (v: string) => string, value: (g: Group) => number = (g) => g.count ?? 0) =>
        'error' in answer
          ? []
          : answer.rows.map((g) => ({ key: g.dimensions?.[dim] ?? '', label: label(g.dimensions?.[dim] ?? ''), value: value(g) })).filter((x) => x.value > 0);
      result = {
        status: 'ok',
        data: {
          days: series,
          visits7: total(series.slice(-7), 'visits'),
          visitsPrev7: total(series.slice(-14, -7), 'visits'),
          views7: total(series.slice(-7), 'views'),
          visits30: total(series, 'visits'),
          views30: total(series, 'views'),
          pages: share(pages, 'requestPath', pageLabel),
          // Visits that arrived from other websites (search engines, Facebook…); direct visits have no referrer.
          referrers: share(referrers, 'refererHost', (h) => h, (g) => g.sum?.visits ?? 0)
            .filter((r) => r.key && !OWN_HOSTS.has(r.key))
            .slice(0, 6),
          devices: share(devices, 'deviceType', (d) => DEVICE[d] ?? (d || 'Other')),
          countries: share(countries, 'countryName', (c) => c || 'Unknown'),
        },
      };
    }
  } catch (err) {
    result = { status: 'error', message: err instanceof Error && err.name === 'TimeoutError' ? 'Cloudflare took too long to answer' : 'Could not reach Cloudflare' };
  }
  // Errors are cached briefly too, so a Cloudflare outage doesn't slow every dashboard visit.
  cache = { at: result.status === 'ok' ? Date.now() : Date.now() - CACHE_MS + 60_000, result };
  return result;
}
