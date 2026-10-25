"use client";

import { useEffect, useState } from "react";

interface LiveDateProps {
  noteCount: number;
}

export default function LiveDate({ noteCount }: LiveDateProps) {
  // 初始为 null，挂载后再取当前时间，避免服务端/客户端渲染不一致（hydration 报错）
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const day = now ? String(now.getDate()).padStart(2, "0") : "--";
  const month = now ? String(now.getMonth() + 1).padStart(2, "0") : "--";
  const year = now ? String(now.getFullYear()) : "----";
  const weekday = now
    ? now.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase()
    : "---";
  const time = now ? now.toLocaleTimeString("en-GB", { hour12: false }) : "--:--:--";

  return (
    <div className="flex flex-row items-start justify-between gap-6 lg:flex-col lg:justify-start">
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
      <div className="lg:mt-8">
        <p className="text-xs text-white/40 tracking-[0.25em] uppercase">Notes</p>
        <p className="text-sm text-white/70 mt-3">
          {String(noteCount).padStart(2, "0")} 篇公开笔记
        </p>
      </div>
    </div>
  );
}
