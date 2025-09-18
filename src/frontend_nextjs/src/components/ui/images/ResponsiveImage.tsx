interface ResponsiveImageProps {
  src?: string;
  alt?: string;
  className?: string;
}

export default function ResponsiveImage({
  src = "/images/grid-image/image-01.png",
  alt = "Imagen",
  className = ""
}: ResponsiveImageProps) {
  return (
    <div className="relative">
      <div className="overflow-hidden">
        <img
          src={src}
          alt={alt}
          className={`w-full border border-gray-200 rounded-xl dark:border-gray-800 ${className}`}
        />
      </div>
    </div>
  );
}
