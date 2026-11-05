import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import SiteBackground from "@/components/SiteBackground";
import PageTransition from "@/components/PageTransition";
import PageContentFade from "@/components/PageContentFade";
import MusicPlayer from "@/components/MusicPlayer";

export const metadata: Metadata = {
  title: "Grace's Blog",
  description: "个人知识库与学习管理系统",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <SiteBackground />
        <PageTransition />
        <Navbar />
        <MusicPlayer />
        <main className="max-w-6xl mx-auto px-4 py-8 relative z-10">
          <PageContentFade>{children}</PageContentFade>
        </main>
      </body>
    </html>
  );
}
