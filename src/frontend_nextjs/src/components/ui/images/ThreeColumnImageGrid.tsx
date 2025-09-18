interface ImageItem {
  src: string;
  alt: string;
}

interface ThreeColumnImageGridProps {
  images?: ImageItem[];
  className?: string;
}

export default function ThreeColumnImageGrid({
  images = [
    { src: "/images/grid-image/image-04.png", alt: "Imagen de galería 1" },
    { src: "/images/grid-image/image-05.png", alt: "Imagen de galería 2" },
    { src: "/images/grid-image/image-06.png", alt: "Imagen de galería 3" }
  ],
  className = ""
}: ThreeColumnImageGridProps) {
  return (
    <div className={`grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 ${className}`}>
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
