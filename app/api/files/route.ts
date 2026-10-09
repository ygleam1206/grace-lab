import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import path from "path";
import fs from "fs";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

// 确保上传目录存在
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// GET /api/files — 获取文件列表
export async function GET() {
  const db = getDb();
  const files = db.prepare("SELECT * FROM files ORDER BY created_at DESC").all();
  return NextResponse.json(files);
}

// POST /api/files — 上传文件
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "请选择文件" }, { status: 400 });
  }

  const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${file.name}`;
  const filePath = path.join(UPLOAD_DIR, uniqueName);

  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(filePath, buffer);

  const db = getDb();
  const result = db.prepare(
    "INSERT INTO files (filename, original_name, mime_type, size, path) VALUES (?, ?, ?, ?, ?)"
  ).run(uniqueName, file.name, file.type, file.size, filePath);

  return NextResponse.json({
    id: result.lastInsertRowid,
    filename: uniqueName,
    original_name: file.name,
    mime_type: file.type,
    size: file.size,
  }, { status: 201 });
}
