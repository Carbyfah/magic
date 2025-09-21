import { useMemo } from "react";

// Tipo para los permisos de un módulo
interface PermisosModulo {
  ver: boolean;
  crear: boolean;
  editar: boolean;
  eliminar: boolean;
  exportar_excel: boolean;
  exportar_pdf: boolean;
}

// Tipo para todos los permisos del usuario
interface PermisosUsuario {
  [modulo: string]: PermisosModulo;
}

// Mapeo de rutas a módulos de permisos
const MAPEO_RUTAS_MODULOS: Record<string, string> = {
  // Administración
  "/agencias": "agencias",
  "/empleados": "empleados",
  "/usuarios": "empleados", // Los usuarios están relacionados con empleados

  // Catálogos
  "/servicios": "servicios",
  "/rutas": "rutas",
  "/tours": "tours",
  "/vehiculos": "vehiculos",
  "/estados": "estados",
  "/cargos": "cargos",

  // Operaciones
  "/reservas": "reservas",
  "/rutas-activas": "rutas",
  "/tours-activos": "tours",

  // Financiero
  "/caja": "caja",
  "/ventas": "ventas",
  "/contabilidad": "contabilidad",
  "/egresos": "egresos",
  "/facturas": "facturas",

  // Reportes
  "/dashboard/metricas": "contabilidad",
  "/auditoria": "contabilidad",
  "/notificaciones": "contabilidad",

  // Sistema
  "/utils": "contabilidad",
  "/configuracion": "empleados",
};

// Hook principal para gestionar permisos
export const usePermisos = () => {
  // Obtener permisos del localStorage (donde se guardan después del login)
  const permisos = useMemo(() => {
    try {
      const userData = localStorage.getItem("user_data");
      if (!userData) return null;

      const parsed = JSON.parse(userData);
      return parsed.permisos as PermisosUsuario;
    } catch (error) {
      console.error("Error al obtener permisos del usuario:", error);
      return null;
    }
  }, []);

  // Verificar si puede ver un módulo específico
  const puedeVer = (modulo: string): boolean => {
    if (!permisos) return false;
    return permisos[modulo]?.ver === true;
  };

  // Verificar si puede ver una ruta específica
  const puedeVerRuta = (ruta: string): boolean => {
    const modulo = MAPEO_RUTAS_MODULOS[ruta];
    if (!modulo) return true; // Si no está mapeada, permitir acceso (ej: dashboard)
    return puedeVer(modulo);
  };

  // Verificar si puede crear en un módulo
  const puedeCrear = (modulo: string): boolean => {
    if (!permisos) return false;
    return permisos[modulo]?.crear === true;
  };

  // Verificar si puede editar en un módulo
  const puedeEditar = (modulo: string): boolean => {
    if (!permisos) return false;
    return permisos[modulo]?.editar === true;
  };

  // Verificar si puede eliminar en un módulo
  const puedeEliminar = (modulo: string): boolean => {
    if (!permisos) return false;
    return permisos[modulo]?.eliminar === true;
  };

  // Verificar si puede exportar Excel en un módulo
  const puedeExportarExcel = (modulo: string): boolean => {
    if (!permisos) return false;
    return permisos[modulo]?.exportar_excel === true;
  };

  // Verificar si puede exportar PDF en un módulo
  const puedeExportarPdf = (modulo: string): boolean => {
    if (!permisos) return false;
    return permisos[modulo]?.exportar_pdf === true;
  };

  // Obtener todos los permisos de un módulo
  const obtenerPermisosModulo = (modulo: string): PermisosModulo | null => {
    if (!permisos) return null;
    return permisos[modulo] || null;
  };

  // Verificar si el usuario tiene acceso completo (todos los permisos en true)
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
    // Métodos de utilidad
    tienePermisos: !!permisos,
  };
};
