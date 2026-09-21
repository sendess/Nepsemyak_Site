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
export type RequestFilter = 'status' | 'topic' | 'branch';

export const REQUEST_LIST: ListSpec<RequestSort, RequestFilter> = {
  id: 'requests',
  sorts: { received: 'desc', name: 'asc', topic: 'asc', branch: 'asc', status: 'asc' },
  defaultSort: 'received',
  filters: {
    status: REQUEST_STATUSES,
    topic: REQUEST_TOPICS,
    branch: [...branches.map((b) => b.id), 'unsure'],
  },
};

// New first, then in progress, resolved, and spam last.
const requestState = sql`array_position(array['new', 'in_progress', 'resolved', 'spam'], status)`;

export async function listRequests(list: ListState<RequestSort, RequestFilter>): Promise<Page<ServiceRequest>> {
  const { status, topic, branch } = list.filters;
  const conds = [];
  if (status) conds.push(sql`status = ${status}`);
  if (topic) conds.push(sql`topic = ${topic}`);
  if (branch === 'unsure') conds.push(sql`branch is null`);
  else if (branch) conds.push(sql`branch = ${branch}`);
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
    select *, count(*) over()::int as total_count from service_requests
    where ${conds.reduce((acc, c) => sql`${acc} and ${c}`, sql`true`)}
    order by ${sortBy} ${sql.unsafe(list.dir === 'asc' ? 'asc' : 'desc')} nulls last, created_at desc, id desc
    limit ${list.pageSize} offset ${(list.page - 1) * list.pageSize}`;
  return { rows: rows as ServiceRequest[], total: rows.length ? Number(rows[0].total_count) : 0 };
}

export async function getRequest(id: number): Promise<ServiceRequest | null> {
  const [row] = await sql`select * from service_requests where id = ${id}`;
  return (row as ServiceRequest) ?? null;
}

export async function listNotes(requestId: number): Promise<RequestNote[]> {
  return (await sql`
    select id, at, author_email, note from request_notes where request_id = ${requestId} order by at, id`) as RequestNote[];
}

/** Changes status and/or the branch dealing with it. */
export async function updateRequest(id: number, status: RequestStatus, branch: string | null, actor: Actor) {
  await asActor(actor, [
    sql`update service_requests set status = ${status}, branch = ${branch}, handled_by = ${actor.email}, handled_at = now()
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
