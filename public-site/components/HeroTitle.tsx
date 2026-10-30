import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Text_03 } from "@/components/ui/wave-text";

export default function HeroTitle() {
  const title = "Grace's Blog";
  const words = title.split(" ");
  const line1 = words[0] || title;
  const line2 = words.slice(1).join(" ") || "";

  const titleStyle = "font-bold italic text-white leading-none whitespace-nowrap";
  const titleSize = { fontSize: "clamp(4.2rem, 6vw, 6.9rem)", letterSpacing: "-0.04em" };

  return (
    <div className="flex flex-col">
      {/* 顶部小字 */}
      <div>
        <p className="text-xs text-white/40 tracking-widest">文章</p>
        <p className="text-xs text-white/50 tracking-[0.2em] uppercase mt-0.5">Grace</p>
      </div>

      {/* 大标题 — 两行错位排版 + 波浪动画 */}
      <div className="mt-10 lg:mt-20 leading-[0.95]">
        <h1 className={titleStyle} style={titleSize}>
          <Text_03 text={line1} />
        </h1>
        {line2 && (
          <h1 className={`${titleStyle} ml-[14%]`} style={titleSize}>
            <Text_03 text={line2} />
          </h1>
        )}
      </div>

      {/* 描述 */}
      <p className="text-sm text-white/50 leading-relaxed mt-8 max-w-[280px]">
        个人知识库与学习管理系统
      </p>

      {/* VISIT 按钮 */}
      <Link
        href="/notes"
        className="mt-6 flex items-center gap-1.5 self-start border border-white/30 rounded-full px-5 py-2 text-sm hover:bg-white/10 transition-all"
      >
        VISIT <ArrowUpRight size={14} />
      </Link>
    </div>
  );
}
