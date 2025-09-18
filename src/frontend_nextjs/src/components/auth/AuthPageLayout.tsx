"use client";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0">
        {children}
        <div className="items-center hidden w-full h-full lg:w-1/2 bg-blue-900 dark:bg-blue-950 lg:grid">
          <div className="relative flex items-center justify-center z-1">
            <div className="flex flex-col items-center max-w-xs">
              <div className="block mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">Magic Travel</h1>
                    <p className="text-sm text-blue-200">Sistema de Gestión</p>
                  </div>
                </div>
              </div>
              <p className="text-center text-blue-200 dark:text-blue-300 text-sm leading-relaxed mb-6">
                Sistema integral para la gestión de reservas, rutas turísticas y tours.
                Administra tu agencia de viajes de manera eficiente y profesional.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
