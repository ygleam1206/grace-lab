"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { FileText } from "lucide-react";

interface Note {
  id: number;
  title: string;
  content: string;
  category: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

interface Category {
  id: number;
  name: string;
  cover_image: string;
  note_count: number;
}

interface NoteFeedProps {
  notes: Note[];
  categories: Category[];
  basePath: string;
}

const GRADIENTS = [
  "from-blue-500 to-purple-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-rose-600",
  "from-cyan-500 to-blue-600",
  "from-pink-500 to-violet-600",
  "from-amber-500 to-orange-600",
];

// 自动滚动速度（px/秒）
const AUTO_SCROLL_SPEED = 35;

function getGradient(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

// 笔记无独立封面：优先取正文第一张上传图片，其次借分类封面
function extractCover(note: Note, categories: Category[], basePath: string): string | null {
  const match = note.content.match(/\/uploads\/([^\s"'<>)]+\.(?:jpg|jpeg|png|gif|webp|svg))/i);
  if (match) return `${basePath}/uploads/${match[1]}`;
  const cat = categories.find((c) => c.name === note.category);
  if (cat?.cover_image) return `${basePath}/uploads/${cat.cover_image}`;
  return null;
}

function stripHtml(html: string) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default function NoteFeed({ notes, categories, basePath }: NoteFeedProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  // 无限滚动：列表渲染两份，滚过第一份的高度后无缝回跳
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || notes.length === 0) return;

    const mq = window.matchMedia("(min-width: 1024px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    let raf = 0;
    let last = performance.now();
    let hovered = false;
    let period = 0;
    let canLoop = false;

    const measure = () => {
      const first = el.firstElementChild as HTMLElement | null;
      const second = el.children[1] as HTMLElement | null;
      period = first && second ? second.offsetTop - first.offsetTop : 0;
      canLoop = period > 0 && el.scrollHeight - el.clientHeight >= period;
    };
    measure();

    const onEnter = () => {
      hovered = true;
    };
    const onLeave = () => {
      hovered = false;
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (mq.matches && !hovered && canLoop) {
        el.scrollTop += AUTO_SCROLL_SPEED * dt;
        if (el.scrollTop >= period) el.scrollTop -= period;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("resize", measure);
    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [notes.length]);

  if (notes.length === 0) {
    return <div className="text-center text-white/50 py-8">还没有公开笔记</div>;
  }

  const renderCards = (copy: number) =>
    notes.map((note, index) => {
      const cover = extractCover(note, categories, basePath);
      const gradient = getGradient(note.category || note.title);
      const preview = stripHtml(note.content);
      const order = String((index % notes.length) + 1).padStart(2, "0");

      return (
        <Link key={`${copy}-${note.id}`} href={`/notes/${note.id}`} className="group block shrink-0">
          <div className="relative h-[260px] sm:h-[320px] rounded-3xl overflow-hidden shadow-2xl">
            {cover ? (
              <img
                src={cover}
                alt={note.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                draggable={false}
              />
            ) : (
              <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`}>
                <FileText size={64} className="absolute inset-0 m-auto text-white/25" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
            <span className="absolute top-5 right-6 text-xs tracking-[0.3em] text-white/60">
              N.{order}
            </span>
            <div className="absolute inset-x-0 bottom-0 p-6">
              <h3 className="text-2xl font-bold text-white">{note.title}</h3>
              {preview && (
                <p className="text-sm text-white/70 mt-2 line-clamp-2 max-w-lg">{preview}</p>
              )}
              <div className="flex items-center gap-3 mt-3 text-xs text-white/50">
                {note.category && <span>{note.category}</span>}
                <span>{note.created_at.slice(0, 10)}</span>
              </div>
            </div>
          </div>
        </Link>
      );
    });

  return (
    <div
      ref={scrollerRef}
      data-note-feed
      className="relative flex flex-col order-3 gap-6 lg:order-2 lg:gap-8 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:pr-2 pb-2 scrollbar-hide"
    >
      <div className="flex flex-col gap-6 lg:gap-8">{renderCards(0)}</div>
      {/* 第二份列表用于无缝循环，仅桌面端渲染 */}
      <div aria-hidden className="hidden lg:flex flex-col gap-6 lg:gap-8">
        {renderCards(1)}
      </div>
    </div>
  );
}
