import { useRef, useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { EVENT_CONFIG } from '../types/yalda';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'age',
    question: 'آیا مراسم محدودیت سنی دارد؟',
    answer:
      'خیر، هیچ محدودیت سنی برای حضور در مراسم وجود ندارد و حضور کودکان و خانواده‌ها کاملاً آزاد است. در صورت همراه داشتن کودک، لطفاً تعداد و سن کودک را در بخش «یادداشت» مرحله دوم بنویسید.',
  },
  {
    id: 'parking',
    question: 'آیا در محل مراسم جای پارکینگ وجود دارد؟',
    answer: `بله، در محوطه و خیابان‌های اطراف ${EVENT_CONFIG.venue} (${EVENT_CONFIG.address}) جای پارک خودرو در دسترس است.`,
  },
  {
    id: 'alcohol',
    question: 'آیا آوردن یا مصرف نوشیدنی الکلی مجاز است؟',
    answer: `خیر، با توجه به قوانین مرکز ${EVENT_CONFIG.venue} و فضای خانوادگی مراسم، آوردن و مصرف هرگونه نوشیدنی الکلی در محل برنامه ممنوع است.`,
  },
  {
    id: 'photos',
    question: 'اگر نخواهیم در عکس‌ها و فیلم‌های مراسم باشیم چه کار کنیم؟',
    answer:
      'علاوه بر انتخاب گزینه «عدم رضایت برای انتشار تصویر» و نوشتن توضیح در کادر یادداشت مرحله دوم، لطفاً هنگام مراسم نیز موضوع را مستقیماً به عکاس اطلاع دهید تا هنگام عکاسی رعایت شود.',
  },
  {
    id: 'schedule',
    question: 'زمان ورود به مراسم و بخش‌های برنامه چگونه است؟',
    answer:
      'شروع برنامه از ساعت ۱۵:۳۰ (۳:۳۰ بعدازظهر) و اکران فیلم از ۱۶:۰۰ است؛ همچنین مهمانانی که از ساعت ۱۸:۰۰ (۶ عصر) ملحق می‌شوند می‌توانند در بخش دورهمی یلدایی همراه ما باشند. چای داغ، انار، هندوانه و تنقلات یلدایی نیز در طول برنامه سرو می‌شود.',
  },
];

export function YaldaFaqSection() {
  const [sectionOpen, setSectionOpen] = useState(false);
  const [openItemId, setOpenItemId] = useState<string | null>(FAQ_ITEMS[0].id);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleToggleSection = () => {
    setSectionOpen((prev) => {
      const next = !prev;
      if (next) {
        window.setTimeout(() => {
          containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 80);
      }
      return next;
    });
  };

  return (
    <div
      ref={containerRef}
      className="rounded-2xl border border-white/12 bg-[#0d0712]/70 transition-colors hover:border-[#dfb16b]/35"
    >
      <button
        type="button"
        onClick={handleToggleSection}
        aria-expanded={sectionOpen}
        aria-controls="yalda-faq-list"
        data-testid="faq-toggle-btn"
        className="flex min-h-[44px] w-full cursor-pointer items-center justify-between gap-3 px-4 py-2.5 text-right focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#dfb16b]"
      >
        <span className="flex min-w-0 items-center gap-2">
          <HelpCircle className="h-4 w-4 shrink-0 text-[#dfb16b]" aria-hidden="true" />
          <span className="text-xs font-bold text-[#fae3bb] sm:text-[13px]">
            سوالات متداول و نکات مراسم
          </span>
        </span>

        <span className="flex shrink-0 items-center gap-2.5">
          <span className="hidden text-[11px] font-medium text-[#bfb0b8] sm:inline">
            محدودیت سنی <span aria-hidden="true">·</span> پارکینگ <span aria-hidden="true">·</span> عکاسی و قوانین
          </span>
          <ChevronDown
            className={`h-4 w-4 text-[#dfb16b] transition-transform duration-200 ${
              sectionOpen ? 'rotate-180' : ''
            }`}
            aria-hidden="true"
          />
        </span>
      </button>

      {sectionOpen && (
        <div
          id="yalda-faq-list"
          data-testid="faq-list"
          className="divide-y divide-white/10 border-t border-white/10"
        >
          {FAQ_ITEMS.map((item) => {
            const isItemOpen = openItemId === item.id;
            return (
              <div key={item.id}>
                <button
                  type="button"
                  onClick={() => setOpenItemId((prev) => (prev === item.id ? null : item.id))}
                  aria-expanded={isItemOpen}
                  data-testid={`faq-item-${item.id}`}
                  className="flex min-h-[42px] w-full cursor-pointer items-center justify-between gap-3 px-4 py-2.5 text-right transition-colors hover:bg-white/[0.03]"
                >
                  <span className="text-xs font-semibold text-[#fbf6f0] sm:text-[13px]">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 shrink-0 text-[#d8c7cf] transition-transform duration-200 ${
                      isItemOpen ? 'rotate-180 text-[#dfb16b]' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>

                {isItemOpen && (
                  <p
                    data-testid={`faq-answer-${item.id}`}
                    className="px-4 pb-3 text-xs leading-relaxed text-[#d8c7cf]"
                  >
                    {item.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
