import { useMemo } from "react";

interface PermisosModulo {
  ver: boolean;
  crear: boolean;
  editar: boolean;
  eliminar: boolean;
  exportar_excel: boolean;
  exportar_pdf: boolean;
}

interface PermisosUsuario {
  [modulo: string]: PermisosModulo;
}

const MAPEO_RUTAS_MODULOS: Record<string, string> = {
  "/agencias": "agencias",
  "/empleados": "empleados",
  "/usuarios": "empleados",
  "/servicios": "servicios",
  "/rutas": "rutas",
  "/tours": "tours",
  "/vehiculos": "vehiculos",
  "/estados": "estados",
  "/cargos": "cargos",
  "/reservas": "reservas",
  "/rutas-activas": "rutas",
  "/tours-activos": "tours",
  "/caja": "caja",
  "/ventas": "ventas",
  "/contabilidad": "contabilidad",
  "/egresos": "egresos",
  "/facturas": "facturas",
  "/dashboard/metricas": "contabilidad",
  "/auditoria": "contabilidad",
  "/notificaciones": "contabilidad",
  "/utils": "contabilidad",
  "/configuracion": "empleados",
};

export const usePermisos = () => {
  const permisos = useMemo(() => {
    try {
      const userData = localStorage.getItem("user_data");
      if (!userData) return null;
      const parsed = JSON.parse(userData);
      return parsed.permisos as PermisosUsuario;
    } catch {
      return null;
    }
  }, []);

  const puedeVer = (modulo: string): boolean => {
    if (!permisos) return false;
    return permisos[modulo]?.ver === true;
  };

  const puedeVerRuta = (ruta: string): boolean => {
    const modulo = MAPEO_RUTAS_MODULOS[ruta];
    if (!modulo) return true;
    return puedeVer(modulo);
  };

  const puedeCrear = (modulo: string): boolean => {
    if (!permisos) return false;
    return permisos[modulo]?.crear === true;
  };

  const puedeEditar = (modulo: string): boolean => {
    if (!permisos) return false;
    return permisos[modulo]?.editar === true;
  };

  const puedeEliminar = (modulo: string): boolean => {
    if (!permisos) return false;
    return permisos[modulo]?.eliminar === true;
  };

  const puedeExportarExcel = (modulo: string): boolean => {
    if (!permisos) return false;
    return permisos[modulo]?.exportar_excel === true;
  };

  const puedeExportarPdf = (modulo: string): boolean => {
    if (!permisos) return false;
    return permisos[modulo]?.exportar_pdf === true;
  };

  const obtenerPermisosModulo = (modulo: string): PermisosModulo | null => {
    if (!permisos) return null;
    return permisos[modulo] || null;
  };

  const tieneAccesoCompleto = (modulo: string): boolean => {
    const permisosModulo = obtenerPermisosModulo(modulo);
    if (!permisosModulo) return false;
    return Object.values(permisosModulo).every((permiso) => permiso === true);
  };

  return {
    permisos,
    puedeVer,
    puedeVerRuta,
    puedeCrear,
    puedeEditar,
    puedeEliminar,
    puedeExportarExcel,
    puedeExportarPdf,
    obtenerPermisosModulo,
    tieneAccesoCompleto,
    tienePermisos: !!permisos,
  };
};
