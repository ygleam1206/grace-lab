"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { REVEAL_DELAY_MS, TEXT_FADE_MS, transitionState } from "./transitionRules";

// 转场层撤掉之后，正文才开始浮现，所以这里略晚于 REVEAL_DELAY_MS
const SHOW_DELAY_MS = REVEAL_DELAY_MS + 60;

/**
 * 正文显隐：
 * 只在「确实有背景转场」的那次跳转里参与——
 * 跳转发生的那一刻先把正文藏起来（此时整屏还被转场层盖着，看不到），
 * 等转场层撤掉后，再用 TEXT_FADE_MS 缓缓浮现。
 * 没转场的跳转（前进/后退、同风格路由）正文一直可见，不会白闪。
 */
export default function PageContentFade({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  const previousPath = useRef(pathname);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const from = previousPath.current;
    if (from === pathname) return;
    previousPath.current = pathname;

    // 没有转场在进行：正文保持可见
    if (!transitionState.pending) {
      if (timer.current) clearTimeout(timer.current);
      setHidden(false);
      return;
    }

    setHidden(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setHidden(false), SHOW_DELAY_MS);
  }, [pathname]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return (
    <div
      style={{
        opacity: hidden ? 0 : 1,
        // 藏起来要瞬时（被转场层盖着，看不见），浮现才慢慢来
        transition: hidden ? "none" : `opacity ${TEXT_FADE_MS}ms ease-out`,
        willChange: "opacity",
      }}
    >
      {children}
    </div>
  );
}
