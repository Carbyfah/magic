// src/resources/js/simple.js
import './bootstrap';
import React from 'react';
import { createRoot } from 'react-dom/client';
import '../css/app.css';

// CRÍTICO: IMPORTAR NOTIFICATIONS PARA IZITOAST
import Notifications from './utils/notifications';

// Importar componentes existentes
import TopBar from './components/layouts/TopBar';
import Sidebar from './components/layouts/Sidebar';
import Dashboard from './components/layouts/Dashboard';

// Importar componentes de catálogos - GRUPO 1 (YA EXISTENTES)
import CatalogosList from './components/catalogos/modulos/CatalogosList';
import EstadosReserva from './components/catalogos/modulos/EstadosReserva';
import FormasPago from './components/catalogos/modulos/FormasPago';
import TiposCliente from './components/catalogos/modulos/TiposCliente';
import Paises from './components/catalogos/modulos/Paises';

// NUEVOS CATÁLOGOS - GRUPO 2 (RECIÉN IMPLEMENTADOS)
import TiposPersona from './components/catalogos/modulos/TiposPersona';
import Roles from './components/catalogos/modulos/Roles';
import EstadosEmpleado from './components/catalogos/modulos/EstadosEmpleado';
import TiposVehiculo from './components/catalogos/modulos/TiposVehiculo';
import TiposAgencia from './components/catalogos/modulos/TiposAgencia';
import TiposCombustible from './components/catalogos/modulos/TiposCombustible';
import TiposLicencia from './components/catalogos/modulos/TiposLicencia';
import EstadosVehiculo from './components/catalogos/modulos/EstadosVehiculo';

// NUEVOS CATÁLOGOS - GRUPO 3 (LOS 5 FALTANTES)
import EstadosComercial from './components/catalogos/modulos/EstadosComercial';
import EstadosRuta from './components/catalogos/modulos/EstadosRuta';
import TiposVenta from './components/catalogos/modulos/TiposVenta';
import EstadosVenta from './components/catalogos/modulos/EstadosVenta';
import EstadosPago from './components/catalogos/modulos/EstadosPago';

// MÓDULO RESERVACIONES - COMPONENTES COMPLETOS
import Reservaciones from './components/reservaciones/Reservaciones';
import ReservasList from './components/reservaciones/ReservasList';
import ReservaForm from './components/reservaciones/ReservaForm';
import ReservaModal from './components/reservaciones/ReservaModal';
import ReservaCard from './components/reservaciones/ReservaCard';
import WhatsAppFormat from './components/reservaciones/WhatsAppFormat';

import RutasServicios from './components/configuracion/RutasServicios';
// import RutasServicios from './components/rutas-servicios/RutasServicios.js';

// Importar agencias
import GestionAgencias from './components/comercial/agencias/GestionAgencias';

// Importar clientes
import GestionClientes from './components/comercial/clientes/GestionClientes';

// Importar iconos
import Icons from './utils/Icons';

const { createElement: e, useState } = React;

// VARIABLE GLOBAL PARA EVITAR DOBLE CREATEROOT
let appRoot = null;

// FUNCIÓN PARA VERIFICAR IZITOAST
function checkiziToast() {
    const available = typeof window.iziToast !== 'undefined';
    console.log('🔍 iziToast disponible:', available);
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
                        setTimeout(() => Notifications.success('iziToast funciona perfectamente', '✅ Test Exitoso'), 100);
                        setTimeout(() => Notifications.info('Información mostrada correctamente', '📢 Info'), 1500);
                        setTimeout(() => Notifications.warning('Advertencia mostrada correctamente', '⚠️ Warning'), 3000);
                        setTimeout(() => Notifications.magicTravel('Magic Travel está listo para usar', '🚀 Sistema Listo'), 4500);
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
            }, '🧪 Probar Notificaciones iziToast')
        ])
    ]);
}

// Componente para manejar los catálogos específicos
function CatalogosContent({ catalogoId, onBack, onSelectCatalogo }) {
    switch (catalogoId) {
        case 'estados_reserva':
            return e('div', {
                key: 'estados-reserva-container',
                style: { position: 'relative' }
            }, [
                // Botón de regreso
                e('button', {
                    key: 'back-button-estados',
                    onClick: onBack,
                    style: {
                        position: 'absolute',
                        top: '1rem',
                        left: '1rem',
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        backgroundColor: 'white',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                    }
                }, [
                    e('span', { key: 'arrow-icon-estados' }, Icons.arrowLeft()),
                    e('span', { key: 'back-text-estados' }, 'Volver a Catálogos')
                ]),
                e(EstadosReserva, { key: 'estados-reserva-component' })
            ]);

        case 'formas_pago':
            return e('div', {
                key: 'formas-pago-container',
                style: { position: 'relative' }
            }, [
                e('button', {
                    key: 'back-button-formas',
                    onClick: onBack,
                    style: {
                        position: 'absolute',
                        top: '1rem',
                        left: '1rem',
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        backgroundColor: 'white',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                    }
                }, [
                    e('span', { key: 'arrow-icon-formas' }, Icons.arrowLeft()),
                    e('span', { key: 'back-text-formas' }, 'Volver a Catálogos')
                ]),
                e(FormasPago, { key: 'formas-pago-component' })
            ]);

        case 'tipos_cliente':
            return e('div', {
                key: 'tipos-cliente-container',
                style: { position: 'relative' }
            }, [
                e('button', {
                    key: 'back-button-tipos',
                    onClick: onBack,
                    style: {
                        position: 'absolute',
                        top: '1rem',
                        left: '1rem',
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        backgroundColor: 'white',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                    }
                }, [
                    e('span', { key: 'arrow-icon-tipos' }, Icons.arrowLeft()),
                    e('span', { key: 'back-text-tipos' }, 'Volver a Catálogos')
                ]),
                e(TiposCliente, { key: 'tipos-cliente-component' })
            ]);

        case 'paises':
            return e('div', {
                key: 'paises-container',
                style: { position: 'relative' }
            }, [
                e('button', {
                    key: 'back-button-paises',
                    onClick: onBack,
                    style: {
                        position: 'absolute',
                        top: '1rem',
                        left: '1rem',
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        backgroundColor: 'white',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                    }
                }, [
                    e('span', { key: 'arrow-icon-paises' }, Icons.arrowLeft()),
                    e('span', { key: 'back-text-paises' }, 'Volver a Catálogos')
                ]),
                e(Paises, { key: 'paises-component' })
            ]);

        // NUEVOS CATÁLOGOS AGREGADOS
        case 'tipos_persona':
            return e('div', {
                key: 'tipos-persona-container',
                style: { position: 'relative' }
            }, [
                e('button', {
                    key: 'back-button-tipos-persona',
                    onClick: onBack,
                    style: {
                        position: 'absolute',
                        top: '1rem',
                        left: '1rem',
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        backgroundColor: 'white',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                    }
                }, [
                    e('span', { key: 'arrow-icon-tipos-persona' }, Icons.arrowLeft()),
                    e('span', { key: 'back-text-tipos-persona' }, 'Volver a Catálogos')
                ]),
                e(TiposPersona, { key: 'tipos-persona-component' })
            ]);

        case 'roles':
            return e('div', {
                key: 'roles-container',
                style: { position: 'relative' }
            }, [
                e('button', {
                    key: 'back-button-roles',
                    onClick: onBack,
                    style: {
                        position: 'absolute',
                        top: '1rem',
                        left: '1rem',
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        backgroundColor: 'white',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                    }
                }, [
                    e('span', { key: 'arrow-icon-roles' }, Icons.arrowLeft()),
                    e('span', { key: 'back-text-roles' }, 'Volver a Catálogos')
                ]),
                e(Roles, { key: 'roles-component' })
            ]);

        case 'estados_empleado':
            return e('div', {
                key: 'estados-empleado-container',
                style: { position: 'relative' }
            }, [
                e('button', {
                    key: 'back-button-estados-empleado',
                    onClick: onBack,
                    style: {
                        position: 'absolute',
                        top: '1rem',
                        left: '1rem',
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        backgroundColor: 'white',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                    }
                }, [
                    e('span', { key: 'arrow-icon-estados-empleado' }, Icons.arrowLeft()),
                    e('span', { key: 'back-text-estados-empleado' }, 'Volver a Catálogos')
                ]),
                e(EstadosEmpleado, { key: 'estados-empleado-component' })
            ]);

        case 'tipos_vehiculo':
            return e('div', {
                key: 'tipos-vehiculo-container',
                style: { position: 'relative' }
            }, [
                e('button', {
                    key: 'back-button-tipos-vehiculo',
                    onClick: onBack,
                    style: {
                        position: 'absolute',
                        top: '1rem',
                        left: '1rem',
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        backgroundColor: 'white',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                    }
                }, [
                    e('span', { key: 'arrow-icon-tipos-vehiculo' }, Icons.arrowLeft()),
                    e('span', { key: 'back-text-tipos-vehiculo' }, 'Volver a Catálogos')
                ]),
                e(TiposVehiculo, { key: 'tipos-vehiculo-component' })
            ]);

        case 'tipos_agencia':
            return e('div', {
                key: 'tipos-agencia-container',
                style: { position: 'relative' }
            }, [
                e('button', {
                    key: 'back-button-tipos-agencia',
                    onClick: onBack,
                    style: {
                        position: 'absolute',
                        top: '1rem',
                        left: '1rem',
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        backgroundColor: 'white',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                    }
                }, [
                    e('span', { key: 'arrow-icon-tipos-agencia' }, Icons.arrowLeft()),
                    e('span', { key: 'back-text-tipos-agencia' }, 'Volver a Catálogos')
                ]),
                e(TiposAgencia, { key: 'tipos-agencia-component' })
            ]);

        case 'tipos_combustible':
            return e('div', {
                key: 'tipos-combustible-container',
                style: { position: 'relative' }
            }, [
                e('button', {
                    key: 'back-button-tipos-combustible',
                    onClick: onBack,
                    style: {
                        position: 'absolute',
                        top: '1rem',
                        left: '1rem',
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        backgroundColor: 'white',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                    }
                }, [
                    e('span', { key: 'arrow-icon-tipos-combustible' }, Icons.arrowLeft()),
                    e('span', { key: 'back-text-tipos-combustible' }, 'Volver a Catálogos')
                ]),
                e(TiposCombustible, { key: 'tipos-combustible-component' })
            ]);

        case 'tipos_licencia':
            return e('div', {
                key: 'tipos-licencia-container',
                style: { position: 'relative' }
            }, [
                e('button', {
                    key: 'back-button-tipos-licencia',
                    onClick: onBack,
                    style: {
                        position: 'absolute',
                        top: '1rem',
                        left: '1rem',
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        backgroundColor: 'white',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                    }
                }, [
                    e('span', { key: 'arrow-icon-tipos-licencia' }, Icons.arrowLeft()),
                    e('span', { key: 'back-text-tipos-licencia' }, 'Volver a Catálogos')
                ]),
                e(TiposLicencia, { key: 'tipos-licencia-component' })
            ]);

        case 'estados_vehiculo':
            return e('div', {
                key: 'estados-vehiculo-container',
                style: { position: 'relative' }
            }, [
                e('button', {
                    key: 'back-button-estados-vehiculo',
                    onClick: onBack,
                    style: {
                        position: 'absolute',
                        top: '1rem',
                        left: '1rem',
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        backgroundColor: 'white',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                    }
                }, [
                    e('span', { key: 'arrow-icon-estados-vehiculo' }, Icons.arrowLeft()),
                    e('span', { key: 'back-text-estados-vehiculo' }, 'Volver a Catálogos')
                ]),
                e(EstadosVehiculo, { key: 'estados-vehiculo-component' })
            ]);

        // LOS 5 NUEVOS CATÁLOGOS
        case 'estados_comercial':
            return e('div', {
                key: 'estados-comercial-container',
                style: { position: 'relative' }
            }, [
                e('button', {
                    key: 'back-button-estados-comercial',
                    onClick: onBack,
                    style: {
                        position: 'absolute',
                        top: '1rem',
                        left: '1rem',
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        backgroundColor: 'white',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                    }
                }, [
                    e('span', { key: 'arrow-icon-estados-comercial' }, Icons.arrowLeft()),
                    e('span', { key: 'back-text-estados-comercial' }, 'Volver a Catálogos')
                ]),
                e(EstadosComercial, { key: 'estados-comercial-component' })
            ]);

        case 'estados_ruta':
            return e('div', {
                key: 'estados-ruta-container',
                style: { position: 'relative' }
            }, [
                e('button', {
                    key: 'back-button-estados-ruta',
                    onClick: onBack,
                    style: {
                        position: 'absolute',
                        top: '1rem',
                        left: '1rem',
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        backgroundColor: 'white',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                    }
                }, [
                    e('span', { key: 'arrow-icon-estados-ruta' }, Icons.arrowLeft()),
                    e('span', { key: 'back-text-estados-ruta' }, 'Volver a Catálogos')
                ]),
                e(EstadosRuta, { key: 'estados-ruta-component' })
            ]);

        case 'tipos_venta':
            return e('div', {
                key: 'tipos-venta-container',
                style: { position: 'relative' }
            }, [
                e('button', {
                    key: 'back-button-tipos-venta',
                    onClick: onBack,
                    style: {
                        position: 'absolute',
                        top: '1rem',
                        left: '1rem',
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        backgroundColor: 'white',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                    }
                }, [
                    e('span', { key: 'arrow-icon-tipos-venta' }, Icons.arrowLeft()),
                    e('span', { key: 'back-text-tipos-venta' }, 'Volver a Catálogos')
                ]),
                e(TiposVenta, { key: 'tipos-venta-component' })
            ]);

        case 'estados_venta':
            return e('div', {
                key: 'estados-venta-container',
                style: { position: 'relative' }
            }, [
                e('button', {
                    key: 'back-button-estados-venta',
                    onClick: onBack,
                    style: {
                        position: 'absolute',
                        top: '1rem',
                        left: '1rem',
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        backgroundColor: 'white',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                    }
                }, [
                    e('span', { key: 'arrow-icon-estados-venta' }, Icons.arrowLeft()),
                    e('span', { key: 'back-text-estados-venta' }, 'Volver a Catálogos')
                ]),
                e(EstadosVenta, { key: 'estados-venta-component' })
            ]);

        case 'estados_pago':
            return e('div', {
                key: 'estados-pago-container',
                style: { position: 'relative' }
            }, [
                e('button', {
                    key: 'back-button-estados-pago',
                    onClick: onBack,
                    style: {
                        position: 'absolute',
                        top: '1rem',
                        left: '1rem',
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        backgroundColor: 'white',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                    }
                }, [
                    e('span', { key: 'arrow-icon-estados-pago' }, Icons.arrowLeft()),
                    e('span', { key: 'back-text-estados-pago' }, 'Volver a Catálogos')
                ]),
                e(EstadosPago, { key: 'estados-pago-component' })
            ]);

        default:
            return e(CatalogosList, {
                key: 'catalogos-list-default',
                onSelectCatalogo: (id) => {
                    console.log('Seleccionando catálogo:', id);
                    if (onSelectCatalogo) {
                        onSelectCatalogo(id);
                    }
                }
            });
    }
}

// Module Content Component - ACTUALIZADO
function ModuleContent({ module }) {
    const [selectedCatalogo, setSelectedCatalogo] = useState(null);

    switch (module) {
        case 'dashboard':
            return e(Dashboard, { key: 'dashboard-component' });

        case 'catalogos':
            return e(CatalogosContent, {
                key: 'catalogos-content',
                catalogoId: selectedCatalogo,
                onBack: () => setSelectedCatalogo(null),
                onSelectCatalogo: (id) => setSelectedCatalogo(id)
            });

        // OPERACIÓN DIARIA
        case 'reservas':
        case 'reservaciones': // Mantener compatibilidad con ambos IDs
            return e(Reservaciones, { key: 'reservaciones-component' });

        case 'rutas-dia':
            return e(ModuleHeader, {
                key: 'rutas-dia-header',
                title: 'Rutas del Día',
                description: 'Control y monitoreo de rutas programadas',
                icon: Icons.map('#10b981'),
                status: 'Disponible'
            });

        case 'control-flota':
            return e(ModuleHeader, {
                key: 'control-flota-header',
                title: 'Control de Flota',
                description: 'Monitoreo de vehículos y asignaciones',
                icon: Icons.truck('#f59e0b'),
                status: 'Disponible'
            });

        case 'pasajeros':
            return e(ModuleHeader, {
                key: 'pasajeros-header',
                title: 'Gestión de Pasajeros',
                description: 'Administración de pasajeros y servicios',
                icon: Icons.users('#8b5cf6'),
                status: 'Disponible'
            });

        // COMERCIAL
        case 'ventas':
            return e(ModuleHeader, {
                key: 'ventas-header',
                title: 'Gestión de Ventas',
                description: 'Control de ventas y facturación',
                icon: Icons.dollar('#10b981'),
                status: 'Disponible'
            });

        case 'pagos':
            return e(ModuleHeader, {
                key: 'pagos-header',
                title: 'Gestión de Pagos',
                description: 'Control de pagos y cuentas por cobrar',
                icon: Icons.creditCard('#3b82f6'),
                status: 'Disponible'
            });

        case 'agencias':
            return e(GestionAgencias, { key: 'gestion-agencias-component' });

        case 'clientes':
            return e(GestionClientes, { key: 'clientes-component' });

        // FLOTA Y PERSONAL
        case 'vehiculos':
            return e(ModuleHeader, {
                key: 'vehiculos-header',
                title: 'Gestión de Vehículos',
                description: 'Administración de flota vehicular',
                icon: Icons.truck('#f59e0b'),
                status: 'Disponible'
            });

        case 'choferes':
            return e(ModuleHeader, {
                key: 'choferes-header',
                title: 'Gestión de Choferes',
                description: 'Administración de conductores y licencias',
                icon: Icons.userCheck('#16a34a'),
                status: 'Disponible'
            });

        case 'empleados':
            return e(ModuleHeader, {
                key: 'empleados-header',
                title: 'Gestión de Empleados',
                description: 'Administración de recursos humanos',
                icon: Icons.users('#6366f1'),
                status: 'Disponible'
            });

        // REPORTES
        case 'reporte-ventas':
            return e(ModuleHeader, {
                key: 'reporte-ventas-header',
                title: 'Reportes de Ventas',
                description: 'Informes y análisis de ventas',
                icon: Icons.chartBar('#10b981')
            });

        case 'reporte-operacion':
            return e(ModuleHeader, {
                key: 'reporte-operacion-header',
                title: 'Reportes Operacionales',
                description: 'Informes de operación y rutas',
                icon: Icons.chartLine('#f59e0b')
            });

        case 'reporte-financiero':
            return e(ModuleHeader, {
                key: 'reporte-financiero-header',
                title: 'Reportes Financieros',
                description: 'Estados financieros y análisis',
                icon: Icons.trendingUp('#059669')
            });

        case 'auditoria':
            return e(ModuleHeader, {
                key: 'auditoria-header',
                title: 'Auditoría del Sistema',
                description: 'Registro de cambios y actividad',
                icon: Icons.fileText('#64748b')
            });

        // CONFIGURACIÓN
        case 'rutas-servicios':
            return e(RutasServicios, { key: 'rutas-servicios-component' });

        case 'usuarios':
            return e(ModuleHeader, {
                key: 'usuarios-header',
                title: 'Usuarios y Permisos',
                description: 'Gestión de usuarios y seguridad',
                icon: Icons.userGroup('#ef4444')
            });

        // LEGACY - mantener por compatibilidad
        case 'rutas':
            return e(ModuleHeader, {
                key: 'rutas-header',
                title: 'Módulo de Rutas',
                description: 'Gestión de rutas y servicios',
                icon: Icons.map('#10b981'),
                status: 'Disponible'
            });

        default:
            return e(ModuleHeader, {
                key: `${module}-header`,
                title: `Módulo: ${module}`,
                description: 'Módulo en desarrollo',
                icon: Icons.gear('#64748b')
            });
    }
}

// Main App Component
function App() {
    const [activeModule, setActiveModule] = useState('dashboard');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return e('div', {
        key: 'app-root',
        style: {
            minHeight: '100vh',
            backgroundColor: '#f8fafc'
        }
    }, [
        e(TopBar, {
            key: 'app-topbar',
            onMenuClick: () => setSidebarCollapsed(!sidebarCollapsed),
            sidebarCollapsed
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
                module: activeModule
            })
        ])
    ]);
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
