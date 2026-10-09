import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "grace-blog.db");

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

let db: Database.Database;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initTables(db);
  }
  return db;
}

function initTables(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS note_tags (
      note_id INTEGER REFERENCES notes(id) ON DELETE CASCADE,
      tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (note_id, tag_id)
    );

    CREATE TABLE IF NOT EXISTS files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size INTEGER NOT NULL,
      path TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 任务标签表（长期存在的学习分类）
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 笔记分类表
    CREATE TABLE IF NOT EXISTS note_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      cover_image TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 学习记录表
    CREATE TABLE IF NOT EXISTS study_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER REFERENCES tasks(id) ON DELETE SET NULL,
      topic TEXT DEFAULT '',
      start_time DATETIME NOT NULL,
      end_time DATETIME,
      duration INTEGER DEFAULT 0,
      status TEXT DEFAULT 'ongoing'
    );
  `);

  // 迁移：如果 study_records 缺少 task_id 列，则添加并迁移数据
  try {
    const cols = db.prepare("PRAGMA table_info(study_records)").all() as { name: string }[];
    const hasTaskId = cols.some((c) => c.name === "task_id");
    if (!hasTaskId) {
      db.exec("ALTER TABLE study_records ADD COLUMN task_id INTEGER REFERENCES tasks(id) ON DELETE SET NULL");

      // 从已有 topic 创建 tasks 并关联
      const topics = db.prepare("SELECT DISTINCT topic FROM study_records WHERE topic != ''").all() as { topic: string }[];
      const insertTask = db.prepare("INSERT OR IGNORE INTO tasks (name) VALUES (?)");
      const getTask = db.prepare("SELECT id FROM tasks WHERE name = ?");
      const updateRecord = db.prepare("UPDATE study_records SET task_id = ? WHERE topic = ? AND task_id IS NULL");

      for (const { topic } of topics) {
        insertTask.run(topic);
        const task = getTask.get(topic) as { id: number } | undefined;
        if (task) {
          updateRecord.run(task.id, topic);
        }
      }
    }
  } catch {
    // 迁移失败不影响正常使用
  }

  // 迁移：将 notes 中已有的 category 文本迁移到 note_categories 表
  try {
    const catTable = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='note_categories'").get();
    if (catTable) {
      const existingCats = db.prepare("SELECT DISTINCT category FROM notes WHERE category != ''").all() as { category: string }[];
      const insertCat = db.prepare("INSERT OR IGNORE INTO note_categories (name) VALUES (?)");
      for (const { category } of existingCats) {
        insertCat.run(category);
      }
    }
  } catch {
    // 迁移失败不影响正常使用
  }

  // 迁移：为 note_categories 添加 cover_image 列
  try {
    const cols = db.prepare("PRAGMA table_info(note_categories)").all() as { name: string }[];
    const hasCover = cols.some((c) => c.name === "cover_image");
    if (!hasCover) {
      db.exec("ALTER TABLE note_categories ADD COLUMN cover_image TEXT DEFAULT ''");
    }
  } catch {
    // 迁移失败不影响正常使用
  }
}

export { getDb };
