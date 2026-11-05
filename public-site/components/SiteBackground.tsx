"use client";

import { usePathname } from "next/navigation";
import SimplexNoiseBg from "./SimplexNoiseBg";
import MicroSlatsBg from "./MicroSlatsBg";
import { isNoisePage } from "./transitionRules";

/**
 * 全站背景路由切换：
 * - 文章详情页（/notes/:id）与照片墙页（/photo）用原来的流动噪声背景
 * - 其余页面统一用 MicroSlats 板条波浪背景
 */
export default function SiteBackground() {
  const pathname = usePathname() || "";

  return isNoisePage(pathname) ? <SimplexNoiseBg /> : <MicroSlatsBg />;
}
