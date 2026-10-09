import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// GET /api/notes — 获取笔记列表（支持搜索、分类、标签筛选）
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const hasCategory = searchParams.has("category");
  const category = searchParams.get("category") || "";
  const tag = searchParams.get("tag") || "";

  const db = getDb();

  let query = `
    SELECT DISTINCT n.*, GROUP_CONCAT(t.name) as tags, c.cover_image as category_cover
    FROM notes n
    LEFT JOIN note_tags nt ON n.id = nt.note_id
    LEFT JOIN tags t ON nt.tag_id = t.id
    LEFT JOIN note_categories c ON n.category = c.name
  `;
  const conditions: string[] = [];
  const params: (string)[] = [];

  if (search) {
    conditions.push("(n.title LIKE ? OR n.content LIKE ?)");
    params.push(`%${search}%`, `%${search}%`);
  }
  if (hasCategory) {
    conditions.push("n.category = ?");
    params.push(category);
  }
  if (tag) {
    conditions.push("t.name = ?");
    params.push(tag);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }
  query += " GROUP BY n.id ORDER BY n.updated_at DESC";

  const notes = db.prepare(query).all(...params) as Array<{
    id: number;
    title: string;
    content: string;
    category: string;
    created_at: string;
    updated_at: string;
    tags: string | null;
    category_cover: string | null;
  }>;

  return NextResponse.json(notes.map((n) => ({
    ...n,
    tags: n.tags ? n.tags.split(",") : [],
    category_cover: n.category_cover || null,
  })));
}

// POST /api/notes — 创建笔记
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, content, category = "", tags = [] } = body;

  if (!title || !content) {
    return NextResponse.json({ error: "标题和内容不能为空" }, { status: 400 });
  }

  const db = getDb();
  const result = db.prepare(
    "INSERT INTO notes (title, content, category) VALUES (?, ?, ?)"
  ).run(title, content, category);

  const noteId = result.lastInsertRowid as number;

  // 处理标签
  if (tags.length > 0) {
    const insertTag = db.prepare("INSERT OR IGNORE INTO tags (name) VALUES (?)");
    const getTagId = db.prepare("SELECT id FROM tags WHERE name = ?");
    const linkTag = db.prepare("INSERT INTO note_tags (note_id, tag_id) VALUES (?, ?)");

    for (const tagName of tags) {
      insertTag.run(tagName.trim());
      const tagRow = getTagId.get(tagName.trim()) as { id: number };
      linkTag.run(noteId, tagRow.id);
    }
  }

  return NextResponse.json({ id: noteId, title, content, category, tags }, { status: 201 });
}
