"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { BookOpen, Camera, FolderOpen, BarChart3, Home, User } from "lucide-react";
import { siteConfig } from "@/siteConfig";

const navItems = [
  { href: "/", label: "首页", icon: Home },
  { href: "/notes", label: "知识库", icon: BookOpen },
  { href: "/photo", label: "照片", icon: Camera },
  { href: "/files", label: "文件", icon: FolderOpen },
  { href: "/study", label: "学习", icon: BarChart3 },
];

export default function Navbar() {
  const pathname = usePathname();
  const [avatar, setAvatar] = useState("");

  // 头像就是 About 页的入口，接口失败时退回图标入口，不会让页面失联
  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => setAvatar(data.avatar || ""))
      .catch(() => {});
  }, []);

  return (
    <nav className="glass sticky top-0 z-50 mx-4 mt-4 px-6 py-3 flex items-center justify-between" style={{ borderRadius: 9999 }}>
      <div className="flex items-center gap-2.5 min-w-0">
        <Link href="/about" title="About me" className="shrink-0 rounded-full">
          {avatar ? (
            <img
              src={`/uploads/${avatar}`}
              alt="About me"
              className="h-8 w-8 rounded-full object-cover ring-1 ring-white/30 hover:ring-white/70 transition-all"
              draggable={false}
            />
          ) : (
            <span className="h-8 w-8 rounded-full bg-white/15 ring-1 ring-white/25 flex items-center justify-center text-white/60 hover:bg-white/25 transition-all">
              <User size={16} />
            </span>
          )}
        </Link>
        <Link href="/" className="text-xl font-bold tracking-wide shrink-0">
          {siteConfig.navTitle}
        </Link>
      </div>
      <div className="flex gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm transition-all ${
                active
                  ? "bg-white/25 font-semibold"
                  : "hover:bg-white/10"
              }`}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
