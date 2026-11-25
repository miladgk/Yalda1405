import { useEffect, useRef } from 'react';

interface YaldaConfettiBurstProps {
  triggerKey: string;
}

type ConfettiShape = 'ribbon' | 'diamond' | 'star';

interface ConfettiPiece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  angle: number;
  spin: number;
  tilt: number;
  tiltSpeed: number;
  life: number;
  decay: number;
  gravity: number;
  drag: number;
  color: string;
  shape: ConfettiShape;
}

const YALDA_COLORS = [
  '#dfb16b', // Warm gold
  '#e8c47a', // Bright gold
  '#a61c31', // Deep Yalda ruby
  '#dc2645', // Vibrant ruby
  '#fae3bb', // Champagne cream
  '#fff5e1', // Warm ivory cream
];

export function YaldaConfettiBurst({ triggerKey }: YaldaConfettiBurstProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(280, canvas.clientWidth || 560);
    const height = Math.max(220, canvas.clientHeight || 360);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const shapes: ConfettiShape[] = ['ribbon', 'ribbon', 'diamond', 'star'];
    const particles: ConfettiPiece[] = [];

    const spawnWave = (count: number, originX: number, originY: number, spreadVy: number) => {
      for (let i = 0; i < count; i += 1) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.15;
        const speed = 2.6 + Math.random() * spreadVy;
        particles.push({
          x: originX + (Math.random() - 0.5) * 44,
          y: originY + (Math.random() - 0.5) * 18,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.6,
          w: 5 + Math.random() * 5,
          h: 2.8 + Math.random() * 3.2,
          angle: Math.random() * Math.PI * 2,
          spin: (Math.random() - 0.5) * 0.16,
          tilt: Math.random() * Math.PI * 2,
          tiltSpeed: 0.08 + Math.random() * 0.1,
          life: 1,
          decay: 0.0085 + Math.random() * 0.007,
          gravity: 0.11 + Math.random() * 0.05,
          drag: 0.975,
          color: YALDA_COLORS[Math.floor(Math.random() * YALDA_COLORS.length)],
          shape: shapes[Math.floor(Math.random() * shapes.length)],
        });
      }
    };

    // Immediate celebratory burst anchored to the ticket card area
    spawnWave(36, width * 0.5, height * 0.34, 5.2);
    spawnWave(14, width * 0.24, height * 0.42, 4.2);
    spawnWave(14, width * 0.76, height * 0.42, 4.2);

    let rafId = 0;
    const secondaryTimer = window.setTimeout(() => {
      spawnWave(18, width * 0.5, height * 0.28, 4.0);
    }, 150);

    const drawPiece = (p: ConfettiPiece) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life * 1.15));
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillStyle = p.color;

      if (p.shape === 'ribbon') {
        const flutter = 0.28 + Math.abs(Math.cos(p.tilt)) * 0.72;
        ctx.scale(1, flutter);
        ctx.beginPath();
        ctx.roundRect(-p.w / 2, -p.h / 2, p.w, p.h, 1);
        ctx.fill();
      } else if (p.shape === 'diamond') {
        const rx = p.w * 0.52;
        const ry = p.w * 0.38;
        ctx.beginPath();
        ctx.moveTo(0, -ry);
        ctx.lineTo(rx, 0);
        ctx.lineTo(0, ry);
        ctx.lineTo(-rx, 0);
        ctx.closePath();
        ctx.fill();
      } else {
        const outer = p.w * 0.55;
        const inner = outer * 0.34;
        ctx.beginPath();
        for (let i = 0; i < 8; i += 1) {
          const r = i % 2 === 0 ? outer : inner;
          const a = (Math.PI / 4) * i;
          const sx = Math.cos(a) * r;
          const sy = Math.sin(a) * r;
          if (i === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
    };

    const tick = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const p = particles[i];
        p.vx *= p.drag;
        p.vy = p.vy * p.drag + p.gravity;
        p.x += p.vx + Math.sin(p.tilt) * 0.35;
        p.y += p.vy;
        p.angle += p.spin;
        p.tilt += p.tiltSpeed;
        p.life -= p.decay;

        if (p.life <= 0 || p.y > height + 16) {
          particles.splice(i, 1);
          continue;
        }
        drawPiece(p);
      }

      if (particles.length > 0) {
        rafId = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      window.clearTimeout(secondaryTimer);
      cancelAnimationFrame(rafId);
    };
  }, [triggerKey]);

  return (
    <canvas
      ref={canvasRef}
      data-testid="ticket-confetti"
      data-pdf-ignore="true"
      aria-hidden="true"
      className="pointer-events-none absolute -inset-4 z-20 h-[calc(100%+2rem)] w-[calc(100%+2rem)]"
    />
  );
}
