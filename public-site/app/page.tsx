import fs from "fs";
import path from "path";
import Link from "next/link";

interface Note {
  id: number;
  title: string;
  content: string;
  category: string;
  created_at: string;
  updated_at: string;
}

interface Category {
  name: string;
  cover_image: string;
}

function getData() {
  const dataDir = path.join(process.cwd(), "data");
  const notes: Note[] = JSON.parse(fs.readFileSync(path.join(dataDir, "notes.json"), "utf-8"));
  const categories: Category[] = JSON.parse(fs.readFileSync(path.join(dataDir, "categories.json"), "utf-8"));
  return { notes, categories };
}

export default function HomePage() {
  const { notes, categories } = getData();

  return (
    <div>
      {/* Hero */}
      <section className="text-center py-12 mb-8">
        <h1 className="text-4xl font-bold mb-4">Grace Lab</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          个人知识库与学习笔记，记录技术探索与成长历程。
        </p>
      </section>

      {/* 分类概览 */}
      {categories.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">分类</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={`/categories/${encodeURIComponent(cat.name)}`}
                className="block bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-900">{cat.name}</h3>
                <p className="text-sm text-gray-500 mt-1">查看笔记 →</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 最新笔记 */}
      <section>
        <h2 className="text-2xl font-bold mb-6">最新笔记</h2>
        {notes.length === 0 ? (
          <p className="text-gray-500 text-center py-8">暂无公开笔记</p>
        ) : (
          <div className="space-y-4">
            {notes.slice(0, 10).map((note) => (
              <Link
                key={note.id}
                href={`/notes/${note.id}`}
                className="block bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{note.title}</h3>
                    {note.category && (
                      <span className="inline-block text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                        {note.category}
                      </span>
                    )}
                  </div>
                  <time className="text-sm text-gray-400 whitespace-nowrap ml-4">
                    {new Date(note.created_at).toLocaleDateString("zh-CN")}
                  </time>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
