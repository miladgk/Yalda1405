import { EVENT_CONFIG, type CapacityStatus, type RegistrationFormState } from '../types/yalda';
import { isGoogleAuthConfigured } from './googleAuth';

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export function toFa(value: number | string): string {
  return String(value).replace(/\d/g, (d) => PERSIAN_DIGITS[Number(d)] ?? d);
}

export function computeCapacityState(
  capacityInput: number,
  bookedInput: number
): CapacityStatus {
  const capacity = Math.max(1, Math.floor(capacityInput));
  const booked = Math.max(0, Math.min(capacity, Math.floor(bookedInput)));
  const remaining = Math.max(0, capacity - booked);
  const percentFilled = Math.min(100, Math.round((booked / capacity) * 100));
  const isFull = remaining <= 0;
  const isLow = !isFull && remaining <= 15;

  return {
    capacity,
    booked,
    remaining,
    percentFilled,
    isLow,
    isFull,
  };
}

export function clampGuests(requested: number, remainingSeats: number): number {
  const maxAllowed = Math.max(1, Math.min(10, Math.floor(remainingSeats) || 1));
  return Math.max(1, Math.min(maxAllowed, Math.floor(requested) || 1));
}

export function calculateFee(guests: number, pricePerPerson = EVENT_CONFIG.pricePerPerson): number {
  const safeGuests = Math.max(1, Math.floor(guests) || 1);
  return safeGuests * pricePerPerson;
}

export interface Step2ValidationResult {
  valid: boolean;
  errorField?: 'googleAuth' | 'fullName' | 'email' | 'attendance' | 'photoConsent';
  errorMessage?: string;
}

export interface Step2ValidationOptions {
  requireGoogleAuth?: boolean;
  googleVerified?: boolean;
  verifiedEmail?: string;
}

export function validateStep2(
  form: Pick<RegistrationFormState, 'fullName' | 'email' | 'attendance' | 'photoConsent'>,
  options: Step2ValidationOptions = {}
): Step2ValidationResult {
  const requireGoogleAuth = options.requireGoogleAuth ?? isGoogleAuthConfigured();
  if (requireGoogleAuth) {
    const emailMatches =
      Boolean(options.verifiedEmail) &&
      options.verifiedEmail!.trim().toLowerCase() === form.email.trim().toLowerCase();
    if (!options.googleVerified || !emailMatches) {
      return {
        valid: false,
        errorField: 'googleAuth',
        errorMessage: 'لطفاً ابتدا با حساب گوگل خود وارد شوید تا ایمیل شما تایید شود.',
      };
    }
  }

  const name = form.fullName.trim();
  if (!name) {
    return {
      valid: false,
      errorField: 'fullName',
      errorMessage: 'لطفاً نام و نام خانوادگی خود را وارد کنید.',
    };
  }

  const email = form.email.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailPattern.test(email)) {
    return {
      valid: false,
      errorField: 'email',
      errorMessage: 'لطفاً یک نشانی ایمیل معتبر وارد کنید.',
    };
  }

  if (!form.attendance.trim()) {
    return {
      valid: false,
      errorField: 'attendance',
      errorMessage: 'لطفاً بخش حضور در مراسم را انتخاب کنید.',
    };
  }

  if (!form.photoConsent.trim()) {
    return {
      valid: false,
      errorField: 'photoConsent',
      errorMessage: 'لطفاً وضعیت رضایت عکاسی (GDPR) را مشخص کنید.',
    };
  }

  return { valid: true };
}

export function generateTrackingCode(randomFn: () => number = Math.random): string {
  const n = Math.floor(10000 + randomFn() * 90000);
  return `YLD-${n}`;
}
