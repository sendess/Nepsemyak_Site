/** Small helpers for reading and validating admin form posts. */

export type FieldErrors = Record<string, string>;

export class FormReader {
  readonly errors: FieldErrors = {};
  constructor(private readonly form: FormData) {}

  text(name: string, { max = 200, required = false, label = name } = {}): string {
    const value = String(this.form.get(name) ?? '').replace(/\r\n/g, '\n').trim();
    if (required && !value) this.errors[name] = `${label} is required.`;
    else if (value.length > max) this.errors[name] = `${label} must be ${max} characters or fewer.`;
    return value;
  }

  choice<T extends string>(name: string, options: readonly T[], fallback: T): T {
    const value = String(this.form.get(name) ?? '');
    return (options as readonly string[]).includes(value) ? (value as T) : fallback;
  }

  checkbox(name: string): boolean {
    return this.form.get(name) === 'on';
  }

  /** `YYYY-MM-DD` from <input type="date">, or null when empty. */
  date(name: string, { required = false, label = name } = {}): string | null {
    const value = String(this.form.get(name) ?? '').trim();
    if (!value) {
      if (required) this.errors[name] = `${label} is required.`;
      return null;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value))) {
      this.errors[name] = `${label} is not a valid date.`;
      return null;
    }
    return value;
  }

  /** `YYYY-MM-DDTHH:mm` from <input type="datetime-local">, interpreted as Nepal time. */
  dateTime(name: string, { label = name } = {}): string | null {
    const value = String(this.form.get(name) ?? '').trim();
    if (!value) return null;
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
      this.errors[name] = `${label} is not a valid date and time.`;
      return null;
    }
    return `${value}:00+05:45`;
  }

  int(name: string, { min = 1, max = 100000, label = name } = {}): number | null {
    const value = String(this.form.get(name) ?? '').trim();
    if (!value) return null;
    const n = Number(value);
    if (!Number.isInteger(n) || n < min || n > max) {
      this.errors[name] = `${label} must be a whole number between ${min} and ${max}.`;
      return null;
    }
    return n;
  }

  url(name: string, { label = name } = {}): string | null {
    const value = String(this.form.get(name) ?? '').trim();
    if (!value) return null;
    if (!/^(https?:\/\/[^\s]+|\/[^\s]*)$/.test(value)) this.errors[name] = `${label} must start with https:// or /.`;
    return value;
  }

  /** At least one of the English / Nepali pair must be filled. */
  requireOneOf(en: string, ne: string, name: string, label: string) {
    if (!en && !ne) this.errors[name] = `${label} is required in English or Nepali.`;
  }

  get ok() {
    return Object.keys(this.errors).length === 0;
  }
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/** Split plain text into paragraphs; single line breaks stay inside a paragraph. */
export function paragraphs(text: string): string[][] {
  return text
    .split(/\n{2,}/)
    .map((p) => p.split('\n').map((line) => line.trim()))
    .filter((lines) => lines.some(Boolean));
}

/** Pick the requested language, falling back to the other one when it is empty. */
export function pickLang(en: string, ne: string, lang: 'en' | 'ne'): string {
  return lang === 'ne' ? ne || en : en || ne;
}
