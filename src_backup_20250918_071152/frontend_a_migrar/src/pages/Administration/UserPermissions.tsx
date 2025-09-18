import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import Switch from "../../components/form/switch/Switch";
import Button from "../../components/ui/button/Button";

interface UserPermissions {
  [modulo: string]: {
    ver: boolean;
    crear: boolean;
    editar: boolean;
    eliminar: boolean;
    exportar_excel: boolean;
    exportar_pdf: boolean;
  };
}

interface User {
  id: number;
  nombre: string;
  email: string;
  empleado: {
    agencia: string;
    cargo: string;
  } | null;
}

export default function UserPermissions() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<UserPermissions>({});
  const [modulosDisponibles, setModulosDisponibles] = useState<{[key: string]: string}>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchUserPermissions = async () => {
      try {
        const token = localStorage.getItem('auth_token') || localStorage.getItem('fah_token');

        // Obtener datos del usuario
        const userResponse = await fetch(`/api/permisos/usuario/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData.data.usuario);
          setPermissions(userData.data.permisos);

          // Obtener módulos disponibles
          const modulosResponse = await fetch('/api/permisos/usuarios', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (modulosResponse.ok) {
            const modulosData = await modulosResponse.json();
            setModulosDisponibles(modulosData.data.modulos_disponibles);
          }
        }
      } catch (error) {
        console.error('Error fetching permissions:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserPermissions();
    }
  }, [userId]);

  const handlePermissionChange = (modulo: string, accion: string, value: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [modulo]: {
        ...prev[modulo] || {
          ver: false,
          crear: false,
          editar: false,
          eliminar: false,
          exportar_excel: false,
          exportar_pdf: false,
        },
        [accion]: value
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('fah_token');
      const response = await fetch(`/api/permisos/usuario/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ permisos: permissions }),
      });

      if (response.ok) {
        // Regresar a la página de administración
        navigate('/administration');
      }
    } catch (error) {
      console.error('Error saving permissions:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/administration');
  };

  const permissionLabels = {
    ver: 'Ver',
    crear: 'Crear',
    editar: 'Editar',
    eliminar: 'Eliminar',
    exportar_excel: 'Excel',
    exportar_pdf: 'PDF'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando permisos...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Usuario no encontrado</div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title={`Permisos de ${user.nombre} | Magic Travel`}
        description={`Gestión de permisos para ${user.nombre}`}
      />
      <PageBreadcrumb pageTitle="Permisos de Usuario" />

      <div className="space-y-6">
        {/* Información del Usuario */}
        <ComponentCard title="Información del Usuario">
          <div className="flex items-center gap-4 p-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white text-xl font-bold">
              {user.nombre.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-xl font-bold text-black dark:text-white">
                {user.nombre}
              </h3>
              <p className="text-sm text-meta-6 mt-1">
                {user.email} • {user.empleado?.cargo} • {user.empleado?.agencia}
              </p>
            </div>
          </div>
        </ComponentCard>

        {/* Matriz de Permisos */}
        <ComponentCard title="Matriz de Permisos">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stroke dark:border-strokedark">
                  <th className="text-left py-4 px-4 font-medium text-black dark:text-white min-w-[200px]">
                    Módulo
                  </th>
                  {Object.entries(permissionLabels).map(([key, label]) => (
                    <th key={key} className="text-center py-4 px-3 font-medium text-black dark:text-white min-w-[80px]">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(modulosDisponibles).map(([modulo, nombreModulo]) => (
                  <tr key={modulo} className="border-b border-stroke dark:border-strokedark hover:bg-gray-1 dark:hover:bg-meta-4">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500 text-white text-sm font-medium">
                            {nombreModulo.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-medium text-black dark:text-white">
                            {nombreModulo}
                          </span>
                          <p className="text-xs text-meta-6">{modulo}</p>
                        </div>
                      </div>
                    </td>
                    {Object.keys(permissionLabels).map((accion) => (
                      <td key={accion} className="py-4 px-3 text-center">
                        <div className="flex justify-center">
                          <Switch
                            label=""
                            defaultChecked={permissions[modulo]?.[accion as keyof typeof permissions[typeof modulo]] || false}
                            onChange={(checked) => handlePermissionChange(modulo, accion, checked)}
                            color="blue"
                          />
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ComponentCard>

        {/* Acciones */}
        <ComponentCard title="Acciones">
          <div className="flex justify-between items-center p-4">
            <div className="text-sm text-meta-6">
              {Object.keys(modulosDisponibles).length} módulos disponibles
            </div>
            <div className="flex gap-3">
                <Button
                    variant="outline"
                    size="md"
                    onClick={handleCancel}
                    disabled={saving}
                >
                    Cancelar
                </Button>
                <Button
                    variant="primary"
                    size="md"
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? 'Guardando...' : 'Guardar Permisos'}
                </Button>
            </div>
          </div>
        </ComponentCard>
      </div>
    </>
  );
}
