import { Check, Snowflake, Volume2, VolumeX } from 'lucide-react';
import { EVENT_CONFIG, type StepId } from '../types/yalda';
import { toFa } from '../utils/yaldaLogic';
import { GuillocheWave } from './GuillocheWave';

interface StageHeaderProps {
  currentStep: StepId;
  snowEnabled: boolean;
  audioEnabled: boolean;
  onToggleSnow: () => void;
  onToggleAudio: () => void;
  onSelectStep: (step: StepId) => void;
}

const STEPS: { id: StepId; label: string }[] = [
  { id: 1, label: 'دعوت‌نامه' },
  { id: 2, label: 'مشخصات' },
  { id: 3, label: 'پرداخت' },
  { id: 4, label: 'بلیت' },
];

export function StageHeader({
  currentStep,
  snowEnabled,
  audioEnabled,
  onToggleSnow,
  onToggleAudio,
  onSelectStep,
}: StageHeaderProps) {
  return (
    <header className="relative z-10 shrink-0 bg-gradient-to-b from-white/[0.045] to-black/15 px-3.5 pt-3 sm:px-6 sm:pt-4">
      <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2.5 sm:mb-3 sm:flex-nowrap sm:gap-3">
        {/* Brand Lockup */}
        <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#dfb16b]/45 bg-[radial-gradient(circle_at_32%_28%,rgba(220,38,69,0.34),rgba(14,7,15,0.82))] shadow-[0_0_18px_-4px_rgba(166,28,49,0.65),inset_0_1px_0_rgba(255,255,255,0.24)] sm:h-11 sm:w-11"
            aria-hidden="true"
          >
            <svg width="28" height="28" viewBox="0 0 80 80">
              <use href="#iconPomegranateMN" />
            </svg>
          </div>
          <div className="min-w-0">
            <h1 className="bg-gradient-to-l from-[#fffaf4] via-[#fae3bb] to-[#ffa3b6] bg-clip-text text-sm font-extrabold leading-snug text-transparent sm:truncate sm:text-lg">
              {EVENT_CONFIG.title}
            </h1>
            <p className="truncate text-[11px] font-normal text-[#d8c7cf] sm:text-[13px]">
              {EVENT_CONFIG.associationName}
            </p>
          </div>
        </div>

        {/* Audio & Snow Controls */}
        <div className="flex shrink-0 items-center justify-end gap-2 sm:gap-2.5">
          <button
            type="button"
            onClick={onToggleAudio}
            aria-pressed={audioEnabled}
            aria-label="پخش یا قطع موسیقی سنتی مراسم شب یلدا"
            data-testid="audio-toggle-btn"
            className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border px-2.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#dfb16b] sm:px-3 ${
              audioEnabled
                ? 'border-[#dfb16b]/55 bg-[#dfb16b]/20 text-[#fae3bb] hover:bg-[#dfb16b]/30'
                : 'border-white/15 bg-white/[0.05] text-[#bfb0b8] hover:bg-white/10'
            }`}
          >
            {audioEnabled ? (
              <Volume2 className="h-4 w-4" aria-hidden="true" />
            ) : (
              <VolumeX className="h-4 w-4" aria-hidden="true" />
            )}
            <span>نوا</span>
          </button>

          <button
            type="button"
            onClick={onToggleSnow}
            aria-pressed={snowEnabled}
            aria-label={snowEnabled ? 'غیرفعال‌سازی بارش برف' : 'فعال‌سازی بارش برف'}
            title={snowEnabled ? 'بارش برف فعال است — کلیک برای توقف' : 'بارش برف غیرفعال است — کلیک برای فعال‌سازی'}
            data-testid="snow-toggle-btn"
            className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border px-2.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#dfb16b] sm:px-3 ${
              snowEnabled
                ? 'border-[#9cd4fa]/45 bg-[#3b6998]/35 text-[#e4f4ff] hover:bg-[#3b6998]/50'
                : 'border-white/15 bg-white/[0.05] text-[#9e8d96] hover:bg-white/10 hover:text-[#d8c7cf]'
            }`}
          >
            <Snowflake className="h-4 w-4" aria-hidden="true" />
            <span>برف</span>
          </button>
        </div>
      </div>

      {/* 4-Step Progress Navigation */}
      <nav
        aria-label="مراحل ثبت‌نام"
        className="rounded-xl border border-white/10 bg-[#0a060d]/55 p-1"
      >
        <div className="relative grid grid-cols-4">
          {/* Gliding Active Step Indicator */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-1/4 rounded-lg border border-[#dfb16b]/55 bg-gradient-to-br from-[#a61c31]/55 to-[#dfb16b]/22 shadow-[0_6px_18px_-6px_rgba(166,28,49,0.75)] transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ transform: `translateX(${-(currentStep - 1) * 100}%)` }}
          />

          {STEPS.map((step) => {
            const isActive = currentStep === step.id;
            const isDone = currentStep > step.id;
            const canNavigate = isDone && currentStep !== 4;

            return (
              <button
                key={step.id}
                type="button"
                disabled={!canNavigate && !isActive}
                aria-current={isActive ? 'step' : undefined}
                onClick={() => {
                  if (canNavigate) onSelectStep(step.id);
                }}
                className={`relative z-10 flex min-h-[36px] items-center justify-center gap-1 rounded-lg border border-transparent px-1 py-1 text-[11px] font-semibold whitespace-nowrap transition-colors duration-200 sm:gap-2 sm:px-2.5 sm:text-xs ${
                  isActive
                    ? 'text-[#fbf6f0]'
                    : isDone
                      ? `text-[#fae3bb] ${
                          canNavigate ? 'cursor-pointer hover:bg-[#dfb16b]/12' : 'cursor-default'
                        }`
                      : 'cursor-default text-[#bfb0b8]'
                }`}
              >
                <span
                  className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[9px] font-extrabold tabular-nums transition-colors duration-200 sm:h-5 sm:w-5 sm:text-[10px] ${
                    isActive
                      ? 'border-[#fae3bb] bg-[#dfb16b] text-[#170a11]'
                      : isDone
                        ? 'border-[#34d399]/55 bg-[#34d399]/20 text-[#6ee7b7]'
                        : 'border-white/18 bg-white/[0.07] text-[#bfb0b8]'
                  }`}
                >
                  {isDone ? <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3" aria-hidden="true" /> : toFa(step.id)}
                </span>
                <span>{step.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Ultra-Fine Pulsing Guilloche Wave Divider */}
      <GuillocheWave className="-mx-3.5 mt-2 block h-3.5 w-[calc(100%+1.75rem)] pointer-events-none sm:-mx-6 sm:mt-2.5 sm:w-[calc(100%+3rem)]" />
    </header>
  );
}
