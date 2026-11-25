import { useEffect, useRef } from 'react';

interface AmbientBackdropProps {
  snowEnabled: boolean;
  burstTrigger: number;
}

interface Flake {
  kind: 'crystal' | 'distant';
  variant: number;
  depth: number;
  x: number;
  y: number;
  size: number;
  vy: number;
  vx: number;
  phase: number;
  sway: number;
  angle: number;
  spin: number;
  alpha: number;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  life: number;
  decay: number;
  color: string;
}

const SPRITE_SIZE = 72;
const DOT_SPRITE_SIZE = 24;

function wrapCoord(value: number, span: number, pad: number): number {
  return ((((value + pad) % span) + span) % span) - pad;
}

function createSoftParticleSprite(): HTMLCanvasElement | null {
  const offscreen = document.createElement('canvas');
  offscreen.width = DOT_SPRITE_SIZE;
  offscreen.height = DOT_SPRITE_SIZE;
  const sctx = offscreen.getContext('2d');
  if (!sctx) return null;

  const c = DOT_SPRITE_SIZE / 2;
  const grad = sctx.createRadialGradient(c, c, 0, c, c, c);
  grad.addColorStop(0, 'rgba(244, 250, 255, 1)');
  grad.addColorStop(0.45, 'rgba(218, 238, 255, 0.55)');
  grad.addColorStop(1, 'rgba(205, 232, 255, 0)');
  sctx.fillStyle = grad;
  sctx.beginPath();
  sctx.arc(c, c, c, 0, Math.PI * 2);
  sctx.fill();
  return offscreen;
}

function createSnowflakeSprites(): HTMLCanvasElement[] {
  const sprites: HTMLCanvasElement[] = [];

  for (let variant = 0; variant < 3; variant += 1) {
    const offscreen = document.createElement('canvas');
    offscreen.width = SPRITE_SIZE;
    offscreen.height = SPRITE_SIZE;
    const sctx = offscreen.getContext('2d');
    if (!sctx) continue;

    const c = SPRITE_SIZE / 2;
    const r = SPRITE_SIZE * 0.38;

    sctx.translate(c, c);
    sctx.strokeStyle = '#eef8ff';
    sctx.fillStyle = '#ffffff';
    sctx.lineCap = 'round';
    sctx.lineJoin = 'round';
    sctx.shadowColor = 'rgba(175, 224, 255, 0.72)';
    sctx.shadowBlur = 4;

    if (variant === 0) {
      // Classic 6-pointed dendritic crystal
      sctx.lineWidth = 1.65;
      for (let i = 0; i < 6; i += 1) {
        sctx.save();
        sctx.rotate((Math.PI / 3) * i);
        sctx.beginPath();
        sctx.moveTo(0, 0);
        sctx.lineTo(0, -r);
        sctx.stroke();

        sctx.lineWidth = 1.3;
        sctx.beginPath();
        sctx.moveTo(0, -r * 0.44);
        sctx.lineTo(-r * 0.23, -r * 0.64);
        sctx.moveTo(0, -r * 0.44);
        sctx.lineTo(r * 0.23, -r * 0.64);

        sctx.moveTo(0, -r * 0.72);
        sctx.lineTo(-r * 0.16, -r * 0.87);
        sctx.moveTo(0, -r * 0.72);
        sctx.lineTo(r * 0.16, -r * 0.87);
        sctx.stroke();
        sctx.restore();
      }
      sctx.lineWidth = 1.1;
      sctx.beginPath();
      for (let i = 0; i < 6; i += 1) {
        const a = (Math.PI / 3) * i;
        const px = Math.sin(a) * (r * 0.22);
        const py = -Math.cos(a) * (r * 0.22);
        if (i === 0) sctx.moveTo(px, py);
        else sctx.lineTo(px, py);
      }
      sctx.closePath();
      sctx.stroke();
    } else if (variant === 1) {
      // Delicate fern-like 6-pointed Nordic star crystal
      for (let i = 0; i < 6; i += 1) {
        sctx.save();
        sctx.rotate((Math.PI / 3) * i);
        sctx.lineWidth = 1.5;
        sctx.beginPath();
        sctx.moveTo(0, -r * 0.12);
        sctx.lineTo(0, -r);
        sctx.stroke();

        sctx.lineWidth = 1.15;
        const tiers = [0.35, 0.57, 0.78];
        const spans = [0.18, 0.25, 0.14];
        for (let t = 0; t < tiers.length; t += 1) {
          const y0 = -r * tiers[t];
          const dx = r * spans[t];
          const dy = dx * 0.88;
          sctx.beginPath();
          sctx.moveTo(0, y0);
          sctx.lineTo(-dx, y0 - dy);
          sctx.moveTo(0, y0);
          sctx.lineTo(dx, y0 - dy);
          sctx.stroke();
        }
        sctx.restore();
      }
      sctx.beginPath();
      sctx.arc(0, 0, r * 0.1, 0, Math.PI * 2);
      sctx.fill();
    } else {
      // Hexagonal frost plate with radiating diamond tips
      sctx.lineWidth = 1.4;
      sctx.beginPath();
      for (let i = 0; i < 6; i += 1) {
        const a = (Math.PI / 3) * i;
        const px = Math.sin(a) * (r * 0.44);
        const py = -Math.cos(a) * (r * 0.44);
        if (i === 0) sctx.moveTo(px, py);
        else sctx.lineTo(px, py);
      }
      sctx.closePath();
      sctx.stroke();

      for (let i = 0; i < 6; i += 1) {
        sctx.save();
        sctx.rotate((Math.PI / 3) * i);
        sctx.lineWidth = 1.45;
        sctx.beginPath();
        sctx.moveTo(0, 0);
        sctx.lineTo(0, -r * 0.94);
        sctx.stroke();

        sctx.lineWidth = 1.15;
        sctx.beginPath();
        sctx.moveTo(-r * 0.18, -r * 0.72);
        sctx.lineTo(0, -r * 0.62);
        sctx.lineTo(r * 0.18, -r * 0.72);
        sctx.stroke();
        sctx.restore();
      }
    }

    sprites.push(offscreen);
  }

  return sprites;
}

export function AmbientBackdrop({ snowEnabled, burstTrigger }: AmbientBackdropProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const snowRef = useRef(snowEnabled);
  const sparksRef = useRef<Spark[]>([]);

  useEffect(() => {
    snowRef.current = snowEnabled;
  }, [snowEnabled]);

  useEffect(() => {
    if (burstTrigger <= 0) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const cx = w * 0.5;
    const cy = h * 0.45;
    const colors = ['#dc2645', '#a61c31', '#dfb16b', '#fae3bb', '#ff8aa3', '#ffffff'];

    for (let i = 0; i < 72; i += 1) {
      const angle = (Math.PI * 2 * i) / 72 + (Math.random() - 0.5) * 0.3;
      const speed = 2.4 + Math.random() * 5.6;
      sparksRef.current.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.3,
        r: 1.8 + Math.random() * 3.1,
        life: 1,
        decay: 0.012 + Math.random() * 0.012,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
  }, [burstTrigger]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const sprites = createSnowflakeSprites();
    const dotSprite = createSoftParticleSprite();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let w = 0;
    let h = 0;
    let flakes: Flake[] = [];
    let rafId = 0;
    let snowOpacity = snowRef.current ? 1 : 0;

    // Smoothly damped mouse position, pointer velocity, & scroll parallax targets
    let targetPointerX = 0;
    let targetPointerY = 0;
    let currentPointerX = 0;
    let currentPointerY = 0;
    let pointerVx = 0;
    let pointerVy = 0;
    let targetScrollY = window.scrollY || 0;
    let currentScrollY = targetScrollY;

    const onPointerMove = (e: PointerEvent) => {
      if (reduceMotion || w <= 0 || h <= 0) return;
      const nextX = (e.clientX / w - 0.5) * 2;
      const nextY = (e.clientY / h - 0.5) * 2;
      pointerVx = Math.max(-1.6, Math.min(1.6, pointerVx + (nextX - targetPointerX) * 4.5));
      pointerVy = Math.max(-1.2, Math.min(1.2, pointerVy + (nextY - targetPointerY) * 4.5));
      targetPointerX = nextX;
      targetPointerY = nextY;
    };

    const onPointerLeave = () => {
      targetPointerX = 0;
      targetPointerY = 0;
    };

    const onScroll = (e: Event) => {
      if (reduceMotion) return;
      const target = e.target;
      const innerScroll =
        target instanceof HTMLElement && target.classList.contains('stage-scroll')
          ? target.scrollTop
          : 0;
      targetScrollY = (window.scrollY || 0) + innerScroll * 0.65;
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(92, Math.max(44, Math.floor(w / 15)));
      flakes = Array.from({ length: count }, (_, idx) => {
        const isCrystal = idx % 10 < 3;
        const raw = Math.random();
        const depth = isCrystal ? 0.35 + raw * 0.65 : 0.1 + raw * 0.45;
        return {
          kind: isCrystal ? 'crystal' : 'distant',
          variant: idx % 3,
          depth,
          x: Math.random() * w,
          y: Math.random() * h,
          size: isCrystal ? 10 + depth * 10 : 1.3 + depth * 2.4,
          vy: isCrystal ? 0.25 + depth * 0.45 : 0.14 + depth * 0.28,
          vx: (Math.random() - 0.5) * (isCrystal ? 0.18 : 0.1),
          phase: Math.random() * Math.PI * 2,
          sway: isCrystal ? 0.18 + depth * 0.3 : 0.08 + depth * 0.16,
          angle: Math.random() * Math.PI * 2,
          spin: (Math.random() - 0.5) * 0.01,
          alpha: isCrystal ? 0.3 + depth * 0.44 : 0.22 + depth * 0.34,
        };
      });
    };

    const drawFrame = (advance: boolean) => {
      ctx.clearRect(0, 0, w, h);

      const targetOpacity = snowRef.current ? 1 : 0;
      snowOpacity += (targetOpacity - snowOpacity) * 0.08;
      if (Math.abs(targetOpacity - snowOpacity) < 0.005) {
        snowOpacity = targetOpacity;
      }

      if (advance) {
        currentPointerX += (targetPointerX - currentPointerX) * 0.06;
        currentPointerY += (targetPointerY - currentPointerY) * 0.06;
        currentScrollY += (targetScrollY - currentScrollY) * 0.08;
        pointerVx *= 0.92;
        pointerVy *= 0.92;
      }

      const pointerSpeedMag = Math.min(1, Math.hypot(pointerVx, pointerVy));
      const pad = 36;
      const spanW = w + pad * 2;
      const spanH = h + pad * 2;

      if (snowOpacity > 0.005) {
        for (let i = 0; i < flakes.length; i += 1) {
          const f = flakes[i];
          if (advance && snowRef.current) {
            const depthResponse = 0.2 + f.depth * 0.85;
            const verticalSpeedScale = Math.max(
              0.72,
              Math.min(1.38, 1 + (currentPointerY * 0.16 + Math.abs(pointerVy) * 0.24) * depthResponse)
            );
            const mouseBreezeX = (currentPointerX * 0.14 + pointerVx * 0.42) * depthResponse;

            f.phase += 0.011 * (1 + pointerSpeedMag * 0.22 * depthResponse);
            f.y += f.vy * verticalSpeedScale;
            f.x += f.vx + mouseBreezeX + Math.sin(f.phase) * f.sway;
            f.angle += f.spin * (1 + pointerSpeedMag * 0.45 * depthResponse);

            if (f.y > h + 24) {
              f.y = -24;
              f.x = Math.random() * w;
            }
            if (f.x > w + 24) f.x = -24;
            if (f.x < -24) f.x = w + 24;
          }

          // Subtle depth-weighted parallax from mouse position & scroll offset
          const parallaxFactor = 0.25 + f.depth * 1.15;
          const parallaxShiftX = advance ? -currentPointerX * 26 * parallaxFactor : 0;
          const parallaxShiftY = advance
            ? (-currentPointerY * 18 - currentScrollY * 0.16) * parallaxFactor
            : 0;

          const drawX = wrapCoord(f.x + parallaxShiftX, spanW, pad);
          const drawY = wrapCoord(f.y + parallaxShiftY, spanH, pad);

          if (f.kind === 'crystal' && sprites[f.variant]) {
            ctx.save();
            ctx.globalAlpha = f.alpha * snowOpacity;
            ctx.translate(drawX, drawY);
            ctx.rotate(f.angle);
            const half = f.size / 2;
            ctx.drawImage(sprites[f.variant], -half, -half, f.size, f.size);
            ctx.restore();
          } else if (dotSprite) {
            const radius = f.size * 2.1;
            ctx.save();
            ctx.globalAlpha = f.alpha * snowOpacity;
            ctx.drawImage(dotSprite, drawX - radius, drawY - radius, radius * 2, radius * 2);
            ctx.restore();
          }
        }
      }

      const sparks = sparksRef.current;
      for (let i = sparks.length - 1; i >= 0; i -= 1) {
        const p = sparks[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.085;
        p.vx *= 0.985;
        p.life -= p.decay;

        if (p.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    };

    const tick = () => {
      drawFrame(!reduceMotion);
      rafId = requestAnimationFrame(tick);
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave, { passive: true });
    document.addEventListener('scroll', onScroll, { capture: true, passive: true });
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      document.removeEventListener('scroll', onScroll, { capture: true });
    };
  }, []);

  return (
    <>
      {/* Ambient Liquid Light Orbs */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="orb-ruby absolute -top-[18%] -right-[12%] h-[min(62vw,520px)] w-[min(62vw,520px)] rounded-full opacity-55 blur-[86px]" />
        <div className="orb-gold absolute -bottom-[16%] -left-[10%] h-[min(54vw,460px)] w-[min(54vw,460px)] rounded-full opacity-40 blur-[86px]" />
        <div className="orb-aurora absolute top-[14%] left-1/2 h-[min(56vw,480px)] w-[min(56vw,480px)] rounded-full opacity-45 blur-[86px]" />
      </div>

      {/* Helsinki Winter Night Sky & Camouflaged Asterisms */}
      <svg
        className="pointer-events-none fixed inset-0 z-[1] h-full w-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <g>
          <circle cx="52" cy="64" r="1.0" fill="#d9eeff" opacity="0.38" />
          <circle cx="118" cy="48" r="0.8" fill="#f6ebd9" opacity="0.32" />
          <circle cx="196" cy="94" r="1.4" fill="#d9eeff" opacity="0.54" className="star-twinkle-slow" />
          <circle cx="284" cy="58" r="0.9" fill="#f6ebd9" opacity="0.40" />
          <circle cx="366" cy="112" r="1.2" fill="#d9eeff" opacity="0.44" className="star-twinkle" />
          <circle cx="448" cy="42" r="0.8" fill="#d9eeff" opacity="0.34" />
          <circle cx="536" cy="76" r="1.3" fill="#f6ebd9" opacity="0.48" className="star-twinkle-alt" />
          <circle cx="628" cy="34" r="1.1" fill="#d9eeff" opacity="0.46" />
          <circle cx="714" cy="68" r="0.9" fill="#f6ebd9" opacity="0.38" className="star-twinkle-slow" />
          <circle cx="798" cy="29" r="1.4" fill="#d9eeff" opacity="0.50" />
          <circle cx="886" cy="62" r="0.8" fill="#f6ebd9" opacity="0.36" />
          <circle cx="972" cy="46" r="1.2" fill="#d9eeff" opacity="0.46" className="star-twinkle" />
          <circle cx="1064" cy="88" r="1.0" fill="#f6ebd9" opacity="0.42" />
          <circle cx="1158" cy="44" r="1.5" fill="#d9eeff" opacity="0.56" className="star-twinkle-alt" />
          <circle cx="1248" cy="82" r="0.9" fill="#f6ebd9" opacity="0.38" />
          <circle cx="1338" cy="54" r="1.3" fill="#d9eeff" opacity="0.52" className="star-twinkle-slow" />
          <circle cx="1396" cy="118" r="0.8" fill="#f6ebd9" opacity="0.35" />
          <circle cx="48" cy="342" r="1.1" fill="#d9eeff" opacity="0.40" />
          <circle cx="96" cy="474" r="1.4" fill="#f6ebd9" opacity="0.46" className="star-twinkle" />
          <circle cx="152" cy="596" r="0.9" fill="#d9eeff" opacity="0.36" />
          <circle cx="64" cy="692" r="1.2" fill="#f6ebd9" opacity="0.42" className="star-twinkle-slow" />
          <circle cx="1194" cy="214" r="1.2" fill="#d9eeff" opacity="0.44" className="star-twinkle-alt" />
          <circle cx="1364" cy="288" r="1.4" fill="#d9eeff" opacity="0.50" className="star-twinkle" />
          <circle cx="1384" cy="686" r="1.3" fill="#f6ebd9" opacity="0.44" className="star-twinkle-slow" />
          <circle cx="344" cy="848" r="1.3" fill="#f6ebd9" opacity="0.40" className="star-twinkle" />
          <circle cx="1028" cy="834" r="1.2" fill="#f6ebd9" opacity="0.42" className="star-twinkle-alt" />
        </g>

        <g className="constellation-glow" stroke="#d9eeff" strokeWidth="0.55" strokeOpacity="0.065" fill="none">
          <polyline points="536,76 628,34 714,68 798,29" />
          <line x1="628" y1="34" x2="588" y2="92" />
          <polyline points="78,228 134,154 166,214 228,176 242,272" />
          <line x1="134" y1="154" x2="118" y2="48" />
          <line x1="228" y1="176" x2="296" y2="148" />
        </g>

        <g className="constellation-glow" stroke="#f6ebd9" strokeWidth="0.55" strokeOpacity="0.065" fill="none">
          <polyline points="1182,668 1146,554 1268,626 1236,508" />
          <line x1="1146" y1="554" x2="1088" y2="494" />
          <line x1="1236" y1="508" x2="1318" y2="462" />
        </g>
      </svg>

      {/* Slowly Rotating Golden Persian Shamseh */}
      <div className="pointer-events-none fixed inset-0 z-[1] flex items-center justify-center overflow-hidden" aria-hidden="true">
        <svg className="shamseh-svg h-[min(96vmin,780px)] w-[min(96vmin,780px)] text-[#dfb16b] opacity-[0.1]" viewBox="0 0 400 400" fill="none">
          <defs>
            <g id="bannaiTileMN" stroke="currentColor" strokeWidth="1.45" strokeLinecap="square" strokeLinejoin="miter">
              <path d="M167,69 L173,69 L173,54 L181,62 L189,54 L189,69 L197,69 L197,59 L203,59 L203,54 L217,68 L217,54 L225,54 L225,69 L233,69" />
              <path d="M173,50 L189,50 M203,50 L217,50" strokeOpacity="0.55" strokeWidth="0.9" />
              <rect x="180" y="65.5" width="1.8" height="1.8" fill="currentColor" stroke="none" />
              <rect x="208.5" y="48.5" width="1.8" height="1.8" fill="currentColor" stroke="none" />
            </g>
          </defs>
          <circle cx="200" cy="200" r="192" stroke="currentColor" strokeWidth="0.9" strokeDasharray="3 6" />
          <circle cx="200" cy="200" r="176" stroke="currentColor" strokeWidth="0.7" strokeOpacity="0.65" />
          <circle cx="200" cy="200" r="154" stroke="currentColor" strokeWidth="1.0" />
          <circle cx="200" cy="200" r="127" stroke="currentColor" strokeWidth="1.0" />
          <g>
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
              <use key={deg} href="#bannaiTileMN" transform={`rotate(${deg} 200 200)`} />
            ))}
          </g>
          <g stroke="currentColor" strokeWidth="0.95">
            <polygon points="200,76 218,133 262,93 249,151 307,138 267,182 324,200 267,218 307,262 249,249 262,307 218,267 200,324 182,267 138,307 151,249 93,262 133,218 76,200 133,182 93,138 151,151 138,93 182,133" />
            <polygon points="200,104 224,140 268,132 260,176 296,200 260,224 268,268 224,260 200,296 176,260 132,268 140,224 104,200 140,176 132,132 176,140" strokeOpacity="0.65" />
            <circle cx="200" cy="200" r="56" strokeDasharray="2 4" />
            <circle cx="200" cy="200" r="28" />
          </g>
        </svg>
      </div>

      {/* Interactive 6-Pointed Crystalline Snowfall + Depth Parallax + Step 4 Sparkles */}
      <canvas
        ref={canvasRef}
        data-testid="fx-canvas"
        className="pointer-events-none fixed inset-0 z-[2] h-full w-full"
        aria-hidden="true"
      />
    </>
  );
}
