// Who may do what in the admin panel. Every page and every save is checked against this
// (see src/middleware.ts), so hiding a menu item is never the only protection.
import { branches } from '~/data/site';

export const ROLES = ['owner', 'editor', 'support', 'viewer'] as const;
export type AdminRole = (typeof ROLES)[number];
/** Roles the master can give to other people. There is only ever one master. */
export const ASSIGNABLE_ROLES = ['editor', 'support', 'viewer'] as const satisfies readonly AdminRole[];
export type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];

export const ROLE_LABEL: Record<AdminRole, string> = {
  owner: 'Master',
  editor: 'Editor',
  support: 'Customer care',
  viewer: 'Viewer',
};

export const ROLE_SUMMARY: Record<AdminRole, string> = {
  owner: 'Everything, including people, the activity log and stored files.',
  editor: 'Updates the website (notices, news, jobs, statistics, pages) and answers queries.',
  support: 'Answers customer queries, for one office or all of them. Can’t change the website.',
  viewer: 'Reads the dashboard and queries. Can’t change anything.',
};

export type Permission =
  /** Notices, statistics, news, jobs, page content and image uploads. */
  | 'content'
  | 'requests.view'
  /** Status, office and notes on a query. */
  | 'requests.handle'
  | 'requests.delete'
  /** Website visitor numbers on the dashboard. */
  | 'visitors'
  | 'people'
  | 'activity'
  | 'files';

const GRANTS: Record<AdminRole, readonly Permission[]> = {
  owner: ['content', 'requests.view', 'requests.handle', 'requests.delete', 'visitors', 'people', 'activity', 'files'],
  editor: ['content', 'requests.view', 'requests.handle', 'visitors'],
  support: ['requests.view', 'requests.handle'],
  viewer: ['requests.view', 'visitors'],
};

type Who = { role: AdminRole } | null | undefined;

export const can = (who: Who, permission: Permission) => Boolean(who && GRANTS[who.role].includes(permission));

/** Admin areas and what they need. Pages not listed (dashboard, account, help) are open to every admin. */
const AREAS: [prefix: string, read: Permission, write?: Permission][] = [
  ['/admin/notices', 'content'],
  ['/admin/stats', 'content'],
  ['/admin/news', 'content'],
  ['/admin/jobs', 'content'],
  ['/admin/pages', 'content'],
  ['/api/admin/media', 'content'],
  ['/api/admin/notices', 'content'],
  ['/admin/requests', 'requests.view', 'requests.handle'],
  ['/admin/users', 'people'],
  ['/admin/activity', 'activity'],
  ['/admin/files', 'files'],
];

/** The permission a request to `path` needs, or null if any signed-in admin may make it. */
export function requiredPermission(path: string, method: string): Permission | null {
  const area = AREAS.find(([prefix]) => path === prefix || path.startsWith(`${prefix}/`));
  if (!area) return null;
  const [, read, write] = area;
  return write && !['GET', 'HEAD'].includes(method) ? write : read;
}

/** Customer care tied to an office sees that office's queries plus those with no office chosen. */
export const officeScope = (who: { role: AdminRole; office: string | null } | null | undefined) =>
  who?.role === 'support' ? who.office : null;

export const officeName = (id: string | null | undefined) => branches.find((b) => b.id === id)?.name.en ?? null;

/** "Customer care · Lalitpur Field Office", "Editor", … */
export function roleLine(who: { role: AdminRole; office: string | null }) {
  if (who.role !== 'support') return ROLE_LABEL[who.role];
  return `${ROLE_LABEL.support} · ${officeName(who.office) ?? 'All offices'}`;
}

export const isOffice = (id: string) => branches.some((b) => b.id === id);
