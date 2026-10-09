"use client";

import { useEffect, useState } from "react";

interface Particle {
  id: number;
  top: string;
  left: string;
  size: number;
  breathDuration: number;
  breathDelay: number;
  floatDuration: number;
  floatDelay: number;
  floatPath: string;
  color: string;
}

const COLORS = [
  "rgba(200, 180, 255, 0.85)",  // 淡紫
  "rgba(160, 200, 255, 0.80)",  // 淡蓝
  "rgba(255, 180, 220, 0.75)",  // 淡粉
  "rgba(180, 255, 220, 0.70)",  // 淡绿
  "rgba(255, 220, 180, 0.75)",  // 淡橙
];

export default function FloatingParticles() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const generated: Particle[] = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: 2 + Math.random() * 5,
      breathDuration: 3 + Math.random() * 5,
      breathDelay: Math.random() * -10,
      floatDuration: 15 + Math.random() * 25,
      floatDelay: Math.random() * -20,
      floatPath: `float${Math.floor(Math.random() * 4) + 1}`,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));
    setParticles(generated);
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-[-10] overflow-hidden mix-blend-screen">
      <style>{`
        @keyframes particleBreath {
          0%, 100% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
            box-shadow: 0 0 10px 3px var(--glow-color), 0 0 20px 6px var(--glow-color-soft);
          }
        }

        @keyframes float1 {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(10vw, -15vh); }
          66% { transform: translate(-5vw, -20vh); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(-12vw, 10vh); }
          66% { transform: translate(8vw, 15vh); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(15vw, 15vh); }
          66% { transform: translate(-10vw, 5vh); }
        }
        @keyframes float4 {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(-15vw, -10vh); }
          66% { transform: translate(10vw, -15vh); }
        }
      `}</style>

      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute"
          style={{
            top: p.top,
            left: p.left,
            animation: `${p.floatPath} ${p.floatDuration}s ease-in-out infinite`,
            animationDelay: `${p.floatDelay}s`,
          }}
        >
          <div
            className="rounded-full"
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              ["--glow-color" as string]: p.color.replace(/[\d.]+\)$/, "0.6)"),
              ["--glow-color-soft" as string]: p.color.replace(/[\d.]+\)$/, "0.3)"),
              animation: `particleBreath ${p.breathDuration}s ease-in-out infinite`,
              animationDelay: `${p.breathDelay}s`,
            }}
          />
        </div>
      ))}
    </div>
  );
}
