import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// GET /api/notes/[id] — 获取单个笔记
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();

  const note = db.prepare(`
    SELECT n.*, GROUP_CONCAT(t.name) as tags
    FROM notes n
    LEFT JOIN note_tags nt ON n.id = nt.note_id
    LEFT JOIN tags t ON nt.tag_id = t.id
    WHERE n.id = ?
  `).get(id) as {
    id: number;
    title: string;
    content: string;
    category: string;
    is_public: number;
    created_at: string;
    updated_at: string;
    tags: string | null;
  } | undefined;

  if (!note) {
    return NextResponse.json({ error: "笔记不存在" }, { status: 404 });
  }

  return NextResponse.json({
    ...note,
    tags: note.tags ? note.tags.split(",") : [],
  });
}

// PUT /api/notes/[id] — 更新笔记
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { title, content, category, tags, is_public } = body;

  const db = getDb();

  const existing = db.prepare("SELECT id FROM notes WHERE id = ?").get(id);
  if (!existing) {
    return NextResponse.json({ error: "笔记不存在" }, { status: 404 });
  }

  db.prepare(
    "UPDATE notes SET title = ?, content = ?, category = ?, is_public = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  ).run(title, content, category ?? "", is_public ? 1 : 0, id);

  // 重新处理标签
  if (tags) {
    db.prepare("DELETE FROM note_tags WHERE note_id = ?").run(id);
    const insertTag = db.prepare("INSERT OR IGNORE INTO tags (name) VALUES (?)");
    const getTagId = db.prepare("SELECT id FROM tags WHERE name = ?");
    const linkTag = db.prepare("INSERT INTO note_tags (note_id, tag_id) VALUES (?, ?)");

    for (const tagName of tags) {
      insertTag.run(tagName.trim());
      const tagRow = getTagId.get(tagName.trim()) as { id: number };
      linkTag.run(Number(id), tagRow.id);
    }
  }

  return NextResponse.json({ success: true });
}

// DELETE /api/notes/[id] — 删除笔记
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();

  const result = db.prepare("DELETE FROM notes WHERE id = ?").run(id);
  if (result.changes === 0) {
    return NextResponse.json({ error: "笔记不存在" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
