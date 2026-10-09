"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, FolderOpen } from "lucide-react";

interface FolderCardProps {
  id: number;
  name: string;
  cover_image: string;
  note_count: number;
  isUncategorized?: boolean;
  onUploadComplete: () => void;
}

// 默认封面渐变色（按分类名哈希选择）
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

export default function FolderCard({ id, name, cover_image, note_count, isUncategorized, onUploadComplete }: FolderCardProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const gradient = getGradient(name);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/files", { method: "POST", body: formData });
      const data = await res.json();

      if (res.ok) {
        await fetch(`/api/categories?id=${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, cover_image: data.filename }),
        });
        onUploadComplete();
      }
    } catch {
      // 上传失败静默处理
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    if (isUncategorized) {
      router.push("/notes/c/__uncategorized__");
    } else {
      router.push(`/notes/c/${encodeURIComponent(name)}`);
    }
  };

  const coverUrl = cover_image ? `/uploads/${cover_image}` : "";

  return (
    <div className="group relative">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleCoverUpload}
        disabled={uploading}
      />

      {/* 卡片主体 — 点击跳转 */}
      <div
        onClick={handleClick}
        className="glass cursor-pointer overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg hover:bg-white/20"
      >
        {/* 封面区域 */}
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

          {/* 上传按钮 — hover 时显示 */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              disabled={uploading}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white disabled:opacity-50"
              title={coverUrl ? "更换封面" : "设置封面"}
            >
              <Upload size={16} />
            </button>
          </div>
        </div>

        {/* 信息区域 */}
        <div className="p-4">
          <h3 className="text-base font-semibold truncate">{name}</h3>
          <p className="text-sm text-white/50 mt-0.5">{note_count} 篇笔记</p>
        </div>
      </div>
    </div>
  );
}
