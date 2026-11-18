import type { ReactNode } from "react";
import Link from "next/link";
import NoteToc from "@/components/NoteToc";

export interface SidebarProfile {
  avatar: string;
  bio: string;
  signature: string;
}

export interface SidebarNote {
  id: number;
  title: string;
  created_at: string;
}

interface NoteSidebarProps {
  profile: SidebarProfile | null;
  notes: SidebarNote[];
  currentId: number;
  // 头像前缀：静态站挂在 /grace-lab 下
  avatarBase?: string;
  noteId: number;
}

// 库里存的是 "2026-11-18 08:18:41"，直接 new Date 在部分浏览器会得到 Invalid Date
function formatDay(value: string) {
  const date = new Date(value.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

// 简介和时间线都还是玻璃卡，只是底色压深一档，保证白字读得清
function DeepCard({ children }: { children: ReactNode }) {
  return (
    <div className="glass-dark p-5" style={{ background: "rgba(0, 0, 0, 0.38)" }}>
      {children}
    </div>
  );
}

export default function NoteSidebar({
  profile,
  notes,
  currentId,
  noteId,
  avatarBase = "/grace-lab",
}: NoteSidebarProps) {
  const bio = (profile?.bio || "").trim();
  const avatar = profile?.avatar || "";
  const latest = notes[0];

  return (
    <aside className="flex flex-col gap-4">
      {/* 头像：不套卡片，直接浮在侧栏顶部 */}
      <div className="flex justify-center">
        {avatar ? (
          <img
            src={`${avatarBase}/uploads/${avatar}`}
            alt="author"
            draggable={false}
            className="h-20 w-20 rounded-full object-cover shadow-lg ring-2 ring-white/35"
          />
        ) : (
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white/15 text-2xl text-white/60 ring-2 ring-white/25">
            G
          </span>
        )}
      </div>

      {/* 资料卡：简介 + 签名 + 站点统计 */}
      <DeepCard>
        <p className="text-center text-base font-medium text-white/90">Grace</p>
        <p className="mt-2 whitespace-pre-line text-[13px] leading-6 text-white/80">
          {bio || "个人知识库与学习管理系统"}
        </p>

        <dl className="mt-4 space-y-2 border-t border-white/15 pt-4 text-xs leading-5">
          <div className="flex items-baseline justify-between gap-3">
            <dt className="shrink-0 text-white/45">文章总数</dt>
            <dd className="text-white/85">{notes.length} 篇</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="shrink-0 text-white/45">发布时间</dt>
            <dd className="text-white/85">{latest ? formatDay(latest.created_at) : "—"}</dd>
          </div>
        </dl>
      </DeepCard>

      {/* 目录：桌面在侧栏，窄屏的目录放在正文上方 */}
      <div className="hidden lg:block">
        <NoteToc noteId={noteId} />
      </div>

      {/* 往期文章时间线：按发布时间倒序，当前这篇高亮 */}
      <DeepCard>
        <p className="mb-4 text-[11px] tracking-[0.3em] text-white/45">往期文章</p>
        <ol className="relative ml-1 space-y-4 border-l border-white/15 pl-4">
          {notes.map((note) => {
            const active = note.id === currentId;
            return (
              <li key={note.id} className="relative">
                <span
                  aria-hidden
                  className={`absolute -left-[21px] top-1.5 h-1.5 w-1.5 rounded-full ${
                    active ? "bg-white" : "bg-white/35"
                  }`}
                />
                <Link
                  href={`/notes/${note.id}`}
                  className="group block"
                  aria-current={active ? "page" : undefined}
                >
                  <span className="block text-[11px] tracking-[0.18em] text-white/45">
                    {formatDay(note.created_at)}
                  </span>
                  <span
                    className={`mt-0.5 block text-sm leading-6 transition-colors ${
                      active ? "text-white" : "text-white/70 group-hover:text-white"
                    }`}
                  >
                    {note.title}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
        <Link
          href="/notes"
          className="mt-5 inline-block text-xs text-white/45 transition-colors hover:text-white/80"
        >
          查看全部 →
        </Link>
      </DeepCard>
    </aside>
  );
}
