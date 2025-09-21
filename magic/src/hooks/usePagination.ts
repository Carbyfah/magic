import { useState, useCallback, useMemo } from "react";

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

interface UsePaginationReturn {
  // Estados actuales
  currentPage: number;
  totalPages: number;
  perPage: number;

  // Funciones de navegación
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;

  // Parámetros para la API
  paginationParams: { page: number; per_page: number };

  // Actualizar desde respuesta API
  updateFromResponse: (meta: PaginationMeta) => void;

  // Info para mostrar
  showingFrom: number;
  showingTo: number;
  totalItems: number;

  // Estados de botones
  hasNextPage: boolean;
  hasPreviousPage: boolean;

  // Reset para cuando cambien filtros
  resetToFirstPage: () => void;
}

export const usePagination = (
  initialPerPage: number = 10
): UsePaginationReturn => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(initialPerPage);
  const [showingFrom, setShowingFrom] = useState(0);
  const [showingTo, setShowingTo] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  // Parámetros para la API
  const paginationParams = useMemo(
    () => ({
      page: currentPage,
      per_page: perPage,
    }),
    [currentPage, perPage]
  );

  // Estados de navegación
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  // Funciones de navegación
  const goToPage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    },
    [totalPages]
  );

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [hasNextPage]);

  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [hasPreviousPage]);

  // Actualizar desde respuesta API
  const updateFromResponse = useCallback((meta: PaginationMeta) => {
    setCurrentPage(meta.current_page);
    setTotalPages(meta.last_page);
    setPerPage(meta.per_page);
    setShowingFrom(meta.from || 0);
    setShowingTo(meta.to || 0);
    setTotalItems(meta.total);
  }, []);

  // Reset para cuando cambien filtros
  const resetToFirstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  return {
    currentPage,
    totalPages,
    perPage,
    goToPage,
    nextPage,
    previousPage,
    paginationParams,
    updateFromResponse,
    showingFrom,
    showingTo,
    totalItems,
    hasNextPage,
    hasPreviousPage,
    resetToFirstPage,
  };
};
