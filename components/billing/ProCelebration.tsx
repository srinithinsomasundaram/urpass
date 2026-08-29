"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Crown, Star } from "lucide-react";

interface Particle {
  id: number;
  tx: string;
  ty: string;
  size: number;
  color: string;
  duration: number;
  delay: number;
  top: string;
  left: string;
}

const COLORS = [
  "#F59E0B", "#FCD34D", "#FDE68A", "#FBBF24",
  "#F97316", "#ffffff", "#FEF3C7", "#D97706",
];

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

export default function ProCelebration() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isUpgraded = searchParams.get("upgraded") === "true";
  const [exiting, setExiting] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const [particles] = useState<Particle[]>(() =>
    Array.from({ length: 28 }, (_, i) => {
      const angle = (i / 28) * 360 + randomBetween(-8, 8);
      const rad = (angle * Math.PI) / 180;
      const distance = randomBetween(120, 280);
      return {
        id: i,
        tx: `${Math.cos(rad) * distance}px`,
        ty: `${Math.sin(rad) * distance}px`,
        size: randomBetween(5, 12),
        color: COLORS[i % COLORS.length],
        duration: randomBetween(700, 1300),
        delay: randomBetween(0, 180),
        top: "50%",
        left: "50%",
      };
    })
  );

  useEffect(() => {
    if (!isUpgraded || dismissed) return;

    const exitT = setTimeout(() => setExiting(true), 2800);
    const hideT = setTimeout(() => {
      setDismissed(true);
      router.replace("/billing", { scroll: false });
    }, 3500);

    return () => {
      clearTimeout(exitT);
      clearTimeout(hideT);
    };
  }, [isUpgraded, dismissed, router]);

  if (!isUpgraded || dismissed) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: exiting ? "rgba(0,0,0,0)" : "rgba(0,0,0,0.75)",
        backdropFilter: exiting ? "blur(0px)" : "blur(6px)",
        transition: "background 0.5s ease, backdrop-filter 0.5s ease",
      }}
    >
      {/* Expanding rings */}
      {[0, 150, 300].map((delay) => (
        <div
          key={delay}
          className="absolute rounded-full border"
          style={{
            width: 80,
            height: 80,
            top: "50%",
            left: "50%",
            borderColor: "rgba(245, 158, 11, 0.6)",
            animation: `ring-expand 1.2s cubic-bezier(0.2, 0, 0.8, 1) ${delay}ms both`,
          }}
        />
      ))}

      {/* Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: p.size,
            height: p.size,
            top: p.top,
            left: p.left,
            marginTop: -p.size / 2,
            marginLeft: -p.size / 2,
            background: p.color,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}80`,
            "--tx": p.tx,
            "--ty": p.ty,
            animation: `particle-fly ${p.duration}ms cubic-bezier(0.2, 0, 0.6, 1) ${p.delay}ms both`,
          } as React.CSSProperties}
        />
      ))}

      {/* Main card */}
      <div
        className="relative flex flex-col items-center gap-6 px-10 py-10 rounded-3xl mx-4 max-w-sm w-full"
        style={{
          background: "linear-gradient(145deg, #1c1917 0%, #292524 100%)",
          border: "1px solid rgba(245,158,11,0.35)",
          boxShadow: "0 0 80px rgba(245,158,11,0.2), 0 0 160px rgba(245,158,11,0.08), inset 0 1px 0 rgba(255,255,255,0.06)",
          animation: exiting
            ? "pro-card-out 0.5s cubic-bezier(0.4, 0, 1, 1) both"
            : "pro-card-in 0.65s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both",
        }}
      >
        {/* Glow overlay inside card */}
        <div
          className="absolute inset-0 rounded-3xl pointer-events-none opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 70% 50% at 50% 0%, #F59E0B, transparent)",
          }}
        />

        {/* Crown icon */}
        <div
          className="relative w-20 h-20 rounded-2xl flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #F59E0B, #B45309)",
            boxShadow: "0 0 40px rgba(245,158,11,0.5), 0 0 80px rgba(245,158,11,0.2)",
          }}
        >
          <Crown className="w-10 h-10 text-white" />
        </div>

        {/* Text */}
        <div className="relative text-center flex flex-col items-center gap-2">
          <p
            className="text-[10px] font-bold tracking-widest uppercase"
            style={{ color: "#F59E0B" }}
          >
            Plan upgraded
          </p>
          <div className="flex items-center gap-2.5">
            <Star
              className="w-4 h-4 shrink-0"
              style={{
                color: "#F59E0B",
                animation: "star-spin 2s linear infinite",
              }}
            />
            <span className="text-2xl font-black tracking-tight text-white">
              PRO UNLOCKED
            </span>
            <Star
              className="w-4 h-4 shrink-0"
              style={{
                color: "#F59E0B",
                animation: "star-spin 2s linear infinite 1s",
              }}
            />
          </div>
          <p className="text-xs text-white/40 leading-relaxed mt-1">
            Unlimited events · 2 000 attendees · Custom branding · Data export
          </p>
        </div>

        {/* Gold PRO badge */}
        <div
          className="relative flex items-center gap-2 px-5 py-2 rounded-full border"
          style={{
            background: "linear-gradient(135deg, #FEF3C7, #FDE68A)",
            borderColor: "#F59E0B40",
          }}
        >
          <Crown className="w-3.5 h-3.5 text-amber-700" />
          <span className="text-xs font-black tracking-widest uppercase text-amber-700">
            PRO
          </span>
        </div>
      </div>
    </div>
  );
}
