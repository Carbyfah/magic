"use client";
import { useState } from "react";
import ComponentCard from "../../common/ComponentCard";

interface ToggleSwitchProps {
  label: string;
  defaultChecked?: boolean;
  disabled?: boolean;
  color?: "blue" | "gray";
  onChange?: (checked: boolean) => void;
}

function ToggleSwitchComponent({
  label,
  defaultChecked = false,
  disabled = false,
  color = "blue",
  onChange
}: ToggleSwitchProps) {
  const [checked, setChecked] = useState(defaultChecked);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const newChecked = e.target.checked;
    setChecked(newChecked);
    onChange?.(newChecked);
  };

  const colorClasses = {
    blue: {
      checked: "bg-blue-600",
      unchecked: "bg-gray-200 dark:bg-gray-700",
      thumb: "bg-white"
    },
    gray: {
      checked: "bg-gray-600",
      unchecked: "bg-gray-200 dark:bg-gray-700",
      thumb: "bg-white"
    }
  };

  return (
    <div className="flex items-center gap-3">
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className="sr-only"
        />
        <div
          className={`w-11 h-6 rounded-full transition-colors duration-200 ease-in-out ${
            disabled
              ? "opacity-50 cursor-not-allowed bg-gray-200"
              : checked
              ? colorClasses[color].checked
              : colorClasses[color].unchecked
          }`}
        >
          <div
            className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out transform ${
              checked ? "translate-x-5" : "translate-x-0.5"
            } ${disabled ? "opacity-50" : ""} mt-0.5`}
          />
        </div>
      </label>
      <span className={`text-sm font-medium ${disabled ? "text-gray-400" : "text-gray-700 dark:text-gray-300"}`}>
        {label}
      </span>
    </div>
  );
}

export default function ToggleSwitch() {
  const handleSwitchChange = (checked: boolean) => {
    console.log("El switch está ahora:", checked ? "ENCENDIDO" : "APAGADO");
  };

  return (
    <ComponentCard title="Entrada de interruptor de alternancia">
      <div className="space-y-4">
        <div className="flex gap-4">
          <ToggleSwitchComponent
            label="Por Defecto"
            defaultChecked={false}
            onChange={handleSwitchChange}
          />
          <ToggleSwitchComponent
            label="Marcado"
            defaultChecked={true}
            onChange={handleSwitchChange}
          />
          <ToggleSwitchComponent
            label="Deshabilitado"
            disabled={true}
          />
        </div>

        <div className="flex gap-4">
          <ToggleSwitchComponent
            label="Por Defecto"
            defaultChecked={false}
            onChange={handleSwitchChange}
            color="gray"
          />
          <ToggleSwitchComponent
            label="Marcado"
            defaultChecked={true}
            onChange={handleSwitchChange}
            color="gray"
          />
          <ToggleSwitchComponent
            label="Deshabilitado"
            disabled={true}
            color="gray"
          />
        </div>
      </div>
    </ComponentCard>
  );
}
