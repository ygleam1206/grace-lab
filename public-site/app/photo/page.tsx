"use client";

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

export default function PhotoPage() {
  return (
    <div>
      <div className="flex items-end justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold">Photo</h1>
          <p className="text-sm text-white/50 mt-2">生活碎片 · {photos.length} 张</p>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="origin-top scale-[0.6] sm:scale-[0.8] lg:scale-100 h-[210px] sm:h-[270px] lg:h-[320px] flex items-start justify-center">
          <BounceCards
            images={photos}
            containerWidth={500}
            containerHeight={320}
            cardSize={200}
            spread={85}
            rotation={10}
            arc={0}
            pushDistance={160}
            hoverScale={1.06}
            bounciness={0.6}
            animationDelay={0.5}
            animationStagger={0.06}
            borderWidth={5}
            borderColor="#ffffff"
            radius={25}
            shadow
            enableHover
          />
        </div>
      </div>
    </div>
  );
}
