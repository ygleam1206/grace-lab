"use client";

import notesData from "./notes.json";
import categoriesData from "./categories.json";
import HeroTitle from "@/components/HeroTitle";
import NoteGallery from "@/components/NoteGallery";

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
    <div>
      {/* Hero 标题排版 */}
      <HeroTitle />

      {/* 分类轮播画廊 */}
      <NoteGallery categories={categories} basePath={BASE_PATH} />
    </div>
  );
}
