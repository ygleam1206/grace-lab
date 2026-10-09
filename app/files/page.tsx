"use client";

import { useState, useEffect } from "react";
import FileUploader from "@/components/FileUploader";
import FileList from "@/components/FileList";

interface FileItem {
  id: number;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  created_at: string;
}

export default function FilesPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFiles = async () => {
    const res = await fetch("/api/files");
    const data = await res.json();
    setFiles(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleDelete = async (id: number) => {
    await fetch(`/api/files/${id}`, { method: "DELETE" });
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">文件管理</h1>
      <FileUploader onUploadComplete={fetchFiles} />
      <div className="mt-6">
        {loading ? (
          <div className="text-center text-white/50 py-16">加载中...</div>
        ) : (
          <FileList files={files} onDelete={handleDelete} />
        )}
      </div>
    </div>
  );
}
