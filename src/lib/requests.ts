// Queries and complaints from the contact form: saving them, and the admin inbox.
import { randomInt } from 'node:crypto';
import { sql } from './db';
import { asActor, type Actor } from './audit';
import { likePattern, type ListSpec, type ListState } from './listing';
import { branches } from '~/data/site';
import type { Page } from './content';

export const REQUEST_TOPICS = ['missed-collection', 'new-connection', 'fees', 'staff-feedback', 'suggestion', 'other'] as const;
export type RequestTopic = (typeof REQUEST_TOPICS)[number];

export const REQUEST_STATUSES = ['new', 'in_progress', 'resolved', 'spam'] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export const STATUS_LABEL: Record<RequestStatus, string> = {
  new: 'New',
  in_progress: 'In progress',
  resolved: 'Resolved',
  spam: 'Spam',
};

export const TOPIC_LABEL: Record<RequestTopic, string> = {
  'missed-collection': 'Waste not collected',
  'new-connection': 'New service',
  fees: 'Fees and payment',
  'staff-feedback': 'Feedback about staff',
  suggestion: 'Suggestion',
  other: 'Something else',
};

export type ServiceRequest = {
  id: number;
  ref: string;
  created_at: string;
  topic: RequestTopic;
  branch: string | null;
  name: string;
  phone: string;
  email: string;
  address: string;
  message: string;
  language: 'en' | 'ne';
  status: RequestStatus;
  handled_by: string | null;
  handled_at: string | null;
  assigned_to: string | null;
  ip: string | null;
  user_agent: string | null;
};

export type RequestInput = Pick<ServiceRequest, 'topic' | 'branch' | 'name' | 'phone' | 'email' | 'address' | 'message' | 'language'>;

export type RequestNote = { id: number; at: string; author_email: string | null; note: string };

/** Short, easy-to-read-out code. No vowels, so it can't spell anything. */
function newReference(): string {
  const alphabet = '23456789CFGHJKLMNPQRSTVWXZ';
  let code = '';
  for (let i = 0; i < 6; i++) code += alphabet[randomInt(alphabet.length)];
  return `NS-${code}`;
}

/** Saves the request and returns its id and reference code. */
export async function createRequest(input: RequestInput, ip: string | null, userAgent: string | null): Promise<{ id: number; ref: string }> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const ref = newReference();
    const rows = await sql`
      insert into service_requests (ref, topic, branch, name, phone, email, address, message, language, ip, user_agent)
      values (${ref}, ${input.topic}, ${input.branch}, ${input.name}, ${input.phone}, ${input.email}, ${input.address},
        ${input.message}, ${input.language}, ${ip}, ${userAgent})
      on conflict (ref) do nothing
      returning id, ref`;
    if (rows.length === 1) return { id: Number(rows[0].id), ref: String(rows[0].ref) };
  }
  throw new Error('Could not create a reference code');
}

/** Stops one connection from flooding the form. */
export async function recentFromIp(ip: string | null, minutes = 60): Promise<number> {
  if (!ip) return 0;
  const [row] = await sql`
    select count(*)::int as n from service_requests
    where ip = ${ip} and created_at > now() - make_interval(mins => ${minutes})`;
  return Number(row.n);
}

/* ---------------- Admin inbox ---------------- */

export type RequestSort = 'received' | 'name' | 'topic' | 'branch' | 'status';
export type RequestFilter = 'status' | 'topic' | 'branch' | 'assigned';

export const REQUEST_LIST: ListSpec<RequestSort, RequestFilter> = {
  id: 'requests',
  sorts: { received: 'desc', name: 'asc', topic: 'asc', branch: 'asc', status: 'asc' },
  defaultSort: 'received',
  filters: {
    status: REQUEST_STATUSES,
    topic: REQUEST_TOPICS,
    branch: [...branches.map((b) => b.id), 'unsure'],
    assigned: ['me', 'none'],
  },
};

// New first, then in progress, resolved, and spam last.
const requestState = sql`array_position(array['new', 'in_progress', 'resolved', 'spam'], status)`;

/** Customer care tied to an office sees its queries plus those with no office chosen. */
const inScope = (scope: string | null) => (scope ? sql`(branch = ${scope} or branch is null)` : sql`true`);

/** Whether someone limited to `scope` (an office id, or null for all) may see this query. */
export const requestInScope = (scope: string | null, request: Pick<ServiceRequest, 'branch'>) =>
  !scope || request.branch === null || request.branch === scope;

/** A row in the inbox: the query, plus when (and from where) it was last passed to its current office. */
export type RequestRow = ServiceRequest & { passed_at: string | null; passed_from: string | null };

export async function listRequests(
  list: ListState<RequestSort, RequestFilter>,
  scope: string | null = null,
  me: string | null = null,
): Promise<Page<RequestRow>> {
  const { status, topic, branch, assigned } = list.filters;
  const conds = [inScope(scope)];
  if (status) conds.push(sql`status = ${status}`);
  if (topic) conds.push(sql`topic = ${topic}`);
  if (branch === 'unsure') conds.push(sql`branch is null`);
  else if (branch) conds.push(sql`branch = ${branch}`);
  if (assigned === 'me') conds.push(sql`assigned_to = ${me}`);
  else if (assigned === 'none') conds.push(sql`assigned_to is null`);
  if (list.q) {
    const like = likePattern(list.q);
    conds.push(sql`(name ilike ${like} or phone ilike ${like} or email ilike ${like} or address ilike ${like}
      or message ilike ${like} or ref ilike ${like})`);
  }
  const sortBy = {
    received: sql`created_at`,
    name: sql`lower(name)`,
    topic: sql`topic`,
    branch: sql`branch`,
    status: requestState,
  }[list.sort];
  const rows = await sql`
    select r.*, count(*) over()::int as total_count, h.at as passed_at, h.from_branch as passed_from
    from service_requests r
    left join lateral (
      select at, from_branch from request_handovers
      where request_id = r.id and to_branch is not distinct from r.branch
      order by at desc limit 1
    ) h on true
    where ${conds.reduce((acc, c) => sql`${acc} and ${c}`, sql`true`)}
    order by ${sortBy} ${sql.unsafe(list.dir === 'asc' ? 'asc' : 'desc')} nulls last, created_at desc, id desc
    limit ${list.pageSize} offset ${(list.page - 1) * list.pageSize}`;
  return { rows: rows as RequestRow[], total: rows.length ? Number(rows[0].total_count) : 0 };
}

export async function getRequest(id: number): Promise<ServiceRequest | null> {
  const [row] = await sql`select * from service_requests where id = ${id}`;
  return (row as ServiceRequest) ?? null;
}

export async function listNotes(requestId: number): Promise<RequestNote[]> {
  return (await sql`
    select id, at, author_email, note from request_notes where request_id = ${requestId} order by at, id`) as RequestNote[];
}

/** Changes status, the office dealing with it, and who is dealing with it. */
export async function updateRequest(id: number, status: RequestStatus, branch: string | null, assignedTo: string | null, actor: Actor) {
  await asActor(actor, [
    sql`update service_requests
        set status = ${status}, branch = ${branch}, assigned_to = ${assignedTo}, handled_by = ${actor.email}, handled_at = now()
        where id = ${id}`,
  ]);
}

/** Master admin only. The full message stays in the activity log, so a deletion can still be traced. */
export async function deleteRequest(id: number, actor: Actor) {
  await asActor(actor, [sql`delete from service_requests where id = ${id}`]);
}

export async function addNote(requestId: number, note: string, actor: Actor) {
  await sql`insert into request_notes (request_id, author_email, note) values (${requestId}, ${actor.email}, ${note})`;
}

/* ---------------- Who deals with a query ---------------- */

export type Assignee = { email: string; name: string };

/**
 * People a query can be given to: anyone who answers queries and can see its office. Viewers never;
 * Customer care tied to an office only for that office's queries and those with no office.
 */
export async function assigneesFor(branch: string | null): Promise<Assignee[]> {
  return (await sql`
    select email, name from admin_users
    where role in ('owner', 'editor')
       or (role = 'support' and (office is null or ${branch}::text is null or office = ${branch}))
    order by lower(coalesce(nullif(name, ''), email))`) as Assignee[];
}

export async function adminName(email: string | null): Promise<string | null> {
  if (!email) return null;
  const [row] = await sql`select name from admin_users where email = ${email}`;
  return row ? String(row.name || email) : email;
}

/* ---------------- Passing a query to another office ---------------- */

export type Handover = {
  id: number;
  at: string;
  from_branch: string | null;
  to_branch: string | null;
  by_email: string | null;
  note: string | null;
  sent_to: number;
  error: string | null;
};

export async function recordHandover(
  requestId: number,
  from: string | null,
  to: string | null,
  by: string | null,
  note: string | null,
): Promise<number> {
  const [row] = await sql`
    insert into request_handovers (request_id, from_branch, to_branch, by_email, note)
    values (${requestId}, ${from}, ${to}, ${by}, ${note}) returning id`;
  return Number(row.id);
}

export async function listHandovers(requestId: number): Promise<Handover[]> {
  return (await sql`
    select id, at, from_branch, to_branch, by_email, note, sent_to, error
    from request_handovers where request_id = ${requestId} order by at, id`) as Handover[];
}

/* ---------------- Public "Track your query" ---------------- */

/** Lookups one device may make in an hour, and wrong phone digits allowed for one reference in an hour. */
const TRACK_PER_IP = 20;
const TRACK_FAILS_PER_REF = 8;

export type TrackResult =
  | { kind: 'found'; ref: string; status: RequestStatus; branch: string | null; created_at: string; updated_at: string }
  | { kind: 'not-found' }
  | { kind: 'too-many' };

const digits = (s: string) => s.replace(/\D/g, '');

/**
 * Finds a query by its reference code and the last four digits of the phone number it was sent with.
 * Only the status, office and dates are returned: never the message, notes or staff names.
 */
export async function trackRequest(refInput: string, phoneEnd: string, ip: string | null): Promise<TrackResult> {
  // Accept "NS-7K4P2Q", "ns 7k4p2q" or just "7K4P2Q". Codes are 6 characters and may themselves start with NS.
  const cleaned = refInput.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const ref = `NS-${(cleaned.length === 8 && cleaned.startsWith('NS') ? cleaned.slice(2) : cleaned).slice(0, 6)}`;
  const last4 = digits(phoneEnd).slice(-4);
  const [limits] = await sql`
    select count(*) filter (where ip = ${ip})::int as by_ip,
           count(*) filter (where ref = ${ref} and not found)::int as fails
    from track_lookups where at > now() - interval '1 hour'`;
  if ((ip && Number(limits.by_ip) >= TRACK_PER_IP) || Number(limits.fails) >= TRACK_FAILS_PER_REF) return { kind: 'too-many' };

  const [row] = await sql`
    select ref, status, branch, created_at, greatest(created_at, handled_at) as updated_at, phone
    from service_requests where ref = ${ref}`;
  const found = Boolean(row && last4.length === 4 && digits(String(row.phone)).endsWith(last4));
  // Old lookups are only needed for the hourly limits.
  await sql.transaction([
    sql`insert into track_lookups (ip, ref, found) values (${ip}, ${ref}, ${found})`,
    sql`delete from track_lookups where at < now() - interval '30 days'`,
  ]);
  if (!found) return { kind: 'not-found' };
  return {
    kind: 'found',
    ref: String(row.ref),
    status: row.status as RequestStatus,
    branch: (row.branch as string | null) ?? null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}
