import path from "path";
import fs from "fs";

/**
 * 统一存储路径模块
 *
 * 通过环境变量 BLOG_DATA_DIR 配置数据存储根目录。
 * 未配置时默认使用项目根目录下的 data/ 和 uploads/。
 * 生产环境可设置为 /data 等持久化挂载目录。
 */

/** 获取数据存储根目录 */
export function getDataDir(): string {
  const envDir = process.env.BLOG_DATA_DIR;
  if (envDir && envDir.trim()) {
    return envDir.trim();
  }
  return path.join(/*turbopackIgnore: true*/ process.cwd(), "data");
}

/** 获取数据库文件路径 */
export function getDbPath(): string {
  return path.join(getDataDir(), "grace-blog.db");
}

/** 获取上传文件目录 */
export function getUploadDir(): string {
  const envDir = process.env.BLOG_DATA_DIR;
  if (envDir && envDir.trim()) {
    return path.join(envDir.trim(), "uploads");
  }
  return path.join(/*turbopackIgnore: true*/ process.cwd(), "uploads");
}

/** 确保目录存在（递归创建） */
export function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * 解析文件路径（兼容旧绝对路径和新相对路径）
 *
 * 数据库 files 表的 path 列可能存储：
 * - 旧格式：绝对路径（如 /Users/.../uploads/xxx.png）
 * - 新格式：文件名（如 xxx.png）
 *
 * 此函数统一返回正确的文件系统路径。
 */
export function resolveFilePath(filename: string): string {
  return path.join(getUploadDir(), filename);
}

/**
 * 获取文件的实际路径（兼容旧数据）
 *
 * 优先检查传入的 path 值：
 * 1. 如果是绝对路径且文件存在，直接返回
 * 2. 否则从 filename 列重新解析
 */
export function resolveFileFromRecord(filePath: string, filename: string): string {
  // 如果 path 是绝对路径且文件仍存在（旧数据兼容）
  if (path.isAbsolute(filePath) && fs.existsSync(filePath)) {
    return filePath;
  }
  // 否则从 filename 重新解析（新数据或文件已迁移）
  return resolveFilePath(filename);
}
