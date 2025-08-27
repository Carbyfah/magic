// src/resources/js/components/usuarios/seguridad/SeguridadPanel.js
import React from 'react';
import Icons from '../../../utils/Icons';
import Notifications from '../../../utils/notifications';
import UserAvatar from '../common/UserAvatar';

const { createElement: e, useState, useEffect } = React;

function SeguridadPanel() {
    // Estados principales
    const [activeTab, setActiveTab] = useState('auditoria');
    const [loading, setLoading] = useState(false);

    // Estados de auditoría
    const [auditoria, setAuditoria] = useState([]);
    const [filtroAccion, setFiltroAccion] = useState('todos');
    const [filtroTabla, setFiltroTabla] = useState('todos');
    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');

    // Estados de sesiones activas
    const [sesionesActivas, setSesionesActivas] = useState([]);

    // Estados de métricas de seguridad
    const [metricas, setMetricas] = useState({
        totalAuditoria: 0,
        sesionesHoy: 0,
        intentosFallidos: 0,
        ultimoAcceso: null
    });

    // Tabs disponibles
    const tabs = [
        {
            id: 'auditoria',
            nombre: 'Auditoría',
            icono: Icons.fileText(),
            descripcion: 'Registro de cambios y actividades'
        },
        {
            id: 'sesiones',
            nombre: 'Sesiones Activas',
            icono: Icons.monitor(),
            descripcion: 'Control de sesiones de usuario'
        },
        {
            id: 'configuracion',
            nombre: 'Configuración',
            icono: Icons.settings(),
            descripcion: 'Configuración de seguridad'
        }
    ];

    useEffect(() => {
        cargarDatos();
    }, [activeTab]);

    // Cargar datos según la tab activa
    const cargarDatos = async () => {
        switch (activeTab) {
            case 'auditoria':
                await cargarAuditoria();
                break;
            case 'sesiones':
                await cargarSesionesActivas();
                break;
            case 'configuracion':
                await cargarConfiguracionSeguridad();
                break;
        }
        await cargarMetricas();
    };

    // Cargar registros de auditoría
    const cargarAuditoria = async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams();
            if (filtroAccion !== 'todos') params.append('accion', filtroAccion);
            if (filtroTabla !== 'todos') params.append('tabla', filtroTabla);
            if (fechaDesde) params.append('fecha_desde', fechaDesde);
            if (fechaHasta) params.append('fecha_hasta', fechaHasta);

            const response = await fetch(`/api/v1/auditoria?${params.toString()}`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setAuditoria(Array.isArray(data) ? data : data.data || []);
            }
        } catch (error) {
            console.error('Error cargando auditoría:', error);
            Notifications.error('Error al cargar registros de auditoría');
        } finally {
            setLoading(false);
        }
    };

    // Cargar sesiones activas
    const cargarSesionesActivas = async () => {
        try {
            setLoading(true);

            const response = await fetch('/api/v1/usuarios/sesiones-activas', {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setSesionesActivas(Array.isArray(data) ? data : data.data || []);
            }
        } catch (error) {
            console.error('Error cargando sesiones:', error);
            // Datos mock para desarrollo
            setSesionesActivas([
                {
                    id: 1,
                    empleado: {
                        codigo_empleado: 'EMP001',
                        persona: { nombres: 'Juan', apellidos: 'Pérez' }
                    },
                    ip: '192.168.1.100',
                    user_agent: 'Mozilla/5.0 Chrome/91.0',
                    ultimo_acceso: '2024-08-26 14:30:00',
                    tiempo_sesion: '2h 15min'
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    // Cargar configuración de seguridad
    const cargarConfiguracionSeguridad = async () => {
        // TODO: Implementar cuando esté disponible en el backend
        setLoading(false);
    };

    // Cargar métricas de seguridad
    const cargarMetricas = async () => {
        try {
            const response = await fetch('/api/v1/seguridad/metricas', {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setMetricas(data);
            }
        } catch (error) {
            console.error('Error cargando métricas:', error);
            // Datos mock para desarrollo
            setMetricas({
                totalAuditoria: 1247,
                sesionesHoy: 8,
                intentosFallidos: 3,
                ultimoAcceso: '2024-08-26 14:30:00'
            });
        }
    };

    // Formatear fecha y hora
    const formatDateTime = (dateString) => {
        if (!dateString) return '-';
        try {
            return new Date(dateString).toLocaleString('es-GT');
        } catch (e) {
            return dateString;
        }
    };

    // Obtener color para tipo de acción
    const getAccionColor = (accion) => {
        const colores = {
            'insert': '#22c55e',
            'update': '#3b82f6',
            'delete': '#ef4444',
            'login': '#8b5cf6',
            'logout': '#6b7280',
            'view': '#14b8a6',
            'export': '#f59e0b'
        };
        return colores[accion] || '#6b7280';
    };

    // Renderizar contenido según tab activa
    const renderTabContent = () => {
        switch (activeTab) {
            case 'auditoria':
                return renderAuditoriaTab();
            case 'sesiones':
                return renderSesionesTab();
            case 'configuracion':
                return renderConfiguracionTab();
            default:
                return null;
        }
    };

    // Tab de auditoría
    const renderAuditoriaTab = () => e('div', { key: 'auditoria-content' }, [
        // Filtros de auditoría
        e('div', {
            key: 'auditoria-filters',
            style: {
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                marginBottom: '1.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }
        }, [
            e('div', {
                key: 'filters-grid',
                style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem'
                }
            }, [
                e('div', { key: 'filter-accion' }, [
                    e('label', {
                        key: 'accion-label',
                        style: {
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }
                    }, 'Acción'),
                    e('select', {
                        key: 'accion-select',
                        value: filtroAccion,
                        onChange: (e) => setFiltroAccion(e.target.value),
                        style: {
                            width: '100%',
                            padding: '0.75rem 1rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '0.875rem'
                        }
                    }, [
                        e('option', { key: 'todos', value: 'todos' }, 'Todas las acciones'),
                        e('option', { key: 'insert', value: 'insert' }, 'Creación'),
                        e('option', { key: 'update', value: 'update' }, 'Modificación'),
                        e('option', { key: 'delete', value: 'delete' }, 'Eliminación'),
                        e('option', { key: 'login', value: 'login' }, 'Inicio de sesión'),
                        e('option', { key: 'logout', value: 'logout' }, 'Cierre de sesión')
                    ])
                ]),

                e('div', { key: 'filter-tabla' }, [
                    e('label', {
                        key: 'tabla-label',
                        style: {
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }
                    }, 'Módulo/Tabla'),
                    e('select', {
                        key: 'tabla-select',
                        value: filtroTabla,
                        onChange: (e) => setFiltroTabla(e.target.value),
                        style: {
                            width: '100%',
                            padding: '0.75rem 1rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '0.875rem'
                        }
                    }, [
                        e('option', { key: 'todos', value: 'todos' }, 'Todas las tablas'),
                        e('option', { key: 'empleados', value: 'empleados' }, 'Empleados'),
                        e('option', { key: 'roles', value: 'roles' }, 'Roles'),
                        e('option', { key: 'vehiculos', value: 'vehiculos' }, 'Vehículos'),
                        e('option', { key: 'reservas', value: 'reservas' }, 'Reservas'),
                        e('option', { key: 'ventas', value: 'ventas' }, 'Ventas'),
                        e('option', { key: 'rutas', value: 'rutas' }, 'Rutas')
                    ])
                ]),

                e('div', { key: 'filter-fecha-desde' }, [
                    e('label', {
                        key: 'fecha-desde-label',
                        style: {
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }
                    }, 'Fecha Desde'),
                    e('input', {
                        key: 'fecha-desde-input',
                        type: 'date',
                        value: fechaDesde,
                        onChange: (e) => setFechaDesde(e.target.value),
                        style: {
                            width: '100%',
                            padding: '0.75rem 1rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '0.875rem'
                        }
                    })
                ]),

                e('div', { key: 'filter-fecha-hasta' }, [
                    e('label', {
                        key: 'fecha-hasta-label',
                        style: {
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }
                    }, 'Fecha Hasta'),
                    e('input', {
                        key: 'fecha-hasta-input',
                        type: 'date',
                        value: fechaHasta,
                        onChange: (e) => setFechaHasta(e.target.value),
                        style: {
                            width: '100%',
                            padding: '0.75rem 1rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '0.875rem'
                        }
                    })
                ]),

                e('div', {
                    key: 'filter-actions',
                    style: { display: 'flex', alignItems: 'end' }
                }, [
                    e('button', {
                        key: 'btn-filtrar',
                        onClick: cargarAuditoria,
                        style: {
                            padding: '0.75rem 1.5rem',
                            backgroundColor: '#64748b',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }
                    }, [Icons.search(), 'Filtrar'])
                ])
            ])
        ]),

        // Tabla de auditoría
        e('div', {
            key: 'auditoria-table',
            style: {
                backgroundColor: 'white',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }
        }, [
            loading ? e('div', {
                key: 'loading',
                style: {
                    padding: '3rem',
                    textAlign: 'center'
                }
            }, [
                e('div', {
                    style: {
                        width: '32px',
                        height: '32px',
                        border: '3px solid #f3f4f6',
                        borderTop: '3px solid #64748b',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 1rem'
                    }
                }),
                e('p', { style: { color: '#6b7280' } }, 'Cargando registros...')
            ]) : e('div', { key: 'table-container', style: { overflow: 'auto' } }, [
                e('table', { key: 'audit-table', style: { width: '100%', borderCollapse: 'collapse' } }, [
                    e('thead', { key: 'table-head', style: { backgroundColor: '#f9fafb' } }, [
                        e('tr', { key: 'header-row' }, [
                            e('th', {
                                style: {
                                    padding: '0.75rem 1rem',
                                    textAlign: 'left',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    color: '#374151',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    borderBottom: '1px solid #e5e7eb'
                                }
                            }, 'Fecha/Hora'),
                            e('th', {
                                style: {
                                    padding: '0.75rem 1rem',
                                    textAlign: 'left',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    color: '#374151',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    borderBottom: '1px solid #e5e7eb'
                                }
                            }, 'Usuario'),
                            e('th', {
                                style: {
                                    padding: '0.75rem 1rem',
                                    textAlign: 'left',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    color: '#374151',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    borderBottom: '1px solid #e5e7eb'
                                }
                            }, 'Acción'),
                            e('th', {
                                style: {
                                    padding: '0.75rem 1rem',
                                    textAlign: 'left',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    color: '#374151',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    borderBottom: '1px solid #e5e7eb'
                                }
                            }, 'Tabla/Módulo'),
                            e('th', {
                                style: {
                                    padding: '0.75rem 1rem',
                                    textAlign: 'left',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    color: '#374151',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    borderBottom: '1px solid #e5e7eb'
                                }
                            }, 'Descripción'),
                            e('th', {
                                style: {
                                    padding: '0.75rem 1rem',
                                    textAlign: 'left',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    color: '#374151',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    borderBottom: '1px solid #e5e7eb'
                                }
                            }, 'IP')
                        ])
                    ]),
                    e('tbody', { key: 'table-body' },
                        auditoria.length > 0 ? auditoria.map((registro, index) =>
                            e('tr', {
                                key: `audit-${index}`,
                                style: {
                                    borderBottom: '1px solid #f3f4f6',
                                    '&:hover': { backgroundColor: '#f9fafb' }
                                },
                                onMouseEnter: (e) => e.currentTarget.style.backgroundColor = '#f9fafb',
                                onMouseLeave: (e) => e.currentTarget.style.backgroundColor = 'transparent'
                            }, [
                                e('td', {
                                    key: 'fecha',
                                    style: { padding: '1rem', fontSize: '0.875rem' }
                                }, formatDateTime(registro.created_at || registro.fecha)),

                                e('td', {
                                    key: 'usuario',
                                    style: { padding: '1rem', fontSize: '0.875rem' }
                                }, registro.usuario || registro.empleado || 'Sistema'),

                                e('td', {
                                    key: 'accion',
                                    style: { padding: '1rem' }
                                }, [
                                    e('span', {
                                        style: {
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '6px',
                                            fontSize: '0.75rem',
                                            fontWeight: '500',
                                            backgroundColor: getAccionColor(registro.accion) + '20',
                                            color: getAccionColor(registro.accion)
                                        }
                                    }, registro.accion?.toUpperCase() || 'UNKNOWN')
                                ]),

                                e('td', {
                                    key: 'tabla',
                                    style: {
                                        padding: '1rem',
                                        fontSize: '0.875rem',
                                        fontFamily: 'monospace'
                                    }
                                }, registro.tabla || registro.modulo || '-'),

                                e('td', {
                                    key: 'descripcion',
                                    style: {
                                        padding: '1rem',
                                        fontSize: '0.875rem',
                                        maxWidth: '200px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    },
                                    title: registro.descripcion
                                }, registro.descripcion || '-'),

                                e('td', {
                                    key: 'ip',
                                    style: {
                                        padding: '1rem',
                                        fontSize: '0.875rem',
                                        fontFamily: 'monospace',
                                        color: '#6b7280'
                                    }
                                }, registro.ip || '-')
                            ])
                        ) : [
                            e('tr', { key: 'no-data' }, [
                                e('td', {
                                    colSpan: 6,
                                    style: {
                                        padding: '3rem',
                                        textAlign: 'center',
                                        color: '#6b7280'
                                    }
                                }, 'No hay registros de auditoría')
                            ])
                        ]
                    )
                ])
            ])
        ])
    ]);

    // Tab de sesiones activas
    const renderSesionesTab = () => e('div', { key: 'sesiones-content' }, [
        e('div', {
            key: 'sesiones-list',
            style: {
                backgroundColor: 'white',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }
        }, [
            loading ? e('div', {
                key: 'loading',
                style: { padding: '3rem', textAlign: 'center' }
            }, 'Cargando sesiones...') : sesionesActivas.length > 0 ?
                sesionesActivas.map((sesion, index) =>
                    e('div', {
                        key: `sesion-${index}`,
                        style: {
                            padding: '1.5rem',
                            borderBottom: index < sesionesActivas.length - 1 ? '1px solid #f3f4f6' : 'none'
                        }
                    }, [
                        e('div', {
                            key: 'sesion-info',
                            style: {
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }
                        }, [
                            e('div', {
                                key: 'usuario-info',
                                style: { display: 'flex', alignItems: 'center', gap: '1rem' }
                            }, [
                                e(UserAvatar, {
                                    key: 'avatar',
                                    empleado: sesion.empleado,
                                    size: '48px',
                                    showStatus: true
                                }),
                                e('div', { key: 'detalles' }, [
                                    e('h4', {
                                        key: 'nombre',
                                        style: {
                                            fontSize: '1rem',
                                            fontWeight: '600',
                                            color: '#111827',
                                            margin: '0 0 0.25rem 0'
                                        }
                                    }, `${sesion.empleado?.persona?.nombres} ${sesion.empleado?.persona?.apellidos}`),
                                    e('p', {
                                        key: 'codigo',
                                        style: {
                                            fontSize: '0.875rem',
                                            color: '#6b7280',
                                            margin: '0'
                                        }
                                    }, sesion.empleado?.codigo_empleado),
                                    e('p', {
                                        key: 'ip-info',
                                        style: {
                                            fontSize: '0.75rem',
                                            color: '#9ca3af',
                                            margin: '0.25rem 0 0 0',
                                            fontFamily: 'monospace'
                                        }
                                    }, `IP: ${sesion.ip} • ${sesion.tiempo_sesion}`)
                                ])
                            ]),
                            e('div', {
                                key: 'sesion-actions',
                                style: { display: 'flex', gap: '0.5rem' }
                            }, [
                                e('button', {
                                    key: 'btn-detalles',
                                    style: {
                                        padding: '0.5rem 1rem',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        backgroundColor: 'white',
                                        color: '#374151',
                                        fontSize: '0.875rem',
                                        cursor: 'pointer'
                                    }
                                }, 'Ver Detalles'),
                                e('button', {
                                    key: 'btn-cerrar',
                                    style: {
                                        padding: '0.5rem 1rem',
                                        border: 'none',
                                        borderRadius: '6px',
                                        backgroundColor: '#ef4444',
                                        color: 'white',
                                        fontSize: '0.875rem',
                                        cursor: 'pointer'
                                    }
                                }, 'Cerrar Sesión')
                            ])
                        ])
                    ])
                ) : e('div', {
                    key: 'no-sesiones',
                    style: {
                        padding: '3rem',
                        textAlign: 'center',
                        color: '#6b7280'
                    }
                }, 'No hay sesiones activas')
        ])
    ]);

    // Tab de configuración
    const renderConfiguracionTab = () => e('div', { key: 'configuracion-content' }, [
        e('div', {
            key: 'config-sections',
            style: { display: 'grid', gap: '2rem' }
        }, [
            // Configuración de contraseñas
            e('div', {
                key: 'password-config',
                style: {
                    backgroundColor: 'white',
                    padding: '2rem',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }
            }, [
                e('h3', {
                    key: 'password-title',
                    style: {
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        color: '#111827',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }
                }, [Icons.key(), 'Políticas de Contraseñas']),

                e('div', {
                    key: 'password-settings',
                    style: {
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '1rem'
                    }
                }, [
                    e('div', { key: 'min-length' }, [
                        e('label', {
                            style: {
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '0.5rem'
                            }
                        }, 'Longitud mínima'),
                        e('input', {
                            type: 'number',
                            defaultValue: 6,
                            min: 4,
                            max: 20,
                            style: {
                                width: '100%',
                                padding: '0.75rem 1rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px'
                            }
                        })
                    ]),
                    e('div', { key: 'expiry-days' }, [
                        e('label', {
                            style: {
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '0.5rem'
                            }
                        }, 'Días para expiración'),
                        e('input', {
                            type: 'number',
                            defaultValue: 90,
                            min: 30,
                            max: 365,
                            style: {
                                width: '100%',
                                padding: '0.75rem 1rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px'
                            }
                        })
                    ])
                ])
            ]),

            // Configuración de sesiones
            e('div', {
                key: 'session-config',
                style: {
                    backgroundColor: 'white',
                    padding: '2rem',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }
            }, [
                e('h3', {
                    key: 'session-title',
                    style: {
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        color: '#111827',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }
                }, [Icons.monitor(), 'Configuración de Sesiones']),

                e('div', {
                    key: 'session-settings',
                    style: {
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '1rem'
                    }
                }, [
                    e('div', { key: 'timeout' }, [
                        e('label', {
                            style: {
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '0.5rem'
                            }
                        }, 'Timeout de sesión (minutos)'),
                        e('input', {
                            type: 'number',
                            defaultValue: 30,
                            min: 5,
                            max: 480,
                            style: {
                                width: '100%',
                                padding: '0.75rem 1rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px'
                            }
                        })
                    ]),
                    e('div', { key: 'max-sessions' }, [
                        e('label', {
                            style: {
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '0.5rem'
                            }
                        }, 'Máximo sesiones por usuario'),
                        e('input', {
                            type: 'number',
                            defaultValue: 3,
                            min: 1,
                            max: 10,
                            style: {
                                width: '100%',
                                padding: '0.75rem 1rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px'
                            }
                        })
                    ])
                ])
            ])
        ])
    ]);

    return e('div', {
        style: { maxWidth: '100%' }
    }, [
        // Header
        e('div', {
            key: 'header',
            style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem'
            }
        }, [
            e('div', { key: 'title-section' }, [
                e('h2', {
                    key: 'title',
                    style: {
                        fontSize: '1.5rem',
                        fontWeight: '600',
                        color: '#111827',
                        margin: '0 0 0.25rem 0'
                    }
                }, 'Panel de Seguridad'),
                e('p', {
                    key: 'description',
                    style: {
                        color: '#6b7280',
                        margin: '0',
                        fontSize: '0.875rem'
                    }
                }, 'Auditoría, sesiones y configuración de seguridad')
            ])
        ]),

        // Métricas de seguridad
        e('div', {
            key: 'security-metrics',
            style: {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
            }
        }, [
            e('div', {
                key: 'metric-auditoria',
                style: {
                    backgroundColor: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }
            }, [
                e('div', {
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }
                }, [
                    e('div', {}, [
                        e('p', {
                            style: {
                                fontSize: '0.875rem',
                                color: '#6b7280',
                                margin: '0 0 0.25rem 0'
                            }
                        }, 'Registros de Auditoría'),
                        e('p', {
                            style: {
                                fontSize: '1.875rem',
                                fontWeight: '700',
                                color: '#111827',
                                margin: '0'
                            }
                        }, metricas.totalAuditoria.toLocaleString())
                    ]),
                    e('div', {
                        style: {
                            padding: '0.75rem',
                            backgroundColor: '#e0e7ff',
                            borderRadius: '8px',
                            color: '#4338ca'
                        }
                    }, Icons.fileText())
                ])
            ]),

            e('div', {
                key: 'metric-sesiones',
                style: {
                    backgroundColor: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }
            }, [
                e('div', {
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }
                }, [
                    e('div', {}, [
                        e('p', {
                            style: {
                                fontSize: '0.875rem',
                                color: '#6b7280',
                                margin: '0 0 0.25rem 0'
                            }
                        }, 'Sesiones Hoy'),
                        e('p', {
                            style: {
                                fontSize: '1.875rem',
                                fontWeight: '700',
                                color: '#059669',
                                margin: '0'
                            }
                        }, metricas.sesionesHoy.toString())
                    ]),
                    e('div', {
                        style: {
                            padding: '0.75rem',
                            backgroundColor: '#d1fae5',
                            borderRadius: '8px',
                            color: '#059669'
                        }
                    }, Icons.monitor())
                ])
            ]),

            e('div', {
                key: 'metric-fallidos',
                style: {
                    backgroundColor: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }
            }, [
                e('div', {
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }
                }, [
                    e('div', {}, [
                        e('p', {
                            style: {
                                fontSize: '0.875rem',
                                color: '#6b7280',
                                margin: '0 0 0.25rem 0'
                            }
                        }, 'Intentos Fallidos'),
                        e('p', {
                            style: {
                                fontSize: '1.875rem',
                                fontWeight: '700',
                                color: '#ef4444',
                                margin: '0'
                            }
                        }, metricas.intentosFallidos.toString())
                    ]),
                    e('div', {
                        style: {
                            padding: '0.75rem',
                            backgroundColor: '#fee2e2',
                            borderRadius: '8px',
                            color: '#ef4444'
                        }
                    }, Icons.shield())
                ])
            ])
        ]),

        // Navegación por tabs
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
                    onClick: () => setActiveTab(tab.id),
                    style: {
                        flex: '1',
                        padding: '1rem 1.5rem',
                        border: 'none',
                        backgroundColor: activeTab === tab.id ? '#f9fafb' : 'transparent',
                        borderBottom: activeTab === tab.id ? '2px solid #64748b' : '2px solid transparent',
                        color: activeTab === tab.id ? '#64748b' : '#6b7280',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: activeTab === tab.id ? '600' : '500',
                        transition: 'all 0.2s'
                    }
                }, [
                    e('span', { key: `${tab.id}-icon` }, tab.icono),
                    e('span', { key: `${tab.id}-text` }, tab.nombre)
                ])
            ))
        ]),

        // Contenido de la tab activa
        e('div', {
            key: 'tab-content',
            style: { minHeight: '400px' }
        }, renderTabContent())
    ]);
}

export default SeguridadPanel;
