// Sorting, filtering, search and paging for admin lists, read from the URL.
// Only whitelisted values get through, so they can safely choose SQL fragments.
import type { AstroCookies } from 'astro';

export type SortDir = 'asc' | 'desc';

export type ListSpec<S extends string, F extends string> = {
  /** Also names the cookie that remembers each person's chosen sort. */
  id: string;
  /** Sortable columns and the direction used when a column is first clicked. */
  sorts: Record<S, SortDir>;
  defaultSort: S;
  /** Filter name → allowed values. */
  filters: Record<F, readonly string[]>;
  pageSize?: number;
};

export type ListState<S extends string = string, F extends string = string> = {
  path: string;
  sort: S;
  dir: SortDir;
  q: string;
  filters: Partial<Record<F, string>>;
  page: number;
  pageSize: number;
  spec: ListSpec<S, F>;
};

const isDir = (v: unknown): v is SortDir => v === 'asc' || v === 'desc';

export function readList<S extends string, F extends string>(
  url: URL,
  cookies: AstroCookies,
  spec: ListSpec<S, F>,
): ListState<S, F> {
  const params = url.searchParams;
  const isSort = (v: unknown): v is S => typeof v === 'string' && Object.hasOwn(spec.sorts, v);
  const cookieName = `admin-sort-${spec.id}`;

  let sort = spec.defaultSort;
  let dir = spec.sorts[sort];
  const requested = params.get('sort');
  if (isSort(requested)) {
    sort = requested;
    const d = params.get('dir');
    dir = isDir(d) ? d : spec.sorts[sort];
    cookies.set(cookieName, `${sort}.${dir}`, {
      path: '/admin',
      httpOnly: true,
      sameSite: 'lax',
      secure: url.protocol === 'https:',
      maxAge: 60 * 60 * 24 * 180,
    });
  } else {
    const [s, d] = (cookies.get(cookieName)?.value ?? '').split('.');
    if (isSort(s) && isDir(d)) [sort, dir] = [s, d];
  }

  const filters: Partial<Record<F, string>> = {};
  for (const [name, allowed] of Object.entries(spec.filters) as [F, readonly string[]][]) {
    const value = params.get(name);
    if (value && allowed.includes(value)) filters[name] = value;
  }

  const page = Number(params.get('page'));
  return {
    path: url.pathname,
    sort,
    dir,
    q: (params.get('q') ?? '').trim().slice(0, 100),
    filters,
    page: Number.isInteger(page) && page > 1 ? page : 1,
    pageSize: spec.pageSize ?? 25,
    spec,
  };
}

type Changes = Partial<Pick<ListState, 'sort' | 'dir' | 'q' | 'page'>> & { filters?: Record<string, string | undefined> };

/** Link to the same list with some settings changed. Changing sort, search or filters goes back to page 1. */
export function listHref(list: ListState, changes: Changes = {}): string {
  const next = { ...list, ...changes, filters: { ...list.filters, ...changes.filters } };
  if (changes.page === undefined) next.page = 1;
  const params = new URLSearchParams();
  for (const [name, value] of Object.entries(next.filters)) if (value) params.set(name, value);
  if (next.q) params.set('q', next.q);
  params.set('sort', next.sort);
  params.set('dir', next.dir);
  if (next.page > 1) params.set('page', String(next.page));
  return `${list.path}?${params}`;
}

/** Whether a search or filter is narrowing the list. */
export const isFiltered = (list: ListState) => Boolean(list.q) || Object.values(list.filters).some(Boolean);

/** `%text%` for ILIKE, with the wildcard characters in the search text escaped. */
export const likePattern = (q: string) => `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
