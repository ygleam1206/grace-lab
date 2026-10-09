"use client";

import { useState, useRef, DragEvent } from "react";
import { Upload, FileIcon } from "lucide-react";

interface FileUploaderProps {
  onUploadComplete: () => void;
}

export default function FileUploader({ onUploadComplete }: FileUploaderProps) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    await fetch("/api/files", { method: "POST", body: formData });
    setUploading(false);
    onUploadComplete();
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`glass p-10 text-center cursor-pointer transition-all ${
        dragging ? "bg-white/25 scale-[1.02]" : "hover:bg-white/20"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleChange}
      />
      {uploading ? (
        <div className="flex flex-col items-center gap-3">
          <FileIcon size={40} className="text-white/60 animate-pulse" />
          <p className="text-white/70">上传中...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <Upload size={40} className="text-white/60" />
          <p className="text-white/70">拖拽文件到此处，或点击选择文件</p>
        </div>
      )}
    </div>
  );
}
