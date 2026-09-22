// The public "Track your message" form: a reference code and the last 4 digits of the phone number.
import type { APIContext } from 'astro';
import { useTranslations, type Lang } from '~/i18n/utils';
import { trackRequest, type TrackResult } from './requests';

export type TrackState = {
  values: { ref: string; phone: string };
  errors: Record<string, string>;
  result: Extract<TrackResult, { kind: 'found' }> | null;
};

/** Only the shape this site creates, so nothing odd is echoed back into the form. */
const REF_PATTERN = /^(NS-?)?[23456789CFGHJKLMNPQRSTVWXZ]{6}$/;

export function emptyTrackState(url: URL): TrackState {
  const ref = (url.searchParams.get('ref') ?? '').toUpperCase();
  return { values: { ref: REF_PATTERN.test(ref) ? ref : '', phone: '' }, errors: {}, result: null };
}

export async function handleTrackPost(context: APIContext, lang: Lang): Promise<TrackState> {
  const t = useTranslations(lang);
  const form = await context.request.formData();
  const ref = String(form.get('ref') ?? '').toUpperCase().replace(/\s+/g, '').slice(0, 12);
  // Nepali keyboards type Devanagari digits (१२३४); read them as 1234.
  const phone = String(form.get('phone') ?? '')
    .replace(/[०-९]/g, (d) => String('०१२३४५६७८९'.indexOf(d)))
    .replace(/\D/g, '')
    .slice(-4);
  const state: TrackState = { values: { ref, phone }, errors: {}, result: null };

  if (!REF_PATTERN.test(ref)) state.errors.ref = t('track.err.ref');
  if (phone.length !== 4) state.errors.phone = t('track.err.phone');
  if (Object.keys(state.errors).length) return state;

  let ip: string | null = null;
  try {
    ip = context.clientAddress?.slice(0, 64) ?? null;
  } catch {
    ip = null;
  }
  const found = await trackRequest(ref, phone, ip);
  if (found.kind === 'too-many') state.errors.form = t('track.err.tooMany');
  else if (found.kind === 'not-found') state.errors.form = t('track.err.notFound');
  else state.result = found;
  return state;
}
