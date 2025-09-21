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
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Checkbox from "../../components/form/input/Checkbox";
import { PencilIcon, TrashBinIcon, CreatePlusIcon } from "../../icons";
import { useTableControls } from "../../hooks/useTableControls";
import { usePagination } from "../../hooks/usePagination";
import { usePerPageSelector } from "../../hooks/usePerPageSelector";
import type { TableColumn } from "../../utils/tableHelpers";
import AgenciasModals from "./AgenciasModals";

// Interfaces para TypeScript basadas en la API real
interface Agencia {
  [key: string]: unknown;
  id: number;
  nombre: string;
  es_magic_travel: boolean;
  iniciales: string;
  eliminado_en: string | null;
  empleados: Array<{
    id: number;
    nombre_completo: string;
    cargo: string;
    dpi: string;
  }>;
  estadisticas: {
    empleados_count: number;
    rutas_count: number;
    tours_count: number;
    vehiculos_count: number;
    reservas_transferidas_count: number;
  };
  computed: {
    puede_recibir_transferencias: boolean;
    tiene_empleados: boolean;
    tiene_rutas: boolean;
    tiene_tours: boolean;
    tiene_vehiculos: boolean;
  };
  metadatos: {
    creado_en: string;
    actualizado_en: string;
    eliminado_en: string | null;
    creado_por: number | null;
  };
}

interface AgenciasResponse {
  data: Agencia[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
}

interface AgenciaForm {
  nombre: string;
}

const API_BASE_URL = "http://localhost:8080/api";

// Configuración de columnas para el hook
const COLUMNAS_AGENCIAS: TableColumn[] = [
  {
    key: "nombre",
    label: "Nombre",
    type: "string",
    sortable: true,
    searchable: true
  },
  {
    key: "estadisticas.empleados_count",
    label: "Empleados",
    type: "number",
    sortable: true,
    searchable: false
  },
  {
    key: "computed.puede_recibir_transferencias",
    label: "Estado Operativo",
    type: "boolean",
    sortable: true,
    searchable: false
  }
];

const CAMPOS_BUSQUEDA = ["nombre", "iniciales"];

export default function Agencias() {
  const [agencias, setAgencias] = useState<Agencia[]>([]);
  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [agenciaSeleccionada, setAgenciaSeleccionada] = useState<Agencia | null>(null);
  const [formulario, setFormulario] = useState<AgenciaForm>({ nombre: "" });
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hook con las 3 funcionalidades
  const tableControls = useTableControls(agencias, {
    columnas: COLUMNAS_AGENCIAS,
    camposBusqueda: CAMPOS_BUSQUEDA,
    columnaInactivos: "eliminado_en"
  });

  const pagination = usePagination(10);
  const perPageSelector = usePerPageSelector(10);
  
  // Cargar agencias al montar el componente
  useEffect(() => {
    cargarAgencias();
  }, []);

  // Listener para el botón flotante
  useEffect(() => {
    const handleFloatingButtonClick = () => {
      abrirModalCrear();
    };

    window.addEventListener('openCreateModal', handleFloatingButtonClick);
    return () => {
      window.removeEventListener('openCreateModal', handleFloatingButtonClick);
    };
  }, []);

  // Recargar cuando cambie mostrar inactivos
  useEffect(() => {
    if (!cargando) {
      cargarAgencias(tableControls.mostrarInactivos);
    }
  }, [tableControls.mostrarInactivos]);

  // Recargar cuando cambien paginación o registros por página
useEffect(() => {
  if (!cargando) {
    cargarAgencias(tableControls.mostrarInactivos);
  }
}, [pagination.paginationParams.page, perPageSelector.perPage]);

// Reset paginación cuando cambien filtros
useEffect(() => {
  pagination.resetToFirstPage();
}, [tableControls.busqueda, tableControls.mostrarInactivos]);

const cargarAgencias = async (incluirEliminados = false) => {
  try {
    setCargando(true);
    setError(null);
    
    const token = localStorage.getItem('auth_token');
    const params = new URLSearchParams({
      ...(incluirEliminados && { incluir_eliminados: 'true' }),
      page: pagination.paginationParams.page.toString(),
      per_page: perPageSelector.perPage.toString()
    });
    
    const url = `${API_BASE_URL}/agencias?${params}`;
      
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data: AgenciasResponse = await response.json();
    setAgencias(data.data);
    pagination.updateFromResponse(data.meta);
  } catch (error) {
    console.error('Error al cargar agencias:', error);
    setError('Error al cargar la lista de agencias');
  } finally {
    setCargando(false);
  }
};

  const abrirModalCrear = () => {
    setFormulario({ nombre: "" });
    setModalCrear(true);
  };

  const abrirModalEditar = (agencia: Agencia) => {
    setAgenciaSeleccionada(agencia);
    setFormulario({ nombre: agencia.nombre });
    setModalEditar(true);
  };

  const abrirModalEliminar = (agencia: Agencia) => {
    setAgenciaSeleccionada(agencia);
    setModalEliminar(true);
  };

  const cerrarModales = () => {
    setModalCrear(false);
    setModalEditar(false);
    setModalEliminar(false);
    setAgenciaSeleccionada(null);
    setFormulario({ nombre: "" });
    setError(null);
  };

  const manejarCambioFormulario = (campo: keyof AgenciaForm, valor: string) => {
    setFormulario(prev => ({ ...prev, [campo]: valor }));
  };

  const crearAgencia = async () => {
    if (!formulario.nombre.trim()) {
      setError("Por favor completa el campo nombre");
      return;
    }

    try {
      setGuardando(true);
      setError(null);

      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/agencias`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agencias_nombre: formulario.nombre,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}`);
      }

      await cargarAgencias(tableControls.mostrarInactivos);
      cerrarModales();
    } catch (error) {
      console.error('Error al crear agencia:', error);
      setError(error instanceof Error ? error.message : 'Error al crear agencia');
    } finally {
      setGuardando(false);
    }
  };

  const editarAgencia = async () => {
    if (!agenciaSeleccionada || !formulario.nombre.trim()) {
      setError("Por favor completa el campo nombre");
      return;
    }

    try {
      setGuardando(true);
      setError(null);

      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/agencias/${agenciaSeleccionada.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agencias_nombre: formulario.nombre,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}`);
      }

      await cargarAgencias(tableControls.mostrarInactivos);
      cerrarModales();
    } catch (error) {
      console.error('Error al editar agencia:', error);
      setError(error instanceof Error ? error.message : 'Error al editar agencia');
    } finally {
      setGuardando(false);
    }
  };

  const eliminarAgencia = async () => {
    if (!agenciaSeleccionada) return;

    try {
      setGuardando(true);
      setError(null);

      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/agencias/${agenciaSeleccionada.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}`);
      }

      await cargarAgencias(tableControls.mostrarInactivos);
      cerrarModales();
    } catch (error) {
      console.error('Error al eliminar agencia:', error);
      setError(error instanceof Error ? error.message : 'Error al eliminar agencia');
    } finally {
      setGuardando(false);
    }
  };

  const restaurarAgencia = async (agencia: Agencia) => {
    try {
      setError(null);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/agencias/${agencia.id}/restaurar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}`);
      }

      await cargarAgencias(tableControls.mostrarInactivos);
    } catch (error) {
      console.error('Error al restaurar agencia:', error);
      setError(error instanceof Error ? error.message : 'Error al restaurar agencia');
    }
  };

  if (cargando && agencias.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-lg text-gray-600 dark:text-gray-400">Cargando agencias...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="Agencias | Magic Travel"
        description="Gestión de agencias del sistema Magic Travel"
      />
      <PageBreadcrumb pageTitle="Agencias" />
      
      <div className="space-y-6">
        {error && !modalCrear && !modalEditar && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
            {error}
          </div>
        )}

        <ComponentCard title="Lista de Agencias">
          {/* Controles simples */}
            <div className="space-y-4 mb-6">
              {/* Búsqueda y Selector en la misma fila */}
              <div className="flex items-end gap-4">
                <div className="flex-1 max-w-md">
                  <Label>Buscar</Label>
                  <Input
                    type="text"
                    placeholder="Buscar agencias..."
                    value={tableControls.busqueda}
                    onChange={(e) => tableControls.manejarBusqueda(e.target.value)}
                  />
                </div>
                
                {/* Selector de registros por página */}
                <div className="flex items-center gap-3">
                  <Label>Mostrar:</Label>
                  <select
                    value={perPageSelector.perPage}
                    onChange={(e) => perPageSelector.setPerPage(Number(e.target.value))}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                  >
                    {perPageSelector.perPageOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

            {/* Checkbox mostrar inactivos */}
            {tableControls.puedeVerRegistrosInactivos && (
              <Checkbox
                id="mostrar-inactivos"
                label={`Mostrar inactivos (${tableControls.registrosInactivos})`}
                checked={tableControls.mostrarInactivos}
                onChange={tableControls.manejarMostrarInactivos}
              />
            )}
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      <div 
                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-1 rounded"
                        onClick={() => tableControls.manejarOrdenamiento("nombre")}
                      >
                        Agencia
                        {tableControls.sortConfig?.key === "nombre" && (
                          <span className="text-xs">
                            {tableControls.sortConfig.direction === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      <div 
                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-1 rounded"
                        onClick={() => tableControls.manejarOrdenamiento("estadisticas.empleados_count")}
                      >
                        Estadísticas
                        {tableControls.sortConfig?.key === "estadisticas.empleados_count" && (
                          <span className="text-xs">
                            {tableControls.sortConfig.direction === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      <div 
                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-1 rounded"
                        onClick={() => tableControls.manejarOrdenamiento("computed.puede_recibir_transferencias")}
                      >
                        Estado
                        {tableControls.sortConfig?.key === "computed.puede_recibir_transferencias" && (
                          <span className="text-xs">
                            {tableControls.sortConfig.direction === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {tableControls.datos.map((agencia) => (
                    <TableRow key={agencia.id}>
                      <TableCell className="px-5 py-4 sm:px-6 text-start">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 overflow-hidden rounded-full bg-blue-100 flex items-center justify-center dark:bg-blue-900">
                            <span className="text-blue-600 font-medium text-sm dark:text-blue-400">
                              {agencia.nombre.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                              {agencia.nombre}
                            </span>
                            <div className="flex gap-1 mt-1">
                              {agencia.es_magic_travel && (
                                <Badge size="sm" color="info">
                                  Principal
                                </Badge>
                              )}
                              {agencia.eliminado_en && (
                                <Badge size="sm" color="error">
                                  Inactivo
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <div className="flex flex-wrap gap-1">
                          <Badge size="sm" color="info">
                            {agencia.estadisticas?.empleados_count || 0} empleados
                          </Badge>
                          <Badge size="sm" color="info">
                            {agencia.estadisticas?.rutas_count || 0} rutas
                          </Badge>
                          <Badge size="sm" color="info">
                            {agencia.estadisticas?.vehiculos_count || 0} vehículos
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <div className="flex flex-col gap-1">
                          <Badge
                            size="sm"
                            color={agencia.computed?.puede_recibir_transferencias ? "success" : "warning"}
                          >
                            {agencia.computed?.puede_recibir_transferencias ? "Operativa" : "En configuración"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        <div className="flex gap-2">
                          {/* Botón restaurar para registros inactivos */}
                          {agencia.eliminado_en && tableControls.puedeRestaurar && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => restaurarAgencia(agencia)}
                              className="text-green-600 hover:text-green-700 hover:border-green-300"
                            >
                              <CreatePlusIcon className="w-4 h-4" />
                            </Button>
                          )}
                          
                          {/* Botones normales para registros activos */}
                          {!agencia.eliminado_en && (
                            <>
                              {!agencia.es_magic_travel && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => abrirModalEditar(agencia)}
                                >
                                  <PencilIcon className="w-4 h-4" />
                                </Button>
                              )}
                              {!agencia.es_magic_travel && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => abrirModalEliminar(agencia)}
                                  className="text-red-600 hover:text-red-700 hover:border-red-300"
                                >
                                  <TrashBinIcon className="w-4 h-4" />
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Controles de paginación */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Mostrando {pagination.showingFrom} - {pagination.showingTo} de {pagination.totalItems} resultados
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={pagination.previousPage}
                disabled={!pagination.hasPreviousPage}
              >
                Anterior
              </Button>
              
              {/* Números de página */}
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(pageNum => (
                <Button
                  key={pageNum}
                  size="sm"
                  variant={pageNum === pagination.currentPage ? "primary" : "outline"}
                  onClick={() => pagination.goToPage(pageNum)}
                >
                  {pageNum}
                </Button>
              ))}
              
              <Button
                size="sm"
                variant="outline"
                onClick={pagination.nextPage}
                disabled={!pagination.hasNextPage}
              >
                Siguiente
              </Button>
            </div>
          </div>
                  </ComponentCard>
                </div>

                <AgenciasModals
                  modalCrear={modalCrear}
                  modalEditar={modalEditar}
                  modalEliminar={modalEliminar}
                  agenciaSeleccionada={agenciaSeleccionada}
                  formulario={formulario}
                  guardando={guardando}
                  error={error}
                  onCerrar={cerrarModales}
                  onCambioFormulario={manejarCambioFormulario}
                  onCrear={crearAgencia}
                  onEditar={editarAgencia}
                  onEliminar={eliminarAgencia}
                />
              </>
            );
          }