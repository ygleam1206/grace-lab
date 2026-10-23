"use client";

import { useEffect, useState } from "react";

interface LiveDateProps {
  noteCount: number;
}

export default function LiveDate({ noteCount }: LiveDateProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  const weekday = now.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
  const time = now.toLocaleTimeString("en-GB", { hour12: false });

  return (
    <div className="flex flex-row order-2 items-start justify-between gap-6 lg:flex-col lg:order-3 lg:justify-start lg:h-full">
      {/* 实时日期 */}
      <div>
        <p className="text-xs text-white/40 tracking-[0.25em] uppercase">Local Time</p>
        <p className="text-5xl xl:text-6xl font-bold tracking-tight mt-4">
          {day}
          <span className="text-white/40 mx-1">/</span>
          {month}
        </p>
        <p className="text-sm text-white/50 mt-3">
          {year} · {weekday}
        </p>
        <p className="text-sm text-white/70 mt-1 tabular-nums tracking-wider">{time}</p>
      </div>

      {/* 笔记数 */}
      <div className="lg:mt-auto">
        <p className="text-xs text-white/40 tracking-[0.25em] uppercase">Notes</p>
        <p className="text-sm text-white/70 mt-3">
          {String(noteCount).padStart(2, "0")} 篇公开笔记
        </p>
      </div>
    </div>
  );
}
