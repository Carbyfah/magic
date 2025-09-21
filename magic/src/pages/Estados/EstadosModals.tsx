import { Modal } from "../../components/ui/modal";
import Button from "../../components/ui/button/Button";
import Label from "../../components/form/Label";
import { PencilIcon, TrashBinIcon, CreatePlusIcon } from "../../icons";

interface Estado {
  id: number;
  nombre: string;
  descripcion: string | null;
}

interface EstadoForm {
  nombre: string;
  descripcion: string;
}

interface EstadosModalsProps {
  modalCrear: boolean;
  modalEditar: boolean;
  modalEliminar: boolean;
  estadoSeleccionado: Estado | null;
  formulario: EstadoForm;
  guardando: boolean;
  error: string | null;
  onCerrar: () => void;
  onCambioFormulario: (campo: keyof EstadoForm, valor: string) => void;
  onCrear: () => void;
  onEditar: () => void;
  onEliminar: () => void;
}

export default function EstadosModals({
  modalCrear,
  modalEditar,
  modalEliminar,
  estadoSeleccionado,
  formulario,
  guardando,
  error,
  onCerrar,
  onCambioFormulario,
  onCrear,
  onEditar,
  onEliminar
}: EstadosModalsProps) {
  return (
    <>
      {/* Modal Crear Estado */}
      <Modal isOpen={modalCrear} onClose={onCerrar} className="max-w-md mx-4">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20">
              <CreatePlusIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Crear Nuevo Estado
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Registrar un nuevo estado en el sistema
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-4 mb-6">
            <div>
              <Label>Nombre del Estado</Label>
              <input
                type="text"
                value={formulario.nombre}
                onChange={(e) => onCambioFormulario('nombre', e.target.value)}
                placeholder="Ej: Disponible"
                disabled={guardando}
                className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-950 dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus-visible:ring-gray-300 dark:text-white"
              />
            </div>
            <div>
              <Label>Descripción</Label>
              <input
                type="text"
                value={formulario.descripcion}
                onChange={(e) => onCambioFormulario('descripcion', e.target.value)}
                placeholder="Ej: Puede asignarse a rutas"
                disabled={guardando}
                className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-950 dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus-visible:ring-gray-300 dark:text-white"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button size="md" variant="outline" onClick={onCerrar} disabled={guardando}>
              Cancelar
            </Button>
            <Button size="md" variant="primary" onClick={onCrear} disabled={guardando}>
              {guardando ? "Creando..." : "Crear Estado"}
            </Button>
          </div>
        </div>
      </Modal>

{/* Modal Editar Estado */}
      <Modal isOpen={modalEditar} onClose={onCerrar} className="max-w-md mx-4">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20">
              <PencilIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Editar Estado
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Modificar información del estado
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-4 mb-6">
            <div>
              <Label>Nombre del Estado</Label>
              <input
                type="text"
                value={formulario.nombre}
                onChange={(e) => onCambioFormulario('nombre', e.target.value)}
                placeholder="Ej: Disponible"
                disabled={guardando}
                className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-950 dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus-visible:ring-gray-300 dark:text-white"
              />
            </div>
            <div>
              <Label>Descripción</Label>
              <input
                type="text"
                value={formulario.descripcion}
                onChange={(e) => onCambioFormulario('descripcion', e.target.value)}
                placeholder="Ej: Puede asignarse a rutas"
                disabled={guardando}
                className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-950 dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus-visible:ring-gray-300 dark:text-white"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button size="md" variant="outline" onClick={onCerrar} disabled={guardando}>
              Cancelar
            </Button>
            <Button size="md" variant="primary" onClick={onEditar} disabled={guardando}>
              {guardando ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Eliminar Estado */}
      <Modal isOpen={modalEliminar} onClose={onCerrar} className="max-w-md mx-4">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20">
              <TrashBinIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Eliminar Estado
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Esta acción no se puede deshacer
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
              {error}
            </div>
          )}

          <p className="mb-6 text-gray-700 dark:text-gray-300">
            ¿Estás seguro que deseas eliminar el estado{" "}
            <span className="font-semibold">{estadoSeleccionado?.nombre}</span>?{" "}
            Esta acción eliminará el estado del sistema.
          </p>

          <div className="flex gap-3 justify-end">
            <Button size="md" variant="outline" onClick={onCerrar} disabled={guardando}>
              Cancelar
            </Button>
            <Button
              size="md"
              variant="primary"
              onClick={onEliminar}
              disabled={guardando}
              className="bg-red-600 hover:bg-red-700"
            >
              {guardando ? "Eliminando..." : "Eliminar Estado"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}