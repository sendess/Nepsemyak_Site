// Activity log. Content changes are recorded by database triggers (db/migrations/003) using the
// actor set in the same transaction; sign-in and security events are written here directly.
import { sql } from './db';
import { likePattern, type ListSpec, type ListState } from './listing';

type Query = ReturnType<typeof sql>;

export type Actor = { email: string | null; ip: string | null; userAgent: string | null };

/** Who is making a request. `clientAddress` throws when unavailable, so it is read defensively. */
export function requestActor(ctx: { request: Request; clientAddress?: string }, email: string | null): Actor {
  let ip: string | null = null;
  try {
    ip = ctx.clientAddress ?? null;
  } catch {
    ip = null;
  }
  return {
    email,
    ip: ip?.slice(0, 64) ?? null,
    userAgent: ctx.request.headers.get('user-agent')?.slice(0, 300) ?? null,
  };
}

/** Run statements in one transaction, credited to `actor` in the activity log. */
export async function asActor(actor: Actor, queries: Query[]) {
  const results = await sql.transaction([
    sql`select set_config('app.actor', ${actor.email ?? ''}, true), set_config('app.ip', ${actor.ip ?? ''}, true),
      set_config('app.user_agent', ${actor.userAgent ?? ''}, true)`,
    ...queries,
  ]);
  return results.slice(1);
}

export type AuthEvent =
  | 'sign_in'
  | 'sign_in_failed'
  | 'sign_in_blocked'
  | 'two_factor_passed'
  | 'two_factor_failed'
  | 'recovery_code_used'
  | 'two_factor_enabled'
  | 'two_factor_reset'
  | 'recovery_codes_created'
  | 'password_changed'
  | 'password_change_failed'
  | 'password_reset_requested'
  | 'password_reset'
  | 'password_reset_failed'
  | 'signed_out'
  | 'sessions_revoked';

export async function logEvent(actor: Actor, action: AuthEvent, detail: { label?: string; target?: string } = {}) {
  await sql`
    insert into audit_log (actor_email, action, entity, entity_id, label, ip, user_agent)
    values (${actor.email}, ${action}, 'auth', ${detail.target ?? null}, ${detail.label ?? null}, ${actor.ip}, ${actor.userAgent})`;
}

/** How often `action` happened in the last `minutes`: for this email, this IP address, and both together. */
export async function recentEvents(action: AuthEvent, email: string | null, ip: string | null, minutes: number) {
  const [row] = await sql`
    select count(*) filter (where actor_email = ${email})::int as by_email,
           count(*) filter (where ip = ${ip})::int as by_ip,
           count(*) filter (where actor_email = ${email} and ip = ${ip})::int as by_email_ip
    from audit_log
    where action = ${action} and at > now() - make_interval(mins => ${minutes})`;
  return { byEmail: Number(row.by_email), byIp: Number(row.by_ip), byEmailIp: Number(row.by_email_ip) };
}

/* ---------------- Activity page ---------------- */

export type AuditEntry = {
  id: number;
  at: string;
  actor_email: string | null;
  action: string;
  entity: string | null;
  entity_id: string | null;
  label: string | null;
  changes: Record<string, { from?: unknown; to?: unknown }> | null;
  ip: string | null;
  user_agent: string | null;
};

export type AuditSort = 'when';
export type AuditFilter = 'person' | 'area' | 'kind';

const SIGN_IN_ACTIONS = ['sign_in', 'sign_in_failed', 'sign_in_blocked', 'two_factor_passed', 'two_factor_failed', 'recovery_code_used', 'signed_out'];

export const AUDIT_AREAS = {
  notices: ['notices'],
  news: ['news_posts'],
  jobs: ['jobs'],
  stats: ['stat_groups', 'stat_items'],
  requests: ['service_requests'],
  users: ['admin_users'],
  auth: ['auth'],
} as const;

/** The person filter lists current admins, plus "system" (database changes made outside the website). */
export function auditListSpec(adminEmails: string[]): ListSpec<AuditSort, AuditFilter> {
  return {
    id: 'activity',
    sorts: { when: 'desc' },
    defaultSort: 'when',
    filters: {
      person: [...adminEmails, 'system', 'others'],
      area: Object.keys(AUDIT_AREAS),
      kind: ['changes', 'sign-ins', 'security'],
    },
    pageSize: 50,
  };
}

export async function listAudit(list: ListState<AuditSort, AuditFilter>, adminEmails: string[]) {
  const { person, area, kind } = list.filters;
  const conds: Query[] = [];
  if (person === 'system') conds.push(sql`actor_email is null`);
  else if (person === 'others') conds.push(sql`actor_email is not null and not (actor_email = any(${adminEmails}))`);
  else if (person) conds.push(sql`actor_email = ${person}`);
  if (area) conds.push(sql`entity = any(${[...AUDIT_AREAS[area as keyof typeof AUDIT_AREAS]]})`);
  if (kind === 'changes') conds.push(sql`action in ('create', 'update', 'delete')`);
  else if (kind === 'sign-ins') conds.push(sql`action = any(${SIGN_IN_ACTIONS})`);
  else if (kind === 'security') conds.push(sql`entity = 'auth' and not (action = any(${SIGN_IN_ACTIONS}))`);
  if (list.q) {
    const like = likePattern(list.q);
    conds.push(sql`(label ilike ${like} or actor_email ilike ${like} or ip ilike ${like} or entity_id ilike ${like})`);
  }
  const where = conds.reduce((acc, c) => sql`${acc} and ${c}`, sql`true`);
  const rows = await sql`
    select id, at, actor_email, action, entity, entity_id, label, changes, ip, user_agent, count(*) over()::int as total_count
    from audit_log
    where ${where}
    order by at ${sql.unsafe(list.dir === 'asc' ? 'asc' : 'desc')}, id ${sql.unsafe(list.dir === 'asc' ? 'asc' : 'desc')}
    limit ${list.pageSize} offset ${(list.page - 1) * list.pageSize}`;
  return { rows: rows as AuditEntry[], total: rows.length ? Number(rows[0].total_count) : 0 };
}
