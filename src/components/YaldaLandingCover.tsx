import { useState, type KeyboardEvent, type PointerEvent } from 'react';
import { ArrowLeft, CalendarDays, MapPin, Sparkles } from 'lucide-react';
import { EVENT_CONFIG } from '../types/yalda';
import { GuillocheWave } from './GuillocheWave';

interface YaldaLandingCoverProps {
  onEnter: () => void;
  isExiting?: boolean;
}

export function YaldaLandingCover({ onEnter, isExiting = false }: YaldaLandingCoverProps) {
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, glowX: 50, glowY: 35 });

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isExiting) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onEnter();
    }
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (isExiting || e.pointerType !== 'mouse') return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rotateY = (px - 0.5) * 14;
    const rotateX = (0.5 - py) * 12;

    setTilt({
      rotateX,
      rotateY,
      glowX: Math.round(px * 100),
      glowY: Math.round(py * 100),
    });
  };

  const handlePointerLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0, glowX: 50, glowY: 35 });
  };

  return (
    <div className="perspective-1400 relative w-full">
      {/* Ambient 3D floating glass prism accents behind the main card */}
      <div
        className={`pointer-events-none absolute -top-6 -right-4 h-24 w-24 rounded-2xl border border-white/25 bg-gradient-to-br from-[#dc2645]/25 to-white/5 backdrop-blur-md transition-all duration-500 sm:-top-8 sm:-right-8 sm:h-32 sm:w-32 ${
          isExiting ? 'scale-75 opacity-0' : 'opacity-80'
        }`}
        style={{ transform: 'rotate(14deg)' }}
        aria-hidden="true"
      />
      <div
        className={`pointer-events-none absolute -bottom-6 -left-4 h-24 w-24 rounded-full border border-[#dfb16b]/35 bg-gradient-to-tr from-[#3b6998]/30 to-[#dfb16b]/15 backdrop-blur-md transition-all duration-500 sm:-bottom-8 sm:-left-8 sm:h-32 sm:w-32 ${
          isExiting ? 'scale-75 opacity-0' : 'opacity-80'
        }`}
        aria-hidden="true"
      />

      <div
        role="button"
        tabIndex={isExiting ? -1 : 0}
        onClick={() => {
          if (!isExiting) onEnter();
        }}
        onKeyDown={handleKeyDown}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        aria-label="ورود به دعوت‌نامه و ثبت‌نام مراسم شب یلدا ۱۴۰۵"
        data-testid="yalda-landing-cover"
        style={
          isExiting
            ? { transformStyle: 'preserve-3d' }
            : {
                transformStyle: 'preserve-3d',
                transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
              }
        }
        className={`group relative flex w-full cursor-pointer flex-col items-center rounded-3xl px-5 py-7 text-center transition-transform duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#dfb16b] active:scale-[0.985] sm:px-10 sm:py-10 ${
          isExiting ? 'yalda-3d-exit pointer-events-none' : 'yalda-cover-enter'
        }`}
      >
        {/* Frosted 3D glassmorphism shell & interactive light reflection (kept at Z=0 so parent preserve-3d never flattens) */}
        <div
          className="yalda-cover-glass-3d pointer-events-none absolute inset-0 overflow-hidden rounded-3xl"
          style={{ transform: 'translateZ(0px)' }}
          aria-hidden="true"
        >
          <div className="glass-sheen absolute inset-0" />
          <div className="holo-sheen absolute inset-0 opacity-35" />
          <div
            className="absolute inset-0 transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle at ${tilt.glowX}% ${tilt.glowY}%, rgba(255,255,255,0.22) 0%, rgba(223,177,107,0.09) 28%, transparent 62%)`,
            }}
          />
        </div>

        {/* Inner 3D floating glass filigree frame */}
        <div
          className="pointer-events-none absolute inset-3 rounded-2xl border border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]"
          style={{ transform: 'translateZ(16px)' }}
          aria-hidden="true"
        />

        {/* Foreground content layers at distinct 3D Z-depths */}
        <div
          className="relative z-10 flex w-full max-w-xl flex-col items-center"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Association Lockup with Avid Logo */}
          <div
            className="mb-4 inline-flex items-center gap-2.5 rounded-full border border-white/25 bg-white/[0.08] px-3.5 py-1.5 shadow-[0_10px_25px_-8px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.3)] backdrop-blur-md"
            style={{ transform: 'translateZ(30px)' }}
          >
            <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-[#dfb16b]/70 shadow-sm">
              <img
                src="/assets/aistudio/image_67e92a6c.png"
                alt="لوگوی انجمن فرهنگی هنری آوید"
                className="h-full w-full scale-[1.08] rounded-full object-cover"
              />
            </div>
            <span className="text-xs font-bold text-[#fae3bb] sm:text-sm">
              {EVENT_CONFIG.associationName}
            </span>
          </div>

          {/* 3D Floating Pomegranate Medallion */}
          <div
            className="focal-pomegranate-halo mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-white/30 bg-[radial-gradient(circle_at_35%_30%,rgba(220,38,69,0.42),rgba(14,7,15,0.75))] shadow-[0_20px_35px_-10px_rgba(0,0,0,0.75),inset_0_1.5px_0_rgba(255,255,255,0.35)] backdrop-blur-md transition-transform duration-300 group-hover:scale-105 sm:h-24 sm:w-24"
            style={{ transform: 'translateZ(54px)' }}
            aria-hidden="true"
          >
            <svg width="56" height="56" viewBox="0 0 80 80" className="sm:h-16 sm:w-16">
              <use href="#iconPomegranateMN" />
            </svg>
          </div>

          {/* Annual Tradition Eyebrow */}
          <div
            className="mb-2.5 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/[0.08] px-3 py-1 text-[11px] font-semibold text-[#ffd9e2] shadow-sm backdrop-blur-md sm:text-xs"
            style={{ transform: 'translateZ(26px)' }}
          >
            <Sparkles className="h-3.5 w-3.5 text-[#dfb16b]" aria-hidden="true" />
            <span>طبق رسم هر ساله · هلسینکی</span>
          </div>

          {/* Poetic 3D Headline */}
          <h1
            className="mb-3 bg-gradient-to-l from-[#fffaf4] via-[#fae3bb] to-[#ffa3b6] bg-clip-text text-2xl font-black leading-snug text-transparent drop-shadow-[0_10px_18px_rgba(0,0,0,0.6)] sm:text-4xl"
            style={{ transform: 'translateZ(42px)' }}
          >
            مراسم شب یلدا در راه است...
          </h1>

          <p
            className="mb-5 max-w-md text-xs leading-7 text-[#efe4ea] drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] sm:text-base sm:leading-8"
            style={{ transform: 'translateZ(30px)' }}
          >
            چله‌نشینی امسال هم از راه می‌رسد؛ بیایید طبق رسم هر ساله‌مان، در بلندترین شب زمستان شمال دوباره کنار هم جمع شویم و با گرمای دیدار، انار و موسیقی، یلدایی به‌یادماندنی بسازیم.
          </p>

          {/* Living Guilloché Divider */}
          <div
            className="mb-5 w-full max-w-xs"
            style={{ transform: 'translateZ(22px)' }}
            aria-hidden="true"
          >
            <GuillocheWave />
          </div>

          {/* Frosted Glass Date & Venue Chips */}
          <div
            className="mb-6 flex flex-wrap items-center justify-center gap-2 text-[11px] font-medium text-[#f1e5eb] sm:gap-3 sm:text-xs"
            style={{ transform: 'translateZ(28px)' }}
          >
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/[0.07] px-3 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] backdrop-blur-md">
              <CalendarDays className="h-3.5 w-3.5 text-[#dfb16b]" aria-hidden="true" />
              <span>{EVENT_CONFIG.date}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/[0.07] px-3 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] backdrop-blur-md">
              <MapPin className="h-3.5 w-3.5 text-[#ff8da4]" aria-hidden="true" />
              <span dir="ltr">{EVENT_CONFIG.venue}</span>
            </span>
          </div>

          {/* Elevated 3D Glass-Ruby-Gold CTA */}
          <span
            className="inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-2xl border border-[#fae3bb]/65 bg-gradient-to-l from-[#98152e]/95 via-[#c01e3a]/95 to-[#cf9844]/95 px-7 py-2.5 text-sm font-extrabold text-white shadow-[0_18px_36px_-8px_rgba(166,28,49,0.85),0_8px_16px_-6px_rgba(0,0,0,0.7),inset_0_1.5px_0_rgba(255,255,255,0.42)] backdrop-blur-md transition duration-300 group-hover:brightness-110 sm:px-9 sm:text-base"
            style={{ transform: 'translateZ(58px)' }}
          >
            <span>ورود به دعوت‌نامه</span>
            <ArrowLeft
              className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1"
              aria-hidden="true"
            />
          </span>

          <span
            className="mt-3 text-[11px] font-medium text-[#d8c7cf] transition-colors group-hover:text-[#fae3bb] sm:text-xs"
            style={{ transform: 'translateZ(24px)' }}
          >
            برای گشودن دعوت‌نامه و ثبت‌نام، روی کارت کلیک کنید
          </span>
        </div>
      </div>
    </div>
  );
}
