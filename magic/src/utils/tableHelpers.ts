// Utilidades para manejo de tablas y filtros

export type SortDirection = "asc" | "desc";

export interface TableColumn {
  key: string;
  label: string;
  type: "string" | "number" | "date" | "boolean";
  sortable: boolean;
  searchable: boolean;
}

export interface FilterOption {
  value: string;
  label: string;
}

export interface SortConfig {
  key: string;
  direction: SortDirection;
}

/**
 * Filtra una lista de registros basado en un término de búsqueda
 */
export const filtrarRegistros = <T extends Record<string, unknown>>(
  registros: T[],
  busqueda: string,
  camposBusqueda: string[]
): T[] => {
  if (!busqueda.trim()) return registros;

  const terminoLower = busqueda.toLowerCase();

  return registros.filter((registro) =>
    camposBusqueda.some((campo) => {
      const valor = obtenerValorAnidado(registro, campo);
      return valor?.toString().toLowerCase().includes(terminoLower);
    })
  );
};

/**
 * Ordena una lista de registros basado en una configuración
 */
export const ordenarRegistros = <T extends Record<string, unknown>>(
  registros: T[],
  sortConfig: SortConfig | null
): T[] => {
  if (!sortConfig) return registros;

  return [...registros].sort((a, b) => {
    const valorA = obtenerValorAnidado(a, sortConfig.key);
    const valorB = obtenerValorAnidado(b, sortConfig.key);

    if (valorA === valorB) return 0;

    let comparacion = 0;

    // Comparación por tipo
    if (typeof valorA === "number" && typeof valorB === "number") {
      comparacion = valorA - valorB;
    } else if (valorA instanceof Date && valorB instanceof Date) {
      comparacion = valorA.getTime() - valorB.getTime();
    } else {
      // Comparación como string
      const strA = (valorA || "").toString().toLowerCase();
      const strB = (valorB || "").toString().toLowerCase();
      comparacion = strA.localeCompare(strB);
    }

    return sortConfig.direction === "desc" ? -comparacion : comparacion;
  });
};

/**
 * Obtiene un valor anidado de un objeto usando notación de punto
 */
export const obtenerValorAnidado = (
  obj: Record<string, unknown>,
  path: string
): unknown => {
  return path.split(".").reduce((current, key) => {
    if (current && typeof current === "object" && key in current) {
      return (current as Record<string, unknown>)[key];
    }
    return null;
  }, obj as unknown);
};

/**
 * Genera opciones de filtro basadas en valores únicos de una columna
 */
export const generarOpcionesFiltro = <T extends Record<string, unknown>>(
  registros: T[],
  campo: string
): FilterOption[] => {
  const valoresUnicos = new Set<string>();

  registros.forEach((registro) => {
    const valor = obtenerValorAnidado(registro, campo);
    if (valor !== null && valor !== undefined) {
      valoresUnicos.add(valor.toString());
    }
  });

  return Array.from(valoresUnicos)
    .sort()
    .map((valor) => ({
      value: valor,
      label: valor,
    }));
};

/**
 * Filtra registros por un campo específico
 */
export const filtrarPorCampo = <T extends Record<string, unknown>>(
  registros: T[],
  campo: string,
  valor: string
): T[] => {
  if (!valor) return registros;

  return registros.filter((registro) => {
    const valorCampo = obtenerValorAnidado(registro, campo);
    return valorCampo?.toString() === valor;
  });
};

/**
 * Combina múltiples filtros
 */
export const aplicarFiltros = <T extends Record<string, unknown>>(
  registros: T[],
  filtros: Record<string, string>,
  busqueda: string,
  camposBusqueda: string[]
): T[] => {
  let resultado = registros;

  // Aplicar búsqueda general
  if (busqueda) {
    resultado = filtrarRegistros(resultado, busqueda, camposBusqueda);
  }

  // Aplicar filtros específicos
  Object.entries(filtros).forEach(([campo, valor]) => {
    if (valor) {
      resultado = filtrarPorCampo(resultado, campo, valor);
    }
  });

  return resultado;
};

/**
 * Determina el tipo de una columna basado en los valores
 */
export const determinarTipoColumna = <T extends Record<string, unknown>>(
  registros: T[],
  campo: string
): "string" | "number" | "date" | "boolean" => {
  if (registros.length === 0) return "string";

  const primerValor = obtenerValorAnidado(registros[0], campo);

  if (typeof primerValor === "number") return "number";
  if (typeof primerValor === "boolean") return "boolean";
  if (primerValor instanceof Date) return "date";

  // Verificar si parece una fecha
  if (typeof primerValor === "string" && !isNaN(Date.parse(primerValor))) {
    return "date";
  }

  return "string";
};
