"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Pencil, X } from "lucide-react";
import BounceCards from "@/components/BounceCards";
import PhotoArtwork from "@/components/PhotoArtwork";
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

/* ------------------------------------------------------------------ */
/* 背景取色：把照片缩到 16×16 求平均色，再压成深色底，白字始终可读        */
/* ------------------------------------------------------------------ */
const TINT_CACHE = new Map<string, string>();
const TINT_FALLBACK = "#0b0a10";

function toDeepTint(r: number, g: number, b: number) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;

  let hue = 0;
  let sat = 0;
  if (d) {
    sat = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rn) hue = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
    else if (max === gn) hue = ((bn - rn) / d + 2) / 6;
    else hue = ((rn - gn) / d + 4) / 6;
  }

  // 色相留着，饱和度抬一档（平均色容易发灰），亮度压到 13%，保证任何照片都能衬住白字
  const boosted = Math.min(0.62, sat * 2.2);
  return `hsl(${Math.round(hue * 360)} ${Math.round(boosted * 100)}% 13%)`;
}

function readTint(src: string) {
  const cached = TINT_CACHE.get(src);
  if (cached) return Promise.resolve(cached);

  return new Promise<string>((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 16;
        canvas.height = 16;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("no 2d context");
        ctx.drawImage(img, 0, 0, 16, 16);
        const { data } = ctx.getImageData(0, 0, 16, 16);

        let r = 0;
        let g = 0;
        let b = 0;
        let n = 0;
        for (let i = 0; i < data.length; i += 4) {
          // 过曝与死黑的像素不参与平均，避免天空/剪影把整张图拉偏
          const lum = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
          if (lum < 14 || lum > 246) continue;
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          n++;
        }

        const color = n ? toDeepTint(r / n, g / n, b / n) : TINT_FALLBACK;
        TINT_CACHE.set(src, color);
        resolve(color);
      } catch {
        TINT_CACHE.set(src, TINT_FALLBACK);
        resolve(TINT_FALLBACK);
      }
    };
    img.onerror = () => {
      TINT_CACHE.set(src, TINT_FALLBACK);
      resolve(TINT_FALLBACK);
    };
    img.src = src;
  });
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
  // 左侧留白与右侧文字区共用同一块深色底，翻页时淡变到当前照片的颜色
  const [tint, setTint] = useState(TINT_FALLBACK);
  // 大图挂到 body，否则会被 main 的层叠上下文压在导航栏下面
  const [mounted, setMounted] = useState(false);
  // 纵向滑动画廊的滚动容器
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const settleRef = useRef<number | null>(null);
  const prevActiveRef = useRef<number | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const apply = () => setPerRow(mq.matches ? 8 : 4);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const current = active === null ? null : items[active];

  // 切换照片时退出编辑态；刚打开大图时把滚动位置对到被点的那张
  useEffect(() => {
    setEditing(false);
    setError("");

    if (active === null) {
      prevActiveRef.current = null;
      return;
    }

    const el = scrollerRef.current;
    if (el && prevActiveRef.current === null) el.scrollTop = active * el.clientHeight;
    prevActiveRef.current = active;
  }, [active]);

  // 只算当前这张，顺带把前后两张预热进缓存
  useEffect(() => {
    if (active === null) return;
    let cancelled = false;

    readTint(items[active].url).then((color) => {
      if (!cancelled) setTint(color);
    });
    for (const i of [active + 1, active - 1]) {
      const photo = items[i];
      if (photo) void readTint(photo.url);
    }

    return () => {
      cancelled = true;
    };
  }, [active, items]);

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

  // 上下翻页就是把滚动条平滑地挪到下一屏，交给 scroll-snap 对齐
  const step = useCallback(
    (delta: number) => {
      const el = scrollerRef.current;
      if (!el || active === null) return;
      const next = Math.min(items.length - 1, Math.max(0, active + delta));
      el.scrollTo({ top: next * el.clientHeight, behavior: "smooth" });
    },
    [active, items.length]
  );

  // 滚动停稳后再同步序号，避免平滑滚动过程中来回跳
  const handleScroll = () => {
    if (settleRef.current) window.clearTimeout(settleRef.current);
    settleRef.current = window.setTimeout(() => {
      const el = scrollerRef.current;
      if (!el) return;
      const index = Math.round(el.scrollTop / el.clientHeight);
      setActive(Math.min(items.length - 1, Math.max(0, index)));
    }, 90);
  };

  // 大图打开时：Esc 关闭、上下/左右方向键翻页、锁定背景滚动
  useEffect(() => {
    if (active === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (editing) return;
      if (event.key === "Escape") setActive(null);
      if (event.key === "ArrowDown" || event.key === "ArrowRight") step(1);
      if (event.key === "ArrowUp" || event.key === "ArrowLeft") step(-1);
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
                className="fixed inset-0 z-[100]"
                style={{ backgroundColor: tint, transition: "background-color 900ms ease" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                {/* 顶部：序号 + 编辑 / 关闭（深色胶囊，压在照片或白底上都认得出） */}
                <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between p-4 sm:p-5">
                  <span className="select-none rounded-full bg-black/55 px-3 py-1 text-[11px] tracking-[0.35em] text-white/80 backdrop-blur-sm">
                    {String(active + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
                  </span>
                  <div className="pointer-events-auto flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="编辑地点 / 配文"
                      className="rounded-full bg-black/55 p-2.5 text-white/85 backdrop-blur-sm transition-colors hover:bg-black/75 hover:text-white"
                      onClick={startEditing}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      aria-label="关闭"
                      className="rounded-full bg-black/55 p-2.5 text-white/85 backdrop-blur-sm transition-colors hover:bg-black/75 hover:text-white"
                      onClick={() => setActive(null)}
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {/* 一屏一张：照片完整不裁切、按自身尺寸尽量占满，剩下空间给黑色文字区 */}
                <div
                  ref={scrollerRef}
                  onScroll={handleScroll}
                  className="h-full snap-y snap-mandatory overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                  {items.map((photo, index) => (
                    <section
                      key={photo.filename}
                      className="relative flex h-full w-full snap-start snap-always flex-col md:flex-row"
                    >
                      {/* 照片：完整展示（contain，零裁切），宽度随原图比例自适应，最多留 18rem 给文字 */}
                      <div className="flex shrink-0 items-center justify-center md:h-full">
                        <div className="relative inline-block">
                          <img
                            src={photo.url}
                            alt={photo.filename}
                            draggable={false}
                            className="block h-auto max-h-[62vh] w-auto max-w-full select-none md:max-h-screen md:max-w-[calc(100vw-16rem)]"
                          />
                          <PhotoArtwork filename={photo.filename} />
                        </div>
                      </div>

                      {/* 剩余空间：文字区。底色与左侧留白同一块（跟随照片颜色淡变） */}
                      <div className="relative flex flex-1 flex-col justify-center gap-4 px-7 py-8 md:h-full md:gap-5 md:px-10 md:py-16">
                        {/* 背景过渡：同一张照片放大模糊后贴着接缝铺进来，往外淡出到底色，
                            照片与文字区之间就没有硬边了。只渲染当前及前后各一张，滚动更轻。 */}
                        {Math.abs(index - active) <= 1 && (
                          <div
                            aria-hidden
                            className="pointer-events-none absolute inset-x-0 top-0 h-[46%] overflow-hidden [mask-image:linear-gradient(to_bottom,black_0%,black_6%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_0%,black_6%,transparent_100%)] md:inset-y-0 md:left-0 md:h-full md:w-[min(46%,24rem)] md:[mask-image:linear-gradient(to_right,black_0%,black_6%,transparent_100%)] md:[-webkit-mask-image:linear-gradient(to_right,black_0%,black_6%,transparent_100%)]"
                          >
                            {/* 镜面缩放：紧贴接缝的那一列就是照片挨着接缝的内容，色与光都是接得上的 */}
                            <div
                              className="absolute inset-0 bg-cover bg-center blur-[60px] saturate-125 [transform:scale(1.45,-1.45)] md:[transform:scale(-1.45,1.45)]"
                              style={{ backgroundImage: `url(${photo.url})` }}
                            />
                            {/* 压暗一层，靠近照片处轻、远端重，白字始终读得清 */}
                            <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/[.86] md:bg-gradient-to-r" />
                          </div>
                        )}
                        {photo.location && (
                          <h2 className="relative font-serif text-xl italic tracking-[0.14em] text-white/90 md:text-2xl">
                            {photo.location}
                          </h2>
                        )}
                        {photo.taken_at && (
                          <p className="relative text-[11px] tracking-[0.3em] text-white/35">
                            {photo.taken_at}
                          </p>
                        )}
                        {photo.mood && (
                          <p className="relative whitespace-pre-line text-sm leading-7 text-white/60">
                            {photo.mood}
                          </p>
                        )}
                        {!photo.location && !photo.mood && !photo.taken_at && (
                          <p className="relative text-xs leading-6 text-white/25">
                            点右上角铅笔，填上这张照片的地点与配文
                          </p>
                        )}
                      </div>
                    </section>
                  ))}
                </div>

                {/* 第一屏给一个下滑提示 */}
                {!editing && items.length > 1 && active === 0 && (
                  <div
                    className="pointer-events-none absolute bottom-5 left-0 flex w-full justify-center md:w-3/4"
                  >
                    <span className="animate-pulse rounded-full bg-black/45 px-3 py-1 text-[10px] tracking-[0.3em] text-white/70 backdrop-blur-sm">
                      向下滑动 · 下一张
                    </span>
                  </div>
                )}

                {/* 编辑面板（浮在底部，不打断画廊布局） */}
                {editing && (
                  <div className="absolute inset-x-0 bottom-0 z-30 flex justify-center p-4">
                    <div className="max-h-[58vh] w-[min(94vw,520px)] overflow-y-auto rounded-2xl bg-[#17141d]/95 p-4 shadow-2xl ring-1 ring-white/10 backdrop-blur">
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
                          <span className="w-14 shrink-0 text-white/60">配文</span>
                          <input
                            value={form.mood}
                            onChange={(event) =>
                              setForm((prev) => ({ ...prev, mood: event.target.value }))
                            }
                            placeholder="例如：秋天的午后，落叶铺满了整条路"
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
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
