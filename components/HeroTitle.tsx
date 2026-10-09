import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Text_03 } from "@/components/ui/wave-text";
import { siteConfig } from "@/siteConfig";
import HomePhoto from "@/components/HomePhoto";

export default function HeroTitle() {
  const words = siteConfig.title.split(" ");
  const line1 = words[0] || siteConfig.title;
  const line2 = words.slice(1).join(" ") || "";

  const titleStyle = "font-bold italic text-white leading-none";
  const titleSize = { fontSize: "clamp(4rem, 10vw, 9rem)", letterSpacing: "-0.04em" };

  return (
    <div className="relative mb-16 pt-8 pb-4">
      {/* 右上角小字 */}
      <div className="absolute top-0 right-0 text-right">
        <p className="text-xs text-white/40 tracking-widest">个人知识库</p>
        <p className="text-xs text-white/50 tracking-[0.2em] uppercase mt-0.5">
          {siteConfig.authorName}
        </p>
      </div>

      {/* 大标题 — 两行错位排版 + 波浪动画 */}
      <div className="leading-[0.9]">
        <h1 className={titleStyle} style={titleSize}>
          <Text_03 text={line1} />
        </h1>
        {line2 && (
          <h1 className={`${titleStyle} ml-[30%]`} style={titleSize}>
            <Text_03 text={line2} />
          </h1>
        )}
      </div>

      {/* 底部：左侧描述 + 右侧按钮 */}
      <div className="flex items-end justify-between mt-8">
        <p className="text-sm text-white/50 max-w-md leading-relaxed">
          {siteConfig.bio}
        </p>
        <Link
          href="/notes"
          className="flex items-center gap-1.5 border border-white/30 rounded-full px-5 py-2 text-sm hover:bg-white/10 transition-all shrink-0"
        >
          VISIT <ArrowUpRight size={14} />
        </Link>
      </div>

      {/* 右侧照片（绝对定位，不影响原有布局） */}
      <HomePhoto src="/images/hero.png" alt="Hero" />
    </div>
  );
}
