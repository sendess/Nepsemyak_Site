// Figures for the admin dashboard. Everything is read in a few queries that run side by side.
import { sql } from './db';
import { branches } from '~/data/site';
import { TOPIC_LABEL, type RequestTopic } from './requests';

const NPT = sql`'Asia/Kathmandu'`;

export type WeekCount = { week_start: string; n: number };
export type Share = { key: string; label: string; value: number };

/** Contact-form queries: what is waiting, how fast staff respond, and what people write about. */
/**
 * Query figures, for every office or (for Customer care tied to one) that office plus queries with none chosen.
 * For an office, a query passed to it counts as waiting from when it arrived there, not from when the customer wrote.
 */
export async function requestFigures(scope: string | null = null, me: string | null = null) {
  const mine = scope ? sql`(branch = ${scope} or branch is null)` : sql`true`;
  const mineR = scope ? sql`(r.branch = ${scope} or r.branch is null)` : sql`true`;
  const since = scope
    ? sql`greatest(created_at, coalesce((select max(h.at) from request_handovers h
        where h.request_id = service_requests.id and h.to_branch = service_requests.branch), created_at))`
    : sql`created_at`;
  const [totals, response, weeks, topics, offices, workload] = await Promise.all([
    sql`
      select
        count(*) filter (where status = 'new')::int as waiting,
        count(*) filter (where status = 'in_progress')::int as in_progress,
        count(*) filter (where status = 'new' and ${since} < now() - interval '24 hours')::int as overdue,
        min(${since}) filter (where status = 'new') as oldest_waiting,
        count(*) filter (where assigned_to = ${me} and status in ('new', 'in_progress'))::int as my_open,
        count(*) filter (where status <> 'spam'
          and created_at >= (date_trunc('month', now() at time zone ${NPT}) at time zone ${NPT}))::int as this_month,
        count(*) filter (where status <> 'spam'
          and created_at >= ((date_trunc('month', now() at time zone ${NPT}) - interval '1 month') at time zone ${NPT})
          and created_at < (date_trunc('month', now() at time zone ${NPT}) at time zone ${NPT}))::int as last_month,
        count(*) filter (where status <> 'spam' and created_at > now() - interval '30 days')::int as last_30,
        count(*) filter (where status = 'resolved' and created_at > now() - interval '30 days')::int as resolved_30
      from service_requests
      where ${mine}`,
    // First staff action = the first status change (activity log) or first note, whichever came first.
    sql`
      with firsts as (
        select r.created_at, least(
          (select min(a.at) from audit_log a
            where a.entity = 'service_requests' and a.entity_id = r.id::text and a.action = 'update'),
          (select min(n.at) from request_notes n where n.request_id = r.id)
        ) as first_at
        from service_requests r
        where r.created_at > now() - interval '90 days' and r.status <> 'spam' and ${mineR}
      )
      select percentile_cont(0.5) within group (order by extract(epoch from first_at - created_at) / 3600)
               filter (where first_at is not null) as median_hours,
             count(first_at)::int as answered, count(*)::int as total
      from firsts`,
    // Weeks start on Sunday, as in Nepal. Oldest first.
    sql`
      with this_week as (
        select (now() at time zone ${NPT})::date - extract(dow from (now() at time zone ${NPT})::date)::int as start
      )
      select (w.start - i * 7)::text as week_start,
        (select count(*) from service_requests r
          where r.status <> 'spam' and ${mineR}
            and (r.created_at at time zone ${NPT})::date between w.start - i * 7 and w.start - i * 7 + 6)::int as n
      from this_week w, generate_series(11, 0, -1) as i`,
    sql`
      select topic as key, count(*)::int as value from service_requests
      where status <> 'spam' and created_at > now() - interval '90 days' and ${mine}
      group by topic order by value desc`,
    sql`
      select coalesce(branch, 'unsure') as key, count(*)::int as value from service_requests
      where status <> 'spam' and created_at > now() - interval '90 days' and ${mine}
      group by 1 order by value desc`,
    // Open queries per person, and those nobody has taken yet.
    sql`
      select coalesce(r.assigned_to, '') as key, coalesce(nullif(a.name, ''), r.assigned_to, '') as name, count(*)::int as value
      from service_requests r left join admin_users a on a.email = r.assigned_to
      where r.status in ('new', 'in_progress') and ${mineR}
      group by 1, 2 order by value desc`,
  ]);
  const t = totals[0];
  const r = response[0];
  const officeName = (key: string) => branches.find((b) => b.id === key)?.name.en ?? 'Not sure';
  return {
    waiting: Number(t.waiting),
    inProgress: Number(t.in_progress),
    overdue: Number(t.overdue),
    oldestWaiting: (t.oldest_waiting as string | null) ?? null,
    myOpen: Number(t.my_open),
    workload: workload.map((x) => ({
      key: String(x.key) || 'none',
      label: x.key ? String(x.name) : 'Not assigned yet',
      value: Number(x.value),
    })) as Share[],
    thisMonth: Number(t.this_month),
    lastMonth: Number(t.last_month),
    last30: Number(t.last_30),
    resolved30: Number(t.resolved_30),
    medianResponseHours: r.median_hours === null ? null : Number(r.median_hours),
    answered90: Number(r.answered),
    total90: Number(r.total),
    weeks: weeks.map((w) => ({ week_start: String(w.week_start), n: Number(w.n) })) as WeekCount[],
    topics: topics.map((x) => ({ key: String(x.key), label: TOPIC_LABEL[x.key as RequestTopic] ?? String(x.key), value: Number(x.value) })) as Share[],
    offices: offices.map((x) => ({ key: String(x.key), label: officeName(String(x.key)), value: Number(x.value) })) as Share[],
  };
}

/** News, jobs and notices: what visitors currently see, and what is going stale. */
export async function contentFigures() {
  const [news, jobs, closing, notices, pages] = await Promise.all([
    sql`
      select
        count(*) filter (where status = 'published' and published_on <= (now() at time zone ${NPT})::date)::int as published,
        count(*) filter (where status = 'published' and published_on > (now() at time zone ${NPT})::date)::int as scheduled,
        count(*) filter (where status = 'draft')::int as drafts,
        max(published_on) filter (where status = 'published' and published_on <= (now() at time zone ${NPT})::date)::text as last_published
      from news_posts`,
    sql`
      select
        count(*) filter (where status = 'open' and (deadline is null or deadline >= (now() at time zone ${NPT})::date))::int as open,
        count(*) filter (where status = 'open' and deadline < (now() at time zone ${NPT})::date)::int as expired,
        count(*) filter (where status = 'draft')::int as drafts
      from jobs`,
    sql`
      select id, coalesce(nullif(title_en, ''), title_ne) as title, deadline::text as deadline from jobs
      where status = 'open' and deadline between (now() at time zone ${NPT})::date and (now() at time zone ${NPT})::date + 7
      order by deadline limit 5`,
    sql`
      select
        count(*) filter (where is_active and starts_at > now())::int as scheduled,
        count(*) filter (where is_active and starts_at <= now() and ends_at is not null and ends_at > now()
          and ends_at < now() + interval '3 days')::int as ending_soon
      from notices`,
    sql`select max(updated_at) as last_edit, count(*)::int as edited from page_sections where content <> '{}'::jsonb`,
  ]);
  return {
    news: {
      published: Number(news[0].published),
      scheduled: Number(news[0].scheduled),
      drafts: Number(news[0].drafts),
      lastPublished: (news[0].last_published as string | null) ?? null,
    },
    jobs: { open: Number(jobs[0].open), expired: Number(jobs[0].expired), drafts: Number(jobs[0].drafts) },
    closingJobs: closing as { id: number; title: string; deadline: string }[],
    notices: { scheduled: Number(notices[0].scheduled), endingSoon: Number(notices[0].ending_soon) },
    pages: { lastEdit: (pages[0].last_edit as string | null) ?? null, edited: Number(pages[0].edited) },
  };
}

/** Sign-ins over the last week, for the master admin. */
export async function securityFigures() {
  const [row] = await sql`
    select
      count(*) filter (where action in ('two_factor_passed', 'recovery_code_used'))::int as sign_ins,
      count(*) filter (where action in ('sign_in_failed', 'two_factor_failed', 'password_reset_failed'))::int as failed,
      count(*) filter (where action = 'sign_in_blocked')::int as blocked,
      count(distinct ip) filter (where action in ('sign_in_failed', 'two_factor_failed'))::int as failed_ips,
      count(*) filter (where action in ('sign_in_failed', 'two_factor_failed') and at > now() - interval '24 hours')::int as failed_24h
    from audit_log
    where entity = 'auth' and at > now() - interval '7 days'`;
  return {
    signIns: Number(row.sign_ins),
    failed: Number(row.failed),
    blocked: Number(row.blocked),
    failedIps: Number(row.failed_ips),
    failed24h: Number(row.failed_24h),
  };
}

export type RecentEntry = { at: string; actor_email: string | null; action: string; entity: string | null; entity_id: string | null; label: string | null };

/** The latest changes to website content (not sign-ins), for the master admin. */
export async function recentChanges(limit = 8): Promise<RecentEntry[]> {
  return (await sql`
    select at, actor_email, action, entity, entity_id, label from audit_log
    where entity <> 'auth'
    order by at desc, id desc limit ${limit}`) as RecentEntry[];
}
