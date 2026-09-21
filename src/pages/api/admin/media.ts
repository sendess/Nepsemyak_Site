import type { APIRoute } from 'astro';
import { createMedia, MEDIA_MAX_BYTES, mediaUrl, sniffImageType } from '~/lib/content';
import { requestActor } from '~/lib/audit';

export const prerender = false;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

/**
 * Image upload for admin forms. The browser resizes and converts to WebP first
 * (see AdminImageField), so files are small; the server re-checks type and size.
 */
export const POST: APIRoute = async ({ request, locals, clientAddress }) => {
  if (!locals.admin) return json({ message: 'Sign in required' }, 401);

  const form = await request.formData().catch(() => null);
  const file = form?.get('file');
  if (!(file instanceof File)) return json({ message: 'No image received.' }, 400);
  if (file.size > MEDIA_MAX_BYTES) return json({ message: 'Image is larger than 1.5 MB after resizing.' }, 413);

  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = sniffImageType(bytes);
  if (!type) return json({ message: 'Only WebP, JPEG and PNG images are accepted.' }, 415);

  const width = Number(form?.get('width')) || null;
  const height = Number(form?.get('height')) || null;
  const id = await createMedia(bytes, type, width, height, requestActor({ request, clientAddress }, locals.admin.email));
  return json({ id, url: mediaUrl(id) }, 201);
};
