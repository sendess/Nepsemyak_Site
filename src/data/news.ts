import type { L } from '~/i18n/utils';

export type NewsFeed = { id: string; name: L; pageUrl: string };

/** Facebook pages where offices post their activities. */
export const newsFeeds: NewsFeed[] = [
  { id: 'central', name: { en: 'Central office (NEPCEMAC)', ne: 'केन्द्रीय कार्यालय (NEPCEMAC)' }, pageUrl: 'https://www.facebook.com/NEPCEMAC1' },
  { id: 'lalitpur', name: { en: 'Lalitpur Field Office', ne: 'ललितपुर क्षेत्रीय कार्यालय' }, pageUrl: 'https://www.facebook.com/profile.php?id=100083684913320' },
  { id: 'swoyambhu', name: { en: 'Swoyambhu Branch', ne: 'स्वयम्भू शाखा' }, pageUrl: 'https://www.facebook.com/profile.php?id=100064372284562' },
];

export function facebookPluginUrl(pageUrl: string, height = 720): string {
  const params = new URLSearchParams({
    href: pageUrl,
    tabs: 'timeline',
    width: '500',
    height: String(height),
    small_header: 'true',
    adapt_container_width: 'true',
    hide_cover: 'false',
    show_facepile: 'false',
  });
  return `https://www.facebook.com/plugins/page.php?${params}`;
}
