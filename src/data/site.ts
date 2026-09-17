import type { L } from '~/i18n/utils';

export const org = {
  name: { en: 'Nepsemyak', ne: 'नेप्सेम्याक' } satisfies L,
  legalName: { en: 'Nepsemyak Sewa Pvt. Ltd.', ne: 'नेप्सेम्याक सेवा प्रा.लि.' } satisfies L,
  tagline: { en: 'Nepal’s renowned company for waste management', ne: 'फोहोरमैला व्यवस्थापनमा नेपालकै प्रतिष्ठित कम्पनी' } satisfies L,
  slogan: {
    en: 'Good hands are our friends, our environment is in our hands',
    ne: 'असल हात हाम्रा मित्र, हाम्रो वातावरण हाम्रै हातमा',
  } satisfies L,
  description: {
    en: 'Nepsemyak Sewa Pvt. Ltd. collects, transports, recycles and composts solid waste for households across the Kathmandu Valley.',
    ne: 'नेप्सेम्याक सेवा प्रा.लि. काठमाडौं उपत्यकाका घरधुरीबाट ठोस फोहोर सङ्कलन, ढुवानी, पुनःप्रशोधन तथा कम्पोस्ट मल उत्पादन गर्छ।',
  } satisfies L,
  email: 'nepsemyak@gmail.com',
  mainPhone: '01-5441976',
  /** Poush 2066 BS — used to compute years of service. */
  establishedOn: '2009-12-16',
  /** Baisakh 16, 2054 BS — NEPCEMAC registration, used to compute years of experience. */
  experienceSince: '1997-04-28',
  chatUrl: 'https://tawk.to/chat/600c5495c31c9117cb71bab4/1eso2kqh7',
  youtubeVideoId: '05YkUGyGrNE',
  youtubeChannel: 'https://www.youtube.com/@नेप्सेम्याकसेवा',
};

export type Branch = {
  id: string;
  name: L;
  address: L;
  phones: string[];
  email: string;
  /** Map pin. Taken from each office's Google Maps listing — correct it here if a pin is off. */
  location: { lat: number; lng: number };
  /** Short place name used as the map label. */
  area: L;
  facebook?: string;
};

export const branches: Branch[] = [
  {
    id: 'central',
    name: { en: 'Central Secretariat', ne: 'केन्द्रीय सचिवालय' },
    address: { en: 'Bagdol Road, Lalitpur 44600', ne: 'बागडोल सडक, ललितपुर ४४६००' },
    phones: ['01-5441976', '01-5446926'],
    email: 'nepsemyak@gmail.com',
    location: { lat: 27.6654319, lng: 85.2976023 },
    area: { en: 'Bagdol, Lalitpur', ne: 'बागडोल, ललितपुर' },
  },
  {
    id: 'lalitpur',
    name: { en: 'Lalitpur Field Office', ne: 'ललितपुर क्षेत्रीय कार्यालय' },
    address: { en: 'Bagdol Road, Lalitpur 44600', ne: 'बागडोल सडक, ललितपुर ४४६००' },
    phones: ['01-5432827'],
    email: 'nepsemyak@gmail.com',
    location: { lat: 27.6654319, lng: 85.2976023 },
    area: { en: 'Bagdol, Lalitpur', ne: 'बागडोल, ललितपुर' },
    facebook: 'https://www.facebook.com/nepsemyak.lalitpurabranch',
  },
  {
    id: 'swoyambhu',
    name: { en: 'Swoyambhu Branch', ne: 'स्वयम्भू शाखा' },
    address: { en: 'Sano Bharyang, Kathmandu', ne: 'सानो भर्याङ, काठमाडौं' },
    phones: ['01-5384561'],
    email: 'nepsemyak@gmail.com',
    location: { lat: 27.7202153, lng: 85.2895306 },
    area: { en: 'Swoyambhu', ne: 'स्वयम्भू' },
    facebook: 'https://www.facebook.com/NepsemyakSwayambhu',
  },
  {
    id: 'maharajgunj',
    name: { en: 'Maharajgunj Branch', ne: 'महाराजगञ्ज शाखा' },
    address: { en: 'Banshidhar Marga, Chandol, Kathmandu', ne: 'बंशीधर मार्ग, चण्डोल, काठमाडौं' },
    phones: ['01-4528800'],
    email: 'nepsemyak@gmail.com',
    location: { lat: 27.7319066, lng: 85.3404285 },
    area: { en: 'Maharajgunj', ne: 'महाराजगञ्ज' },
  },
  {
    id: 'bhaktapur',
    name: { en: 'Bhaktapur Branch', ne: 'भक्तपुर शाखा' },
    address: { en: 'Radhe Radhe, Madhyapur Thimi, Bhaktapur', ne: 'राधे राधे, मध्यपुर थिमी, भक्तपुर' },
    phones: ['01-6633167'],
    email: 'nepsemyak.bhaktapur@gmail.com',
    location: { lat: 27.673459, lng: 85.3974051 },
    area: { en: 'Thimi, Bhaktapur', ne: 'ठिमी, भक्तपुर' },
  },
];

export const circle: { name: L; href?: string }[] = [
  { name: { en: 'NEPCEMAC', ne: 'नेप्सेम्याक (NEPCEMAC)' }, href: 'https://nepcemac.org.np' },
  { name: { en: 'Pariwartan', ne: 'परिवर्तन' }, href: 'https://www.facebook.com/pariwartan.sewa' },
  { name: { en: 'Green City', ne: 'ग्रिन सिटी' }, href: 'https://www.facebook.com/profile.php?id=100025109945110' },
  { name: { en: 'Swastha Samaj', ne: 'स्वस्थ समाज' } },
];

/** Google Maps directions to an exact point (people in Nepal mostly navigate with Google Maps). */
export function directionsUrl({ lat, lng }: Branch['location']): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}
