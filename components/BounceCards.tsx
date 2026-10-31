"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface BounceCardsProps {
  images: string[];
  containerWidth?: number;
  containerHeight?: number;
  cardSize?: number;
  spread?: number;
  rotation?: number;
  arc?: number;
  pushDistance?: number;
  hoverScale?: number;
  bounciness?: number;
  animationDelay?: number;
  animationStagger?: number;
  borderWidth?: number;
  borderColor?: string;
  radius?: number;
  shadow?: boolean;
  enableHover?: boolean;
  className?: string;
  /** 点击卡片时回调，参数为该行内的索引 */
  onImageClick?: (index: number) => void;
}

/**
 * 扇形卡片照片墙：卡片按 spread 横向铺开、rotation 角度呈扇形，
 * 悬停时相邻卡片被推开（pushDistance），且带弹簧回弹（bounciness）。
 */
export default function BounceCards({
  images,
  containerWidth = 500,
  containerHeight = 320,
  cardSize = 200,
  spread = 85,
  rotation = 10,
  arc = 0,
  pushDistance = 160,
  hoverScale = 1.06,
  bounciness = 0.6,
  animationDelay = 0.5,
  animationStagger = 0.06,
  borderWidth = 5,
  borderColor = "#ffffff",
  radius = 25,
  shadow = true,
  enableHover = true,
  className = "",
  onImageClick,
}: BounceCardsProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const mid = (images.length - 1) / 2;

  // 计算第 i 张卡片的位移 / 旋转，悬停时把其余卡片向外推开
  const getTransform = (i: number) => {
    const offset = i - mid;
    let x = offset * spread;
    let y = arc * Math.abs(offset);
    let rotate = offset * rotation;

    if (enableHover && hovered !== null && i !== hovered) {
      const distance = Math.abs(i - hovered);
      const push = pushDistance * Math.max(0, 1 - distance * 0.35);
      const direction = i < hovered ? -1 : 1;
      x += direction * push;
      y += push * 0.08;
      rotate += direction * 6;
    }

    return { x, y, rotate };
  };

  return (
    <div
      className={`relative ${className}`}
      style={{ width: containerWidth, height: containerHeight }}
    >
      {images.map((src, i) => {
        const { x, y, rotate } = getTransform(i);
        const isHovered = hovered === i;

        return (
          <motion.div
            key={`${src}-${i}`}
            className="absolute cursor-pointer"
            role={onImageClick ? "button" : undefined}
            tabIndex={onImageClick ? 0 : undefined}
            aria-label={onImageClick ? "查看大图" : undefined}
            style={{
              width: cardSize,
              height: cardSize,
              left: "50%",
              top: "50%",
              marginLeft: -cardSize / 2,
              marginTop: -cardSize / 2,
              borderRadius: radius,
              border: `${borderWidth}px solid ${borderColor}`,
              overflow: "hidden",
              boxShadow: shadow ? "0 18px 40px rgba(0, 0, 0, 0.45)" : undefined,
              zIndex: isHovered ? images.length + 10 : i + 1,
              willChange: "transform",
            }}
            animate={{ x, y, rotate, scale: isHovered ? hoverScale : 1 }}
            transition={{ type: "spring", bounce: bounciness, duration: 0.55 }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onImageClick?.(i)}
            onKeyDown={(event) => {
              if (!onImageClick) return;
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onImageClick(i);
              }
            }}
          >
            <motion.div
              className="w-full h-full"
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: "spring",
                bounce: bounciness,
                duration: 0.9,
                delay: animationDelay + i * animationStagger,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                className="w-full h-full object-cover select-none pointer-events-none"
                draggable={false}
              />
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}
