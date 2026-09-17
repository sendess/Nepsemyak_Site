import { purgeCache } from '@netlify/functions';

export type CacheTag = 'notice' | 'news' | 'jobs' | 'stats';

/**
 * Cache a public response at Netlify's edge until content changes.
 * Visitors are served from the cache without running a function or touching
 * the database; saving in the admin panel purges the matching tags.
 */
export function cachePublic(headers: Headers, tags: CacheTag[]) {
  headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
  headers.set('Netlify-CDN-Cache-Control', 'public, durable, s-maxage=31536000, stale-while-revalidate=86400');
  headers.set('Netlify-Cache-Tag', tags.join(','));
}

/** Content that never changes at a given URL (uploaded images). */
export function cacheImmutable(headers: Headers) {
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  headers.set('Netlify-CDN-Cache-Control', 'public, durable, max-age=31536000, immutable');
}

export function noStore(headers: Headers) {
  headers.set('Cache-Control', 'private, no-store');
}

export async function purge(tags: CacheTag[]) {
  if (import.meta.env.DEV) return;
  try {
    await purgeCache({ tags });
  } catch (err) {
    // The edit is saved either way; the page refreshes when the cache next expires.
    console.error('Cache purge failed', err);
  }
}
