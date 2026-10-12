import { notFound } from "next/navigation";
import { ArrowLeft, FolderOpen, Calendar } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import notesData from "../../notes.json";

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

const notes = notesData as Note[];

function getNote(id: string): Note | undefined {
  return notes.find((n) => n.id === Number(id));
}

export function generateStaticParams() {
  return notes.map((note) => ({ id: String(note.id) }));
}

export default async function NoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const note = getNote(id);

  if (!note) {
    notFound();
  }

  const contentWithBasePath = note.content.replace(
    /src="\/uploads\//g,
    `src="/grace-lab/uploads/`
  );

  return (
    <div>
      <a
        href="/grace-lab/notes"
        className="flex items-center gap-1 text-white/60 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> 返回列表
      </a>

      <GlassCard className="mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-3">{note.title}</h1>
          <div className="flex items-center gap-4 text-sm text-white/50">
            {note.category && (
              <span className="flex items-center gap-1">
                <FolderOpen size={14} /> {note.category}
              </span>
            )}
            {note.tags && note.tags.length > 0 && (
              <span className="flex items-center gap-1">
                ️ {note.tags.join(", ")}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar size={14} /> {new Date(note.created_at).toLocaleDateString("zh-CN")}
            </span>
          </div>
        </div>
      </GlassCard>

      <GlassCard>
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: contentWithBasePath }}
        />
      </GlassCard>
    </div>
  );
}
