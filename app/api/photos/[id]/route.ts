import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

interface PhotoMetaPayload {
  location?: string;
  mood?: string;
  taken_at?: string;
}

// GET /api/photos/[id] — 获取单张照片的元数据
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();

  const photo = db
    .prepare("SELECT id, filename, location, mood, taken_at, sort_order FROM photos WHERE id = ?")
    .get(id);

  if (!photo) {
    return NextResponse.json({ error: "照片不存在" }, { status: 404 });
  }

  return NextResponse.json(photo);
}

// PUT /api/photos/[id] — 更新地点 / 心情 / 拍摄日期
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await request.json()) as PhotoMetaPayload;

  if (
    body.location === undefined &&
    body.mood === undefined &&
    body.taken_at === undefined
  ) {
    return NextResponse.json({ error: "没有需要更新的字段" }, { status: 400 });
  }

  const db = getDb();
  const existing = db.prepare("SELECT id FROM photos WHERE id = ?").get(id);
  if (!existing) {
    return NextResponse.json({ error: "照片不存在" }, { status: 404 });
  }

  const location = (body.location ?? "").trim();
  const mood = (body.mood ?? "").trim();
  const takenAt = (body.taken_at ?? "").trim();

  db.prepare(
    `UPDATE photos
     SET location = COALESCE(?, location),
         mood = COALESCE(?, mood),
         taken_at = COALESCE(?, taken_at)
     WHERE id = ?`
  ).run(
    body.location === undefined ? null : location,
    body.mood === undefined ? null : mood,
    body.taken_at === undefined ? null : takenAt,
    id
  );

  const updated = db
    .prepare("SELECT id, filename, location, mood, taken_at, sort_order FROM photos WHERE id = ?")
    .get(id);

  return NextResponse.json(updated);
}
