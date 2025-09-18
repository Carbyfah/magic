"use client";
import { useState } from "react";
import ComponentCard from "../../common/ComponentCard";

export default function InputGroup() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedCountryStart, setSelectedCountryStart] = useState("+1");
  const [selectedCountryEnd, setSelectedCountryEnd] = useState("+1");

  const countries = [
    { code: "US", label: "+1" },
    { code: "GB", label: "+44" },
    { code: "CA", label: "+1" },
    { code: "AU", label: "+61" },
  ];

  const handlePhoneNumberChange = (phoneNumber: string) => {
    setPhoneNumber(phoneNumber);
    console.log("Número de teléfono actualizado:", phoneNumber);
  };

  return (
    <ComponentCard title="Grupo de Entradas">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email
          </label>
          <div className="relative">
            <input
              placeholder="info@gmail.com"
              type="email"
              className="w-full pl-16 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
            <span className="absolute left-0 top-1/2 -translate-y-1/2 border-r border-gray-200 px-3.5 py-3 text-gray-500 dark:border-gray-800 dark:text-gray-400">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Teléfono (Selector al inicio)
          </label>
          <div className="relative flex">
            <select
              value={selectedCountryStart}
              onChange={(e) => setSelectedCountryStart(e.target.value)}
              className="border border-gray-300 rounded-l-lg bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {countries.map((country) => (
                <option key={country.code} value={country.label}>
                  {country.label}
                </option>
              ))}
            </select>
            <input
              type="tel"
              placeholder="(555) 000-0000"
              onChange={(e) => handlePhoneNumberChange(e.target.value)}
              className="flex-1 border border-l-0 border-gray-300 rounded-r-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Teléfono (Selector al final)
          </label>
          <div className="relative flex">
            <input
              type="tel"
              placeholder="(555) 000-0000"
              onChange={(e) => handlePhoneNumberChange(e.target.value)}
              className="flex-1 border border-r-0 border-gray-300 rounded-l-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
            <select
              value={selectedCountryEnd}
              onChange={(e) => setSelectedCountryEnd(e.target.value)}
              className="border border-gray-300 rounded-r-lg bg-gray-50 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {countries.map((country) => (
                <option key={country.code} value={country.label}>
                  {country.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </ComponentCard>
  );
}
