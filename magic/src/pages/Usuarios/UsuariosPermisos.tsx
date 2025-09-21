import { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Modal } from "../../components/ui/modal";
import Checkbox from "../../components/form/input/Checkbox";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";

// Interfaces para TypeScript basadas en la API real
interface Usuario {
  id: number;
  nombre: string;
  email: string;
  empleado: {
    agencia: string;
    cargo: string;
  };
  permisos_configurados: boolean;
  total_permisos: number;
}

interface PermisoModulo {
  nombre_modulo: string;
  ver: boolean;
  crear: boolean;
  editar: boolean;
  eliminar: boolean;
  exportar_excel: boolean;
  exportar_pdf: boolean;
}

interface UsuariosResponse {
  success: boolean;
  data: {
    usuarios: Usuario[];
    modulos_disponibles: Record<string, string>;
  };
}

interface PermisosUsuarioResponse {
  success: boolean;
  data: {
    usuario: Usuario;
    permisos: Record<string, PermisoModulo>;
  };
}

interface UpdatePermisosRequest {
  permisos: Record<string, Omit<PermisoModulo, 'nombre_modulo'>>;
}

const API_BASE_URL = "http://localhost:8080/api";

export default function UsuariosPermisos() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [permisos, setPermisos] = useState<Record<string, PermisoModulo>>({});
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar lista de usuarios al montar el componente
  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      setCargando(true);
      setError(null);
      
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/permisos/usuarios`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data: UsuariosResponse = await response.json();
      
      if (data.success) {
        setUsuarios(data.data.usuarios);
      } else {
        throw new Error('Error en la respuesta del servidor');
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      setError('Error al cargar la lista de usuarios');
    } finally {
      setCargando(false);
    }
  };

  const cargarPermisosUsuario = async (usuarioId: number) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/permisos/usuario/${usuarioId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data: PermisosUsuarioResponse = await response.json();
      
      if (data.success) {
        setPermisos(data.data.permisos);
      } else {
        throw new Error('Error al cargar permisos del usuario');
      }
    } catch (error) {
      console.error('Error al cargar permisos:', error);
      setError('Error al cargar permisos del usuario');
    }
  };

  const abrirModalPermisos = async (usuario: Usuario) => {
    setUsuarioSeleccionado(usuario);
    setModalAbierto(true);
    await cargarPermisosUsuario(usuario.id);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setUsuarioSeleccionado(null);
    setPermisos({});
    setError(null);
  };

  const actualizarPermiso = (
    modulo: string, 
    permiso: keyof Omit<PermisoModulo, 'nombre_modulo'>, 
    valor: boolean
  ) => {
    setPermisos(prev => ({
      ...prev,
      [modulo]: {
        ...prev[modulo],
        [permiso]: valor
      }
    }));
  };

  const guardarPermisos = async () => {
    if (!usuarioSeleccionado) return;
    
    try {
      setGuardando(true);
      setError(null);

      // Preparar datos en el formato que espera la API
      const permisosParaEnviar: UpdatePermisosRequest = {
        permisos: {}
      };

      // Convertir permisos al formato requerido (sin nombre_modulo)
      Object.entries(permisos).forEach(([modulo, permisoCompleto]) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { nombre_modulo, ...permisosSinNombre } = permisoCompleto;
        permisosParaEnviar.permisos[modulo] = permisosSinNombre;
      });

      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/permisos/usuario/${usuarioSeleccionado.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(permisosParaEnviar),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Actualizar la lista de usuarios para reflejar cambios
        await cargarUsuarios();
        cerrarModal();
        // Aquí podrías mostrar una notificación de éxito
      } else {
        throw new Error(data.message || 'Error al guardar permisos');
      }
    } catch (error) {
      console.error('Error al guardar permisos:', error);
      setError('Error al guardar permisos');
    } finally {
      setGuardando(false);
    }
  };

  if (cargando && usuarios.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-lg text-gray-600 dark:text-gray-400">Cargando usuarios...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="Usuarios y Permisos | Magic Travel"
        description="Gestión de usuarios y permisos del sistema Magic Travel"
      />
      <PageBreadcrumb pageTitle="Usuarios y Permisos" />
      
      <div className="space-y-6">
        {error && !modalAbierto && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
            {error}
          </div>
        )}

        <ComponentCard title="Lista de Usuarios">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Usuario
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Cargo
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Agencia
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Permisos
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {usuarios.map((usuario) => (
                    <TableRow key={usuario.id}>
                      <TableCell className="px-5 py-4 sm:px-6 text-start">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 overflow-hidden rounded-full bg-blue-100 flex items-center justify-center dark:bg-blue-900">
                            <span className="text-blue-600 font-medium text-sm dark:text-blue-400">
                              {usuario.nombre.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                              {usuario.nombre}
                            </span>
                            <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                              {usuario.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {usuario.empleado.cargo}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {usuario.empleado.agencia}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <Badge
                            size="sm"
                            color={usuario.permisos_configurados ? "success" : "warning"}
                          >
                            {usuario.permisos_configurados ? "Configurados" : "Sin configurar"}
                          </Badge>
                          <span className="text-xs text-gray-400">
                            ({usuario.total_permisos} módulos)
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => abrirModalPermisos(usuario)}
                        >
                          Editar Permisos
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </ComponentCard>
      </div>

      {/* Modal de Permisos */}
      <Modal
        isOpen={modalAbierto}
        onClose={cerrarModal}
        className="max-w-5xl mx-4"
      >
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Editar Permisos de Usuario
            </h3>
            {usuarioSeleccionado && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {usuarioSeleccionado.nombre} - {usuarioSeleccionado.email}
              </p>
            )}
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="max-h-96 overflow-y-auto">
            <div className="grid gap-4">
              {Object.entries(permisos).map(([moduloKey, permiso]) => (
                <div key={moduloKey} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                    Módulo: {permiso.nombre_modulo}
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <Checkbox
                      label="Ver"
                      checked={permiso.ver}
                      onChange={(valor) => actualizarPermiso(moduloKey, 'ver', valor)}
                    />
                    <Checkbox
                      label="Crear"
                      checked={permiso.crear}
                      onChange={(valor) => actualizarPermiso(moduloKey, 'crear', valor)}
                    />
                    <Checkbox
                      label="Editar"
                      checked={permiso.editar}
                      onChange={(valor) => actualizarPermiso(moduloKey, 'editar', valor)}
                    />
                    <Checkbox
                      label="Eliminar"
                      checked={permiso.eliminar}
                      onChange={(valor) => actualizarPermiso(moduloKey, 'eliminar', valor)}
                    />
                    <Checkbox
                      label="Exportar Excel"
                      checked={permiso.exportar_excel}
                      onChange={(valor) => actualizarPermiso(moduloKey, 'exportar_excel', valor)}
                    />
                    <Checkbox
                      label="Exportar PDF"
                      checked={permiso.exportar_pdf}
                      onChange={(valor) => actualizarPermiso(moduloKey, 'exportar_pdf', valor)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              size="md"
              variant="outline"
              onClick={cerrarModal}
              disabled={guardando}
            >
              Cancelar
            </Button>
            <Button
              size="md"
              variant="primary"
              onClick={guardarPermisos}
              disabled={guardando}
            >
              {guardando ? "Guardando..." : "Guardar Permisos"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}