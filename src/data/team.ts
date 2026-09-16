import type { ImageMetadata } from 'astro';
import type { L } from '~/i18n/utils';
import tikaram from '~/assets/images/team/tikaram.png';
import laxmigelal from '~/assets/images/team/laxmigelal.png';
import baburamghim from '~/assets/images/team/baburamghim.png';
import govinda from '~/assets/images/team/govinda.png';
import laxmighim from '~/assets/images/team/laxmighim.png';
import meetra from '~/assets/images/team/meetra.png';
import baburamcham from '~/assets/images/team/baburamcham.png';
import saru from '~/assets/images/team/saru.png';
import rabindra from '~/assets/images/team/rabindra.png';
import rajkumar from '~/assets/images/team/rajkumar.png';

export type Member = { name: L; role: L; phone: string; photo: ImageMetadata };

export const team: Member[] = [
  { name: { en: 'Tika Ram Dahal', ne: 'टीकाराम दाहाल' }, role: { en: 'Chairman / Managing Director', ne: 'अध्यक्ष / प्रबन्ध निर्देशक' }, phone: '+977-9801843400', photo: tikaram },
  { name: { en: 'Laxmi Gelal', ne: 'लक्ष्मी गेलाल' }, role: { en: 'Chief, Lalitpur Field Office', ne: 'प्रमुख, ललितपुर क्षेत्रीय कार्यालय' }, phone: '+977-9801843401', photo: laxmigelal },
  { name: { en: 'Baburam Ghimire', ne: 'बाबुराम घिमिरे' }, role: { en: 'Chief, Swoyambhu Branch', ne: 'प्रमुख, स्वयम्भू शाखा' }, phone: '+977-9801843402', photo: baburamghim },
  { name: { en: 'Govinda Prasad Acharya', ne: 'गोविन्दप्रसाद आचार्य' }, role: { en: 'Chief, Program & Public Relations', ne: 'प्रमुख, कार्यक्रम तथा जनसम्पर्क' }, phone: '+977-9801843405', photo: govinda },
  { name: { en: 'Laxmi Prasad Ghimire', ne: 'लक्ष्मीप्रसाद घिमिरे' }, role: { en: 'Spokesperson / Head of Documentation', ne: 'प्रवक्ता / प्रमुख, अभिलेख विभाग' }, phone: '+977-9801843403', photo: laxmighim },
  { name: { en: 'Meetra Prasad Ghimire', ne: 'मित्रप्रसाद घिमिरे' }, role: { en: 'Chief, Maharajgunj Branch', ne: 'प्रमुख, महाराजगञ्ज शाखा' }, phone: '+977-9801843700', photo: meetra },
  { name: { en: 'Baburam Chaulagain', ne: 'बाबुराम चौलागाईं' }, role: { en: 'Chief, Bhaktapur Branch', ne: 'प्रमुख, भक्तपुर शाखा' }, phone: '+977-9801843404', photo: baburamcham },
  { name: { en: 'Saraswati Acharya', ne: 'सरस्वती आचार्य' }, role: { en: 'Head of Accounts', ne: 'प्रमुख, लेखा विभाग' }, phone: '+977-9801843406', photo: saru },
  { name: { en: 'Rabindra Niraula', ne: 'रवीन्द्र निरौला' }, role: { en: 'Store Manager', ne: 'भण्डार प्रबन्धक' }, phone: '+977-9801843407', photo: rabindra },
  { name: { en: 'Raj Kumar Dhakal', ne: 'राजकुमार ढकाल' }, role: { en: 'R&D Officer / Advocate', ne: 'अनुसन्धान तथा विकास अधिकृत / अधिवक्ता' }, phone: '+977-9801843408', photo: rajkumar },
];
