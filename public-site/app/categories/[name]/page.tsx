import { notFound } from "next/navigation";
import { ArrowLeft, FolderOpen } from "lucide-react";
import NoteCard from "@/components/NoteCard";
import notesData from "../../notes.json";
import categoriesData from "../../categories.json";

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

const categories = categoriesData as Category[];
const notes = notesData as Note[];

export function generateStaticParams() {
  return categories.map((cat) => ({ name: cat.name }));
}

export default async function CategoryPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const categoryName = decodeURIComponent(name);
  const category = categories.find((c) => c.name === categoryName);
  const categoryNotes = notes.filter((n) => n.category === categoryName);

  if (!category) {
    notFound();
  }

  return (
    <div>
      <a
        href="/grace-lab/notes"
        className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6 text-sm"
      >
        <ArrowLeft size={16} />
        返回知识库
      </a>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
          <FolderOpen size={20} className="text-white/70" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{categoryName}</h1>
          <p className="text-sm text-white/50">{categoryNotes.length} 篇笔记</p>
        </div>
      </div>

      {categoryNotes.length === 0 ? (
        <div className="text-center text-white/50 py-20">该分类下还没有笔记</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryNotes.map((note) => (
            <NoteCard key={note.id} {...note} />
          ))}
        </div>
      )}
    </div>
  );
}
