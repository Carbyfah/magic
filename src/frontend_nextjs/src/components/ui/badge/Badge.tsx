type BadgeVariant = "light" | "solid";
type BadgeSize = "sm" | "md";
type BadgeColor =
  | "primary"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "light"
  | "dark";

interface BadgeProps {
  variant?: BadgeVariant; // Variante light o solid
  size?: BadgeSize; // Tamaño del badge
  color?: BadgeColor; // Color del badge
  startIcon?: React.ReactNode; // Icono al inicio
  endIcon?: React.ReactNode; // Icono al final
  children: React.ReactNode; // Contenido del badge
}

const Badge: React.FC<BadgeProps> = ({
  variant = "light",
  color = "primary",
  size = "md",
  startIcon,
  endIcon,
  children,
}) => {
  const baseStyles =
    "inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium";

  // Definir estilos de tamaño
  const sizeStyles = {
    sm: "text-xs", // Tamaño de fuente más pequeño
    md: "text-sm", // Tamaño de fuente por defecto
  };

  // Definir estilos de color para variantes
  const variants = {
    light: {
      primary:
        "bg-blue-50 text-blue-500 dark:bg-blue-500/15 dark:text-blue-400",
      success:
        "bg-green-50 text-green-600 dark:bg-green-500/15 dark:text-green-500",
      error:
        "bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-500",
      warning:
        "bg-yellow-50 text-yellow-600 dark:bg-yellow-500/15 dark:text-orange-400",
      info: "bg-blue-50 text-blue-500 dark:bg-blue-500/15 dark:text-blue-500",
      light: "bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-white/80",
      dark: "bg-gray-500 text-white dark:bg-white/5 dark:text-white",
    },
    solid: {
      primary: "bg-blue-500 text-white dark:text-white",
      success: "bg-green-500 text-white dark:text-white",
      error: "bg-red-500 text-white dark:text-white",
      warning: "bg-yellow-500 text-white dark:text-white",
      info: "bg-blue-500 text-white dark:text-white",
      light: "bg-gray-400 dark:bg-white/5 text-white dark:text-white/80",
      dark: "bg-gray-700 text-white dark:text-white",
    },
  };

  // Obtener estilos basados en tamaño y variante de color
  const sizeClass = sizeStyles[size];
  const colorStyles = variants[variant][color];

  return (
    <span className={`${baseStyles} ${sizeClass} ${colorStyles}`}>
      {startIcon && <span className="mr-1">{startIcon}</span>}
      {children}
      {endIcon && <span className="ml-1">{endIcon}</span>}
    </span>
  );
};

export default Badge;
