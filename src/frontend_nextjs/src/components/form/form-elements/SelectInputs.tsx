"use client";
import { useState } from "react";
import ComponentCard from "../../common/ComponentCard";

export default function SelectInputs() {
  const [selectedValue, setSelectedValue] = useState("");
  const [selectedMultipleValues, setSelectedMultipleValues] = useState<string[]>(["1", "3"]);

  const options = [
    { value: "marketing", label: "Marketing" },
    { value: "template", label: "Template" },
    { value: "development", label: "Desarrollo" },
  ];

  const multiOptions = [
    { value: "1", text: "Opción 1" },
    { value: "2", text: "Opción 2" },
    { value: "3", text: "Opción 3" },
    { value: "4", text: "Opción 4" },
    { value: "5", text: "Opción 5" },
  ];

  const handleSelectChange = (value: string) => {
    setSelectedValue(value);
    console.log("Valor seleccionado:", value);
  };

  const handleMultiSelectChange = (value: string) => {
    setSelectedMultipleValues(prev => {
      if (prev.includes(value)) {
        return prev.filter(v => v !== value);
      } else {
        return [...prev, value];
      }
    });
  };

  return (
    <ComponentCard title="Entradas Select">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Entrada Select
          </label>
          <select
            value={selectedValue}
            onChange={(e) => handleSelectChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            <option value="">Seleccionar Opción</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Opciones de Selección Múltiple
          </label>
          <div className="space-y-2">
            {multiOptions.map((option) => (
              <div key={option.value} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id={`multi-${option.value}`}
                  checked={selectedMultipleValues.includes(option.value)}
                  onChange={() => handleMultiSelectChange(option.value)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label
                  htmlFor={`multi-${option.value}`}
                  className="text-sm font-medium text-gray-700 dark:text-gray-400 cursor-pointer"
                >
                  {option.text}
                </label>
              </div>
            ))}
          </div>
          {selectedMultipleValues.length > 0 && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Valores seleccionados: {selectedMultipleValues.join(", ")}
            </p>
          )}
        </div>
      </div>
    </ComponentCard>
  );
}
