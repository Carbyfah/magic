type AspectRatioVideoProps = {
  videoUrl: string; // URL del video
  aspectRatio?: string; // Relación de aspecto en formato "width/height", por defecto es "16/9"
  title?: string; // Título del video, por defecto es "Video Embebido"
};

const AspectRatioVideo: React.FC<AspectRatioVideoProps> = ({
  videoUrl,
  aspectRatio = "video", // Relación de aspecto por defecto
  title = "Video Embebido",
}) => {
  return (
    <div className={`aspect-${aspectRatio} overflow-hidden rounded-lg`}>
      <iframe
        src={videoUrl}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      ></iframe>
    </div>
  );
};

export default AspectRatioVideo;
