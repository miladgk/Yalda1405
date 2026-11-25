// Ambient traditional Persian Yalda instrumental engine (Dastgah-e Homayoun feel)
// Synthesizes hammered santoor/setar plucks over a soft kamancheh drone using Web Audio API.

interface MotifNote {
  offsetSec: number;
  freq: number;
  duration: number;
  velocity: number;
  ornament?: number;
}

const LOOP_DURATION_SEC = 16.0;

// Dastgah-e Homayoun / Shushtari frequencies (D4 tonic, E-koron ~320.2Hz, F#4, G4, A4, Bb4, C5, D5)
const HOMAYOUN_MOTIF: MotifNote[] = [
  { offsetSec: 0.2, freq: 293.66, duration: 2.2, velocity: 0.65 }, // D4
  { offsetSec: 0.95, freq: 369.99, duration: 1.8, velocity: 0.72 }, // F#4
  { offsetSec: 1.65, freq: 440.0, duration: 2.4, velocity: 0.78, ornament: 392.0 }, // G4 -> A4
  { offsetSec: 2.7, freq: 392.0, duration: 1.9, velocity: 0.66 }, // G4
  { offsetSec: 3.45, freq: 369.99, duration: 2.0, velocity: 0.68 }, // F#4
  { offsetSec: 4.2, freq: 320.2, duration: 2.3, velocity: 0.64 }, // E-koron4
  { offsetSec: 5.15, freq: 293.66, duration: 2.8, velocity: 0.74 }, // D4 (cadence)

  { offsetSec: 6.8, freq: 440.0, duration: 1.9, velocity: 0.7 }, // A4
  { offsetSec: 7.55, freq: 466.16, duration: 1.8, velocity: 0.74 }, // Bb4
  { offsetSec: 8.3, freq: 523.25, duration: 2.2, velocity: 0.8 }, // C5
  { offsetSec: 9.15, freq: 587.33, duration: 2.6, velocity: 0.78, ornament: 523.25 }, // C5 -> D5
  { offsetSec: 10.25, freq: 466.16, duration: 2.0, velocity: 0.68 }, // Bb4
  { offsetSec: 11.05, freq: 440.0, duration: 2.2, velocity: 0.7 }, // A4

  { offsetSec: 12.15, freq: 392.0, duration: 1.8, velocity: 0.66 }, // G4
  { offsetSec: 12.9, freq: 369.99, duration: 1.9, velocity: 0.68 }, // F#4
  { offsetSec: 13.65, freq: 320.2, duration: 2.1, velocity: 0.62 }, // E-koron4
  { offsetSec: 14.45, freq: 293.66, duration: 3.1, velocity: 0.72 }, // D4
];

class YaldaAmbientPlayer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private reverbInput: GainNode | null = null;
  private droneGain: GainNode | null = null;
  private droneOscs: OscillatorNode[] = [];
  private schedulerId: number | null = null;
  private loopStartTime = 0;
  private scheduledIndex = 0;
  private playing = false;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;

    if (!this.ctx) {
      this.ctx = new AudioCtx();
      const master = this.ctx.createGain();
      master.gain.value = 0;
      master.connect(this.ctx.destination);
      this.masterGain = master;

      // Warm wooden hall delay network
      const reverbIn = this.ctx.createGain();
      reverbIn.gain.value = 0.34;

      const delayA = this.ctx.createDelay(1.0);
      delayA.delayTime.value = 0.29;
      const delayB = this.ctx.createDelay(1.0);
      delayB.delayTime.value = 0.47;

      const dampA = this.ctx.createBiquadFilter();
      dampA.type = 'lowpass';
      dampA.frequency.value = 1450;

      const fbA = this.ctx.createGain();
      fbA.gain.value = 0.3;

      reverbIn.connect(delayA);
      delayA.connect(dampA);
      dampA.connect(master);
      dampA.connect(delayB);
      delayB.connect(fbA);
      fbA.connect(delayA);
      delayB.connect(master);

      this.reverbInput = reverbIn;
    }

    return this.ctx;
  }

  private startDrone(ctx: AudioContext) {
    if (!this.masterGain || this.droneOscs.length > 0) return;

    const droneFilter = ctx.createBiquadFilter();
    droneFilter.type = 'lowpass';
    droneFilter.frequency.value = 360;

    const dGain = ctx.createGain();
    dGain.gain.value = 0.085;

    const oscRoot = ctx.createOscillator();
    oscRoot.type = 'triangle';
    oscRoot.frequency.value = 146.83; // D3

    const oscFifth = ctx.createOscillator();
    oscFifth.type = 'sine';
    oscFifth.frequency.value = 220.0; // A3

    const fifthGain = ctx.createGain();
    fifthGain.gain.value = 0.55;

    // Gentle LFO breathing on drone volume
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.16;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.025;
    lfo.connect(lfoGain);
    lfoGain.connect(dGain.gain);

    oscRoot.connect(droneFilter);
    oscFifth.connect(fifthGain);
    fifthGain.connect(droneFilter);
    droneFilter.connect(dGain);
    dGain.connect(this.masterGain);

    oscRoot.start();
    oscFifth.start();
    lfo.start();

    this.droneGain = dGain;
    this.droneOscs = [oscRoot, oscFifth, lfo];
  }

  private stopDrone() {
    for (const osc of this.droneOscs) {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // Ignore already stopped oscillator
      }
    }
    this.droneOscs = [];
    this.droneGain = null;
  }

  private triggerPluck(ctx: AudioContext, freq: number, when: number, duration: number, velocity: number) {
    if (!this.masterGain || !this.reverbInput) return;

    const oscMain = ctx.createOscillator();
    const oscHarm = ctx.createOscillator();
    oscMain.type = 'triangle';
    oscMain.frequency.setValueAtTime(freq, when);

    oscHarm.type = 'sine';
    oscHarm.frequency.setValueAtTime(freq * 2.002, when); // Crisp hammered dulcimer overtone

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2500, when);
    filter.frequency.exponentialRampToValueAtTime(620, when + Math.min(duration, 1.8));

    const env = ctx.createGain();
    const peak = 0.2 * velocity;
    env.gain.setValueAtTime(0.0001, when);
    env.gain.linearRampToValueAtTime(peak, when + 0.012);
    env.gain.exponentialRampToValueAtTime(peak * 0.32, when + 0.35);
    env.gain.exponentialRampToValueAtTime(0.0001, when + duration);

    const harmGain = ctx.createGain();
    harmGain.gain.value = 0.24;

    oscMain.connect(filter);
    oscHarm.connect(harmGain);
    harmGain.connect(filter);
    filter.connect(env);

    env.connect(this.masterGain);
    env.connect(this.reverbInput);

    oscMain.start(when);
    oscHarm.start(when);
    oscMain.stop(when + duration + 0.05);
    oscHarm.stop(when + duration + 0.05);
  }

  private scheduleAhead = () => {
    if (!this.playing || !this.ctx) return;
    const now = this.ctx.currentTime;
    const horizon = now + 0.7;

    while (true) {
      if (this.scheduledIndex >= HOMAYOUN_MOTIF.length) {
        this.scheduledIndex = 0;
        this.loopStartTime += LOOP_DURATION_SEC;
      }

      const note = HOMAYOUN_MOTIF[this.scheduledIndex];
      const noteTime = this.loopStartTime + note.offsetSec;

      if (noteTime > horizon) break;

      if (noteTime >= now - 0.05) {
        const startAt = Math.max(now + 0.02, noteTime);
        if (note.ornament) {
          this.triggerPluck(this.ctx, note.ornament, Math.max(now, startAt - 0.095), 0.35, note.velocity * 0.55);
        }
        this.triggerPluck(this.ctx, note.freq, startAt, note.duration, note.velocity);
      }

      this.scheduledIndex += 1;
    }
  };

  async start(): Promise<boolean> {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return false;

    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    this.playing = true;
    this.startDrone(ctx);

    const now = ctx.currentTime;
    this.loopStartTime = now;
    this.scheduledIndex = 0;

    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.linearRampToValueAtTime(0.32, now + 0.45);

    this.scheduleAhead();
    if (this.schedulerId !== null) {
      window.clearInterval(this.schedulerId);
    }
    this.schedulerId = window.setInterval(this.scheduleAhead, 220);

    return true;
  }

  stop(): void {
    this.playing = false;
    if (this.schedulerId !== null) {
      window.clearInterval(this.schedulerId);
      this.schedulerId = null;
    }

    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.32);

      const ctxRef = this.ctx;
      window.setTimeout(() => {
        if (!this.playing) {
          this.stopDrone();
          if (ctxRef.state === 'running') {
            ctxRef.suspend().catch(() => {});
          }
        }
      }, 360);
    } else {
      this.stopDrone();
    }
  }

  dispose(): void {
    this.playing = false;
    if (this.schedulerId !== null) {
      window.clearInterval(this.schedulerId);
      this.schedulerId = null;
    }
    this.stopDrone();
    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.ctx = null;
      this.masterGain = null;
      this.reverbInput = null;
    }
  }
}

const player = new YaldaAmbientPlayer();

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
