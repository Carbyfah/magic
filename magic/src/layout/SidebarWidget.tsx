import { useState } from "react";
import { useNavigate } from "react-router";
import { createPortal } from "react-dom";
import { LockIcon } from "../icons";
import { Modal } from "../components/ui/modal";

export default function SidebarWidget() {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    setShowLogoutModal(false);
    try {
      // Llamar API de logout (opcional)
      const token = localStorage.getItem('auth_token');
      await fetch('http://localhost:8080/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      // Limpiar localStorage SIEMPRE
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      
      // Redireccionar al login
      navigate('/signin');
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  return (
    <>
      <div
        className={`
          mx-auto mb-10 w-full max-w-60 rounded-2xl bg-gray-50 px-4 py-5 text-center dark:bg-white/[0.03]`}
      >
        <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
          Magic Travel
        </h3>
        <p className="mb-4 text-gray-500 text-theme-sm dark:text-gray-400">
          Sistema de Gestión de Servicios Turísticos
        </p>
        <button
          onClick={handleLogoutClick}
          className="flex items-center justify-center gap-2 p-3 font-medium text-white rounded-lg bg-red-500 text-theme-sm hover:bg-red-600 w-full transition-colors"
        >
          <LockIcon className="w-4 h-4" />
          Cerrar Sesión
        </button>
      </div>

      {/* Modal de Confirmación de Logout - Usando Portal para renderizar fuera del sidebar */}
      {showLogoutModal && createPortal(
        <Modal
          isOpen={showLogoutModal}
          onClose={handleLogoutCancel}
          className="max-w-md mx-4"
        >
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20">
                <svg
                  className="w-6 h-6 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Confirmar Cierre de Sesión
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Esta acción cerrará tu sesión actual
                </p>
              </div>
            </div>
            
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              ¿Estás seguro que deseas cerrar sesión? Tendrás que volver a iniciar sesión para acceder al sistema.
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleLogoutCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </Modal>,
        document.body
      )}
    </>
  );
}