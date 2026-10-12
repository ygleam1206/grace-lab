"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import FolderCard from "@/components/FolderCard";
import GlassCard from "@/components/GlassCard";
import notesData from "../notes.json";
import categoriesData from "../categories.json";

const BASE_PATH = "/grace-lab";

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

const notes = notesData as Note[];
const categories = categoriesData as Category[];

export default function NotesPage() {
  const [search, setSearch] = useState("");

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">知识库</h1>
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
                ✕
              </button>
            )}
          </div>
        </GlassCard>
      </div>

      {/* 文件夹网格 */}
      {filteredCategories.length === 0 ? (
        <div className="text-center text-white/50 py-20">
          {search ? "没有找到匹配的分类" : "还没有分类"}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredCategories.map((cat) => (
            <FolderCard
              key={cat.id}
              id={cat.id}
              name={cat.name}
              cover_image={cat.cover_image}
              note_count={cat.note_count}
              basePath={BASE_PATH}
            />
          ))}
        </div>
      )}
    </div>
  );
}
