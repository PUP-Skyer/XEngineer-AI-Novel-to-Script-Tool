import { useEffect, useRef } from 'react';

interface MagicRingsProps {
  color?: string;
  colorTwo?: string;
  ringCount?: number;
  speed?: number;
  opacity?: number;
  followMouse?: boolean;
  parallax?: boolean;
}

interface Ring {
  x: number;
  y: number;
  radius: number;
  angle: number;
  speed: number;
  direction: number;
  width: number;
}

export default function MagicRings({
  color = '#a855f7',
  colorTwo = '#6366f1',
  ringCount = 5,
  speed = 0.3,
  opacity = 0.4,
  followMouse = true,
  parallax = true,
}: MagicRingsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const ringsRef = useRef<Ring[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    // Initialize rings
    const initRings = () => {
      ringsRef.current = Array.from({ length: ringCount }, (_, i) => ({
        x: width / 2,
        y: height / 2,
        radius: 80 + i * 60,
        angle: (Math.PI * 2 * i) / ringCount,
        speed: speed * (0.5 + Math.random() * 0.5),
        direction: i % 2 === 0 ? 1 : -1,
        width: 1.5 + Math.random() * 1.5,
      }));
    };

    const drawRing = (ring: Ring, time: number) => {
      const centerX = parallax
        ? ring.x + (mouseRef.current.x - width / 2) * 0.02 * (ringCount - ringsRef.current.indexOf(ring))
        : ring.x;
      const centerY = parallax
        ? ring.y + (mouseRef.current.y - height / 2) * 0.02 * (ringCount - ringsRef.current.indexOf(ring))
        : ring.y;

      ctx.beginPath();
      ctx.ellipse(centerX, centerY, ring.radius, ring.radius * 0.6, ring.angle + time * ring.speed * ring.direction, 0, Math.PI * 2);
      ctx.strokeStyle = ringsRef.current.indexOf(ring) % 2 === 0 ? color : colorTwo;
      ctx.lineWidth = ring.width;
      ctx.globalAlpha = opacity * (0.5 + 0.5 * Math.sin(time * 0.5 + ringsRef.current.indexOf(ring)));
      ctx.stroke();

      // Glow effect
      ctx.shadowColor = ringsRef.current.indexOf(ring) % 2 === 0 ? color : colorTwo;
      ctx.shadowBlur = 15;
      ctx.stroke();
      ctx.shadowBlur = 0;
    };

    const animate = (time: number) => {
      ctx.clearRect(0, 0, width, height);
      ctx.globalAlpha = 1;

      ringsRef.current.forEach((ring) => {
        ring.x += (mouseRef.current.x - ring.x) * (followMouse ? 0.01 : 0);
        ring.y += (mouseRef.current.y - ring.y) * (followMouse ? 0.01 : 0);
        drawRing(ring, time * 0.001);
      });

      animationId = requestAnimationFrame(animate);
    };

    resize();
    initRings();

    window.addEventListener('resize', resize);
    if (followMouse) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [color, colorTwo, ringCount, speed, opacity, followMouse, parallax]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity }}
    />
  );
}
