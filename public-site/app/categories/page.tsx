import Link from "next/link";
import notesData from "../notes.json";
import categoriesData from "../categories.json";

interface Category {
  name: string;
  cover_image: string;
}

interface Note {
  id: number;
  title: string;
  category: string;
}

const categories = categoriesData as Category[];
const notes = notesData as Note[];

export default function CategoriesPage() {
  // 计算每个分类的笔记数量
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
        <p className="text-gray-500 text-center py-8">暂无分类</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={`/categories/${encodeURIComponent(cat.name)}`}
              className="block bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-1">{cat.name}</h2>
              <p className="text-sm text-gray-500">{noteCounts[cat.name] || 0} 篇笔记</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
