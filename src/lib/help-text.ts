// The words of the Help centre: the built-in English and Nepali (src/data/help), plus corrections the
// master saves in the admin panel (table help_texts). Corrections win; "Restore original" deletes one.
import { sql } from './db';
import { asActor, type Actor } from './audit';
import { HELP_EN, HELP_NOTES, type HelpKey } from '~/data/help/en';
import { HELP_NE } from '~/data/help/ne';

export type HelpLang = 'en' | 'ne';
export type { HelpKey };
export type Vars = Record<string, string | number | null | undefined>;

export const HELP_DEFAULTS: Record<HelpLang, Record<HelpKey, string>> = { en: HELP_EN, ne: HELP_NE };
export const HELP_KEYS = Object.keys(HELP_EN) as HelpKey[];
export const isHelpKey = (key: string): key is HelpKey => key in HELP_EN;
export const helpNote = (key: HelpKey) => HELP_NOTES[key] ?? null;

/** The longest correction accepted for one line. */
export const HELP_TEXT_MAX = 3000;

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/**
 * Turns help markup into safe HTML: everything is escaped first, then only these become tags:
 * **bold**, [[Button name]], `code`, [link text](/path or #anchor). {name} is filled from `vars` (escaped).
 */
export function renderHelpText(src: string, vars: Vars = {}): string {
  let s = escapeHtml(src);
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\[\[(.+?)\]\]/g, '<span class="ui">$1</span>');
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  // Links only to pages of this site: a path starting with one slash, or an anchor on the page.
  s = s.replace(/\[([^\]]+)\]\(((?:\/(?!\/)|#)[^\s)]*)\)/g, '<a href="$2">$1</a>');
  return fillVars(s, vars, true);
}

/** The same text without markup, for places that can't hold HTML (titles, labels). */
export function plainHelpText(src: string, vars: Vars = {}): string {
  const s = src
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\[\[(.+?)\]\]/g, '“$1”')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');
  return fillVars(s, vars, false);
}

function fillVars(s: string, vars: Vars, escape: boolean) {
  return s.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = vars[name];
    if (value === undefined || value === null) return match;
    return escape ? escapeHtml(String(value)) : String(value);
  });
}

/** The {placeholders} a line uses, sorted, so a correction can be checked against the original. */
export const placeholders = (s: string) => [...new Set(s.match(/\{\w+\}/g) ?? [])].sort();

export type HelpOverride = { key: string; text: string; updated_by: string | null; updated_at: string };

export async function listHelpOverrides(lang: HelpLang): Promise<Map<string, HelpOverride>> {
  try {
    const rows = (await sql`
      select key, text, updated_by, updated_at from help_texts where lang = ${lang}`) as HelpOverride[];
    return new Map(rows.map((r) => [r.key, r]));
  } catch {
    // Help must still open if the corrections can't be read; the built-in text is always there.
    return new Map();
  }
}

export type HelpTranslator = {
  lang: HelpLang;
  /** Safe HTML for set:html. */
  html(key: HelpKey, vars?: Vars): string;
  /** Plain text, for titles and labels. */
  text(key: HelpKey, vars?: Vars): string;
};

/** Everything one help page needs to show its words in `lang`, with the master's corrections applied. */
export async function helpTranslator(lang: HelpLang): Promise<HelpTranslator> {
  const overrides = await listHelpOverrides(lang);
  const raw = (key: HelpKey) => overrides.get(key)?.text ?? HELP_DEFAULTS[lang][key] ?? HELP_EN[key] ?? key;
  return {
    lang,
    html: (key, vars) => renderHelpText(raw(key), vars),
    text: (key, vars) => plainHelpText(raw(key), vars),
  };
}

/** Saves a correction. Saving text identical to the original removes the correction instead. */
export async function saveHelpText(actor: Actor, lang: HelpLang, key: HelpKey, text: string) {
  if (text === HELP_DEFAULTS[lang][key]) return restoreHelpText(actor, lang, key);
  await asActor(actor, [
    sql`insert into help_texts (lang, key, text, updated_by) values (${lang}, ${key}, ${text}, ${actor.email})
        on conflict (lang, key) do update set text = excluded.text, updated_by = excluded.updated_by, updated_at = now()
        where help_texts.text is distinct from excluded.text`,
  ]);
}

export async function restoreHelpText(actor: Actor, lang: HelpLang, key: HelpKey) {
  await asActor(actor, [sql`delete from help_texts where lang = ${lang} and key = ${key}`]);
}

/* ---------------- Which lines belong to which page (for the editor) ---------------- */

/** The key prefix each help topic's own lines use. */
const TOPIC_PREFIX: Record<string, string> = {
  'getting-started': 'start',
  roles: 'roles',
  safety: 'safety',
  queries: 'queries',
  content: 'content',
  dashboard: 'dashboard',
  routine: 'routine',
  people: 'people',
  records: 'records',
  troubleshooting: 'trouble',
  glossary: 'glossary',
  'whats-new': 'whatsnew',
};

export const GENERAL_GROUP = 'general';

/** The lines of one help page (its title and summary first), or of the frame and Help centre home. */
export function keysFor(group: string): HelpKey[] {
  if (group === GENERAL_GROUP) return HELP_KEYS.filter((k) => /^(shell|index|group|role)\./.test(k));
  const prefix = TOPIC_PREFIX[group];
  if (!prefix) return [];
  const own = HELP_KEYS.filter((k) => k.startsWith(`${prefix}.`));
  return [`topic.${group}.title` as HelpKey, `topic.${group}.summary` as HelpKey, ...own].filter(isHelpKey);
}
