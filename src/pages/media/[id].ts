import type { APIRoute } from 'astro';
import { cacheImmutable } from '~/lib/cache';
import { getMedia } from '~/lib/content';

export const prerender = false;

/** Uploaded images. An id never points at different bytes, so they are cached for a year. */
export const GET: APIRoute = async ({ params }) => {
  const media = await getMedia(params.id ?? '');
  if (!media) return new Response('Not found', { status: 404 });
  const headers = new Headers({
    'content-type': media.content_type,
    'x-content-type-options': 'nosniff',
  });
  cacheImmutable(headers);
  return new Response(new Uint8Array(media.bytes), { headers });
};
