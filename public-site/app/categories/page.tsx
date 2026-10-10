import fs from "fs";
import path from "path";
import Link from "next/link";

interface Category {
  name: string;
  cover_image: string;
}

interface Note {
  id: number;
  title: string;
  category: string;
}

function getData() {
  const dataDir = path.join(process.cwd(), "data");
  const categories: Category[] = JSON.parse(fs.readFileSync(path.join(dataDir, "categories.json"), "utf-8"));
  const notes: Note[] = JSON.parse(fs.readFileSync(path.join(dataDir, "notes.json"), "utf-8"));

  // 计算每个分类的笔记数量
  const noteCounts = notes.reduce((acc, note) => {
    if (note.category) {
      acc[note.category] = (acc[note.category] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return { categories, noteCounts };
}

export default function CategoriesPage() {
  const { categories, noteCounts } = getData();

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
