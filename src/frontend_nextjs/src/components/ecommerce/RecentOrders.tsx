"use client";

// Definir la interfaz TypeScript para las filas de la tabla
interface Product {
  id: number; // Identificador único para cada producto
  name: string; // Nombre del producto
  variants: string; // Número de variantes (ej. "1 Variante", "2 Variantes")
  category: string; // Categoría del producto
  price: string; // Precio del producto (como string con símbolo de moneda)
  image: string; // URL o ruta de la imagen del producto
  status: "Entregado" | "Pendiente" | "Cancelado"; // Estado del producto
}

// Definir los datos de la tabla usando la interfaz
const tableData: Product[] = [
  {
    id: 1,
    name: "MacBook Pro 13\"", // Corregido: usar comillas dobles normales
    variants: "2 Variantes",
    category: "Laptop",
    price: "$2399.00",
    status: "Entregado",
    image: "/images/product/product-01.jpg",
  },
  {
    id: 2,
    name: "Apple Watch Ultra",
    variants: "1 Variante",
    category: "Reloj",
    price: "$879.00",
    status: "Pendiente",
    image: "/images/product/product-02.jpg",
  },
  {
    id: 3,
    name: "iPhone 15 Pro Max",
    variants: "2 Variantes",
    category: "Smartphone",
    price: "$1869.00",
    status: "Entregado",
    image: "/images/product/product-03.jpg",
  },
  {
    id: 4,
    name: "iPad Pro 3rd Gen",
    variants: "2 Variantes",
    category: "Electrónicos",
    price: "$1699.00",
    status: "Cancelado",
    image: "/images/product/product-04.jpg",
  },
  {
    id: 5,
    name: "AirPods Pro 2nd Gen",
    variants: "1 Variante",
    category: "Accesorios",
    price: "$240.00",
    status: "Entregado",
    image: "/images/product/product-05.jpg",
  },
];

export default function RecentOrders() {
  const getStatusBadge = (status: Product['status']) => {
    const baseClasses = "inline-flex items-center px-2 py-1 text-xs font-medium rounded-full";

    switch (status) {
      case "Entregado":
        return `${baseClasses} text-green-700 bg-green-100 dark:bg-green-900/20 dark:text-green-400`;
      case "Pendiente":
        return `${baseClasses} text-yellow-700 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400`;
      case "Cancelado":
        return `${baseClasses} text-red-700 bg-red-100 dark:bg-red-900/20 dark:text-red-400`;
      default:
        return `${baseClasses} text-gray-700 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400`;
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Pedidos Recientes
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
            <svg
              className="stroke-current fill-white dark:fill-gray-800"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2.29004 5.90393H17.7067"
                stroke=""
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M17.7075 14.0961H2.29085"
                stroke=""
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12.0826 3.33331C13.5024 3.33331 14.6534 4.48431 14.6534 5.90414C14.6534 7.32398 13.5024 8.47498 12.0826 8.47498C10.6627 8.47498 9.51172 7.32398 9.51172 5.90415C9.51172 4.48432 10.6627 3.33331 12.0826 3.33331Z"
                fill=""
                stroke=""
                strokeWidth="1.5"
              />
              <path
                d="M7.91745 11.525C6.49762 11.525 5.34662 12.676 5.34662 14.0959C5.34661 15.5157 6.49762 16.6667 7.91745 16.6667C9.33728 16.6667 10.4883 15.5157 10.4883 14.0959C10.4883 12.676 9.33728 11.525 7.91745 11.525Z"
                fill=""
                stroke=""
                strokeWidth="1.5"
              />
            </svg>
            Filtrar
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
            Ver todo
          </button>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-gray-100 dark:border-gray-800 border-y">
            <tr>
              <th className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                Productos
              </th>
              <th className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                Categoría
              </th>
              <th className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                Precio
              </th>
              <th className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                Estado
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {tableData.map((product) => (
              <tr key={product.id}>
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-[50px] w-[50px] overflow-hidden rounded-md">
                      <img
                        src={product.image}
                        className="h-[50px] w-[50px] object-cover"
                        alt={product.name}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm dark:text-white/90">
                        {product.name}
                      </p>
                      <span className="text-gray-500 text-xs dark:text-gray-400">
                        {product.variants}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="py-3 text-gray-500 text-sm dark:text-gray-400">
                  {product.category}
                </td>
                <td className="py-3 text-gray-500 text-sm dark:text-gray-400">
                  {product.price}
                </td>
                <td className="py-3 text-gray-500 text-sm dark:text-gray-400">
                  <span className={getStatusBadge(product.status)}>
                    {product.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
