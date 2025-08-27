// src/resources/js/components/usuarios/UsuariosPermisos.js
import React from 'react';
import Empleados from './empleados/Empleados';
import GestionRoles from './roles/GestionRoles';
import SeguridadPanel from './seguridad/SeguridadPanel';
import Icons from '../../utils/Icons';

const { createElement: e, useState, useEffect } = React;

function UsuariosPermisos() {
    // Estado para controlar la pestaña activa
    const [tabActiva, setTabActiva] = useState('empleados');
    const [estadisticas, setEstadisticas] = useState({
        total_empleados: 0,
        empleados_activos: 0,
        total_roles: 0,
        sesiones_activas: 0
    });

    // Definir las pestañas disponibles
    const tabs = [
        {
            id: 'empleados',
            nombre: 'Empleados',
            icono: Icons.users(),
            descripcion: 'Gestión de empleados del sistema'
        },
        {
            id: 'roles',
            nombre: 'Roles y Permisos',
            icono: Icons.shield(),
            descripcion: 'Configuración de roles y permisos'
        },
        {
            id: 'seguridad',
            nombre: 'Seguridad',
            icono: Icons.lock(),
            descripcion: 'Auditoría y control de acceso'
        }
    ];

    // Cargar estadísticas al montar
    useEffect(() => {
        cargarEstadisticas();
    }, []);

    // Función para cargar estadísticas del dashboard
    const cargarEstadisticas = async () => {
        try {
            const response = await fetch('/api/v1/usuarios/estadisticas', {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setEstadisticas(data);
            }
        } catch (error) {
            console.log('Error cargando estadísticas:', error);
        }
    };

    // Renderizar el contenido según la pestaña activa
    const renderContenidoTab = () => {
        switch (tabActiva) {
            case 'empleados':
                return e(Empleados, { key: 'empleados-component' });
            case 'roles':
                return e(GestionRoles, { key: 'roles-component' });
            case 'seguridad':
                return e(SeguridadPanel, { key: 'seguridad-component' });
            default:
                return e(Empleados, { key: 'empleados-default' });
        }
    };

    return e('div', {
        style: {
            padding: '1.5rem',
            maxWidth: '100%',
            minHeight: '100vh'
        }
    }, [
        // Header principal
        e('div', {
            key: 'header',
            style: {
                marginBottom: '2rem'
            }
        }, [
            e('div', {
                key: 'title-section',
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '0.5rem'
                }
            }, [
                e('div', {
                    key: 'icon-container',
                    style: {
                        padding: '0.75rem',
                        backgroundColor: '#ef4444',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        color: 'white'
                    }
                }, Icons.userGroup()),
                e('div', { key: 'title-text' }, [
                    e('h1', {
                        key: 'main-title',
                        style: {
                            fontSize: '2rem',
                            fontWeight: '700',
                            color: '#111827',
                            margin: '0',
                            lineHeight: '1.2'
                        }
                    }, 'Usuarios y Permisos'),
                    e('p', {
                        key: 'description',
                        style: {
                            color: '#6b7280',
                            margin: '0.25rem 0 0 0',
                            fontSize: '1rem'
                        }
                    }, 'Gestión de usuarios y seguridad del sistema')
                ])
            ])
        ]),

        // Dashboard de estadísticas (solo si no está en móvil)
        e('div', {
            key: 'dashboard',
            style: {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
            }
        }, [
            // Total empleados
            e('div', {
                key: 'stat-empleados',
                style: {
                    backgroundColor: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    border: '1px solid #e5e7eb'
                }
            }, [
                e('div', {
                    key: 'stat-empleados-content',
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }
                }, [
                    e('div', { key: 'empleados-info' }, [
                        e('p', {
                            key: 'empleados-label',
                            style: {
                                fontSize: '0.875rem',
                                color: '#6b7280',
                                margin: '0 0 0.25rem 0'
                            }
                        }, 'Total Empleados'),
                        e('p', {
                            key: 'empleados-value',
                            style: {
                                fontSize: '1.875rem',
                                fontWeight: '700',
                                color: '#111827',
                                margin: '0'
                            }
                        }, estadisticas.total_empleados.toString())
                    ]),
                    e('div', {
                        key: 'empleados-icon',
                        style: {
                            padding: '0.75rem',
                            backgroundColor: '#dbeafe',
                            borderRadius: '8px',
                            color: '#3b82f6'
                        }
                    }, Icons.users())
                ])
            ]),

            // Empleados activos
            e('div', {
                key: 'stat-activos',
                style: {
                    backgroundColor: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    border: '1px solid #e5e7eb'
                }
            }, [
                e('div', {
                    key: 'stat-activos-content',
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }
                }, [
                    e('div', { key: 'activos-info' }, [
                        e('p', {
                            key: 'activos-label',
                            style: {
                                fontSize: '0.875rem',
                                color: '#6b7280',
                                margin: '0 0 0.25rem 0'
                            }
                        }, 'Activos'),
                        e('p', {
                            key: 'activos-value',
                            style: {
                                fontSize: '1.875rem',
                                fontWeight: '700',
                                color: '#059669',
                                margin: '0'
                            }
                        }, estadisticas.empleados_activos.toString())
                    ]),
                    e('div', {
                        key: 'activos-icon',
                        style: {
                            padding: '0.75rem',
                            backgroundColor: '#d1fae5',
                            borderRadius: '8px',
                            color: '#059669'
                        }
                    }, Icons.userCheck())
                ])
            ]),

            // Total roles
            e('div', {
                key: 'stat-roles',
                style: {
                    backgroundColor: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    border: '1px solid #e5e7eb'
                }
            }, [
                e('div', {
                    key: 'stat-roles-content',
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }
                }, [
                    e('div', { key: 'roles-info' }, [
                        e('p', {
                            key: 'roles-label',
                            style: {
                                fontSize: '0.875rem',
                                color: '#6b7280',
                                margin: '0 0 0.25rem 0'
                            }
                        }, 'Roles'),
                        e('p', {
                            key: 'roles-value',
                            style: {
                                fontSize: '1.875rem',
                                fontWeight: '700',
                                color: '#dc2626',
                                margin: '0'
                            }
                        }, estadisticas.total_roles.toString())
                    ]),
                    e('div', {
                        key: 'roles-icon',
                        style: {
                            padding: '0.75rem',
                            backgroundColor: '#fee2e2',
                            borderRadius: '8px',
                            color: '#dc2626'
                        }
                    }, Icons.shield())
                ])
            ]),

            // Sesiones activas
            e('div', {
                key: 'stat-sesiones',
                style: {
                    backgroundColor: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    border: '1px solid #e5e7eb'
                }
            }, [
                e('div', {
                    key: 'stat-sesiones-content',
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }
                }, [
                    e('div', { key: 'sesiones-info' }, [
                        e('p', {
                            key: 'sesiones-label',
                            style: {
                                fontSize: '0.875rem',
                                color: '#6b7280',
                                margin: '0 0 0.25rem 0'
                            }
                        }, 'Sesiones Activas'),
                        e('p', {
                            key: 'sesiones-value',
                            style: {
                                fontSize: '1.875rem',
                                fontWeight: '700',
                                color: '#7c3aed',
                                margin: '0'
                            }
                        }, estadisticas.sesiones_activas.toString())
                    ]),
                    e('div', {
                        key: 'sesiones-icon',
                        style: {
                            padding: '0.75rem',
                            backgroundColor: '#ede9fe',
                            borderRadius: '8px',
                            color: '#7c3aed'
                        }
                    }, Icons.monitor())
                ])
            ])
        ]),

        // Navegación por pestañas
        e('div', {
            key: 'tabs-navigation',
            style: {
                backgroundColor: 'white',
                borderRadius: '12px',
                marginBottom: '1.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                overflow: 'hidden'
            }
        }, [
            e('div', {
                key: 'tabs-header',
                style: {
                    display: 'flex',
                    borderBottom: '1px solid #e5e7eb'
                }
            }, tabs.map(tab =>
                e('button', {
                    key: tab.id,
                    onClick: () => setTabActiva(tab.id),
                    style: {
                        flex: '1',
                        padding: '1rem 1.5rem',
                        border: 'none',
                        backgroundColor: tabActiva === tab.id ? '#f9fafb' : 'transparent',
                        borderBottom: tabActiva === tab.id ? '2px solid #ef4444' : '2px solid transparent',
                        color: tabActiva === tab.id ? '#ef4444' : '#6b7280',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: tabActiva === tab.id ? '600' : '500',
                        transition: 'all 0.2s'
                    },
                    onMouseEnter: (e) => {
                        if (tabActiva !== tab.id) {
                            e.target.style.backgroundColor = '#f9fafb';
                            e.target.style.color = '#374151';
                        }
                    },
                    onMouseLeave: (e) => {
                        if (tabActiva !== tab.id) {
                            e.target.style.backgroundColor = 'transparent';
                            e.target.style.color = '#6b7280';
                        }
                    }
                }, [
                    e('span', { key: `${tab.id}-icon` }, tab.icono),
                    e('span', { key: `${tab.id}-text` }, tab.nombre)
                ])
            ))
        ]),

        // Contenido de la pestaña activa
        e('div', {
            key: 'tab-content',
            style: {
                minHeight: '500px'
            }
        }, renderContenidoTab())
    ]);
}

export default UsuariosPermisos;
