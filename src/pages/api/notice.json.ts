import type { APIRoute } from 'astro';
import { cachePublic } from '~/lib/cache';
import { getLiveNotices, noticePayload } from '~/lib/content';

export const prerender = false;

/**
 * The live banner and pop-up notices, read by every page and cached at the edge
 * until a notice is saved in the admin panel.
 */
export const GET: APIRoute = async () => {
  const { banner, popup } = await getLiveNotices();
  const headers = new Headers({ 'content-type': 'application/json' });
  cachePublic(headers, ['notice']);
  const body = {
    banner: banner ? noticePayload(banner) : null,
    popup: popup ? noticePayload(popup) : null,
    // Older cached pages read `notice`; keep it until they have expired.
    notice: banner ? noticePayload(banner) : null,
  };
  return new Response(JSON.stringify(body), { headers });
};
