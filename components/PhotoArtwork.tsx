"use client";

import { useMemo } from "react";

/**
 * 照片的独立杂志（Editorial / Travel Zine）地图图层。
 *
 * 原则：原照片一个像素都不动，地图是叠在上面的透明矢量层；
 * 只画细线条、低饱和、少量英文地名，用一个小红点标大致区域（无 GPS 不标坐标）。
 * 新增作品只要在 ARTWORKS 里登记 filename + 区域 + 一张 <svg> 即可。
 */

interface Artwork {
  /** 线条颜色：亮的天空用深墨（multiply），夜色天空用浅线（screen） */
  tone: "dark" | "light";
  /** 图层贴合的百分比区域（相对照片原始画幅） */
  region: { left: string; top: string; width: string; height: string };
  art: React.ReactNode;
}

const SERIF = "Georgia, 'Times New Roman', 'Songti SC', serif";
const PIN = "#c0392b";

/* ------------------------------------------------------------------ */
/* 北京：秋日街路 —— 等高线 + 公路 + 步道（参照 NZ 那张的制图语言）      */
/* ------------------------------------------------------------------ */
function BeijingMap() {
  return (
    <svg viewBox="0 0 1000 570" preserveAspectRatio="none" className="h-full w-full" fill="none">
      <defs>
        <radialGradient id="bj-fade" cx="48%" cy="50%" r="68%">
          <stop offset="50%" stopColor="#fff" />
          <stop offset="100%" stopColor="#000" />
        </radialGradient>
        <mask id="bj-mask">
          <rect width="1000" height="570" fill="url(#bj-fade)" />
        </mask>
      </defs>

      <g mask="url(#bj-mask)" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        {/* 等高线：一圈圈被压扁的地形环 */}
        <g strokeWidth="1.2" opacity="0.5">
          <ellipse cx="286" cy="352" rx="58" ry="28" transform="rotate(-11 286 352)" />
          <ellipse cx="300" cy="346" rx="96" ry="46" transform="rotate(-11 300 346)" />
          <ellipse cx="316" cy="340" rx="136" ry="64" transform="rotate(-10 316 340)" />
          <ellipse cx="334" cy="334" rx="178" ry="84" transform="rotate(-9 334 334)" />
          <ellipse cx="356" cy="328" rx="224" ry="106" transform="rotate(-8 356 328)" />
          <ellipse cx="382" cy="322" rx="272" ry="130" transform="rotate(-7 382 322)" />
        </g>

        {/* 公路：主路 + 细支路 + 中线 */}
        <path
          d="M -20 474 C 140 444 246 366 386 324 C 526 282 706 254 1020 228"
          strokeWidth="3.2"
          opacity="0.55"
        />
        <path
          d="M -20 550 C 120 512 214 452 330 400 C 446 348 560 318 690 296"
          strokeWidth="1.6"
          opacity="0.7"
        />
        <path
          d="M -20 474 C 140 444 246 366 386 324 C 526 282 706 254 1020 228"
          strokeWidth="0.9"
          strokeDasharray="24 20"
          opacity="0.85"
        />

        {/* 步道：虚线穿过等高线 */}
        <path
          d="M 408 -10 C 428 96 458 176 512 236 C 566 296 600 386 610 500"
          strokeWidth="1.5"
          strokeDasharray="10 9"
          opacity="0.75"
        />

        {/* 两座山形标记 */}
        <g strokeWidth="1.3" opacity="0.6">
          <path d="M 676 118 L 690 94 L 704 118" />
          <path d="M 712 118 L 726 94 L 740 118" />
        </g>

        {/* 制图图例：Road / Trail / Contour（压在路面左下角，避开车辆） */}
        <g stroke="none" fontFamily={SERIF} fill="currentColor" fontStyle="italic">
          <g stroke="currentColor">
            <path d="M 44 432 L 114 432" strokeWidth="1.8" opacity="0.85" />
            <path d="M 44 470 L 114 470" strokeWidth="1.4" strokeDasharray="9 7" opacity="0.8" />
            <path d="M 44 508 C 58 500 66 516 80 508 C 94 500 102 516 114 508" strokeWidth="1.2" opacity="0.7" />
          </g>
          <text x="128" y="437" fontSize="15" opacity="0.85" letterSpacing="0.4" paintOrder="stroke" stroke="#0b0a10" strokeOpacity="0.45" strokeWidth="3">
            Road
          </text>
          <text x="128" y="475" fontSize="15" opacity="0.85" letterSpacing="0.4" paintOrder="stroke" stroke="#0b0a10" strokeOpacity="0.45" strokeWidth="3">
            Trail
          </text>
          <text x="128" y="513" fontSize="13" opacity="0.7" letterSpacing="0.4" paintOrder="stroke" stroke="#0b0a10" strokeOpacity="0.45" strokeWidth="3">
            Contour (200 m)
          </text>
        </g>

        {/* 地名 */}
        <g stroke="none" fill="currentColor" fontFamily={SERIF} fontStyle="italic">
          <text
            x="556"
            y="214"
            fontSize="42"
            letterSpacing="13"
            opacity="0.95"
            paintOrder="stroke"
            stroke="#0b0a10"
            strokeOpacity="0.35"
            strokeWidth="4"
          >
            BEIJING
          </text>
          <text
            x="560"
            y="252"
            fontSize="14"
            letterSpacing="6"
            opacity="0.75"
            paintOrder="stroke"
            stroke="#0b0a10"
            strokeOpacity="0.3"
            strokeWidth="3"
          >
            NOV · 2025 · AUTUMN
          </text>
        </g>

        {/* 小红点：只标大致区域，不代表精确坐标 */}
        <g stroke="none">
          <circle cx="470" cy="322" r="16" fill={PIN} opacity="0.32" />
          <circle cx="470" cy="322" r="10" fill="none" stroke="#ffffff" strokeOpacity="0.7" strokeWidth="1.6" />
          <circle cx="470" cy="322" r="6.2" fill="#e8452c" />
        </g>
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* 天津：解放桥夜色 —— 海河两岸的城市街道网（参照 Marina Bay 那张）      */
/* ------------------------------------------------------------------ */
const TJ_RIVER = "M 118 -20 C 158 120 208 192 230 282 C 250 364 212 434 242 514 C 274 600 342 644 362 734 C 378 806 360 862 342 930";

function TianjinMap() {
  // 街道网用固定种子生成：服务端与客户端结果一致，不用手写上百条线
  const { streets, arterials } = useMemo(() => {
    let seed = 20261115;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

    const streets: string[] = [];
    for (let x = -12; x < 640; x += 25) {
      let d = `M ${x + rnd() * 8 - 4} -12`;
      for (let y = 46; y <= 912; y += 78) d += ` L ${(x + rnd() * 16 - 8).toFixed(1)} ${y}`;
      streets.push(d);
    }
    for (let y = -8; y < 900; y += 33) {
      let d = `M -12 ${y + rnd() * 6 - 3}`;
      for (let x = 52; x <= 632; x += 74) d += ` L ${x} ${(y + rnd() * 14 - 7).toFixed(1)}`;
      streets.push(d);
    }

    const arterials = [
      "M -10 250 C 120 236 240 262 430 236 C 520 224 580 232 640 214",
      "M 60 -10 C 96 180 130 320 150 470 C 168 610 150 760 128 910",
      "M 400 -10 C 392 150 384 300 404 430 C 424 560 470 690 500 910",
    ];

    return { streets, arterials };
  }, []);

  return (
    <svg viewBox="0 0 620 900" preserveAspectRatio="none" className="h-full w-full" fill="none">
      <defs>
        <radialGradient id="tj-fade" cx="44%" cy="46%" r="64%">
          <stop offset="48%" stopColor="#fff" />
          <stop offset="100%" stopColor="#000" />
        </radialGradient>
        <mask id="tj-fade-mask">
          <rect width="620" height="900" fill="url(#tj-fade)" />
        </mask>
        {/* 河道挖空：街道网在水面上断开 */}
        <mask id="tj-city-mask">
          <rect width="620" height="900" fill="#fff" />
          <path d={TJ_RIVER} stroke="#000" strokeWidth="44" fill="none" strokeLinecap="round" />
        </mask>
      </defs>

      <g mask="url(#tj-fade-mask)" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        {/* 街区道路 */}
        <g mask="url(#tj-city-mask)" strokeWidth="1.1" opacity="0.62">
          {streets.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
        <g mask="url(#tj-city-mask)" strokeWidth="1.9" opacity="0.75">
          {arterials.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>

        {/* 水面：一层极淡的宽带 + 两条岸线 */}
        <path d={TJ_RIVER} strokeWidth="30" opacity="0.14" />
        <g strokeWidth="1.5" opacity="0.95">
          <path d={TJ_RIVER} transform="translate(-17 0)" />
          <path d={TJ_RIVER} transform="translate(16 0)" />
        </g>

        {/* 河心小岛 */}
        <g strokeWidth="1.1" opacity="0.6" fill="none">
          <ellipse cx="300" cy="318" rx="17" ry="8" transform="rotate(-28 300 318)" />
          <ellipse cx="332" cy="700" rx="13" ry="6" transform="rotate(-40 332 700)" />
        </g>

        {/* 桥：几条横向短线跨过水面 */}
        <g strokeWidth="1.3" opacity="0.75">
          <path d="M 196 196 L 262 208" />
          <path d="M 214 424 L 282 430" />
          <path d="M 330 628 L 396 634" />
        </g>

        {/* 地名 */}
        <g stroke="none" fill="currentColor" fontFamily={SERIF} fontStyle="italic">
          <text x="52" y="112" fontSize="32" letterSpacing="10" opacity="0.85">
            TIANJIN
          </text>
          <text x="54" y="142" fontSize="13" letterSpacing="5" opacity="0.55">
            HAI HE · NIGHT
          </text>
          <text
            x="300"
            y="470"
            fontSize="17"
            letterSpacing="5"
            opacity="0.6"
            transform="rotate(70 300 470)"
          >
            HAI HE
          </text>
          <text x="286" y="416" fontSize="16" letterSpacing="2.5" opacity="0.8">
            Jiefang Bridge
          </text>
        </g>

        {/* 小红点：解放桥大致位置 */}
        <g stroke="none">
          <circle cx="248" cy="426" r="14" fill={PIN} opacity="0.3" />
          <circle cx="248" cy="426" r="8" fill="none" stroke="#ffffff" strokeOpacity="0.6" strokeWidth="1.3" />
          <circle cx="248" cy="426" r="5" fill="#e8452c" />
        </g>
      </g>
    </svg>
  );
}

const ARTWORKS: Record<string, Artwork> = {
  // 北京 · 秋日林荫路（图层压在下方路面，深底用浅线）
  "27f632a668fb7beb952b5945303bbbde.jpg": {
    tone: "light",
    region: { left: "2%", top: "62%", width: "42%", height: "36%" },
    art: <BeijingMap />,
  },
  // 天津 · 解放桥 / 世纪钟夜景
  "2992b13f205ffe1b4ac01aad9aa2b0a7.jpg": {
    tone: "light",
    region: { left: "0%", top: "2%", width: "42%", height: "45%" },
    art: <TianjinMap />,
  },
};

/** 有作品的返回 true，页面可据此决定是否加纸感底纹 */
export function hasArtwork(filename: string) {
  return Boolean(ARTWORKS[filename]);
}

export default function PhotoArtwork({ filename }: { filename: string }) {
  const artwork = ARTWORKS[filename];
  if (!artwork) return null;

  const { tone, region, art } = artwork;

  return (
    <div
      className="pointer-events-none absolute select-none"
      style={{ left: region.left, top: region.top, width: region.width, height: region.height }}
      aria-hidden
    >
      <div
        className={tone === "dark" ? "h-full w-full text-[#3a2c1d]" : "h-full w-full text-[#eef2f8]"}
        style={{
          mixBlendMode: tone === "dark" ? "multiply" : "screen",
          opacity: tone === "dark" ? 0.66 : 0.8,
        }}
      >
        {art}
      </div>
      {/* 极轻的纸张颗粒：一行近乎透明的噪点，只为了让线条不像数字矢量 */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='120' height='120' filter='url(%23n)' opacity='0.5'/></svg>\")",
          opacity: 0.05,
          mixBlendMode: "overlay",
        }}
      />
    </div>
  );
}
