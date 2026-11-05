/**
 * 背景风格判定与过渡时长，供 SiteBackground / PageTransition / PageContentFade 共用，
 * 三处必须用同一套规则，否则背景与文字的过渡会对不上。
 */

// 这些路由使用流动噪声背景，其余页面用 MicroSlats 板条背景
export const isNoisePage = (path: string) =>
  /^\/notes\/\d+\/?$/.test(path) || /^\/photo\/?$/.test(path);

// 新背景从左侧推上来、把旧页面盖住的时长（跳转发生在这个时长之后）
export const WIPE_MS = 1600;

// 跳转之后、撤掉转场层之前的等待：留给新页面渲染和正文层隐藏
export const REVEAL_DELAY_MS = 160;

// 撤掉转场层后，正文缓缓浮现的时长
export const TEXT_FADE_MS = 900;

/**
 * 是否真的有一次背景转场在进行。
 * 转场从「点击」那一刻开始（此时还没跳转），到撤掉转场层时结束。
 * 正文只在转场期间隐藏，浏览器前进/后退这种没转场的跳转就不会白闪一下。
 */
export const transitionState = { pending: false };
