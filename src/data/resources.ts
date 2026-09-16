import type { L } from '~/i18n/utils';
import type { IconName } from '~/components/icons';

export type ResourceFolder = { id: string; icon: IconName; title: L; text: L; driveId: string; tags?: L[] };

/** Files are managed by staff in these Google Drive folders. */
export const resourceFolders: ResourceFolder[] = [
  {
    id: 'newsletters',
    icon: 'newspaper',
    title: { en: 'Newsletters', ne: 'न्यूजलेटर' },
    text: {
      en: 'Quarterly updates on our work, activities and other news.',
      ne: 'हाम्रा काम, गतिविधि तथा अन्य जानकारीसहितको त्रैमासिक विवरण।',
    },
    driveId: '124rCvQxlyuJZU5X2AaJLcxAqF1iJnoYw',
  },
  {
    id: 'regulations',
    icon: 'scale',
    title: { en: 'Government regulations', ne: 'सरकारी ऐन-नियम' },
    text: {
      en: 'Solid waste management acts and regulations issued by the Government of Nepal.',
      ne: 'नेपाल सरकारले जारी गरेका ठोस फोहोरमैला व्यवस्थापनसम्बन्धी ऐन तथा नियमावली।',
    },
    driveId: '1ekxDG2bATyEFro6sj7IKkqjBRH7xKtO4',
  },
  {
    id: 'guides',
    icon: 'book-open',
    title: { en: 'Guides', ne: 'मार्गदर्शन' },
    text: {
      en: 'Helpful information about solid waste and about our company.',
      ne: 'ठोस फोहोर तथा हाम्रो कम्पनीसम्बन्धी उपयोगी जानकारी।',
    },
    driveId: '1XFtzcxSRxKJ9fdDky2-XAfJTdS037hed',
  },
  {
    id: 'composting',
    icon: 'sprout',
    title: { en: 'Composting manuals', ne: 'कम्पोस्ट निर्देशिका' },
    text: {
      en: 'Everything you need to know about compost and the composting process.',
      ne: 'कम्पोस्ट मल तथा मल बनाउने प्रक्रियासम्बन्धी आवश्यक सबै जानकारी।',
    },
    driveId: '1xfp7U8ONoTHO1ul_M28Q-i0AbbtBBSk6',
    tags: [
      { en: 'Manure', ne: 'मल' },
      { en: 'EM', ne: 'इएम' },
      { en: 'Bokashi', ne: 'बोकासी' },
      { en: 'Pit & pile', ne: 'खाडल तथा थुप्रो' },
      { en: 'Bin & vermi', ne: 'बिन तथा गँड्यौला' },
    ],
  },
  {
    id: 'publications',
    icon: 'library',
    title: { en: 'Informative publications', ne: 'सूचनामूलक प्रकाशन' },
    text: {
      en: 'Publications on the solid waste management sector, with contributions from a wide range of people.',
      ne: 'विभिन्न क्षेत्रका व्यक्तिका लेख-रचनासहित ठोस फोहोरमैला व्यवस्थापन क्षेत्रसम्बन्धी प्रकाशन।',
    },
    driveId: '1G-p3luAo5QXguK5kRpayMwR6ydkY1Rjl',
  },
];

export const driveFolderUrl = (id: string) => `https://drive.google.com/drive/folders/${id}`;
export const driveEmbedUrl = (id: string) => `https://drive.google.com/embeddedfolderview?id=${id}#grid`;
