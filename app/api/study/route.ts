import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// GET /api/study — 获取最近学习记录
export async function GET() {
  const db = getDb();
  const records = db.prepare(`
    SELECT sr.*, t.name as task_name
    FROM study_records sr
    LEFT JOIN tasks t ON sr.task_id = t.id
    ORDER BY sr.start_time DESC
    LIMIT 50
  `).all();
  return NextResponse.json(records);
}

// POST /api/study — 计时操作
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action, id, task_id } = body;
  const db = getDb();

  switch (action) {
    case "start": {
      if (!task_id) {
        return NextResponse.json({ error: "请选择学习任务" }, { status: 400 });
      }
      // 获取任务名称作为 topic 快照
      const task = db.prepare("SELECT name FROM tasks WHERE id = ?").get(Number(task_id)) as { name: string } | undefined;
      if (!task) {
        return NextResponse.json({ error: "任务不存在" }, { status: 404 });
      }
      const result = db.prepare(
        "INSERT INTO study_records (task_id, topic, start_time, status) VALUES (?, ?, datetime('now', 'localtime'), 'ongoing')"
      ).run(Number(task_id), task.name);
      return NextResponse.json({ id: result.lastInsertRowid }, { status: 201 });
    }

    case "pause": {
      if (!id) return NextResponse.json({ error: "缺少记录ID" }, { status: 400 });
      const record = db.prepare("SELECT * FROM study_records WHERE id = ?").get(id) as {
        start_time: string;
        duration: number;
      };
      if (!record) return NextResponse.json({ error: "记录不存在" }, { status: 404 });

      const now = new Date();
      const start = new Date(record.start_time);
      const elapsed = Math.floor((now.getTime() - start.getTime()) / 1000);

      db.prepare(
        "UPDATE study_records SET duration = duration + ?, status = 'paused', end_time = datetime('now', 'localtime') WHERE id = ?"
      ).run(elapsed, id);
      return NextResponse.json({ success: true });
    }

    case "resume": {
      if (!id) return NextResponse.json({ error: "缺少记录ID" }, { status: 400 });
      db.prepare(
        "UPDATE study_records SET start_time = datetime('now', 'localtime'), status = 'ongoing' WHERE id = ?"
      ).run(id);
      return NextResponse.json({ success: true });
    }

    case "stop": {
      if (!id) return NextResponse.json({ error: "缺少记录ID" }, { status: 400 });
      const rec = db.prepare("SELECT * FROM study_records WHERE id = ?").get(id) as {
        start_time: string;
        duration: number;
        status: string;
      };
      if (!rec) return NextResponse.json({ error: "记录不存在" }, { status: 404 });

      if (rec.status === "ongoing") {
        const now = new Date();
        const start = new Date(rec.start_time);
        const elapsed = Math.floor((now.getTime() - start.getTime()) / 1000);
        db.prepare(
          "UPDATE study_records SET duration = duration + ?, status = 'completed', end_time = datetime('now', 'localtime') WHERE id = ?"
        ).run(elapsed, id);
      } else {
        db.prepare(
          "UPDATE study_records SET status = 'completed' WHERE id = ?"
        ).run(id);
      }
      return NextResponse.json({ success: true });
    }

    default:
      return NextResponse.json({ error: "未知操作" }, { status: 400 });
  }
}
