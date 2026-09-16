const NPT = 'Asia/Kathmandu';

/** Timestamp → value for <input type="datetime-local">, in Nepal time. */
export function toNptInput(value: string | Date | null): string {
  if (!value) return '';
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: NPT,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(new Date(value))
      .map((p) => [p.type, p.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

/** Short human date-time in Nepal time, e.g. "17 Sep 2026, 14:05". */
export function formatNpt(value: string | Date | null): string {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: NPT,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(value));
}

/** "YYYY-MM-DD" → "17 Sep 2026". */
export function formatDay(value: string | null): string {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(`${value}T00:00:00Z`),
  );
}

export function todayNpt(): string {
  return toNptInput(new Date()).slice(0, 10);
}

/** Parse the numeric id from a route param; "new" means create. */
export function parseId(param: string | undefined): number | 'new' | null {
  if (param === 'new') return 'new';
  const n = Number(param);
  return Number.isInteger(n) && n > 0 ? n : null;
}
