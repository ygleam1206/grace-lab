#!/usr/bin/env node
/**
 * 公开站点数据导出脚本
 *
 * 从 SQLite 数据库导出标记为公开的笔记、分类和图片，
 * 生成 public-site/app/ 下的 JSON 文件和 public-site/public/uploads/ 下的图片副本。
 *
 * 使用方式：node scripts/export-public.js
 */

const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

// 路径配置
const PROJECT_ROOT = process.cwd();
const DATA_DIR = process.env.BLOG_DATA_DIR || path.join(PROJECT_ROOT, "data");
const DB_PATH = path.join(DATA_DIR, "grace-blog.db");
const UPLOAD_DIR = process.env.BLOG_DATA_DIR
  ? path.join(process.env.BLOG_DATA_DIR, "uploads")
  : path.join(PROJECT_ROOT, "uploads");
const PUBLIC_SITE_DIR = path.join(PROJECT_ROOT, "public-site");
const EXPORT_DATA_DIR = path.join(PUBLIC_SITE_DIR, "app");
const EXPORT_UPLOADS_DIR = path.join(PUBLIC_SITE_DIR, "public", "uploads");

// 确保输出目录存在
// 清理旧的公开图片目录（避免未引用的旧图片残留）
if (fs.existsSync(EXPORT_UPLOADS_DIR)) {
  fs.rmSync(EXPORT_UPLOADS_DIR, { recursive: true, force: true });
}
fs.mkdirSync(EXPORT_UPLOADS_DIR, { recursive: true });

// 打开数据库
const db = new Database(DB_PATH, { readonly: true });

console.log("📦 开始导出公开站点数据...");
console.log(`   数据库: ${DB_PATH}`);
console.log(`   输出目录: ${EXPORT_DATA_DIR}`);

// 导出公开笔记（含标签）
const notes = db.prepare(`
  SELECT n.id, n.title, n.content, n.category,
    GROUP_CONCAT(t.name) as tags,
    n.created_at, n.updated_at
  FROM notes n
  LEFT JOIN note_tags nt ON n.id = nt.note_id
  LEFT JOIN tags t ON nt.tag_id = t.id
  WHERE n.is_public = 1
  GROUP BY n.id
  ORDER BY n.created_at DESC
`).all();

// 将 tags 字符串转为数组
for (const note of notes) {
  note.tags = note.tags ? note.tags.split(",") : [];
}

console.log(`   公开笔记: ${notes.length} 篇`);

// 导出公开分类（含 id、封面、笔记数）
const publicCategories = [...new Set(notes.map((n) => n.category).filter(Boolean))];
const categories = db.prepare(`
  SELECT nc.id, nc.name, nc.cover_image,
    COUNT(n.id) as note_count
  FROM note_categories nc
  LEFT JOIN notes n ON n.category = nc.name AND n.is_public = 1
  WHERE nc.name IN (${publicCategories.map(() => "?").join(",")})
  GROUP BY nc.id
`).all(...publicCategories);

console.log(`   公开分类: ${categories.length} 个`);

// 提取笔记中引用的图片文件名
const imageRegex = /\/uploads\/([^\s"'<>)]+\.(?:jpg|jpeg|png|gif|webp|svg))/gi;
const referencedImages = new Set();

for (const note of notes) {
  let match;
  while ((match = imageRegex.exec(note.content)) !== null) {
    referencedImages.add(match[1]);
  }
}

// 复制引用的图片
let copiedImages = 0;
for (const filename of referencedImages) {
  const srcPath = path.join(UPLOAD_DIR, filename);
  const destPath = path.join(EXPORT_UPLOADS_DIR, filename);

  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    copiedImages++;
  } else {
    console.warn(`   ⚠️  图片不存在: ${filename}`);
  }
}

console.log(`   复制图片: ${copiedImages} 张`);

// 复制分类封面图片
for (const cat of categories) {
  if (cat.cover_image) {
    const srcPath = path.join(UPLOAD_DIR, cat.cover_image);
    const destPath = path.join(EXPORT_UPLOADS_DIR, cat.cover_image);

    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 复制 hero 图片
const HERO_SRC = path.join(PROJECT_ROOT, "public", "images", "hero.png");
const HERO_DEST_DIR = path.join(PUBLIC_SITE_DIR, "public", "images");
if (fs.existsSync(HERO_SRC)) {
  fs.mkdirSync(HERO_DEST_DIR, { recursive: true });
  fs.copyFileSync(HERO_SRC, path.join(HERO_DEST_DIR, "hero.png"));
  console.log("   复制 hero 图片: 1 张");
}

// 同步照片墙：以主应用 public/photos 为源，复制到静态站的本地预览目录
// 照片文件不进仓库，静态站在构建时直接读取该目录，本地能看到图、线上看到提示
const PHOTO_SOURCE_DIR = path.join(PROJECT_ROOT, "public", "photos");
const PHOTOS_DIR = path.join(PUBLIC_SITE_DIR, "public", "images", "photos");
fs.mkdirSync(PHOTOS_DIR, { recursive: true });
const PHOTO_EXTS = /\.(?:jpg|jpeg|png|gif|webp|avif)$/i;
const photoSourceFiles = fs.existsSync(PHOTO_SOURCE_DIR)
  ? fs
      .readdirSync(PHOTO_SOURCE_DIR)
      .filter((file) => PHOTO_EXTS.test(file) && !file.startsWith("."))
      .sort((a, b) => a.localeCompare(b, "zh-CN"))
  : [];

for (const file of photoSourceFiles) {
  fs.copyFileSync(path.join(PHOTO_SOURCE_DIR, file), path.join(PHOTOS_DIR, file));
}

// 静态站里已不被引用的照片（源目录删掉的文件）一并清理
const keep = new Set(photoSourceFiles);
for (const file of fs.readdirSync(PHOTOS_DIR)) {
  if (PHOTO_EXTS.test(file) && !keep.has(file)) {
    fs.unlinkSync(path.join(PHOTOS_DIR, file));
  }
}

const photoFiles = photoSourceFiles;

console.log(`   照片墙: ${photoFiles.length} 张（仅本地预览，不提交仓库）`);

// 写入 JSON 数据文件
fs.writeFileSync(
  path.join(EXPORT_DATA_DIR, "notes.json"),
  JSON.stringify(notes, null, 2)
);

fs.writeFileSync(
  path.join(EXPORT_DATA_DIR, "categories.json"),
  JSON.stringify(categories, null, 2)
);

db.close();

console.log("✅ 导出完成!");
console.log(`   笔记: ${notes.length} 篇`);
console.log(`   分类: ${categories.length} 个`);
console.log(`   图片: ${copiedImages} 张`);
console.log("");
console.log("下一步: npm run build:public");
