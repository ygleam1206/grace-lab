"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Pencil, Trash2, ArrowLeft, Tag, FolderOpen, Calendar } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import { formatDate } from "@/lib/utils";
import DOMPurify from "dompurify";

interface Note {
  id: number;
  title: string;
  content: string;
  category: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export default function NoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNote = async () => {
      const res = await fetch(`/api/notes/${params.id}`);
      if (!res.ok) {
        router.push("/notes");
        return;
      }
      const data = await res.json();
      setNote(data);
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

      <GlassCard className="mb-6">
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

      <GlassCard>
        <div
          className="prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(note.content || ""),
          }}
        />
      </GlassCard>
    </div>
  );
}
