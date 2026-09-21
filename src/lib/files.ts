// Uploaded images (table media): how much space they take, where each is used, and cleaning up
// the ones nothing uses any more (replaced photos, uploads in forms that were never saved).
import { sql } from './db';
import { asActor, type Actor } from './audit';
import type { ListSpec, ListState } from './listing';

/** Neon's free plan allows about 0.5 GB for the whole database. */
export const STORAGE_LIMIT_BYTES = 512 * 1024 * 1024;
/** Unused uploads younger than this may belong to a form someone is still filling in. */
export const FRESH_HOURS = 24;

export type Usage = { area: 'notice' | 'news' | 'page'; id: string; label: string };

export type MediaFile = {
  id: string;
  content_type: string;
  width: number | null;
  height: number | null;
  size_bytes: number;
  created_by: string | null;
  created_at: string;
  used_in: Usage[] | null;
  fresh: boolean;
};

/** Where an image appears: notices, news covers, and page sections (by id inside their content). */
const usedIn = sql`(
  select jsonb_agg(u) from (
    select jsonb_build_object('area', 'notice', 'id', n.id::text,
      'label', coalesce(nullif(n.title_en, ''), nullif(n.message_en, ''), n.message_ne)) as u
    from notices n where n.image_media_id = m.id
    union all
    select jsonb_build_object('area', 'news', 'id', p.id::text, 'label', coalesce(nullif(p.title_en, ''), p.title_ne))
    from news_posts p where p.cover_media_id = m.id
    union all
    select jsonb_build_object('area', 'page', 'id', s.page || '/' || s.key, 'label', s.page || ' / ' || s.key)
    from page_sections s where strpos(s.content::text, m.id::text) > 0
  ) x
)`;

const unused = sql`(
  not exists (select 1 from notices n where n.image_media_id = m.id)
  and not exists (select 1 from news_posts p where p.cover_media_id = m.id)
  and not exists (select 1 from page_sections s where strpos(s.content::text, m.id::text) > 0)
)`;

const fresh = sql`m.created_at > now() - make_interval(hours => ${FRESH_HOURS})`;

export type FileSort = 'uploaded' | 'size';
export type FileFilter = 'usage';

export const FILE_LIST: ListSpec<FileSort, FileFilter> = {
  id: 'files',
  sorts: { uploaded: 'desc', size: 'desc' },
  defaultSort: 'uploaded',
  filters: { usage: ['used', 'unused'] },
  pageSize: 30,
};

export async function listFiles(list: ListState<FileSort, FileFilter>) {
  const where =
    list.filters.usage === 'unused' ? unused : list.filters.usage === 'used' ? sql`not ${unused}` : sql`true`;
  const search = list.q ? sql`and m.created_by ilike ${`%${list.q}%`}` : sql``;
  const rows = await sql`
    select m.id::text as id, m.content_type, m.width, m.height, m.size_bytes, m.created_by, m.created_at,
      ${usedIn} as used_in, ${fresh} as fresh, count(*) over()::int as total_count
    from media m
    where ${where} ${search}
    order by ${list.sort === 'size' ? sql`m.size_bytes` : sql`m.created_at`} ${sql.unsafe(list.dir === 'asc' ? 'asc' : 'desc')}, m.id
    limit ${list.pageSize} offset ${(list.page - 1) * list.pageSize}`;
  return { rows: rows as MediaFile[], total: rows.length ? Number(rows[0].total_count) : 0 };
}

/** Totals for the storage meter. */
export async function storageSummary() {
  const [row] = await sql`
    select pg_database_size(current_database())::bigint as db_bytes,
      count(*)::int as files,
      coalesce(sum(m.size_bytes), 0)::bigint as media_bytes,
      count(*) filter (where ${unused})::int as unused_files,
      coalesce(sum(m.size_bytes) filter (where ${unused}), 0)::bigint as unused_bytes,
      count(*) filter (where ${unused} and not ${fresh})::int as removable_files,
      coalesce(sum(m.size_bytes) filter (where ${unused} and not ${fresh}), 0)::bigint as removable_bytes
    from media m`;
  const n = (v: unknown) => Number(v);
  return {
    dbBytes: n(row.db_bytes),
    files: n(row.files),
    mediaBytes: n(row.media_bytes),
    unusedFiles: n(row.unused_files),
    unusedBytes: n(row.unused_bytes),
    removableFiles: n(row.removable_files),
    removableBytes: n(row.removable_bytes),
  };
}

/** Deletes one image if nothing uses it. Returns the bytes freed, or null if it is in use (or already gone). */
export async function deleteFile(id: string, actor: Actor): Promise<number | null> {
  const [rows] = await asActor(actor, [sql`delete from media m where m.id = ${id}::uuid and ${unused} returning size_bytes`]);
  return rows.length ? Number(rows[0].size_bytes) : null;
}

/** Deletes every unused image older than a day. Returns how many and the bytes freed. */
export async function deleteUnusedFiles(actor: Actor): Promise<{ files: number; bytes: number }> {
  const [rows] = await asActor(actor, [sql`delete from media m where ${unused} and not ${fresh} returning size_bytes`]);
  return { files: rows.length, bytes: rows.reduce((sum, r) => sum + Number(r.size_bytes), 0) };
}

export const formatBytes = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : bytes === 0 ? '0 KB' : `${Math.max(1, Math.round(bytes / 1024))} KB`;
