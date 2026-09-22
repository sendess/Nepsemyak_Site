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

export type HelpTopic = {
  slug: string;
  title: string;
  summary: string;
  icon: IconName;
  group: HelpGroup;
  /** Only admins with this permission see the topic. */
  need?: Permission;
};

export const HELP_TOPICS: HelpTopic[] = [
  { slug: 'getting-started', title: 'Getting started', summary: 'What to have ready, your first sign-in, and signing in after that.', icon: 'sparkles', group: 'start' },
  { slug: 'roles', title: 'Roles and what they can do', summary: 'Master, Editor, Customer care and Viewer, and how offices work.', icon: 'users', group: 'start' },
  { slug: 'safety', title: 'Keeping your account safe', summary: 'Passwords, the authenticator app, recovery codes and shared computers.', icon: 'circle-check', group: 'start' },
  { slug: 'queries', title: 'Answering queries', summary: 'Alerts, statuses, offices, notes and calling customers back.', icon: 'messages-square', group: 'work', need: 'requests.view' },
  { slug: 'content', title: 'Updating the website', summary: 'Notices, news, jobs, statistics and page content, in English and Nepali.', icon: 'file-text', group: 'work', need: 'content' },
  { slug: 'dashboard', title: 'The dashboard', summary: 'What each figure means, and how visitors are counted.', icon: 'chart-bar', group: 'work' },
  { slug: 'routine', title: 'Your routine', summary: 'What to check every day, week and month in your role.', icon: 'calendar', group: 'work' },
  { slug: 'people', title: 'Managing people', summary: 'Adding staff, choosing roles and offices, and when someone leaves.', icon: 'handshake', group: 'work', need: 'people' },
  { slug: 'records', title: 'Activity log and stored files', summary: 'Reading the record of changes, and keeping storage under the free limit.', icon: 'folder-open', group: 'work', need: 'activity' },
  { slug: 'troubleshooting', title: 'When something goes wrong', summary: 'Codes that don’t arrive, lost phones, missing alerts and more.', icon: 'info', group: 'reference' },
  { slug: 'glossary', title: 'Words used in the panel', summary: 'Reference code, status, banner, draft, “as of” date and other terms.', icon: 'book-open', group: 'reference' },
  { slug: 'whats-new', title: 'What’s new', summary: 'Changes to the admin panel, newest first.', icon: 'megaphone', group: 'reference' },
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
