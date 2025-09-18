"use client";
import { useState } from "react";
import ComponentCard from "../../common/ComponentCard";

export default function CheckboxComponents() {
  const [isChecked, setIsChecked] = useState(false);
  const [isCheckedTwo, setIsCheckedTwo] = useState(true);
  const [isCheckedDisabled, setIsCheckedDisabled] = useState(false);

  return (
    <ComponentCard title="Checkbox">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={(e) => setIsChecked(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <span className="block text-sm font-medium text-gray-700 dark:text-gray-400">
            Por Defecto
          </span>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={isCheckedTwo}
            onChange={(e) => setIsCheckedTwo(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <span className="block text-sm font-medium text-gray-700 dark:text-gray-400">
            Marcado
          </span>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={isCheckedDisabled}
            onChange={(e) => setIsCheckedDisabled(e.target.checked)}
            disabled
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <span className="block text-sm font-medium text-gray-500 dark:text-gray-500">
            Deshabilitado
          </span>
        </div>
      </div>
    </ComponentCard>
  );
}
