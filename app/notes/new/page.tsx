"use client";

import { useRouter } from "next/navigation";
import NoteEditor from "@/components/NoteEditor";

export default function NewNotePage() {
  const router = useRouter();

  const handleSubmit = async (data: {
    title: string;
    content: string;
    category: string;
    tags: string[];
  }) => {
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const result = await res.json();
      router.push(`/notes/${result.id}`);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">新建笔记</h1>
      <NoteEditor onSubmit={handleSubmit} submitLabel="创建笔记" />
    </div>
  );
}
