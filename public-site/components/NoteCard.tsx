import Link from "next/link";
import { Tag, FolderOpen } from "lucide-react";
import GlassCard from "./GlassCard";
import { formatDate } from "../lib/utils";

interface NoteCardProps {
  id: number;
  title: string;
  content: string;
  category: string;
  tags: string[];
  updated_at: string;
}

export default function NoteCard({ id, title, content, category, tags, updated_at }: NoteCardProps) {
  const preview = content.replace(/[#*`>\-\[\]()]/g, "").slice(0, 120);

  return (
    <Link href={`/notes/${id}`}>
      <GlassCard hover className="h-full">
        <h3 className="text-lg font-semibold mb-2 line-clamp-1">{title}</h3>
        <p className="text-sm text-white/70 mb-3 line-clamp-3">{preview}</p>
        <div className="flex items-center justify-between text-xs text-white/50">
          <div className="flex items-center gap-3">
            {category && (
              <span className="flex items-center gap-1">
                <FolderOpen size={12} />
                {category}
              </span>
            )}
            {tags.length > 0 && (
              <span className="flex items-center gap-1">
                <Tag size={12} />
                {tags.slice(0, 3).join(", ")}
              </span>
            )}
          </div>
          <span>{formatDate(updated_at)}</span>
        </div>
      </GlassCard>
    </Link>
  );
}
