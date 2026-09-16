import type { APIRoute } from 'astro';
import { proxyAuthRequest } from '~/lib/auth';

export const prerender = false;

/** Sign-in endpoints, proxied to Neon Auth so session cookies belong to this site. */
export const ALL: APIRoute = ({ request, params }) => proxyAuthRequest(request, params.path ?? '');
