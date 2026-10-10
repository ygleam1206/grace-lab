"use client";

import { useState, useEffect } from "react";
import { Plus, ChevronDown } from "lucide-react";
import RichTextEditor from "./RichTextEditor";

interface Category {
  id: number;
  name: string;
}

interface NoteEditorProps {
  initialTitle?: string;
  initialContent?: string;
  initialCategory?: string;
  initialTags?: string[];
  initialIsPublic?: boolean;
  onSubmit: (data: { title: string; content: string; category: string; tags: string[]; is_public: boolean }) => void;
  submitLabel?: string;
}

export default function NoteEditor({
  initialTitle = "",
  initialContent = "",
  initialCategory = "",
  initialTags = [],
  initialIsPublic = false,
  onSubmit,
  submitLabel = "保存",
}: NoteEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [category, setCategory] = useState(initialCategory);
  const [tagInput, setTagInput] = useState(initialTags.join(", "));
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showCatDropdown, setShowCatDropdown] = useState(false);
  const [showNewCatInput, setShowNewCatInput] = useState(false);
  const [newCatName, setNewCatName] = useState("");

  // 加载分类列表
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => {});
  }, []);

  // 创建新分类
  const handleCreateCategory = async () => {
    const name = newCatName.trim();
    if (!name) return;
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      const created = await res.json();
      setCategories((prev) => [...prev, created]);
      setCategory(created.name);
      setNewCatName("");
      setShowNewCatInput(false);
      setShowCatDropdown(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tags = tagInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    onSubmit({ title, content, category, tags, is_public: isPublic });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="笔记标题"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-lg font-semibold placeholder-white/40 focus:outline-none focus:border-white/40"
        required
      />

      {/* 分类选择器 */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <button
            type="button"
            onClick={() => { setShowCatDropdown(!showCatDropdown); setShowNewCatInput(false); }}
            className="w-full flex items-center justify-between bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-left focus:outline-none focus:border-white/40 hover:bg-white/15 transition-colors"
          >
            <span className={category ? "text-white" : "text-white/40"}>
              {category || "选择分类"}
            </span>
            <ChevronDown size={16} className="text-white/50" />
          </button>

          {showCatDropdown && (
            <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-[#1e1e2e] border border-white/20 rounded-xl shadow-xl overflow-hidden">
              <div className="max-h-48 overflow-y-auto py-1">
                <button
                  type="button"
                  onClick={() => { setCategory(""); setShowCatDropdown(false); }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-white/10 transition-colors ${!category ? "bg-white/10 text-white" : "text-white/70"}`}
                >
                  未分类
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => { setCategory(cat.name); setShowCatDropdown(false); }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-white/10 transition-colors ${category === cat.name ? "bg-white/10 text-white" : "text-white/70"}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
              <div className="border-t border-white/10 px-3 py-2">
                {showNewCatInput ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="分类名称"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleCreateCategory(); } }}
                      className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-sm placeholder-white/40 focus:outline-none focus:border-white/40"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleCreateCategory}
                      className="px-3 py-1.5 bg-blue-500/30 hover:bg-blue-500/40 rounded-lg text-sm transition-colors"
                    >
                      确定
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowNewCatInput(true)}
                    className="flex items-center gap-1 text-sm text-blue-300 hover:text-blue-200 transition-colors"
                  >
                    <Plus size={14} /> 新建分类
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <input
          type="text"
          placeholder="标签（逗号分隔）"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2 placeholder-white/40 focus:outline-none focus:border-white/40"
        />
      </div>

      {/* 公开/私密开关 */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setIsPublic(!isPublic)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            isPublic ? "bg-green-500" : "bg-white/20"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isPublic ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        <span className="text-sm text-white/70">
          {isPublic ? "公开（将发布到公网）" : "私密（仅本地可见）"}
        </span>
      </div>

      <RichTextEditor
        content={content}
        onChange={setContent}
      />

      <button
        type="submit"
        className="bg-white/20 hover:bg-white/30 border border-white/30 rounded-xl px-8 py-3 font-semibold transition-all"
      >
        {submitLabel}
      </button>
    </form>
  );
}
