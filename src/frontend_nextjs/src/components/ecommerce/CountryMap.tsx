"use client";

interface CountryMapProps {
  mapColor?: string;
}

const CountryMap: React.FC<CountryMapProps> = ({ mapColor = "#3B82F6" }) => {
  return (
    <div
      className="w-full h-[300px] rounded-lg flex items-center justify-center"
      style={{ backgroundColor: mapColor + "20" }} // Usar mapColor con opacidad
    >
      <div className="text-center">
        <div
          className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
          style={{ backgroundColor: mapColor }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
            <path d="M2 12h20"/>
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
          Mapa Mundial
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Distribución global de usuarios
        </p>
      </div>
    </div>
  );
};

export default CountryMap;
