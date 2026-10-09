"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Search, Plus, FolderOpen } from "lucide-react";
import NoteCard from "@/components/NoteCard";
import GlassCard from "@/components/GlassCard";

interface Note {
  id: number;
  title: string;
  content: string;
  category: string;
  tags: string[];
  updated_at: string;
}

export default function CategoryNotesPage() {
  const params = useParams();
  const router = useRouter();
  const categoryName = params.name as string;
  const isUncategorized = categoryName === "__uncategorized__";
  const displayName = isUncategorized ? "未分类" : decodeURIComponent(categoryName);

  const [notes, setNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchNotes = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("category", isUncategorized ? "" : decodeURIComponent(categoryName));
    if (search) params.set("search", search);
    const res = await fetch(`/api/notes?${params}`);
    const data = await res.json();
    setNotes(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryName]);

  useEffect(() => {
    const timer = setTimeout(fetchNotes, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div>
      {/* 面包屑导航 */}
      <button
        onClick={() => router.push("/notes")}
        className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6 text-sm"
      >
        <ArrowLeft size={16} />
        返回知识库
      </button>

      {/* 分类标题 */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
          <FolderOpen size={20} className="text-white/70" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{displayName}</h1>
          <p className="text-sm text-white/50">{notes.length} 篇笔记</p>
        </div>
      </div>

      {/* 搜索 + 新建 */}
      <div className="flex gap-4 mb-6">
        <GlassCard className="flex-1 !p-3">
          <div className="flex items-center gap-3 px-3">
            <Search size={18} className="text-white/50" />
            <input
              type="text"
              placeholder="搜索笔记..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent placeholder-white/40 focus:outline-none"
            />
          </div>
        </GlassCard>
        <button
          onClick={() => router.push("/notes/new")}
          className="flex items-center gap-2 bg-white/20 hover:bg-white/30 border border-white/30 rounded-full px-5 py-2.5 transition-all shrink-0"
        >
          <Plus size={18} />
          新建笔记
        </button>
      </div>

      {/* 笔记列表 */}
      {loading ? (
        <div className="text-center text-white/50 py-20">加载中...</div>
      ) : notes.length === 0 ? (
        <div className="text-center text-white/50 py-20">
          {search ? "没有找到匹配的笔记" : "该分类下还没有笔记"}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <NoteCard key={note.id} {...note} />
          ))}
        </div>
      )}
    </div>
  );
}
