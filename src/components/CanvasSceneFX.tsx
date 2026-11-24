import { useEffect, useRef } from 'react';

interface CanvasSceneFXProps {
  mode: 'dusk' | 'rain' | 'interior' | 'penthouse' | 'aviation';
  powerOut?: boolean;
  stoveLit?: boolean;
  shakeKey?: number;
}

export function CanvasSceneFX({ mode, powerOut = false, stoveLit = false, shakeKey = 0 }: CanvasSceneFXProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const shakeAmountRef = useRef(0);

  useEffect(() => {
    if (shakeKey > 0) {
      shakeAmountRef.current = 12;
    }
  }, [shakeKey]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let animationId = 0;
    let lastTime = performance.now();

    const particles = Array.from({ length: 68 }, () => ({
      x: Math.random(),
      y: Math.random(),
      speed: 0.25 + Math.random() * 0.75,
      size: 1 + Math.random() * 2.2,
      alpha: 0.15 + Math.random() * 0.45,
    }));

    const cars = Array.from({ length: 9 }, (_, idx) => ({
      x: Math.random(),
      y: 0.64 + (idx % 4) * 0.05,
      speed: (idx % 2 === 0 ? 1 : -1) * (0.04 + Math.random() * 0.05),
      color: idx % 2 === 0 ? 'rgba(245, 196, 81, 0.55)' : 'rgba(220, 38, 38, 0.5)',
    }));

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(canvas.clientWidth * dpr);
      canvas.height = Math.floor(canvas.clientHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      if (prefersReducedMotion) {
        return;
      }

      ctx.save();
      if (shakeAmountRef.current > 0.2) {
        const sx = (Math.random() - 0.5) * shakeAmountRef.current;
        const sy = (Math.random() - 0.5) * shakeAmountRef.current;
        ctx.translate(sx, sy);
        shakeAmountRef.current *= Math.pow(0.03, dt);
      } else {
        shakeAmountRef.current = 0;
      }

      if (mode === 'rain') {
        ctx.strokeStyle = 'rgba(186, 214, 245, 0.28)';
        ctx.lineWidth = 1.1;
        for (const p of particles) {
          p.y += p.speed * dt * 1.4;
          p.x -= p.speed * dt * 0.24;
          if (p.y > 1) {
            p.y = -0.05;
            p.x = Math.random() * 1.1;
          }
          const px = p.x * w;
          const py = p.y * h;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px - 6, py + 22);
          ctx.stroke();
        }
      } else if (mode === 'dusk') {
        // Distant Lagos bridge traffic light streaks
        for (const car of cars) {
          car.x += car.speed * dt;
          if (car.x > 1.08) car.x = -0.08;
          if (car.x < -0.08) car.x = 1.08;
          const cx = car.x * w;
          const cy = car.y * h;
          const grad = ctx.createRadialGradient(cx, cy, 1, cx, cy, 24);
          grad.addColorStop(0, car.color);
          grad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(cx, cy, 24, 0, Math.PI * 2);
          ctx.fill();
        }
        // Warm floating dust motes
        for (const p of particles.slice(0, 26)) {
          p.y -= p.speed * dt * 0.04;
          if (p.y < 0) p.y = 1;
          ctx.fillStyle = `rgba(229, 169, 60, ${p.alpha * 0.35})`;
          ctx.beginPath();
          ctx.arc(p.x * w, p.y * h, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (mode === 'interior') {
        if (powerOut) {
          ctx.fillStyle = 'rgba(5, 7, 12, 0.56)';
          ctx.fillRect(0, 0, w, h);
        }
        if (stoveLit) {
          const pulse = 0.85 + Math.sin(now * 0.018) * 0.15;
          const fx = w * 0.37;
          const fy = h * 0.65;
          const flameGrad = ctx.createRadialGradient(fx, fy, 4, fx, fy, 68 * pulse);
          flameGrad.addColorStop(0, 'rgba(56, 189, 248, 0.72)');
          flameGrad.addColorStop(0.5, 'rgba(37, 99, 235, 0.25)');
          flameGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = flameGrad;
          ctx.beginPath();
          ctx.arc(fx, fy, 68 * pulse, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (mode === 'aviation') {
        // High-altitude cloud streaks drifting past window
        for (const p of particles.slice(0, 32)) {
          p.x -= p.speed * dt * 0.18;
          if (p.x < -0.1) p.x = 1.1;
          ctx.fillStyle = `rgba(255, 243, 214, ${p.alpha * 0.16})`;
          ctx.fillRect(p.x * w, p.y * h * 0.65, 36, 1.2);
        }
      } else {
        // Penthouse subtle lagoon reflections
        for (const p of particles.slice(0, 22)) {
          p.x += Math.sin(now * 0.001 + p.y * 10) * dt * 0.01;
          ctx.fillStyle = `rgba(229, 169, 60, ${p.alpha * 0.22})`;
          ctx.beginPath();
          ctx.arc(p.x * w, p.y * h, p.size * 0.9, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
      animationId = requestAnimationFrame(tick);
    };

    animationId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, [mode, powerOut, stoveLit]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
