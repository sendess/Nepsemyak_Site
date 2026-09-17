// Database access for admin-managed content. Every write reports the cache tags to purge.
import { sql } from './db';
import type { AdminRole } from './auth';
import { likePattern, type ListSpec, type ListState } from './listing';
import { branches } from '~/data/site';

type Fragment = ReturnType<typeof sql>;
export type Page<T> = { rows: T[]; total: number };

/** `a and b and …` (or `true` when there are no conditions). */
const allOf = (conds: Fragment[]) => conds.reduce((acc, c) => sql`${acc} and ${c}`, sql`true`);

/** Sort expression in the chosen direction; empty values always go last. */
const orderBy = (expr: Fragment, list: ListState) => sql`${expr} ${sql.unsafe(list.dir === 'asc' ? 'asc' : 'desc')} nulls last`;

const pageOf = (list: ListState) => sql`limit ${list.pageSize} offset ${(list.page - 1) * list.pageSize}`;

function toPage<T>(rows: Record<string, unknown>[]): Page<T> {
  return { rows: rows as T[], total: rows.length ? Number(rows[0].total_count) : 0 };
}

const todayInNepal = sql`(now() at time zone 'Asia/Kathmandu')::date`;

/* ---------------- Notices ---------------- */

export type NoticeTone = 'info' | 'warning' | 'urgent';
export const NOTICE_TONES: readonly NoticeTone[] = ['info', 'warning', 'urgent'];

export type Notice = {
  id: number;
  message_en: string;
  message_ne: string;
  link_url: string | null;
  tone: NoticeTone;
  is_active: boolean;
  starts_at: string;
  ends_at: string | null;
  show_banner: boolean;
  show_popup: boolean;
  title_en: string;
  title_ne: string;
  details_en: string;
  details_ne: string;
  image_media_id: string | null;
  image_width: number | null;
  image_height: number | null;
  updated_by: string | null;
  updated_at: string;
};

export type NoticeInput = Pick<
  Notice,
  | 'message_en'
  | 'message_ne'
  | 'link_url'
  | 'tone'
  | 'is_active'
  | 'ends_at'
  | 'show_banner'
  | 'show_popup'
  | 'title_en'
  | 'title_ne'
  | 'details_en'
  | 'details_ne'
  | 'image_media_id'
> & {
  starts_at: string | null;
};

const noticeSelect = sql`n.*, m.width as image_width, m.height as image_height
  from notices n left join media m on m.id = n.image_media_id`;

/** Notices visitors see right now: active, started and not yet ended, newest first. */
export async function getLiveNotices(): Promise<{ banner: Notice | null; popup: Notice | null }> {
  const rows = (await sql`
    select ${noticeSelect}
    where n.is_active and n.starts_at <= now() and (n.ends_at is null or n.ends_at > now())
    order by n.starts_at desc, n.id desc limit 20`) as Notice[];
  return {
    banner: rows.find((n) => n.show_banner) ?? null,
    popup: rows.find((n) => n.show_popup) ?? null,
  };
}

export type NoticeSort = 'message' | 'type' | 'status' | 'showing' | 'updated';
export type NoticeFilter = 'status' | 'shown' | 'type';

export const NOTICE_LIST: ListSpec<NoticeSort, NoticeFilter> = {
  id: 'notices',
  sorts: { message: 'asc', type: 'desc', status: 'asc', showing: 'desc', updated: 'desc' },
  defaultSort: 'status',
  filters: { status: ['active', 'scheduled', 'expired', 'inactive'], shown: ['banner', 'popup'], type: NOTICE_TONES },
};

// 0 active, 1 scheduled, 2 expired, 3 turned off — the same rules as the status badges.
const noticeState = sql`case when not n.is_active then 3 when n.starts_at > now() then 1
  when n.ends_at is not null and n.ends_at <= now() then 2 else 0 end`;

export async function listNotices(list: ListState<NoticeSort, NoticeFilter>): Promise<Page<Notice>> {
  const { status, shown, type } = list.filters;
  const conds: Fragment[] = [];
  if (status) conds.push(sql`${noticeState} = ${NOTICE_LIST.filters.status.indexOf(status)}`);
  if (shown === 'banner') conds.push(sql`n.show_banner`);
  if (shown === 'popup') conds.push(sql`n.show_popup`);
  if (type) conds.push(sql`n.tone = ${type}`);
  if (list.q) {
    const like = likePattern(list.q);
    conds.push(sql`(n.title_en ilike ${like} or n.title_ne ilike ${like} or n.message_en ilike ${like}
      or n.message_ne ilike ${like} or n.details_en ilike ${like} or n.details_ne ilike ${like})`);
  }
  const sortBy = {
    message: sql`lower(coalesce(nullif(n.title_en, ''), nullif(n.title_ne, ''), nullif(n.message_en, ''), n.message_ne))`,
    type: sql`array_position(array['info', 'warning', 'urgent'], n.tone)`,
    status: noticeState,
    showing: sql`n.starts_at`,
    updated: sql`n.updated_at`,
  }[list.sort];
  const rows = await sql`
    select n.*, m.width as image_width, m.height as image_height, count(*) over()::int as total_count
    from notices n left join media m on m.id = n.image_media_id
    where ${allOf(conds)}
    order by ${orderBy(sortBy, list)}, n.starts_at desc, n.id desc
    ${pageOf(list)}`;
  return toPage(rows);
}

export async function getNotice(id: number): Promise<Notice | null> {
  return ((await sql`select ${noticeSelect} where n.id = ${id}`)[0] as Notice) ?? null;
}

export async function saveNotice(id: number | null, input: NoticeInput, by: string): Promise<number> {
  const starts = input.starts_at ?? new Date().toISOString();
  const n = input;
  if (id === null) {
    const [row] = await sql`
      insert into notices (message_en, message_ne, link_url, tone, is_active, starts_at, ends_at, show_banner, show_popup,
        title_en, title_ne, details_en, details_ne, image_media_id, updated_by)
      values (${n.message_en}, ${n.message_ne}, ${n.link_url}, ${n.tone}, ${n.is_active}, ${starts}, ${n.ends_at},
        ${n.show_banner}, ${n.show_popup}, ${n.title_en}, ${n.title_ne}, ${n.details_en}, ${n.details_ne},
        ${n.image_media_id}, ${by})
      returning id`;
    return Number(row.id);
  }
  await sql`
    update notices set message_en = ${n.message_en}, message_ne = ${n.message_ne}, link_url = ${n.link_url},
      tone = ${n.tone}, is_active = ${n.is_active}, starts_at = ${starts}, ends_at = ${n.ends_at},
      show_banner = ${n.show_banner}, show_popup = ${n.show_popup}, title_en = ${n.title_en}, title_ne = ${n.title_ne},
      details_en = ${n.details_en}, details_ne = ${n.details_ne}, image_media_id = ${n.image_media_id},
      updated_by = ${by}, updated_at = now()
    where id = ${id}`;
  return id;
}

/** Shape sent to the browser for the banner and pop-up. */
export function noticePayload(n: Notice) {
  return {
    id: n.id,
    // Changes whenever the notice is edited, so an updated pop-up is shown again.
    version: `${n.id}-${new Date(n.updated_at).getTime()}`,
    tone: n.tone,
    message: { en: n.message_en, ne: n.message_ne },
    title: { en: n.title_en, ne: n.title_ne },
    details: { en: n.details_en, ne: n.details_ne },
    image: n.image_media_id ? { url: `/media/${n.image_media_id}`, width: n.image_width, height: n.image_height } : null,
    link: n.link_url,
    endsAt: n.ends_at,
  };
}

export async function deleteNotice(id: number) {
  await sql`delete from notices where id = ${id}`;
}

/* ---------------- Media ---------------- */

export const MEDIA_TYPES = ['image/webp', 'image/jpeg', 'image/png'] as const;
export type MediaType = (typeof MEDIA_TYPES)[number];
export const MEDIA_MAX_BYTES = 1_500_000;

export async function createMedia(bytes: Uint8Array, contentType: MediaType, width: number | null, height: number | null, by: string) {
  const [row] = await sql`
    insert into media (content_type, bytes, width, height, created_by)
    values (${contentType}, ${Buffer.from(bytes)}, ${width}, ${height}, ${by})
    returning id`;
  return String(row.id);
}

export async function getMedia(id: string): Promise<{ bytes: Buffer; content_type: MediaType } | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const rows = await sql`select bytes, content_type from media where id = ${id}`;
  return (rows[0] as { bytes: Buffer; content_type: MediaType }) ?? null;
}

/** Check the file signature, not just the declared type. */
export function sniffImageType(bytes: Uint8Array): MediaType | null {
  const b = bytes;
  if (b.length > 12 && b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return 'image/webp';
  if (b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg';
  if (b.length > 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'image/png';
  return null;
}

export const mediaUrl = (id: string | null) => (id ? `/media/${id}` : null);

/* ---------------- News ---------------- */

export type NewsStatus = 'draft' | 'published';
export const NEWS_STATUSES: readonly NewsStatus[] = ['draft', 'published'];

export type NewsPost = {
  id: number;
  slug: string;
  status: NewsStatus;
  published_on: string;
  branch: string | null;
  title_en: string;
  title_ne: string;
  summary_en: string;
  summary_ne: string;
  body_en: string;
  body_ne: string;
  cover_media_id: string | null;
  updated_by: string | null;
  updated_at: string;
};

export type NewsInput = Omit<NewsPost, 'id' | 'updated_by' | 'updated_at'>;

// `published_on` is returned as text so dates never shift across time zones.
const newsColumns = sql`id, slug, status, published_on::text as published_on, branch, title_en, title_ne,
  summary_en, summary_ne, body_en, body_ne, cover_media_id, updated_by, updated_at`;

export async function listPublishedNews(limit = 50): Promise<NewsPost[]> {
  return (await sql`
    select ${newsColumns} from news_posts
    where status = 'published' and published_on <= (now() at time zone 'Asia/Kathmandu')::date
    order by published_on desc, id desc limit ${limit}`) as NewsPost[];
}

export async function getPublishedNews(slug: string): Promise<NewsPost | null> {
  const rows = await sql`
    select ${newsColumns} from news_posts
    where slug = ${slug} and status = 'published' and published_on <= (now() at time zone 'Asia/Kathmandu')::date`;
  return (rows[0] as NewsPost) ?? null;
}

export type NewsSort = 'title' | 'date' | 'office' | 'status' | 'updated';
export type NewsFilter = 'status' | 'office';

export const NEWS_LIST: ListSpec<NewsSort, NewsFilter> = {
  id: 'news',
  sorts: { title: 'asc', date: 'desc', office: 'asc', status: 'asc', updated: 'desc' },
  defaultSort: 'date',
  filters: { status: ['published', 'scheduled', 'draft'], office: ['company', ...branches.map((b) => b.id)] },
};

// 0 published, 1 scheduled (published with a future date), 2 draft.
const newsState = sql`case when status = 'draft' then 2 when published_on > ${todayInNepal} then 1 else 0 end`;

export async function listAllNews(list: ListState<NewsSort, NewsFilter>): Promise<Page<NewsPost>> {
  const { status, office } = list.filters;
  const conds: Fragment[] = [];
  if (status) conds.push(sql`${newsState} = ${NEWS_LIST.filters.status.indexOf(status)}`);
  if (office === 'company') conds.push(sql`branch is null`);
  else if (office) conds.push(sql`branch = ${office}`);
  if (list.q) {
    const like = likePattern(list.q);
    conds.push(sql`(title_en ilike ${like} or title_ne ilike ${like} or summary_en ilike ${like}
      or summary_ne ilike ${like} or slug ilike ${like})`);
  }
  const sortBy = {
    title: sql`lower(coalesce(nullif(title_en, ''), title_ne))`,
    date: sql`news_posts.published_on`,
    office: sql`branch`,
    status: newsState,
    updated: sql`updated_at`,
  }[list.sort];
  const rows = await sql`
    select ${newsColumns}, count(*) over()::int as total_count from news_posts
    where ${allOf(conds)}
    order by ${orderBy(sortBy, list)}, news_posts.published_on desc, id desc
    ${pageOf(list)}`;
  return toPage(rows);
}

export async function getNews(id: number): Promise<NewsPost | null> {
  return ((await sql`select ${newsColumns} from news_posts where id = ${id}`)[0] as NewsPost) ?? null;
}

export async function slugTaken(slug: string, exceptId: number | null): Promise<boolean> {
  const rows = await sql`select 1 from news_posts where slug = ${slug} and id is distinct from ${exceptId}`;
  return rows.length > 0;
}

export async function saveNews(id: number | null, p: NewsInput, by: string): Promise<number> {
  if (id === null) {
    const [row] = await sql`
      insert into news_posts (slug, status, published_on, branch, title_en, title_ne, summary_en, summary_ne,
        body_en, body_ne, cover_media_id, updated_by)
      values (${p.slug}, ${p.status}, ${p.published_on}, ${p.branch}, ${p.title_en}, ${p.title_ne}, ${p.summary_en},
        ${p.summary_ne}, ${p.body_en}, ${p.body_ne}, ${p.cover_media_id}, ${by})
      returning id`;
    return Number(row.id);
  }
  await sql`
    update news_posts set slug = ${p.slug}, status = ${p.status}, published_on = ${p.published_on}, branch = ${p.branch},
      title_en = ${p.title_en}, title_ne = ${p.title_ne}, summary_en = ${p.summary_en}, summary_ne = ${p.summary_ne},
      body_en = ${p.body_en}, body_ne = ${p.body_ne}, cover_media_id = ${p.cover_media_id},
      updated_by = ${by}, updated_at = now()
    where id = ${id}`;
  return id;
}

export async function deleteNews(id: number) {
  // Remove the cover image too when no other post uses it.
  await sql`
    with removed as (delete from news_posts where id = ${id} returning cover_media_id)
    delete from media m using removed r
    where m.id = r.cover_media_id
      and not exists (select 1 from news_posts n where n.cover_media_id = m.id and n.id <> ${id})`;
}

/* ---------------- Jobs ---------------- */

export type JobStatus = 'draft' | 'open' | 'closed';
export const JOB_STATUSES: readonly JobStatus[] = ['draft', 'open', 'closed'];

export type Job = {
  id: number;
  status: JobStatus;
  title_en: string;
  title_ne: string;
  location_en: string;
  location_ne: string;
  description_en: string;
  description_ne: string;
  how_to_apply_en: string;
  how_to_apply_ne: string;
  openings: number | null;
  deadline: string | null;
  updated_by: string | null;
  updated_at: string;
};

export type JobInput = Omit<Job, 'id' | 'updated_by' | 'updated_at'>;

const jobColumns = sql`id, status, title_en, title_ne, location_en, location_ne, description_en, description_ne,
  how_to_apply_en, how_to_apply_ne, openings, deadline::text as deadline, updated_by, updated_at`;

/** Open jobs whose deadline (if any) has not passed in Nepal time. */
export async function listOpenJobs(): Promise<Job[]> {
  return (await sql`
    select ${jobColumns} from jobs
    where status = 'open' and (deadline is null or deadline >= (now() at time zone 'Asia/Kathmandu')::date)
    order by deadline nulls last, id desc`) as Job[];
}

export type JobSort = 'position' | 'location' | 'openings' | 'deadline' | 'status' | 'updated';
export type JobFilter = 'status';

export const JOB_LIST: ListSpec<JobSort, JobFilter> = {
  id: 'jobs',
  sorts: { position: 'asc', location: 'asc', openings: 'desc', deadline: 'asc', status: 'asc', updated: 'desc' },
  defaultSort: 'status',
  filters: { status: ['open', 'expired', 'draft', 'closed'] },
};

// 0 open, 1 open but past its deadline (hidden on the website), 2 draft, 3 closed.
const jobState = sql`case when status = 'draft' then 2 when status = 'closed' then 3
  when jobs.deadline < ${todayInNepal} then 1 else 0 end`;

export async function listAllJobs(list: ListState<JobSort, JobFilter>): Promise<Page<Job>> {
  const conds: Fragment[] = [];
  if (list.filters.status) conds.push(sql`${jobState} = ${JOB_LIST.filters.status.indexOf(list.filters.status)}`);
  if (list.q) {
    const like = likePattern(list.q);
    conds.push(sql`(title_en ilike ${like} or title_ne ilike ${like} or location_en ilike ${like} or location_ne ilike ${like})`);
  }
  const sortBy = {
    position: sql`lower(coalesce(nullif(title_en, ''), title_ne))`,
    location: sql`lower(coalesce(nullif(location_en, ''), nullif(location_ne, '')))`,
    openings: sql`openings`,
    deadline: sql`jobs.deadline`,
    status: jobState,
    updated: sql`updated_at`,
  }[list.sort];
  const rows = await sql`
    select ${jobColumns}, count(*) over()::int as total_count from jobs
    where ${allOf(conds)}
    order by ${orderBy(sortBy, list)}, updated_at desc, id desc
    ${pageOf(list)}`;
  return toPage(rows);
}

export async function getJob(id: number): Promise<Job | null> {
  return ((await sql`select ${jobColumns} from jobs where id = ${id}`)[0] as Job) ?? null;
}

export async function saveJob(id: number | null, j: JobInput, by: string): Promise<number> {
  if (id === null) {
    const [row] = await sql`
      insert into jobs (status, title_en, title_ne, location_en, location_ne, description_en, description_ne,
        how_to_apply_en, how_to_apply_ne, openings, deadline, updated_by)
      values (${j.status}, ${j.title_en}, ${j.title_ne}, ${j.location_en}, ${j.location_ne}, ${j.description_en},
        ${j.description_ne}, ${j.how_to_apply_en}, ${j.how_to_apply_ne}, ${j.openings}, ${j.deadline}, ${by})
      returning id`;
    return Number(row.id);
  }
  await sql`
    update jobs set status = ${j.status}, title_en = ${j.title_en}, title_ne = ${j.title_ne},
      location_en = ${j.location_en}, location_ne = ${j.location_ne}, description_en = ${j.description_en},
      description_ne = ${j.description_ne}, how_to_apply_en = ${j.how_to_apply_en}, how_to_apply_ne = ${j.how_to_apply_ne},
      openings = ${j.openings}, deadline = ${j.deadline}, updated_by = ${by}, updated_at = now()
    where id = ${id}`;
  return id;
}

export async function deleteJob(id: number) {
  await sql`delete from jobs where id = ${id}`;
}

/* ---------------- Admin users ---------------- */

export type AdminRecord = { email: string; name: string; role: AdminRole; created_at: string; last_seen_at: string | null };

export async function listAdmins(): Promise<AdminRecord[]> {
  return (await sql`select email, name, role, created_at, last_seen_at from admin_users order by role, email`) as AdminRecord[];
}

export async function upsertAdmin(email: string, name: string, role: AdminRole, by: string) {
  await sql`
    insert into admin_users (email, name, role, created_by) values (${email}, ${name}, ${role}, ${by})
    on conflict (email) do update set name = excluded.name, role = excluded.role`;
}

export async function removeAdmin(email: string) {
  // Never remove the last owner.
  await sql`
    delete from admin_users
    where email = ${email}
      and (role <> 'owner' or (select count(*) from admin_users where role = 'owner') > 1)`;
}

/* ---------------- Dashboard ---------------- */

export async function dashboardCounts() {
  const [row] = await sql`
    select
      (select count(*) from news_posts where status = 'published')::int as news_published,
      (select count(*) from news_posts where status = 'draft')::int as news_drafts,
      (select count(*) from jobs where status = 'open')::int as jobs_open,
      (select count(*) from admin_users)::int as admins,
      (select coalesce(sum(size_bytes), 0) from media)::bigint as media_bytes`;
  return row as { news_published: number; news_drafts: number; jobs_open: number; admins: number; media_bytes: number };
}
