import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// GET /api/tasks/[id] — 获取任务详情 + 学习记录历史
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();

  // 任务基本信息 + 累计时长
  const task = db.prepare(`
    SELECT
      t.id,
      t.name,
      t.created_at,
      COALESCE(SUM(CASE WHEN sr.status = 'completed' THEN sr.duration ELSE 0 END), 0) as total_duration,
      COUNT(CASE WHEN sr.status = 'completed' THEN 1 END) as session_count
    FROM tasks t
    LEFT JOIN study_records sr ON sr.task_id = t.id
    WHERE t.id = ?
    GROUP BY t.id
  `).get(Number(id)) as {
    id: number;
    name: string;
    created_at: string;
    total_duration: number;
    session_count: number;
  } | undefined;

  if (!task) {
    return NextResponse.json({ error: "任务不存在" }, { status: 404 });
  }

  // 学习记录历史
  const sessions = db.prepare(`
    SELECT id, start_time, end_time, duration, status
    FROM study_records
    WHERE task_id = ?
    ORDER BY start_time DESC
    LIMIT 100
  `).all(Number(id)) as {
    id: number;
    start_time: string;
    end_time: string | null;
    duration: number;
    status: string;
  }[];

  return NextResponse.json({ ...task, sessions });
}
