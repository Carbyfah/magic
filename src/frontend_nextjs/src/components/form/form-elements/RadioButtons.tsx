"use client";
import { useState } from "react";
import ComponentCard from "../../common/ComponentCard";

export default function RadioButtons() {
  const [selectedValue, setSelectedValue] = useState<string>("option2");

  const handleRadioChange = (value: string) => {
    setSelectedValue(value);
  };

  return (
    <ComponentCard title="Botones de Radio">
      <div className="flex flex-wrap items-center gap-8">
        <div className="flex items-center gap-3">
          <input
            type="radio"
            id="radio1"
            name="group1"
            value="option1"
            checked={selectedValue === "option1"}
            onChange={(e) => handleRadioChange(e.target.value)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <label htmlFor="radio1" className="text-sm font-medium text-gray-700 dark:text-gray-400">
            Por Defecto
          </label>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="radio"
            id="radio2"
            name="group1"
            value="option2"
            checked={selectedValue === "option2"}
            onChange={(e) => handleRadioChange(e.target.value)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <label htmlFor="radio2" className="text-sm font-medium text-gray-700 dark:text-gray-400">
            Seleccionado
          </label>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="radio"
            id="radio3"
            name="group1"
            value="option3"
            checked={selectedValue === "option3"}
            onChange={(e) => handleRadioChange(e.target.value)}
            disabled={true}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <label htmlFor="radio3" className="text-sm font-medium text-gray-500 dark:text-gray-500">
            Deshabilitado
          </label>
        </div>
      </div>
    </ComponentCard>
  );
}
