import { useLocation } from "react-router";
import Button from "./Button";

export default function FloatingCreateButton() {
  const location = useLocation();

  // No mostrar el botón en páginas de autenticación
  if (location.pathname.includes('/signin') || location.pathname.includes('/signup')) {
    return null;
  }

  const handleCreate = () => {
    // Disparar evento directamente para que la página actual maneje la creación
    window.dispatchEvent(new CustomEvent('openCreateModal'));
  };

  return (
    <>
      {/* Botón Flotante */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="md"
          variant="primary"
          onClick={handleCreate}
          className="!w-14 !h-14 !rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group hover:scale-105"
        >
          <svg 
            className="w-7 h-7 text-white group-hover:rotate-90 transition-transform duration-200" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 5v14m-7-7h14" />
          </svg>
        </Button>
      </div>
    </>
  );
}