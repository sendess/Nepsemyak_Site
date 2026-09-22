// Email alerts to admins, sent through Resend (free plan: 3,000 emails a month, 100 a day).
// One email per query, addressed to every admin who has alerts turned on. Sending never gets in
// the visitor's way: if Resend is down or not set up, the query is still saved and shows in the inbox.
import { RESEND_API_KEY } from 'astro:env/server';
import { branches } from '~/data/site';
import { sql } from './db';
import { TOPIC_LABEL, type RequestInput } from './requests';

/** Must be on the domain verified in Resend. Nobody reads this mailbox: replies go to the customer (see replyTo). */
export const SENDER = 'Nepsemyak website <no-reply@nepsemyak.com.np>';
const SITE = 'https://nepsemyak.com.np';

export const emailConfigured = () => Boolean(RESEND_API_KEY);

type Mail = { to: string[]; subject: string; text: string; html: string; replyTo?: string };
export type SendResult = { ok: true } | { ok: false; error: string };

export async function sendEmail(mail: Mail): Promise<SendResult> {
  if (!RESEND_API_KEY) return { ok: false, error: 'Email sending is not set up (RESEND_API_KEY is missing)' };
  let res: Response;
  try {
    res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${RESEND_API_KEY}`, 'content-type': 'application/json', 'user-agent': 'nepsemyak-site' },
      body: JSON.stringify({
        from: SENDER,
        to: mail.to,
        subject: mail.subject,
        text: mail.text,
        html: mail.html,
        ...(mail.replyTo ? { reply_to: mail.replyTo } : {}),
      }),
      signal: AbortSignal.timeout(8000),
    });
  } catch (err) {
    return { ok: false, error: err instanceof Error && err.name === 'TimeoutError' ? 'The email service took too long to answer' : 'Could not reach the email service' };
  }
  if (res.ok) return { ok: true };
  const body = (await res.json().catch(() => null)) as { message?: string } | null;
  return { ok: false, error: (body?.message ?? `The email service answered ${res.status}`).slice(0, 300) };
}

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const oneLine = (s: string) => s.replace(/\s+/g, ' ').trim();
const nepalTime = (d: Date) =>
  new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kathmandu' }).format(d);

/** A plain, table-based layout: email programs ignore most modern CSS. */
function layout(heading: string, intro: string, rows: [string, string][], body: string, button: { href: string; label: string }, footer: string) {
  const cell = 'padding:6px 12px 6px 0;vertical-align:top;font-size:14px;';
  return `<!doctype html><html><body style="margin:0;padding:24px;background:#f4f6f3;font-family:Segoe UI,Arial,sans-serif;color:#1f2a24">
<table role="presentation" width="100%" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:10px;border-top:4px solid #459a2e">
<tr><td style="padding:24px">
<h1 style="margin:0 0 6px;font-size:20px;color:#2c4964">${escapeHtml(heading)}</h1>
<p style="margin:0 0 16px;font-size:14px;color:#4d4a60">${escapeHtml(intro)}</p>
<table role="presentation">${rows.map(([k, v]) => `<tr><td style="${cell}color:#4d4a60;white-space:nowrap">${escapeHtml(k)}</td><td style="${cell}">${v}</td></tr>`).join('')}</table>
${body}
<p style="margin:20px 0 0"><a href="${button.href}" style="display:inline-block;padding:10px 18px;border-radius:8px;background:#459a2e;color:#ffffff;font-weight:600;text-decoration:none;font-size:14px">${escapeHtml(button.label)}</a></p>
</td></tr></table>
<p style="max-width:560px;margin:12px auto 0;font-size:12px;color:#6b7280">${footer}</p>
</body></html>`;
}

type NewRequest = RequestInput & { id: number; ref: string; created_at?: string };

type QueryMail = {
  heading: string;
  subject: string;
  /** Who did what, shown above the details (the hand-over and assignment emails). */
  lead?: string;
  extra?: [string, string][];
};

/** An email about one query: its details, the message and a button to open it in the panel. */
function queryEmail(req: NewRequest, to: string[], mail: QueryMail): Mail {
  const topic = TOPIC_LABEL[req.topic];
  const office = branches.find((b) => b.id === req.branch)?.name.en ?? 'Not chosen';
  const link = `${SITE}/admin/requests/${req.id}`;
  const message = req.message.length > 1500 ? `${req.message.slice(0, 1500)}…` : req.message;
  const details: [string, string][] = [
    ...(mail.extra ?? []),
    ['Reference', req.ref],
    ['Received', nepalTime(req.created_at ? new Date(req.created_at) : new Date())],
    ['About', topic],
    ['Office', office],
    ['Name', req.name],
    ['Phone', req.phone],
    ...(req.email ? ([['Email', req.email]] as [string, string][]) : []),
    ...(req.address ? ([['Address', req.address]] as [string, string][]) : []),
    ['Written in', req.language === 'ne' ? 'Nepali' : 'English'],
  ];
  const reply = req.email
    ? 'Replying to this email writes to the customer directly. Remember to update the query in the admin panel too.'
    : 'The customer left no email address, so please phone them.';
  const intro = mail.lead ? `${mail.lead} ${reply}` : reply;
  return {
    to,
    replyTo: req.email || undefined,
    subject: oneLine(mail.subject).slice(0, 180),
    text: [
      mail.lead ?? 'A new query was sent from the website contact form.',
      '',
      ...details.map(([k, v]) => `${k}: ${v}`),
      '',
      'Message:',
      message,
      '',
      `Open it in the admin panel: ${link}`,
      '',
      reply,
      `You get these emails because alerts are on in My account (${SITE}/admin/account).`,
    ].join('\n'),
    html: layout(
      mail.heading,
      intro,
      details.map(([k, v]) => [
        k,
        k === 'Phone' ? `<a href="tel:${escapeHtml(v.replace(/[^0-9+]/g, ''))}">${escapeHtml(v)}</a>` : k === 'Reference' ? `<strong>${escapeHtml(v)}</strong>` : escapeHtml(v),
      ]),
      `<p style="margin:16px 0 4px;font-size:13px;color:#4d4a60">Message</p>
<div style="padding:12px 14px;border-radius:8px;background:#f4f6f3;font-size:14px;line-height:1.5;white-space:pre-wrap">${escapeHtml(message)}</div>`,
      { href: link, label: 'Open in the admin panel' },
      `You get these emails because alerts are on in <a href="${SITE}/admin/account" style="color:#2c4964">My account</a> on the Nepsemyak admin panel.`,
    ),
  };
}

function requestEmail(req: NewRequest, to: string[]): Mail {
  const office = branches.find((b) => b.id === req.branch)?.name.en ?? 'Not chosen';
  return queryEmail(req, to, {
    heading: 'New query on the website',
    subject: `New query ${req.ref}: ${TOPIC_LABEL[req.topic]} (${office}) from ${req.name}`,
  });
}

/** Emails every admin who has alerts on, and notes the outcome on the query. Never throws. */
export async function alertNewRequest(req: NewRequest): Promise<void> {
  try {
    if (!emailConfigured()) return;
    // Customer care tied to another office isn't told; queries with no office chosen go to everyone.
    const rows = await sql`
      select email from admin_users
      where notify_requests
        and (role <> 'support' or office is null or ${req.branch}::text is null or office = ${req.branch})
      order by role = 'owner' desc, email`;
    const to = rows.map((r) => String(r.email));
    const result: SendResult = to.length ? await sendEmail(requestEmail(req, to)) : { ok: true };
    await sql`
      insert into request_alerts (request_id, sent_to, error)
      values (${req.id}, ${result.ok ? to.length : 0}, ${result.ok ? null : result.error})
      on conflict (request_id) do update set attempted_at = now(), sent_to = excluded.sent_to, error = excluded.error`;
  } catch {
    // The query is saved either way; a failed alert only means nobody got an email for it.
  }
}

/** Customer care tied to this office who have alerts on: the people told when a query is passed to it. */
export async function officeRecipients(office: string): Promise<string[]> {
  const rows = await sql`
    select email from admin_users where notify_requests and role = 'support' and office = ${office} order by email`;
  return rows.map((r) => String(r.email));
}

/** Tells an office's Customer care that a query was passed to them, and notes the outcome on the hand-over. Never throws. */
export async function alertHandover(
  req: NewRequest,
  handoverId: number,
  to: string[],
  by: { name: string; fromOffice: string | null; note: string | null },
): Promise<void> {
  try {
    // Without a key sendEmail reports "not set up", which is then shown in the query's history.
    if (to.length === 0) return;
    const office = branches.find((b) => b.id === req.branch)?.name.en ?? 'your office';
    const from = branches.find((b) => b.id === by.fromOffice)?.name.en;
    const result = await sendEmail(
      queryEmail(req, to, {
        heading: `Query passed to ${office}`,
        subject: `Passed to ${office}: ${req.ref} ${TOPIC_LABEL[req.topic]} from ${req.name}`,
        lead: `${by.name} passed this query to ${office}${from ? ` from ${from}` : ''}.`,
        extra: [['Passed by', by.name], ...(by.note ? ([['Their note', by.note]] as [string, string][]) : [])],
      }),
    );
    await sql`
      update request_handovers set sent_to = ${result.ok ? to.length : 0}, error = ${result.ok ? null : result.error}
      where id = ${handoverId}`;
  } catch {
    // The hand-over is saved either way; the office still sees the query in its list.
  }
}

/** Tells someone a query was given to them by a colleague (not when they take it themselves). Never throws. */
export async function alertAssigned(req: NewRequest, assignee: string, byName: string): Promise<void> {
  try {
    if (!emailConfigured()) return;
    const [row] = await sql`select notify_requests from admin_users where email = ${assignee}`;
    if (!row?.notify_requests) return;
    await sendEmail(
      queryEmail(req, [assignee], {
        heading: 'A query was given to you',
        subject: `Assigned to you: ${req.ref} ${TOPIC_LABEL[req.topic]} from ${req.name}`,
        lead: `${byName} asked you to deal with this query.`,
        extra: [['Assigned by', byName]],
      }),
    );
  } catch {
    // The assignment is saved either way; it shows under "My queries".
  }
}

/** A sample alert to one admin, so they can check it arrives (and isn't in spam). */
export function sendTestEmail(email: string): Promise<SendResult> {
  const link = `${SITE}/admin/requests/`;
  return sendEmail({
    to: [email],
    subject: 'Test: email alerts from the Nepsemyak website work',
    text: `This is a test. When someone sends the contact form, you will get an email like this with their details.\n\nRequests inbox: ${link}`,
    html: layout(
      'Email alerts work',
      'This is a test. When someone sends the contact form, you will get an email like this with their details and a link to the query.',
      [
        ['Sent to', escapeHtml(email)],
        ['Sent at', escapeHtml(nepalTime(new Date()))],
      ],
      '',
      { href: link, label: 'Open the Requests inbox' },
      'If this landed in spam, mark it “Not spam” so the real alerts reach your inbox.',
    ),
  });
}

export type AlertStatus = { attempted_at: string; sent_to: number; error: string | null } | null;

export async function alertFor(requestId: number): Promise<AlertStatus> {
  const [row] = await sql`select attempted_at, sent_to, error from request_alerts where request_id = ${requestId}`;
  return (row as AlertStatus) ?? null;
}

/** Alerts that failed recently, for the dashboard. */
export async function failedAlerts(days = 7): Promise<{ count: number; latest: string | null }> {
  const [row] = await sql`
    select count(*)::int as count,
           (select error from request_alerts where error is not null order by attempted_at desc limit 1) as latest
    from request_alerts
    where error is not null and attempted_at > now() - make_interval(days => ${days})`;
  return { count: Number(row?.count ?? 0), latest: (row?.latest as string | null) ?? null };
}
