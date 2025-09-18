interface ImageItem {
  src: string;
  alt: string;
}

interface TwoColumnImageGridProps {
  images?: ImageItem[];
  className?: string;
}

export default function TwoColumnImageGrid({
  images = [
    { src: "/images/grid-image/image-02.png", alt: "Imagen de galería 1" },
    { src: "/images/grid-image/image-03.png", alt: "Imagen de galería 2" }
  ],
  className = ""
}: TwoColumnImageGridProps) {
  return (
    <div className={`grid grid-cols-1 gap-5 sm:grid-cols-2 ${className}`}>
      {images.map((image, index) => (
        <div key={index}>
          <img
            src={image.src}
            alt={image.alt}
            className="w-full h-auto border border-gray-200 rounded-xl dark:border-gray-800"
          />
        </div>
      ))}
    </div>
  );
}
