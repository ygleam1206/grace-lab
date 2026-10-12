interface HomePhotoProps {
  src: string;
  alt?: string;
}

export default function HomePhoto({ src, alt = "" }: HomePhotoProps) {
  const imgSrc = src.startsWith("/") ? `/grace-lab${src}` : src;
  return (
    <div
      className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-[340px] xl:w-[400px]"
      style={{
        maskImage: "radial-gradient(ellipse 78% 72% at 50% 50%, black 40%, transparent 76%)",
        WebkitMaskImage: "radial-gradient(ellipse 78% 72% at 50% 50%, black 40%, transparent 76%)",
      }}
    >
      <img
        src={imgSrc}
        alt={alt}
        className="w-full h-auto object-contain"
        draggable={false}
      />
    </div>
  );
}
