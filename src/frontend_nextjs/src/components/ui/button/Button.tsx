import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode; // Texto o contenido del botón
  size?: "sm" | "md"; // Tamaño del botón
  variant?: "primary" | "outline"; // Variante del botón
  startIcon?: ReactNode; // Icono antes del texto
  endIcon?: ReactNode; // Icono después del texto
  onClick?: () => void; // Manejador de clic
  disabled?: boolean; // Estado deshabilitado
  className?: string; // Clases adicionales
}

const Button: React.FC<ButtonProps> = ({
  children,
  size = "md",
  variant = "primary",
  startIcon,
  endIcon,
  onClick,
  className = "",
  disabled = false,
}) => {
  // Clases de Tamaño
  const sizeClasses = {
    sm: "px-4 py-3 text-sm",
    md: "px-5 py-3.5 text-sm",
  };

  // Clases de Variante
  const variantClasses = {
    primary:
      "bg-blue-600 text-white shadow-sm hover:bg-blue-700 disabled:bg-blue-300",
    outline:
      "bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300",
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg transition ${className} ${
        sizeClasses[size]
      } ${variantClasses[variant]} ${
        disabled ? "cursor-not-allowed opacity-50" : ""
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      {startIcon && <span className="flex items-center">{startIcon}</span>}
      {children}
      {endIcon && <span className="flex items-center">{endIcon}</span>}
    </button>
  );
};

export default Button;
