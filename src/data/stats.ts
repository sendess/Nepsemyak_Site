import type { L } from '~/i18n/utils';

export type Figure = { id: string; label: L; value: number };

/** Service reach and daily waste figures published by the company. */
export const serviceStats = {
  asOf: '2025-10-28',
  reach: [
    { id: 'districts', label: { en: 'Working districts', ne: 'कार्यक्षेत्र जिल्ला' }, value: 4 },
    { id: 'municipalities', label: { en: 'Municipalities served', ne: 'सेवा पुगेका नगरपालिका' }, value: 12 },
    { id: 'wards', label: { en: 'Wards served', ne: 'सेवा पुगेका वडा' }, value: 72 },
    { id: 'houses', label: { en: 'Service-holder houses', ne: 'सेवाग्राही घर' }, value: 59229 },
    { id: 'families', label: { en: 'Service-holder families', ne: 'सेवाग्राही परिवार' }, value: 207302 },
    { id: 'population', label: { en: 'People benefiting directly', ne: 'प्रत्यक्ष लाभान्वित जनसंख्या' }, value: 829206 },
  ] satisfies Figure[],
  /** Metric tonnes per day. The first entry is the total the others are compared with. */
  wastePerDay: [
    { id: 'total', label: { en: 'Total waste collected', ne: 'सङ्कलित कुल फोहोर' }, value: 239 },
    { id: 'degradable', label: { en: 'Degradable waste', ne: 'कुहिने फोहोर' }, value: 143 },
    { id: 'segregated', label: { en: 'Degradable waste received already sorted', ne: 'छुट्याएरै प्राप्त कुहिने फोहोर' }, value: 36 },
    { id: 'usedAfter', label: { en: 'Degradable waste reused after collection', ne: 'सङ्कलनपछि सदुपयोग भएको कुहिने फोहोर' }, value: 30 },
    { id: 'compost', label: { en: 'Compost produced', ne: 'उत्पादित कम्पोस्ट मल' }, value: 6 },
    { id: 'usedAtHome', label: { en: 'Degradable waste reused at home', ne: 'घरमै सदुपयोग भएको कुहिने फोहोर' }, value: 5.5 },
  ] satisfies Figure[],
  /** Percent of service-holder families. Adds up to 100. */
  families: [
    { id: 'segregated', label: { en: 'Hand over sorted waste', ne: 'छुट्याएर फोहोर दिने' }, value: 21 },
    { id: 'mixed', label: { en: 'Hand over mixed waste', ne: 'मिसाएर फोहोर दिने' }, value: 75 },
    { id: 'organic', label: { en: 'Use organic waste themselves', ne: 'कुहिने फोहोर आफैं उपयोग गर्ने' }, value: 4 },
  ] satisfies Figure[],
  /** Percent of all waste in the Kathmandu Valley. */
  valleyShare: 15,
};

export const workforceStats = {
  asOf: '2023-08-29',
  total: 438,
  gender: [
    { id: 'men', label: { en: 'Men', ne: 'पुरुष' }, value: 80 },
    { id: 'women', label: { en: 'Women', ne: 'महिला' }, value: 20 },
  ] satisfies Figure[],
  roles: [
    { id: 'collectors', label: { en: 'Collectors, recyclers and sweepers', ne: 'सङ्कलक, पुनःप्रयोगकर्ता तथा सफाइकर्मी' }, value: 221 },
    { id: 'segregation', label: { en: 'Waste segregation workers', ne: 'फोहोर छुट्याउने कामदार' }, value: 125 },
    { id: 'drivers', label: { en: 'Drivers', ne: 'चालक' }, value: 55 },
    { id: 'management', label: { en: 'Management and administration', ne: 'व्यवस्थापन तथा प्रशासन' }, value: 27 },
    { id: 'technical', label: { en: 'Technical staff', ne: 'प्राविधिक' }, value: 10 },
  ] satisfies Figure[],
  vehicles: [
    { id: 'rickshaw', label: { en: 'Rickshaws', ne: 'रिक्सा' }, value: 25 },
    { id: 'miniTipper', label: { en: 'Mini tippers', ne: 'साना टिपर' }, value: 20 },
    { id: 'heavyTipper', label: { en: 'Heavy tippers', ne: 'ठूला टिपर' }, value: 12 },
    { id: 'tractor', label: { en: 'Tractors', ne: 'ट्र्याक्टर' }, value: 7 },
    { id: 'backhoe', label: { en: 'Backhoe loaders', ne: 'ब्याकहो लोडर' }, value: 2 },
  ] satisfies Figure[],
  facilities: [
    { id: 'compostCenter', label: { en: 'Compost production center', ne: 'कम्पोस्ट मल उत्पादन केन्द्र' }, value: 1 },
    { id: 'paperCenter', label: { en: 'Paper recycling center', ne: 'कागज पुनःप्रशोधन केन्द्र' }, value: 1 },
    { id: 'shredder', label: { en: 'Shredding machines', ne: 'फोहोर टुक्र्याउने मेसिन' }, value: 3 },
    { id: 'conveyor', label: { en: 'Conveyor belt', ne: 'कन्भेयर बेल्ट' }, value: 1 },
    { id: 'mixer', label: { en: 'Mixer', ne: 'मिक्सर' }, value: 1 },
    { id: 'turner', label: { en: 'Compost turner', ne: 'कम्पोस्ट टर्नर' }, value: 1 },
  ] satisfies Figure[],
};

export function figure(list: Figure[], id: string): number {
  const found = list.find((f) => f.id === id);
  if (!found) throw new Error(`Unknown figure: ${id}`);
  return found.value;
}
