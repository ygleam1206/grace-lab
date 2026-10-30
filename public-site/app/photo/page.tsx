"use client";

import { useEffect, useState } from "react";
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
const SPREAD = 85;

// 桌面每行最多 8 张，窄屏（<1024）每行 4 张，超出的换到下一行
function chunk(list: string[], size: number) {
  const rows: string[][] = [];
  for (let i = 0; i < list.length; i += size) {
    rows.push(list.slice(i, i + size));
  }
  return rows;
}

export default function PhotoPage() {
  const [perRow, setPerRow] = useState(8);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const apply = () => setPerRow(mq.matches ? 8 : 4);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const rows = chunk(photos, perRow);

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
          // 容器宽度按本行张数计算，保证旋转后的卡片不被挤压
          const rowWidth = Math.max(500, Math.round((row.length - 1) * SPREAD + CARD_SIZE * 1.5));

          return (
            <div key={rowIndex} className="flex justify-center">
              <div className="[zoom:0.6] sm:[zoom:0.78] lg:[zoom:1]">
                <BounceCards
                  images={row}
                  containerWidth={rowWidth}
                  containerHeight={320}
                  cardSize={CARD_SIZE}
                  spread={SPREAD}
                  rotation={10}
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
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
