import { useState } from 'react';
import { CalendarPlus, Check, Clock, Copy, MapPin, Navigation } from 'lucide-react';
import { EVENT_CONFIG } from '../types/yalda';
import {
  AZAR_1405_MONTH,
  DEC_2026_MONTH,
  downloadYaldaIcs,
  type CalendarMode,
} from '../utils/yaldaCalendar';

export function YaldaMiniCalendarCard() {
  const [mode, setMode] = useState<CalendarMode>('jalali');
  const [icsSaved, setIcsSaved] = useState(false);
  const [addressCopied, setAddressCopied] = useState(false);

  const month = mode === 'jalali' ? AZAR_1405_MONTH : DEC_2026_MONTH;
  const fullAddress = `${EVENT_CONFIG.venue}, ${EVENT_CONFIG.address}`;

  const handleDownloadIcs = () => {
    downloadYaldaIcs();
    setIcsSaved(true);
    window.setTimeout(() => setIcsSaved(false), 2000);
  };

  const handleCopyAddress = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(fullAddress);
      } else {
        const ta = document.createElement('textarea');
        ta.value = fullAddress;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.top = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setAddressCopied(true);
      window.setTimeout(() => setAddressCopied(false), 1800);
    } catch {
      // Clipboard fallback ignored cleanly
    }
  };

  return (
    <section
      aria-label="تقویم و جزئیات تاریخ و مکان مراسم"
      data-testid="yalda-mini-calendar-card"
      className="relative rounded-2xl border border-[#dfb16b]/30 bg-gradient-to-br from-[#140b18]/85 via-[#0c0711]/90 to-[#1f0c16]/80 p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] sm:p-4"
    >
      <div className="grid grid-cols-1 items-stretch gap-3.5 md:grid-cols-[232px_1fr] md:gap-5">
        {/* Mini Monthly Calendar */}
        <div className="flex flex-col justify-between gap-2 md:border-l md:border-white/10 md:pl-5">
          <div className="flex items-center justify-between gap-2">
            <span
              dir={month.dir}
              className="text-xs font-extrabold tracking-wide text-[#fae3bb] sm:text-[13px]"
            >
              {month.monthLabel}
            </span>

            <div
              role="group"
              aria-label="تغییر نوع تقویم"
              className="inline-flex shrink-0 items-center rounded-lg border border-white/12 bg-white/[0.04] p-0.5"
            >
              <button
                type="button"
                onClick={() => setMode('jalali')}
                aria-pressed={mode === 'jalali'}
                className={`cursor-pointer whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-semibold transition-colors ${
                  mode === 'jalali'
                    ? 'bg-[#a61c31]/80 text-[#fae3bb]'
                    : 'text-[#d8c7cf] hover:text-[#fbf6f0]'
                }`}
              >
                شمسی
              </button>
              <button
                type="button"
                onClick={() => setMode('gregorian')}
                aria-pressed={mode === 'gregorian'}
                className={`cursor-pointer whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-semibold transition-colors ${
                  mode === 'gregorian'
                    ? 'bg-[#a61c31]/80 text-[#fae3bb]'
                    : 'text-[#d8c7cf] hover:text-[#fbf6f0]'
                }`}
              >
                میلادی
              </button>
            </div>
          </div>

          <div dir={month.dir} className="select-none">
            <div className="mb-0.5 grid grid-cols-7 gap-0.5 text-center">
              {month.weekdays.map((wd, idx) => (
                <span
                  key={wd}
                  className={`py-0.5 text-[10px] font-semibold ${
                    idx === month.weekendColIndex ? 'text-[#e893a5]' : 'text-[#b7a5af]'
                  }`}
                >
                  {wd}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-0.5 text-center tabular-nums">
              {month.cells.map((day, index) => {
                if (day === null) {
                  return <span key={`empty-${index}`} className="h-6" aria-hidden="true" />;
                }

                const isEventDay = day === month.eventDay;
                const isWeekendCol = index % 7 === month.weekendColIndex;

                return (
                  <span
                    key={day}
                    aria-current={isEventDay ? 'date' : undefined}
                    title={isEventDay ? `شب یلدا — ${EVENT_CONFIG.date}` : undefined}
                    className={`flex h-6 items-center justify-center rounded-md text-[11px] transition-colors ${
                      isEventDay
                        ? 'bg-gradient-to-br from-[#a61c31] to-[#cf9844] font-extrabold text-white shadow-[0_0_12px_rgba(223,177,107,0.55)] ring-1 ring-[#fae3bb]/75'
                        : isWeekendCol
                          ? 'text-[#e8a4b2]/85'
                          : 'text-[#e6dbe1]/85'
                    }`}
                  >
                    {month.formatDay(day)}
                  </span>
                );
              })}
            </div>
          </div>

          <p className="border-t border-white/10 pt-1.5 text-center text-[11px] font-medium text-[#e2d4dc]">
            شب یلدا <span aria-hidden="true">·</span> یکشنبه ۲۹ آذر / ۲۰ دسامبر
          </p>
        </div>

        {/* Readable Exact Date & Venue Text Card */}
        <div className="flex flex-col justify-between gap-2.5 text-right">
          <div className="space-y-2">
            <div>
              <p className="text-[11px] font-semibold text-[#dfb16b]">تقویم و نشانی دقیق مراسم</p>
              <h3 className="mt-0.5 text-base font-extrabold text-[#fbf6f0] sm:text-lg">
                یکشنبه ۲۹ آذر ۱۴۰۵
                <span className="mr-2 text-xs font-medium text-[#e2d4dc] sm:text-[13px]">
                  (۲۰ دسامبر ۲۰۲۶)
                </span>
              </h3>
            </div>

            <div className="h-px w-full bg-white/10" aria-hidden="true" />

            <dl className="space-y-1.5 text-xs leading-relaxed text-[#f2e7ed] sm:text-[13px]">
              <div className="flex items-start gap-2">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#dfb16b]" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <dt className="inline font-bold text-[#fae3bb]">ساعت برنامه: </dt>
                  <dd className="inline text-[#f2e7ed]">{EVENT_CONFIG.scheduleSummary}</dd>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#dfb16b]" aria-hidden="true" />
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div>
                    <dt className="inline font-bold text-[#fae3bb]">مکان دقیق: </dt>
                    <dd className="inline text-[#f2e7ed]">{EVENT_CONFIG.venue}</dd>
                  </div>
                  <dd className="text-xs font-medium text-[#d8c7cf] tabular-nums">
                    <span dir="ltr" className="inline-block">
                      {EVENT_CONFIG.address}
                    </span>
                  </dd>
                </div>
              </div>
            </dl>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-2">
            <button
              type="button"
              onClick={handleDownloadIcs}
              data-testid="download-ics-btn"
              className="inline-flex min-h-[36px] cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-[#dfb16b]/45 bg-[#dfb16b]/15 px-3 py-1.5 text-xs font-bold text-[#fae3bb] transition-colors hover:border-[#dfb16b]/75 hover:bg-[#dfb16b]/25"
            >
              {icsSaved ? (
                <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              ) : (
                <CalendarPlus className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              )}
              <span>{icsSaved ? 'فایل تقویم ذخیره شد' : 'افزودن به تقویم (.ics)'}</span>
            </button>

            <a
              href={EVENT_CONFIG.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="venue-maps-link"
              className="inline-flex min-h-[36px] items-center gap-1.5 whitespace-nowrap rounded-lg border border-white/14 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-[#e2d4dc] transition-colors hover:border-[#dfb16b]/45 hover:bg-white/[0.08] hover:text-[#fbf6f0]"
            >
              <Navigation className="h-3.5 w-3.5 shrink-0 text-[#dfb16b]" aria-hidden="true" />
              <span>مسیریابی روی نقشه</span>
            </a>

            <button
              type="button"
              onClick={handleCopyAddress}
              data-testid="copy-venue-btn"
              className="inline-flex min-h-[36px] cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-white/14 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-[#e2d4dc] transition-colors hover:border-[#dfb16b]/45 hover:bg-white/[0.08] hover:text-[#fbf6f0]"
            >
              {addressCopied ? (
                <Check className="h-3.5 w-3.5 shrink-0 text-[#fae3bb]" aria-hidden="true" />
              ) : (
                <Copy className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              )}
              <span>{addressCopied ? 'نشانی کپی شد' : 'کپی نشانی سالن'}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
