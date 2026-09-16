import type { APIRoute } from 'astro';
import { cachePublic } from '~/lib/cache';
import { getCurrentNotice } from '~/lib/content';

export const prerender = false;

/** The site-wide notice banner, read by every page and cached at the edge until a notice is saved. */
export const GET: APIRoute = async () => {
  const notice = await getCurrentNotice();
  const headers = new Headers({ 'content-type': 'application/json' });
  cachePublic(headers, ['notice']);
  const body = notice
    ? {
        id: notice.id,
        tone: notice.tone,
        message: { en: notice.message_en, ne: notice.message_ne },
        link: notice.link_url,
        endsAt: notice.ends_at,
      }
    : null;
  return new Response(JSON.stringify({ notice: body }), { headers });
};
