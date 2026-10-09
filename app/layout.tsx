import type { Metadata } from "next";
import "./globals.css";
import { siteConfig } from "@/siteConfig";
import Navbar from "@/components/Navbar";
import SimplexNoiseBg from "@/components/SimplexNoiseBg";
import MusicPlayer from "@/components/MusicPlayer";

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.bio,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <SimplexNoiseBg />
        <Navbar />
        <MusicPlayer />
        <main className="max-w-6xl mx-auto px-4 py-8 relative z-10">{children}</main>
      </body>
    </html>
  );
}
