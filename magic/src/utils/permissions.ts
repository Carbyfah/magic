// Sistema de permisos centralizado para Magic Travel

export interface UserData {
  id: number;
  name: string;
  email: string;
  username: string;
  empleado: {
    id: number;
    nombres: string;
    apellidos: string;
    agencia_id: number;
    cargo_id: number;
  };
}

export interface EmployeeData {
  id: number;
  nombres: string;
  apellidos: string;
  cargo: string;
  agencia_id: number;
  cargo_id: number;
}

/**
 * Obtiene los datos del usuario logueado desde localStorage
 */
export const getUserData = (): UserData | null => {
  try {
    const userData = localStorage.getItem("user_data");
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Error al obtener datos del usuario:", error);
    return null;
  }
};

/**
 * Verifica si el usuario actual es administrador o desarrollador
 */
export const esAdminODesarrollador = (): boolean => {
  const user = getUserData();
  if (!user || !user.empleado) return false;

  // Verificar por cargo_id (1 = Desarrollador según tu BD)
  if (user.empleado.cargo_id === 1) return true;

  return false;
};

/**
 * Verifica si el usuario tiene permisos para ver registros inactivos
 */
export const puedeVerInactivos = (): boolean => {
  return esAdminODesarrollador();
};

/**
 * Verifica si el usuario puede restaurar registros eliminados
 */
export const puedeRestaurarRegistros = (): boolean => {
  return esAdminODesarrollador();
};

/**
 * Verifica si el usuario puede eliminar un registro específico
 */
export const puedeEliminarRegistro = (registro: {
  es_magic_travel?: boolean;
}): boolean => {
  // Magic Travel no se puede eliminar
  if (registro.es_magic_travel) return false;

  // Solo admins/desarrolladores pueden eliminar
  return esAdminODesarrollador();
};

/**
 * Obtiene el cargo del usuario actual
 */
export const getCargoUsuario = (): string => {
  const user = getUserData();
  return user?.empleado ? "Desarrollador" : "Usuario";
};

/**
 * Verifica si el usuario tiene un permiso específico para un módulo
 */
export const tienePermiso = (): boolean => {
  // TODO: Implementar verificación contra API de permisos
  // Por ahora, admins/desarrolladores tienen todos los permisos
  return esAdminODesarrollador();
};
