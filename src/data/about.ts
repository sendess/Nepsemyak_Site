import type { L } from '~/i18n/utils';

export const aboutIntro: L[] = [
  {
    en: 'Nepsemyak Sewa Pvt. Ltd. is a private company working in solid waste management in Nepal. Established in 2009, we collect, transport, sort, recycle and compost waste, with a focus on sustainable practices that reduce the harm waste does to public health and the environment.',
    ne: 'नेप्सेम्याक सेवा प्रा.लि. नेपालमा ठोस फोहोरमैला व्यवस्थापनमा काम गर्ने निजी कम्पनी हो। वि.सं. २०६६ मा स्थापित यस कम्पनीले फोहोर सङ्कलन, ढुवानी, छुट्याउने, पुनःप्रशोधन तथा कम्पोस्ट मल उत्पादनका काम गर्दै जनस्वास्थ्य तथा वातावरणमा फोहोरको नकारात्मक असर घटाउने दिगो अभ्यासमा जोड दिँदै आएको छ।',
  },
  {
    en: 'We have carried out projects with the Government of Nepal and international organizations to improve the country’s solid waste management system, and we aim to become Nepal’s leading waste management company by offering innovative, cost-effective solutions.',
    ne: 'देशको ठोस फोहोरमैला व्यवस्थापन प्रणाली सुधार गर्न हामीले नेपाल सरकार तथा अन्तर्राष्ट्रिय संस्थासँगको साझेदारीमा विभिन्न परियोजना सञ्चालन गरेका छौँ। नवीन तथा किफायती समाधानसहित नेपालकै अग्रणी फोहोर व्यवस्थापन कम्पनी बन्ने हाम्रो लक्ष्य छ।',
  },
];

export const vision: L = {
  en: 'Providing sustainable waste solutions in Nepal, promoting eco-friendly practices, creating jobs, and partnering for better waste management.',
  ne: 'नेपालमा दिगो फोहोर व्यवस्थापन समाधान प्रदान गर्दै वातावरणमैत्री अभ्यास प्रवर्द्धन, रोजगारी सिर्जना तथा अझ राम्रो फोहोर व्यवस्थापनका लागि साझेदारी गर्ने।',
};

export const mission: L = {
  en: 'To enhance waste management in Nepal by delivering efficient solutions through collaboration with the government, international partners and communities, while striving for innovative and environmentally positive approaches.',
  ne: 'सरकार, अन्तर्राष्ट्रिय साझेदार तथा समुदायसँगको सहकार्यमा प्रभावकारी समाधान प्रदान गर्दै नवीन एवं वातावरणमैत्री दृष्टिकोण अवलम्बन गरी नेपालको फोहोर व्यवस्थापनलाई सुदृढ बनाउने।',
};

export type Milestone = { year: L; title: L; text: L };

export const milestones: Milestone[] = [
  {
    year: { en: '1993', ne: '२०५०' },
    title: { en: 'The private sector steps in', ne: 'निजी क्षेत्रको प्रवेश' },
    text: {
      en: 'Private-sector participation in waste management begins in 2050 BS.',
      ne: 'वि.सं. २०५० देखि फोहोर व्यवस्थापनमा निजी क्षेत्रको सहभागिता सुरु भयो।',
    },
  },
  {
    year: { en: '1997', ne: '२०५४' },
    title: { en: 'NEPCEMAC is founded', ne: 'नेप्सेम्याक (NEPCEMAC) स्थापना' },
    text: {
      en: 'Nepal Pollution Control and Environmental Construction Center (NEPCEMAC) is registered as an NGO in Lalitpur on Baisakh 16, 2054 BS.',
      ne: 'वि.सं. २०५४ वैशाख १६ मा ललितपुरमा गैरसरकारी संस्था नेप्सेम्याक (NEPCEMAC) दर्ता भयो।',
    },
  },
  {
    year: { en: '2009', ne: '२०६६' },
    title: { en: 'Nepsemyak Sewa Pvt. Ltd. is established', ne: 'नेप्सेम्याक सेवा प्रा.लि. स्थापना' },
    text: {
      en: 'The company is established in Poush 2066 BS.',
      ne: 'वि.सं. २०६६ पुसमा कम्पनी स्थापना भयो।',
    },
  },
  {
    year: { en: '2013', ne: '२०७०' },
    title: { en: 'The work is handed over', ne: 'कामको हस्तान्तरण' },
    text: {
      en: 'From 2070 BS, NEPCEMAC hands direct waste management over to the company and focuses on public awareness and training.',
      ne: 'वि.सं. २०७० देखि नेप्सेम्याक (NEPCEMAC) ले प्रत्यक्ष फोहोर व्यवस्थापनको काम कम्पनीलाई हस्तान्तरण गरी जनचेतना तथा तालिममा मात्र केन्द्रित भयो।',
    },
  },
];

export const beforeList: L[] = [
  { en: 'Waste was thrown in public places.', ne: 'सार्वजनिक स्थलमा फोहोर फाल्ने चलन थियो।' },
  { en: 'Managing waste was seen as the municipality’s job alone.', ne: 'फोहोर व्यवस्थापन नगरपालिकाको मात्र जिम्मेवारी हो भन्ने धारणा थियो।' },
  { en: 'People working in waste management were looked down upon.', ne: 'फोहोर व्यवस्थापनमा काम गर्नेलाई तल्लो दर्जाको ठानिन्थ्यो।' },
  { en: 'There was no culture of paying for waste management.', ne: 'फोहोर व्यवस्थापनका लागि शुल्क तिर्ने संस्कार थिएन।' },
  { en: 'People were reluctant to attend public programs on waste.', ne: 'फोहोर व्यवस्थापनसम्बन्धी सार्वजनिक कार्यक्रममा सहभागी हुन मानिस हिचकिचाउँथे।' },
  { en: 'Workers at sites even faced physical abuse.', ne: 'कार्यस्थलमा काम गर्नेले शारीरिक यातनासमेत भोग्नुपर्थ्यो।' },
];

export const achievements: L[] = [
  { en: 'People bring out their waste only when the vehicle arrives and honks.', ne: 'सङ्कलन गाडी आएर हर्न बजाएपछि मात्र मानिस फोहोर बाहिर निकाल्छन्।' },
  { en: 'Waste is no longer spilled on the roads.', ne: 'सडकमा फोहोर छरिँदैन।' },
  { en: 'Government and non-government organizations work with us in coordination.', ne: 'सरकारी तथा गैरसरकारी संस्थासँग समन्वय भइरहेको छ।' },
  { en: 'Respect for waste workers and their profession is growing.', ne: 'फोहोर व्यवस्थापनसँग जोडिएका व्यक्ति र पेशाप्रतिको सम्मान बढ्दो छ।' },
  { en: 'People contact us themselves to become customers.', ne: 'मानिस आफैं सेवाग्राही बन्न सम्पर्क गर्छन्।' },
  { en: 'Model waste sorting and composting work is under way.', ne: 'फोहोर छुट्याउने तथा कम्पोस्ट बनाउने नमुना काम भइरहेको छ।' },
  { en: 'Paying waste fees has become a habit.', ne: 'फोहोर शुल्क तिर्ने बानी बसेको छ।' },
  { en: 'People take part in public programs.', ne: 'मानिस सार्वजनिक कार्यक्रममा सहभागी हुन्छन्।' },
  { en: 'Public places such as riverbanks and roadsides are being cleaned.', ne: 'नदी किनार, सडक किनार जस्ता सार्वजनिक स्थल सफा गर्ने काम भइरहेको छ।' },
];

export const challenges: L[] = [
  { en: 'The environment for long-term planning is lacking.', ne: 'दीर्घकालीन योजनासहित काम गर्ने वातावरण छैन।' },
  { en: 'No land is available, even for rent, to set up transfer stations (processing centers).', ne: 'ट्रान्सफर स्टेसन (प्रशोधन केन्द्र) स्थापना गर्न भाडामा समेत जग्गा पाइँदैन।' },
  { en: 'There is a huge demand for workers in waste management.', ne: 'फोहोर व्यवस्थापनमा कामदारको ठूलो माग छ।' },
  { en: 'Landfill management and infrastructure development are not effective.', ne: 'ल्यान्डफिल साइटको व्यवस्थापन तथा पूर्वाधार विकास प्रभावकारी छैन।' },
  { en: 'Not every house has become a customer yet.', ne: 'सबै घर अझै सेवाग्राही बनेका छैनन्।' },
  { en: 'Enforcing laws and regulations takes a lot of time and money.', ne: 'ऐन-नियम कार्यान्वयन गर्न धेरै समय र खर्च लाग्छ।' },
  { en: 'Work practices and fee-setting methods are neither uniform nor scientific.', ne: 'कार्यशैली तथा शुल्क निर्धारण विधि एकरूप र वैज्ञानिक छैनन्।' },
  { en: 'Weak technology limits how well waste can be put to use.', ne: 'प्रविधिको कमजोरीले चाहेर पनि फोहोरको अधिकतम सदुपयोग गर्न सकिँदैन।' },
  { en: 'The idea that the municipality’s and Nepsemyak’s services complement each other is not yet widely understood.', ne: '“नगरपालिका र नेप्सेम्याकका सेवा एकअर्काका पूरक हुन्” भन्ने धारणा जनमानसमा स्थापित भइसकेको छैन।' },
  { en: 'There is no alternative landfill site.', ne: 'वैकल्पिक ल्यान्डफिल साइट छैन।' },
];

export const longTermGoals: L[] = [
  { en: 'Carry out research in waste management.', ne: 'फोहोर व्यवस्थापनमा अनुसन्धान गर्ने।' },
  { en: 'Make compost at household and community level.', ne: 'घर तथा समुदाय स्तरमै कम्पोस्ट मल बनाउने।' },
  { en: 'Promote the use of recycled materials.', ne: 'पुनःप्रशोधित वस्तुको प्रयोग प्रवर्द्धन गर्ने।' },
  { en: 'Increase the use of machinery.', ne: 'यान्त्रिक शक्तिको प्रयोग बढाउने।' },
  { en: 'Adopt modern techniques to protect the urban environment and ecosystems.', ne: 'सहरी वातावरण तथा पारिस्थितिक प्रणाली संरक्षणका लागि आधुनिक प्रविधि अवलम्बन गर्ने।' },
  { en: 'Use waste as raw material for waste-based industries.', ne: 'फोहोरमा आधारित उद्योगका लागि फोहोरलाई कच्चा पदार्थका रूपमा प्रयोग गर्ने।' },
  { en: 'Promote afforestation, organic farming, beekeeping and greenery.', ne: 'वृक्षरोपण, प्राङ्गारिक खेती, मौरीपालन तथा हरियाली प्रवर्द्धन गर्ने।' },
  { en: 'Create jobs in the field of waste management.', ne: 'फोहोर व्यवस्थापन क्षेत्रमा रोजगारी सिर्जना गर्ने।' },
  { en: 'Spread knowledge through books, educational materials and the media.', ne: 'पुस्तक, शैक्षिक तथा सूचनामूलक सामग्री एवं सञ्चारमाध्यममार्फत प्रचारप्रसार गर्ने।' },
  { en: 'Use land within the municipality, and work with other areas only when that is not possible.', ne: 'नगरपालिका क्षेत्रभित्रकै जग्गा प्रयोग गर्ने, सम्भव नभए मात्र अन्य क्षेत्रसँग सहकार्य गर्ने।' },
  { en: 'Make waste management service compulsory and link it with other municipal services.', ne: 'फोहोर व्यवस्थापन सेवालाई अनिवार्य बनाई नगरपालिकाका अन्य सेवासँग आबद्ध गर्ने।' },
  { en: 'Set fees scientifically.', ne: 'वैज्ञानिक तरिकाले शुल्क निर्धारण गर्ने।' },
  {
    en: 'Under a public–private partnership, hand waste management to the private operators already doing the work, on long-term, performance-based contracts through a legal process.',
    ne: 'सार्वजनिक-निजी साझेदारी अवधारणाअनुसार हाल काम गरिरहेको निजी क्षेत्रलाई कार्यसम्पादनका आधारमा कानुनी प्रक्रियाबाट सशर्त दीर्घकालीन जिम्मा दिने।',
  },
  {
    en: 'In areas with little income, have the municipality support private operators financially, while operators deposit a set share of the fees they collect into the municipality’s account.',
    ne: 'आय स्रोत कम भएका क्षेत्रमा नगरपालिकाले निजी क्षेत्रलाई निश्चित रकम उपलब्ध गराउने, साथै निजी क्षेत्रले सेवाग्राहीबाट उठेको रकमको निश्चित प्रतिशत सरसफाइ शुल्कका रूपमा नगरपालिकाको खातामा जम्मा गर्ने।',
  },
  { en: 'Have the municipality monitor, evaluate and regulate the work of the private sector.', ne: 'निजी क्षेत्रले गरेको कामको अनुगमन, मूल्याङ्कन तथा नियमन नगरपालिकाले गर्ने व्यवस्था मिलाउने।' },
];

export const chairman = {
  name: { en: 'Tika Ram Dahal', ne: 'टीकाराम दाहाल' } satisfies L,
  role: { en: 'Chairman and Managing Director', ne: 'अध्यक्ष तथा प्रबन्ध निर्देशक' } satisfies L,
  excerpt: {
    en: 'Our commitment is clear — to be a model of sustainable waste solutions in Nepal.',
    ne: 'नेपालमा दिगो फोहोर व्यवस्थापन समाधानको नमुना बन्ने हाम्रो प्रतिबद्धता स्पष्ट छ।',
  } satisfies L,
  message: [
    {
      en: 'As the Chairman and Managing Director of a pioneering waste management company in Nepal, I am proud and grateful to address you. For the last decade and a half we have dedicated ourselves to transforming waste management in the Kathmandu Valley, and our efforts have brought eco-friendly practices, new jobs and vital partnerships.',
      ne: 'नेपालमा फोहोरमैला व्यवस्थापनको अग्रणी कम्पनीको अध्यक्ष तथा प्रबन्ध निर्देशकका रूपमा तपाईंसमक्ष आफ्ना कुरा राख्न पाउँदा मलाई गर्व र कृतज्ञता दुवै महसुस भएको छ। विगत डेढ दशकदेखि हामी काठमाडौं उपत्यकाको फोहोर व्यवस्थापनमा रूपान्तरण ल्याउन समर्पित छौँ। हाम्रो प्रयासले वातावरणमैत्री अभ्यास, रोजगारी सिर्जना तथा महत्त्वपूर्ण साझेदारी सम्भव भएका छन्।',
    },
    {
      en: 'Our journey began more than 26 years ago with a vision to change how Nepal manages its waste. Today I am humbled by our progress and our impact on the environment. Our commitment is clear — to be a model of sustainable waste solutions in Nepal. We work with government bodies, international partners and communities on innovative, eco-conscious approaches.',
      ne: 'नेपालको फोहोर व्यवस्थापनमा परिवर्तन ल्याउने सोचका साथ हाम्रो यात्रा २६ वर्षभन्दा पहिले सुरु भएको थियो। आज हाम्रो प्रगति र वातावरणीय प्रभाव देख्दा म विनम्र हुन्छु। नेपालमा दिगो फोहोर व्यवस्थापन समाधानको नमुना बन्ने हाम्रो प्रतिबद्धता स्पष्ट छ। नवीन एवं वातावरणप्रति सचेत दृष्टिकोणका लागि हामी सरकारी निकाय, अन्तर्राष्ट्रिय साझेदार तथा समुदायसँग सहकार्य गर्छौं।',
    },
    {
      en: 'Our work spans the whole field of waste management: collection, transportation and compost production, awareness campaigns, training, recycling and community engagement. We take on even difficult tasks such as managing dead animals.',
      ne: 'हाम्रा पहल फोहोर सङ्कलन, ढुवानी तथा कम्पोस्ट मल उत्पादनदेखि जनचेतना अभियान, तालिम, पुनःप्रशोधन तथा सामुदायिक सहभागितासम्म फैलिएका छन्। मृत पशु व्यवस्थापन जस्ता चुनौतीपूर्ण काम पनि हामी गर्छौं।',
    },
    {
      en: 'Despite our achievements, we face real challenges: limited land for processing, unclear policies for the private sector, and inadequate landfill sites. The single landfill at Bancharedanda serving the entire valley is stretched, and local governments lack infrastructure.',
      ne: 'उपलब्धिका बाबजुद प्रशोधनका लागि जग्गाको अभाव, निजी क्षेत्रसम्बन्धी अस्पष्ट नीति तथा अपर्याप्त ल्यान्डफिल साइट जस्ता चुनौती रहेको हामी स्वीकार्छौं। सिङ्गो उपत्यकाका लागि एक मात्र बन्चरेडाँडा ल्यान्डफिल साइटमा क्षमताभन्दा बढी भार छ भने स्थानीय सरकारसँग पर्याप्त पूर्वाधार छैन।',
    },
    {
      en: 'Even so, our determination is unshaken. We will overcome these challenges and deliver results, driven by our belief in a cleaner, healthier Nepal.',
      ne: 'यी अवरोधका बाबजुद हाम्रो दृढता अटल छ। चुनौती पार गर्दै हामी नतिजा देखाउनेछौँ। सफा र स्वस्थ नेपालप्रतिको विश्वास नै हाम्रो अटुट समर्पणको आधार हो।',
    },
    {
      en: 'My gratitude goes to our team, partners and supporters who have joined us on this journey. Together we will keep innovating, collaborating and pursuing excellence — and with your support, we will build a brighter, cleaner and more sustainable future for generations to come.',
      ne: 'यस यात्रामा साथ दिनुहुने हाम्रो टोली, साझेदार तथा शुभचिन्तकप्रति हार्दिक कृतज्ञता व्यक्त गर्दछु। सँगै मिलेर हामी नवप्रवर्तन, सहकार्य र उत्कृष्टताको खोजी जारी राख्नेछौँ। तपाईंको साथ र सहयोगमा आउने पुस्ताका लागि उज्यालो, सफा र दिगो भविष्य निर्माण गर्नेछौँ।',
    },
  ] satisfies L[],
  signoff: { en: 'Thank you.', ne: 'धन्यवाद।' } satisfies L,
};
