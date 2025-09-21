import { ReactNode } from "react";

// Propiedades para Table
interface TableProps {
  children: ReactNode; // Contenido de la tabla (thead, tbody, etc.)
  className?: string; // Clase CSS opcional para estilos
}

// Propiedades para TableHeader
interface TableHeaderProps {
  children: ReactNode; // Fila(s) del encabezado
  className?: string; // Clase CSS opcional para estilos
}

// Propiedades para TableBody
interface TableBodyProps {
  children: ReactNode; // Fila(s) del cuerpo
  className?: string; // Clase CSS opcional para estilos
}

// Propiedades para TableRow
interface TableRowProps {
  children: ReactNode; // Celdas (th o td)
  className?: string; // Clase CSS opcional para estilos
}

// Propiedades para TableCell
interface TableCellProps {
  children: ReactNode; // Contenido de la celda
  isHeader?: boolean; // Si es true, renderiza como <th>, de lo contrario <td>
  className?: string; // Clase CSS opcional para estilos
}

// Componente Table
const Table: React.FC<TableProps> = ({ children, className }) => {
  return <table className={`min-w-full  ${className}`}>{children}</table>;
};

// Componente TableHeader
const TableHeader: React.FC<TableHeaderProps> = ({ children, className }) => {
  return <thead className={className}>{children}</thead>;
};

// Componente TableBody
const TableBody: React.FC<TableBodyProps> = ({ children, className }) => {
  return <tbody className={className}>{children}</tbody>;
};

// Componente TableRow
const TableRow: React.FC<TableRowProps> = ({ children, className }) => {
  return <tr className={className}>{children}</tr>;
};

// Componente TableCell
const TableCell: React.FC<TableCellProps> = ({
  children,
  isHeader = false,
  className,
}) => {
  const CellTag = isHeader ? "th" : "td";
  return <CellTag className={` ${className}`}>{children}</CellTag>;
};

export { Table, TableHeader, TableBody, TableRow, TableCell };