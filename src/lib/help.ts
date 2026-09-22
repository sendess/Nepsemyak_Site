// The Help centre: topics, who sees each one, and which topic each admin page links to.
import type { IconName } from '~/components/icons';
import { HELP, PUBLIC_HELP } from './admin-routes';
import { can, type AdminRole, type Permission } from './roles';

export type HelpGroup = 'start' | 'work' | 'reference';

export const HELP_GROUPS: Record<HelpGroup, string> = {
  start: 'Getting started',
  work: 'Guides for your work',
  reference: 'Reference',
};

export const HELP_GROUPS_NE: Record<HelpGroup, string> = {
  start: 'सुरुवात',
  work: 'तपाईंको कामका निर्देशिका',
  reference: 'सन्दर्भ',
};

/** The Help centre can be read in English or Nepali; the choice is remembered in a cookie. */
export type HelpLang = 'en' | 'ne';
export const HELP_LANG_COOKIE = 'help-lang';

/** Topics written in Nepali so far; the rest show their English text with a note. */
export const NEPALI_TOPICS = ['getting-started', 'safety', 'queries'];

export type HelpTopic = {
  slug: string;
  title: string;
  summary: string;
  icon: IconName;
  group: HelpGroup;
  /** Only admins with this permission see the topic. */
  need?: Permission;
  titleNe: string;
  summaryNe: string;
};

export const HELP_TOPICS: HelpTopic[] = [
  { slug: 'getting-started', title: 'Getting started', summary: 'What to have ready, your first sign-in, and signing in after that.', icon: 'sparkles', group: 'start', titleNe: 'सुरुवात', summaryNe: 'के तयार राख्ने, पहिलो पटक साइन इन, र त्यसपछि साइन इन गर्ने तरिका।' },
  { slug: 'roles', title: 'Roles and what they can do', summary: 'Master, Editor, Customer care and Viewer, and how offices work.', icon: 'users', group: 'start', titleNe: 'भूमिका र तिनले गर्न सक्ने काम', summaryNe: 'Master, Editor, Customer care र Viewer, र कार्यालयअनुसारको पहुँच।' },
  { slug: 'safety', title: 'Keeping your account safe', summary: 'Passwords, the authenticator app, recovery codes and shared computers.', icon: 'circle-check', group: 'start', titleNe: 'आफ्नो खाता सुरक्षित राख्ने', summaryNe: 'पासवर्ड, Authenticator एप, रिकभरी कोड र साझा कम्प्युटर।' },
  { slug: 'queries', title: 'Answering queries', summary: 'Alerts, statuses, offices, who is dealing with what, notes and calling customers back.', icon: 'messages-square', group: 'work', need: 'requests.view', titleNe: 'सोधपुछको जवाफ दिने', summaryNe: 'इमेल सूचना, अवस्था, कार्यालय, जिम्मा, नोट र ग्राहकलाई फोन।' },
  { slug: 'content', title: 'Updating the website', summary: 'Notices, news, jobs, statistics and page content, in English and Nepali.', icon: 'file-text', group: 'work', need: 'content', titleNe: 'वेबसाइट अद्यावधिक गर्ने', summaryNe: 'सूचना, समाचार, रिक्त पद, तथ्याङ्क र पृष्ठका विषय, अङ्ग्रेजी र नेपालीमा।' },
  { slug: 'dashboard', title: 'The dashboard', summary: 'What each figure means, and how visitors are counted.', icon: 'chart-bar', group: 'work', titleNe: 'ड्यासबोर्ड', summaryNe: 'हरेक तथ्याङ्कको अर्थ, र आगन्तुक कसरी गनिन्छन्।' },
  { slug: 'routine', title: 'Your routine', summary: 'What to check every day, week and month in your role.', icon: 'calendar', group: 'work', titleNe: 'तपाईंको दिनचर्या', summaryNe: 'तपाईंको भूमिकामा हरेक दिन, हप्ता र महिना हेर्नुपर्ने कुरा।' },
  { slug: 'people', title: 'Managing people', summary: 'Adding staff, choosing roles and offices, and when someone leaves.', icon: 'handshake', group: 'work', need: 'people', titleNe: 'कर्मचारी व्यवस्थापन', summaryNe: 'कर्मचारी थप्ने, भूमिका र कार्यालय छान्ने, र कोही छोड्दा गर्ने काम।' },
  { slug: 'records', title: 'Activity log and stored files', summary: 'Reading the record of changes, and keeping storage under the free limit.', icon: 'folder-open', group: 'work', need: 'activity', titleNe: 'Activity अभिलेख र फाइल', summaryNe: 'परिवर्तनको अभिलेख पढ्ने, र भण्डारण निःशुल्क सीमाभित्र राख्ने।' },
  { slug: 'troubleshooting', title: 'When something goes wrong', summary: 'Codes that don’t arrive, lost phones, missing alerts and more.', icon: 'info', group: 'reference', titleNe: 'समस्या आए के गर्ने', summaryNe: 'कोड नआउने, फोन हराउने, इमेल सूचना नआउने र अन्य।' },
  { slug: 'glossary', title: 'Words used in the panel', summary: 'Reference code, status, banner, draft, “as of” date and other terms.', icon: 'book-open', group: 'reference', titleNe: 'प्यानलका शब्दहरू', summaryNe: 'सन्दर्भ नम्बर, अवस्था, ब्यानर, ड्राफ्ट, “as of” मिति र अन्य शब्द।' },
  { slug: 'whats-new', title: 'What’s new', summary: 'Changes to the admin panel, newest first.', icon: 'megaphone', group: 'reference', titleNe: 'नयाँ के छ', summaryNe: 'एडमिन प्यानलमा भएका परिवर्तन, नयाँ पहिले।' },
];

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

/** Reads ?lang= (and remembers it) or the remembered choice. */
export function helpLang(url: URL, cookies: import('astro').AstroCookies): HelpLang {
  const asked = url.searchParams.get('lang');
  if (asked === 'en' || asked === 'ne') {
    cookies.set(HELP_LANG_COOKIE, asked, { path: HELP, maxAge: 60 * 60 * 24 * 365, sameSite: 'lax', httpOnly: true, secure: url.protocol === 'https:' });
    return asked;
  }
  return cookies.get(HELP_LANG_COOKIE)?.value === 'ne' ? 'ne' : 'en';
}

export const topicTitle = (t: HelpTopic, lang: HelpLang) => (lang === 'ne' ? t.titleNe : t.title);
export const topicSummary = (t: HelpTopic, lang: HelpLang) => (lang === 'ne' ? t.summaryNe : t.summary);

/** One-line role descriptions in Nepali (role names stay in English, as they appear in the panel). */
export const ROLE_SUMMARY_NE: Record<AdminRole, string> = {
  owner: 'सबै काम, कर्मचारी व्यवस्थापन, Activity अभिलेख र भण्डारण गरिएका फाइलसहित।',
  editor: 'वेबसाइट अद्यावधिक गर्छ (सूचना, समाचार, रिक्त पद, तथ्याङ्क, पृष्ठ) र सोधपुछको जवाफ दिन्छ।',
  support: 'ग्राहकका सोधपुछको जवाफ दिन्छ, एउटा वा सबै कार्यालयका। वेबसाइट बदल्न सक्दैन।',
  viewer: 'ड्यासबोर्ड र सोधपुछ पढ्छ। केही पनि बदल्न सक्दैन।',
};
