"use client";

import Link from "next/link";
import notesData from "../notes.json";
import categoriesData from "../categories.json";

const BASE_PATH = "/grace-lab";

interface Category {
  id: number;
  name: string;
  cover_image: string;
  note_count: number;
}

interface Note {
  id: number;
  title: string;
  category: string;
}

const categories = categoriesData as Category[];
const notes = notesData as Note[];

export default function CategoriesPage() {
  const noteCounts = notes.reduce((acc, note) => {
    if (note.category) {
      acc[note.category] = (acc[note.category] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">分类</h1>
      {categories.length === 0 ? (
        <p className="text-white/50 text-center py-8">暂无分类</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${encodeURIComponent(cat.name)}`}
              className="glass p-6 hover:bg-white/20 transition-all hover:-translate-y-1 hover:shadow-lg cursor-pointer block"
            >
              <h2 className="text-lg font-semibold text-white mb-1">{cat.name}</h2>
              <p className="text-sm text-white/50">{noteCounts[cat.name] || cat.note_count || 0} 篇笔记</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
