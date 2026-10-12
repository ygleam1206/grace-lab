import Link from "next/link";
import { notFound } from "next/navigation";
import notesData from "../../notes.json";

interface Note {
  id: number;
  title: string;
  content: string;
  category: string;
  created_at: string;
  updated_at: string;
}

const notes = notesData as Note[];

function getNote(id: string): Note | undefined {
  return notes.find((n) => n.id === Number(id));
}

export function generateStaticParams() {
  return notes.map((note) => ({ id: String(note.id) }));
}

export default async function NotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const note = getNote(id);

  if (!note) {
    notFound();
  }

  // 为图片路径添加 basePath 前缀
  const contentWithBasePath = note.content.replace(
    /src="\/uploads\//g,
    'src="/grace-lab/uploads/'
  );

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
        dangerouslySetInnerHTML={{ __html: contentWithBasePath }}
      />
    </article>
  );
}
