import fs from "fs";
import path from "path";
import PhotoWall from "../../components/PhotoWall";

const BASE_PATH = "/grace-lab";
const PHOTO_EXTS = /\.(?:jpg|jpeg|png|gif|webp|avif)$/i;

// 照片只保存在本地，不随仓库发布；构建期直接读目录，本地有图就显示，线上没图就显示提示
function listLocalPhotos(): string[] {
  const dir = path.join(process.cwd(), "public", "images", "photos");
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((file) => PHOTO_EXTS.test(file) && !file.startsWith("."))
    .sort((a, b) => a.localeCompare(b, "zh-CN"))
    .map((file) => `${BASE_PATH}/images/photos/${encodeURIComponent(file)}`);
}

export const metadata = {
  title: "Photo",
};

export default function PhotoPage() {
  const photos = listLocalPhotos();

  return (
    <div>
      <div className="flex items-end justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold">Photo</h1>
          <p className="text-sm text-white/50 mt-2">
            生活碎片{photos.length > 0 ? ` · ${photos.length} 张` : ""}
          </p>
        </div>
      </div>

      {photos.length > 0 ? (
        <PhotoWall photos={photos} />
      ) : (
        <div className="rounded-2xl bg-white/10 px-6 py-16 text-center">
          <p className="text-white/70">照片只在本地作品集里展示</p>
          <p className="mt-2 text-xs text-white/40">
            照片文件未随站点发布，源文件保留在本地 public/photos
          </p>
        </div>
      )}
    </div>
  );
}
