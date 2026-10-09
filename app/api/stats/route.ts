import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// GET /api/stats — 获取学习统计数据
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "all"; // today | week | month | all

  const db = getDb();

  function getWhereClause(): string {
    switch (period) {
      case "today":
        return "date(start_time) = date('now', 'localtime')";
      case "week":
        return "start_time >= datetime('now', 'localtime', '-6 days')";
      case "month":
        return "start_time >= datetime('now', 'localtime', 'start of month')";
      default:
        return "1 = 1";
    }
  }

  const where = getWhereClause();

  // 今日学习时间
  const todayResult = db.prepare(`
    SELECT COALESCE(SUM(duration), 0) as total
    FROM study_records
    WHERE date(start_time) = date('now', 'localtime')
  `).get() as { total: number };

  // 本周学习时间
  const weekResult = db.prepare(`
    SELECT COALESCE(SUM(duration), 0) as total
    FROM study_records
    WHERE start_time >= datetime('now', 'localtime', '-6 days')
  `).get() as { total: number };

  // 本月学习时间
  const monthResult = db.prepare(`
    SELECT COALESCE(SUM(duration), 0) as total
    FROM study_records
    WHERE start_time >= datetime('now', 'localtime', 'start of month')
  `).get() as { total: number };

  // 当前周期总时长
  const periodTotalResult = db.prepare(`
    SELECT COALESCE(SUM(duration), 0) as total
    FROM study_records
    WHERE ${where}
  `).get() as { total: number };

  // 连续学习天数
  const streakResult = db.prepare(`
    SELECT DISTINCT date(start_time) as study_date
    FROM study_records
    WHERE duration > 0
    ORDER BY study_date DESC
  `).all() as { study_date: string }[];

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < streakResult.length; i++) {
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i);
    const expectedStr = expected.toISOString().slice(0, 10);
    if (streakResult[i].study_date === expectedStr) {
      streak++;
    } else {
      break;
    }
  }

  // 热力图数据（最近 365 天）
  const heatmapData = db.prepare(`
    SELECT date(start_time) as study_date, SUM(duration) as total_duration
    FROM study_records
    WHERE start_time >= datetime('now', 'localtime', '-365 days')
    GROUP BY date(start_time)
    ORDER BY study_date
  `).all() as { study_date: string; total_duration: number }[];

  // 按任务分组统计 — 饼图数据（优先用 task 关联，topic 作为兜底）
  const topicData = db.prepare(`
    SELECT
      COALESCE(t.name, sr.topic, '未分类') as topic,
      SUM(sr.duration) as total_duration,
      COUNT(*) as count
    FROM study_records sr
    LEFT JOIN tasks t ON sr.task_id = t.id
    WHERE ${where} AND sr.duration > 0
    GROUP BY COALESCE(t.name, sr.topic, '未分类')
    ORDER BY total_duration DESC
  `).all() as { topic: string; total_duration: number; count: number }[];

  return NextResponse.json({
    todayTotal: todayResult.total,
    weekTotal: weekResult.total,
    monthTotal: monthResult.total,
    periodTotal: periodTotalResult.total,
    streak,
    heatmap: heatmapData,
    topics: topicData,
  });
}
