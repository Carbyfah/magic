"use client";
import { useEffect } from "react";
import flatpickr from "flatpickr";
import { Instance } from "flatpickr/dist/types/instance";
import "flatpickr/dist/flatpickr.css";

type PropsType = {
  id: string;
  mode?: "single" | "multiple" | "range" | "time";
  onChange?: (dates: Date[], currentDateString: string) => void;
  defaultDate?: string | Date;
  label?: string;
  placeholder?: string;
};

export default function DatePicker({
  id,
  mode = "single",
  onChange,
  label,
  defaultDate,
  placeholder = "Seleccionar fecha",
}: PropsType) {
  useEffect(() => {
    const flatPickrInstance: Instance | Instance[] = flatpickr(`#${id}`, {
      mode: mode as "single" | "multiple" | "range" | "time",
      static: true,
      monthSelectorType: "static",
      dateFormat: "Y-m-d",
      defaultDate: defaultDate,
      locale: {
        months: {
          shorthand: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
          longhand: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
        },
        weekdays: {
          shorthand: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
          longhand: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
        },
        firstDayOfWeek: 1,
      },
      onChange: (selectedDates: Date[], dateStr: string) => {
        if (onChange) {
          onChange(selectedDates, dateStr);
        }
      },
    });

    return () => {
      if (Array.isArray(flatPickrInstance)) {
        // Si es un array, destruir cada instancia
        flatPickrInstance.forEach(instance => {
          if (instance && typeof instance.destroy === 'function') {
            instance.destroy();
          }
        });
      } else {
        // Si es una sola instancia
        if (flatPickrInstance && typeof flatPickrInstance.destroy === 'function') {
          flatPickrInstance.destroy();
        }
      }
    };
  }, [mode, onChange, id, defaultDate]);

  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          placeholder={placeholder}
          readOnly
          className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 pr-12 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 bg-transparent text-gray-800 border-gray-300 focus:border-blue-300 focus:ring-blue-500/20 dark:border-gray-700 dark:focus:border-blue-600 cursor-pointer"
        />
        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
          </svg>
        </span>
      </div>
    </div>
  );
}
