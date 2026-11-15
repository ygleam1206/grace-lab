import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getUploadDir, ensureDir } from "@/lib/storage";
import path from "path";
import fs from "fs";

const ALLOWED_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

// POST /api/profile/avatar — 上传 / 更换头像
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "请选择头像图片" }, { status: 400 });
  }

  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXT.has(ext) || !file.type.startsWith("image/")) {
    return NextResponse.json({ error: "仅支持 jpg / png / webp / gif 图片" }, { status: 400 });
  }

  const uploadDir = getUploadDir();
  ensureDir(uploadDir);

  // 文件名带时间戳 + 随机串：头像换新后 URL 就变，避免一年期的 immutable 缓存拿到旧图
  const filename = `avatar-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  const filePath = path.join(uploadDir, filename);

  try {
    fs.writeFileSync(filePath, Buffer.from(await file.arrayBuffer()));

    const db = getDb();
    const previous = db.prepare("SELECT avatar FROM profile WHERE id = 1").get() as
      | { avatar: string }
      | undefined;
    db.prepare("UPDATE profile SET avatar = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1").run(filename);

    // 删掉上一张头像（仅限本功能生成的文件，避免误删笔记配图）
    const oldName = previous?.avatar || "";
    if (oldName.startsWith("avatar-")) {
      const oldPath = path.join(uploadDir, path.basename(oldName));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    return NextResponse.json({ avatar: filename });
  } catch (error) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    console.error("Avatar upload failed:", error);
    return NextResponse.json({ error: "头像上传失败" }, { status: 500 });
  }
}
