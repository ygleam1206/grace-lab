"use client";

import notesData from "./notes.json";
import categoriesData from "./categories.json";
import HeroTitle from "@/components/HeroTitle";
import SiteMeta from "@/components/SiteMeta";
import NoteFeed from "@/components/NoteFeed";
import LiveDate from "@/components/LiveDate";

const BASE_PATH = "/grace-lab";

interface Note {
  id: number;
  title: string;
  content: string;
  category: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

interface Category {
  id: number;
  name: string;
  cover_image: string;
  note_count: number;
}

const notes = notesData as Note[];
const categories = categoriesData as Category[];

export default function HomePage() {
  return (
    <div className="flex flex-col gap-12 lg:grid lg:grid-cols-[290px_minmax(0,1fr)_190px] lg:gap-10 lg:h-[calc(100dvh-150px)]">
      {/* 桌面端三栏：左标题 + 站点信息 / 中间文章滚动 / 右实时日期；移动端按 标题→日期→文章 堆叠 */}
      <div className="flex flex-col order-1 lg:h-full">
        <HeroTitle />
        <SiteMeta notes={notes} categoryCount={categories.length} />
      </div>
      <NoteFeed notes={notes} categories={categories} basePath={BASE_PATH} />
      <LiveDate noteCount={notes.length} />
    </div>
  );
}
