"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Clock, Flame, Calendar } from "lucide-react";
import Link from "next/link";
import GlassCard from "@/components/GlassCard";
import HeatMap from "@/components/HeatMap";
import StudyPieChart from "@/components/StudyPieChart";
import { formatDuration } from "@/lib/utils";

interface Stats {
  todayTotal: number;
  weekTotal: number;
  monthTotal: number;
  periodTotal: number;
  streak: number;
  heatmap: { study_date: string; total_duration: number }[];
  topics: { topic: string; total_duration: number; count: number }[];
}

const PERIODS = [
  { key: "today", label: "今日" },
  { key: "week", label: "本周" },
  { key: "month", label: "本月" },
  { key: "all", label: "全部" },
] as const;

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("all");

  const fetchStats = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/stats?period=${period}`);
    const data = await res.json();
    setStats(data);
    setLoading(false);
  }, [period]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return <div className="text-center text-white/50 py-20">加载中...</div>;
  }
  if (!stats) return null;

  return (
    <div>
      <Link
        href="/study"
        className="flex items-center gap-1 text-white/60 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> 返回学习记录
      </Link>

      <h1 className="text-3xl font-bold mb-8">学习统计</h1>

      {/* 统计概览 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <GlassCard>
          <div className="flex items-center gap-3">
            <Clock size={24} className="text-blue-300" />
            <div>
              <p className="text-xs text-white/50">今日学习</p>
              <p className="text-xl font-bold">{formatDuration(stats.todayTotal)}</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-3">
            <Calendar size={24} className="text-purple-300" />
            <div>
              <p className="text-xs text-white/50">本周学习</p>
              <p className="text-xl font-bold">{formatDuration(stats.weekTotal)}</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-3">
            <Calendar size={24} className="text-pink-300" />
            <div>
              <p className="text-xs text-white/50">本月学习</p>
              <p className="text-xl font-bold">{formatDuration(stats.monthTotal)}</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-3">
            <Flame size={24} className="text-orange-300" />
            <div>
              <p className="text-xs text-white/50">连续学习</p>
              <p className="text-xl font-bold">{stats.streak} 天</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* 周期切换 + 饼图 */}
      <div className="mb-6">
        <div className="flex justify-center mb-4">
          <div className="glass !p-1 inline-flex rounded-full">
            {PERIODS.map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`px-5 py-1.5 rounded-full text-sm transition-all ${
                  period === p.key
                    ? "bg-white/25 font-semibold"
                    : "text-white/50 hover:text-white/80"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <StudyPieChart data={stats.topics} totalDuration={stats.periodTotal} />
      </div>

      {/* 热力图 */}
      <HeatMap data={stats.heatmap} />
    </div>
  );
}
