"use client";

import { useEffect, useRef, useState } from "react";

type Direction = "up" | "left" | "right" | "scale";

interface Props {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  from?: Direction;
  /** Extra className on the wrapper — useful for grid-item sizing */
  className?: string;
  /** IntersectionObserver threshold (0–1) */
  threshold?: number;
}

const initial: Record<Direction, string> = {
  up:    "translateY(28px)",
  left:  "translateX(-28px)",
  right: "translateX(28px)",
  scale: "scale(0.93)",
};

export default function AnimateIn({
  children,
  delay = 0,
  duration = 620,
  from = "up",
  className = "",
  threshold = 0.12,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : initial[from],
        transition: `opacity ${duration}ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}
