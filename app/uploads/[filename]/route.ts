import { NextRequest, NextResponse } from "next/server";
import { getUploadDir, ensureDir } from "@/lib/storage";
import path from "path";
import fs from "fs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;

  // 防止路径遍历
  const safeName = path.basename(filename);
  const uploadDir = getUploadDir();
  const filePath = path.join(uploadDir, safeName);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "文件不存在" }, { status: 404 });
  }

  const ext = path.extname(safeName).toLowerCase();
  const mimeTypes: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
  };

  const contentType = mimeTypes[ext] || "application/octet-stream";
  const buffer = fs.readFileSync(filePath);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
