// Editable page content. Each page is a list of sections; the website's original text is the
// default, and anything saved in the admin panel (table page_sections) takes its place.
import { randomBytes } from 'node:crypto';
import { sql } from './db';
import { asActor, type Actor } from './audit';
import { org } from '~/data/site';
import { aboutIntro, vision, mission, milestones, beforeList, achievements, challenges, longTermGoals, chairman } from '~/data/about';
import { team } from '~/data/team';
import { useTranslations, type L, type Lang } from '~/i18n/utils';

/* ---------------- Field types: how content is edited and stored ---------------- */

export type Field =
  /** One line in English and Nepali. Stored as `${name}_en` / `${name}_ne`. */
  | { type: 'text'; name: string; label: string; hint?: string; max?: number }
  /** Paragraphs (blank line between them) in both languages. */
  | { type: 'paragraphs'; name: string; label: string; hint?: string; max?: number; rows?: number }
  /** A bullet list, one point per line, in both languages. */
  | { type: 'lines'; name: string; label: string; hint?: string }
  /** An uploaded photo (media id), falling back to a built-in photo when there is one. */
  | { type: 'image'; name: string; label: string; hint?: string }
  /** Single-language text, e.g. a phone number. */
  | { type: 'plain'; name: string; label: string; hint?: string; max?: number }
  | { type: 'toggle'; name: string; label: string; hint?: string }
  | { type: 'choice'; name: string; label: string; options: { value: string; label: string }[] }
  /** A repeatable group, e.g. timeline entries or team members. */
  | { type: 'items'; name: string; label: string; itemLabel: string; hint?: string; fields: ItemField[] };

export type ItemField = Extract<Field, { type: 'text' | 'paragraphs' | 'image' | 'plain' }>;

export type Content = Record<string, unknown>;

/** Reads a bilingual value; an empty Nepali (or English) side falls back to the other. */
export function bi(content: Content, name: string): L {
  const en = String(content[`${name}_en`] ?? '');
  const ne = String(content[`${name}_ne`] ?? '');
  return { en: en || ne, ne: ne || en };
}

export const pick = (content: Content, name: string, lang: Lang) => bi(content, name)[lang];

/** Paragraphs for one language; blank lines separate them. */
export function paras(content: Content, name: string, lang: Lang): string[] {
  return pick(content, name, lang)
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/** List items for one language, one per line. */
export function lines(content: Content, name: string, lang: Lang): string[] {
  return pick(content, name, lang)
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

export type Photo = { media: string | null; builtin: string | null };

/** Uploaded photo if there is one, otherwise the built-in one (if any). */
export function photo(content: Content, name: string): Photo {
  const media = typeof content[name] === 'string' && content[name] ? String(content[name]) : null;
  const builtin = typeof content[`${name}_builtin`] === 'string' && content[`${name}_builtin`] ? String(content[`${name}_builtin`]) : null;
  return { media, builtin: media ? null : builtin };
}

export const items = (content: Content, name: string): Content[] => (Array.isArray(content[name]) ? (content[name] as Content[]) : []);

/* ---------------- Built-in photos (pre-sized files in /public/images) ---------------- */

export const BUILTIN_PHOTOS: Record<string, { src: string; srcset: string; width: number; height: number }> = {
  chairman: {
    src: '/images/chairman-560.webp',
    srcset: '/images/chairman-360.webp 360w, /images/chairman-560.webp 560w',
    width: 560,
    height: 468,
  },
  ...Object.fromEntries(
    team.map((m) => [
      `team-${m.photo}`,
      { src: `/images/team/${m.photo}-420.webp`, srcset: `/images/team/${m.photo}-280.webp 280w, /images/team/${m.photo}-420.webp 420w`, width: 420, height: 420 },
    ]),
  ),
};

/* ---------------- The pages and their sections ---------------- */

const en = useTranslations('en');
const ne = useTranslations('ne');
const both = (key: Parameters<typeof en>[0], name: string) => ({ [`${name}_en`]: en(key), [`${name}_ne`]: ne(key) });
const flat = (value: L, name: string) => ({ [`${name}_en`]: value.en, [`${name}_ne`]: value.ne });
const joinParas = (list: L[], lang: Lang) => list.map((p) => p[lang]).join('\n\n');
const joinLines = (list: L[], lang: Lang) => list.map((p) => p[lang]).join('\n');

export type SectionKind = 'intro' | 'timeline' | 'compare' | 'chairman' | 'goals' | 'links' | 'team' | 'text';

type SectionDef = { key: string; kind: SectionKind; label: string; description: string; defaults: () => Content };

/** Fields for each kind of section. */
export const FIELDS: Record<SectionKind, Field[]> = {
  intro: [
    { type: 'text', name: 'heading', label: 'Heading' },
    { type: 'paragraphs', name: 'body', label: 'Introduction', rows: 8, max: 4000, hint: 'Leave a blank line between paragraphs. The home page shows the first paragraph.' },
    { type: 'paragraphs', name: 'vision', label: 'Our vision', rows: 3, max: 1000 },
    { type: 'paragraphs', name: 'mission', label: 'Our mission', rows: 3, max: 1000 },
  ],
  timeline: [
    { type: 'text', name: 'title', label: 'Section title' },
    {
      type: 'items',
      name: 'items',
      label: 'Milestones',
      itemLabel: 'Milestone',
      hint: 'Shown in this order. The home page shows them too.',
      fields: [
        { type: 'text', name: 'year', label: 'Year', max: 40 },
        { type: 'text', name: 'title', label: 'Title', max: 160 },
        { type: 'paragraphs', name: 'text', label: 'Description', rows: 3, max: 1000 },
      ],
    },
    { type: 'toggle', name: 'show_video', label: 'Show the company video below the timeline' },
  ],
  compare: [
    { type: 'text', name: 'title', label: 'Section title' },
    { type: 'text', name: 'before_title', label: 'Left column title' },
    { type: 'lines', name: 'before', label: 'Left column points', hint: 'One point per line.' },
    { type: 'text', name: 'after_title', label: 'Right column title' },
    { type: 'lines', name: 'after', label: 'Right column points', hint: 'One point per line.' },
  ],
  chairman: [
    { type: 'text', name: 'title', label: 'Section title' },
    { type: 'text', name: 'name', label: 'Name' },
    { type: 'text', name: 'role', label: 'Position' },
    { type: 'image', name: 'photo', label: 'Photo', hint: 'A portrait works best. Shown here and on the home page.' },
    { type: 'paragraphs', name: 'excerpt', label: 'Highlighted quote', rows: 2, max: 400, hint: 'Shown large at the top of the message and on the home page.' },
    { type: 'paragraphs', name: 'message', label: 'Message', rows: 14, max: 10000, hint: 'Leave a blank line between paragraphs.' },
    { type: 'text', name: 'signoff', label: 'Closing line' },
    { type: 'paragraphs', name: 'home_quote', label: 'Second line on the home page', rows: 2, max: 600, hint: 'Shown under the highlighted quote on the home page. Leave empty to show only the quote.' },
  ],
  goals: [
    { type: 'text', name: 'challenges_title', label: 'Left list title' },
    { type: 'lines', name: 'challenges', label: 'Left list', hint: 'One point per line. Shown as a numbered list.' },
    { type: 'text', name: 'goals_title', label: 'Right list title' },
    { type: 'lines', name: 'goals', label: 'Right list', hint: 'One point per line. Shown as a numbered list.' },
  ],
  links: [{ type: 'text', name: 'title', label: 'Section title' }],
  team: [
    {
      type: 'items',
      name: 'members',
      label: 'Team members',
      itemLabel: 'Person',
      hint: 'Shown in this order; the first person is highlighted.',
      fields: [
        { type: 'text', name: 'name', label: 'Name', max: 120 },
        { type: 'text', name: 'role', label: 'Position', max: 160 },
        { type: 'plain', name: 'phone', label: 'Phone', max: 30 },
        { type: 'image', name: 'photo', label: 'Photo' },
      ],
    },
  ],
  text: [
    { type: 'text', name: 'title', label: 'Title' },
    { type: 'paragraphs', name: 'body', label: 'Text', rows: 8, max: 6000, hint: 'Leave a blank line between paragraphs.' },
    { type: 'image', name: 'image', label: 'Photo (optional)' },
    {
      type: 'choice',
      name: 'image_side',
      label: 'Photo position',
      options: [
        { value: 'right', label: 'Right of the text' },
        { value: 'left', label: 'Left of the text' },
      ],
    },
  ],
};

export const PAGES = {
  about: {
    label: 'About us',
    path: '/about',
    sections: [
      {
        key: 'intro',
        kind: 'intro',
        label: 'Introduction, vision and mission',
        description: 'The opening text with the company name, and the vision and mission cards.',
        defaults: () => ({
          heading_en: org.legalName.en,
          heading_ne: org.legalName.ne,
          body_en: joinParas(aboutIntro, 'en'),
          body_ne: joinParas(aboutIntro, 'ne'),
          ...flat(vision, 'vision'),
          ...flat(mission, 'mission'),
        }),
      },
      {
        key: 'timeline',
        kind: 'timeline',
        label: 'Our journey (timeline)',
        description: 'Milestones year by year, and the company video.',
        defaults: () => ({
          ...both('about.timelineTitle', 'title'),
          items: milestones.map((m) => ({ ...flat(m.year, 'year'), ...flat(m.title, 'title'), ...flat(m.text, 'text') })),
          show_video: true,
        }),
      },
      {
        key: 'compare',
        kind: 'compare',
        label: 'Before and now',
        description: 'Two columns comparing waste management before Nepsemyak and today.',
        defaults: () => ({
          ...both('about.beforeAfterTitle', 'title'),
          ...both('about.before', 'before_title'),
          before_en: joinLines(beforeList, 'en'),
          before_ne: joinLines(beforeList, 'ne'),
          ...both('about.now', 'after_title'),
          after_en: joinLines(achievements, 'en'),
          after_ne: joinLines(achievements, 'ne'),
        }),
      },
      {
        key: 'chairman',
        kind: 'chairman',
        label: 'Message from the chairman',
        description: 'Photo, name and the full message. The quote also appears on the home page.',
        defaults: () => ({
          ...both('about.chairmanTitle', 'title'),
          ...flat(chairman.name, 'name'),
          ...flat(chairman.role, 'role'),
          photo: null,
          photo_builtin: 'chairman',
          ...flat(chairman.excerpt, 'excerpt'),
          message_en: joinParas(chairman.message, 'en'),
          message_ne: joinParas(chairman.message, 'ne'),
          ...flat(chairman.signoff, 'signoff'),
          ...flat(chairman.message[4], 'home_quote'),
        }),
      },
      {
        key: 'goals',
        kind: 'goals',
        label: 'Challenges and long-term goals',
        description: 'Two numbered lists.',
        defaults: () => ({
          ...both('about.challengesTitle', 'challenges_title'),
          challenges_en: joinLines(challenges, 'en'),
          challenges_ne: joinLines(challenges, 'ne'),
          ...both('about.goalsTitle', 'goals_title'),
          goals_en: joinLines(longTermGoals, 'en'),
          goals_ne: joinLines(longTermGoals, 'ne'),
        }),
      },
      {
        key: 'links',
        kind: 'links',
        label: 'Links to other pages',
        description: 'Cards linking to Team, Impact and Services.',
        defaults: () => both('about.nextTitle', 'title'),
      },
    ],
  },
  team: {
    label: 'Our team',
    path: '/team',
    sections: [
      {
        key: 'members',
        kind: 'team',
        label: 'Team members',
        description: 'Everyone shown on the Team page, with photo, position and phone.',
        defaults: () => ({
          members: team.map((m) => ({
            ...flat(m.name, 'name'),
            ...flat(m.role, 'role'),
            phone: m.phone,
            photo: null,
            photo_builtin: `team-${m.photo}`,
          })),
        }),
      },
    ],
  },
} satisfies Record<string, { label: string; path: string; sections: SectionDef[] }>;

export type PageId = keyof typeof PAGES;
export const PAGE_IDS = Object.keys(PAGES) as PageId[];
export const isPageId = (value: string | undefined): value is PageId => !!value && Object.hasOwn(PAGES, value);

/* ---------------- Reading ---------------- */

export type Section = {
  key: string;
  kind: SectionKind;
  label: string;
  description: string;
  builtIn: boolean;
  visible: boolean;
  position: number;
  content: Content;
  /** True once someone has saved changes (built-in sections only). */
  edited: boolean;
  updatedBy: string | null;
  updatedAt: string | null;
};

type Row = { key: string; kind: string; position: number; visible: boolean; content: Content; updated_by: string | null; updated_at: string };

const isEmpty = (o: Content) => Object.keys(o).length === 0;

function merge(page: PageId, rows: Row[]): Section[] {
  const byKey = new Map(rows.map((r) => [r.key, r]));
  const builtIns = (PAGES[page].sections as SectionDef[]).map((def, i) => {
    const row = byKey.get(def.key);
    return {
      key: def.key,
      kind: def.kind,
      label: def.label,
      description: def.description,
      builtIn: true,
      visible: row?.visible ?? true,
      position: row?.position ?? (i + 1) * 10,
      content: { ...def.defaults(), ...(row?.content ?? {}) },
      edited: !!row && !isEmpty(row.content),
      updatedBy: row?.updated_by ?? null,
      updatedAt: row?.updated_at ?? null,
    };
  });
  const custom = rows
    .filter((r) => r.key.startsWith('custom-'))
    .map((r) => ({
      key: r.key,
      kind: 'text' as const,
      label: String(r.content.title_en || r.content.title_ne || 'New section'),
      description: 'A section added in the admin panel.',
      builtIn: false,
      visible: r.visible,
      position: r.position,
      content: r.content,
      edited: true,
      updatedBy: r.updated_by,
      updatedAt: r.updated_at,
    }));
  return [...builtIns, ...custom].sort((a, b) => a.position - b.position || a.key.localeCompare(b.key));
}

export async function getPageSections(page: PageId): Promise<Section[]> {
  const rows = (await sql`
    select key, kind, position, visible, content, updated_by, updated_at from page_sections where page = ${page}`) as Row[];
  return merge(page, rows);
}

export async function getSection(page: PageId, key: string): Promise<Section | null> {
  return (await getPageSections(page)).find((s) => s.key === key) ?? null;
}

/* ---------------- Writing (all changes are logged in the activity log) ---------------- */

/** Stores a section's position/visibility/content, creating its row if needed. */
function upsert(page: PageId, s: Pick<Section, 'key' | 'kind' | 'position' | 'visible'>, content: Content | null, actor: Actor) {
  return sql`
    insert into page_sections (page, key, kind, position, visible, content, updated_by)
    values (${page}, ${s.key}, ${s.kind}, ${s.position}, ${s.visible}, ${JSON.stringify(content ?? {})}::jsonb, ${actor.email})
    on conflict (page, key) do update set
      position = excluded.position,
      visible = excluded.visible,
      content = case when ${content === null} then page_sections.content else excluded.content end,
      updated_by = excluded.updated_by,
      updated_at = now()`;
}

export async function saveSectionContent(page: PageId, section: Section, content: Content, actor: Actor) {
  await asActor(actor, [upsert(page, section, content, actor)]);
}

/** Built-in sections go back to the website's original text. */
export async function restoreOriginal(page: PageId, section: Section, actor: Actor) {
  await asActor(actor, [upsert(page, section, {}, actor)]);
}

export async function setVisible(page: PageId, section: Section, visible: boolean, actor: Actor) {
  await asActor(actor, [upsert(page, { ...section, visible }, null, actor)]);
}

/** Swaps a section with its neighbour above or below. */
export async function moveSection(page: PageId, key: string, direction: 'up' | 'down', actor: Actor) {
  const sections = await getPageSections(page);
  const i = sections.findIndex((s) => s.key === key);
  const j = direction === 'up' ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= sections.length) return;
  // Re-number everything so positions are distinct, then swap the two.
  const ordered = sections.map((s, n) => ({ ...s, position: (n + 1) * 10 }));
  [ordered[i].position, ordered[j].position] = [ordered[j].position, ordered[i].position];
  await asActor(actor, ordered.map((s) => upsert(page, s, null, actor)));
}

export async function addCustomSection(page: PageId, actor: Actor): Promise<string> {
  const sections = await getPageSections(page);
  const key = `custom-${randomBytes(4).toString('hex')}`;
  const position = (sections.at(-1)?.position ?? 0) + 10;
  await asActor(actor, [
    sql`insert into page_sections (page, key, kind, position, visible, content, updated_by)
        values (${page}, ${key}, 'text', ${position}, false, ${JSON.stringify({ image_side: 'right' })}::jsonb, ${actor.email})`,
  ]);
  return key;
}

export async function deleteCustomSection(page: PageId, key: string, actor: Actor) {
  if (!key.startsWith('custom-')) return;
  await asActor(actor, [sql`delete from page_sections where page = ${page} and key = ${key}`]);
}

/** When each page was last edited, for the admin overview. */
export async function pageActivity(): Promise<Record<string, { edited: number; updatedAt: string | null; updatedBy: string | null }>> {
  const rows = await sql`
    select distinct on (page) page, updated_at, updated_by, count(*) over (partition by page)::int as edited
    from page_sections order by page, updated_at desc`;
  return Object.fromEntries(rows.map((r) => [r.page, { edited: Number(r.edited), updatedAt: r.updated_at, updatedBy: r.updated_by }]));
}

/* ---------------- Reading the admin form ---------------- */

const MEDIA_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const clean = (value: FormDataEntryValue | null | undefined) =>
  String(value ?? '')
    .replace(/\r\n/g, '\n')
    .trim();
const mediaId = (value: FormDataEntryValue | null | undefined) => {
  const v = clean(value);
  return MEDIA_ID.test(v) ? v.toLowerCase() : null;
};
const builtinKey = (value: FormDataEntryValue | null | undefined) => {
  const v = clean(value);
  return v && Object.hasOwn(BUILTIN_PHOTOS, v) ? v : null;
};
const limit = (f: Field | ItemField) =>
  ('max' in f && f.max) || (f.type === 'text' || f.type === 'plain' ? 200 : f.type === 'lines' ? 6000 : 4000);

/** Turns a submitted section form back into content. Fields the form doesn't know are ignored. */
export function readSectionForm(form: FormData, fields: Field[]): Content {
  const content: Content = {};
  for (const f of fields) {
    if (f.type === 'text' || f.type === 'paragraphs' || f.type === 'lines') {
      for (const lang of ['en', 'ne']) content[`${f.name}_${lang}`] = clean(form.get(`${f.name}_${lang}`)).slice(0, limit(f));
    } else if (f.type === 'image') {
      content[f.name] = mediaId(form.get(f.name));
      content[`${f.name}_builtin`] = builtinKey(form.get(`${f.name}_builtin`));
    } else if (f.type === 'plain') {
      content[f.name] = clean(form.get(f.name)).slice(0, limit(f));
    } else if (f.type === 'toggle') {
      content[f.name] = form.get(f.name) === 'on';
    } else if (f.type === 'choice') {
      const v = clean(form.get(f.name));
      content[f.name] = f.options.some((o) => o.value === v) ? v : f.options[0].value;
    } else if (f.type === 'items') {
      // Every row posts the same field names, so the n-th value of each belongs to row n.
      const count = form.getAll(`${f.name}.__row`).length;
      const column = (name: string) => form.getAll(`${f.name}.${name}`);
      const rows: Content[] = [];
      for (let i = 0; i < Math.min(count, 100); i++) {
        const row: Content = {};
        let hasText = false;
        for (const sf of f.fields) {
          if (sf.type === 'image') {
            row[sf.name] = mediaId(column(sf.name)[i]);
            row[`${sf.name}_builtin`] = builtinKey(column(`${sf.name}_builtin`)[i]);
          } else if (sf.type === 'plain') {
            row[sf.name] = clean(column(sf.name)[i]).slice(0, limit(sf));
            hasText ||= !!row[sf.name];
          } else {
            for (const lang of ['en', 'ne']) {
              row[`${sf.name}_${lang}`] = clean(column(`${sf.name}_${lang}`)[i]).slice(0, limit(sf));
              hasText ||= !!row[`${sf.name}_${lang}`];
            }
          }
        }
        // Rows left completely empty are dropped.
        if (hasText) rows.push(row);
      }
      content[f.name] = rows;
    }
  }
  return content;
}

/** Every uploaded image a section's content points to. */
export function mediaIdsIn(content: Content): string[] {
  return [...JSON.stringify(content).matchAll(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g)].map((m) => m[0]);
}

/** Drops references to images that don't exist (e.g. deleted in Files while the form was open). */
export async function withoutMissingMedia(content: Content): Promise<Content> {
  const ids = mediaIdsIn(content);
  if (ids.length === 0) return content;
  const found = new Set((await sql`select id::text from media where id = any(${ids}::uuid[])`).map((r) => String(r.id)));
  const missing = ids.filter((id) => !found.has(id));
  if (missing.length === 0) return content;
  let json = JSON.stringify(content);
  for (const id of missing) json = json.replaceAll(`"${id}"`, 'null');
  return JSON.parse(json) as Content;
}
