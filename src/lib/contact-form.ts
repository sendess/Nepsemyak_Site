// Handles the public contact form: checks what was typed, then saves it as a service request.
import type { APIContext } from 'astro';
import { branches } from '~/data/site';
import { localizePath, useTranslations, type Lang } from '~/i18n/utils';
import { alertNewRequest } from './notify';
import { createRequest, recentFromIp, REQUEST_TOPICS, type RequestTopic } from './requests';

export type ContactFormState = {
  errors: Record<string, string>;
  values: { name: string; phone: string; email: string; address: string; message: string; topic: string; branch: string };
};

/** Messages one visitor may send in an hour before they are asked to phone instead. */
const MAX_PER_HOUR = 5;

const clean = (value: FormDataEntryValue | null, max: number) =>
  String(value ?? '')
    .replace(/\r\n/g, '\n')
    // Drop control characters that only ever come from scripts.
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '')
    .trim()
    .slice(0, max);

/**
 * Saves the message and returns a redirect to the thank-you page, or the errors to show again.
 * Returns a plain redirect (no reference) when the hidden anti-spam field was filled in.
 */
export async function handleContactPost(context: APIContext, lang: Lang): Promise<Response | ContactFormState> {
  const t = useTranslations(lang);
  const form = await context.request.formData();
  const sentPath = localizePath('/contact/sent/', lang);

  // Real people never see this field, so anything in it means a bot.
  if (clean(form.get('company'), 200)) return context.redirect(sentPath, 303);

  const values = {
    name: clean(form.get('name'), 120),
    phone: clean(form.get('phone'), 20),
    email: clean(form.get('email'), 120),
    address: clean(form.get('address'), 160),
    message: clean(form.get('message'), 2000),
    topic: String(form.get('topic') ?? ''),
    branch: String(form.get('branch') ?? ''),
  };

  const errors: Record<string, string> = {};
  if (!values.name) errors.name = t('contact.err.name');
  if (!values.phone) errors.phone = t('contact.err.phone');
  else if (!/^[0-9+][0-9\s\-()]{5,19}$/.test(values.phone)) errors.phone = t('contact.err.phoneFormat');
  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = t('contact.err.email');
  if (!values.message) errors.message = t('contact.err.message');

  let ip: string | null = null;
  try {
    ip = context.clientAddress?.slice(0, 64) ?? null;
  } catch {
    ip = null;
  }

  if (Object.keys(errors).length === 0 && (await recentFromIp(ip)) >= MAX_PER_HOUR) {
    errors.form = t('contact.err.tooMany');
  }

  if (Object.keys(errors).length > 0) return { errors, values };

  const topic: RequestTopic = (REQUEST_TOPICS as readonly string[]).includes(values.topic) ? (values.topic as RequestTopic) : 'other';
  const branch = branches.some((b) => b.id === values.branch) ? values.branch : null;

  const input = { ...values, topic, branch, language: lang };
  let saved: { id: number; ref: string };
  try {
    saved = await createRequest(input, ip, context.request.headers.get('user-agent')?.slice(0, 300) ?? null);
  } catch {
    return { errors: { form: t('contact.err.failed') }, values };
  }

  // Email the admins. On Netlify this finishes after the visitor has been sent on, so they never wait for it.
  const alert = alertNewRequest({ ...input, ...saved });
  const netlify = context.locals.netlify?.context;
  if (netlify) netlify.waitUntil(alert);
  else await alert;

  return context.redirect(`${sentPath}?ref=${encodeURIComponent(saved.ref)}`, 303);
}
