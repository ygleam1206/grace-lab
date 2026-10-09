"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, FolderOpen } from "lucide-react";

interface Category {
  id: number;
  name: string;
  cover_image: string;
  note_count: number;
}

// 默认封面渐变色
const DEFAULT_GRADIENTS = [
  "from-blue-500 to-purple-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-rose-600",
  "from-cyan-500 to-blue-600",
  "from-pink-500 to-violet-600",
  "from-amber-500 to-orange-600",
];

function getGradient(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return DEFAULT_GRADIENTS[Math.abs(hash) % DEFAULT_GRADIENTS.length];
}

export default function NoteGallery() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState<"left" | "right">("right");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCategories(data.categories || []);
      } catch {
        // 静默处理
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // 自动轮播
  useEffect(() => {
    if (!isAutoPlaying || categories.length <= 1) return;

    const timer = setInterval(() => {
      setDirection("right");
      setActiveIndex((prev) => (prev + 1) % categories.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [isAutoPlaying, categories.length]);

  const goTo = useCallback(
    (index: number) => {
      setDirection(index > activeIndex ? "right" : "left");
      setActiveIndex(index);
      setIsAutoPlaying(false);
      // 5 秒后恢复自动播放
      setTimeout(() => setIsAutoPlaying(true), 5000);
    },
    [activeIndex]
  );

  const goPrev = useCallback(() => {
    setDirection("left");
    setActiveIndex((prev) => (prev - 1 + categories.length) % categories.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  }, [categories.length]);

  const goNext = useCallback(() => {
    setDirection("right");
    setActiveIndex((prev) => (prev + 1) % categories.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  }, [categories.length]);

  if (loading) {
    return <div className="text-center text-white/50 py-8">加载中...</div>;
  }

  if (categories.length === 0) {
    return (
      <div className="text-center text-white/50 py-8">
        还没有分类，去知识库创建第一个吧
      </div>
    );
  }

  // 计算每张卡片的位置和样式
  const getCardStyle = (index: number) => {
    const diff = (index - activeIndex + categories.length) % categories.length;
    const total = categories.length;

    // 处理负数情况
    const normalizedDiff = diff > total / 2 ? diff - total : diff;

    // 卡片宽度 480px，使用固定像素值避免百分比在 scale 时抖动
    const CARD_WIDTH = 480;

    if (normalizedDiff === 0) {
      // 当前激活卡片
      return {
        transform: "translateX(0) scale(1)",
        opacity: 1,
        zIndex: 30,
        filter: "brightness(1)",
      };
    } else if (Math.abs(normalizedDiff) === 1) {
      // 相邻卡片
      return {
        transform: `translateX(${normalizedDiff * CARD_WIDTH * 0.85}px) scale(0.85)`,
        opacity: 0.7,
        zIndex: 20,
        filter: "brightness(0.7)",
      };
    } else if (Math.abs(normalizedDiff) === 2) {
      // 隔一张的卡片
      return {
        transform: `translateX(${normalizedDiff * CARD_WIDTH * 0.7}px) scale(0.7)`,
        opacity: 0.4,
        zIndex: 10,
        filter: "brightness(0.5)",
      };
    } else {
      // 更远的卡片 - 隐藏
      return {
        transform: `translateX(${normalizedDiff * CARD_WIDTH * 0.6}px) scale(0.5)`,
        opacity: 0,
        zIndex: 0,
        filter: "brightness(0.3)",
      };
    }
  };

  return (
    <div className="relative" style={{ isolation: "isolate" }}>
      {/* 3D 透视容器 */}
      <div className="relative h-[400px] flex items-center justify-center overflow-hidden px-4">
        {/* 背景光晕 */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-96 h-96 rounded-full bg-white/5 blur-3xl" />
        </div>

        {/* 卡片容器 */}
        <div className="relative w-full max-w-5xl h-full flex items-center justify-center">
          {categories.map((cat, index) => {
            const style = getCardStyle(index);
            const coverUrl = cat.cover_image ? `/uploads/${cat.cover_image}` : null;
            const gradient = getGradient(cat.name);
            const isActive = index === activeIndex;

            return (
              <div
                key={cat.id}
                className="absolute"
                style={{
                  ...style,
                  width: "480px",
                  height: "300px",
                  transformOrigin: "center center",
                  transition: "transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.6s ease-out, filter 0.6s ease-out",
                  willChange: "transform, opacity",
                }}
              >
                {isActive ? (
                  <Link
                    href={`/notes/c/${encodeURIComponent(cat.name)}`}
                    className="block w-full h-full"
                  >
                    <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl group/card cursor-pointer">
                      {/* 封面背景 */}
                      {coverUrl ? (
                        <img
                          src={coverUrl}
                          alt={cat.name}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                          draggable={false}
                        />
                      ) : (
                        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                          <FolderOpen size={56} className="text-white/30" />
                        </div>
                      )}

                      {/* 遮罩 */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                      {/* 内容 */}
                      <div className="absolute inset-0 flex flex-col justify-end p-6">
                        <h3 className="text-2xl font-bold text-white mb-2">
                          {cat.name}
                        </h3>
                        <p className="text-base text-white/80">
                          {cat.note_count} 篇笔记
                        </p>
                        <div className="mt-3 flex items-center gap-2 text-sm text-white/60">
                          <span>点击进入</span>
                          <ChevronRight size={14} />
                        </div>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div
                    className="relative w-full h-full rounded-3xl overflow-hidden shadow-xl cursor-pointer"
                    onClick={() => goTo(index)}
                  >
                    {/* 封面背景 */}
                    {coverUrl ? (
                      <img
                        src={coverUrl}
                        alt={cat.name}
                        className="absolute inset-0 w-full h-full object-cover"
                        draggable={false}
                      />
                    ) : (
                      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                        <FolderOpen size={48} className="text-white/30" />
                      </div>
                    )}

                    {/* 遮罩 */}
                    <div className="absolute inset-0 bg-black/50" />

                    {/* 内容 */}
                    <div className="absolute inset-0 flex flex-col justify-end p-5">
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {cat.name}
                      </h3>
                      <p className="text-sm text-white/70">
                        {cat.note_count} 篇笔记
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 左右箭头 */}
        <button
          onClick={goPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-40 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={goNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-40 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* 底部指示器 */}
      <div className="flex justify-center items-center gap-3 mt-6">
        {/* 进度条 */}
        <div className="flex gap-1.5">
          {categories.map((_, index) => (
            <button
              key={index}
              onClick={() => goTo(index)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                index === activeIndex
                  ? "w-8 bg-white/80"
                  : "w-1.5 bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>

        {/* 自动播放指示 */}
        <div className="ml-3 flex items-center gap-1.5 text-xs text-white/40">
          <div className={`w-1.5 h-1.5 rounded-full ${isAutoPlaying ? "bg-green-400 animate-pulse" : "bg-white/30"}`} />
          <span>{isAutoPlaying ? "自动播放中" : "已暂停"}</span>
        </div>
      </div>
    </div>
  );
}
