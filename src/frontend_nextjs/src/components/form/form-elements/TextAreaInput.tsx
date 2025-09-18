"use client";
import { useState } from "react";
import ComponentCard from "../../common/ComponentCard";

export default function TextAreaInput() {
  const [message, setMessage] = useState("");
  const [messageTwo, setMessageTwo] = useState("");

  return (
    <ComponentCard title="Campo de entrada Textarea">
      <div className="space-y-6">
        {/* TextArea por defecto */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Descripción
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Escribe tu descripción aquí..."
          />
        </div>

        {/* TextArea deshabilitado */}
        <div>
          <label className="block text-sm font-medium text-gray-500 dark:text-gray-500 mb-2">
            Descripción
          </label>
          <textarea
            rows={6}
            disabled
            value="Este campo está deshabilitado"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed resize-vertical dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400"
          />
        </div>

        {/* TextArea con error */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Descripción
          </label>
          <textarea
            rows={6}
            value={messageTwo}
            onChange={(e) => setMessageTwo(e.target.value)}
            className="w-full px-3 py-2 border border-red-500 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-vertical dark:bg-gray-800 dark:border-red-500 dark:text-white dark:focus:ring-red-500 dark:focus:border-red-500"
            placeholder="Escribe tu descripción aquí..."
          />
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            Por favor ingresa un mensaje válido.
          </p>
        </div>
      </div>
    </ComponentCard>
  );
}
