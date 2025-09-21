import { useState, useCallback } from "react";

interface UsePerPageSelectorReturn {
  // Estado actual
  perPage: number;

  // Función para cambiar
  setPerPage: (value: number) => void;

  // Opciones disponibles
  perPageOptions: Array<{ value: number; label: string }>;

  // Reset para restaurar valor inicial
  resetPerPage: () => void;
}

export const usePerPageSelector = (
  initialValue: number = 10
): UsePerPageSelectorReturn => {
  const [perPage, setPerPageState] = useState(initialValue);

  // Opciones predefinidas
  const perPageOptions = [
    { value: 5, label: "5 registros" },
    { value: 10, label: "10 registros" },
    { value: 20, label: "20 registros" },
    { value: 50, label: "50 registros" },
  ];

  // Función para cambiar perPage
  const setPerPage = useCallback((value: number) => {
    setPerPageState(value);
  }, []);

  // Reset para restaurar valor inicial
  const resetPerPage = useCallback(() => {
    setPerPageState(initialValue);
  }, [initialValue]);

  return {
    perPage,
    setPerPage,
    perPageOptions,
    resetPerPage,
  };
};
