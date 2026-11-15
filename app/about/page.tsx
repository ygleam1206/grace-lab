"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CalendarDays, Camera, Loader2, Pencil, Quote, User } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Profile {
  avatar: string;
  bio: string;
  signature: string;
  updated_at?: string;
}

interface Note {
  id: number;
  title: string;
  category: string;
  created_at: string;
  is_public: number;
}

const BIO_HINT = "还没有写简介 —— 点右上角「编辑资料」写下关于你的一段话。";
const SIGNATURE_HINT = "写一句想挂在这里的话。";

export default function AboutPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  // 编辑态
  const [editing, setEditing] = useState(false);
  const [bioDraft, setBioDraft] = useState("");
  const [signatureDraft, setSignatureDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [profileRes, notesRes] = await Promise.all([fetch("/api/profile"), fetch("/api/notes")]);
        const profileData = (await profileRes.json()) as Profile;
        const notesData = await notesRes.json();
        setProfile(profileData);
        setBioDraft(profileData.bio || "");
        setSignatureDraft(profileData.signature || "");
        setNotes(Array.isArray(notesData) ? notesData : []);
      } catch {
        setError("资料加载失败，刷新试试");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const startEdit = () => {
    setBioDraft(profile?.bio || "");
    setSignatureDraft(profile?.signature || "");
    setError("");
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setError("");
  };

  const saveProfile = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio: bioDraft, signature: signatureDraft }),
      });
      if (!res.ok) throw new Error();
      setProfile((await res.json()) as Profile);
      setEditing(false);
    } catch {
      setError("保存失败，请重试");
    } finally {
      setSaving(false);
    }
  };

  const uploadAvatar = async (file: File) => {
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/profile/avatar", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "上传失败");
      setProfile((prev) => (prev ? { ...prev, avatar: data.avatar } : prev));
    } catch (e) {
      setError(e instanceof Error ? e.message : "头像上传失败");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="text-center text-white/50 py-20">加载中...</div>;
  }

  const avatarUrl = profile?.avatar ? `/uploads/${profile.avatar}` : "";
  // 时间线只放公开文章：和静态站导出、公开站看到的内容保持一致
  const timeline = notes
    .filter((note) => note.is_public === 1)
    .sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));

  return (
    <div>
      {/* 标题 */}
      <div className="flex items-start justify-between gap-4 mt-4 mb-10">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold italic leading-tight">
          Welcome to My Blog！
        </h1>
        <div className="flex gap-2 shrink-0">
          {editing ? (
            <>
              <button
                onClick={saveProfile}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-full bg-white/25 hover:bg-white/35 px-4 py-2 text-sm transition-all disabled:opacity-60"
              >
                {saving && <Loader2 size={14} className="animate-spin" />} 保存
              </button>
              <button
                onClick={cancelEdit}
                disabled={saving}
                className="rounded-full border border-white/25 hover:bg-white/10 px-4 py-2 text-sm transition-all"
              >
                取消
              </button>
            </>
          ) : (
            <button
              onClick={startEdit}
              className="flex items-center gap-1.5 rounded-full border border-white/30 hover:bg-white/10 px-4 py-2 text-sm transition-all"
            >
              <Pencil size={14} /> 编辑资料
            </button>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-red-300 mb-6">{error}</p>}

      {/* 头像 + 简介 + 个性签名 */}
      <div className="grid gap-10 lg:gap-14 lg:grid-cols-[300px_minmax(0,1fr)] items-start">
        {/* 圆形头像 */}
        <div className="relative mx-auto lg:mx-0 w-[220px] h-[220px] sm:w-[260px] sm:h-[260px] lg:w-[300px] lg:h-[300px]">
          {/* 圆形头像（不用 .glass：它的 border-radius:16px 会盖掉 rounded-full） */}
          <div className="w-full h-full rounded-full overflow-hidden bg-white/15 backdrop-blur ring-1 ring-white/20">
            {avatarUrl ? (
              <img src={avatarUrl} alt="头像" className="w-full h-full object-cover" draggable={false} />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-white/35 gap-2">
                <User size={48} strokeWidth={1.2} />
                <span className="text-xs">还没有头像</span>
              </div>
            )}
          </div>

          {/* 上传入口：只在编辑态出现 */}
          {editing && (
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute right-2 bottom-2 flex items-center gap-1.5 rounded-full bg-black/55 backdrop-blur px-3 py-2 text-xs hover:bg-black/70 transition-all disabled:opacity-70"
            >
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
              {uploading ? "上传中" : "上传头像"}
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadAvatar(file);
              e.target.value = "";
            }}
          />
        </div>

        {/* 右侧文字区 */}
        <div>
          {editing ? (
            <div className="border-l-2 border-white/30 pl-6">
              <textarea
                value={bioDraft}
                onChange={(e) => setBioDraft(e.target.value)}
                rows={9}
                placeholder={BIO_HINT}
                className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white/85 leading-loose outline-none focus:border-white/35 resize-y"
              />
            </div>
          ) : (
            <div className="border-l-2 border-white/25 pl-6">
              <p className="text-white/80 leading-loose whitespace-pre-wrap text-[15px]">
                {profile?.bio || <span className="text-white/35">{BIO_HINT}</span>}
              </p>
            </div>
          )}

          {/* 个性签名（替换掉参考图里的社交图标区） */}
          <div className="glass mt-8 p-5 flex gap-4 items-start rounded-2xl">
            <Quote size={20} className="text-white/40 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] tracking-[0.2em] text-white/40 uppercase"></p>
              {editing ? (
                <input
                  value={signatureDraft}
                  onChange={(e) => setSignatureDraft(e.target.value)}
                  placeholder={SIGNATURE_HINT}
                  className="mt-2 w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-sm outline-none focus:border-white/35"
                />
              ) : (
                <p className="mt-1.5 text-[15px] italic text-white/75 leading-relaxed break-words">
                  {profile?.signature || <span className="not-italic text-white/35">{SIGNATURE_HINT}</span>}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 时间轴 */}
      <section className="mt-20">
        <div className="flex items-end justify-between mb-8">
          <h2 className="text-2xl font-bold italic">时间线</h2>
          <p className="text-xs text-white/40">{timeline.length} 篇公开文章 · 按发布时间排列</p>
        </div>

        {timeline.length === 0 ? (
          <div className="glass p-8 text-center text-white/50 text-sm rounded-2xl">
            还没有公开的文章，去{" "}
            <Link href="/notes" className="underline hover:text-white">
              知识库
            </Link>{" "}
            把文章设为公开吧
          </div>
        ) : (
          <ol className="relative border-l border-white/15 ml-2">
            {timeline.map((note) => (
              <li key={note.id} className="relative pl-8 pb-9 last:pb-0">
                <span className="absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full bg-white/70 ring-4 ring-white/10" />
                <div className="flex items-center gap-2 text-xs text-white/40">
                  <CalendarDays size={12} />
                  {formatDate(note.created_at)}
                  {note.category && (
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-white/60">{note.category}</span>
                  )}
                </div>
                <Link
                  href={`/notes/${note.id}`}
                  className="mt-1.5 inline-block text-lg font-medium text-white/85 hover:text-white hover:underline decoration-white/30 underline-offset-4 transition-colors"
                >
                  {note.title}
                </Link>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
