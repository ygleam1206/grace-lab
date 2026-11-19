"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Pencil, Trash2, ArrowLeft, Tag, FolderOpen, Calendar } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import NoteSidebar, { type SidebarNote, type SidebarProfile } from "@/components/NoteSidebar";
import NoteToc from "@/components/NoteToc";
import { formatDate, previewOf } from "@/lib/utils";
import DOMPurify from "dompurify";

interface Note {
  id: number;
  title: string;
  summary?: string;
  content: string;
  category: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  is_public?: number;
}

export default function NoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [note, setNote] = useState<Note | null>(null);
  const [profile, setProfile] = useState<SidebarProfile | null>(null);
  const [others, setOthers] = useState<SidebarNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNote = async () => {
      // 正文、作者资料、往期文章一次取回，侧栏与正文同时就绪
      const [res, profileRes, listRes] = await Promise.all([
        fetch(`/api/notes/${params.id}`),
        fetch("/api/profile"),
        fetch("/api/notes"),
      ]);
      if (!res.ok) {
        router.push("/notes");
        return;
      }

      const [data, profileData, listData] = await Promise.all([
        res.json(),
        profileRes.ok ? profileRes.json() : Promise.resolve(null),
        listRes.ok ? listRes.json() : Promise.resolve([]),
      ]);

      setNote(data);
      setProfile(profileData);
      setOthers(
        (listData as Note[])
          // 往期文章只列公开的，与静态站、About 页时间线保持一致
          .filter((item) => item.is_public === 1)
          .map((item) => ({
            id: item.id,
            title: item.title,
            created_at: item.created_at,
          }))
          .sort(
            (a, b) =>
              new Date(b.created_at.replace(" ", "T")).getTime() -
              new Date(a.created_at.replace(" ", "T")).getTime()
          )
      );
      setLoading(false);
    };
    fetchNote();
  }, [params.id, router]);

  const handleDelete = async () => {
    if (!confirm("确定要删除这篇笔记吗？")) return;
    await fetch(`/api/notes/${params.id}`, { method: "DELETE" });
    router.push("/notes");
  };

  if (loading) {
    return <div className="text-center text-white/50 py-20">加载中...</div>;
  }
  if (!note) return null;

  return (
    <div>
      <button
        onClick={() => router.push("/notes")}
        className="flex items-center gap-1 text-white/60 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> 返回列表
      </button>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,1fr)] lg:items-start">
        {/* 左 3/4：标题 + 正文 */}
        <div className="flex min-w-0 flex-col gap-6">
          <GlassCard>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-3">{note.title}</h1>
                <div className="flex items-center gap-4 text-sm text-white/50">
                  {note.category && (
                    <span className="flex items-center gap-1">
                      <FolderOpen size={14} /> {note.category}
                    </span>
                  )}
                  {note.tags.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Tag size={14} /> {note.tags.join(", ")}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar size={14} /> {formatDate(note.created_at)}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/notes/${note.id}/edit`)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </GlassCard>

          {/* 窄屏：目录放在正文上方，不用滚到页面底部再点 */}
          <div className="lg:hidden">
            <NoteToc noteId={note.id} />
          </div>

          <GlassCard>
            <div
              id="note-content"
              className="prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(note.content || ""),
              }}
            />
          </GlassCard>
        </div>

        {/* 右 1/4：作者 + 简介 + 目录 + 时间线；桌面下固定在视口内单独滚动 */}
        <div className="min-w-0 lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto lg:overscroll-contain lg:pr-1">
          <NoteSidebar
            profile={profile}
            notes={others}
            currentId={note.id}
            noteId={note.id}
            excerpt={previewOf(note.summary, note.content, 200)}
          />
        </div>
      </div>
    </div>
  );
}
