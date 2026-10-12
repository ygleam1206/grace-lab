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

// 导出公开笔记
const notes = db.prepare(`
  SELECT id, title, content, category, created_at, updated_at
  FROM notes
  WHERE is_public = 1
  ORDER BY created_at DESC
`).all();

console.log(`   公开笔记: ${notes.length} 篇`);

// 导出公开分类（只包含有公开笔记的分类）
const publicCategories = [...new Set(notes.map((n) => n.category).filter(Boolean))];
const categories = db.prepare(`
  SELECT name, cover_image
  FROM note_categories
  WHERE name IN (${publicCategories.map(() => "?").join(",")})
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
