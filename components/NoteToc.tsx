"use client";

import { useEffect, useState } from "react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface NoteTocProps {
  noteId: number;
  contentId?: string;
}

// 正文是 dangerouslySetInnerHTML 注入的，标题 id 只能在挂载后补；
// 目录项、当前阅读位置都在这里统一计算
export default function NoteToc({ noteId, contentId = "note-content" }: NoteTocProps) {
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const root = document.getElementById(contentId);
    if (!root) return;

    const headings = Array.from(root.querySelectorAll<HTMLElement>("h1, h2, h3, h4"));
    const next = headings.map((heading, index) => {
      if (!heading.id) heading.id = `note-sec-${noteId}-${index}`;
      return {
        id: heading.id,
        text: heading.textContent?.trim() || `第 ${index + 1} 节`,
        level: Number(heading.tagName.slice(1)),
      };
    });

    setItems(next);
    setActiveId(next[0]?.id ?? "");

    // 顶部导航栏挡住了视线上方，留 96px 让判定落在标题下方
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-96px 0px -65% 0px", threshold: 0 }
    );
    headings.forEach((heading) => observer.observe(heading));

    return () => observer.disconnect();
  }, [noteId, contentId]);

  const jump = (id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY - 96,
      behavior: "smooth",
    });
    setActiveId(id);
  };

  return (
    <div className="glass-dark p-5" style={{ background: "rgba(0, 0, 0, 0.38)" }}>
      <p className="mb-3 text-[11px] tracking-[0.3em] text-white/45">目录</p>
      {items.length === 0 ? (
        <p className="text-xs text-white/35">这篇文章没有小标题</p>
      ) : (
        <nav aria-label="文章目录">
          <ul className="space-y-1.5">
            {items.map((item) => {
              const active = item.id === activeId;
              return (
                <li key={item.id} style={{ paddingLeft: (item.level - 1) * 10 }}>
                  <button
                    type="button"
                    onClick={() => jump(item.id)}
                    aria-current={active ? "true" : undefined}
                    className={`block w-full text-left text-[13px] leading-5 transition-colors ${
                      active ? "text-white" : "text-white/55 hover:text-white"
                    }`}
                  >
                    {item.text}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </div>
  );
}
