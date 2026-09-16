import { neon } from '@neondatabase/serverless';
import { DATABASE_URL } from 'astro:env/server';

/** One-shot SQL over HTTP — suited to serverless functions (no connection pool to manage). */
export const sql = neon(DATABASE_URL);
