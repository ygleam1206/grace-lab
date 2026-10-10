import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { resolveFileFromRecord } from "@/lib/storage";
import fs from "fs";

// GET /api/files/[id] — 下载文件
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();

  const file = db.prepare("SELECT * FROM files WHERE id = ?").get(id) as {
    id: number;
    filename: string;
    original_name: string;
    mime_type: string;
    path: string;
  } | undefined;

  if (!file) {
    return NextResponse.json({ error: "文件不存在" }, { status: 404 });
  }

  // 兼容旧绝对路径和新文件名
  const filePath = resolveFileFromRecord(file.path, file.filename);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "文件已丢失" }, { status: 404 });
  }

  const buffer = fs.readFileSync(filePath);
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": file.mime_type || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(file.original_name)}"`,
    },
  });
}

// DELETE /api/files/[id] — 删除文件
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();

  const file = db.prepare("SELECT * FROM files WHERE id = ?").get(id) as {
    id: number;
    filename: string;
    path: string;
  } | undefined;

  if (!file) {
    return NextResponse.json({ error: "文件不存在" }, { status: 404 });
  }

  // 兼容旧绝对路径和新文件名
  const filePath = resolveFileFromRecord(file.path, file.filename);

  // 删除物理文件
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  db.prepare("DELETE FROM files WHERE id = ?").run(id);
  return NextResponse.json({ success: true });
}
