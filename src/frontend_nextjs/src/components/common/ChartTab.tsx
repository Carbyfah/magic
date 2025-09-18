"use client";
import { useState } from "react";

type TabOption = "optionOne" | "optionTwo" | "optionThree";

const ChartTab: React.FC = () => {
  const [selected, setSelected] = useState<TabOption>("optionOne");

  const getButtonClass = (option: TabOption): string =>
    selected === option
      ? "shadow-theme-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800"
      : "text-gray-500 dark:text-gray-400";

  return (
    <div className="flex items-center gap-0.5 rounded-lg bg-gray-100 p-0.5 dark:bg-gray-900">
      <button
        onClick={() => setSelected("optionOne")}
        className={`px-3 py-2 font-medium w-full rounded-md text-sm hover:text-gray-900 dark:hover:text-white transition-colors ${getButtonClass(
          "optionOne"
        )}`}
      >
        Mensual
      </button>

      <button
        onClick={() => setSelected("optionTwo")}
        className={`px-3 py-2 font-medium w-full rounded-md text-sm hover:text-gray-900 dark:hover:text-white transition-colors ${getButtonClass(
          "optionTwo"
        )}`}
      >
        Trimestral
      </button>

      <button
        onClick={() => setSelected("optionThree")}
        className={`px-3 py-2 font-medium w-full rounded-md text-sm hover:text-gray-900 dark:hover:text-white transition-colors ${getButtonClass(
          "optionThree"
        )}`}
      >
        Anual
      </button>
    </div>
  );
};

export default ChartTab;
