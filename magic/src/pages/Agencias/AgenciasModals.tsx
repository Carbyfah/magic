import { Modal } from "../../components/ui/modal";
import Button from "../../components/ui/button/Button";
import Label from "../../components/form/Label";
import { GroupIcon, PencilIcon, TrashBinIcon } from "../../icons";

interface Agencia {
  id: number;
  nombre: string;
  es_magic_travel: boolean;
  iniciales: string;
  eliminado_en: string | null;
}

interface AgenciaForm {
  nombre: string;
}

interface AgenciasModalsProps {
  modalCrear: boolean;
  modalEditar: boolean;
  modalEliminar: boolean;
  agenciaSeleccionada: Agencia | null;
  formulario: AgenciaForm;
  guardando: boolean;
  error: string | null;
  onCerrar: () => void;
  onCambioFormulario: (campo: keyof AgenciaForm, valor: string) => void;
  onCrear: () => void;
  onEditar: () => void;
  onEliminar: () => void;
}

export default function AgenciasModals({
  modalCrear,
  modalEditar,
  modalEliminar,
  agenciaSeleccionada,
  formulario,
  guardando,
  error,
  onCerrar,
  onCambioFormulario,
  onCrear,
  onEditar,
  onEliminar
}: AgenciasModalsProps) {
  return (
    <>
      {/* Modal Crear Agencia */}
      <Modal isOpen={modalCrear} onClose={onCerrar} className="max-w-md mx-4">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20">
              <GroupIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Crear Nueva Agencia
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Registrar una nueva agencia en el sistema
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
              <Label>Nombre de la Agencia</Label>
              <input
                type="text"
                value={formulario.nombre}
                onChange={(e) => onCambioFormulario('nombre', e.target.value)}
                placeholder="Ej: Agencia de Viajes ABC"
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
              {guardando ? "Creando..." : "Crear Agencia"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Editar Agencia */}
      <Modal isOpen={modalEditar} onClose={onCerrar} className="max-w-md mx-4">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20">
              <PencilIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Editar Agencia
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Modificar información de la agencia
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
              <Label>Nombre de la Agencia</Label>
              <input
                type="text"
                value={formulario.nombre}
                onChange={(e) => onCambioFormulario('nombre', e.target.value)}
                placeholder="Ej: Agencia de Viajes ABC"
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

      {/* Modal Eliminar Agencia */}
      <Modal isOpen={modalEliminar} onClose={onCerrar} className="max-w-md mx-4">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20">
              <TrashBinIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Eliminar Agencia
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
            ¿Estás seguro que deseas eliminar la agencia{" "}
            <span className="font-semibold">{agenciaSeleccionada?.nombre}</span>?{" "}
            Esta acción eliminará todos los datos relacionados.
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
              {guardando ? "Eliminando..." : "Eliminar Agencia"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}