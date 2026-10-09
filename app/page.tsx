"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Clock, Flame, FileText } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import HeroTitle from "@/components/HeroTitle";
import NoteGallery from "@/components/NoteGallery";
import { formatDuration } from "@/lib/utils";

interface DashboardData {
  noteCount: number;
  fileCount: number;
  todayStudy: number;
  streak: number;
}

export default function HomePage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [notesRes, statsRes, filesRes] = await Promise.all([
          fetch("/api/notes"),
          fetch("/api/stats"),
          fetch("/api/files"),
        ]);
        const notes = await notesRes.json();
        const stats = await statsRes.json();
        const files = await filesRes.json();

        setData({
          noteCount: notes.length,
          fileCount: files.length,
          todayStudy: stats.todayTotal || 0,
          streak: stats.streak || 0,
        });
      } catch {
        // 首次启动时数据库为空
        setData({ noteCount: 0, fileCount: 0, todayStudy: 0, streak: 0 });
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="text-center text-white/50 py-20">加载中...</div>;
  }

  return (
    <div>
      {/* Hero 标题排版 */}
      <HeroTitle />

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link href="/notes">
          <GlassCard hover className="text-center">
            <BookOpen size={28} className="mx-auto mb-2 text-blue-300" />
            <p className="text-2xl font-bold">{data?.noteCount || 0}</p>
            <p className="text-xs text-white/50">笔记</p>
          </GlassCard>
        </Link>
        <Link href="/files">
          <GlassCard hover className="text-center">
            <FileText size={28} className="mx-auto mb-2 text-purple-300" />
            <p className="text-2xl font-bold">{data?.fileCount || 0}</p>
            <p className="text-xs text-white/50">文件</p>
          </GlassCard>
        </Link>
        <Link href="/study">
          <GlassCard hover className="text-center">
            <Clock size={28} className="mx-auto mb-2 text-green-300" />
            <p className="text-2xl font-bold">{formatDuration(data?.todayStudy || 0)}</p>
            <p className="text-xs text-white/50">今日学习</p>
          </GlassCard>
        </Link>
        <Link href="/study/stats">
          <GlassCard hover className="text-center">
            <Flame size={28} className="mx-auto mb-2 text-orange-300" />
            <p className="text-2xl font-bold">{data?.streak || 0}</p>
            <p className="text-xs text-white/50">连续天数</p>
          </GlassCard>
        </Link>
      </div>

      {/* 分类文件夹展示 */}
      <NoteGallery />
    </div>
  );
}
