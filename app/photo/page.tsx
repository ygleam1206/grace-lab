import PhotoWall from "@/components/PhotoWall";
import { getPhotos } from "@/lib/photos";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "照片墙",
};

export default function PhotoPage() {
  const photos = getPhotos();

  return (
    <div>
      <div className="flex items-end justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold">Photo</h1>
          <p className="text-sm text-white/50 mt-2">
            生活碎片 · {photos.length} 张
            <span className="ml-3 text-white/30">点击照片查看大图与地点、心情</span>
          </p>
        </div>
      </div>

      <PhotoWall photos={photos} />
    </div>
  );
}
