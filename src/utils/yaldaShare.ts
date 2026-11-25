import { EVENT_CONFIG } from '../types/yalda';

export interface YaldaSharePayload {
  title: string;
  text: string;
  url: string;
  fullMessage: string;
}

export interface SocialShareLinks {
  whatsapp: string;
  telegram: string;
  x: string;
  email: string;
}

export function getCanonicalEventUrl(): string {
  if (typeof window === 'undefined') {
    return EVENT_CONFIG.mapsUrl;
  }
  return `${window.location.origin}${window.location.pathname}`;
}

export function buildYaldaSharePayload(eventUrl?: string): YaldaSharePayload {
  const url = eventUrl || getCanonicalEventUrl();
  const title = EVENT_CONFIG.title;
  const text = [
    `دعوت‌نامه ${EVENT_CONFIG.title} (${EVENT_CONFIG.associationName})`,
    `تاریخ: ${EVENT_CONFIG.date}`,
    `برنامه: ${EVENT_CONFIG.scheduleSummary}`,
    `مکان: ${EVENT_CONFIG.venue} — ${EVENT_CONFIG.address}`,
    `مسیریابی: ${EVENT_CONFIG.mapsUrl}`,
  ].join('\n');

  return {
    title,
    text,
    url,
    fullMessage: `${text}\nثبت‌نام: ${url}`,
  };
}

export function getSocialShareLinks(eventUrl?: string): SocialShareLinks {
  const payload = buildYaldaSharePayload(eventUrl);
  const encodedTextWithUrl = encodeURIComponent(payload.fullMessage);
  const encodedText = encodeURIComponent(payload.text);
  const encodedUrl = encodeURIComponent(payload.url);
  const encodedTitle = encodeURIComponent(payload.title);

  return {
    whatsapp: `https://wa.me/?text=${encodedTextWithUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    x: `https://twitter.com/intent/tweet?text=${encodedTextWithUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedTextWithUrl}`,
  };
}
