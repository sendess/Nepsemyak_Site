import type { L } from '~/i18n/utils';
import type { IconName } from '~/components/icons';

export type JourneyStep = { icon: IconName; title: L; text: L };

export const journey: JourneyStep[] = [
  {
    icon: 'house',
    title: { en: 'Doorstep collection', ne: 'घरदैलोबाट सङ्कलन' },
    text: {
      en: 'Small vehicles collect from registered homes, starting at 5 or 6 AM.',
      ne: 'बिहान ५ वा ६ बजेदेखि दर्ता भएका घरबाट साना सवारी साधनले फोहोर उठाउँछन्।',
    },
  },
  {
    icon: 'warehouse',
    title: { en: 'Transfer station', ne: 'ट्रान्सफर स्टेसन' },
    text: {
      en: 'Loads are sorted and salable, reusable items are separated out.',
      ne: 'फोहोर छुट्याई बिक्रीयोग्य तथा पुनःप्रयोगयोग्य वस्तु अलग गरिन्छ।',
    },
  },
  {
    icon: 'recycle',
    title: { en: 'Recycling', ne: 'पुनःप्रशोधन' },
    text: {
      en: 'Paper is recycled at our Gokarna plant and plastic is made into pipes in Balaju.',
      ne: 'गोकर्णमा कागज पुनःप्रशोधन गरिन्छ भने बालाजुमा प्लास्टिकबाट पाइप बनाइन्छ।',
    },
  },
  {
    icon: 'sprout',
    title: { en: 'Composting', ne: 'कम्पोस्ट' },
    text: {
      en: 'Degradable waste becomes compost for farmers and roadside plants.',
      ne: 'कुहिने फोहोरबाट किसान तथा सडक किनारका बिरुवाका लागि कम्पोस्ट मल बनाइन्छ।',
    },
  },
  {
    icon: 'mountain',
    title: { en: 'Landfill', ne: 'ल्यान्डफिल' },
    text: {
      en: 'Only what is left goes to the Bancharedanda landfill in Nuwakot.',
      ne: 'बाँकी रहेको फोहोर मात्र नुवाकोटको बन्चरेडाँडा ल्यान्डफिलमा पठाइन्छ।',
    },
  },
];

export const sortingGuide = {
  degradable: [
    { en: 'Food scraps and leftovers', ne: 'खानाको बाँकी भाग' },
    { en: 'Vegetable and fruit peels', ne: 'तरकारी तथा फलफूलका बोक्रा' },
    { en: 'Used tea leaves', ne: 'प्रयोग भइसकेको चियापत्ती' },
    { en: 'Flowers, leaves and garden waste', ne: 'फूल, पात तथा बगैंचाको फोहोर' },
    { en: 'Eggshells', ne: 'अण्डाका बोक्रा' },
  ] satisfies L[],
  nonDegradable: [
    { en: 'Plastic bags, wrappers and bottles', ne: 'प्लास्टिकका झोला, खोल तथा बोतल' },
    { en: 'Paper and cardboard', ne: 'कागज तथा कार्टुन' },
    { en: 'Glass bottles and jars', ne: 'सिसाका बोतल तथा भाँडा' },
    { en: 'Metal cans and tins', ne: 'धातुका क्यान तथा टिन' },
    { en: 'Old cloth and rubber', ne: 'पुराना कपडा तथा रबर' },
  ] satisfies L[],
  tips: [
    {
      en: 'Keep two separate containers at home — one for each type.',
      ne: 'घरमा दुई किसिमका फोहोरका लागि छुट्टाछुट्टै भाँडो राख्नुहोस्।',
    },
    {
      en: 'Bring your waste out when the collection vehicle arrives. Please don’t leave it on the road.',
      ne: 'सङ्कलन गाडी आइपुगेपछि मात्र फोहोर बाहिर निकाल्नुहोस्, सडकमा नछाड्नुहोस्।',
    },
    {
      en: 'Keep hazardous items such as batteries, bulbs and medicines apart from other waste.',
      ne: 'ब्याट्री, बल्ब, औषधि जस्ता हानिकारक वस्तु अन्य फोहोरसँग नमिसाउनुहोस्।',
    },
  ] satisfies L[],
};
