import React, { useEffect, useRef } from 'react';

interface BackgroundEffectProps {
  mode?: 'matrix' | 'radar' | 'grid';
}

export const BackgroundEffect: React.FC<BackgroundEffectProps> = ({ mode = 'matrix' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Matrix characters
    const chars = '0123456789ABCDEFHIJKLMNOPQRSTUVWXYZΨΩΞλπ';
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = Array(columns).fill(1);

    let angle = 0;

    const draw = () => {
      // Semi-transparent black to create fade trail
      ctx.fillStyle = 'rgba(2, 8, 4, 0.12)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (mode === 'matrix') {
        ctx.fillStyle = '#00ff6633';
        ctx.font = `${fontSize}px 'Share Tech Mono', monospace`;

        for (let i = 0; i < drops.length; i++) {
          const char = chars[Math.floor(Math.random() * chars.length)];
          const x = i * fontSize;
          const y = drops[i] * fontSize;

          // Occasionally draw a brighter lead character
          if (Math.random() > 0.95) {
            ctx.fillStyle = '#ffffff88';
            ctx.fillText(char, x, y);
            ctx.fillStyle = '#00ff6633';
          } else {
            ctx.fillText(char, x, y);
          }

          if (y > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
          }
          drops[i]++;
        }
      } else if (mode === 'radar') {
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const radius = Math.min(cx, cy) * 0.75;

        // Draw concentric circles
        ctx.strokeStyle = 'rgba(0, 255, 102, 0.08)';
        ctx.lineWidth = 1;
        for (let r = 50; r <= radius; r += 70) {
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Crosshairs
        ctx.beginPath();
        ctx.moveTo(cx - radius, cy);
        ctx.lineTo(cx + radius, cy);
        ctx.moveTo(cx, cy - radius);
        ctx.lineTo(cx, cy + radius);
        ctx.stroke();

        // Sweeping radar beam
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);

        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
        gradient.addColorStop(0, 'rgba(0, 255, 102, 0.15)');
        gradient.addColorStop(1, 'rgba(0, 255, 102, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, 0, Math.PI / 4);
        ctx.lineTo(0, 0);
        ctx.fill();

        ctx.restore();
        angle += 0.015;
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, [mode]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <canvas ref={canvasRef} className="w-full h-full block" />
      {/* Central insignia watermark matching the video NSA cyber emblem style */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none">
        <svg viewBox="0 0 200 200" className="w-[500px] h-[500px] text-[#00ff66]">
          <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" strokeWidth="4" />
          <circle cx="100" cy="100" r="75" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4,4" />
          <polygon points="100,25 120,70 175,75 135,115 145,170 100,140 55,170 65,115 25,75 80,70" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>
    </div>
  );
};
