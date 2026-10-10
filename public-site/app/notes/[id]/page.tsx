import fs from "fs";
import path from "path";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Note {
  id: number;
  title: string;
  content: string;
  category: string;
  created_at: string;
  updated_at: string;
}

function getNote(id: string): Note | undefined {
  const dataDir = path.join(process.cwd(), "data");
  const notes: Note[] = JSON.parse(fs.readFileSync(path.join(dataDir, "notes.json"), "utf-8"));
  return notes.find((n) => n.id === Number(id));
}

export function generateStaticParams() {
  const dataDir = path.join(process.cwd(), "data");
  const notes: Note[] = JSON.parse(fs.readFileSync(path.join(dataDir, "notes.json"), "utf-8"));
  return notes.map((note) => ({ id: String(note.id) }));
}

export default function NotePage({ params }: { params: { id: string } }) {
  const note = getNote(params.id);

  if (!note) {
    notFound();
  }

  return (
    <article>
      <Link href="/notes" className="text-sm text-blue-600 hover:text-blue-800 mb-4 inline-block">
        ← 返回笔记列表
      </Link>

      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-4">{note.title}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          {note.category && (
            <Link
              href={`/categories/${encodeURIComponent(note.category)}`}
              className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded hover:bg-blue-200"
            >
              {note.category}
            </Link>
          )}
          <time>创建于 {new Date(note.created_at).toLocaleDateString("zh-CN")}</time>
          <time>更新于 {new Date(note.updated_at).toLocaleDateString("zh-CN")}</time>
        </div>
      </header>

      <div
        className="prose prose-gray max-w-none"
        dangerouslySetInnerHTML={{ __html: note.content }}
      />
    </article>
  );
}
