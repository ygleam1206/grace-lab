import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// GET /api/categories — 获取所有分类（含笔记数量）
export async function GET() {
  const db = getDb();

  const categories = db.prepare(`
    SELECT c.id, c.name, c.cover_image, c.created_at, COUNT(n.id) as note_count
    FROM note_categories c
    LEFT JOIN notes n ON n.category = c.name
    GROUP BY c.id
    ORDER BY c.name
  `).all() as Array<{
    id: number;
    name: string;
    cover_image: string;
    created_at: string;
    note_count: number;
  }>;

  const uncategorized = db.prepare(
    "SELECT COUNT(*) as count FROM notes WHERE category = '' OR category IS NULL"
  ).get() as { count: number };

  return NextResponse.json({ categories, uncategorized: uncategorized.count });
}

// POST /api/categories — 创建分类
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name } = body;

  if (!name || !name.trim()) {
    return NextResponse.json({ error: "分类名称不能为空" }, { status: 400 });
  }

  const db = getDb();

  try {
    const result = db.prepare(
      "INSERT INTO note_categories (name, cover_image) VALUES (?, ?)"
    ).run(name.trim(), body.cover_image || "");
    return NextResponse.json({
      id: result.lastInsertRowid as number,
      name: name.trim(),
      cover_image: body.cover_image || "",
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "分类名称已存在" }, { status: 409 });
  }
}

// PUT /api/categories/[id] — 修改分类名称
export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const body = await request.json();
  const { name, cover_image } = body;

  if (!id || !name || !name.trim()) {
    return NextResponse.json({ error: "参数不完整" }, { status: 400 });
  }

  const db = getDb();

  const existing = db.prepare("SELECT id, name FROM note_categories WHERE id = ?").get(id) as { id: number; name: string } | undefined;
  if (!existing) {
    return NextResponse.json({ error: "分类不存在" }, { status: 404 });
  }

  const oldName = existing.name;
  const newName = name.trim();

  try {
    if (cover_image !== undefined) {
      db.prepare("UPDATE note_categories SET name = ?, cover_image = ? WHERE id = ?").run(newName, cover_image, id);
    } else {
      db.prepare("UPDATE note_categories SET name = ? WHERE id = ?").run(newName, id);
    }
    // 同步更新相关笔记的 category 字段
    db.prepare("UPDATE notes SET category = ? WHERE category = ?").run(newName, oldName);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "分类名称已存在" }, { status: 409 });
  }
}

// DELETE /api/categories/[id] — 删除分类（笔记变为未分类）
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "缺少分类ID" }, { status: 400 });
  }

  const db = getDb();

  const existing = db.prepare("SELECT name FROM note_categories WHERE id = ?").get(id) as { name: string } | undefined;
  if (!existing) {
    return NextResponse.json({ error: "分类不存在" }, { status: 404 });
  }

  // 将该分类下的笔记设为未分类
  db.prepare("UPDATE notes SET category = '' WHERE category = ?").run(existing.name);
  // 删除分类
  db.prepare("DELETE FROM note_categories WHERE id = ?").run(id);

  return NextResponse.json({ success: true });
}
