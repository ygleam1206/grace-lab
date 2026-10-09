"use client";

import { Download, Trash2, FileText } from "lucide-react";
import { formatFileSize, formatDate } from "@/lib/utils";

interface FileItem {
  id: number;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  created_at: string;
}

interface FileListProps {
  files: FileItem[];
  onDelete: (id: number) => void;
}

export default function FileList({ files, onDelete }: FileListProps) {
  const handleDownload = (file: FileItem) => {
    window.open(`/api/files/${file.id}`, "_blank");
  };

  const handleDelete = (file: FileItem) => {
    if (!confirm(`确定要删除文件 "${file.original_name}" 吗？`)) return;
    onDelete(file.id);
  };

  if (files.length === 0) {
    return (
      <div className="text-center text-white/50 py-16">
        <FileText size={48} className="mx-auto mb-3 opacity-40" />
        <p>还没有文件，上传一个吧</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {files.map((file) => (
        <div
          key={file.id}
          className="glass !p-4 flex items-center justify-between hover:bg-white/20 transition-all"
        >
          <div className="flex items-center gap-3 min-w-0">
            <FileText size={20} className="text-white/50 shrink-0" />
            <div className="min-w-0">
              <p className="font-medium truncate">{file.original_name}</p>
              <p className="text-xs text-white/50">
                {formatFileSize(file.size)} · {formatDate(file.created_at)}
              </p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => handleDownload(file)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              title="下载"
            >
              <Download size={16} />
            </button>
            <button
              onClick={() => handleDelete(file)}
              className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 transition-colors"
              title="删除"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
