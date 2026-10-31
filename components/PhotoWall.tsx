"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Loader2, MapPin, Pencil, Smile, X } from "lucide-react";
import BounceCards from "@/components/BounceCards";
import type { Photo } from "@/lib/photos";

const CARD_SIZE = 200;
const ROTATION = 10;
const MAX_SPREAD = 130;
// 桌面正文可用宽度（max-w-6xl 1152 - px-4 两侧）再留一点旋转余量
const SAFE_ROW_WIDTH = 1090;

// 一行内按张数摊开：在可用宽度内尽量拉大间距，减少重叠
function spreadFor(count: number) {
  if (count <= 1) return MAX_SPREAD;
  const fit = Math.floor((SAFE_ROW_WIDTH - CARD_SIZE * 1.5) / (count - 1));
  return Math.max(90, Math.min(MAX_SPREAD, fit));
}

// 本行最外侧卡片旋转后的实际宽度，用作容器宽度（避免盒子虚胖撑出横向滚动）
function rowWidthFor(count: number, spread: number) {
  if (count <= 1) return CARD_SIZE + 60;
  const edgeAngle = (((count - 1) / 2) * ROTATION * Math.PI) / 180;
  const rotated = CARD_SIZE * (Math.abs(Math.cos(edgeAngle)) + Math.abs(Math.sin(edgeAngle)));
  return Math.max(500, Math.round((count - 1) * spread + rotated));
}

// 桌面每行最多 8 张，窄屏 4 张；超出的换行，各行张数尽量均摊
function chunk(list: Photo[], maxPerRow: number) {
  const rowCount = Math.ceil(list.length / maxPerRow);
  const base = Math.floor(list.length / rowCount);
  const extra = list.length % rowCount;

  const rows: Photo[][] = [];
  let cursor = 0;
  for (let i = 0; i < rowCount; i++) {
    const size = base + (i < extra ? 1 : 0);
    rows.push(list.slice(cursor, cursor + size));
    cursor += size;
  }
  return rows;
}

interface PhotoWallProps {
  photos: Photo[];
}

export default function PhotoWall({ photos }: PhotoWallProps) {
  const [items, setItems] = useState<Photo[]>(photos);
  const [perRow, setPerRow] = useState(8);
  const [active, setActive] = useState<number | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ location: "", mood: "", taken_at: "" });
  const [error, setError] = useState("");
  // 大图挂到 body，否则会被 main 的层叠上下文压在导航栏下面
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const apply = () => setPerRow(mq.matches ? 8 : 4);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const current = active === null ? null : items[active];

  // 切换照片时退出编辑态
  useEffect(() => {
    setEditing(false);
    setError("");
  }, [active]);

  const startEditing = () => {
    if (!current) return;
    setForm({
      location: current.location,
      mood: current.mood,
      taken_at: current.taken_at,
    });
    setError("");
    setEditing(true);
  };

  const save = async () => {
    if (!current) return;
    if (current.id === 0) {
      setError("这张照片还没登记到数据库，请刷新页面后重试");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/photos/${current.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "保存失败");
      }

      setItems((list) =>
        list.map((photo) => (photo.id === current.id ? { ...photo, ...form } : photo))
      );
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  const step = useCallback(
    (delta: number) => {
      setActive((index) => {
        if (index === null) return index;
        return (index + delta + items.length) % items.length;
      });
    },
    [items.length]
  );

  // 大图打开时：Esc 关闭、左右方向键翻页、锁定背景滚动
  useEffect(() => {
    if (active === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (editing) return;
      if (event.key === "Escape") setActive(null);
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [active, step, editing]);

  if (items.length === 0) {
    return <div className="text-center text-white/50 py-8">还没有照片</div>;
  }

  const rows = chunk(items, perRow);
  // 每行第一张照片在总列表中的下标，用于点击时定位大图
  let rowStart = 0;

  return (
    <>
      <div className="flex flex-col gap-6 lg:gap-8">
        {rows.map((row, rowIndex) => {
          const spread = spreadFor(row.length);
          const rowWidth = rowWidthFor(row.length, spread);
          const offset = rowStart;
          rowStart += row.length;

          return (
            <div key={rowIndex} className="flex justify-center">
              <div className="[zoom:0.55] sm:[zoom:0.8] lg:[zoom:1]">
                <BounceCards
                  images={row.map((photo) => photo.url)}
                  containerWidth={rowWidth}
                  containerHeight={320}
                  cardSize={CARD_SIZE}
                  spread={spread}
                  rotation={ROTATION}
                  arc={0}
                  pushDistance={160}
                  hoverScale={1.06}
                  bounciness={0.6}
                  animationDelay={0.4 + rowIndex * 0.2}
                  animationStagger={0.06}
                  borderWidth={5}
                  borderColor="#ffffff"
                  radius={25}
                  shadow
                  enableHover
                  onImageClick={(index) => setActive(offset + index)}
                />
              </div>
            </div>
          );
        })}
      </div>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {current && active !== null && (
              <motion.div
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setActive(null)}
              >
                <button
                  type="button"
                  aria-label="关闭"
                  className="absolute top-5 right-5 z-10 p-2 rounded-full bg-white/10 hover:bg-white/25 transition-colors"
                  onClick={() => setActive(null)}
                >
                  <X size={22} />
                </button>

                {items.length > 1 && !editing && (
                  <>
                    <button
                      type="button"
                      aria-label="上一张"
                      className="absolute left-2 sm:left-6 z-10 p-2 rounded-full bg-white/10 hover:bg-white/25 transition-colors"
                      onClick={(event) => {
                        event.stopPropagation();
                        step(-1);
                      }}
                    >
                      <ChevronLeft size={26} />
                    </button>
                    <button
                      type="button"
                      aria-label="下一张"
                      className="absolute right-2 sm:right-6 z-10 p-2 rounded-full bg-white/10 hover:bg-white/25 transition-colors"
                      onClick={(event) => {
                        event.stopPropagation();
                        step(1);
                      }}
                    >
                      <ChevronRight size={26} />
                    </button>
                  </>
                )}

                <div
                  className="flex max-h-[88vh] flex-col items-center gap-4 overflow-y-auto max-w-[92vw] py-1"
                  onClick={(event) => event.stopPropagation()}
                >
                  <motion.img
                    key={current.filename}
                    src={current.url}
                    alt={current.filename}
                    draggable={false}
                    className={`w-auto max-w-full rounded-xl shadow-2xl select-none ${
                      editing ? "max-h-[52vh]" : "max-h-[76vh]"
                    }`}
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ type: "spring", bounce: 0.25, duration: 0.4 }}
                  />

                  {/* 元数据：地点 / 心情 / 日期，未填写时不显示 */}
                  {!editing && (current.location || current.mood || current.taken_at) && (
                    <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-white/80">
                      {current.location && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1">
                          <MapPin size={14} />
                          {current.location}
                        </span>
                      )}
                      {current.mood && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1">
                          <Smile size={14} />
                          {current.mood}
                        </span>
                      )}
                      {current.taken_at && (
                        <span className="text-xs tracking-[0.2em] text-white/50">{current.taken_at}</span>
                      )}
                    </div>
                  )}

                  {/* 编辑面板 */}
                  {editing ? (
                    <div className="w-[min(92vw,520px)] rounded-2xl bg-white/10 p-4 backdrop-blur">
                      <div className="flex flex-col gap-3">
                        <label className="flex items-center gap-3 text-sm">
                          <span className="w-14 shrink-0 text-white/60">地点</span>
                          <input
                            value={form.location}
                            onChange={(event) =>
                              setForm((prev) => ({ ...prev, location: event.target.value }))
                            }
                            placeholder="例如：杭州·西湖"
                            className="flex-1 rounded-lg bg-black/30 px-3 py-2 text-white placeholder:text-white/30 outline-none focus:ring-1 focus:ring-white/40"
                          />
                        </label>
                        <label className="flex items-center gap-3 text-sm">
                          <span className="w-14 shrink-0 text-white/60">心情</span>
                          <input
                            value={form.mood}
                            onChange={(event) =>
                              setForm((prev) => ({ ...prev, mood: event.target.value }))
                            }
                            placeholder="例如：安静、开心"
                            className="flex-1 rounded-lg bg-black/30 px-3 py-2 text-white placeholder:text-white/30 outline-none focus:ring-1 focus:ring-white/40"
                          />
                        </label>
                        <label className="flex items-center gap-3 text-sm">
                          <span className="w-14 shrink-0 text-white/60">日期</span>
                          <input
                            value={form.taken_at}
                            onChange={(event) =>
                              setForm((prev) => ({ ...prev, taken_at: event.target.value }))
                            }
                            placeholder="例如：2026.10.30"
                            className="flex-1 rounded-lg bg-black/30 px-3 py-2 text-white placeholder:text-white/30 outline-none focus:ring-1 focus:ring-white/40"
                          />
                        </label>
                      </div>

                      {error && <p className="mt-2 text-xs text-rose-300">{error}</p>}

                      <div className="mt-4 flex justify-end gap-2 text-sm">
                        <button
                          type="button"
                          className="rounded-full px-4 py-2 text-white/70 hover:bg-white/10"
                          onClick={() => setEditing(false)}
                          disabled={saving}
                        >
                          取消
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-4 py-2 font-medium hover:bg-white/30 disabled:opacity-60"
                          onClick={save}
                          disabled={saving}
                        >
                          {saving && <Loader2 size={14} className="animate-spin" />}
                          保存
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={startEditing}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/70 hover:bg-white/20"
                    >
                      <Pencil size={13} />
                      编辑地点 / 心情
                    </button>
                  )}
                </div>

                {!editing && (
                  <span className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs tracking-[0.3em] text-white/60">
                    {active + 1} / {items.length}
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
