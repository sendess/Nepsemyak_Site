import type { IconName } from '~/components/icons';
import type { L } from '~/i18n/utils';

/** The two kinds we collect (the same words as the home page) plus hazardous items that go in neither. */
export type Bin = 'degradable' | 'nondegradable' | 'hazardous';

export type SortItem = {
  id: string;
  bin: Bin;
  name: L;
  /** Extra words people might type: romanised Nepali, brand names, synonyms. */
  terms?: string;
  tip?: L;
  /** Shown on the printable kitchen poster. */
  poster?: boolean;
};

export const binOrder: Bin[] = ['degradable', 'nondegradable', 'hazardous'];

/** The same icons as the home page's sorting cards. */
export const binIcon: Record<Bin, IconName> = { degradable: 'leaf', nondegradable: 'recycle', hazardous: 'triangle-alert' };

export const bins: Record<Bin, { title: L; short: L; rule: L; collected: L }> = {
  degradable: {
    title: { en: 'Degradable', ne: 'कुहिने फोहोर' },
    short: { en: 'Waste that rots', ne: 'सड्ने–गल्ने' },
    rule: {
      en: 'Food and anything from plants or animals that rots. Keep it in its own bucket — it becomes compost.',
      ne: 'खाना र बोटबिरुवा वा जनावरबाट आएका कुहिने सबै फोहोर। छुट्टै बाल्टिनमा राख्नुहोस् — यसबाट कम्पोस्ट मल बन्छ।',
    },
    collected: { en: 'Collected twice a week', ne: 'हप्तामा दुई पटक सङ्कलन' },
  },
  nondegradable: {
    title: { en: 'Non-degradable', ne: 'नकुहिने फोहोर' },
    short: { en: 'Waste that does not rot', ne: 'नसड्ने–नगल्ने' },
    rule: {
      en: 'Plastic, paper, glass, metal, cloth and rubber. Keep it clean and dry — much of it can be recycled.',
      ne: 'प्लास्टिक, कागज, सिसा, धातु, कपडा र रबर। सफा र सुक्खा राख्नुहोस् — धेरैजसो पुनःप्रशोधन गर्न सकिन्छ।',
    },
    collected: { en: 'Collected once a week', ne: 'हप्तामा एक पटक सङ्कलन' },
  },
  hazardous: {
    title: { en: 'Keep separate', ne: 'छुट्टै राख्नुहोस्' },
    short: { en: 'Hazardous waste', ne: 'हानिकारक फोहोर' },
    rule: {
      en: 'Not with either kind. Store it safely in its own box or bag, out of children’s reach, and never burn it.',
      ne: 'कुनै पनि फोहोरसँग नमिसाउनुहोस्। छुट्टै बाकस वा झोलामा बालबालिकाको पहुँचबाहिर सुरक्षित राख्नुहोस्, कहिल्यै नजलाउनुहोस्।',
    },
    collected: { en: 'Ask us how to hand it over', ne: 'कसरी बुझाउने, हामीलाई सोध्नुहोस्' },
  },
};

export const sortItems: SortItem[] = [
  // ---- Degradable: waste that rots ----
  { id: 'veg', bin: 'degradable', poster: true, name: { en: 'Vegetable peels and scraps', ne: 'तरकारीका बोक्रा र टुक्रा' }, terms: 'vegetable tarkari sabji sag peel potato aalu alu cauliflower cabbage साग आलु' },
  { id: 'fruit', bin: 'degradable', poster: true, name: { en: 'Fruit peels and cores', ne: 'फलफूलका बोक्रा' }, terms: 'fruit phal banana kera orange suntala apple syau mango aanp केरा सुन्तला स्याउ आँप' },
  { id: 'food', bin: 'degradable', poster: true, name: { en: 'Leftover food — rice, dal, curry, roti', ne: 'बाँकी खाना — भात, दाल, तरकारी, रोटी' }, terms: 'bhat rice dal daal curry roti bread biscuit jutho leftover meal जुठो भात दाल रोटी' },
  { id: 'tea', bin: 'degradable', poster: true, name: { en: 'Used tea leaves and tea bags', ne: 'प्रयोग भएको चियापत्ती र टी-ब्याग' }, terms: 'tea chiya chiyapatti teabag चिया', tip: { en: 'Pull the staple out of tea bags first.', ne: 'टी-ब्यागको स्टेपल पहिले झिक्नुहोस्।' } },
  { id: 'coffee', bin: 'degradable', name: { en: 'Used coffee grounds', ne: 'प्रयोग भएको कफीको धुलो' }, terms: 'coffee kafi कफी' },
  { id: 'eggshell', bin: 'degradable', poster: true, name: { en: 'Egg shells', ne: 'अन्डाका बोक्रा' }, terms: 'egg anda phul फुल अण्डा', tip: { en: 'Crush them so they compost faster.', ne: 'छिटो कुहिन टुक्र्याएर हाल्नुहोस्।' } },
  { id: 'flowers', bin: 'degradable', poster: true, name: { en: 'Flowers, garlands and puja offerings', ne: 'फूल, माला र पूजाका सामग्री' }, terms: 'phool ful flower mala garland marigold sayapatri puja prasad फूल माला पूजा सयपत्री', tip: { en: 'Take off plastic, foil and threads first.', ne: 'प्लास्टिक, पन्नी र धागो पहिले झिक्नुहोस्।' } },
  { id: 'leaf-plates', bin: 'degradable', name: { en: 'Leaf plates and bowls (tapari, duna)', ne: 'टपरी र दुना' }, terms: 'tapari duna leaf plate bowl bhoj feast टपरी दुना भोज' },
  { id: 'garden', bin: 'degradable', poster: true, name: { en: 'Leaves, grass and garden trimmings', ne: 'पात, घाँस र बगैँचाको झारपात' }, terms: 'leaf leaves pat ghas grass garden plant weed jharpat पात घाँस' },
  { id: 'onion', bin: 'degradable', name: { en: 'Onion and garlic skins', ne: 'प्याज र लसुनका बोक्रा' }, terms: 'onion pyaj garlic lasun प्याज लसुन' },
  { id: 'corn', bin: 'degradable', name: { en: 'Corn cobs and husks', ne: 'मकैको खोया र बोक्रा' }, terms: 'corn makai maize bhutta मकै' },
  { id: 'nutshell', bin: 'degradable', name: { en: 'Peanut, nut and coconut shells', ne: 'बदाम, ओखर र नरिवलका बोक्रा' }, terms: 'peanut badam nut okhar walnut coconut nariwal nariyal बदाम ओखर नरिवल', tip: { en: 'Hard shells take longer to rot; break them up.', ne: 'कडा बोक्रा ढिलो कुहिन्छ; फुटाएर हाल्नुहोस्।' } },
  { id: 'tissue', bin: 'degradable', name: { en: 'Used tissues and paper napkins', ne: 'प्रयोग भएको टिस्यु र पेपर न्याप्किन' }, terms: 'tissue napkin kitchen paper टिस्यु', tip: { en: 'Dirty or greasy paper cannot be recycled, but it does rot.', ne: 'फोहोर वा चिल्लो कागज पुनःप्रशोधन हुँदैन, तर कुहिन्छ।' } },
  { id: 'bones', bin: 'degradable', name: { en: 'Bones, meat and fish scraps', ne: 'हड्डी, मासु र माछाका टुक्रा' }, terms: 'bone haddi meat masu chicken kukhura fish machha mutton हड्डी मासु माछा', tip: { en: 'These go with degradable waste. In a home compost bin use only small amounts, as they attract animals.', ne: 'यी कुहिने फोहोरमै पर्छन्। घरको कम्पोस्ट बिनमा भने जनावर आकर्षित हुने भएकाले थोरै मात्र हाल्नुहोस्।' } },
  { id: 'spoiled', bin: 'degradable', name: { en: 'Spoiled or mouldy food (out of its packet)', ne: 'कुहिएको वा ढुसी परेको खाना (प्याकेटबाट निकालेर)' }, terms: 'spoiled rotten mould mold expired food kuhiyeko कुहिएको' },
  { id: 'dung', bin: 'degradable', name: { en: 'Cow dung', ne: 'गोबर' }, terms: 'gobar dung manure गोबर' },
  { id: 'ash', bin: 'degradable', name: { en: 'Sawdust and cold wood ash', ne: 'काठको धुलो र सेलाएको खरानी' }, terms: 'sawdust ash kharani खरानी', tip: { en: 'Only cold ash, a little at a time.', ne: 'सेलाएको खरानी मात्र, थोरै–थोरै।' } },

  // ---- Non-degradable: waste that does not rot ----
  { id: 'plastic-bag', bin: 'nondegradable', poster: true, name: { en: 'Plastic bags', ne: 'प्लास्टिकका झोला' }, terms: 'plastic bag jhola polythene poly thaili झोला पोलिथिन थैली', tip: { en: 'Shake them clean and keep them dry.', ne: 'झट्कारेर सफा र सुक्खा राख्नुहोस्।' } },
  { id: 'plastic-bottle', bin: 'nondegradable', poster: true, name: { en: 'Plastic bottles and containers', ne: 'प्लास्टिकका बोतल र भाँडा' }, terms: 'bottle botal water coke pepsi pet jar container dabba बोतल डब्बा', tip: { en: 'Empty, rinse and squash them.', ne: 'खाली गरी पखालेर थिच्नुहोस्।' } },
  { id: 'wrappers', bin: 'nondegradable', poster: true, name: { en: 'Noodle, chips and biscuit wrappers', ne: 'चाउचाउ, चिप्स र बिस्कुटका खोल' }, terms: 'wrapper packet noodles chauchau wai wai rara chips kurkure biscuit candy chocolate चाउचाउ खोल' },
  { id: 'milk-pouch', bin: 'nondegradable', poster: true, name: { en: 'Milk and curd pouches', ne: 'दूध र दहीका प्याकेट' }, terms: 'milk dudh curd dahi pouch packet दूध दही', tip: { en: 'Rinse them first so they do not smell.', ne: 'गन्हाउन नदिन पहिले पखाल्नुहोस्।' } },
  { id: 'paper', bin: 'nondegradable', poster: true, name: { en: 'Newspaper, notebooks and office paper', ne: 'पत्रिका, कापी र कागज' }, terms: 'paper kagaj newspaper patrika copy kapi book notebook magazine कागज पत्रिका कापी', tip: { en: 'Keep it dry — clean paper is made into new paper at our Gokarna plant.', ne: 'सुक्खा राख्नुहोस् — सफा कागजबाट हाम्रो गोकर्णस्थित केन्द्रमा नयाँ कागज बनाइन्छ।' } },
  { id: 'cardboard', bin: 'nondegradable', name: { en: 'Cardboard boxes', ne: 'कार्टुन र बाकस' }, terms: 'cardboard carton kartun box baksa कार्टुन', tip: { en: 'Flatten them.', ne: 'थिचेर चेप्टो बनाउनुहोस्।' } },
  { id: 'tetra', bin: 'nondegradable', name: { en: 'Juice and milk cartons (Tetra Pak)', ne: 'जुस र दूधका कार्टुन (टेट्रा प्याक)' }, terms: 'juice frooti real tetra carton जुस' },
  { id: 'glass', bin: 'nondegradable', poster: true, name: { en: 'Glass bottles and jars', ne: 'सिसाका बोतल र बट्टा' }, terms: 'glass sisa bottle jar beer achar सिसा बोतल' },
  { id: 'broken-glass', bin: 'nondegradable', name: { en: 'Broken glass and mirrors', ne: 'फुटेको सिसा र ऐना' }, terms: 'broken glass mirror aina ऐना', tip: { en: 'Wrap it in thick paper and mark it, so collectors do not get cut.', ne: 'सङ्कलन गर्नेको हात नकाटियोस् भनी बाक्लो कागजमा बेरेर चिनो लगाउनुहोस्।' } },
  { id: 'metal', bin: 'nondegradable', poster: true, name: { en: 'Tins, cans, foil and metal', ne: 'टिनका बट्टा, पन्नी र धातु' }, terms: 'tin can metal dhatu foil aluminium steel iron falam फलाम पन्नी' },
  { id: 'clothes', bin: 'nondegradable', name: { en: 'Old clothes, bags and shoes', ne: 'पुराना कपडा, झोला र जुत्ता' }, terms: 'clothes kapada kapda shoes juta bag cloth कपडा जुत्ता', tip: { en: 'Give away anything that can still be worn.', ne: 'लगाउन मिल्ने कपडा अरूलाई दिनुहोस्।' } },
  { id: 'rubber', bin: 'nondegradable', name: { en: 'Rubber and slippers', ne: 'रबर र चप्पल' }, terms: 'rubber chappal slipper tyre चप्पल' },
  { id: 'thermocol', bin: 'nondegradable', name: { en: 'Thermocol (styrofoam) plates and packing foam', ne: 'थर्मोकोलका प्लेट र प्याकिङ फोम' }, terms: 'thermocol styrofoam foam packing plate थर्मोकोल' },
  { id: 'disposables', bin: 'nondegradable', name: { en: 'Plastic cups, plates and straws', ne: 'प्लास्टिकका कप, प्लेट र स्ट्र' }, terms: 'disposable cup plate straw spoon party' },
  { id: 'sanitary', bin: 'nondegradable', name: { en: 'Sanitary pads and diapers', ne: 'स्यानिटरी प्याड र डाइपर' }, terms: 'pad sanitary diaper daipar nappy प्याड डाइपर', tip: { en: 'Wrap them in paper or a bag first.', ne: 'पहिले कागज वा झोलामा बेर्नुहोस्।' } },
  { id: 'masks', bin: 'nondegradable', name: { en: 'Face masks and gloves', ne: 'मास्क र पन्जा' }, terms: 'mask glove panja मास्क पन्जा', tip: { en: 'Wrap them in paper or a bag first.', ne: 'पहिले कागज वा झोलामा बेर्नुहोस्।' } },
  { id: 'ceramics', bin: 'nondegradable', name: { en: 'Broken cups, plates, clay pots and diyo', ne: 'फुटेका कप, प्लेट, माटाका भाँडा र दियो' }, terms: 'ceramic cup plate pot clay mato bhanda diyo diya pala भाँडा दियो पाला', tip: { en: 'Wrap sharp pieces.', ne: 'धारिला टुक्रा बेरेर राख्नुहोस्।' } },
  { id: 'firecrackers', bin: 'nondegradable', name: { en: 'Burnt-out firecrackers', ne: 'पड्किसकेका पटका' }, terms: 'firecracker pataka cracker tihar sparkler पटका', tip: { en: 'Soak them in a bucket of water overnight, then let them dry.', ne: 'रातभर पानीको बाल्टिनमा डुबाएर राख्नुहोस्, अनि सुकाउनुहोस्।' } },
  { id: 'small-plastic', bin: 'nondegradable', name: { en: 'Toothbrushes, pens and small plastic items', ne: 'टुथब्रस, कलम र साना प्लास्टिक सामान' }, terms: 'toothbrush pen toy khelauna plastic कलम खेलौना' },
  { id: 'cigarette', bin: 'nondegradable', name: { en: 'Cigarette butts', ne: 'चुरोटका ठुटा' }, terms: 'cigarette churot butt चुरोट', tip: { en: 'Make sure they are fully out.', ne: 'पूरै निभेको पक्का गर्नुहोस्।' } },

  // ---- Keep separate: hazardous ----
  { id: 'batteries', bin: 'hazardous', poster: true, name: { en: 'Batteries and cells', ne: 'ब्याट्री र सेल' }, terms: 'battery betri cell button watch remote torch ब्याट्री', tip: { en: 'Keep them in a closed box; never burn or bury them.', ne: 'बन्द बाकसमा राख्नुहोस्; कहिल्यै नजलाउनुहोस् वा नगाड्नुहोस्।' } },
  { id: 'e-waste', bin: 'hazardous', poster: true, name: { en: 'Mobile phones, chargers and electronics', ne: 'मोबाइल, चार्जर र इलेक्ट्रोनिक सामान' }, terms: 'mobile phone charger laptop computer tv wire cable electronic e-waste microwave fridge iron heater fan radio earphone मोबाइल चार्जर', tip: { en: 'Give them to e-waste recyclers or repair shops.', ne: 'ई-वेस्ट पुनःप्रशोधक वा मर्मत पसललाई दिनुहोस्।' } },
  { id: 'bulbs', bin: 'hazardous', poster: true, name: { en: 'CFL bulbs and tube lights', ne: 'सीएफएल बल्ब र ट्युबलाइट' }, terms: 'bulb light tube cfl lamp बल्ब', tip: { en: 'They contain mercury — do not break them.', ne: 'यसमा पारो हुन्छ — नफुटाउनुहोस्।' } },
  { id: 'medicines', bin: 'hazardous', poster: true, name: { en: 'Expired medicines', ne: 'म्याद नाघेका औषधि' }, terms: 'medicine ausadhi aushadhi tablet goli syrup capsule औषधि चक्की', tip: { en: 'Keep them in their packets; never pour them into drains.', ne: 'प्याकेटमै राख्नुहोस्; ढलमा नफाल्नुहोस्।' } },
  { id: 'sharps', bin: 'hazardous', name: { en: 'Needles, syringes and blades', ne: 'सुई, सिरिन्ज र ब्लेड' }, terms: 'needle sui syringe injection blade razor insulin सुई', tip: { en: 'Put them in a hard bottle with a lid and label it.', ne: 'बिर्कोसहितको कडा बोतलमा राखी लेबल लगाउनुहोस्।' } },
  { id: 'chemicals', bin: 'hazardous', name: { en: 'Paint, pesticide and chemical containers', ne: 'रङ, कीटनाशक र रसायनका भाँडा' }, terms: 'paint rang pesticide insecticide chemical acid phenyl cleaner रङ विषादी', tip: { en: 'Close them tightly; never pour leftovers into drains.', ne: 'राम्ररी बन्द गर्नुहोस्; बाँकी रसायन ढलमा नखन्याउनुहोस्।' } },
  { id: 'spray', bin: 'hazardous', name: { en: 'Spray cans', ne: 'स्प्रे क्यान' }, terms: 'spray aerosol deodorant can स्प्रे', tip: { en: 'Do not puncture or burn them.', ne: 'प्वाल नपार्नुहोस्, नजलाउनुहोस्।' } },
  { id: 'thermometer', bin: 'hazardous', name: { en: 'Mercury thermometers', ne: 'पारो भएको थर्मोमिटर' }, terms: 'thermometer mercury paro थर्मोमिटर पारो' },
];

/** Quick suggestions shown before anyone types. */
export const popularItems = ['plastic-bag', 'tea', 'milk-pouch', 'sanitary', 'batteries', 'eggshell', 'wrappers', 'medicines'];

/** Name without the "— rice, dal…" or "(Tetra Pak)" detail, for chips, the game and the poster. */
export const shortName = (s: string) => s.split(/\s[—(]/)[0].trim();
