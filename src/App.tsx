import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { AmbientBackdrop } from './components/AmbientBackdrop';
import { StageHeader } from './components/StageHeader';
import { StepDetails } from './components/StepDetails';
import { StepInvitation } from './components/StepInvitation';
import { StepPayment } from './components/StepPayment';
import { StepTicket } from './components/StepTicket';
import { SvgDefs } from './components/SvgDefs';
import {
  EVENT_CONFIG,
  INITIAL_FORM_STATE,
  type RegistrationFormState,
  type StepId,
  type TicketRecord,
} from './types/yalda';
import {
  calculateFee,
  clampGuests,
  computeCapacityState,
  generateTrackingCode,
  validateStep2,
} from './utils/yaldaLogic';
import { disposeYaldaAudio, setYaldaAudioPlaying } from './utils/yaldaAudio';

declare global {
  interface Window {
    google?: {
      script?: {
        run?: {
          withSuccessHandler: (cb: (res: unknown) => void) => {
            withFailureHandler: (errCb: (err: unknown) => void) => {
              getEventStatus: () => void;
              submitRegistration: (payload: unknown) => void;
            };
          };
        };
      };
    };
  }
}

export default function App() {
  const [step, setStep] = useState<StepId>(1);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [capacityTotal, setCapacityTotal] = useState(EVENT_CONFIG.maxCapacity);
  const [bookedCount, setBookedCount] = useState(EVENT_CONFIG.initialBooked);
  const [snowEnabled, setSnowEnabled] = useState(() => {
    if (typeof window === 'undefined') return true;
    try {
      const saved = window.localStorage.getItem('yalda-snow-enabled');
      if (saved === 'true') return true;
      if (saved === 'false') return false;
    } catch {
      // Storage blocked cleanly ignored
    }
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    try {
      window.localStorage.setItem('yalda-snow-enabled', String(snowEnabled));
    } catch {
      // Storage blocked cleanly ignored
    }
  }, [snowEnabled]);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [burstTrigger, setBurstTrigger] = useState(0);

  useEffect(() => {
    return () => {
      disposeYaldaAudio();
    };
  }, []);

  const handleToggleAudio = () => {
    const next = !audioEnabled;
    setAudioEnabled(next);
    setYaldaAudioPlaying(next)
      .then((playing) => {
        setAudioEnabled(playing);
      })
      .catch(() => {
        setAudioEnabled(false);
      });
  };

  const [form, setForm] = useState<RegistrationFormState>(INITIAL_FORM_STATE);
  const [step2Error, setStep2Error] = useState<{
    message: string;
    field?: 'fullName' | 'email' | 'attendance' | 'photoConsent';
  } | null>(null);
  const [step3Error, setStep3Error] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [ticket, setTicket] = useState<TicketRecord | null>(null);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  const capacity = useMemo(
    () => computeCapacityState(capacityTotal, bookedCount),
    [capacityTotal, bookedCount]
  );

  // Optional Google Apps Script hydration when hosted inside Apps Script
  useEffect(() => {
    const runner = window.google?.script?.run;
    if (!runner) return;

    runner
      .withSuccessHandler((raw) => {
        const res = raw as {
          capacity?: number;
          maxCapacity?: number;
          registered?: number;
          booked?: number;
          remaining?: number;
        } | null;
        if (!res) return;
        const cap = Number(res.capacity || res.maxCapacity) || EVENT_CONFIG.maxCapacity;
        const reg =
          typeof res.registered === 'number'
            ? res.registered
            : typeof res.booked === 'number'
              ? res.booked
              : typeof res.remaining === 'number'
                ? cap - res.remaining
                : 0;
        setCapacityTotal(cap);
        setBookedCount(reg);
      })
      .withFailureHandler(() => {
        // Keep initial defaults gracefully
      })
      .getEventStatus();
  }, []);

  const navigateTo = (target: StepId) => {
    setDirection(target >= step ? 'forward' : 'backward');
    setStep(target);
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  };

  const handleFieldChange = <K extends keyof RegistrationFormState>(
    field: K,
    value: RegistrationFormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (
      step2Error &&
      (field === 'fullName' || field === 'email' || field === 'attendance' || field === 'photoConsent')
    ) {
      setStep2Error(null);
    }
  };

  const handleAdjustGuests = (delta: number) => {
    setForm((prev) => ({
      ...prev,
      guests: clampGuests(prev.guests + delta, capacity.remaining),
    }));
  };

  const handleToggleVolunteer = (item: string) => {
    setForm((prev) => {
      const exists = prev.volunteering.includes(item);
      return {
        ...prev,
        volunteering: exists
          ? prev.volunteering.filter((v) => v !== item)
          : [...prev.volunteering, item],
      };
    });
  };

  const handleNext = () => {
    if (capacity.isFull) return;

    if (step === 1) {
      navigateTo(2);
      return;
    }

    if (step === 2) {
      const check = validateStep2(form);
      if (!check.valid) {
        setStep2Error({
          message: check.errorMessage ?? 'لطفاً فیلدهای الزامی را تکمیل کنید.',
          field: check.errorField,
        });
        return;
      }
      setStep2Error(null);
      navigateTo(3);
      return;
    }

    if (step === 3) {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (step === 2) {
      setStep2Error(null);
      navigateTo(1);
    } else if (step === 3) {
      setStep3Error(null);
      navigateTo(2);
    }
  };

  const handleSubmit = () => {
    const check = validateStep2(form);
    if (!check.valid) {
      setStep3Error(check.errorMessage ?? 'اطلاعات مرحله قبل ناقص است.');
      return;
    }
    if (capacity.isFull || form.guests > capacity.remaining) {
      setStep3Error(`تنها ${capacity.remaining} صندلی باقی مانده است.`);
      return;
    }

    setStep3Error(null);
    setSubmitting(true);

    const payload = {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      guests: form.guests,
      attendance: form.attendance,
      paymentMethod: form.paymentMethod,
      paymentRef: form.paymentRef.trim(),
      volunteering: form.volunteering,
      photoConsent: form.photoConsent,
      notes: form.notes.trim(),
    };

    const runner = window.google?.script?.run;
    if (runner) {
      runner
        .withSuccessHandler((raw) => {
          setSubmitting(false);
          const res = raw as {
            success?: boolean;
            error?: string;
            trackingCode?: string;
            totalFee?: number;
            guests?: number;
            fullName?: string;
            emailSent?: boolean;
            capacity?: number;
            registered?: number;
          } | null;

          if (!res || res.success === false) {
            setStep3Error(res?.error ?? 'خطایی در ثبت اطلاعات رخ داد.');
            return;
          }

          const finalGuests = Number(res.guests) || payload.guests;
          const totalFee =
            typeof res.totalFee === 'number' ? res.totalFee : calculateFee(finalGuests);

          setTicket({
            trackingCode: res.trackingCode || generateTrackingCode(),
            fullName: res.fullName || payload.fullName,
            guests: finalGuests,
            totalFee,
            attendance: payload.attendance,
            paymentMethod: payload.paymentMethod,
            emailSent: res.emailSent !== false,
            isDemo: false,
          });

          if (typeof res.capacity === 'number') setCapacityTotal(res.capacity);
          setBookedCount((prev) =>
            typeof res.registered === 'number' ? res.registered : prev + finalGuests
          );

          navigateTo(4);
          setBurstTrigger((n) => n + 1);
        })
        .withFailureHandler((err) => {
          setSubmitting(false);
          setStep3Error(`خطا در ارتباط با سرور: ${String(err)}`);
        })
        .submitRegistration(payload);
      return;
    }

    // Standalone Preview Mode
    setTimeout(() => {
      setSubmitting(false);
      const totalFee = calculateFee(payload.guests);
      setTicket({
        trackingCode: generateTrackingCode(),
        fullName: payload.fullName,
        guests: payload.guests,
        totalFee,
        attendance: payload.attendance,
        paymentMethod: payload.paymentMethod,
        emailSent: true,
        isDemo: true,
      });
      setBookedCount((prev) => prev + payload.guests);
      navigateTo(4);
      setBurstTrigger((n) => n + 1);
    }, 450);
  };

  const handleReset = () => {
    setForm(INITIAL_FORM_STATE);
    setStep2Error(null);
    setStep3Error(null);
    setTicket(null);
    navigateTo(1);
  };

  const stageAnimClass = direction === 'forward' ? 'step-enter-forward' : 'step-enter-backward';

  return (
    <div className="relative flex min-h-dvh w-full items-center justify-center px-3 py-4 sm:px-6 sm:py-6">
      <SvgDefs />
      <AmbientBackdrop snowEnabled={snowEnabled} burstTrigger={burstTrigger} />

      <main className="relative z-10 w-full max-w-[840px]">
        <section
          aria-label="ثبت‌نام جشن شب یلدا ۱۴۰۵ هلسینکی"
          className="glass-stage-card relative flex max-h-[calc(100dvh-2rem)] w-full flex-col overflow-hidden rounded-3xl sm:max-h-[calc(100dvh-3rem)]"
        >
          <div className="glass-sheen pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-3xl" aria-hidden="true" />

          <StageHeader
            currentStep={step}
            capacity={capacity}
            snowEnabled={snowEnabled}
            audioEnabled={audioEnabled}
            onToggleSnow={() => setSnowEnabled((prev) => !prev)}
            onToggleAudio={handleToggleAudio}
            onSelectStep={navigateTo}
          />

          {/* Stage Content Viewport */}
          <div
            ref={scrollRef}
            className="stage-scroll relative z-[4] min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-7 sm:py-5"
          >
            <div key={step} className={stageAnimClass}>
              {step === 1 && <StepInvitation isFull={capacity.isFull} />}
              {step === 2 && (
                <StepDetails
                  form={form}
                  remainingSeats={capacity.remaining}
                  errorMsg={step2Error?.message ?? null}
                  errorField={step2Error?.field}
                  onChangeField={handleFieldChange}
                  onAdjustGuests={handleAdjustGuests}
                />
              )}
              {step === 3 && (
                <StepPayment
                  form={form}
                  errorMsg={step3Error}
                  onChangeField={handleFieldChange}
                  onToggleVolunteer={handleToggleVolunteer}
                />
              )}
              {step === 4 && ticket && <StepTicket ticket={ticket} onReset={handleReset} />}
            </div>
          </div>

          {/* Pinned Footer Navigation (hidden on Step 4) */}
          {step !== 4 && (
            <footer
              className={`relative z-10 flex shrink-0 items-center gap-3 border-t border-white/10 bg-gradient-to-t from-[#0a060d]/55 to-transparent px-4 py-3 sm:px-7 sm:py-3.5 ${
                step === 1 ? 'justify-center' : 'justify-between'
              }`}
            >
              {step > 1 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-white/16 bg-white/[0.06] px-4 py-2 text-xs font-bold text-[#e2d4dc] transition hover:border-[#dfb16b]/45 hover:bg-white/12 hover:text-[#fbf6f0] sm:px-5 sm:text-sm"
                >
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  <span>مرحله قبل</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleNext}
                disabled={capacity.isFull || submitting}
                className={`inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#fae3bb]/55 bg-gradient-to-l from-[#98152e] via-[#c01e3a] to-[#cf9844] px-6 py-2 text-xs font-extrabold text-white shadow-[0_10px_26px_-8px_rgba(166,28,49,0.72),inset_0_1px_0_rgba(255,255,255,0.3)] transition hover:-translate-y-0.5 hover:brightness-108 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0 sm:text-sm ${
                  step === 1 ? 'w-full max-w-[340px]' : ''
                }`}
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                <span>
                  {step === 1
                    ? capacity.isFull
                      ? 'ظرفیت تکمیل شد'
                      : 'شروع ثبت‌نام'
                    : step === 2
                      ? 'مرحله بعد: پرداخت'
                      : submitting
                        ? 'در حال ثبت اطلاعات...'
                        : 'تکمیل ثبت‌نام و دریافت بلیت'}
                </span>
                {step === 3 && !submitting && <Sparkles className="h-4 w-4" aria-hidden="true" />}
                {step < 3 && <ArrowLeft className="h-4 w-4" aria-hidden="true" />}
              </button>
            </footer>
          )}
        </section>
      </main>
    </div>
  );
}
