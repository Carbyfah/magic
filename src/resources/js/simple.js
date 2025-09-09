// src/resources/js/simple.js
import './bootstrap';
import React from 'react';
import { createRoot } from 'react-dom/client';
import '../css/app.css';

// IMPORTAR SISTEMA DE AUTENTICACIÓN
import AuthService from './services/auth';
import Login from './components/Login';

// IMPORTAR NOTIFICATIONS PARA IZITOAST
import Notifications from './utils/notifications';

// Importar componentes de layouts
import TopBar from './components/layouts/TopBar';
import Sidebar from './components/layouts/Sidebar';
import Dashboard from './components/layouts/Dashboard';

// Importar TODOS los componentes existentes según la estructura del árbol
// Catálogos
import GestionEstados from './components/catalogos/estados-sistema/GestionEstados';
import GestionRutasServicios from './components/catalogos/rutas-servicios/GestionRutasServicios';
import GestionTipoPersona from './components/catalogos/tipos-persona/GestionTipoPersona';

// Comerciales
import GestionAgencias from './components/comercial/agencias/GestionAgencias';
import GestionContactoAgencias from './components/comercial/contactos-agencia/GestionContactoAgencias';
import GestionVentas from './components/comercial/dashboard-ventas/GestionVentas';

// Operación
import GestionVehiculos from './components/operacion/control-flota/GestionVehiculos';
import GestionReservas from './components/operacion/reservaciones/GestionReservas';
import GestionRutasActivas from './components/operacion/rutas-activas/GestionRutasActivas';

// Personal
import GestionEmpleados from './components/personal/empleados/GestionEmpleados';
import GestionRoles from './components/personal/roles-permisos/GestionRoles';
import GestionUsuarios from './components/personal/usuarios-sistema/GestionUsuarios';

// Reportes
import GestionAuditorias from './components/reportes/auditoria/GestionAuditorias';
import GestionEstadisticas from './components/reportes/estadisticas/GestionEstadisticas';

// Importar iconos
import Icons from './utils/Icons';

const { createElement: e, useState, useEffect } = React;

// VARIABLE GLOBAL PARA EVITAR DOBLE CREATEROOT
let appRoot = null;

// FUNCIÓN PARA VERIFICAR IZITOAST
function checkiziToast() {
    const available = typeof window.iziToast !== 'undefined';
    console.log('📋 iziToast disponible:', available);
    if (!available) {
        console.warn('⚠️ iziToast no está cargado. Verifica app.blade.php');
    }
    return available;
}

// Componente profesional para headers de módulos
function ModuleHeader({ title, description, icon, status = 'En desarrollo' }) {
    return e('div', {
        style: {
            padding: '3rem 2rem',
            textAlign: 'center',
            backgroundColor: 'white',
            borderRadius: '16px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            margin: '2rem',
            maxWidth: '800px',
            marginLeft: 'auto',
            marginRight: 'auto'
        }
    }, [
        // Icono principal
        e('div', {
            key: 'icon-container',
            style: {
                width: '80px',
                height: '80px',
                borderRadius: '20px',
                backgroundColor: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 2rem auto',
                border: '2px solid #e2e8f0'
            }
        }, icon),

        // Título
        e('h1', {
            key: 'title',
            style: {
                fontSize: '2.25rem',
                fontWeight: '700',
                color: '#111827',
                margin: '0 0 1rem 0',
                lineHeight: '1.2'
            }
        }, title),

        // Descripción
        e('p', {
            key: 'description',
            style: {
                fontSize: '1.125rem',
                color: '#6b7280',
                margin: '0 0 2rem 0',
                lineHeight: '1.6',
                maxWidth: '500px',
                marginLeft: 'auto',
                marginRight: 'auto'
            }
        }, description),

        // Badge de estado y botón de prueba
        e('div', {
            key: 'status-section',
            style: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem'
            }
        }, [
            // Badge de estado
            e('div', {
                key: 'status-badge',
                style: {
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    borderRadius: '9999px',
                    backgroundColor: status === 'Disponible' ? '#dcfce7' : '#fef3c7',
                    color: status === 'Disponible' ? '#166534' : '#92400e',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                }
            }, [
                e('span', { key: 'status-icon' }, status === 'Disponible' ? Icons.checkCircle('#166534') : Icons.clock('#92400e')),
                e('span', { key: 'status-text' }, status)
            ]),

            // BOTÓN DE PRUEBA IZITOAST
            e('button', {
                key: 'test-notifications',
                onClick: () => {
                    console.log('🧪 Iniciando prueba de notificaciones...');

                    // Verificar iziToast
                    if (checkiziToast()) {
                        // Probar todas las notificaciones
                        setTimeout(() => Notifications.success('iziToast funciona perfectamente', 'Sistema Listo'), 100);
                        setTimeout(() => Notifications.info('Información mostrada correctamente', 'Info'), 1500);
                        setTimeout(() => Notifications.warning('Advertencia mostrada correctamente', 'Warning'), 3000);
                        setTimeout(() => Notifications.magicTravel('Magic Travel está listo para usar', 'Sistema Listo'), 4500);
                    } else {
                        alert('❌ iziToast no está disponible. Verifica la configuración.');
                    }
                },
                style: {
                    padding: '10px 20px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                },
                onMouseEnter: (e) => {
                    e.currentTarget.style.backgroundColor = '#2563eb';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                },
                onMouseLeave: (e) => {
                    e.currentTarget.style.backgroundColor = '#3b82f6';
                    e.currentTarget.style.transform = 'translateY(0)';
                }
            }, 'Probar Notificaciones iziToast')
        ])
    ]);
}

// Module Content Component - CONECTADO A TODOS LOS COMPONENTES REALES
function ModuleContent({ module, onNavigate }) {
    switch (module) {
        // DASHBOARD - AHORA CON NAVEGACIÓN
        case 'dashboard':
            return e(Dashboard, { key: 'dashboard-component', onNavigate });

        // OPERACIÓN DIARIA
        case 'reservaciones':
        case 'reservas':
            return e(GestionReservas, { key: 'gestion-reservas-component' });

        case 'rutas-activas':
        case 'rutas-dia':
            return e(GestionRutasActivas, { key: 'gestion-rutas-activas-component' });

        case 'control-flota':
        case 'vehiculos':
            return e(GestionVehiculos, { key: 'gestion-vehiculos-component' });

        // COMERCIAL
        case 'agencias':
            return e(GestionAgencias, { key: 'gestion-agencias-component' });

        case 'contactos-agencia':
            return e(GestionContactoAgencias, { key: 'gestion-contactos-agencia-component' });

        case 'dashboard-ventas':
        case 'ventas':
            return e(GestionVentas, { key: 'gestion-ventas-component' });

        // CATÁLOGOS BASE
        case 'rutas-servicios':
            return e(GestionRutasServicios, { key: 'gestion-rutas-servicios-component' });

        case 'estados-sistema':
            return e(GestionEstados, { key: 'gestion-estados-component' });

        case 'tipos-persona':
            return e(GestionTipoPersona, { key: 'gestion-tipo-persona-component' });

        // PERSONAL
        case 'empleados':
            return e(GestionEmpleados, { key: 'gestion-empleados-component' });

        case 'usuarios-sistema':
            return e(GestionUsuarios, { key: 'gestion-usuarios-component' });

        case 'roles-permisos':
            return e(GestionRoles, { key: 'gestion-roles-component' });

        // REPORTES
        case 'auditoria':
            return e(GestionAuditorias, { key: 'gestion-auditorias-component' });

        case 'estadisticas':
        case 'reportes':
            return e(GestionEstadisticas, { key: 'gestion-estadisticas-component' });

        // FALLBACK para módulos no definidos
        default:
            return e(ModuleHeader, {
                key: `${module}-header`,
                title: `Módulo: ${module}`,
                description: 'Este módulo está en desarrollo',
                icon: Icons.gear('#64748b'),
                status: 'En desarrollo'
            });
    }
}

// Authenticated App Component (la aplicación principal una vez logueado)
function AuthenticatedApp({ currentUser, onLogout }) {
    const [activeModule, setActiveModule] = useState('dashboard');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return e('div', {
        key: 'authenticated-app',
        style: {
            minHeight: '100vh',
            backgroundColor: '#f8fafc'
        }
    }, [
        e(TopBar, {
            key: 'app-topbar',
            onMenuClick: () => setSidebarCollapsed(!sidebarCollapsed),
            sidebarCollapsed,
            currentUser,
            onLogout
        }),
        e(Sidebar, {
            key: 'app-sidebar',
            activeModule,
            onModuleChange: setActiveModule,
            collapsed: sidebarCollapsed,
            onToggle: () => setSidebarCollapsed(!sidebarCollapsed)
        }),
        e('main', {
            key: 'app-main',
            style: {
                marginLeft: sidebarCollapsed ? '80px' : '260px',
                marginTop: '64px',
                minHeight: 'calc(100vh - 64px)',
                transition: 'margin-left 0.3s ease'
            }
        }, [
            e(ModuleContent, {
                key: 'app-content',
                module: activeModule,
                onNavigate: setActiveModule
            })
        ])
    ]);
}

// Main App Component with Authentication
function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Verificar autenticación al cargar la aplicación
    useEffect(() => {
        checkAuthenticationStatus();
    }, []);

    const checkAuthenticationStatus = async () => {
        try {
            setIsLoading(true);

            if (AuthService.isAuthenticated()) {
                // Verificar que el token siga siendo válido
                const user = await AuthService.getCurrentUser();
                if (user) {
                    setCurrentUser(user);
                    setIsAuthenticated(true);
                    Notifications.success('Sesión restaurada correctamente', 'Bienvenido de vuelta');
                } else {
                    // Token inválido o expirado
                    handleLogout();
                }
            } else {
                setIsAuthenticated(false);
                setCurrentUser(null);
            }
        } catch (error) {
            console.error('Error verificando autenticación:', error);
            handleLogout();
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoginSuccess = (user) => {
        setCurrentUser(user);
        setIsAuthenticated(true);
        Notifications.success(`Bienvenido ${user.nombre_completo}`, 'Login Exitoso');
    };

    const handleLogout = async () => {
        try {
            await AuthService.logout();
            setCurrentUser(null);
            setIsAuthenticated(false);
            Notifications.info('Sesión cerrada correctamente', 'Hasta pronto');
        } catch (error) {
            console.error('Error en logout:', error);
            // Limpiar sesión de todos modos
            setCurrentUser(null);
            setIsAuthenticated(false);
        }
    };

    // Pantalla de carga
    if (isLoading) {
        return e('div', {
            style: {
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f8fafc'
            }
        }, [
            e('div', {
                key: 'loading-content',
                style: {
                    textAlign: 'center',
                    color: '#6b7280'
                }
            }, [
                e('div', {
                    key: 'spinner',
                    style: {
                        width: '40px',
                        height: '40px',
                        border: '3px solid #e5e7eb',
                        borderTop: '3px solid #667eea',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 16px'
                    }
                }),
                e('p', { key: 'loading-text' }, 'Cargando Magic Travel...')
            ])
        ]);
    }

    // Mostrar login si no está autenticado
    if (!isAuthenticated) {
        return e(Login, {
            key: 'login-screen',
            onLoginSuccess: handleLoginSuccess
        });
    }

    // Mostrar aplicación principal si está autenticado
    return e(AuthenticatedApp, {
        key: 'main-app',
        currentUser,
        onLogout: handleLogout
    });
}

// INICIALIZACIÓN MEJORADA SIN DOBLE CREATEROOT
function initializeApp() {
    console.log('🚀 Iniciando Magic Travel SPA...');

    // Verificar que el contenedor existe
    const container = document.getElementById('app');
    if (!container) {
        console.error('❌ Error: Elemento #app no encontrado');
        return;
    }

    // EVITAR DOBLE CREATEROOT
    if (appRoot) {
        console.log('🔄 Actualizando aplicación existente...');
        appRoot.render(e(App));
        return;
    }

    // Verificar iziToast
    checkiziToast();

    // CREAR ROOT SOLO UNA VEZ
    console.log('🆕 Creando nueva instancia de React...');
    appRoot = createRoot(container);
    appRoot.render(e(App));

    console.log('✅ Magic Travel SPA cargado correctamente!');
}

// EVENT LISTENERS MEJORADOS - EVITAR MÚLTIPLES LLAMADAS
let initialized = false;

function handleDOMReady() {
    if (initialized) {
        console.log('⚠️ Ya inicializado, ignorando llamada duplicada');
        return;
    }
    initialized = true;
    initializeApp();
}

// Agregar listeners solo si no están ya agregados
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', handleDOMReady, { once: true });
} else {
    // DOM ya está listo
    handleDOMReady();
}

// CSS Animation for loading spinner
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);
