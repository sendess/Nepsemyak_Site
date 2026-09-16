import type { L } from '~/i18n/utils';

/** Answers are short paragraphs; an optional list follows the first paragraph. */
export type Faq = { id: string; question: L; answer: L; points?: L[]; closing?: L };

export const faqs: Faq[] = [
  {
    id: 'fees-differ',
    question: {
      en: 'Why aren’t all customers charged the same fee?',
      ne: 'सबै सेवाग्राहीबाट एउटै शुल्क किन लिइँदैन?',
    },
    answer: { en: 'Our fee depends mainly on:', ne: 'शुल्क मुख्यतः यी कुरामा भर पर्छ:' },
    points: [
      { en: 'the quantity and type of waste collected', ne: 'सङ्कलन गरिने फोहोरको परिमाण तथा प्रकृति' },
      { en: 'the number of family members', ne: 'परिवार सङ्ख्या' },
      { en: 'the size of the house (number of flats)', ne: 'घरको आकार (फ्ल्याट सङ्ख्या)' },
    ],
  },
  {
    id: 'missed-collection',
    question: {
      en: 'Why wasn’t my waste collected on the scheduled day?',
      ne: 'तोकिएको तालिकामा फोहोर किन उठेन?',
    },
    answer: {
      en: 'Collection can be delayed mainly by:',
      ne: 'मुख्यतः यी कारणले सङ्कलनमा ढिलाइ हुन सक्छ:',
    },
    points: [
      { en: 'obstacles at the landfill site', ne: 'ल्यान्डफिल साइटमा अवरोध' },
      { en: 'strikes and shutdowns', ne: 'हडताल तथा बन्द' },
      { en: 'road problems', ne: 'सडकसम्बन्धी समस्या' },
    ],
    closing: {
      en: 'When there is a problem at the landfill site, our local station fills to capacity, and we can only collect waste again once the landfill problem is solved.',
      ne: 'ल्यान्डफिल साइटमा समस्या हुँदा हाम्रो स्थानीय स्टेसन पूर्ण क्षमतामा भरिन्छ, त्यसैले ल्यान्डफिलको समस्या समाधान भएपछि मात्र फेरि सङ्कलन गर्न सकिन्छ।',
    },
  },
  {
    id: 'fee-increase',
    question: { en: 'Why does the fee keep increasing?', ne: 'शुल्क किन बढिरहन्छ?' },
    answer: {
      en: 'We don’t raise fees irregularly. Increases depend on two main factors:',
      ne: 'हामी अनियमित रूपमा शुल्क बढाउँदैनौँ। शुल्क वृद्धि दुई मुख्य कुरामा भर पर्छ:',
    },
    points: [
      {
        en: 'Changes on the customer’s side — more waste or a different type of waste, a larger family, or a bigger house (more flats).',
        ne: 'सेवाग्राहीसम्बन्धी कारण — फोहोरको परिमाण वा प्रकृति, परिवार सङ्ख्या, घरको आकार (फ्ल्याट सङ्ख्या) मा हुने वृद्धि।',
      },
      {
        en: 'General conditions — usually an increase of around 20% every two years as market and fuel prices rise.',
        ne: 'सामान्य अवस्था — बजार मूल्य, इन्धनको मूल्य आदि बढेसँगै प्रायः हरेक दुई वर्षमा करिब २० प्रतिशत।',
      },
    ],
  },
  {
    id: 'inside-compound',
    question: {
      en: 'We pay a fee — why don’t you collect waste from inside our compound?',
      ne: 'शुल्क तिरेपछि घरको कम्पाउन्डभित्रबाटै फोहोर किन नउठाउने? बाहिर किन निकाल्नुपर्ने?',
    },
    answer: { en: 'There are two main reasons:', ne: 'यसका दुई मुख्य कारण छन्:' },
    points: [
      {
        en: 'Entering every compound would increase time and cost for everyone, and covering that would mean charging customers an extra fee — which most would not welcome.',
        ne: 'हरेक घरभित्र पसेर फोहोर उठाउँदा सबैका लागि समय र खर्च बढ्छ। त्यो खर्च धान्न सेवाग्राहीसँग थप शुल्क लिनुपर्ने हुन्छ, जुन सेवाग्राहीकै दृष्टिले पनि उपयुक्त हुँदैन।',
      },
      {
        en: 'Not every customer is comfortable with collection staff entering their compound regularly, so it would not be right to impose this on anyone.',
        ne: 'सबै सेवाग्राही सङ्कलनकर्मी नियमित रूपमा आफ्नो कम्पाउन्डभित्र पसेको रुचाउँदैनन्, त्यसैले यो कसैमाथि लाद्नु उचित हुँदैन।',
      },
    ],
    closing: {
      en: 'That is why we do not collect waste from inside each household.',
      ne: 'त्यसैले हामी हरेक घरभित्र पसेर फोहोर उठाउँदैनौँ।',
    },
  },
  {
    id: 'monthly-payment',
    question: {
      en: 'Staff who collect fees ask us to pay. Is it mandatory to pay the fee that same month?',
      ne: 'शुल्क उठाउन आउने कर्मचारीले तिर्न आग्रह गर्छन्। सोही महिनामै शुल्क तिर्नु अनिवार्य हो?',
    },
    answer: {
      en: 'Our only source of revenue is our customers, while the company carries ongoing costs such as staff salaries, diesel and vehicle maintenance. Paying the service fee regularly every month is therefore essential to keep the service running smoothly.',
      ne: 'कम्पनीको आम्दानीको स्रोत सेवाग्राही मात्र हुन्, जबकि कर्मचारीको तलब, डिजेल, सवारी साधन मर्मत लगायतका खर्च नियमित रूपमा बेहोर्नुपर्छ। त्यसैले सेवा सुचारु राख्न हरेक महिना नियमित रूपमा सेवा शुल्क तिर्नु आवश्यक छ।',
    },
  },
];
