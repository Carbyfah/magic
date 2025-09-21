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
import EstadosModals from "./EstadosModals";

// Interfaces para TypeScript basadas en la API real
interface Estado {
  [key: string]: unknown;
  id: number;
  nombre: string;
  descripcion: string | null;
  deleted_at: string | null;
  estadisticas?: {
    vehiculos_count: number;
    rutas_activas_count: number;
    tours_activos_count: number;
    reservas_count: number;
    cajas_count: number;
    uso_total: number;
  } | null;
}

interface EstadosResponse {
  data: Estado[];
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

interface EstadoForm {
  nombre: string;
  descripcion: string;
}

const API_BASE_URL = "http://localhost:8080/api";

// Configuración de columnas para el hook
const COLUMNAS_ESTADOS: TableColumn[] = [
  {
    key: "nombre",
    label: "Nombre",
    type: "string",
    sortable: true,
    searchable: true
  },
  {
    key: "descripcion",
    label: "Descripción",
    type: "string",
    sortable: true,
    searchable: true
  }
];

const CAMPOS_BUSQUEDA = ["nombre", "descripcion"];

export default function Estados() {
  const [estados, setEstados] = useState<Estado[]>([]);
  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState<Estado | null>(null);
  const [formulario, setFormulario] = useState<EstadoForm>({ nombre: "", descripcion: "" });
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hook con las 3 funcionalidades
  const tableControls = useTableControls(estados, {
    columnas: COLUMNAS_ESTADOS,
    camposBusqueda: CAMPOS_BUSQUEDA,
    columnaInactivos: "deleted_at"
  });

  const pagination = usePagination(10);
  const perPageSelector = usePerPageSelector(10);
  
  // Cargar estados al montar el componente
  useEffect(() => {
    cargarEstados();
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
      cargarEstados(tableControls.mostrarInactivos);
    }
  }, [tableControls.mostrarInactivos]);

  // Recargar cuando cambien paginación o registros por página
  useEffect(() => {
    if (!cargando) {
      cargarEstados(tableControls.mostrarInactivos);
    }
  }, [pagination.paginationParams.page, perPageSelector.perPage]);

  // Reset paginación cuando cambien filtros
  useEffect(() => {
    pagination.resetToFirstPage();
  }, [tableControls.busqueda, tableControls.mostrarInactivos]);

  const cargarEstados = async (incluirEliminados = false) => {
    try {
      setCargando(true);
      setError(null);
      
      const token = localStorage.getItem('auth_token');
      const params = new URLSearchParams({
        ...(incluirEliminados && { incluir_eliminados: 'true' }),
        page: pagination.paginationParams.page.toString(),
        per_page: perPageSelector.perPage.toString()
      });
      
      const url = `${API_BASE_URL}/estados?${params}`;
        
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data: EstadosResponse = await response.json();
      setEstados(data.data);
      pagination.updateFromResponse(data.meta);
    } catch (error) {
      console.error('Error al cargar estados:', error);
      setError('Error al cargar la lista de estados');
    } finally {
      setCargando(false);
    }
  };

  const abrirModalCrear = () => {
    setFormulario({ nombre: "", descripcion: "" });
    setModalCrear(true);
  };

  const abrirModalEditar = (estado: Estado) => {
    setEstadoSeleccionado(estado);
    setFormulario({ 
      nombre: estado.nombre, 
      descripcion: estado.descripcion || "" 
    });
    setModalEditar(true);
  };

  const abrirModalEliminar = (estado: Estado) => {
    setEstadoSeleccionado(estado);
    setModalEliminar(true);
  };

  const cerrarModales = () => {
    setModalCrear(false);
    setModalEditar(false);
    setModalEliminar(false);
    setEstadoSeleccionado(null);
    setFormulario({ nombre: "", descripcion: "" });
    setError(null);
  };

  const manejarCambioFormulario = (campo: keyof EstadoForm, valor: string) => {
    setFormulario(prev => ({ ...prev, [campo]: valor }));
  };

  const crearEstado = async () => {
    if (!formulario.nombre.trim()) {
      setError("Por favor completa el campo nombre");
      return;
    }

    try {
      setGuardando(true);
      setError(null);

      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/estados`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          estado_nombre: formulario.nombre,
          estado_descripcion: formulario.descripcion || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}`);
      }

      await cargarEstados(tableControls.mostrarInactivos);
      cerrarModales();
    } catch (error) {
      console.error('Error al crear estado:', error);
      setError(error instanceof Error ? error.message : 'Error al crear estado');
    } finally {
      setGuardando(false);
    }
  };

  const editarEstado = async () => {
    if (!estadoSeleccionado || !formulario.nombre.trim()) {
      setError("Por favor completa el campo nombre");
      return;
    }

    try {
      setGuardando(true);
      setError(null);

      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/estados/${estadoSeleccionado.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          estado_nombre: formulario.nombre,
          estado_descripcion: formulario.descripcion || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}`);
      }

      await cargarEstados(tableControls.mostrarInactivos);
      cerrarModales();
    } catch (error) {
      console.error('Error al editar estado:', error);
      setError(error instanceof Error ? error.message : 'Error al editar estado');
    } finally {
      setGuardando(false);
    }
  };

  const eliminarEstado = async () => {
    if (!estadoSeleccionado) return;

    try {
      setGuardando(true);
      setError(null);

      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/estados/${estadoSeleccionado.id}`, {
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

      await cargarEstados(tableControls.mostrarInactivos);
      cerrarModales();
    } catch (error) {
      console.error('Error al eliminar estado:', error);
      setError(error instanceof Error ? error.message : 'Error al eliminar estado');
    } finally {
      setGuardando(false);
    }
  };

  const restaurarEstado = async (estado: Estado) => {
    try {
      setError(null);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/estados/${estado.id}/restore`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}`);
      }

      await cargarEstados(tableControls.mostrarInactivos);
    } catch (error) {
      console.error('Error al restaurar estado:', error);
      setError(error instanceof Error ? error.message : 'Error al restaurar estado');
    }
  };

  // Estados del seeder (ID 1-19) no se pueden editar
  const puedeEditarEstado = (estado: Estado) => {
    return estado.id > 19;
  };

  // Estados del seeder (ID 1-19) no se pueden eliminar
  const puedeEliminarEstado = (estado: Estado) => {
    return estado.id > 19;
  };

  if (cargando && estados.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-lg text-gray-600 dark:text-gray-400">Cargando estados...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="Estados | Magic Travel"
        description="Gestión de estados del sistema Magic Travel"
      />
      <PageBreadcrumb pageTitle="Estados" />
      
      <div className="space-y-6">
        {error && !modalCrear && !modalEditar && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
            {error}
          </div>
        )}

        <ComponentCard title="Lista de Estados">
          {/* Controles simples */}
          <div className="space-y-4 mb-6">
            {/* Búsqueda y Selector en la misma fila */}
            <div className="flex items-end gap-4">
              <div className="flex-1 max-w-md">
                <Label>Buscar</Label>
                <Input
                  type="text"
                  placeholder="Buscar estados..."
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
                        Estado
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
                        onClick={() => tableControls.manejarOrdenamiento("descripcion")}
                      >
                        Descripción
                        {tableControls.sortConfig?.key === "descripcion" && (
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
                  {tableControls.datos.map((estado) => (
                    <TableRow key={estado.id}>
                      <TableCell className="px-5 py-4 sm:px-6 text-start">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 overflow-hidden rounded-full bg-blue-100 flex items-center justify-center dark:bg-blue-900">
                            <span className="text-blue-600 font-medium text-sm dark:text-blue-400">
                              {estado.nombre.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                              {estado.nombre}
                            </span>
                            <div className="flex gap-1 mt-1">
                              {estado.id <= 19 && (
                                <Badge size="sm" color="info">
                                  Sistema
                                </Badge>
                              )}
                              {estado.deleted_at && (
                                <Badge size="sm" color="error">
                                  Inactivo
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <span className="block max-w-xs truncate">
                          {estado.descripcion || 'Sin descripción'}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        <div className="flex gap-2">
                          {/* Botón restaurar para registros inactivos */}
                          {estado.deleted_at && tableControls.puedeRestaurar && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => restaurarEstado(estado)}
                              className="text-green-600 hover:text-green-700 hover:border-green-300"
                            >
                              <CreatePlusIcon className="w-4 h-4" />
                            </Button>
                          )}
                          
                          {/* Botones normales para registros activos */}
                          {!estado.deleted_at && (
                            <>
                              {puedeEditarEstado(estado) && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => abrirModalEditar(estado)}
                                >
                                  <PencilIcon className="w-4 h-4" />
                                </Button>
                              )}
                              {puedeEliminarEstado(estado) && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => abrirModalEliminar(estado)}
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

      <EstadosModals
        modalCrear={modalCrear}
        modalEditar={modalEditar}
        modalEliminar={modalEliminar}
        estadoSeleccionado={estadoSeleccionado}
        formulario={formulario}
        guardando={guardando}
        error={error}
        onCerrar={cerrarModales}
        onCambioFormulario={manejarCambioFormulario}
        onCrear={crearEstado}
        onEditar={editarEstado}
        onEliminar={eliminarEstado}
      />
    </>
  );
}