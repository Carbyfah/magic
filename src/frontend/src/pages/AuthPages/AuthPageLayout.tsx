import React from "react";
import GridShape from "../../components/common/GridShape";
import { Link } from "react-router";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";

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
            <GridShape />
            <div className="flex flex-col items-center max-w-xs">
              <Link to="/" className="block mb-6">
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
              </Link>
              <p className="text-center text-blue-200 dark:text-blue-300 text-sm leading-relaxed mb-6">
                Sistema integral para la gestión de reservas, rutas turísticas y tours.
                Administra tu agencia de viajes de manera eficiente y profesional.
              </p>
              <div className="space-y-3 text-sm text-blue-300 dark:text-blue-400">
                <div className="flex items-center space-x-3">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  <span>Gestión de Reservas</span>
                </div>
                <div className="flex items-center space-x-3">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 9V5a3 3 0 0 0-6 0v4"/>
                    <rect x="2" y="9" width="20" height="11" rx="2" ry="2"/>
                  </svg>
                  <span>Control de Rutas</span>
                </div>
                <div className="flex items-center space-x-3">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9,22 9,12 15,12 15,22"/>
                  </svg>
                  <span>Administración de Tours</span>
                </div>
                <div className="flex items-center space-x-3">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 3v5h5"/>
                    <path d="M21 21v-5h-5"/>
                    <path d="M21 3a16 16 0 0 0-10 10"/>
                    <path d="M3 21a16 16 0 0 1 10-10"/>
                  </svg>
                  <span>Reportes y Analytics</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="fixed z-50 hidden bottom-6 right-6 sm:block">
          <ThemeTogglerTwo />
        </div>
      </div>
    </div>
  );
}
