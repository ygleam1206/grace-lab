import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// GET /api/tasks — 获取所有任务标签（含累计时长）
export async function GET() {
  const db = getDb();

  const tasks = db.prepare(`
    SELECT
      t.id,
      t.name,
      t.created_at,
      COALESCE(SUM(CASE WHEN sr.status = 'completed' THEN sr.duration ELSE 0 END), 0) as total_duration,
      COUNT(CASE WHEN sr.status = 'completed' THEN 1 END) as session_count
    FROM tasks t
    LEFT JOIN study_records sr ON sr.task_id = t.id
    GROUP BY t.id
    ORDER BY total_duration DESC
  `).all() as {
    id: number;
    name: string;
    created_at: string;
    total_duration: number;
    session_count: number;
  }[];

  return NextResponse.json(tasks);
}

// POST /api/tasks — 创建任务标签
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name } = body;

  if (!name || !name.trim()) {
    return NextResponse.json({ error: "任务名称不能为空" }, { status: 400 });
  }

  const db = getDb();

  try {
    const result = db.prepare("INSERT INTO tasks (name) VALUES (?)").run(name.trim());
    return NextResponse.json(
      { id: result.lastInsertRowid, name: name.trim() },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "任务名称已存在" }, { status: 409 });
  }
}

// PUT /api/tasks — 更新任务标签名称
export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { id, name } = body;

  if (!id || !name || !name.trim()) {
    return NextResponse.json({ error: "参数不完整" }, { status: 400 });
  }

  const db = getDb();

  try {
    db.prepare("UPDATE tasks SET name = ? WHERE id = ?").run(name.trim(), id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "任务名称已存在" }, { status: 409 });
  }
}

// DELETE /api/tasks — 删除任务标签
// ON DELETE SET NULL: 关联的学习记录保留，task_id 置为 NULL，topic 字段保留原始名称
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "缺少任务ID" }, { status: 400 });
  }

  const db = getDb();
  db.prepare("DELETE FROM tasks WHERE id = ?").run(Number(id));

  return NextResponse.json({ success: true });
}
