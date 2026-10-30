"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Camera, Home } from "lucide-react";

const navItems = [
  { href: "/", label: "首页", icon: Home },
  { href: "/notes", label: "知识库", icon: BookOpen },
  { href: "/photo", label: "Photo", icon: Camera },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="glass sticky top-0 z-50 mx-3 mt-4 px-4 sm:mx-4 sm:px-6 py-3 flex items-center justify-between" style={{ borderRadius: 9999 }}>
      <Link href="/" className="text-lg sm:text-xl font-bold tracking-wide shrink-0">
        Grace Lab
      </Link>
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
