"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import NoteEditor from "@/components/NoteEditor";

export default function EditNotePage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState({
    title: "",
    content: "",
    category: "",
    tags: [] as string[],
  });

  useEffect(() => {
    const fetchNote = async () => {
      const res = await fetch(`/api/notes/${params.id}`);
      if (!res.ok) {
        router.push("/notes");
        return;
      }
      const data = await res.json();
      setInitialData({
        title: data.title,
        content: data.content,
        category: data.category,
        tags: data.tags || [],
      });
      setLoading(false);
    };
    fetchNote();
  }, [params.id, router]);

  const handleSubmit = async (data: {
    title: string;
    content: string;
    category: string;
    tags: string[];
  }) => {
    const res = await fetch(`/api/notes/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      router.push(`/notes/${params.id}`);
    }
  };

  if (loading) {
    return <div className="text-center text-white/50 py-20">加载中...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">编辑笔记</h1>
      <NoteEditor
        initialTitle={initialData.title}
        initialContent={initialData.content}
        initialCategory={initialData.category}
        initialTags={initialData.tags}
        onSubmit={handleSubmit}
        submitLabel="保存修改"
      />
    </div>
  );
}
