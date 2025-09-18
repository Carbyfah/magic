interface Order {
  id: number;
  user: {
    image: string;
    name: string;
    role: string;
  };
  projectName: string;
  team: {
    images: string[];
  };
  status: string;
  budget: string;
}

// Definir los datos de la tabla usando la interfaz
const tableData: Order[] = [
  {
    id: 1,
    user: {
      image: "/images/user/user-17.jpg",
      name: "Ana García",
      role: "Agente de Ventas",
    },
    projectName: "Tour Volcán Pacaya",
    team: {
      images: [
        "/images/user/user-22.jpg",
        "/images/user/user-23.jpg",
        "/images/user/user-24.jpg",
      ],
    },
    budget: "Q.3,500",
    status: "Activo",
  },
  {
    id: 2,
    user: {
      image: "/images/user/user-18.jpg",
      name: "Carlos Morales",
      role: "Coordinador",
    },
    projectName: "Tikal Express",
    team: {
      images: ["/images/user/user-25.jpg", "/images/user/user-26.jpg"],
    },
    budget: "Q.8,500",
    status: "Pendiente",
  },
  {
    id: 3,
    user: {
      image: "/images/user/user-17.jpg",
      name: "María López",
      role: "Guía Turística",
    },
    projectName: "Antigua Colonial",
    team: {
      images: ["/images/user/user-27.jpg"],
    },
    budget: "Q.2,200",
    status: "Activo",
  },
  {
    id: 4,
    user: {
      image: "/images/user/user-20.jpg",
      name: "Roberto Chen",
      role: "Conductor",
    },
    projectName: "Lago Atitlán",
    team: {
      images: [
        "/images/user/user-28.jpg",
        "/images/user/user-29.jpg",
        "/images/user/user-30.jpg",
      ],
    },
    budget: "Q.1,800",
    status: "Cancelado",
  },
  {
    id: 5,
    user: {
      image: "/images/user/user-21.jpg",
      name: "Sofía Hernández",
      role: "Administradora",
    },
    projectName: "Semuc Champey",
    team: {
      images: [
        "/images/user/user-31.jpg",
        "/images/user/user-32.jpg",
        "/images/user/user-33.jpg",
      ],
    },
    budget: "Q.4,500",
    status: "Activo",
  },
];

function Badge({ children, color, size }: { children: React.ReactNode; color: string; size: string }) {
  const colorClasses = {
    success: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
    warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
    error: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
  };

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${colorClasses[color as keyof typeof colorClasses]}`}>
      {children}
    </span>
  );
}

export default function BasicTableOne() {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <table className="w-full">
          {/* Encabezado de Tabla */}
          <thead className="border-b border-gray-100 dark:border-white/[0.05]">
            <tr>
              <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                Usuario
              </th>
              <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                Nombre del Tour
              </th>
              <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                Equipo
              </th>
              <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                Estado
              </th>
              <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                Presupuesto
              </th>
            </tr>
          </thead>

          {/* Cuerpo de Tabla */}
          <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {tableData.map((order) => (
              <tr key={order.id}>
                <td className="px-5 py-4 sm:px-6 text-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 overflow-hidden rounded-full">
                      <img
                        width={40}
                        height={40}
                        src={order.user.image}
                        alt={order.user.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <span className="block font-medium text-gray-800 text-sm dark:text-white/90">
                        {order.user.name}
                      </span>
                      <span className="block text-gray-500 text-xs dark:text-gray-400">
                        {order.user.role}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                  {order.projectName}
                </td>
                <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                  <div className="flex -space-x-2">
                    {order.team.images.map((teamImage, index) => (
                      <div
                        key={index}
                        className="w-6 h-6 overflow-hidden border-2 border-white rounded-full dark:border-gray-900"
                      >
                        <img
                          width={24}
                          height={24}
                          src={teamImage}
                          alt={`Miembro del equipo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                  <Badge
                    size="sm"
                    color={
                      order.status === "Activo"
                        ? "success"
                        : order.status === "Pendiente"
                        ? "warning"
                        : "error"
                    }
                  >
                    {order.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-gray-500 text-sm dark:text-gray-400">
                  {order.budget}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
