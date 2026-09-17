// Facts and figures shown on the website, edited under /admin/stats.
import { sql } from './db';
import { asActor, type Actor } from './audit';
import type { L } from '~/i18n/utils';

export type StatUnit = 'count' | 'mt' | 'percent';

export type StatGroupId = 'reach' | 'waste' | 'families' | 'coverage' | 'workforce' | 'gender' | 'vehicles' | 'facilities';

type GroupConfig = {
  title: string;
  description: string;
  unit: StatUnit;
  /** Staff may add their own rows (e.g. a new vehicle type). */
  allowAdd: boolean;
  /** Percentages that must add up to 100. */
  sumTo100?: boolean;
  shownOn: string;
};

/** Order here is the order in the admin panel. */
export const STAT_GROUPS: Record<StatGroupId, GroupConfig> = {
  reach: {
    title: 'Service reach',
    description: 'Districts, municipalities, wards, households and people served.',
    unit: 'count',
    allowAdd: true,
    shownOn: 'Home page and Impact page',
  },
  waste: {
    title: 'Waste handled per day',
    description: 'Daily figures in metric tonnes. The total is the bar the others are compared with.',
    unit: 'mt',
    allowAdd: true,
    shownOn: 'Home page and Impact page',
  },
  families: {
    title: 'How families hand over waste',
    description: 'Percentage of service-holder families. Must add up to 100.',
    unit: 'percent',
    allowAdd: false,
    sumTo100: true,
    shownOn: 'Impact page',
  },
  coverage: {
    title: 'Share of Kathmandu Valley waste',
    description: 'Percentage of all waste in the valley that Nepsemyak handles.',
    unit: 'percent',
    allowAdd: false,
    shownOn: 'Impact page',
  },
  workforce: {
    title: 'Employees by role',
    description: 'Number of employees in each role. The total is calculated automatically.',
    unit: 'count',
    allowAdd: true,
    shownOn: 'Impact page and Careers page',
  },
  gender: {
    title: 'Employees by gender',
    description: 'Percentage of employees. Must add up to 100.',
    unit: 'percent',
    allowAdd: false,
    sumTo100: true,
    shownOn: 'Impact page',
  },
  vehicles: {
    title: 'Vehicles',
    description: 'Number of vehicles of each type. The total is calculated automatically.',
    unit: 'count',
    allowAdd: true,
    shownOn: 'Impact page',
  },
  facilities: {
    title: 'Facilities & machinery',
    description: 'Processing centers and machines.',
    unit: 'count',
    allowAdd: true,
    shownOn: 'Impact page',
  },
};

export const STAT_GROUP_IDS = Object.keys(STAT_GROUPS) as StatGroupId[];
export const isStatGroupId = (id: string): id is StatGroupId => id in STAT_GROUPS;

export const UNIT_LABEL: Record<StatUnit, string> = { count: '', mt: 'MT', percent: '%' };

export type StatItem = {
  id: number;
  key: string | null;
  label_en: string;
  label_ne: string;
  value: number;
  sort_order: number;
  is_core: boolean;
};

export type StatGroup = {
  id: StatGroupId;
  as_of: string | null;
  updated_by: string | null;
  updated_at: string | null;
  items: StatItem[];
};

export type AllStats = Record<StatGroupId, StatGroup>;

/** A figure ready for display: bilingual label with fallback, numeric value. */
export type Figure = { id: string; label: L; value: number };

export function toFigures(group: StatGroup): Figure[] {
  return group.items.map((item) => ({
    id: item.key ?? `row-${item.id}`,
    label: { en: item.label_en || item.label_ne, ne: item.label_ne || item.label_en },
    value: item.value,
  }));
}

export function findValue(group: StatGroup, key: string): number | null {
  return group.items.find((item) => item.key === key)?.value ?? null;
}

export function sumValues(group: StatGroup): number {
  return group.items.reduce((total, item) => total + item.value, 0);
}

export async function getAllStats(): Promise<AllStats> {
  const [groups, items] = await Promise.all([
    sql`select id, as_of::text as as_of, updated_by, updated_at from stat_groups`,
    sql`select id, group_id, key, label_en, label_ne, value::float8 as value, sort_order, is_core
        from stat_items order by sort_order, id`,
  ]);

  const result = Object.fromEntries(
    STAT_GROUP_IDS.map((id) => [id, { id, as_of: null, updated_by: null, updated_at: null, items: [] as StatItem[] }]),
  ) as AllStats;

  for (const g of groups) {
    if (isStatGroupId(g.id)) Object.assign(result[g.id], { as_of: g.as_of, updated_by: g.updated_by, updated_at: g.updated_at });
  }
  for (const row of items) {
    if (isStatGroupId(row.group_id)) {
      result[row.group_id].items.push({
        id: Number(row.id),
        key: row.key,
        label_en: row.label_en,
        label_ne: row.label_ne,
        value: Number(row.value),
        sort_order: row.sort_order,
        is_core: row.is_core,
      });
    }
  }
  return result;
}

export async function getStatGroup(id: StatGroupId): Promise<StatGroup> {
  return (await getAllStats())[id];
}

export type StatRowInput = {
  id: number | null;
  label_en: string;
  label_ne: string;
  value: number;
  remove: boolean;
};

/**
 * Save a whole group in one transaction: date, edited rows, new rows and removals.
 * Core rows are never deleted. Row order follows the order submitted.
 */
export async function saveStatGroup(groupId: StatGroupId, asOf: string, rows: StatRowInput[], actor: Actor) {
  const existing = await getStatGroup(groupId);
  const byId = new Map(existing.items.map((item) => [item.id, item]));
  const queries = [
    sql`insert into stat_groups (id, as_of, updated_by, updated_at) values (${groupId}, ${asOf}, ${actor.email}, now())
        on conflict (id) do update set as_of = excluded.as_of, updated_by = excluded.updated_by, updated_at = now()`,
  ];

  let order = 0;
  for (const row of rows) {
    const current = row.id === null ? undefined : byId.get(row.id);
    if (row.id !== null && !current) continue; // row from another group or already deleted
    if (current && row.remove && !current.is_core) {
      queries.push(sql`delete from stat_items where id = ${current.id} and group_id = ${groupId} and not is_core`);
      continue;
    }
    order += 1;
    if (current) {
      queries.push(sql`
        update stat_items set label_en = ${row.label_en}, label_ne = ${row.label_ne}, value = ${row.value}, sort_order = ${order}
        where id = ${current.id} and group_id = ${groupId}`);
    } else if (!row.remove && STAT_GROUPS[groupId].allowAdd) {
      queries.push(sql`
        insert into stat_items (group_id, label_en, label_ne, value, sort_order)
        values (${groupId}, ${row.label_en}, ${row.label_ne}, ${row.value}, ${order})`);
    }
  }

  await asActor(actor, queries);
}
