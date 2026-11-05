"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import SimplexNoiseBg from "./SimplexNoiseBg";
import MicroSlatsBg from "./MicroSlatsBg";
import { REVEAL_DELAY_MS, WIPE_MS, isNoisePage, transitionState } from "./transitionRules";

const BASE_PATH = "/grace-lab";

// 遮罩：左边不透明、右边透明，mask-size 放大到 300%，
// mask-position 从 100% 推到 0%，就是一条「新背景从左边推进来」的柔和抹除带
const MASK = "linear-gradient(to right, #000 0%, #000 47%, transparent 53%, transparent 100%)";
const MASK_SIZE = "300% 100%";

type Run = { id: number; toNoise: boolean };

/**
 * 背景转场（跳转前先播，跳转后再撤）：
 * 1. 拦住「背景风格不同」的内部链接，先不跳转——旧页面连同文字、卡片原样留着；
 * 2. 新页面的背景作为一层从左侧柔和地推上来，把旧页面慢慢盖住；
 * 3. 盖满之后再真正 router.push，新页面在转场层下面渲染；
 * 4. 等正文层完成隐藏，再撤掉转场层（此时两边都是同一张背景，撤掉无缝），
 *    正文由 PageContentFade 缓缓浮现。
 * 这样跳转前页面元素不会凭空消失。
 */
export default function PageTransition() {
  const router = useRouter();
  const pathname = usePathname() || "";
  const [run, setRun] = useState<Run | null>(null);
  const busy = useRef(false);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (busy.current || event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;

      // usePathname 不含 basePath，这里把前缀去掉再比较
      const path = url.pathname.startsWith(BASE_PATH)
        ? url.pathname.slice(BASE_PATH.length) || "/"
        : url.pathname;
      if (path === pathname || isNoisePage(path) === isNoisePage(pathname)) return;

      // 风格要变，先接管这次跳转：旧页面连同文字、卡片原样留在屏幕上，只让新背景从左侧漫上来
      event.preventDefault();
      busy.current = true;
      transitionState.pending = true;
      setRun({ id: Date.now(), toNoise: isNoisePage(path) });

      window.setTimeout(() => {
        router.push(path + url.search);
        // 等新页面渲染、正文层完成隐藏后再撤掉转场层
        window.setTimeout(() => {
          transitionState.pending = false;
          setRun(null);
          busy.current = false;
        }, REVEAL_DELAY_MS);
      }, WIPE_MS);
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [pathname, router]);

  if (!run) return null;

  return (
    <div className="fixed inset-0 z-[60] pointer-events-none overflow-hidden" aria-hidden="true">
      <div
        key={run.id}
        className="absolute inset-0"
        style={{
          maskImage: MASK,
          WebkitMaskImage: MASK,
          maskSize: MASK_SIZE,
          WebkitMaskSize: MASK_SIZE,
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
          animation: `bg-wipe ${WIPE_MS}ms ease-in-out forwards`,
        }}
      >
        {run.toNoise ? <SimplexNoiseBg /> : <MicroSlatsBg intro={false} />}
      </div>
    </div>
  );
}
