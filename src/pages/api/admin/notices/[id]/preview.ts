import type { APIRoute } from 'astro';
import { getNotice, noticePayload } from '~/lib/content';

export const prerender = false;

/** Lets a signed-in admin preview a notice on the website before it is live. */
export const GET: APIRoute = async ({ params, locals }) => {
  const headers = { 'content-type': 'application/json', 'cache-control': 'private, no-store' };
  if (!locals.admin) return new Response(JSON.stringify({ message: 'Sign in required' }), { status: 401, headers });
  const id = Number(params.id);
  const notice = Number.isInteger(id) && id > 0 ? await getNotice(id) : null;
  if (!notice) return new Response(JSON.stringify({ message: 'Not found' }), { status: 404, headers });
  return new Response(JSON.stringify({ notice: noticePayload(notice) }), { headers });
};
