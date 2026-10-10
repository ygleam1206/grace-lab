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

function getData() {
  const dataDir = path.join(process.cwd(), "data");
  const notes: Note[] = JSON.parse(fs.readFileSync(path.join(dataDir, "notes.json"), "utf-8"));
  return notes;
}

export default function NotesPage() {
  const notes = getData();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">全部笔记</h1>
      {notes.length === 0 ? (
        <p className="text-gray-500 text-center py-8">暂无公开笔记</p>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <Link
              key={note.id}
              href={`/notes/${note.id}`}
              className="block bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">{note.title}</h2>
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
    </div>
  );
}
