import { useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Check,
  Clock,
  Copy,
  CreditCard,
  Download,
  ExternalLink,
  Loader2,
  Mail,
  MapPin,
  Plus,
  RotateCw,
  Share2,
  X,
} from 'lucide-react';
import { EVENT_CONFIG, type TicketRecord } from '../types/yalda';
import { toFa } from '../utils/yaldaLogic';
import { downloadTicketPdf } from '../utils/ticketPdf';
import { buildYaldaSharePayload, getSocialShareLinks } from '../utils/yaldaShare';
import { GuillocheWave } from './GuillocheWave';
import { YaldaConfettiBurst } from './YaldaConfettiBurst';

interface StepTicketProps {
  ticket: TicketRecord;
  onReset: () => void;
}

export function StepTicket({ ticket, onReset }: StepTicketProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const frontFaceRef = useRef<HTMLDivElement | null>(null);
  const backFaceRef = useRef<HTMLDivElement | null>(null);

  const sharePayload = useMemo(() => buildYaldaSharePayload(), []);
  const socialLinks = useMemo(() => getSocialShareLinks(sharePayload.url), [sharePayload.url]);
  const supportsNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const toggleFlip = () => setIsFlipped((prev) => !prev);

  const handleCopyShareMessage = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(sharePayload.fullMessage);
      } else {
        const ta = document.createElement('textarea');
        ta.value = sharePayload.fullMessage;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.top = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setShareCopied(true);
      window.setTimeout(() => setShareCopied(false), 1800);
    } catch {
      // Clipboard fallback ignored cleanly
    }
  };

  const handleNativeShare = async () => {
    if (!supportsNativeShare) return;
    try {
      await navigator.share({
        title: sharePayload.title,
        text: sharePayload.text,
        url: sharePayload.url,
      });
    } catch {
      // User dismissed or iframe disallowed Web Share API
    }
  };

  const handleDownloadPdf = async () => {
    if (!frontFaceRef.current || isExporting) return;
    setIsExporting(true);
    setExportError(null);
    try {
      await downloadTicketPdf({
        frontElement: frontFaceRef.current,
        backElement: backFaceRef.current,
        trackingCode: ticket.trackingCode,
      });
    } catch {
      setExportError('در ساخت فایل PDF مشکلی پیش آمد. لطفاً دوباره تلاش کنید یا از صفحه اسکرین‌شات بگیرید.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <section
      aria-label="بلیت دیجیتال"
      className="flex h-full flex-col items-center justify-center gap-5 py-2"
    >
      <div className="relative w-full max-w-[560px]">
        <YaldaConfettiBurst triggerKey={ticket.trackingCode} />

        <button
          type="button"
          onClick={toggleFlip}
          aria-pressed={isFlipped}
          aria-label="بلیت دیجیتال سه‌بعدی — برای مشاهده پشت بلیت کلیک کنید"
          className="perspective-1400 w-full cursor-pointer text-right focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#dfb16b]"
        >
        <div
          className={`preserve-3d ticket-transition relative grid w-full ${
            isFlipped ? 'is-flipped-3d' : ''
          }`}
        >
          {/* Ticket Front */}
          <div
            ref={frontFaceRef}
            className="flip-face-front backface-hidden holo-sheen relative col-start-1 row-start-1 flex flex-col justify-between overflow-hidden rounded-2xl border border-[#dfb16b]/55 bg-gradient-to-br from-[#94162e]/65 via-[#0f0916]/95 to-[#2a101c]/95 p-5 shadow-[0_24px_54px_-14px_rgba(0,0,0,0.8),0_0_38px_-10px_rgba(223,177,107,0.3),inset_0_1px_0_rgba(255,255,255,0.28)] sm:p-6"
          >
            <div className="relative z-[2] space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-extrabold text-[#fae3bb] sm:text-base">
                    {EVENT_CONFIG.title}
                  </div>
                  <div className="truncate text-xs text-[#e2d4dc]">{EVENT_CONFIG.associationName}</div>
                </div>
                <div
                  dir="ltr"
                  data-testid="ticket-code"
                  className="shrink-0 rounded-xl border border-[#dfb16b]/65 bg-[#dfb16b]/18 px-3 py-1.5 text-sm font-black tracking-wider tabular-nums text-[#fae3bb] sm:text-base"
                >
                  {ticket.trackingCode}
                </div>
              </div>

              <div
                className="h-px w-full bg-gradient-to-r from-transparent via-[#dfb16b]/40 to-transparent"
                aria-hidden="true"
              />

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <div className="rounded-xl border border-white/12 bg-[#0a060d]/60 px-3.5 py-2.5">
                  <span className="block text-[11px] text-[#bfb0b8]">نام مهمان</span>
                  <span className="block truncate text-sm font-bold text-[#fbf6f0]" data-testid="ticket-guest">
                    {ticket.fullName}
                  </span>
                </div>
                <div className="rounded-xl border border-white/12 bg-[#0a060d]/60 px-3.5 py-2.5">
                  <span className="block text-[11px] text-[#bfb0b8]">تعداد و مبلغ کل</span>
                  <span className="block text-sm font-bold tabular-nums text-[#fae3bb]" data-testid="ticket-fee">
                    {toFa(ticket.guests)} نفر · {ticket.totalFee} €
                  </span>
                </div>
                <div className="rounded-xl border border-white/12 bg-[#0a060d]/60 px-3.5 py-2.5 sm:col-span-2">
                  <span className="block text-[11px] text-[#bfb0b8]">بخش حضور</span>
                  <span className="block text-sm font-bold text-[#fbf6f0]">{ticket.attendance}</span>
                </div>
              </div>

              <div
                className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-center text-xs font-semibold ${
                  ticket.isDemo || !ticket.emailSent
                    ? 'border-[#dfb16b]/45 bg-[#dfb16b]/15 text-[#fae3bb]'
                    : 'border-[#34d399]/45 bg-[#34d399]/15 text-[#a7f3d0]'
                }`}
              >
                <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>
                  {ticket.isDemo
                    ? 'ثبت‌نام آزمایشی با موفقیت ثبت شد (در اتصال سرور، ایمیل تاییدیه ارسال می‌شود)'
                    : ticket.emailSent
                      ? 'ایمیل تاییدیه و بلیت دیجیتال ارسال شد'
                      : 'ثبت‌نام ذخیره شد (لطفاً از این صفحه اسکرین‌شات بگیرید)'}
                </span>
              </div>

              <GuillocheWave className="block h-3.5 w-full pointer-events-none" />
            </div>

            <div
              data-pdf-ignore="true"
              className="relative z-[2] mt-2 text-center text-xs text-[#fae3bb]/90"
            >
              برای دیدن جزئیات پشت بلیت کلیک کنید
            </div>
          </div>

          {/* Ticket Back */}
          <div
            ref={backFaceRef}
            className="flip-face-back backface-hidden holo-sheen relative col-start-1 row-start-1 flex flex-col justify-between overflow-hidden rounded-2xl border border-[#dfb16b]/55 bg-gradient-to-br from-[#141224]/95 via-[#0e0813]/98 to-[#581223]/85 p-5 shadow-[0_24px_54px_-14px_rgba(0,0,0,0.8),0_0_38px_-10px_rgba(223,177,107,0.3),inset_0_1px_0_rgba(255,255,255,0.28)] sm:p-6"
          >
            <div className="relative z-[2] space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-extrabold text-[#fae3bb] sm:text-base">
                  اطلاعات ورود و یادآوری مراسم
                </span>
                <span className="text-xs text-[#e2d4dc]">{EVENT_CONFIG.date}</span>
              </div>

              <GuillocheWave className="block h-3.5 w-full pointer-events-none" />

              <ul className="space-y-2 text-xs text-[#fbf6f0] sm:text-[13px]">
                <li className="flex items-start gap-2 rounded-xl border border-white/10 bg-[#0a060d]/60 px-3.5 py-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#dfb16b]" aria-hidden="true" />
                  <span>
                    <strong>مکان:</strong> {EVENT_CONFIG.venue} ·{' '}
                    <span dir="ltr" className="inline-block">
                      {EVENT_CONFIG.address}
                    </span>
                  </span>
                </li>
                <li className="flex items-start gap-2 rounded-xl border border-white/10 bg-[#0a060d]/60 px-3.5 py-2.5">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#dfb16b]" aria-hidden="true" />
                  <span>
                    <strong>زمان‌بندی:</strong> {EVENT_CONFIG.scheduleSummary}
                  </span>
                </li>
                <li className="flex items-start gap-2 rounded-xl border border-white/10 bg-[#0a060d]/60 px-3.5 py-2.5">
                  <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-[#dfb16b]" aria-hidden="true" />
                  <span>
                    <strong>واریز آنلاین:</strong>{' '}
                    <span dir="ltr" className="inline-block font-bold tabular-nums text-[#fae3bb]">
                      <span className="bk-edge">M</span>obilePay {EVENT_CONFIG.mobilePay} · IBA
                      <span className="bk-edge">N</span> {EVENT_CONFIG.iban}
                    </span>
                  </span>
                </li>
                <li className="flex items-start gap-2 rounded-xl border border-white/10 bg-[#0a060d]/60 px-3.5 py-2.5">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#dfb16b]" aria-hidden="true" />
                  <span>
                    <strong>تماس:</strong>{' '}
                    <span dir="ltr">{EVENT_CONFIG.contact}</span>
                  </span>
                </li>
              </ul>
            </div>

            <div
              data-pdf-ignore="true"
              className="relative z-[2] mt-2 text-center text-xs text-[#fae3bb]/90"
            >
              برای بازگشت به روی بلیت کلیک کنید
            </div>
          </div>
        </div>
        </button>
      </div>

      {exportError && (
        <div
          role="alert"
          className="flex max-w-[560px] items-center gap-2 rounded-xl border border-[#dc2645]/60 bg-[#a61c31]/30 px-3.5 py-2 text-xs font-semibold text-[#ffe4ea]"
        >
          <AlertTriangle className="h-4 w-4 shrink-0 text-[#ff8da4]" aria-hidden="true" />
          <span>{exportError}</span>
        </div>
      )}

      {/* Ticket Actions */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
        <button
          type="button"
          onClick={handleDownloadPdf}
          disabled={isExporting}
          data-testid="download-pdf-btn"
          className="inline-flex min-h-[42px] cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#fae3bb]/55 bg-gradient-to-l from-[#98152e] via-[#c01e3a] to-[#cf9844] px-5 py-2 text-xs font-extrabold text-white shadow-[0_10px_24px_-8px_rgba(166,28,49,0.7)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-55 sm:text-sm"
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Download className="h-4 w-4" aria-hidden="true" />
          )}
          <span>{isExporting ? 'در حال ساخت PDF...' : 'دانلود بلیت PDF'}</span>
        </button>

        <button
          type="button"
          onClick={toggleFlip}
          className="inline-flex min-h-[42px] cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#dfb16b]/45 bg-[#dfb16b]/15 px-4 py-2 text-xs font-bold text-[#fae3bb] transition hover:border-[#dfb16b]/70 hover:bg-[#dfb16b]/25 sm:text-sm"
        >
          <RotateCw className="h-4 w-4" aria-hidden="true" />
          <span>{isFlipped ? 'نمایش روی بلیت' : 'جزئیات پشت بلیت'}</span>
        </button>

        <button
          type="button"
          onClick={() => setShareOpen((prev) => !prev)}
          aria-expanded={shareOpen}
          data-testid="share-ticket-btn"
          className="inline-flex min-h-[42px] cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-[#dfb16b]/45 bg-[#dfb16b]/15 px-4 py-2 text-xs font-bold text-[#fae3bb] transition hover:border-[#dfb16b]/70 hover:bg-[#dfb16b]/25 sm:text-sm"
        >
          <Share2 className="h-4 w-4" aria-hidden="true" />
          <span>اشتراک‌گذاری</span>
        </button>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex min-h-[42px] cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-white/16 bg-white/[0.06] px-4 py-2 text-xs font-bold text-[#e2d4dc] transition hover:border-[#dfb16b]/45 hover:bg-white/12 hover:text-[#fbf6f0] sm:text-sm"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>ثبت‌نام جدید</span>
        </button>
      </div>

      {shareOpen && (
        <div
          role="region"
          aria-label="اشتراک‌گذاری دعوت‌نامه مراسم شب یلدا"
          data-testid="share-panel"
          className="w-full max-w-[560px] space-y-3 rounded-2xl border border-[#dfb16b]/35 bg-[#0e0814]/92 p-4 text-right shadow-[0_14px_34px_-12px_rgba(0,0,0,0.75)]"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-[#fae3bb] sm:text-sm">
              دعوت از دوستان به مراسم شب یلدا ۱۴۰۵
            </span>
            <button
              type="button"
              onClick={() => setShareOpen(false)}
              aria-label="بستن پنل اشتراک‌گذاری"
              className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-white/12 bg-white/[0.05] text-[#d8c7cf] transition hover:border-[#dfb16b]/45 hover:text-[#fbf6f0]"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>

          <p className="whitespace-pre-line border-y border-white/10 py-2.5 text-xs leading-relaxed text-[#e2d4dc]">
            {sharePayload.text}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href={socialLinks.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="share-whatsapp-link"
              className="inline-flex min-h-[36px] items-center gap-1.5 whitespace-nowrap rounded-lg border border-[#dfb16b]/35 bg-[#dfb16b]/12 px-3 py-1.5 text-xs font-bold text-[#fae3bb] transition hover:border-[#dfb16b]/65 hover:bg-[#dfb16b]/22"
            >
              <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>واتساپ</span>
            </a>

            <a
              href={socialLinks.telegram}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="share-telegram-link"
              className="inline-flex min-h-[36px] items-center gap-1.5 whitespace-nowrap rounded-lg border border-[#dfb16b]/35 bg-[#dfb16b]/12 px-3 py-1.5 text-xs font-bold text-[#fae3bb] transition hover:border-[#dfb16b]/65 hover:bg-[#dfb16b]/22"
            >
              <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>تلگرام</span>
            </a>

            <a
              href={socialLinks.x}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="share-x-link"
              className="inline-flex min-h-[36px] items-center gap-1.5 whitespace-nowrap rounded-lg border border-[#dfb16b]/35 bg-[#dfb16b]/12 px-3 py-1.5 text-xs font-bold text-[#fae3bb] transition hover:border-[#dfb16b]/65 hover:bg-[#dfb16b]/22"
            >
              <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>X</span>
            </a>

            <a
              href={socialLinks.email}
              data-testid="share-email-link"
              className="inline-flex min-h-[36px] items-center gap-1.5 whitespace-nowrap rounded-lg border border-white/14 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-[#e2d4dc] transition hover:border-[#dfb16b]/45 hover:bg-white/[0.08] hover:text-[#fbf6f0]"
            >
              <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>ایمیل</span>
            </a>

            <button
              type="button"
              onClick={handleCopyShareMessage}
              data-testid="copy-share-msg-btn"
              className="inline-flex min-h-[36px] cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-white/14 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-[#e2d4dc] transition hover:border-[#dfb16b]/45 hover:bg-white/[0.08] hover:text-[#fbf6f0]"
            >
              {shareCopied ? (
                <Check className="h-3.5 w-3.5 shrink-0 text-[#fae3bb]" aria-hidden="true" />
              ) : (
                <Copy className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              )}
              <span>{shareCopied ? 'پیام کپی شد' : 'کپی متن و لینک'}</span>
            </button>

            {supportsNativeShare && (
              <button
                type="button"
                onClick={handleNativeShare}
                className="inline-flex min-h-[36px] cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-white/14 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-[#e2d4dc] transition hover:border-[#dfb16b]/45 hover:bg-white/[0.08] hover:text-[#fbf6f0]"
              >
                <Share2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>اشتراک سریع</span>
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
