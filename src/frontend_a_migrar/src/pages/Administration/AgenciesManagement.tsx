import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../../components/ui/modal";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";

// Tipos exactos de tu base de datos
interface Agency {
  id_agencias: number;
  agencias_nombre: string;
}

// API simplificada
const agenciesApi = {
  async getAll(): Promise<Agency[]> {
    const token = localStorage.getItem('auth_token');
    const response = await fetch('http://localhost:8080/api/agencias', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    return data.data; // Backend devuelve { data: [...] }
  },

  async create(nombre: string): Promise<any> {
    const token = localStorage.getItem('auth_token');
    const response = await fetch('http://localhost:8080/api/agencias', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ agencias_nombre: nombre })
    });
    return response.json();
  },

  async update(id: number, nombre: string): Promise<any> {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`http://localhost:8080/api/agencias/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ agencias_nombre: nombre })
    });
    return response.json();
  },

  async delete(id: number): Promise<any> {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`http://localhost:8080/api/agencias/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }
};

// Formulario
const AgencyForm = ({
  agency,
  onSubmit,
  onCancel,
  loading
}: {
  agency?: Agency;
  onSubmit: (nombre: string) => void;
  onCancel: () => void;
  loading: boolean;
}) => {
  const [nombre, setNombre] = useState(agency?.agencias_nombre || "");

  const handleSubmit = () => {
    if (nombre.trim()) {
      onSubmit(nombre.trim());
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Nombre de la Agencia</Label>
        <Input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ingrese el nombre"
          disabled={loading}
        />
      </div>
      <div className="flex gap-3">
        <Button
          size="md"
          variant="primary"
          onClick={handleSubmit}
          disabled={loading || !nombre.trim()}
        >
          {loading ? "Guardando..." : (agency ? "Actualizar" : "Crear")}
        </Button>
        <Button size="md" variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
      </div>
    </div>
  );
};

// Componente principal
export default function AgenciesManagement() {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingAgency, setEditingAgency] = useState<Agency | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const { isOpen: isCreateOpen, openModal: openCreate, closeModal: closeCreate } = useModal();
  const { isOpen: isEditOpen, openModal: openEdit, closeModal: closeEdit } = useModal();
  const { isOpen: isDeleteOpen, openModal: openDelete, closeModal: closeDelete } = useModal();

  // Cargar agencias
  const loadAgencies = async () => {
    try {
      setLoading(true);
      const data = await agenciesApi.getAll();
      setAgencies(data);
      setError("");
    } catch (err) {
      setError("Error de conexión al servidor");
      console.error("Error loading agencies:", err);
    } finally {
      setLoading(false);
    }
  };

  // Crear
  const handleCreate = async (nombre: string) => {
    try {
      setFormLoading(true);
      setError("");
      await agenciesApi.create(nombre);
      await loadAgencies();
      closeCreate();
    } catch (err) {
      setError("Error al crear la agencia");
      console.error("Error creating agency:", err);
    } finally {
      setFormLoading(false);
    }
  };

  // Actualizar
  const handleUpdate = async (nombre: string) => {
    if (!editingAgency) return;
    try {
      setFormLoading(true);
      setError("");
      await agenciesApi.update(editingAgency.id_agencias, nombre);
      await loadAgencies();
      closeEdit();
      setEditingAgency(null);
    } catch (err) {
      setError("Error al actualizar la agencia");
      console.error("Error updating agency:", err);
    } finally {
      setFormLoading(false);
    }
  };

  // Eliminar
  const handleDelete = async () => {
    if (!editingAgency) return;
    try {
      setFormLoading(true);
      setError("");
      await agenciesApi.delete(editingAgency.id_agencias);
      await loadAgencies();
      closeDelete();
      setEditingAgency(null);
    } catch (err) {
      setError("Error al eliminar la agencia");
      console.error("Error deleting agency:", err);
    } finally {
      setFormLoading(false);
    }
  };

  useEffect(() => {
    loadAgencies();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando agencias...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta title="Agencias | Magic Travel" description="Gestión de agencias" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Agencias
          </h1>
          <Button size="md" variant="primary" onClick={openCreate}>
            Nueva Agencia
          </Button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {error}
            <button onClick={() => setError("")} className="float-right">×</button>
          </div>
        )}

        {/* Lista */}
        <ComponentCard title="Lista de Agencias">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="p-4 font-medium">ID</th>
                  <th className="p-4 font-medium">Nombre</th>
                  <th className="p-4 font-medium">Tipo</th>
                  <th className="p-4 font-medium text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {agencies.map((agency) => (
                  <tr key={agency.id_agencias} className="border-t hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="p-4 text-sm text-gray-600">
                      {agency.id_agencias}
                    </td>
                    <td className="p-4">
                      <div className="font-medium">{agency.agencias_nombre}</div>
                    </td>
                    <td className="p-4">
                      <Badge
                        variant="light"
                        color={agency.agencias_nombre === "Magic Travel" ? "primary" : "info"}
                        size="sm"
                      >
                        {agency.agencias_nombre === "Magic Travel" ? "Principal" : "Externa"}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingAgency(agency);
                            openEdit();
                          }}
                        >
                          Editar
                        </Button>
                        {agency.agencias_nombre !== "Magic Travel" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingAgency(agency);
                              openDelete();
                            }}
                            className="text-red-600 border-red-300"
                          >
                            Eliminar
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {agencies.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No hay agencias registradas</p>
              </div>
            )}
          </div>
        </ComponentCard>
      </div>

      {/* Modal Crear */}
      <Modal isOpen={isCreateOpen} onClose={closeCreate}>
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Nueva Agencia</h2>
          <AgencyForm
            onSubmit={handleCreate}
            onCancel={closeCreate}
            loading={formLoading}
          />
        </div>
      </Modal>

      {/* Modal Editar */}
      <Modal isOpen={isEditOpen} onClose={closeEdit}>
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Editar Agencia</h2>
          {editingAgency && (
            <AgencyForm
              agency={editingAgency}
              onSubmit={handleUpdate}
              onCancel={() => {
                closeEdit();
                setEditingAgency(null);
              }}
              loading={formLoading}
            />
          )}
        </div>
      </Modal>

      {/* Modal Eliminar */}
      <Modal isOpen={isDeleteOpen} onClose={closeDelete}>
        <div className="p-6">
          <h2 className="text-xl font-bold text-red-600 mb-4">Eliminar Agencia</h2>
          {editingAgency && (
            <div>
              <p className="mb-4">
                ¿Estás seguro de eliminar "{editingAgency.agencias_nombre}"?
              </p>
              <div className="flex gap-3">
                <Button
                  size="md"
                  variant="outline"
                  onClick={handleDelete}
                  disabled={formLoading}
                  className="bg-red-600 text-white"
                >
                  {formLoading ? "Eliminando..." : "Eliminar"}
                </Button>
                <Button
                  size="md"
                  variant="outline"
                  onClick={() => {
                    closeDelete();
                    setEditingAgency(null);
                  }}
                  disabled={formLoading}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
