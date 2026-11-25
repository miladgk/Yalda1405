import { AlertTriangle, Minus, Plus } from 'lucide-react';
import {
  ATTENDANCE_OPTIONS,
  EVENT_CONFIG,
  PHOTO_CONSENT_OPTIONS,
  type RegistrationFormState,
} from '../types/yalda';
import { calculateFee, toFa } from '../utils/yaldaLogic';

interface StepDetailsProps {
  form: RegistrationFormState;
  remainingSeats: number;
  errorMsg: string | null;
  errorField?: 'fullName' | 'email' | 'attendance' | 'photoConsent';
  onChangeField: <K extends keyof RegistrationFormState>(
    field: K,
    value: RegistrationFormState[K]
  ) => void;
  onAdjustGuests: (delta: number) => void;
}

export function StepDetails({
  form,
  remainingSeats,
  errorMsg,
  errorField,
  onChangeField,
  onAdjustGuests,
}: StepDetailsProps) {
  const maxAllowed = Math.max(1, Math.min(10, remainingSeats || 1));
  const totalFee = calculateFee(form.guests);

  return (
    <section aria-label="مشخصات و نحوه حضور" className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base font-extrabold text-[#fbf6f0] sm:text-lg">مشخصات و نحوه حضور</h2>
        <span className="text-xs text-[#d8c7cf] sm:text-[13px]">
          بلیت دیجیتال به ایمیل شما ارسال می‌شود
        </span>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="shake-error flex items-center gap-2 rounded-xl border border-[#dc2645]/60 bg-[#a61c31]/30 px-3.5 py-2.5 text-xs font-semibold text-[#ffe4ea] sm:text-sm"
        >
          <AlertTriangle className="h-4 w-4 shrink-0 text-[#ff8da4]" aria-hidden="true" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Name & Email */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="fullName" className="text-xs font-semibold text-[#fbf6f0] sm:text-sm">
            نام و نام خانوادگی <span className="text-[#ff6b86]">*</span>
          </label>
          <input
            id="fullName"
            type="text"
            autoComplete="name"
            value={form.fullName}
            onChange={(e) => onChangeField('fullName', e.target.value)}
            placeholder="مثلاً: سارا محمدی"
            className={`min-h-[44px] w-full rounded-xl border bg-[#0a060d]/60 px-3.5 py-2 text-base text-[#fbf6f0] placeholder:text-[#9e8d96]/70 focus:outline-none sm:text-sm ${
              errorField === 'fullName'
                ? 'border-[#dc2645] ring-2 ring-[#dc2645]/25'
                : 'border-white/15 focus:border-[#dfb16b] focus:ring-2 focus:ring-[#dfb16b]/20'
            }`}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-xs font-semibold text-[#fbf6f0] sm:text-sm">
            ایمیل <span className="text-[#ff6b86]">*</span>
          </label>
          <input
            id="email"
            type="email"
            dir="ltr"
            autoComplete="email"
            value={form.email}
            onChange={(e) => onChangeField('email', e.target.value)}
            placeholder="name@example.com"
            className={`min-h-[44px] w-full rounded-xl border bg-[#0a060d]/60 px-3.5 py-2 text-left text-base text-[#fbf6f0] placeholder:text-[#9e8d96]/70 focus:outline-none sm:text-sm ${
              errorField === 'email'
                ? 'border-[#dc2645] ring-2 ring-[#dc2645]/25'
                : 'border-white/15 focus:border-[#dfb16b] focus:ring-2 focus:ring-[#dfb16b]/20'
            }`}
          />
        </div>
      </div>

      {/* Phone & Guest Stepper */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="phone" className="text-xs font-semibold text-[#fbf6f0] sm:text-sm">
            شماره تماس (اختیاری)
          </label>
          <input
            id="phone"
            type="tel"
            dir="ltr"
            autoComplete="tel"
            value={form.phone}
            onChange={(e) => onChangeField('phone', e.target.value)}
            placeholder="+358 40 123 4567"
            className="min-h-[44px] w-full rounded-xl border border-white/15 bg-[#0a060d]/60 px-3.5 py-2 text-left text-base text-[#fbf6f0] placeholder:text-[#9e8d96]/70 focus:border-[#dfb16b] focus:ring-2 focus:ring-[#dfb16b]/20 focus:outline-none sm:text-sm"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-[#fbf6f0] sm:text-sm">
            تعداد نفرات <span className="text-[#ff6b86]">*</span>
          </span>
          <div className="flex min-h-[44px] items-center justify-between gap-2 rounded-xl border border-[#dfb16b]/35 bg-[#0a060d]/60 px-2.5 py-1.5">
            <div className="inline-flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => onAdjustGuests(-1)}
                disabled={form.guests <= 1}
                aria-label="کاهش تعداد نفرات"
                className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-white/18 bg-white/[0.08] text-[#fbf6f0] transition hover:border-[#dfb16b] hover:bg-[#a61c31]/70 disabled:cursor-not-allowed disabled:opacity-35"
              >
                <Minus className="h-4 w-4" aria-hidden="true" />
              </button>
              <span className="min-w-[24px] text-center text-base font-extrabold tabular-nums text-[#fbf6f0]">
                {toFa(form.guests)}
              </span>
              <button
                type="button"
                onClick={() => onAdjustGuests(1)}
                disabled={form.guests >= maxAllowed}
                aria-label="افزایش تعداد نفرات"
                className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-white/18 bg-white/[0.08] text-[#fbf6f0] transition hover:border-[#dfb16b] hover:bg-[#a61c31]/70 disabled:cursor-not-allowed disabled:opacity-35"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <span
              dir="ltr"
              data-testid="live-fee-display"
              className="rounded-lg border border-[#dfb16b]/45 bg-gradient-to-br from-[#a61c31]/40 to-[#dfb16b]/20 px-2.5 py-1 text-xs font-extrabold tabular-nums text-[#fae3bb] whitespace-nowrap"
            >
              {EVENT_CONFIG.pricePerPerson} € × {form.guests} = {totalFee} €
            </span>
          </div>
        </div>
      </div>

      {/* Attendance Radio Group */}
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1.5 text-xs font-semibold text-[#fbf6f0] sm:text-sm">
          بخش حضور در مراسم <span className="text-[#ff6b86]">*</span>
        </legend>
        <div
          className={`grid grid-cols-1 gap-2 rounded-xl sm:grid-cols-2 sm:gap-2.5 ${
            errorField === 'attendance' ? 'ring-2 ring-[#dc2645]/45 p-1' : ''
          }`}
        >
          {ATTENDANCE_OPTIONS.map((opt) => {
            const checked = form.attendance === opt.value;
            return (
              <label
                key={opt.value}
                className={`flex min-h-[54px] cursor-pointer flex-col items-center justify-center rounded-xl border px-3 py-2 text-center transition-all ${
                  checked
                    ? 'border-[#dfb16b] bg-gradient-to-br from-[#a61c31]/40 to-[#dfb16b]/20 text-[#fbf6f0] shadow-[0_0_16px_-6px_rgba(223,177,107,0.6)]'
                    : 'border-white/14 bg-white/[0.04] text-[#d8c7cf] hover:border-[#dfb16b]/40 hover:bg-white/[0.08]'
                }`}
              >
                <input
                  type="radio"
                  name="attendance"
                  value={opt.value}
                  checked={checked}
                  onChange={() => onChangeField('attendance', opt.value)}
                  className="sr-only"
                />
                <span className="text-xs font-bold sm:text-[13px]">{opt.title}</span>
                <span className={`mt-0.5 text-[11px] ${checked ? 'text-[#fae3bb]' : 'text-[#bfb0b8]'}`}>
                  {opt.subtitle}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* GDPR Photo Consent Radio Group */}
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1.5 text-xs font-semibold text-[#fbf6f0] sm:text-sm">
          رضایت عکاسی در مراسم (GDPR) <span className="text-[#ff6b86]">*</span>
        </legend>
        <div
          className={`grid grid-cols-1 gap-2 rounded-xl sm:grid-cols-2 sm:gap-2.5 ${
            errorField === 'photoConsent' ? 'ring-2 ring-[#dc2645]/45 p-1' : ''
          }`}
        >
          {PHOTO_CONSENT_OPTIONS.map((option) => {
            const checked = form.photoConsent === option;
            return (
              <label
                key={option}
                className={`flex min-h-[46px] cursor-pointer items-center justify-center rounded-xl border px-3 py-2 text-center text-xs font-semibold transition-all sm:text-[13px] ${
                  checked
                    ? 'border-[#dfb16b] bg-gradient-to-br from-[#a61c31]/40 to-[#dfb16b]/20 text-[#fbf6f0] shadow-[0_0_16px_-6px_rgba(223,177,107,0.6)]'
                    : 'border-white/14 bg-white/[0.04] text-[#d8c7cf] hover:border-[#dfb16b]/40 hover:bg-white/[0.08]'
                }`}
              >
                <input
                  type="radio"
                  name="photoConsent"
                  value={option}
                  checked={checked}
                  onChange={() => onChangeField('photoConsent', option)}
                  className="sr-only"
                />
                <span>{option}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* Notes (Child companion & photo opt-out details) */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="notes" className="text-xs font-semibold text-[#fbf6f0] sm:text-sm">
          یادداشت (اختیاری)
        </label>
        <p className="text-[11px] leading-relaxed text-[#cbb9c2] sm:text-xs">
          در صورت همراه داشتن کودک (ذکر تعداد و سن) یا تمایل به نبودن در عکس‌ها و فیلم‌های مراسم، لطفاً موضوع را اینجا یادداشت کنید.
        </p>
        <textarea
          id="notes"
          rows={2}
          value={form.notes}
          onChange={(e) => onChangeField('notes', e.target.value)}
          placeholder="مثلاً: همراه یک کودک ۶ ساله هستم / تمایل ندارم در عکس‌های مراسم باشم..."
          className="min-h-[44px] w-full resize-none rounded-xl border border-white/15 bg-[#0a060d]/60 px-3.5 py-2 text-base text-[#fbf6f0] placeholder:text-[#9e8d96]/70 focus:border-[#dfb16b] focus:ring-2 focus:ring-[#dfb16b]/20 focus:outline-none sm:text-sm"
        />
      </div>
    </section>
  );
}
