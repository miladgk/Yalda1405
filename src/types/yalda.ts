export type StepId = 1 | 2 | 3 | 4;

export interface EventConfig {
  associationName: string;
  title: string;
  date: string;
  venue: string;
  address: string;
  mapsUrl: string;
  scheduleSummary: string;
  filmDesc: string;
  mobilePay: string;
  iban: string;
  contact: string;
  pricePerPerson: number;
  maxCapacity: number;
  initialBooked: number;
}

export const EVENT_CONFIG: EventConfig = {
  associationName: 'انجمن فرهنگی هنری آوید',
  title: 'جشن شب یلدا ۱۴۰۵ | هلسینکی',
  date: 'یکشنبه ۲۹ آذر ۱۴۰۵ (۲۰ دسامبر ۲۰۲۶)',
  venue: 'Roihuvuori Youth Centre',
  address: 'Prinssintie 1, 00820 Helsinki',
  mapsUrl: 'https://www.google.com/maps/dir/?api=1&hl=en&destination=Prinssintie%201,Helsinki',
  scheduleSummary: 'شروع برنامه ۱۵:۳۰ · اکران فیلم ۱۶:۰۰ تا ۱۷:۴۵ · دورهمی یلدایی از ۱۸:۰۰',
  filmDesc: 'اکران فیلم (۱۶:۰۰ تا ۱۷:۴۵)',
  mobilePay: '040 123 4567',
  iban: 'FI00 0000 0000 0000 00',
  contact: 'avidry.finland@gmail.com',
  pricePerPerson: 5,
  maxCapacity: 40,
  initialBooked: 0,
};

export interface CapacityStatus {
  capacity: number;
  booked: number;
  remaining: number;
  percentFilled: number;
  isLow: boolean;
  isFull: boolean;
}

export interface RegistrationFormState {
  fullName: string;
  email: string;
  phone: string;
  guests: number;
  attendance: string;
  photoConsent: string;
  paymentMethod: string;
  paymentRef: string;
  volunteering: string[];
  notes: string;
}

export interface TicketRecord {
  trackingCode: string;
  fullName: string;
  guests: number;
  totalFee: number;
  attendance: string;
  paymentMethod: string;
  emailSent: boolean;
  isDemo: boolean;
}

export const ATTENDANCE_OPTIONS = [
  {
    value: 'از شروع برنامه (ساعت ۳:۳۰ / ۱۵:۳۰)',
    title: 'از ساعت ۳:۳۰ (۱۵:۳۰)',
    subtitle: 'شروع برنامه، فیلم و دورهمی',
  },
  {
    value: 'از ساعت ۶ (۱۸:۰۰)',
    title: 'از ساعت ۶ (۱۸:۰۰)',
    subtitle: 'بخش دورهمی یلدایی',
  },
] as const;

export const PHOTO_CONSENT_OPTIONS = [
  'موافق با عکاسی و انتشار',
  'عدم رضایت برای انتشار تصویر',
] as const;

export const VOLUNTEER_OPTIONS = [
  'کمک در چیدمان سالن',
  'کمک در جمع‌آوری سالن',
  'مشارکت هنری',
] as const;

export const INITIAL_FORM_STATE: RegistrationFormState = {
  fullName: '',
  email: '',
  phone: '',
  guests: 1,
  attendance: '',
  photoConsent: '',
  paymentMethod: 'واریز آنلاین (MobilePay / IBAN)',
  paymentRef: '',
  volunteering: [],
  notes: '',
};
