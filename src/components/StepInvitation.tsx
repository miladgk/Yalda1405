import { useState } from 'react';
import { Clock, Coffee, RotateCw, Ticket } from 'lucide-react';
import { EVENT_CONFIG } from '../types/yalda';
import { YaldaFaqSection } from './YaldaFaqSection';
import { YaldaMiniCalendarCard } from './YaldaMiniCalendarCard';

interface StepInvitationProps {
  isFull: boolean;
}

type MorseFrameType = 'dots' | 'shortDash' | 'longDoubleDash';

interface FlipDetailCard {
  id: string;
  title: string;
  frontPrimary: string;
  frontSecondary: string;
  backText: string;
  icon: 'clock' | 'coffee' | 'ticket';
  morseType: MorseFrameType;
}

const DETAIL_CARDS: FlipDetailCard[] = [
  {
    id: 'schedule',
    title: 'زمان‌بندی',
    frontPrimary: 'شروع برنامه ۱۵:۳۰',
    frontSecondary: 'اکران فیلم ۱۶:۰۰',
    backText: 'شروع برنامه ساعت ۱۵:۳۰ است؛ اکران فیلم از ۱۶:۰۰ تا ۱۷:۴۵ و دورهمی صمیمی یلدایی از ساعت ۱۸:۰۰ ادامه دارد.',
    icon: 'clock',
    morseType: 'dots',
  },
  {
    id: 'hospitality',
    title: 'پذیرایی',
    frontPrimary: 'چای و تنقلات یلدایی',
    frontSecondary: 'انار، هندوانه و شیرینی',
    backText: 'چای داغ، انار، هندوانه و تنقلات یلدایی برای مهمانان گرامی تدارک دیده شده است.',
    icon: 'coffee',
    morseType: 'shortDash',
  },
  {
    id: 'entry',
    title: 'ورودی',
    frontPrimary: '۵ یورو',
    frontSecondary: 'به ازای هر نفر',
    backText: 'هزینه ورودی ۵ یورو به ازای هر نفر از طریق واریز آنلاین (MobilePay / IBAN) یا پرداخت در محل مراسم است.',
    icon: 'ticket',
    morseType: 'longDoubleDash',
  },
];

function CardMorseFrame({
  morseType,
  variant,
}: {
  morseType: MorseFrameType;
  variant: 'front' | 'back';
}) {
  const railBorderClass =
    variant === 'back'
      ? 'border-[#dfb16b]/55'
      : 'border-white/18 transition-colors duration-300 group-hover:border-[#dfb16b]/45';

  return (
    <span dir="ltr" className="pointer-events-none absolute inset-0" aria-hidden="true">
      {/* Top edge segmented around centered Morse pattern */}
      <span className="flex h-4 w-full items-start">
        <span className={`h-4 min-w-4 flex-1 rounded-tl-2xl border-t border-l ${railBorderClass}`} />

        <span className="relative -top-[1px] flex h-[5px] shrink-0 items-center justify-center px-1.5 sm:px-2">
          {morseType === 'longDoubleDash' && (
            <span className="flex items-center gap-1 sm:gap-1.5">
              <span className="block h-[2px] w-4 rounded-full bg-gradient-to-r from-[#dfb16b] via-[#fae3bb] to-[#dfb16b] shadow-[0_0_8px_rgba(223,177,107,0.65)] sm:w-6" />
              <span className="block h-[2px] w-4 rounded-full bg-gradient-to-r from-[#dfb16b] via-[#fae3bb] to-[#dfb16b] shadow-[0_0_8px_rgba(223,177,107,0.65)] sm:w-6" />
            </span>
          )}
          {morseType === 'shortDash' && (
            <span className="block h-[2px] w-2 rounded-full bg-[#fae3bb] shadow-[0_0_8px_rgba(223,177,107,0.7)] sm:w-3" />
          )}
          {morseType === 'dots' && (
            <span className="flex items-center gap-1.5">
              <span className="block h-[3.5px] w-[3.5px] rounded-full bg-[#fae3bb] shadow-[0_0_7px_rgba(223,177,107,0.75)] sm:h-1 sm:w-1" />
              <span className="block h-[3.5px] w-[3.5px] rounded-full bg-[#fae3bb] shadow-[0_0_7px_rgba(223,177,107,0.75)] sm:h-1 sm:w-1" />
            </span>
          )}
        </span>

        <span className={`h-4 min-w-4 flex-1 rounded-tr-2xl border-t border-r ${railBorderClass}`} />
      </span>

      {/* Side and bottom rails seamlessly continuing from top-left and top-right arcs */}
      <span className={`absolute top-4 right-0 bottom-0 left-0 rounded-b-2xl border-x border-b ${railBorderClass}`} />
    </span>
  );
}

export function StepInvitation({ isFull }: StepInvitationProps) {
  const [flippedIds, setFlippedIds] = useState<Record<string, boolean>>({});

  const toggleCard = (id: string) => {
    setFlippedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section aria-label="دعوت‌نامه و جزئیات" className="flex h-full flex-col justify-between gap-3">
      {/* Editorial Hero Invitation */}
      <div className="relative rounded-2xl border border-[#dfb16b]/30 bg-gradient-to-br from-[#a61c31]/25 via-[#0f0914]/75 to-[#3b6998]/20 px-4 py-3.5 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] sm:px-6 sm:py-4">
        <div className="mb-2 flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-3">
          <div className="focal-pomegranate-halo relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#dfb16b]/55 bg-[radial-gradient(circle,rgba(220,38,69,0.34)_0%,rgba(223,177,107,0.08)_65%,transparent_100%)] sm:h-12 sm:w-12">
            <img
              src="/assets/aistudio/image_67e92a6c.png"
              alt="لوگوی انجمن آوید"
              className="h-full w-full rounded-full object-cover scale-[1.08]"
            />
            <span
              className="pointer-events-none absolute inset-0 rounded-full shadow-[inset_0_0_10px_rgba(14,7,15,0.55)]"
              aria-hidden="true"
            />
          </div>
          <div className="text-xs font-semibold tracking-wide text-[#fae3bb] sm:text-sm">
            <span>{EVENT_CONFIG.associationName}</span>
          </div>
        </div>

        <h2 className="mx-auto mb-1 max-w-xl text-balance text-base font-extrabold leading-relaxed text-[#fbf6f0] sm:text-xl">
          در بلندترین شب زمستان شمال، کنار هم یلدا را جشن می‌گیریم
        </h2>
        <p className="mx-auto max-w-lg text-xs font-light leading-relaxed text-[#e2d4dc] sm:text-sm">
          دورهمی صمیمی شب یلدای ۱۴۰۵ در هلسینکی با اکران فیلم، چای داغ و تنقلات یلدایی.
        </p>
      </div>

      {/* Mini Calendar & Exact Date / Venue Card */}
      <YaldaMiniCalendarCard />

      {/* 3-Column 180° 3D Flip Cards using accessible native buttons */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3.5" aria-label="جزئیات کلیدی مراسم">
        {DETAIL_CARDS.map((card) => {
          const isFlipped = Boolean(flippedIds[card.id]);
          const IconComponent =
            card.icon === 'clock' ? Clock : card.icon === 'coffee' ? Coffee : Ticket;

          return (
            <button
              key={card.id}
              type="button"
              onClick={() => toggleCard(card.id)}
              aria-pressed={isFlipped}
              aria-label={`${card.title} — برای مشاهده جزئیات کلیک کنید`}
              className={`hover-flip-card perspective-1100 group relative min-h-[118px] w-full cursor-pointer text-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#dfb16b] sm:min-h-[126px] ${
                isFlipped ? 'is-flipped-manual' : ''
              }`}
            >
              <span
                className={`hover-flip-inner preserve-3d flip-transition relative grid h-full w-full ${
                  isFlipped ? 'is-flipped-3d' : ''
                }`}
              >
                {/* Front Face */}
                <span className="flip-face-front backface-hidden relative col-start-1 row-start-1 flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] px-2 py-2.5 shadow-[0_10px_24px_-12px_rgba(0,0,0,0.6)] sm:px-3 sm:py-3">
                  <CardMorseFrame morseType={card.morseType} variant="front" />
                  <RotateCw
                    className="absolute top-2.5 left-2.5 h-3 w-3 text-[#dfb16b]/70 transition-transform duration-300 group-hover:rotate-45 sm:top-3 sm:left-3 sm:h-3.5 sm:w-3.5"
                    aria-hidden="true"
                  />
                  <IconComponent className="mb-1 h-4 w-4 text-[#dfb16b] sm:mb-1.5 sm:h-5 sm:w-5" aria-hidden="true" />
                  <span className="mb-1 text-xs font-extrabold text-[#fae3bb] sm:text-[15px]">
                    {card.title}
                  </span>
                  <span className="text-[11px] font-semibold leading-snug text-[#fbf6f0] sm:text-xs">
                    {card.frontPrimary}
                  </span>
                  <span className="mt-0.5 text-[10px] font-normal leading-snug text-[#d8c7cf] sm:text-[11px]">
                    {card.frontSecondary}
                  </span>
                </span>

                {/* Back Face */}
                <span className="flip-face-back backface-hidden relative col-start-1 row-start-1 flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-[#a61c31]/45 to-[#110912]/95 px-2.5 py-3 shadow-[0_12px_26px_-12px_rgba(166,28,49,0.55)] sm:px-4 sm:py-4">
                  <CardMorseFrame morseType={card.morseType} variant="back" />
                  <span className="mb-1 text-[11px] font-bold text-[#fae3bb] sm:mb-1.5 sm:text-xs">{card.title}</span>
                  <span className="text-[10px] font-normal leading-relaxed text-[#fff6ee] sm:text-xs">
                    {card.backText}
                  </span>
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <YaldaFaqSection />

      {isFull ? (
        <div
          role="status"
          className="rounded-xl border border-[#dc2645]/60 bg-[#a61c31]/30 px-4 py-2.5 text-center text-xs font-bold text-[#ffe4ea] sm:text-sm"
        >
          ظرفیت سالن تکمیل شد — از استقبال گرم شما سپاسگزاریم
        </div>
      ) : (
        <p className="text-center text-xs text-[#bfb0b8]">
          برای چرخش ۱۸۰ درجه و مشاهده جزئیات هر کارت، روی آن کلیک یا لمس کنید
        </p>
      )}
    </section>
  );
}
