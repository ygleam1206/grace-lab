import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

interface ProfileRow {
  id: number;
  avatar: string;
  bio: string;
  signature: string;
  updated_at: string;
}

function readProfile(): ProfileRow {
  const db = getDb();
  return db.prepare("SELECT * FROM profile WHERE id = 1").get() as ProfileRow;
}

// GET /api/profile — 读取个人资料（About 页）
export async function GET() {
  return NextResponse.json(readProfile());
}

// PUT /api/profile — 更新简介 / 个性签名（只更新传了的字段）
export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { bio, signature } = body ?? {};

  if (bio === undefined && signature === undefined) {
    return NextResponse.json({ error: "没有需要更新的内容" }, { status: 400 });
  }

  const db = getDb();
  db.prepare(
    `UPDATE profile SET
       bio = COALESCE(?, bio),
       signature = COALESCE(?, signature),
       updated_at = CURRENT_TIMESTAMP
     WHERE id = 1`
  ).run(
    typeof bio === "string" ? bio : null,
    typeof signature === "string" ? signature : null
  );

  return NextResponse.json(readProfile());
}
