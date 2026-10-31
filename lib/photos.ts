import fs from "node:fs";
import path from "node:path";
import { getDb } from "@/lib/db";

/** 主应用独占的照片源目录：新增照片直接放进 public/photos */
export const PHOTO_DIR = path.join(process.cwd(), "public", "photos");

const PHOTO_EXT = /\.(?:jpg|jpeg|png|gif|webp|avif)$/i;

export interface Photo {
  id: number;
  filename: string;
  url: string;
  location: string;
  mood: string;
  taken_at: string;
}

/** 目录里的实际照片文件（忽略隐藏文件），按文件名排序 */
export function listPhotoFiles(): string[] {
  if (!fs.existsSync(PHOTO_DIR)) return [];
  return fs
    .readdirSync(PHOTO_DIR)
    .filter((file) => PHOTO_EXT.test(file) && !file.startsWith("."))
    .sort((a, b) => a.localeCompare(b, "zh-CN"));
}

/**
 * 把目录里新增的照片登记进 photos 表，不删除已有元数据行。
 * 这样"丢文件即可"和"后期填地点/心情"可以共存。
 */
export function syncPhotos(): void {
  const files = listPhotoFiles();
  if (files.length === 0) return;

  const db = getDb();
  const insert = db.prepare("INSERT OR IGNORE INTO photos (filename) VALUES (?)");
  const insertMany = db.transaction((names: string[]) => {
    for (const name of names) insert.run(name);
  });
  insertMany(files);
}

/** 读取照片列表：以磁盘上真实存在的文件为准，附上数据库里的元数据 */
export function getPhotos(): Photo[] {
  syncPhotos();

  const files = listPhotoFiles();
  if (files.length === 0) return [];

  const db = getDb();
  const rows = db
    .prepare("SELECT id, filename, location, mood, taken_at, sort_order FROM photos")
    .all() as (Omit<Photo, "url"> & { sort_order: number })[];

  const meta = new Map(rows.map((row) => [row.filename, row]));

  return files
    .map((filename, index) => {
      const row = meta.get(filename);
      return {
        id: row?.id ?? 0,
        filename,
        url: `/photos/${encodeURIComponent(filename)}`,
        location: row?.location ?? "",
        mood: row?.mood ?? "",
        taken_at: row?.taken_at ?? "",
        order: row?.sort_order ?? index,
      };
    })
    .sort((a, b) => a.order - b.order || a.filename.localeCompare(b.filename, "zh-CN"))
    .map(({ order: _order, ...photo }) => photo);
}
