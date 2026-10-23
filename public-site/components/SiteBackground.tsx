"use client";

import { usePathname } from "next/navigation";
import SimplexNoiseBg from "./SimplexNoiseBg";
import MicroSlatsBg from "./MicroSlatsBg";

/**
 * 全站背景路由切换：
 * - 文章详情页（/notes/:id）用原来的流动噪声背景，保证长文可读性
 * - 其余页面统一用 MicroSlats 板条波浪背景
 */
export default function SiteBackground() {
  const pathname = usePathname() || "";
  const isNoteDetail = /^\/notes\/\d+\/?$/.test(pathname);

  return isNoteDetail ? <SimplexNoiseBg /> : <MicroSlatsBg />;
}
