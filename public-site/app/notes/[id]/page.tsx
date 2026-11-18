import { notFound } from "next/navigation";
import { ArrowLeft, FolderOpen, Calendar } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import NoteSidebar from "@/components/NoteSidebar";
import NoteToc from "@/components/NoteToc";
import notesData from "../../notes.json";
import profileData from "../../profile.json";

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
const profile = profileData as { avatar: string; bio: string; signature: string };

// 侧栏时间线：按发布时间倒序，与主站一致
const timeline = [...notes]
  .sort(
    (a, b) =>
      new Date(b.created_at.replace(" ", "T")).getTime() -
      new Date(a.created_at.replace(" ", "T")).getTime()
  )
  .map((note) => ({ id: note.id, title: note.title, created_at: note.created_at }));

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

      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,1fr)] lg:items-start">
        {/* 左 3/4：标题 + 正文 */}
        <div className="flex min-w-0 flex-col gap-6">
          <GlassCard>
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
                  <Calendar size={14} /> {new Date(note.created_at.replace(" ", "T")).toLocaleDateString("zh-CN")}
                </span>
              </div>
            </div>
          </GlassCard>

          {/* 窄屏：目录放在正文上方，不用滚到页面底部再点 */}
          <div className="lg:hidden">
            <NoteToc noteId={note.id} />
          </div>

          <GlassCard>
            <div
              id="note-content"
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: contentWithBasePath }}
            />
          </GlassCard>
        </div>

        {/* 右 1/4：作者 + 往期文章时间线（窄屏落到正文下方） */}
        <div className="min-w-0">
          <NoteSidebar profile={profile} notes={timeline} currentId={note.id} noteId={note.id} />
        </div>
      </div>
    </div>
  );
}
