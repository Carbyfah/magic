interface RadioProps {
  id: string; // ID único para el botón de radio
  name: string; // Nombre del grupo para el botón de radio
  value: string; // Valor del botón de radio
  checked: boolean; // Si el botón de radio está marcado
  label: string; // Texto de etiqueta para el botón de radio
  onChange: (value: string) => void; // Manejador para cuando el botón de radio se alterna
  className?: string; // Clases personalizadas opcionales para estilos
}

const RadioSm: React.FC<RadioProps> = ({
  id,
  name,
  value,
  checked,
  label,
  onChange,
  className = "",
}) => {
  return (
    <label
      htmlFor={id}
      className={`flex cursor-pointer select-none items-center text-sm text-gray-500 dark:text-gray-400 ${className}`}
    >
      <span className="relative">
        {/* Input Oculto */}
        <input
          type="radio"
          id={id}
          name={name}
          value={value}
          checked={checked}
          onChange={() => onChange(value)}
          className="sr-only"
        />
        {/* Círculo de Radio Estilizado */}
        <span
          className={`mr-2 flex h-4 w-4 items-center justify-center rounded-full border ${
            checked
              ? "border-blue-500 bg-blue-500"
              : "bg-transparent border-gray-300 dark:border-gray-700"
          }`}
        >
          {/* Punto Interior */}
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              checked ? "bg-white" : "bg-white dark:bg-[#1e2636]"
            }`}
          ></span>
        </span>
      </span>
      {label}
    </label>
  );
};

export default RadioSm;
