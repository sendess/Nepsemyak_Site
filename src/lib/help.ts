// The Help centre: its topics, who sees each one, and which topic each admin page links to.
// The words themselves live in src/data/help (English and Nepali) and can be corrected by the master.
import type { AstroCookies } from 'astro';
import type { IconName } from '~/components/icons';
import { branches } from '~/data/site';
import type { HelpKey } from '~/data/help/en';
import { HELP, PUBLIC_HELP } from './admin-routes';
import { can, type AdminRole, type Permission } from './roles';
import type { HelpLang } from './help-text';

export type { HelpLang };
export type HelpGroup = 'start' | 'work' | 'reference';
export const HELP_GROUP_ORDER: HelpGroup[] = ['start', 'work', 'reference'];

export type HelpTopic = {
  slug: string;
  icon: IconName;
  group: HelpGroup;
  /** Only admins with this permission see the topic. */
  need?: Permission;
};

export const HELP_TOPICS: HelpTopic[] = [
  { slug: 'getting-started', icon: 'sparkles', group: 'start' },
  { slug: 'roles', icon: 'users', group: 'start' },
  { slug: 'safety', icon: 'circle-check', group: 'start' },
  { slug: 'queries', icon: 'messages-square', group: 'work', need: 'requests.view' },
  { slug: 'content', icon: 'file-text', group: 'work', need: 'content' },
  { slug: 'dashboard', icon: 'chart-bar', group: 'work' },
  { slug: 'routine', icon: 'calendar', group: 'work' },
  { slug: 'people', icon: 'handshake', group: 'work', need: 'people' },
  { slug: 'records', icon: 'folder-open', group: 'work', need: 'activity' },
  { slug: 'troubleshooting', icon: 'info', group: 'reference' },
  { slug: 'glossary', icon: 'book-open', group: 'reference' },
  { slug: 'whats-new', icon: 'megaphone', group: 'reference' },
];

export const topicTitleKey = (slug: string) => `topic.${slug}.title` as HelpKey;
export const topicSummaryKey = (slug: string) => `topic.${slug}.summary` as HelpKey;

export const isPublicTopic = (slug: string) => PUBLIC_HELP.includes(slug);

/** Topics this person may read: public ones before sign-in, otherwise those their role includes. */
export function topicsFor(who: { role: AdminRole } | null): HelpTopic[] {
  return HELP_TOPICS.filter((t) => (who ? !t.need || can(who, t.need) : isPublicTopic(t.slug)));
}

export const topicHref = (slug: string, anchor?: string) => `${HELP}/${slug}${anchor ? `#${anchor}` : ''}`;

/** The help each admin page links to from its top bar. */
const PAGE_HELP: [prefix: string, slug: string, anchor?: string][] = [
  ['/admin/requests', 'queries'],
  ['/admin/notices', 'content', 'notices'],
  ['/admin/news', 'content', 'news'],
  ['/admin/jobs', 'content', 'jobs'],
  ['/admin/stats', 'content', 'statistics'],
  ['/admin/pages', 'content', 'pages'],
  ['/admin/users', 'people'],
  ['/admin/activity', 'records', 'activity'],
  ['/admin/files', 'records', 'files'],
  ['/admin/account', 'safety'],
  ['/admin/no-access', 'roles'],
];

export function helpFor(path: string): string | null {
  if (path === '/admin') return topicHref('dashboard');
  const match = PAGE_HELP.find(([prefix]) => path === prefix || path.startsWith(`${prefix}/`));
  return match ? topicHref(match[1], match[2]) : null;
}

/** Who is reading a help page: null before sign-in. Topics tailor their text to it. */
export type HelpReader = { role: AdminRole; office: string | null; name: string; masterName: string | null } | null;

/** The reader's office in the page's language, for Customer care tied to one office. */
export const readerOffice = (reader: HelpReader, lang: HelpLang) =>
  reader?.role === 'support' ? (branches.find((b) => b.id === reader.office)?.name[lang] ?? null) : null;

/** The Help centre can be read in English or Nepali; the choice is remembered in a cookie. */
export const HELP_LANG_COOKIE = 'help-lang';

/** Reads ?lang= (and remembers it) or the remembered choice. */
export function helpLang(url: URL, cookies: AstroCookies): HelpLang {
  const asked = url.searchParams.get('lang');
  if (asked === 'en' || asked === 'ne') {
    cookies.set(HELP_LANG_COOKIE, asked, { path: '/admin', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax', httpOnly: true, secure: url.protocol === 'https:' });
    return asked;
  }
  return cookies.get(HELP_LANG_COOKIE)?.value === 'ne' ? 'ne' : 'en';
}
