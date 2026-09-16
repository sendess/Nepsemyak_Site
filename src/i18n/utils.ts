import NepaliDateModule from 'nepali-date-converter';
import { ui, type UiKey } from './ui';

// The package ships a UMD build, so the class sits on `.default` under ESM.
const NepaliDate = ((NepaliDateModule as unknown as { default?: typeof NepaliDateModule }).default ??
  NepaliDateModule) as typeof NepaliDateModule;

export const languages = { en: 'English', ne: 'नेपाली' } as const;
export type Lang = keyof typeof languages;
export const defaultLang: Lang = 'en';

/** A value that exists in both languages. */
export type L<T = string> = { en: T; ne: T };

export function getLangFromUrl(url: URL): Lang {
  return url.pathname === '/ne' || url.pathname.startsWith('/ne/') ? 'ne' : 'en';
}

/** Path without the language prefix, always starting with "/". */
export function stripLang(pathname: string): string {
  const stripped = pathname.replace(/^\/ne(?=\/|$)/, '');
  return stripped === '' ? '/' : stripped;
}

/** Turn a language-neutral path like "/about/#team" into the path for `lang`. */
export function localizePath(path: string, lang: Lang): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (lang === defaultLang) return clean;
  return clean === '/' ? '/ne/' : `/ne${clean}`;
}

export function useTranslations(lang: Lang) {
  return (key: UiKey): string => ui[lang][key] ?? ui[defaultLang][key];
}

export function tr<T>(value: L<T>, lang: Lang): T {
  return value[lang];
}

export function formatNumber(value: number, lang: Lang, options: Intl.NumberFormatOptions = {}): string {
  const locale = lang === 'ne' ? 'ne-NP-u-nu-deva' : 'en-US';
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 1, ...options }).format(value);
}

/** Digits only, no grouping — for years such as २०६६. */
export function formatDigits(value: number | string, lang: Lang): string {
  if (lang === 'en') return String(value);
  return String(value).replace(/[0-9]/g, (d) => '०१२३४५६७८९'[Number(d)]);
}

/** English shows the AD date; Nepali shows the Bikram Sambat date. */
export function formatDate(isoDate: string, lang: Lang): string {
  const date = new Date(`${isoDate}T12:00:00+05:45`);
  if (lang === 'ne') return new NepaliDate(date).format('DD MMMM YYYY', 'np');
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kathmandu' }).format(date);
}

/** Whole years elapsed since an ISO date. */
export function yearsSince(isoDate: string, now = new Date()): number {
  const start = new Date(`${isoDate}T00:00:00+05:45`);
  let years = now.getFullYear() - start.getFullYear();
  const anniversary = new Date(start);
  anniversary.setFullYear(start.getFullYear() + years);
  if (anniversary > now) years -= 1;
  return years;
}

/** "01-5441976" -> "tel:+97715441976" */
export function telHref(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('977')) return `tel:+${digits}`;
  return `tel:+977${digits.replace(/^0/, '')}`;
}
