import type { IconName } from '~/components/icons';
import type { L } from '~/i18n/utils';
import type { Bin } from './sorting';

/** Replace {name} placeholders. */
export const fill = (text: string, vars: Record<string, string | number>) =>
  text.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));

/** Short texts used across the Waste guide page, its tools and the poster. */
export const g = {
  title: { en: 'Waste guide', ne: 'फोहोर मार्गदर्शन' },
  lead: {
    en: 'Find the right place for anything you throw away, test yourself, see where your waste ends up and work out how much your household makes.',
    ne: 'फाल्ने हरेक वस्तु कुन फोहोरमा पर्छ खोज्नुहोस्, आफ्नो ज्ञान जाँच्नुहोस्, फोहोर कहाँ पुग्छ हेर्नुहोस् र तपाईंको घरबाट कति फोहोर निस्कन्छ हिसाब गर्नुहोस्।',
  },
  onThisPage: { en: 'On this page', ne: 'यस पृष्ठमा' },
  heroPoster: { en: 'Print the kitchen poster', ne: 'भान्साको पोस्टर प्रिन्ट गर्नुहोस्' },

  // Which bin?
  finderNav: { en: 'Which bin?', ne: 'कुन फोहोरमा?' },
  finderTitle: { en: 'Look up any item', ne: 'कुनै पनि वस्तु खोज्नुहोस्' },
  finderIntro: {
    en: 'Type what you are throwing away, in English or Nepali, and see where it goes.',
    ne: 'फाल्न लागेको वस्तुको नाम नेपाली वा अङ्ग्रेजीमा लेख्नुहोस् र कुन फोहोरमा पर्छ हेर्नुहोस्।',
  },
  finderLabel: { en: 'What are you throwing away?', ne: 'के फाल्दै हुनुहुन्छ?' },
  finderPlaceholder: { en: 'e.g. milk pouch, chiya, battery', ne: 'जस्तै: दूधको प्याकेट, चिया, ब्याट्री' },
  finderClear: { en: 'Clear search', ne: 'खोज मेटाउनुहोस्' },
  finderTry: { en: 'Try:', ne: 'यी खोज्नुहोस्:' },
  finderCount: { en: '{n} matches', ne: '{n} वटा भेटियो' },
  finderCountOne: { en: '1 match', ne: '१ वटा भेटियो' },
  finderNoneRule: {
    en: 'We have not listed that one yet. If it rots, it is degradable. If it does not, keep it clean and dry with non-degradable waste. If it could poison, cut or catch fire, keep it separate.',
    ne: 'यो वस्तु अहिलेसम्म सूचीमा छैन। कुहिन्छ भने कुहिने फोहोर। कुहिँदैन भने सफा र सुक्खा राखी नकुहिने फोहोरमा। विषालु, धारिलो वा आगो लाग्न सक्ने छ भने छुट्टै राख्नुहोस्।',
  },
  finderAsk: { en: 'Ask us about it', ne: 'हामीलाई सोध्नुहोस्' },
  finderShowAll: { en: 'Show all {n}', ne: 'सबै {n} वटा हेर्नुहोस्' },
  finderShowLess: { en: 'Show fewer', ne: 'कम देखाउनुहोस्' },
  /** Pre-filled in the contact form when someone asks about an item the finder does not know. */
  askMessage: {
    en: 'Which kind of waste is “{item}”, and how should I hand it over?',
    ne: '“{item}” कुन फोहोरमा पर्छ र कसरी बुझाउने?',
  },

  // Sorting challenge
  gameNav: { en: 'Sorting challenge', ne: 'छुट्याउने चुनौती' },
  gameEyebrow: { en: 'Sorting challenge', ne: 'छुट्याउने चुनौती' },
  gameTitle: { en: 'How well do you sort?', ne: 'तपाईं कत्तिको सही छुट्याउनुहुन्छ?' },
  gameIntro: {
    en: 'Eight everyday items, three choices. Some are trickier than they look.',
    ne: 'दैनिक प्रयोगका आठ वस्तु, तीन विकल्प। केही त देखिएभन्दा गाह्रो छन्।',
  },
  gameStart: { en: 'Start the challenge', ne: 'चुनौती सुरु गर्नुहोस्' },
  gameProgress: { en: 'Item {n} of {total}', ne: 'वस्तु {n}/{total}' },
  gameQuestion: { en: 'Where does this go?', ne: 'यो कहाँ पर्छ?' },
  gameRight: { en: 'Right!', ne: 'सही!' },
  gameWrong: { en: 'Not quite. The answer is: {bin}', ne: 'मिलेन। सही उत्तर: {bin}' },
  gameNext: { en: 'Next item', ne: 'अर्को वस्तु' },
  gameFinish: { en: 'See my score', ne: 'नतिजा हेर्नुहोस्' },
  gameScore: { en: 'You sorted {score} of {total} correctly', ne: '{total} मध्ये {score} वटा सही छुट्याउनुभयो' },
  gameBest: { en: 'Your best so far: {best} of {total}', ne: 'अहिलेसम्मको उत्कृष्ट: {total} मध्ये {best}' },
  gamePerfect: { en: 'Perfect sorting! Your collector will thank you.', ne: 'एकदमै सही! तपाईंका सङ्कलक खुसी हुनेछन्।' },
  gameGood: { en: 'Great job — just one or two to remember.', ne: 'धेरै राम्रो — एक-दुई कुरा मात्र सम्झनुपर्ने।' },
  gameOk: { en: 'Good start. Look up the ones you missed in the list above.', ne: 'राम्रो सुरुवात। छुटेका वस्तु माथिको सूचीमा हेर्नुहोस्।' },
  gameMissed: { en: 'Worth remembering', ne: 'सम्झनुपर्ने' },
  gameAgain: { en: 'Play again', ne: 'फेरि खेल्नुहोस्' },
  gameNoScript: {
    en: 'The challenge needs JavaScript. You can still use the full list above.',
    ne: 'यो खेल खेल्न JavaScript चाहिन्छ। माथिको पूरा सूची भने हेर्न सकिन्छ।',
  },

  // Where it goes
  journeyNav: { en: 'Where it goes', ne: 'कहाँ पुग्छ' },
  journeyEyebrow: { en: 'After collection', ne: 'सङ्कलनपछि' },
  journeyTitle: { en: 'Where your waste goes', ne: 'तपाईंको फोहोर कहाँ पुग्छ' },
  journeyIntro: {
    en: 'Sorting at home decides what your waste can become. Here is what happens after our vehicle collects it.',
    ne: 'घरमै छुट्याउँदा फोहोर के बन्न सक्छ भन्ने तय हुन्छ। हाम्रो गाडीले उठाएपछि यसो हुन्छ।',
  },
  journeyNote: {
    en: 'Mixed waste cannot be sorted well later: one wet peel can spoil a whole bag of paper.',
    ne: 'मिसिएको फोहोर पछि राम्ररी छुट्याउन सकिँदैन: एउटै भिजेको बोक्राले पूरै झोला कागज बिगार्न सक्छ।',
  },
  journeyMore: { en: 'More about our recycling and compost work', ne: 'हाम्रो पुनःप्रशोधन र कम्पोस्टको काम' },

  // Calculator
  calcNav: { en: 'Your household', ne: 'तपाईंको घर' },
  calcEyebrow: { en: 'Your household', ne: 'तपाईंको घर' },
  calcTitle: { en: 'How much waste does your home make?', ne: 'तपाईंको घरबाट कति फोहोर निस्कन्छ?' },
  calcIntro: {
    en: 'Choose how many people live with you for a rough estimate, based on average figures for Kathmandu households.',
    ne: 'घरमा कति जना बस्नुहुन्छ छान्नुहोस्; काठमाडौंका घरधुरीको औसत तथ्याङ्कमा आधारित अनुमान देखिन्छ।',
  },
  calcPeople: { en: 'People at home', ne: 'घरमा बस्ने सङ्ख्या' },
  calcFewer: { en: 'One person fewer', ne: 'एक जना घटाउनुहोस्' },
  calcMore: { en: 'One person more', ne: 'एक जना थप्नुहोस्' },
  calcDay: { en: 'Per day', ne: 'दैनिक' },
  calcWeek: { en: 'Per week', ne: 'साप्ताहिक' },
  calcYear: { en: 'Per year', ne: 'वार्षिक' },
  calcKg: { en: 'kg', ne: 'के.जी.' },
  calcMix: { en: 'A week’s waste, by type', ne: 'एक हप्ताको फोहोर, प्रकारअनुसार' },
  calcBuckets: { en: 'Containers that fit', ne: 'सुहाउँदो भाँडो' },
  calcBucketDeg: {
    en: 'Degradable, collected twice a week: a bucket of about {size} litres, with a lid',
    ne: 'कुहिने, हप्तामा दुई पटक सङ्कलन: करिब {size} लिटरको बिर्कोसहितको बाल्टिन',
  },
  calcBucketNon: {
    en: 'Non-degradable, collected once a week: a bin or sack of about {size} litres',
    ne: 'नकुहिने, हप्तामा एक पटक सङ्कलन: करिब {size} लिटरको भाँडो वा बोरा',
  },
  calcCompost: {
    en: 'By sorting, your home turns about {kg} kg of waste a year into compost instead of landfill — the weight of {sacks} sacks of rice (25 kg each).',
    ne: 'छुट्याउँदा तपाईंको घरबाट वर्षमा करिब {kg} के.जी. फोहोर ल्यान्डफिलमा जानुको सट्टा कम्पोस्ट मल बन्छ — २५ के.जी.का {sacks} बोरा चामलजति।',
  },
  calcSource: {
    en: 'Estimate only. About 0.24 kg per person a day (JICA study of Kathmandu, cited by ADB, 2013) and a typical mix of 66% degradable, 12% plastic and 9% paper (ADB, 2013). Every household is different.',
    ne: 'अनुमान मात्र। प्रतिव्यक्ति दैनिक करिब ०.२४ के.जी. (काठमाडौंसम्बन्धी जाइकाको अध्ययन, एडीबी २०१३ मा उद्धृत) र सामान्यतया ६६% कुहिने, १२% प्लास्टिक र ९% कागज (एडीबी, २०१३)। हरेक घर फरक हुन्छ।',
  },

  // Compost at home
  compostNav: { en: 'Compost at home', ne: 'घरमै कम्पोस्ट' },
  compostEyebrow: { en: 'Compost at home', ne: 'घरमै कम्पोस्ट' },
  compostTitle: { en: 'Turn kitchen waste into free fertiliser', ne: 'भान्साको फोहोरबाट निःशुल्क मल' },
  compostIntro: {
    en: 'About two thirds of household waste rots. A bucket or a corner of the garden is enough to turn it into compost for your plants.',
    ne: 'घरको फोहोरमध्ये झन्डै दुई तिहाइ कुहिने हुन्छ। एउटा बाल्टिन वा बगैँचाको एक कुना भए यसलाई बिरुवाका लागि कम्पोस्ट मल बनाउन पुग्छ।',
  },
  compostAvoid: { en: 'Keep these out of a home compost', ne: 'घरको कम्पोस्टमा यी नहाल्नुहोस्' },
  compostFix: { en: 'If something goes wrong', ne: 'समस्या आएमा' },
  compostManuals: {
    en: 'Our composting manuals: pit, pile, bin, vermi and bokashi methods',
    ne: 'हाम्रा कम्पोस्ट निर्देशिका: खाडल, थुप्रो, बिन, गँड्यौला र बोकासी विधि',
  },
  compostTraining: {
    en: 'We also train schools, women’s groups and local organisations in composting.',
    ne: 'विद्यालय, आमा समूह र स्थानीय संस्थालाई कम्पोस्ट बनाउने तालिम पनि दिन्छौँ।',
  },
  compostAskTraining: { en: 'Ask about training', ne: 'तालिमबारे सोध्नुहोस्' },
  trainingMessage: {
    en: 'We would like composting training for our group. Please tell us how to arrange it.',
    ne: 'हाम्रो समूहका लागि कम्पोस्ट बनाउने तालिम चाहियो। कसरी मिलाउन सकिन्छ, जानकारी दिनुहोस्।',
  },

  // Festivals and events
  festNav: { en: 'Festivals & events', ne: 'चाडपर्व र भोज' },
  festEyebrow: { en: 'Festivals and events', ne: 'चाडपर्व र भोजभतेर' },
  festTitle: { en: 'Celebrate without the mess', ne: 'फोहोरविना उत्सव मनाऔँ' },
  festIntro: {
    en: 'Festivals, weddings and bhoj produce a lot of waste in a few days. A little planning keeps it sorted.',
    ne: 'चाडपर्व, विवाह र भोजमा थोरै दिनमै धेरै फोहोर निस्कन्छ। अलिकति योजना बनाए फोहोर छुट्याउन सजिलो हुन्छ।',
  },

  // Myth or fact
  mythNav: { en: 'Myth or fact?', ne: 'भ्रम कि तथ्य?' },
  mythEyebrow: { en: 'Myth or fact?', ne: 'भ्रम कि तथ्य?' },
  mythTitle: { en: 'Common beliefs, checked', ne: 'आम धारणा र वास्तविकता' },
  mythIntro: { en: 'Guess first, then open a card to see the answer.', ne: 'पहिले अनुमान गर्नुहोस्, अनि उत्तर हेर्न कार्ड खोल्नुहोस्।' },
  mythShow: { en: 'Show the answer', ne: 'उत्तर हेर्नुहोस्' },
  myth: { en: 'Myth', ne: 'भ्रम' },
  fact: { en: 'Fact', ne: 'तथ्य' },

  // Poster
  posterNav: { en: 'Kitchen poster', ne: 'भान्साको पोस्टर' },
  posterTitle: { en: 'Kitchen poster', ne: 'भान्साको पोस्टर' },
  posterBandTitle: { en: 'Put the guide on your wall', ne: 'मार्गदर्शन भित्तामा टाँस्नुहोस्' },
  posterBandText: {
    en: 'A one-page A4 poster in Nepali and English for your kitchen, office or school. It prints well in colour or black and white.',
    ne: 'भान्सा, कार्यालय वा विद्यालयका लागि नेपाली र अङ्ग्रेजीमा एक पानाको A4 पोस्टर। रङ्गीन वा कालो-सेतो दुवैमा राम्रो प्रिन्ट हुन्छ।',
  },
  posterOpen: { en: 'Open the poster', ne: 'पोस्टर खोल्नुहोस्' },
  posterLead: {
    en: 'Stick it where you throw waste away, so everyone at home sorts the same way.',
    ne: 'फोहोर फाल्ने ठाउँनजिकै टाँस्नुहोस्, ताकि घरका सबैले एउटै तरिकाले छुट्याऊन्।',
  },
  posterPrint: { en: 'Print the poster', ne: 'पोस्टर प्रिन्ट गर्नुहोस्' },
  posterTip: {
    en: 'In the print window choose A4 paper. Colour looks best, but black and white works too.',
    ne: 'प्रिन्ट गर्दा A4 कागज छान्नुहोस्। रङ्गीन राम्रो देखिन्छ, कालो-सेतो पनि चल्छ।',
  },
  posterBack: { en: 'Back to the waste guide', ne: 'फोहोर मार्गदर्शनमा फर्कनुहोस्' },
} satisfies Record<string, L>;

/** What happens to each kind after collection. Facts from our services page. */
export const journey: { bin: Bin; icon: IconName; outcome: L; steps: L[] }[] = [
  {
    bin: 'degradable',
    icon: 'sprout',
    outcome: { en: 'Becomes compost', ne: 'कम्पोस्ट मल बन्छ' },
    steps: [
      { en: 'Collected on its own days, twice a week.', ne: 'छुट्टै दिनमा, हप्तामा दुई पटक सङ्कलन।' },
      { en: 'Turned into compost using the pile method.', ne: 'थुप्रो (पाइल) विधिबाट कम्पोस्ट मल बनाइन्छ।' },
      {
        en: 'Sold to farmers at an affordable price, and used for roadside plants and organic vegetables.',
        ne: 'किसानलाई सुलभ मूल्यमा बिक्री, साथै सडक किनारका बिरुवा र प्राङ्गारिक तरकारी खेतीमा प्रयोग।',
      },
    ],
  },
  {
    bin: 'nondegradable',
    icon: 'factory',
    outcome: { en: 'Becomes paper and pipes', ne: 'कागज र पाइप बन्छ' },
    steps: [
      { en: 'Collected once a week and taken to the transfer station.', ne: 'हप्तामा एक पटक सङ्कलन गरी ट्रान्सफर स्टेसनमा पुर्‍याइन्छ।' },
      {
        en: 'Salable items are sorted out. Paper becomes recycled paper at our Gokarna plant; plastic becomes pipes at the Balaju plant.',
        ne: 'बिक्रीयोग्य वस्तु छुट्याइन्छ। कागज गोकर्णस्थित हाम्रो केन्द्रमा पुनःप्रशोधित कागज बन्छ; प्लास्टिक बालाजुको प्लान्टमा पाइप बन्छ।',
      },
      {
        en: 'Only what cannot be reused goes to the Bancharedanda landfill in Nuwakot.',
        ne: 'पुनःप्रयोग हुन नसक्ने फोहोर मात्र नुवाकोटको बन्चरेडाँडा ल्यान्डफिल साइटमा पठाइन्छ।',
      },
    ],
  },
  {
    bin: 'hazardous',
    icon: 'circle-check',
    outcome: { en: 'Kept out of soil and water', ne: 'माटो र पानी सुरक्षित' },
    steps: [
      { en: 'Kept apart at home in a closed box or bottle.', ne: 'घरमै बन्द बाकस वा बोतलमा छुट्टै राखिन्छ।' },
      { en: 'Handed over separately. Call your nearest office to ask how.', ne: 'अलग्गै बुझाइन्छ। कसरी भन्ने नजिकको कार्यालयमा सोध्नुहोस्।' },
      {
        en: 'Never burnt, buried or poured into drains, where it would poison soil, water and air.',
        ne: 'कहिल्यै नजलाउने, नगाड्ने वा ढलमा नबगाउने; त्यसो गरे माटो, पानी र हावा विषाक्त हुन्छ।',
      },
    ],
  },
];

export const compostSteps: { title: L; text: L }[] = [
  {
    title: { en: 'Pick a container', ne: 'भाँडो छान्नुहोस्' },
    text: {
      en: 'A bucket or drum with a lid and a few air holes, a compost bin, or a pit in the garden.',
      ne: 'हावा छिर्ने केही प्वाल र बिर्को भएको बाल्टिन वा ड्रम, कम्पोस्ट बिन, वा बगैँचामा खाडल।',
    },
  },
  {
    title: { en: 'Start with a dry layer', ne: 'सुक्खा तहबाट सुरु गर्नुहोस्' },
    text: {
      en: 'Put dry leaves, straw or sawdust at the bottom to soak up moisture.',
      ne: 'चिस्यान सोस्न पिँधमा सुक्खा पात, पराल वा काठको धुलो राख्नुहोस्।',
    },
  },
  {
    title: { en: 'Add kitchen scraps', ne: 'भान्साको फोहोर थप्नुहोस्' },
    text: {
      en: 'Vegetable and fruit peels, tea leaves and egg shells. Chop big pieces small.',
      ne: 'तरकारी र फलफूलका बोक्रा, चियापत्ती र अन्डाका बोक्रा। ठूला टुक्रा सानो बनाउनुहोस्।',
    },
  },
  {
    title: { en: 'Cover it every time', ne: 'हरेक पटक छोप्नुहोस्' },
    text: {
      en: 'After adding wet scraps, cover them with a handful of dry leaves or soil. This stops smells and flies.',
      ne: 'भिजेको फोहोर हालेपछि एक मुठी सुक्खा पात वा माटोले छोप्नुहोस्। यसले गन्ध र झिँगा रोक्छ।',
    },
  },
  {
    title: { en: 'Keep it damp, not wet', ne: 'ओसिलो राख्नुहोस्, भिजेको होइन' },
    text: {
      en: 'It should feel like a squeezed-out sponge. Mix it once a week to let air in.',
      ne: 'निचोरेको स्पन्जजस्तो हुनुपर्छ। हावा छिर्न हप्तामा एक पटक चलाउनुहोस्।',
    },
  },
  {
    title: { en: 'Use it in 2–3 months', ne: '२–३ महिनामा तयार' },
    text: {
      en: 'When it is dark, crumbly and smells like soil, it is ready for pots and gardens.',
      ne: 'कालो, खुकुलो र माटोजस्तो गन्ध आउन थालेपछि गमला र बगैँचामा प्रयोग गर्न तयार हुन्छ।',
    },
  },
];

export const compostAvoid: L[] = [
  { en: 'Plastic, glass and metal', ne: 'प्लास्टिक, सिसा र धातु' },
  { en: 'A lot of meat, fish, bones or oily food', ne: 'धेरै मासु, माछा, हड्डी वा चिल्लो खाना' },
  { en: 'Pet or human waste', ne: 'पाल्तु जनावर वा मानिसको दिसा' },
  { en: 'Diseased plants', ne: 'रोग लागेका बिरुवा' },
];

export const compostFixes: { problem: L; fix: L }[] = [
  { problem: { en: 'It smells bad', ne: 'गन्हाउँछ' }, fix: { en: 'Too wet. Add dry leaves and mix.', ne: 'धेरै भिजेको छ। सुक्खा पात थपेर चलाउनुहोस्।' } },
  { problem: { en: 'Nothing is happening', ne: 'केही परिवर्तन भएन' }, fix: { en: 'Too dry. Sprinkle a little water.', ne: 'धेरै सुक्खा छ। अलिकति पानी छर्कनुहोस्।' } },
  { problem: { en: 'Flies or ants', ne: 'झिँगा वा कमिला' }, fix: { en: 'Scraps are uncovered. Cover them with dry leaves or soil.', ne: 'फोहोर खुला छ। सुक्खा पात वा माटोले छोप्नुहोस्।' } },
];

export const festivals: { icon: IconName; title: L; tips: L[] }[] = [
  {
    icon: 'sparkles',
    title: { en: 'Dashain and Tihar', ne: 'दसैँ र तिहार' },
    tips: [
      { en: 'Marigold garlands and puja flowers are degradable. Take off threads and plastic first.', ne: 'सयपत्रीका माला र पूजाका फूल कुहिने फोहोर हुन्। धागो र प्लास्टिक पहिले झिक्नुहोस्।' },
      { en: 'Soak burnt-out firecrackers in water overnight before throwing them away.', ne: 'पड्किसकेका पटका फाल्नुअघि रातभर पानीमा डुबाउनुहोस्।' },
      { en: 'Keep unbroken diyo (pala) for next year; wrap broken ones.', ne: 'नफुटेका दियो (पाला) अर्को वर्षका लागि राख्नुहोस्; फुटेका बेरेर फाल्नुहोस्।' },
      { en: 'Flatten sweets boxes and keep them dry.', ne: 'मिठाईका बट्टा चेप्टो पारेर सुक्खा राख्नुहोस्।' },
    ],
  },
  {
    icon: 'users',
    title: { en: 'Weddings, bhoj and gatherings', ne: 'विवाह, भोज र जमघट' },
    tips: [
      { en: 'Choose leaf plates (tapari, duna) over thermocol — they are degradable.', ne: 'थर्मोकोलको सट्टा टपरी र दुना प्रयोग गर्नुहोस् — यी कुहिने हुन्छन्।' },
      { en: 'Put out two clearly marked bins, one for each kind of waste.', ne: 'दुई किसिमका फोहोरका लागि स्पष्ट चिनो लगाइएका दुईवटा भाँडो राख्नुहोस्।' },
      { en: 'Serve water from jugs instead of single-use bottles.', ne: 'एकपटके बोतलको सट्टा जगबाट पानी दिनुहोस्।' },
      { en: 'Expecting a lot of waste? Talk to your nearest office in advance.', ne: 'धेरै फोहोर निस्कने भए नजिकको कार्यालयसँग पहिल्यै कुरा गर्नुहोस्।' },
    ],
  },
  {
    icon: 'flower',
    title: { en: 'Puja and temples', ne: 'पूजा र मन्दिर' },
    tips: [
      { en: 'Collect flowers and offerings for compost instead of putting them in rivers.', ne: 'फूल र पूजाका सामग्री नदीमा बगाउनुको सट्टा कम्पोस्टका लागि जम्मा गर्नुहोस्।' },
      { en: 'Carry offerings in a cloth bag or a plate, not a plastic bag.', ne: 'पूजा सामग्री प्लास्टिकको झोलामा होइन, कपडाको झोला वा थालमा लैजानुहोस्।' },
      { en: 'Take your plastic and wrappers back home with you.', ne: 'आफ्नो प्लास्टिक र खोल घरै फिर्ता लैजानुहोस्।' },
    ],
  },
  {
    icon: 'house',
    title: { en: 'Every day and in the rains', ne: 'दैनिक र वर्षायाममा' },
    tips: [
      { en: 'In the monsoon, keep degradable waste in a bucket with a lid so it does not smell or leak.', ne: 'वर्षामा कुहिने फोहोर बिर्कोसहितको बाल्टिनमा राख्नुहोस्, गन्ध र चुहावट हुँदैन।' },
      { en: 'Sell clean paper, bottles and metal to a kabadi, or keep them dry for collection.', ne: 'सफा कागज, बोतल र धातु कबाडीलाई बेच्नुहोस्, वा सङ्कलनका लागि सुक्खा राख्नुहोस्।' },
      { en: 'Carry a cloth bag and a water bottle when you go out.', ne: 'बाहिर जाँदा कपडाको झोला र पानीको बोतल बोक्नुहोस्।' },
      { en: 'Never burn waste — the smoke harms your family and neighbours.', ne: 'फोहोर कहिल्यै नजलाउनुहोस् — धुवाँले परिवार र छिमेकीलाई हानि गर्छ।' },
    ],
  },
];

export const myths: { claim: L; verdict: 'myth' | 'fact'; answer: L }[] = [
  {
    claim: { en: '“It all gets mixed in the truck anyway, so sorting is pointless.”', ne: '“जसरी पनि गाडीमा सबै मिसिन्छ, छुट्याउनुको अर्थ छैन।”' },
    verdict: 'myth',
    answer: {
      en: 'We collect degradable waste twice a week and non-degradable waste once a week, on separate days. Sorted waste becomes compost, recycled paper and pipes.',
      ne: 'हामी कुहिने फोहोर हप्तामा दुई पटक र नकुहिने एक पटक, फरक-फरक दिनमा सङ्कलन गर्छौँ। छुट्याइएको फोहोर कम्पोस्ट मल, पुनःप्रशोधित कागज र पाइप बन्छ।',
    },
  },
  {
    claim: { en: '“Most of what we throw away could become compost.”', ne: '“हामीले फाल्ने धेरैजसो फोहोर कम्पोस्ट बन्न सक्छ।”' },
    verdict: 'fact',
    answer: {
      en: 'About two thirds of household waste in Nepal’s towns is degradable (ADB, 2013).',
      ne: 'नेपालका सहरमा घरबाट निस्कने फोहोरमध्ये करिब दुई तिहाइ कुहिने हुन्छ (एडीबी, २०१३)।',
    },
  },
  {
    claim: { en: '“Burning plastic at home is a quick, harmless fix.”', ne: '“घरमै प्लास्टिक जलाउनु छिटो र हानिरहित उपाय हो।”' },
    verdict: 'myth',
    answer: {
      en: 'Burning plastic gives off toxic smoke that harms your lungs and your neighbours’. Hand it over with non-degradable waste instead.',
      ne: 'प्लास्टिक जलाउँदा निस्कने विषालु धुवाँले तपाईं र छिमेकीको फोक्सोलाई हानि गर्छ। बरु नकुहिने फोहोरसँग बुझाउनुहोस्।',
    },
  },
  {
    claim: { en: '“Any paper can be recycled.”', ne: '“जुनसुकै कागज पुनःप्रशोधन हुन्छ।”' },
    verdict: 'myth',
    answer: {
      en: 'Only clean, dry paper. Wet, oily or dirty paper, such as used tissues, goes with degradable waste.',
      ne: 'सफा र सुक्खा कागज मात्र। भिजेको, चिल्लो वा फोहोर कागज, जस्तै प्रयोग भएको टिस्यु, कुहिने फोहोरमा पर्छ।',
    },
  },
  {
    claim: { en: '“Rinsing a milk pouch before throwing it away makes a difference.”', ne: '“दूधको प्याकेट पखालेर फाल्दा फरक पर्छ।”' },
    verdict: 'fact',
    answer: {
      en: 'Clean plastic can be sold and recycled. A sour, dirty pouch usually ends up in landfill — and makes the whole bag smell.',
      ne: 'सफा प्लास्टिक बिक्री र पुनःप्रशोधन हुन्छ। अमिलो, फोहोर प्याकेट प्रायः ल्यान्डफिलमै पुग्छ — र पूरै झोला गन्हाउँछ।',
    },
  },
  {
    claim: { en: '“Old medicines can go down the drain or toilet.”', ne: '“पुराना औषधि ढल वा चर्पीमा फाल्दा हुन्छ।”' },
    verdict: 'myth',
    answer: {
      en: 'Medicines in water harm fish and can reach drinking water. Keep them in their packets, separate from other waste.',
      ne: 'पानीमा पुगेको औषधिले माछालाई हानि गर्छ र खानेपानीसम्म पुग्न सक्छ। प्याकेटमै राखी अन्य फोहोरबाट छुट्टै राख्नुहोस्।',
    },
  },
];

/** The three reminders at the foot of the poster. */
export const posterTips: L[] = [
  { ne: 'दूध र दहीका प्याकेट पखालेर हाल्नुहोस्', en: 'Rinse milk and curd pouches' },
  { ne: 'कागज र कार्टुन सुक्खा राख्नुहोस्', en: 'Keep paper and cardboard dry' },
  { ne: 'फुटेको सिसा र प्याड बेरेर मात्र', en: 'Wrap broken glass and pads' },
];
