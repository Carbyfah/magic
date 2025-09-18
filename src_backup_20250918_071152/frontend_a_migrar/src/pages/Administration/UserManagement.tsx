import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";

interface User {
  id: number;
  nombre: string;
  email: string;
  empleado: {
    agencia: string;
    cargo: string;
  } | null;
  permisos_configurados: boolean;
  total_permisos: number;
}

interface ModulosDisponibles {
  [key: string]: string;
}

export default function UserManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [modulosDisponibles, setModulosDisponibles] = useState<ModulosDisponibles>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('fah_token');
      console.log('Token usado:', token);
      console.log('Token length:', token?.length);

      if (!token) {
        console.error('No hay token válido');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/permisos/usuarios', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response URL:', response.url);
      console.log('Response redirected:', response.redirected);

      if (response.ok) {
        const data = await response.json();
        setUsers(data.data.usuarios);
        setModulosDisponibles(data.data.modulos_disponibles);
      } else {
        console.error('Response not OK:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManagePermissions = (user: User) => {
    // Navegar a la página de permisos
    navigate(`/administration/permissions/${user.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-black dark:text-white">Cargando usuarios...</div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="Gestión de Usuarios | Magic Travel"
        description="Administración de usuarios y permisos del sistema"
      />
      <PageBreadcrumb pageTitle="Administración" />

      <div className="space-y-6">
        <ComponentCard title="Gestión de Usuarios">
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-2 text-left dark:bg-meta-4">
                  <th className="min-w-[220px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                    Usuario
                  </th>
                  <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                    Agencia
                  </th>
                  <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                    Cargo
                  </th>
                  <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                    Permisos
                  </th>
                  <th className="py-4 px-4 font-medium text-black dark:text-white">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white font-semibold shadow-lg">
                          {user.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h5 className="font-medium text-black dark:text-white">
                            {user.nombre}
                          </h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                      <p className="text-black dark:text-white">
                        {user.empleado?.agencia || 'N/A'}
                      </p>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                      <p className="text-black dark:text-white">
                        {user.empleado?.cargo || 'N/A'}
                      </p>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                      <p className={`inline-flex rounded-full bg-opacity-10 py-1 px-3 text-sm font-medium ${
                        user.permisos_configurados
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {user.permisos_configurados
                          ? `${user.total_permisos} módulos`
                          : 'Sin configurar'
                        }
                      </p>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleManagePermissions(user)}
                      >
                        Gestionar Permisos
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ComponentCard>

{/* Información del Sistema */}
<ComponentCard title="Información del Sistema">
  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
    <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-black dark:text-black-200">Total Usuarios</span>
        <span className="text-2xl font-bold text-black-900 dark:text-green-400">
          {users.length}
        </span>
      </div>
    </div>
    <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-black dark:text-black-200">Módulos Detectados</span>
        <span className="text-2xl font-bold text-black-900 dark:text-green-400">
          {Object.keys(modulosDisponibles).length}
        </span>
      </div>
    </div>
    <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-black dark:text-black-200">Con Permisos</span>
        <span className="text-2xl font-bold text-black-900 dark:text-green-400">
          {users.filter(u => u.permisos_configurados).length}
        </span>
      </div>
    </div>
  </div>
</ComponentCard>
      </div>
    </>
  );
}
