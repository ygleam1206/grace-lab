"use client";

import GlassCard from "./GlassCard";

interface HeatMapProps {
  data: { study_date: string; total_duration: number }[];
}

export default function HeatMap({ data }: HeatMapProps) {
  // 生成最近 52 周（364 天）的网格
  const weeks = 52;
  const days = 7;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 将数据转为 Map
  const dataMap = new Map<string, number>();
  data.forEach((d) => dataMap.set(d.study_date, d.total_duration));

  // 计算最大时长用于颜色映射
  const maxDuration = Math.max(...data.map((d) => d.total_duration), 1);

  // 生成日期网格
  const cells: { date: string; duration: number; day: number }[] = [];
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - (weeks * 7 - 1));
  // 调整到周日开始
  startDate.setDate(startDate.getDate() - startDate.getDay());

  for (let i = 0; i < weeks * 7; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    cells.push({
      date: dateStr,
      duration: dataMap.get(dateStr) || 0,
      day: d.getDay(),
    });
  }

  const getColor = (duration: number) => {
    if (duration === 0) return "bg-white/5";
    const intensity = duration / maxDuration;
    if (intensity < 0.25) return "bg-green-400/40";
    if (intensity < 0.5) return "bg-green-400/60";
    if (intensity < 0.75) return "bg-green-400/80";
    return "bg-green-400";
  };

  // 按周分组
  const weekColumns: typeof cells[] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weekColumns.push(cells.slice(i, i + 7));
  }

  return (
    <GlassCard>
      <h3 className="text-xl font-semibold mb-4">学习热力图</h3>
      <div className="overflow-x-auto">
        <div className="flex gap-[3px] min-w-fit">
          {weekColumns.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((cell, di) => (
                <div
                  key={`${wi}-${di}`}
                  className={`w-3 h-3 rounded-sm ${getColor(cell.duration)} transition-colors`}
                  title={`${cell.date}: ${Math.floor(cell.duration / 60)}分钟`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3 text-xs text-white/50">
        <span>少</span>
        <div className="w-3 h-3 rounded-sm bg-white/5" />
        <div className="w-3 h-3 rounded-sm bg-green-400/40" />
        <div className="w-3 h-3 rounded-sm bg-green-400/60" />
        <div className="w-3 h-3 rounded-sm bg-green-400/80" />
        <div className="w-3 h-3 rounded-sm bg-green-400" />
        <span>多</span>
      </div>
    </GlassCard>
  );
}
