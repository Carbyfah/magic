"use client";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  GroupIcon,
  BoxIconLine,
} from "../../icons";

export default function EcommerceMetrics() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* Elemento de métrica - Inicio */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 w-6 h-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Clientes
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-2xl dark:text-white/90">
              3,782
            </h4>
          </div>
          <div className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full dark:bg-green-900/20 dark:text-green-400">
            <ArrowUpIcon className="w-3 h-3" />
            11.01%
          </div>
        </div>
      </div>
      {/* Elemento de métrica - Fin */}

      {/* Elemento de métrica - Inicio */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 w-6 h-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Pedidos
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-2xl dark:text-white/90">
              5,359
            </h4>
          </div>
          <div className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full dark:bg-red-900/20 dark:text-red-400">
            <ArrowDownIcon className="w-3 h-3" />
            9.05%
          </div>
        </div>
      </div>
      {/* Elemento de métrica - Fin */}
    </div>
  );
}
