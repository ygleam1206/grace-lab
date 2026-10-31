"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import BounceCards from "@/components/BounceCards";
import photosData from "../photos.json";

const BASE_PATH = "/grace-lab";

// photos.json 为空时的占位照片（放入真实照片后自动替换）
const SAMPLE_PHOTOS = [
  "https://images.unsplash.com/photo-1724152312974-d4d48b8b36fd?w=480&h=480&fit=crop",
  "https://images.unsplash.com/photo-1762846818262-33c197852fa8?w=480&h=480&fit=crop",
  "https://images.unsplash.com/photo-1721407964262-f9864b562453?w=480&h=480&fit=crop",
  "https://images.unsplash.com/photo-1776394254711-4a0d7345269a?w=480&h=480&fit=crop",
  "https://images.unsplash.com/photo-1763440519433-5467759054fc?w=480&h=480&fit=crop",
];

const files = photosData as string[];

const photos =
  files.length > 0
    ? files.map((file) =>
        /^https?:\/\//.test(file)
          ? file
          : `${BASE_PATH}/images/photos/${encodeURIComponent(file)}`
      )
    : SAMPLE_PHOTOS;

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

// 桌面每行最多 8 张，窄屏（<1024）每行 4 张；超出的换行，各行张数尽量均摊（避免末行只剩一张）
function chunk(list: string[], maxPerRow: number) {
  const rowCount = Math.ceil(list.length / maxPerRow);
  const base = Math.floor(list.length / rowCount);
  const extra = list.length % rowCount;

  const rows: string[][] = [];
  let cursor = 0;
  for (let i = 0; i < rowCount; i++) {
    const size = base + (i < extra ? 1 : 0);
    rows.push(list.slice(cursor, cursor + size));
    cursor += size;
  }
  return rows;
}

export default function PhotoPage() {
  const [perRow, setPerRow] = useState(8);
  const [active, setActive] = useState<number | null>(null);
  // 大图需挂在 body 下，否则会被 main 的 z-index 层叠上下文压在导航栏下面
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const apply = () => setPerRow(mq.matches ? 8 : 4);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const step = useCallback((delta: number) => {
    setActive((current) => {
      if (current === null) return current;
      return (current + delta + photos.length) % photos.length;
    });
  }, []);

  // 大图打开时：Esc 关闭、左右方向键翻页、锁定背景滚动
  useEffect(() => {
    if (active === null) return;
    const onKey = (event: KeyboardEvent) => {
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
  }, [active, step]);

  const rows = chunk(photos, perRow);
  // 每行第一张照片在总列表中的下标，用于点击时定位大图
  let rowStart = 0;

  return (
    <div>
      <div className="flex items-end justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold">Photo</h1>
          <p className="text-sm text-white/50 mt-2">生活碎片 · {photos.length} 张</p>
        </div>
      </div>

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
                  images={row}
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
            {active !== null && (
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

                {photos.length > 1 && (
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

                <motion.img
                  key={active}
                  src={photos[active]}
                  alt=""
                  draggable={false}
                  className="max-h-[86vh] max-w-[92vw] rounded-xl shadow-2xl select-none"
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ type: "spring", bounce: 0.25, duration: 0.4 }}
                  onClick={(event) => event.stopPropagation()}
                />

                <span className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs tracking-[0.3em] text-white/60">
                  {active + 1} / {photos.length}
                </span>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
