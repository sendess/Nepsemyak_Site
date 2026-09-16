import type { L } from '~/i18n/utils';
import type { IconName } from '~/components/icons';

export type Service = { id: string; icon: IconName; title: L; text: L };
export type ServiceGroup = { id: string; icon: IconName; title: L; summary: L; services: Service[] };

export const serviceGroups: ServiceGroup[] = [
  {
    id: 'collection',
    icon: 'truck',
    title: { en: 'Collection & cleaning', ne: 'सङ्कलन तथा सरसफाइ' },
    summary: {
      en: 'Doorstep collection, sorting, street cleaning and safe disposal.',
      ne: 'घरदैलोबाट सङ्कलन, फोहोर छुट्याउने, सडक सफाइ तथा सुरक्षित विसर्जन।',
    },
    services: [
      {
        id: 'collection-transport',
        icon: 'truck',
        title: { en: 'Waste collection and transportation', ne: 'फोहोर सङ्कलन तथा ढुवानी' },
        text: {
          en: 'We collect waste from your doorstep in small vehicles and take it to the transfer station. After salable items are sorted out, the rest is loaded onto large vehicles and taken to the landfill site at Bancharedanda, Nuwakot.',
          ne: 'साना सवारी साधनमार्फत घरदैलोबाटै फोहोर सङ्कलन गरी ट्रान्सफर स्टेसनमा पुर्‍याइन्छ। बिक्रीयोग्य वस्तु छुट्याएपछि बाँकी फोहोर ठूला सवारी साधनमा लोड गरी नुवाकोटको बन्चरेडाँडा ल्यान्डफिल साइटमा पुर्‍याइन्छ।',
        },
      },
      {
        id: 'segregation',
        icon: 'recycle',
        title: { en: 'Waste segregation', ne: 'फोहोर छुट्याउने काम' },
        text: {
          en: 'We teach residents to keep household waste in two parts — compostable and non-compostable — and collect each on separate days. A campaign is under way to bring this to every area, and salable items are also sorted at transfer stations.',
          ne: 'घरधुरीलाई फोहोर कुहिने र नकुहिने गरी दुई भागमा छुट्याएर राख्न सिकाइन्छ र फरक-फरक दिनमा सङ्कलन गरिन्छ। यसलाई सबै क्षेत्रमा पुर्‍याउन अभियान सञ्चालन भइरहेको छ। ट्रान्सफर स्टेसनमा बिक्रीयोग्य वस्तु पनि छुट्याइन्छ।',
        },
      },
      {
        id: 'bins',
        icon: 'trash',
        title: { en: 'Roadside trash bins', ne: 'सडक किनारमा डस्टबिन' },
        text: {
          en: 'Together with local governments, we have installed small bins on roadside poles in many settlements, so pedestrians have an easy place to drop small litter.',
          ne: 'स्थानीय सरकारसँगको समन्वय र सहकार्यमा विभिन्न बस्तीका सडक किनारका पोलमा साना डस्टबिन जडान गरिएका छन्, जसले गर्दा पैदलयात्रीलाई हातमा रहेको सानो फोहोर फाल्न सजिलो भएको छ।',
        },
      },
      {
        id: 'road-cleaning',
        icon: 'brush-cleaning',
        title: { en: 'Regular road cleaning', ne: 'नियमित सडक सफाइ' },
        text: {
          en: 'Staff are assigned and regularly deployed to sweep roads within our service areas as required.',
          ne: 'कार्यक्षेत्रभित्रका सडक आवश्यकताअनुसार नियमित रूपमा बढार्न कर्मचारी खटाइएका छन्।',
        },
      },
      {
        id: 'dead-animals',
        icon: 'paw-print',
        title: { en: 'Management of dead animals', ne: 'मृत पशु व्यवस्थापन' },
        text: {
          en: 'Dead animals found within our service areas are removed and managed safely.',
          ne: 'कार्यक्षेत्रभित्र फेला परेका मृत पशुको सुरक्षित तरिकाले व्यवस्थापन गरिन्छ।',
        },
      },
    ],
  },
  {
    id: 'recovery',
    icon: 'sprout',
    title: { en: 'Recycling & compost', ne: 'पुनःप्रशोधन तथा कम्पोस्ट' },
    summary: {
      en: 'Turning waste back into compost, paper, pipes and organic food.',
      ne: 'फोहोरलाई कम्पोस्ट मल, कागज, पाइप तथा प्राङ्गारिक खाद्यान्नमा बदल्ने काम।',
    },
    services: [
      {
        id: 'compost',
        icon: 'sprout',
        title: { en: 'Compost production', ne: 'कम्पोस्ट मल उत्पादन' },
        text: {
          en: 'Degradable waste that is collected separately is turned into compost using the pile method.',
          ne: 'छुट्टै सङ्कलन गरिएको कुहिने फोहोरबाट थुप्रो (पाइल) विधिद्वारा कम्पोस्ट मल उत्पादन गरिन्छ।',
        },
      },
      {
        id: 'paper',
        icon: 'file-text',
        title: { en: 'Paper recycling', ne: 'कागज पुनःप्रशोधन' },
        text: {
          en: 'At our own paper processing plant in Gokarna, Kathmandu, old paper is made into recycled paper that we use in our offices and also sell.',
          ne: 'गोकर्ण, काठमाडौंस्थित आफ्नै कागज प्रशोधन केन्द्रमा पुराना कागजबाट पुनःप्रशोधित कागज बनाइन्छ, जुन कार्यालयमै प्रयोग गरिनुका साथै बिक्री पनि गरिन्छ।',
        },
      },
      {
        id: 'plastic',
        icon: 'factory',
        title: { en: 'Plastic recycling', ne: 'प्लास्टिक पुनःप्रशोधन' },
        text: {
          en: 'Waste plastic is recycled into pipes at a plant in the Balaju Industrial Area, run by Nepal Valley Engineering and Auto Works Pvt. Ltd., a company owned by Nepsemyak.',
          ne: 'नेप्सेम्याकको स्वामित्वमा रहेको नेपाल भ्याली इन्जिनियरिङ एन्ड अटो वर्क्स प्रा.लि.द्वारा बालाजु औद्योगिक क्षेत्रमा सञ्चालित प्लान्टमा फोहोर प्लास्टिकबाट पाइप बनाइन्छ।',
        },
      },
      {
        id: 'organic-farming',
        icon: 'leaf',
        title: { en: 'Organic farming', ne: 'प्राङ्गारिक खेती' },
        text: {
          en: 'Using the compost we produce, organic vegetables are grown on rented land and sold to members of the Nepsemyak family.',
          ne: 'उत्पादित कम्पोस्ट मल प्रयोग गरी भाडाको जग्गामा प्राङ्गारिक तरकारी उत्पादन गरी नेप्सेम्याक परिवारका सदस्यलाई बिक्री गरिन्छ।',
        },
      },
    ],
  },
  {
    id: 'community',
    icon: 'users',
    title: { en: 'Community & partnerships', ne: 'समुदाय तथा साझेदारी' },
    summary: {
      en: 'Awareness, training and coordination that make clean habits last.',
      ne: 'सरसफाइको बानी दिगो बनाउने जनचेतना, तालिम तथा समन्वय।',
    },
    services: [
      {
        id: 'mobilization',
        icon: 'handshake',
        title: { en: 'Community mobilization', ne: 'समुदाय परिचालन' },
        text: {
          en: 'By mobilizing community members, women’s groups, social organizations, clubs and schools, we help waste initiatives take root in each neighborhood in a sustainable and effective way.',
          ne: 'समुदायका व्यक्ति, आमा समूह, सामाजिक संस्था, क्लब, विद्यालय आदिलाई परिचालन गरी समुदायमा दिगो र प्रभावकारी फोहोर व्यवस्थापन पहल सञ्चालन गरिँदै आएको छ।',
        },
      },
      {
        id: 'training',
        icon: 'graduation-cap',
        title: { en: 'Training', ne: 'तालिम' },
        text: {
          en: 'We train students, women, representatives of local organizations and others in sorting waste, putting it to use and producing compost.',
          ne: 'विद्यार्थी, महिला, स्थानीय संस्थाका प्रतिनिधि लगायतलाई फोहोर छुट्याउने, फोहोरको सदुपयोग तथा कम्पोस्ट मल उत्पादनसम्बन्धी तालिम दिँदै आएका छौँ।',
        },
      },
      {
        id: 'awareness',
        icon: 'megaphone',
        title: { en: 'Public awareness programs', ne: 'जनचेतनामूलक कार्यक्रम' },
        text: {
          en: 'We run ongoing awareness programs on waste management and environmental protection, together with local residents.',
          ne: 'स्थानीय बासिन्दाको सहकार्यमा फोहोर व्यवस्थापन तथा वातावरण संरक्षणसम्बन्धी जनचेतनामूलक कार्यक्रम निरन्तर सञ्चालन गर्दै आएका छौँ।',
        },
      },
      {
        id: 'campaigns',
        icon: 'sparkles',
        title: { en: 'Cleaning campaigns', ne: 'सरसफाइ अभियान' },
        text: {
          en: 'We organize campaigns to clean public places such as rivers, roads and temples.',
          ne: 'नदी, सडक, मन्दिर जस्ता सार्वजनिक स्थल सफा गर्न विभिन्न नाममा सरसफाइ अभियान सञ्चालन गर्दै आएका छौँ।',
        },
      },
      {
        id: 'interaction',
        icon: 'messages-square',
        title: { en: 'Interaction programs', ne: 'अन्तरक्रिया कार्यक्रम' },
        text: {
          en: 'From time to time we hold interaction programs on sustainable waste management with customers, local organizations, elected representatives, government staff, security agencies, hospitals, schools and colleges.',
          ne: 'सेवाग्राही, स्थानीय संस्थाका प्रतिनिधि, निर्वाचित जनप्रतिनिधि, सरकारी कर्मचारी, सुरक्षा निकाय, अस्पताल तथा विद्यालय–कलेजसँग दिगो फोहोर व्यवस्थापनसम्बन्धी अन्तरक्रिया कार्यक्रम समय-समयमा सञ्चालन गरिँदै आएको छ।',
        },
      },
      {
        id: 'coordination',
        icon: 'landmark',
        title: { en: 'Inter-institutional coordination', ne: 'अन्तरसंस्थागत समन्वय' },
        text: {
          en: 'We coordinate with organizations working in fields similar to ours and with others involved in waste management.',
          ne: 'नेप्सेम्याकसँग मिल्दोजुल्दो क्षेत्रमा काम गर्ने तथा फोहोर व्यवस्थापनसँग सम्बन्धित अन्य संस्थासँग आवश्यक समन्वय स्थापित गरिएको छ।',
        },
      },
    ],
  },
];

export const methodology: L[] = [
  { en: 'Waste is collected only from registered houses.', ne: 'दर्ता भएका घरबाट मात्र फोहोर सङ्कलन गरिन्छ।' },
  {
    en: 'Collection starts at 5 or 6 AM on schedule and aims to finish by 7 AM on main roads and by 2 PM elsewhere.',
    ne: 'तोकिएको तालिकाअनुसार बिहान ५ वा ६ बजेदेखि सङ्कलन सुरु हुन्छ। मूल सडकमा बिहान ७ बजेसम्म र अन्य स्थानमा दिउँसो २ बजेसम्म सम्पन्न गर्ने लक्ष्य रहन्छ।',
  },
  {
    en: 'Main roads are cleaned daily. Other roads are cleaned, and their dust collected, once a week by 7 AM.',
    ne: 'मूल सडक दैनिक सफा गरिन्छ भने अन्य सडकको सफाइ तथा धुलोसहित फोहोर सङ्कलन हप्तामा एक पटक बिहान ७ बजेभित्र गरिन्छ।',
  },
  {
    en: 'Collected waste goes to a collection center or transfer station, where as many reusable items as possible are sorted out.',
    ne: 'सङ्कलित फोहोर सङ्कलन केन्द्र वा ट्रान्सफर स्टेसनमा लगी सकेसम्म पुनःप्रयोगयोग्य वस्तु छुट्याइन्छ।',
  },
  {
    en: 'Separating waste at the source — the customer’s home — is the priority.',
    ne: 'स्रोतमै (सेवाग्राहीको घरमै) फोहोर छुट्याउने कुरामा प्राथमिकता दिइन्छ।',
  },
  {
    en: 'Degradable waste is collected twice a week and non-degradable waste once a week.',
    ne: 'कुहिने फोहोर हप्तामा दुई पटक र नकुहिने फोहोर हप्तामा एक पटक सङ्कलन गरिन्छ।',
  },
  {
    en: 'Awareness programs are held once a month in different neighborhoods.',
    ne: 'विभिन्न टोलमा महिनामा एक पटक जनचेतनामूलक कार्यक्रम सञ्चालन गरिन्छ।',
  },
  {
    en: 'Reusable waste is sold and distributed; only waste that cannot be reused goes to landfill.',
    ne: 'पुनःप्रयोगयोग्य फोहोर बिक्री वितरण गरिन्छ, पुनःप्रयोग हुन नसक्ने फोहोर मात्र ल्यान्डफिल साइटमा पठाइन्छ।',
  },
  {
    en: 'Organic waste is turned into compost in existing or newly built compost pits. Reducing waste is a top priority.',
    ne: 'कुहिने फोहोरलाई विद्यमान वा नयाँ निर्माण गरिएका कम्पोस्ट खाडलमा कम्पोस्ट मल बनाइन्छ। फोहोर न्यूनीकरणलाई उच्च प्राथमिकता दिइन्छ।',
  },
  {
    en: 'Compost is sold to farmers at an affordable price and also used for roadside plants.',
    ne: 'कम्पोस्ट मल किसानलाई सुलभ मूल्यमा उपलब्ध गराइन्छ र सडक किनारका बिरुवामा पनि प्रयोग गरिन्छ।',
  },
  {
    en: 'Seedlings are provided for the “one house, two trees” concept, and residents are helped to grow gardens on vacant land.',
    ne: '“एक घर दुई रूख” अवधारणा कार्यान्वयनका लागि बिरुवा उपलब्ध गराइन्छ, साथै खाली जग्गामा बगैंचा बनाउन बासिन्दालाई सघाइन्छ।',
  },
  {
    en: 'Roadside tree planting and pruning are carried out with the cooperation of local residents.',
    ne: 'स्थानीय बासिन्दाको सहयोगमा सडक किनारमा वृक्षरोपण तथा काँटछाँटलाई गति दिइन्छ।',
  },
  {
    en: 'Roadside bins for small litter are emptied by our collectors once they are full.',
    ne: 'सानो फोहोर फाल्न सडक किनारमा डस्टबिनको व्यवस्था गरिएको छ, जुन भरिएपछि हाम्रा सङ्कलकले उठाउँछन्।',
  },
];

export const feePrinciples: L[] = [
  {
    en: 'Set different rates based on the amount or weight of wet, dry and hazardous waste generated.',
    ne: 'उत्पादित भिजेको, सुकेको तथा हानिकारक फोहोरको परिमाण वा तौलका आधारमा फरक-फरक दर निर्धारण गर्ने।',
  },
  {
    en: 'Charge households and businesses monthly or quarterly fees based on the waste they produce.',
    ne: 'घरधुरी तथा व्यवसायबाट उत्पादित फोहोरको परिमाणका आधारमा मासिक वा त्रैमासिक शुल्क लिने।',
  },
  {
    en: 'Collect user fees for additional services such as road sweeping, drain cleaning and cleaning public areas.',
    ne: 'सडक बढार्ने, ढल सफा गर्ने तथा सार्वजनिक क्षेत्र सफा गर्ने जस्ता थप सेवाका लागि सेवा शुल्क लिने।',
  },
  {
    en: 'Recover outstanding dues from the municipality through proper invoicing.',
    ne: 'नगरपालिकाबाट प्राप्त गर्न बाँकी रकम विधिवत् बिल जारी गरी असुल गर्ने।',
  },
  {
    en: 'As the system becomes efficient and generates revenue, the municipality’s spending on waste management can gradually fall.',
    ne: 'फोहोर व्यवस्थापन प्रणाली प्रभावकारी भई आम्दानी बढ्दै जाँदा नगरपालिकाको खर्च क्रमशः घट्दै जान सक्ने।',
  },
  {
    en: 'Link fees to service quality and performance to ensure accountability.',
    ne: 'जवाफदेहिता सुनिश्चित गर्न शुल्कलाई सेवाको गुणस्तर तथा कार्यसम्पादनसँग जोड्ने।',
  },
];
