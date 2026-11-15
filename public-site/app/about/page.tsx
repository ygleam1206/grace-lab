import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Quote } from "lucide-react";
import notesData from "../notes.json";
import profileData from "../profile.json";

// 静态导出没有 API，图片必须手动加 basePath 前缀
const BASE_PATH = "/grace-lab";

interface Note {
  id: number;
  title: string;
  category: string;
  created_at: string;
}

interface Profile {
  avatar: string;
  bio: string;
  signature: string;
}

const profile = profileData as Profile;
const notes = (notesData as Note[])
  .slice()
  .sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));

export const metadata: Metadata = {
  title: "About me | Grace's Blog",
  description: profile.bio || "个人知识库与学习管理系统",
};

export default function AboutPage() {
  return (
    <div>
      {/* 标题（静态站只读，没有编辑入口） */}
      <div className="mt-4 mb-10">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold italic leading-tight">
          Welcome to my Blog!
        </h1>
      </div>

      {/* 头像 + 简介 + 个性签名 */}
      <div className="grid gap-10 lg:gap-14 lg:grid-cols-[300px_minmax(0,1fr)] items-start">
        {/* 圆形头像：没有上传头像时用首字母占位 */}
        <div className="mx-auto lg:mx-0 w-[220px] h-[220px] sm:w-[260px] sm:h-[260px] lg:w-[300px] lg:h-[300px] rounded-full overflow-hidden bg-white/15 backdrop-blur ring-1 ring-white/20">
          {profile.avatar ? (
            <img
              src={`${BASE_PATH}/uploads/${profile.avatar}`}
              alt="头像"
              className="w-full h-full object-cover"
              draggable={false}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl font-bold italic text-white/30">
              G
            </div>
          )}
        </div>

        {/* 右侧文字区 */}
        <div>
          <div className="border-l-2 border-white/25 pl-6">
            <p className="text-white/80 leading-loose whitespace-pre-wrap text-[15px]">
              {profile.bio || "个人知识库与学习管理系统"}
            </p>
          </div>

          {/* 个性签名：没写就整块不显示，避免线上留一句占位话 */}
          {profile.signature && (
            <div className="glass mt-8 p-5 flex gap-4 items-start rounded-2xl">
              <Quote size={20} className="text-white/40 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] tracking-[0.2em] text-white/40 uppercase"></p>
                <p className="mt-1.5 text-[15px] italic text-white/75 leading-relaxed break-words">
                  {profile.signature}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 时间轴：公开文章按发布时间倒序 */}
      <section className="mt-20">
        <div className="flex items-end justify-between mb-8">
          <h2 className="text-2xl font-bold italic">时间线</h2>
          <p className="text-xs text-white/40">{notes.length} 篇文章</p>
        </div>

        {notes.length === 0 ? (
          <div className="glass p-8 text-center text-white/50 text-sm rounded-2xl">还没有公开文章</div>
        ) : (
          <ol className="relative border-l border-white/15 ml-2">
            {notes.map((note) => (
              <li key={note.id} className="relative pl-8 pb-9 last:pb-0">
                <span className="absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full bg-white/70 ring-4 ring-white/10" />
                <div className="flex items-center gap-2 text-xs text-white/40">
                  <CalendarDays size={12} />
                  {note.created_at?.slice(0, 10)}
                  {note.category && (
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-white/60">{note.category}</span>
                  )}
                </div>
                <Link
                  href={`/notes/${note.id}`}
                  className="mt-1.5 inline-block text-lg font-medium text-white/85 hover:text-white hover:underline decoration-white/30 underline-offset-4 transition-colors"
                >
                  {note.title}
                </Link>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
