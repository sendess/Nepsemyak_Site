// Only the icons the site uses are imported, so the build stays small.
import ArrowDown from '@lucide/astro/icons/arrow-down';
import ArrowLeft from '@lucide/astro/icons/arrow-left';
import ArrowRight from '@lucide/astro/icons/arrow-right';
import ArrowUp from '@lucide/astro/icons/arrow-up';
import ArrowUpRight from '@lucide/astro/icons/arrow-up-right';
import BookOpen from '@lucide/astro/icons/book-open';
import Briefcase from '@lucide/astro/icons/briefcase';
import BrushCleaning from '@lucide/astro/icons/brush-cleaning';
import Building from '@lucide/astro/icons/building';
import Calculator from '@lucide/astro/icons/calculator';
import CalendarIcon from '@lucide/astro/icons/calendar';
import ChartBar from '@lucide/astro/icons/chart-bar';
import Check from '@lucide/astro/icons/check';
import ChevronDown from '@lucide/astro/icons/chevron-down';
import ChevronLeft from '@lucide/astro/icons/chevron-left';
import ChevronRight from '@lucide/astro/icons/chevron-right';
import ChevronsUpDown from '@lucide/astro/icons/chevrons-up-down';
import CircleCheck from '@lucide/astro/icons/circle-check';
import CircleQuestionMark from '@lucide/astro/icons/circle-question-mark';
import CircleX from '@lucide/astro/icons/circle-x';
import Clock from '@lucide/astro/icons/clock';
import Download from '@lucide/astro/icons/download';
import ExternalLink from '@lucide/astro/icons/external-link';
import Eye from '@lucide/astro/icons/eye';
import Factory from '@lucide/astro/icons/factory';
import FileText from '@lucide/astro/icons/file-text';
import Flower from '@lucide/astro/icons/flower';
import FolderOpen from '@lucide/astro/icons/folder-open';
import GraduationCap from '@lucide/astro/icons/graduation-cap';
import Handshake from '@lucide/astro/icons/handshake';
import House from '@lucide/astro/icons/house';
import Info from '@lucide/astro/icons/info';
import Landmark from '@lucide/astro/icons/landmark';
import Languages from '@lucide/astro/icons/languages';
import Leaf from '@lucide/astro/icons/leaf';
import Library from '@lucide/astro/icons/library';
import Lightbulb from '@lucide/astro/icons/lightbulb';
import Mail from '@lucide/astro/icons/mail';
import MapIcon from '@lucide/astro/icons/map';
import MapPin from '@lucide/astro/icons/map-pin';
import Megaphone from '@lucide/astro/icons/megaphone';
import Menu from '@lucide/astro/icons/menu';
import MessageCircle from '@lucide/astro/icons/message-circle';
import MessagesSquare from '@lucide/astro/icons/messages-square';
import Minus from '@lucide/astro/icons/minus';
import Mountain from '@lucide/astro/icons/mountain';
import Newspaper from '@lucide/astro/icons/newspaper';
import PawPrint from '@lucide/astro/icons/paw-print';
import Phone from '@lucide/astro/icons/phone';
import Play from '@lucide/astro/icons/play';
import Plus from '@lucide/astro/icons/plus';
import Printer from '@lucide/astro/icons/printer';
import Quote from '@lucide/astro/icons/quote';
import Recycle from '@lucide/astro/icons/recycle';
import RotateCcw from '@lucide/astro/icons/rotate-ccw';
import Scale from '@lucide/astro/icons/scale';
import Search from '@lucide/astro/icons/search';
import Send from '@lucide/astro/icons/send';
import Sparkles from '@lucide/astro/icons/sparkles';
import Sprout from '@lucide/astro/icons/sprout';
import Target from '@lucide/astro/icons/target';
import Trash from '@lucide/astro/icons/trash';
import TriangleAlert from '@lucide/astro/icons/triangle-alert';
import Trophy from '@lucide/astro/icons/trophy';
import Truck from '@lucide/astro/icons/truck';
import Users from '@lucide/astro/icons/users';
import Warehouse from '@lucide/astro/icons/warehouse';
import X from '@lucide/astro/icons/x';

export const icons = {
  'arrow-down': ArrowDown,
  'arrow-left': ArrowLeft,
  'arrow-right': ArrowRight,
  'arrow-up': ArrowUp,
  'arrow-up-right': ArrowUpRight,
  'book-open': BookOpen,
  briefcase: Briefcase,
  'brush-cleaning': BrushCleaning,
  building: Building,
  calculator: Calculator,
  calendar: CalendarIcon,
  'chart-bar': ChartBar,
  check: Check,
  'chevron-down': ChevronDown,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  'chevrons-up-down': ChevronsUpDown,
  'circle-check': CircleCheck,
  'circle-question-mark': CircleQuestionMark,
  'circle-x': CircleX,
  clock: Clock,
  download: Download,
  'external-link': ExternalLink,
  eye: Eye,
  factory: Factory,
  'file-text': FileText,
  flower: Flower,
  'folder-open': FolderOpen,
  'graduation-cap': GraduationCap,
  handshake: Handshake,
  house: House,
  info: Info,
  landmark: Landmark,
  languages: Languages,
  leaf: Leaf,
  library: Library,
  lightbulb: Lightbulb,
  mail: Mail,
  map: MapIcon,
  'map-pin': MapPin,
  megaphone: Megaphone,
  menu: Menu,
  'message-circle': MessageCircle,
  'messages-square': MessagesSquare,
  minus: Minus,
  mountain: Mountain,
  newspaper: Newspaper,
  'paw-print': PawPrint,
  phone: Phone,
  play: Play,
  plus: Plus,
  printer: Printer,
  quote: Quote,
  recycle: Recycle,
  'rotate-ccw': RotateCcw,
  scale: Scale,
  search: Search,
  send: Send,
  sparkles: Sparkles,
  sprout: Sprout,
  target: Target,
  trash: Trash,
  'triangle-alert': TriangleAlert,
  trophy: Trophy,
  truck: Truck,
  users: Users,
  warehouse: Warehouse,
  x: X,
} as const;

export type IconName = keyof typeof icons;

/** Brand marks from Simple Icons (CC0). Lucide no longer ships brand logos. */
export const brandPaths = {
  facebook:
    'M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z',
  youtube:
    'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
} as const;

export type BrandName = keyof typeof brandPaths;
