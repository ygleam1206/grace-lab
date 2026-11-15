"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Camera, Home } from "lucide-react";
import profileData from "@/app/profile.json";

const BASE_PATH = "/grace-lab";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/notes", label: "Articles", icon: BookOpen },
  { href: "/photo", label: "Photo", icon: Camera },
];

export default function Navbar() {
  const pathname = usePathname();
  // 头像来自导出快照，换头像后要重新跑 npm run publish 才会更新
  const avatar = (profileData as { avatar: string }).avatar;

  return (
    // z-index 要高于背景转场层（z-[60]），否则转场那 1.6 秒会把导航栏一起盖住，看着像消失了
    <nav className="glass sticky top-0 z-[70] mx-3 mt-4 px-4 sm:mx-4 sm:px-6 py-3 flex items-center justify-between" style={{ borderRadius: 9999 }}>
      <div className="flex items-center gap-2.5 min-w-0">
        {avatar && (
          <Link href="/about" title="About me" className="shrink-0 rounded-full">
            <img
              src={`${BASE_PATH}/uploads/${avatar}`}
              alt="About me"
              className="h-8 w-8 rounded-full object-cover ring-1 ring-white/30 hover:ring-white/70 transition-all"
              draggable={false}
            />
          </Link>
        )}
        <Link href="/" className="text-lg sm:text-xl font-bold tracking-wide shrink-0">
          Grace Lab
        </Link>
      </div>
      <div className="flex gap-0.5 sm:gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1.5 px-2.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm transition-all ${
                active
                  ? "bg-white/25 font-semibold"
                  : "hover:bg-white/10"
              }`}
            >
              <Icon size={16} className="hidden sm:block" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
