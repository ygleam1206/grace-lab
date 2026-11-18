"use client";

import { usePathname } from "next/navigation";
import SimplexNoiseBg from "./SimplexNoiseBg";
import MicroSlatsBg from "./MicroSlatsBg";
import { isNoisePage } from "./transitionRules";

/**
 * 全站背景路由切换（规则在 transitionRules.isNoisePage）：
 * - /notes 整个子树（列表、分类、详情）、/photo、/about 用流动噪声背景
 * - 其余页面统一用 MicroSlats 板条波浪背景
 */
export default function SiteBackground() {
  const pathname = usePathname() || "";

  return isNoisePage(pathname) ? <SimplexNoiseBg /> : <MicroSlatsBg />;
}
