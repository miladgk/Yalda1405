// Ambient Yalda audio player backed by /Midwinter_Pomegranate.mp3

const AUDIO_SRC = `${import.meta.env.BASE_URL}Midwinter_Pomegranate.mp3`;
const TARGET_VOLUME = 0.55;
const FADE_INTERVAL_MS = 30;
const FADE_IN_MS = 400;
const FADE_OUT_MS = 280;

class YaldaTrackPlayer {
  private audio: HTMLAudioElement | null = null;
  private fadeTimer: number | null = null;
  private playing = false;

  private ensureAudio(): HTMLAudioElement | null {
    if (typeof window === 'undefined' || typeof Audio === 'undefined') {
      return null;
    }

    if (!this.audio) {
      const el = new Audio(AUDIO_SRC);
      el.loop = true;
      el.preload = 'none';
      el.volume = 0;
      el.addEventListener('ended', () => {
        if (!el.loop) {
          this.playing = false;
        }
      });
      this.audio = el;
    }

    return this.audio;
  }

  private clearFade(): void {
    if (this.fadeTimer !== null) {
      window.clearInterval(this.fadeTimer);
      this.fadeTimer = null;
    }
  }

  private fadeVolume(
    el: HTMLAudioElement,
    to: number,
    durationMs: number,
    onDone?: () => void
  ): void {
    this.clearFade();
    const from = el.volume;
    const steps = Math.max(1, Math.round(durationMs / FADE_INTERVAL_MS));
    let step = 0;

    this.fadeTimer = window.setInterval(() => {
      step += 1;
      const t = Math.min(1, step / steps);
      el.volume = Math.max(0, Math.min(1, from + (to - from) * t));

      if (t >= 1) {
        this.clearFade();
        onDone?.();
      }
    }, FADE_INTERVAL_MS);
  }

  async start(): Promise<boolean> {
    const el = this.ensureAudio();
    if (!el) return false;

    this.clearFade();
    this.playing = true;
    el.volume = Math.min(el.volume, TARGET_VOLUME);

    try {
      await el.play();
    } catch {
      this.playing = false;
      return false;
    }

    if (!this.playing) {
      el.pause();
      return false;
    }

    this.fadeVolume(el, TARGET_VOLUME, FADE_IN_MS);
    return true;
  }

  stop(): void {
    this.playing = false;
    const el = this.audio;
    if (!el) return;

    this.fadeVolume(el, 0, FADE_OUT_MS, () => {
      if (!this.playing) {
        el.pause();
      }
    });
  }

  dispose(): void {
    this.playing = false;
    this.clearFade();
    if (this.audio) {
      this.audio.pause();
      this.audio.removeAttribute('src');
      this.audio.load();
      this.audio = null;
    }
  }
}

const player = new YaldaTrackPlayer();

export async function setYaldaAudioPlaying(shouldPlay: boolean): Promise<boolean> {
  if (shouldPlay) {
    return player.start();
  }
  player.stop();
  return false;
}

export function disposeYaldaAudio(): void {
  player.dispose();
}
