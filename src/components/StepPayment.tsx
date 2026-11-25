import { useState } from 'react';
import { AlertTriangle, Check, Copy } from 'lucide-react';
import { EVENT_CONFIG, VOLUNTEER_OPTIONS, type RegistrationFormState } from '../types/yalda';
import { calculateFee, toFa } from '../utils/yaldaLogic';

interface StepPaymentProps {
  form: RegistrationFormState;
  errorMsg: string | null;
  onChangeField: <K extends keyof RegistrationFormState>(
    field: K,
    value: RegistrationFormState[K]
  ) => void;
  onToggleVolunteer: (item: string) => void;
}

const PAYMENT_OPTIONS = [
  {
    value: 'واریز آنلاین (MobilePay / IBAN)',
    label: 'واریز آنلاین',
    isOnline: true,
  },
  {
    value: 'پرداخت در محل مراسم',
    label: 'پرداخت در محل مراسم',
    sub: 'نقدی یا MobilePay',
    isOnline: false,
  },
] as const;

export function StepPayment({
  form,
  errorMsg,
  onChangeField,
  onToggleVolunteer,
}: StepPaymentProps) {
  const [copiedKey, setCopiedKey] = useState<'mobilePay' | 'iban' | null>(null);
  const totalFee = calculateFee(form.guests);
  const isOnline = form.paymentMethod.includes('آنلاین');

  const handleCopy = async (key: 'mobilePay' | 'iban', text: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.top = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500);
    } catch {
      // Fallback ignored cleanly
    }
  };

  return (
    <section aria-label="پرداخت و جزئیات تکمیلی" className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base font-extrabold text-[#fbf6f0] sm:text-lg">پرداخت و جزئیات تکمیلی</h2>
        <span className="text-xs text-[#d8c7cf] tabular-nums sm:text-[13px]">
          مبلغ کل:{' '}
          <strong className="text-[#fae3bb]">
            {toFa(totalFee)} یورو ({toFa(form.guests)} نفر)
          </strong>
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

      {/* Payment Method Radio Cards */}
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1.5 text-xs font-semibold text-[#fbf6f0] sm:text-sm">
          روش پرداخت ورودی <span className="text-[#ff6b86]">*</span>
        </legend>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-2.5">
          {PAYMENT_OPTIONS.map((opt) => {
            const checked = form.paymentMethod === opt.value;
            return (
              <label
                key={opt.value}
                className={`flex min-h-[52px] cursor-pointer flex-col items-center justify-center rounded-xl border px-3 py-2 text-center transition-all ${
                  checked
                    ? 'border-[#dfb16b] bg-gradient-to-br from-[#a61c31]/40 to-[#dfb16b]/20 text-[#fbf6f0] shadow-[0_0_16px_-6px_rgba(223,177,107,0.6)]'
                    : 'border-white/14 bg-white/[0.04] text-[#d8c7cf] hover:border-[#dfb16b]/40 hover:bg-white/[0.08]'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={opt.value}
                  checked={checked}
                  onChange={() => onChangeField('paymentMethod', opt.value)}
                  className="sr-only"
                />
                <span className="text-xs font-bold sm:text-[13px]">{opt.label}</span>
                {opt.isOnline ? (
                  <span dir="ltr" className="mt-0.5 text-xs font-semibold text-[#f5ede6]">
                    (<span className="bk-edge">M</span>obilePay
                    <span className="mx-1 text-[#dfb16b]/60">/</span>IBA
                    <span className="bk-edge">N</span>)
                  </span>
                ) : (
                  <span className={`mt-0.5 text-[11px] ${checked ? 'text-[#fae3bb]' : 'text-[#bfb0b8]'}`}>
                    {opt.sub}
                  </span>
                )}
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* Collapsible Online Payment Drawer */}
      <div
        className={`grid transition-all duration-300 ${
          isOnline ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
        }`}
        aria-hidden={!isOnline}
      >
        <div className="overflow-hidden">
          <div className="space-y-3 rounded-2xl border border-[#dfb16b]/40 bg-gradient-to-br from-[#dfb16b]/12 to-[#0a060d]/70 p-3.5 sm:p-4">
            <div className="flex items-center justify-between gap-2 border-b border-[#dfb16b]/20 pb-2">
              <span className="text-xs font-semibold text-[#e2d4dc]">اطلاعات واریز آنلاین</span>
              <span dir="ltr" className="text-xs font-semibold text-[#f5ede6]">
                <span className="bk-edge">M</span>obilePay
                <span className="mx-1 text-[#dfb16b]/60">/</span>IBA
                <span className="bk-edge">N</span>
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <div className="flex items-center justify-between gap-2 rounded-xl border border-white/12 bg-[#0a060d]/65 px-3 py-2">
                <div className="min-w-0">
                  <span className="block text-[11px] text-[#bfb0b8]">MobilePay</span>
                  <span dir="ltr" className="block truncate text-xs font-bold tabular-nums text-[#fbf6f0] sm:text-sm">
                    {EVENT_CONFIG.mobilePay}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy('mobilePay', EVENT_CONFIG.mobilePay)}
                  aria-label="کپی شماره MobilePay"
                  className="inline-flex h-8 shrink-0 cursor-pointer items-center gap-1 rounded-lg border border-[#dfb16b]/45 bg-[#dfb16b]/20 px-2.5 text-xs font-bold text-[#fae3bb] transition hover:bg-[#dfb16b]/35"
                >
                  {copiedKey === 'mobilePay' ? (
                    <>
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>کپی شد</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>کپی</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between gap-2 rounded-xl border border-white/12 bg-[#0a060d]/65 px-3 py-2">
                <div className="min-w-0">
                  <span className="block text-[11px] text-[#bfb0b8]">IBAN</span>
                  <span dir="ltr" className="block truncate text-xs font-bold tabular-nums text-[#fbf6f0] sm:text-sm">
                    {EVENT_CONFIG.iban}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy('iban', EVENT_CONFIG.iban)}
                  aria-label="کپی شماره حساب IBAN"
                  className="inline-flex h-8 shrink-0 cursor-pointer items-center gap-1 rounded-lg border border-[#dfb16b]/45 bg-[#dfb16b]/20 px-2.5 text-xs font-bold text-[#fae3bb] transition hover:bg-[#dfb16b]/35"
                >
                  {copiedKey === 'iban' ? (
                    <>
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>کپی شد</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>کپی</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <p className="text-xs text-[#fae3bb]">
              پیام واریز (Reference): <strong dir="ltr">Yalda + نام شما</strong>
            </p>
            <input
              id="paymentRef"
              type="text"
              value={form.paymentRef}
              onChange={(e) => onChangeField('paymentRef', e.target.value)}
              placeholder="نام واریزکننده یا کد پیگیری پرداخت (اختیاری)"
              className="min-h-[42px] w-full rounded-xl border border-white/15 bg-[#0a060d]/65 px-3.5 py-2 text-base text-[#fbf6f0] placeholder:text-[#9e8d96]/70 focus:border-[#dfb16b] focus:ring-2 focus:ring-[#dfb16b]/20 focus:outline-none sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Volunteering Multi-Select Buttons */}
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1.5 text-xs font-semibold text-[#fbf6f0] sm:text-sm">
          همراهی داوطلبانه (اختیاری)
        </legend>
        <div className="flex flex-wrap gap-2">
          {VOLUNTEER_OPTIONS.map((item) => {
            const active = form.volunteering.includes(item);
            return (
              <button
                key={item}
                type="button"
                aria-pressed={active}
                onClick={() => onToggleVolunteer(item)}
                className={`inline-flex min-h-[38px] cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
                  active
                    ? 'border-[#dfb16b] bg-[#dfb16b]/22 text-[#fae3bb]'
                    : 'border-white/14 bg-white/[0.04] text-[#d8c7cf] hover:border-[#dfb16b]/40 hover:bg-white/[0.08]'
                }`}
              >
                {active && <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
                <span>{item}</span>
              </button>
            );
          })}
        </div>
      </fieldset>
    </section>
  );
}
