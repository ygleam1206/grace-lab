"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, FolderOpen, Pencil, Trash2, Check, X } from "lucide-react";
import FolderCard from "@/components/FolderCard";
import GlassCard from "@/components/GlassCard";

interface Category {
  id: number;
  name: string;
  cover_image: string;
  note_count: number;
}

export default function NotesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [uncategorized, setUncategorized] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // 加载分类
  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data.categories || []);
      setUncategorized(data.uncategorized || 0);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // 分类管理
  const [editingCat, setEditingCat] = useState<{ id: number; name: string } | null>(null);
  const [editName, setEditName] = useState("");

  const handleRenameCategory = async (id: number) => {
    const name = editName.trim();
    if (!name) return;
    const res = await fetch(`/api/categories?id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      setEditingCat(null);
      fetchCategories();
    }
  };

  const handleDeleteCategory = async (id: number, name: string) => {
    const count = categories.find((c) => c.id === id)?.note_count || 0;
    const msg = count > 0
      ? `删除分类「${name}」后，该分类下的 ${count} 篇笔记将变为「未分类」。确定删除吗？`
      : `确定删除分类「${name}」吗？`;
    if (!confirm(msg)) return;
    const res = await fetch(`/api/categories?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchCategories();
    }
  };

  const handleCreateCategory = async () => {
    const name = prompt("请输入分类名称：");
    if (!name || !name.trim()) return;
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    if (res.ok) {
      fetchCategories();
    } else {
      const data = await res.json();
      alert(data.error || "创建失败");
    }
  };

  // 搜索过滤分类
  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">知识库</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCreateCategory}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full px-4 py-2.5 transition-all text-sm"
          >
            <FolderOpen size={16} />
            新建分类
          </button>
          <button
            onClick={() => router.push("/notes/new")}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 border border-white/30 rounded-full px-5 py-2.5 transition-all"
          >
            <Plus size={18} />
            新建笔记
          </button>
        </div>
      </div>

      {/* 搜索 */}
      <div className="mb-8">
        <GlassCard className="!p-3">
          <div className="flex items-center gap-3 px-3">
            <Search size={18} className="text-white/50" />
            <input
              type="text"
              placeholder="搜索分类..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent placeholder-white/40 focus:outline-none"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-white/40 hover:text-white/70 transition-colors">
                <X size={16} />
              </button>
            )}
          </div>
        </GlassCard>
      </div>

      {/* 文件夹网格 */}
      {loading ? (
        <div className="text-center text-white/50 py-20">加载中...</div>
      ) : filteredCategories.length === 0 && uncategorized === 0 ? (
        <div className="text-center text-white/50 py-20">
          {search ? "没有找到匹配的分类" : "还没有分类，点击上方按钮创建"}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredCategories.map((cat) => (
            <div key={cat.id} className="relative group">
              <FolderCard
                id={cat.id}
                name={cat.name}
                cover_image={cat.cover_image}
                note_count={cat.note_count}
                onUploadComplete={fetchCategories}
              />
              {/* 管理按钮 — hover 显示 */}
              <div className="absolute top-2 right-2 hidden group-hover:flex gap-1 z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingCat({ id: cat.id, name: cat.name });
                    setEditName(cat.name);
                  }}
                  className="p-1.5 rounded-full bg-blue-500/40 hover:bg-blue-500/60 text-white backdrop-blur-sm transition-colors"
                  title="重命名"
                >
                  <Pencil size={12} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCategory(cat.id, cat.name);
                  }}
                  className="p-1.5 rounded-full bg-red-500/40 hover:bg-red-500/60 text-white backdrop-blur-sm transition-colors"
                  title="删除"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}

          {/* 未分类文件夹 */}
          {uncategorized > 0 && !search && (
            <FolderCard
              id={-1}
              name="未分类"
              cover_image=""
              note_count={uncategorized}
              isUncategorized
              onUploadComplete={fetchCategories}
            />
          )}
        </div>
      )}

      {/* 重命名弹窗 */}
      {editingCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setEditingCat(null)}>
          <div className="w-80 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-6" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">重命名分类</h3>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleRenameCategory(editingCat.id); }}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 mb-4 placeholder-white/40 focus:outline-none focus:border-white/40"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingCat(null)}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm"
              >
                <X size={14} className="inline mr-1" />取消
              </button>
              <button
                onClick={() => handleRenameCategory(editingCat.id)}
                className="px-4 py-2 rounded-lg bg-blue-500/30 hover:bg-blue-500/40 transition-colors text-sm"
              >
                <Check size={14} className="inline mr-1" />确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
