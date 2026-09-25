import type { L } from '~/i18n/utils';

// Average household figures for the Waste guide calculator. Kept apart from the page copy
// because the browser script imports it too. Sources are named in `g.calcSource`.

/** Waste per person per day in Kathmandu homes (JICA, cited by ADB 2013: 223–248 g). */
const KG_PER_PERSON_DAY = 0.235;
/** Rough loose densities (kg per litre), only for suggesting container sizes. */
const KG_PER_LITRE_DEGRADABLE = 0.4;
const KG_PER_LITRE_DRY = 0.1;
/** Days a container has to hold waste between collections (twice a week, once a week). */
const DAYS_DEGRADABLE = 4;
const DAYS_DRY = 7;
const RICE_SACK_KG = 25;

export const PEOPLE_DEFAULT = 4;
export const PEOPLE_MAX = 20;

export type MixPart = { id: 'degradable' | 'plastic' | 'paper' | 'other'; share: number; label: L };

/** Typical make-up of household waste in Nepal’s towns (ADB, 2013). */
export const mix: MixPart[] = [
  { id: 'degradable', share: 0.66, label: { en: 'Degradable', ne: 'कुहिने' } },
  { id: 'plastic', share: 0.12, label: { en: 'Plastic', ne: 'प्लास्टिक' } },
  { id: 'paper', share: 0.09, label: { en: 'Paper', ne: 'कागज' } },
  { id: 'other', share: 0.13, label: { en: 'Glass, metal, cloth and other', ne: 'सिसा, धातु, कपडा र अन्य' } },
];

const roundUpTo5 = (n: number) => Math.max(5, Math.ceil(n / 5) * 5);

export function estimate(people: number) {
  const day = people * KG_PER_PERSON_DAY;
  const degradableShare = mix[0].share;
  const compostYear = Math.round(day * degradableShare * 365);
  return {
    day,
    week: day * 7,
    year: day * 365,
    /** kg a week of each part, in the order of `mix`. */
    weekByPart: mix.map((p) => day * 7 * p.share),
    bucketDegradable: roundUpTo5((day * degradableShare * DAYS_DEGRADABLE) / KG_PER_LITRE_DEGRADABLE),
    bucketDry: roundUpTo5((day * (1 - degradableShare) * DAYS_DRY) / KG_PER_LITRE_DRY),
    compostYear,
    riceSacks: Math.max(1, Math.round(compostYear / RICE_SACK_KG)),
  };
}

export const clampPeople = (n: number) => Math.min(PEOPLE_MAX, Math.max(1, Math.round(n) || 1));
