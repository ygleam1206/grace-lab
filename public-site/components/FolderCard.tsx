"use client";

import { useRouter } from "next/navigation";
import { FolderOpen } from "lucide-react";

interface FolderCardProps {
  id: number;
  name: string;
  cover_image: string;
  note_count: number;
  basePath: string;
}

const DEFAULT_GRADIENTS = [
  "from-blue-400/40 to-purple-500/40",
  "from-emerald-400/40 to-teal-500/40",
  "from-orange-400/40 to-rose-500/40",
  "from-cyan-400/40 to-blue-500/40",
  "from-pink-400/40 to-violet-500/40",
  "from-amber-400/40 to-orange-500/40",
  "from-lime-400/40 to-emerald-500/40",
  "from-indigo-400/40 to-purple-500/40",
];

function getGradient(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return DEFAULT_GRADIENTS[Math.abs(hash) % DEFAULT_GRADIENTS.length];
}

export default function FolderCard({ id, name, cover_image, note_count, basePath }: FolderCardProps) {
  const router = useRouter();
  const gradient = getGradient(name);
  const coverUrl = cover_image ? `/uploads/${cover_image}` : "";

  const handleClick = () => {
    router.push(`/categories/${encodeURIComponent(name)}`);
  };

  return (
    <div className="group relative">
      <div
        onClick={handleClick}
        className="glass cursor-pointer overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg hover:bg-white/20"
      >
        <div className="relative aspect-[16/10] overflow-hidden">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              draggable={false}
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
              <FolderOpen size={32} className="text-white/50" />
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="text-base font-semibold truncate">{name}</h3>
          <p className="text-sm text-white/50 mt-0.5">{note_count} 篇笔记</p>
        </div>
      </div>
    </div>
  );
}
