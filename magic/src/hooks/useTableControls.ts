import { useState, useMemo } from "react";
import {
  ordenarRegistros,
  aplicarFiltros,
  generarOpcionesFiltro,
  determinarTipoColumna,
} from "../utils/tableHelpers";
import {
  puedeVerInactivos,
  puedeRestaurarRegistros,
} from "../utils/permissions";
import type { SortConfig, TableColumn } from "../utils/tableHelpers";

interface UseTableControlsConfig {
  columnas: TableColumn[];
  camposBusqueda: string[];
  columnaInactivos?: string; // Campo que indica si está eliminado/inactivo
}

export const useTableControls = <T extends Record<string, unknown>>(
  datos: T[],
  config: UseTableControlsConfig
) => {
  // Estados
  const [busqueda, setBusqueda] = useState("");
  const [mostrarInactivos, setMostrarInactivos] = useState(false);
  const [filtros, setFiltros] = useState<Record<string, string>>({});
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  // Permisos
  const puedeVerRegistrosInactivos = puedeVerInactivos();
  const puedeRestaurar = puedeRestaurarRegistros();

  // Filtrar datos según mostrar inactivos
  const datosVisibles = useMemo(() => {
    if (!config.columnaInactivos) return datos;

    if (mostrarInactivos && puedeVerRegistrosInactivos) {
      return datos; // Mostrar todos
    }

    // Solo mostrar activos
    return datos.filter((item) => {
      const valorInactivo = config.columnaInactivos
        ? item[config.columnaInactivos!]
        : false;
      return !valorInactivo;
    });
  }, [
    datos,
    mostrarInactivos,
    puedeVerRegistrosInactivos,
    config.columnaInactivos,
  ]);

  // Aplicar filtros y búsqueda
  const datosFiltrados = useMemo(() => {
    let resultado = datosVisibles;

    // Aplicar filtros combinados
    resultado = aplicarFiltros(
      resultado,
      filtros,
      busqueda,
      config.camposBusqueda
    );

    return resultado;
  }, [datosVisibles, filtros, busqueda, config.camposBusqueda]);

  // Aplicar ordenamiento
  const datosFinales = useMemo(() => {
    return ordenarRegistros(datosFiltrados, sortConfig);
  }, [datosFiltrados, sortConfig]);

  // Generar opciones de filtro para una columna
  const opcionesFiltro = useMemo(() => {
    const opciones: Record<
      string,
      Array<{ value: string; label: string }>
    > = {};

    config.columnas.forEach((columna) => {
      if (columna.key !== config.columnaInactivos) {
        opciones[columna.key] = generarOpcionesFiltro(
          datosVisibles,
          columna.key
        );
      }
    });

    return opciones;
  }, [datosVisibles, config.columnas, config.columnaInactivos]);

  // Funciones de control
  const manejarBusqueda = (valor: string) => {
    setBusqueda(valor);
  };

  const manejarMostrarInactivos = (valor: boolean) => {
    setMostrarInactivos(valor);
  };

  const manejarFiltro = (columna: string, valor: string) => {
    setFiltros((prev) => ({
      ...prev,
      [columna]: valor,
    }));
  };

  const manejarOrdenamiento = (columna: string) => {
    setSortConfig((prev) => {
      if (prev?.key === columna) {
        // Cambiar dirección si es la misma columna
        return {
          key: columna,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      } else {
        // Nueva columna, empezar con ascendente
        const tipoColumna = determinarTipoColumna(datos, columna);
        return {
          key: columna,
          direction: tipoColumna === "string" ? "asc" : "desc",
        };
      }
    });
  };

  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltros({});
    setSortConfig(null);
    setMostrarInactivos(false);
  };

  const limpiarFiltro = (columna: string) => {
    setFiltros((prev) => {
      const nuevos = { ...prev };
      delete nuevos[columna];
      return nuevos;
    });
  };

  // Información de estado
  const hayFiltrosActivos =
    busqueda !== "" ||
    Object.keys(filtros).length > 0 ||
    sortConfig !== null ||
    mostrarInactivos;

  const totalRegistros = datos.length;
  const registrosFiltrados = datosFinales.length;
  const registrosInactivos = config.columnaInactivos
    ? datos.filter((item) => Boolean(item[config.columnaInactivos!])).length
    : 0;

  return {
    // Datos procesados
    datos: datosFinales,

    // Estados
    busqueda,
    mostrarInactivos,
    filtros,
    sortConfig,

    // Opciones
    opcionesFiltro,

    // Permisos
    puedeVerRegistrosInactivos,
    puedeRestaurar,

    // Funciones
    manejarBusqueda,
    manejarMostrarInactivos,
    manejarFiltro,
    manejarOrdenamiento,
    limpiarFiltros,
    limpiarFiltro,

    // Información
    hayFiltrosActivos,
    totalRegistros,
    registrosFiltrados,
    registrosInactivos,
  };
};
