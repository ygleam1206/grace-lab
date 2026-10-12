import Link from "next/link";
import { notFound } from "next/navigation";
import notesData from "../../notes.json";
import categoriesData from "../../categories.json";

interface Note {
  id: number;
  title: string;
  category: string;
  created_at: string;
}

interface Category {
  name: string;
  cover_image: string;
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
      <Link href="/categories" className="text-sm text-blue-600 hover:text-blue-800 mb-4 inline-block">
        ← 返回分类列表
      </Link>

      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
        <p className="text-gray-500">{categoryNotes.length} 篇笔记</p>
      </header>

      {categoryNotes.length === 0 ? (
        <p className="text-gray-500 text-center py-8">该分类下暂无笔记</p>
      ) : (
        <div className="space-y-4">
          {categoryNotes.map((note) => (
            <Link
              key={note.id}
              href={`/notes/${note.id}`}
              className="block bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <h2 className="text-xl font-semibold text-gray-900">{note.title}</h2>
                <time className="text-sm text-gray-400 whitespace-nowrap ml-4">
                  {new Date(note.created_at).toLocaleDateString("zh-CN")}
                </time>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
