"use client";
import { useState } from "react";
import ComponentCard from "../../common/ComponentCard";

export default function InputStates() {
  const [email, setEmail] = useState("");
  const [emailTwo, setEmailTwo] = useState("");
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  // Simular una verificación de validación
  const validateEmail = (value: string) => {
    const isValidEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
    return isValidEmail;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (value) {
      setError(!validateEmail(value));
    } else {
      setError(false);
    }
  };

  const handleEmailTwoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmailTwo(value);
    if (value) {
      setSuccess(validateEmail(value));
    } else {
      setSuccess(false);
    }
  };

  return (
    <ComponentCard
      title="Estados de Entrada"
      desc="Estilos de validación para estados de error, éxito y deshabilitado en controles de formulario."
    >
      <div className="space-y-5 sm:space-y-6">
        {/* Input con Error */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="Ingresa tu email"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none dark:bg-gray-800 dark:text-white ${
              error
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600"
            }`}
          />
          {error && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              Esta es una dirección de email inválida.
            </p>
          )}
        </div>

        {/* Input con Éxito */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email
          </label>
          <input
            type="email"
            value={emailTwo}
            onChange={handleEmailTwoChange}
            placeholder="Ingresa tu email"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none dark:bg-gray-800 dark:text-white ${
              success
                ? "border-green-500 focus:ring-green-500 focus:border-green-500"
                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600"
            }`}
          />
          {success && (
            <p className="mt-1 text-sm text-green-600 dark:text-green-400">
              Este es un mensaje de éxito.
            </p>
          )}
        </div>

        {/* Input Deshabilitado */}
        <div>
          <label className="block text-sm font-medium text-gray-500 dark:text-gray-500 mb-2">
            Email
          </label>
          <input
            type="text"
            value="disabled@example.com"
            disabled={true}
            placeholder="Email deshabilitado"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400"
          />
        </div>
      </div>
    </ComponentCard>
  );
}
