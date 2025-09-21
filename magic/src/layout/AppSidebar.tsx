import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { Link, useLocation } from "react-router";

// Iconos de Magic Travel
import {
  BoxCubeIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  PieChartIcon,
  PlugInIcon,
  UserCircleIcon,
  DollarLineIcon,
  TaskIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import { usePermisos } from "../hooks/usePermisos";
import SidebarWidget from "./SidebarWidget";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { 
    name: string; 
    path: string; 
    pro?: boolean; 
    new?: boolean;
    modulo?: string;
  }[];
};

// MÓDULOS PRINCIPALES DE MAGIC TRAVEL
const modulosPrincipales: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/",
  },
  {
    icon: <UserCircleIcon />,
    name: "Administración",
    subItems: [
      { name: "Agencias", path: "/agencias", pro: false, modulo: "agencias" },
      { name: "Empleados", path: "/empleados", pro: false, modulo: "empleados" },
      { name: "Usuarios y Permisos", path: "/usuarios", pro: false, modulo: "empleados" },
    ],
  },
  {
    icon: <BoxCubeIcon />,
    name: "Catálogos",
    subItems: [
      { name: "Servicios", path: "/servicios", pro: false, modulo: "servicios" },
      { name: "Rutas", path: "/rutas", pro: false, modulo: "rutas" },
      { name: "Tours", path: "/tours", pro: false, modulo: "tours" },
      { name: "Vehículos", path: "/vehiculos", pro: false, modulo: "vehiculos" },
      { name: "Estados", path: "/estados", pro: false, modulo: "estados" },
      { name: "Cargos", path: "/cargos", pro: false, modulo: "cargos" },
    ],
  },
  {
    name: "Operaciones",
    icon: <TaskIcon />,
    subItems: [
      { name: "Reservas", path: "/reservas", pro: false, modulo: "reservas" },
      { name: "Rutas Activas", path: "/rutas-activas", pro: false, modulo: "rutas" },
      { name: "Tours Activos", path: "/tours-activos", pro: false, modulo: "tours" },
    ],
  },
];

// MÓDULOS FINANCIEROS
const modulosFinancieros: NavItem[] = [
  {
    icon: <DollarLineIcon />,
    name: "Financiero",
    subItems: [
      { name: "Caja", path: "/caja", pro: false, modulo: "caja" },
      { name: "Ventas", path: "/ventas", pro: false, modulo: "ventas" },
      { name: "Contabilidad", path: "/contabilidad", pro: false, modulo: "contabilidad" },
      { name: "Egresos", path: "/egresos", pro: false, modulo: "egresos" },
      { name: "Facturas SAT", path: "/facturas", pro: false, modulo: "facturas" },
    ],
  },
  {
    icon: <PieChartIcon />,
    name: "Reportes",
    subItems: [
      { name: "Dashboard Ejecutivo", path: "/dashboard/metricas", pro: false, modulo: "contabilidad" },
      { name: "Auditoría", path: "/auditoria", pro: false, modulo: "contabilidad" },
      { name: "Notificaciones", path: "/notificaciones", pro: false, modulo: "contabilidad" },
    ],
  },
  {
    icon: <PlugInIcon />,
    name: "Sistema",
    subItems: [
      { name: "Utilidades", path: "/utils", pro: false, modulo: "contabilidad" },
      { name: "Configuración", path: "/configuracion", pro: false, modulo: "empleados" },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { puedeVer, tienePermisos } = usePermisos();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  // Memoizar el filtrado de elementos para evitar recálculos innecesarios
  const modulosFiltrados = useMemo(() => {
    const filtrarElementos = (items: NavItem[]) => {
      if (!tienePermisos) return items;

      return items.map(item => {
        if (item.subItems) {
          const subItemsFiltrados = item.subItems.filter(subItem => {
            if (!subItem.modulo) return true;
            return puedeVer(subItem.modulo);
          });

          // Solo mostrar el dropdown si tiene al menos un subItem visible
          if (subItemsFiltrados.length > 0) {
            return {
              ...item,
              subItems: subItemsFiltrados
            };
          }
          return null;
        }
        return item;
      }).filter(Boolean) as NavItem[];
    };

    return {
      principales: filtrarElementos(modulosPrincipales),
      financieros: filtrarElementos(modulosFinancieros)
    };
  }, [puedeVer, tienePermisos]);

  // Detectar si el submenu actual está activo
  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? modulosFiltrados.principales : modulosFiltrados.financieros;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location.pathname, isActive]); // eslint-disable-line react-hooks/exhaustive-deps

  // Calcular altura del submenu cuando se abre
  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      const element = subMenuRefs.current[key];
      
      if (element) {
        // Usar setTimeout para asegurar que el DOM se ha actualizado
        setTimeout(() => {
          const height = element.scrollHeight;
          setSubMenuHeight((prevHeights) => ({
            ...prevHeights,
            [key]: height,
          }));
        }, 0);
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={`menu-item-icon-size  ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            nuevo
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden"
                src="/images/logo/logo.svg"
                alt="Magic Travel"
                width={150}
                height={40}
              />
              <img
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="Magic Travel"
                width={150}
                height={40}
              />
            </>
          ) : (
            <img
              src="/images/logo/logo-icon.svg"
              alt="Magic Travel"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            {/* Sección Principal - Solo mostrar si tiene elementos visibles */}
            {modulosFiltrados.principales.length > 0 && (
              <div>
                <h2
                  className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                    !isExpanded && !isHovered
                      ? "lg:justify-center"
                      : "justify-start"
                  }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? (
                    "Principal"
                  ) : (
                    <HorizontaLDots className="size-6" />
                  )}
                </h2>
                {renderMenuItems(modulosFiltrados.principales, "main")}
              </div>
            )}

            {/* Sección Financiero - Solo mostrar si tiene elementos visibles */}
            {modulosFiltrados.financieros.length > 0 && (
              <div>
                <h2
                  className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                    !isExpanded && !isHovered
                      ? "lg:justify-center"
                      : "justify-start"
                  }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? (
                    "Financiero"
                  ) : (
                    <HorizontaLDots />
                  )}
                </h2>
                {renderMenuItems(modulosFiltrados.financieros, "others")}
              </div>
            )}
          </div>
        </nav>
        {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
      </div>
    </aside>
  );
};

export default AppSidebar;