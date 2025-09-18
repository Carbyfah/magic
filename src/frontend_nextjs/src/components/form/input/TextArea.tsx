import React from "react";

interface TextareaProps {
  placeholder?: string; // Texto de placeholder
  rows?: number; // Número de filas
  value?: string; // Valor actual
  onChange?: (value: string) => void; // Manejador de cambios
  className?: string; // Clases CSS adicionales
  disabled?: boolean; // Estado deshabilitado
  error?: boolean; // Estado de error
  hint?: string; // Texto de ayuda a mostrar
}

const TextArea: React.FC<TextareaProps> = ({
  placeholder = "Ingresa tu mensaje", // Placeholder por defecto
  rows = 3, // Número de filas por defecto
  value = "", // Valor por defecto
  onChange, // Callback para cambios
  className = "", // Estilos personalizados adicionales
  disabled = false, // Estado deshabilitado
  error = false, // Estado de error
  hint = "", // Texto de ayuda por defecto
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  let textareaClasses = `w-full rounded-lg border px-4 py-2.5 text-sm shadow-sm focus:outline-none resize-vertical ${className} `;

  if (disabled) {
    textareaClasses += ` bg-gray-100 opacity-50 text-gray-500 border-gray-300 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700`;
  } else if (error) {
    textareaClasses += ` bg-transparent border-red-500 focus:border-red-300 focus:ring-2 focus:ring-red-500/10 dark:border-red-500 dark:bg-gray-900 dark:text-white/90 dark:focus:border-red-600`;
  } else {
    textareaClasses += ` bg-transparent text-gray-900 dark:text-gray-300 border-gray-300 focus:border-blue-300 focus:ring-2 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-blue-600`;
  }

  return (
    <div className="relative">
      <textarea
        placeholder={placeholder}
        rows={rows}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className={textareaClasses}
      />
      {hint && (
        <p
          className={`mt-2 text-sm ${
            error ? "text-red-500" : "text-gray-500 dark:text-gray-400"
          }`}
        >
          {hint}
        </p>
      )}
    </div>
  );
};

export default TextArea;
