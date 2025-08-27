// src/resources/js/components/usuarios/seguridad/SesionesActivas.js
import React from 'react';
import Icons from '../../../utils/Icons';
import Notifications from '../../../utils/notifications';
import UserAvatar from '../common/UserAvatar';

const { createElement: e, useState, useEffect } = React;

function SesionesActivas({ embedded = false }) {
    const [loading, setLoading] = useState(false);
    const [sesiones, setSesiones] = useState([]);
    const [filtroEmpleado, setFiltroEmpleado] = useState('');
    const [empleados, setEmpleados] = useState([]);
    const [estadisticas, setEstadisticas] = useState({
        total_sesiones: 0,
        sesiones_hoy: 0,
        tiempo_promedio: '0min',
        sesiones_por_ubicacion: {}
    });
    const [mostrarDetalles, setMostrarDetalles] = useState({});
    const [confirmacionCierre, setConfirmacionCierre] = useState(null);

    // Cargar datos al montar
    useEffect(() => {
        cargarSesiones();
        cargarEmpleados();

        // Auto-refresh cada 30 segundos
        const interval = setInterval(cargarSesiones, 30000);
        return () => clearInterval(interval);
    }, []);

    // Recargar cuando cambie el filtro
    useEffect(() => {
        cargarSesiones();
    }, [filtroEmpleado]);

    // Cargar empleados para filtro
    const cargarEmpleados = async () => {
        try {
            const response = await fetch('/api/v1/empleados?situacion=1', {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setEmpleados(Array.isArray(data) ? data : data.data || []);
            }
        } catch (error) {
            console.log('Error cargando empleados:', error);
        }
    };

    // Cargar sesiones activas
    const cargarSesiones = async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams();
            if (filtroEmpleado) params.append('empleado_id', filtroEmpleado);

            const response = await fetch(`/api/v1/usuarios/sesiones-activas?${params.toString()}`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setSesiones(data.sesiones || []);
                setEstadisticas(data.estadisticas || estadisticas);
            } else {
                // Datos mock para desarrollo
                setSesiones([
                    {
                        id: 1,
                        empleado: {
                            id: 1,
                            codigo_empleado: 'EMP001',
                            persona: { nombres: 'Juan Carlos', apellidos: 'Pérez López' },
                            rol: { nombre: 'Administrador' }
                        },
                        ip: '192.168.1.100',
                        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/91.0',
                        inicio_sesion: '2024-08-26 08:30:15',
                        ultimo_acceso: '2024-08-26 14:45:22',
                        tiempo_sesion: '6h 15min',
                        ubicacion: 'Guatemala, GT',
                        dispositivo: 'Escritorio',
                        navegador: 'Chrome 91.0',
                        sesion_id: 'sess_abc123def456',
                        activa: true,
                        actividad_reciente: 'Editando reserva #RES-001'
                    },
                    {
                        id: 2,
                        empleado: {
                            id: 2,
                            codigo_empleado: 'EMP002',
                            persona: { nombres: 'María Elena', apellidos: 'García Morales' },
                            rol: { nombre: 'Operador' }
                        },
                        ip: '192.168.1.105',
                        user_agent: 'Mozilla/5.0 (Windows NT 10.0) Mobile Safari',
                        inicio_sesion: '2024-08-26 09:15:30',
                        ultimo_acceso: '2024-08-26 14:43:10',
                        tiempo_sesion: '5h 28min',
                        ubicacion: 'Guatemala, GT',
                        dispositivo: 'Móvil',
                        navegador: 'Safari Mobile',
                        sesion_id: 'sess_xyz789ghi012',
                        activa: true,
                        actividad_reciente: 'Consultando rutas'
                    },
                    {
                        id: 3,
                        empleado: {
                            id: 3,
                            codigo_empleado: 'EMP003',
                            persona: { nombres: 'Roberto', apellidos: 'Martínez Silva' },
                            rol: { nombre: 'Supervisor' }
                        },
                        ip: '192.168.1.110',
                        user_agent: 'Mozilla/5.0 Firefox/89.0',
                        inicio_sesion: '2024-08-26 07:45:00',
                        ultimo_acceso: '2024-08-26 12:20:45',
                        tiempo_sesion: '4h 35min',
                        ubicacion: 'Guatemala, GT',
                        dispositivo: 'Escritorio',
                        navegador: 'Firefox 89.0',
                        sesion_id: 'sess_mno345pqr678',
                        activa: false,
                        actividad_reciente: 'Dashboard principal'
                    }
                ]);

                setEstadisticas({
                    total_sesiones: 3,
                    sesiones_hoy: 8,
                    tiempo_promedio: '5h 12min',
                    sesiones_por_ubicacion: {
                        'Guatemala, GT': 3
                    }
                });
            }
        } catch (error) {
            console.error('Error cargando sesiones:', error);
            Notifications.error('Error al cargar sesiones activas');
        } finally {
            setLoading(false);
        }
    };

    // Cerrar sesión específica
    const cerrarSesion = async (sesionId, nombreEmpleado) => {
        try {
            const response = await fetch(`/api/v1/usuarios/sesiones/${sesionId}/cerrar`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                Notifications.success(`Sesión de ${nombreEmpleado} cerrada exitosamente`);
                cargarSesiones(); // Recargar lista
            } else {
                Notifications.error('Error al cerrar la sesión');
            }
        } catch (error) {
            console.error('Error:', error);
            Notifications.error('Error al cerrar la sesión');
        } finally {
            setConfirmacionCierre(null);
        }
    };

    // Alternar detalles de sesión
    const toggleDetalles = (sesionId) => {
        setMostrarDetalles(prev => ({
            ...prev,
            [sesionId]: !prev[sesionId]
        }));
    };

    // Formatear fecha y hora
    const formatDateTime = (dateString) => {
        if (!dateString) return '-';
        try {
            return new Date(dateString).toLocaleString('es-GT', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return dateString;
        }
    };

    // Obtener icono de dispositivo
    const getDispositivoIcon = (dispositivo) => {
        switch (dispositivo?.toLowerCase()) {
            case 'móvil':
            case 'mobile':
                return Icons.smartphone();
            case 'tablet':
                return Icons.tablet();
            default:
                return Icons.monitor();
        }
    };

    // Obtener color de estado
    const getEstadoColor = (activa, ultimoAcceso) => {
        if (!activa) return '#6b7280';

        const ahora = new Date();
        const ultimo = new Date(ultimoAcceso);
        const diferencia = (ahora - ultimo) / 1000 / 60; // minutos

        if (diferencia < 5) return '#22c55e'; // Verde - muy activa
        if (diferencia < 15) return '#f59e0b'; // Amarillo - poco activa
        return '#ef4444'; // Rojo - inactiva
    };

    return e('div', {
        style: embedded ? {} : {
            padding: '1.5rem',
            maxWidth: '100%',
            minHeight: '100vh'
        }
    }, [
        // Header (solo si no está embebido)
        !embedded && e('div', {
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
                    justifyContent: 'space-between',
                    marginBottom: '0.5rem'
                }
            }, [
                e('div', {
                    key: 'title-content',
                    style: { display: 'flex', alignItems: 'center', gap: '0.75rem' }
                }, [
                    e('div', {
                        key: 'icon-container',
                        style: {
                            padding: '0.75rem',
                            backgroundColor: '#059669',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            color: 'white'
                        }
                    }, Icons.monitor()),
                    e('div', { key: 'title-text' }, [
                        e('h1', {
                            key: 'main-title',
                            style: {
                                fontSize: '1.875rem',
                                fontWeight: '700',
                                color: '#111827',
                                margin: '0',
                                lineHeight: '1.2'
                            }
                        }, 'Sesiones Activas'),
                        e('p', {
                            key: 'description',
                            style: {
                                color: '#6b7280',
                                margin: '0.25rem 0 0 0',
                                fontSize: '1rem'
                            }
                        }, 'Control en tiempo real de usuarios conectados')
                    ])
                ]),
                e('button', {
                    key: 'refresh-btn',
                    onClick: cargarSesiones,
                    style: {
                        padding: '0.75rem 1rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        backgroundColor: 'white',
                        color: '#374151',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.875rem'
                    }
                }, [Icons.refresh(), 'Actualizar'])
            ])
        ]),

        // Estadísticas
        e('div', {
            key: 'stats',
            style: {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
            }
        }, [
            e('div', {
                key: 'stat-total',
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
                        }, 'Sesiones Activas'),
                        e('p', {
                            style: {
                                fontSize: '1.875rem',
                                fontWeight: '700',
                                color: '#059669',
                                margin: '0'
                            }
                        }, estadisticas.total_sesiones.toString())
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
                key: 'stat-hoy',
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
                        }, 'Accesos Hoy'),
                        e('p', {
                            style: {
                                fontSize: '1.875rem',
                                fontWeight: '700',
                                color: '#3b82f6',
                                margin: '0'
                            }
                        }, estadisticas.sesiones_hoy.toString())
                    ]),
                    e('div', {
                        style: {
                            padding: '0.75rem',
                            backgroundColor: '#dbeafe',
                            borderRadius: '8px',
                            color: '#3b82f6'
                        }
                    }, Icons.calendar())
                ])
            ]),

            e('div', {
                key: 'stat-promedio',
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
                        }, 'Tiempo Promedio'),
                        e('p', {
                            style: {
                                fontSize: '1.875rem',
                                fontWeight: '700',
                                color: '#7c3aed',
                                margin: '0'
                            }
                        }, estadisticas.tiempo_promedio)
                    ]),
                    e('div', {
                        style: {
                            padding: '0.75rem',
                            backgroundColor: '#ede9fe',
                            borderRadius: '8px',
                            color: '#7c3aed'
                        }
                    }, Icons.clock())
                ])
            ])
        ]),

        // Filtros
        e('div', {
            key: 'filters',
            style: {
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                marginBottom: '1.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }
        }, [
            e('div', {
                key: 'filter-row',
                style: { display: 'flex', gap: '1rem', alignItems: 'end' }
            }, [
                e('div', {
                    key: 'filter-empleado',
                    style: { flex: '1' }
                }, [
                    e('label', {
                        key: 'empleado-label',
                        style: {
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }
                    }, 'Filtrar por empleado'),
                    e('select', {
                        key: 'empleado-select',
                        value: filtroEmpleado,
                        onChange: (e) => setFiltroEmpleado(e.target.value),
                        style: {
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '0.875rem'
                        }
                    }, [
                        e('option', { key: 'todos', value: '' }, 'Todos los empleados'),
                        ...empleados.map(emp =>
                            e('option', {
                                key: emp.id,
                                value: emp.id.toString()
                            }, `${emp.persona?.nombres} ${emp.persona?.apellidos} (${emp.codigo_empleado})`)
                        )
                    ])
                ]),
                e('button', {
                    key: 'clear-filter',
                    onClick: () => setFiltroEmpleado(''),
                    style: {
                        padding: '0.75rem 1rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        backgroundColor: 'white',
                        color: '#374151',
                        cursor: 'pointer',
                        fontSize: '0.875rem'
                    }
                }, 'Limpiar')
            ])
        ]),

        // Lista de sesiones
        e('div', {
            key: 'sessions-list',
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
                        borderTop: '3px solid #059669',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 1rem'
                    }
                }),
                e('p', { style: { color: '#6b7280' } }, 'Actualizando sesiones...')
            ]) : sesiones.length > 0 ? sesiones.map((sesion, index) =>
                e('div', {
                    key: `session-${sesion.id}`,
                    style: {
                        borderBottom: index < sesiones.length - 1 ? '1px solid #f3f4f6' : 'none'
                    }
                }, [
                    // Información principal de la sesión
                    e('div', {
                        key: 'session-main',
                        style: {
                            padding: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }
                    }, [
                        e('div', {
                            key: 'session-user',
                            style: { display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }
                        }, [
                            // Avatar con indicador de estado
                            e('div', {
                                key: 'avatar-container',
                                style: { position: 'relative' }
                            }, [
                                e(UserAvatar, {
                                    key: 'avatar',
                                    empleado: sesion.empleado,
                                    size: '56px'
                                }),
                                e('div', {
                                    key: 'status-indicator',
                                    style: {
                                        position: 'absolute',
                                        bottom: '2px',
                                        right: '2px',
                                        width: '16px',
                                        height: '16px',
                                        borderRadius: '50%',
                                        backgroundColor: getEstadoColor(sesion.activa, sesion.ultimo_acceso),
                                        border: '2px solid white',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                    }
                                })
                            ]),

                            // Información del usuario
                            e('div', { key: 'user-info', style: { flex: 1 } }, [
                                e('h4', {
                                    key: 'user-name',
                                    style: {
                                        fontSize: '1.125rem',
                                        fontWeight: '600',
                                        color: '#111827',
                                        margin: '0 0 0.25rem 0'
                                    }
                                }, `${sesion.empleado?.persona?.nombres} ${sesion.empleado?.persona?.apellidos}`),
                                e('div', {
                                    key: 'user-details',
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        flexWrap: 'wrap'
                                    }
                                }, [
                                    e('span', {
                                        key: 'codigo',
                                        style: {
                                            fontSize: '0.875rem',
                                            color: '#6b7280'
                                        }
                                    }, sesion.empleado?.codigo_empleado),
                                    e('span', {
                                        key: 'rol',
                                        style: {
                                            fontSize: '0.75rem',
                                            padding: '0.25rem 0.5rem',
                                            backgroundColor: '#e0e7ff',
                                            color: '#4338ca',
                                            borderRadius: '4px'
                                        }
                                    }, sesion.empleado?.rol?.nombre),
                                    e('div', {
                                        key: 'device-info',
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.25rem',
                                            fontSize: '0.875rem',
                                            color: '#6b7280'
                                        }
                                    }, [
                                        getDispositivoIcon(sesion.dispositivo),
                                        sesion.dispositivo
                                    ])
                                ])
                            ]),

                            // Información de sesión
                            e('div', {
                                key: 'session-info',
                                style: {
                                    textAlign: 'right',
                                    minWidth: '150px'
                                }
                            }, [
                                e('p', {
                                    key: 'tiempo-sesion',
                                    style: {
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        color: '#059669',
                                        margin: '0 0 0.25rem 0'
                                    }
                                }, sesion.tiempo_sesion),
                                e('p', {
                                    key: 'ultimo-acceso',
                                    style: {
                                        fontSize: '0.75rem',
                                        color: '#6b7280',
                                        margin: '0',
                                        fontFamily: 'monospace'
                                    }
                                }, `Último acceso: ${formatDateTime(sesion.ultimo_acceso)}`),
                                sesion.actividad_reciente && e('p', {
                                    key: 'actividad',
                                    style: {
                                        fontSize: '0.75rem',
                                        color: '#7c3aed',
                                        margin: '0.25rem 0 0 0',
                                        fontStyle: 'italic'
                                    }
                                }, sesion.actividad_reciente)
                            ])
                        ]),

                        // Botones de acción
                        e('div', {
                            key: 'session-actions',
                            style: {
                                display: 'flex',
                                gap: '0.5rem',
                                alignItems: 'center',
                                marginLeft: '1rem'
                            }
                        }, [
                            e('button', {
                                key: 'toggle-details',
                                onClick: () => toggleDetalles(sesion.id),
                                style: {
                                    padding: '0.5rem 0.75rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    backgroundColor: 'white',
                                    color: '#374151',
                                    fontSize: '0.875rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem'
                                }
                            }, [
                                mostrarDetalles[sesion.id] ? Icons.chevronUp() : Icons.chevronDown(),
                                'Detalles'
                            ]),
                            e('button', {
                                key: 'close-session',
                                onClick: () => setConfirmacionCierre({
                                    id: sesion.id,
                                    nombre: `${sesion.empleado?.persona?.nombres} ${sesion.empleado?.persona?.apellidos}`,
                                    codigo: sesion.empleado?.codigo_empleado
                                }),
                                style: {
                                    padding: '0.5rem 0.75rem',
                                    border: 'none',
                                    borderRadius: '6px',
                                    backgroundColor: '#ef4444',
                                    color: 'white',
                                    fontSize: '0.875rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem'
                                }
                            }, [Icons.x(), 'Cerrar'])
                        ])
                    ]),

                    // Detalles expandibles
                    mostrarDetalles[sesion.id] && e('div', {
                        key: 'session-details',
                        style: {
                            padding: '0 1.5rem 1.5rem',
                            backgroundColor: '#f9fafb',
                            borderTop: '1px solid #e5e7eb'
                        }
                    }, [
                        e('div', {
                            key: 'details-grid',
                            style: {
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                                gap: '1.5rem'
                            }
                        }, [
                            // Información de conexión
                            e('div', { key: 'connection-info' }, [
                                e('h5', {
                                    key: 'connection-title',
                                    style: {
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        color: '#374151',
                                        marginBottom: '0.75rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }
                                }, [Icons.globe(), 'Información de Conexión']),
                                e('div', {
                                    key: 'connection-details',
                                    style: { display: 'flex', flexDirection: 'column', gap: '0.5rem' }
                                }, [
                                    e('div', {
                                        key: 'ip-detail',
                                        style: { display: 'flex', justifyContent: 'space-between' }
                                    }, [
                                        e('span', {
                                            style: { fontSize: '0.875rem', color: '#6b7280' }
                                        }, 'Dirección IP:'),
                                        e('span', {
                                            style: {
                                                fontSize: '0.875rem',
                                                color: '#111827',
                                                fontFamily: 'monospace'
                                            }
                                        }, sesion.ip)
                                    ]),
                                    e('div', {
                                        key: 'ubicacion-detail',
                                        style: { display: 'flex', justifyContent: 'space-between' }
                                    }, [
                                        e('span', {
                                            style: { fontSize: '0.875rem', color: '#6b7280' }
                                        }, 'Ubicación:'),
                                        e('span', {
                                            style: { fontSize: '0.875rem', color: '#111827' }
                                        }, sesion.ubicacion || 'No detectada')
                                    ]),
                                    e('div', {
                                        key: 'navegador-detail',
                                        style: { display: 'flex', justifyContent: 'space-between' }
                                    }, [
                                        e('span', {
                                            style: { fontSize: '0.875rem', color: '#6b7280' }
                                        }, 'Navegador:'),
                                        e('span', {
                                            style: { fontSize: '0.875rem', color: '#111827' }
                                        }, sesion.navegador)
                                    ])
                                ])
                            ]),

                            // Información de sesión
                            e('div', { key: 'session-timing' }, [
                                e('h5', {
                                    key: 'timing-title',
                                    style: {
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        color: '#374151',
                                        marginBottom: '0.75rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }
                                }, [Icons.clock(), 'Información de Sesión']),
                                e('div', {
                                    key: 'timing-details',
                                    style: { display: 'flex', flexDirection: 'column', gap: '0.5rem' }
                                }, [
                                    e('div', {
                                        key: 'inicio-detail',
                                        style: { display: 'flex', justifyContent: 'space-between' }
                                    }, [
                                        e('span', {
                                            style: { fontSize: '0.875rem', color: '#6b7280' }
                                        }, 'Inicio:'),
                                        e('span', {
                                            style: {
                                                fontSize: '0.875rem',
                                                color: '#111827',
                                                fontFamily: 'monospace'
                                            }
                                        }, formatDateTime(sesion.inicio_sesion))
                                    ]),
                                    e('div', {
                                        key: 'duracion-detail',
                                        style: { display: 'flex', justifyContent: 'space-between' }
                                    }, [
                                        e('span', {
                                            style: { fontSize: '0.875rem', color: '#6b7280' }
                                        }, 'Duración:'),
                                        e('span', {
                                            style: {
                                                fontSize: '0.875rem',
                                                color: '#059669',
                                                fontWeight: '600'
                                            }
                                        }, sesion.tiempo_sesion)
                                    ]),
                                    e('div', {
                                        key: 'sesion-id-detail',
                                        style: { display: 'flex', justifyContent: 'space-between' }
                                    }, [
                                        e('span', {
                                            style: { fontSize: '0.875rem', color: '#6b7280' }
                                        }, 'ID Sesión:'),
                                        e('span', {
                                            style: {
                                                fontSize: '0.75rem',
                                                color: '#6b7280',
                                                fontFamily: 'monospace'
                                            }
                                        }, sesion.sesion_id)
                                    ])
                                ])
                            ]),

                            // User Agent completo
                            e('div', { key: 'user-agent-info' }, [
                                e('h5', {
                                    key: 'agent-title',
                                    style: {
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        color: '#374151',
                                        marginBottom: '0.75rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }
                                }, [Icons.smartphone(), 'Información del Cliente']),
                                e('p', {
                                    key: 'user-agent-text',
                                    style: {
                                        fontSize: '0.75rem',
                                        color: '#6b7280',
                                        fontFamily: 'monospace',
                                        backgroundColor: '#f3f4f6',
                                        padding: '0.75rem',
                                        borderRadius: '6px',
                                        margin: '0',
                                        wordBreak: 'break-all'
                                    }
                                }, sesion.user_agent)
                            ])
                        ])
                    ])
                ])
            ) : e('div', {
                key: 'no-sessions',
                style: {
                    padding: '3rem',
                    textAlign: 'center'
                }
            }, [
                e('div', {
                    key: 'no-sessions-icon',
                    style: {
                        fontSize: '3rem',
                        color: '#d1d5db',
                        marginBottom: '1rem'
                    }
                }, Icons.monitor()),
                e('h3', {
                    key: 'no-sessions-title',
                    style: {
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        color: '#374151',
                        margin: '0 0 0.5rem 0'
                    }
                }, 'No hay sesiones activas'),
                e('p', {
                    key: 'no-sessions-text',
                    style: {
                        color: '#6b7280',
                        margin: '0'
                    }
                }, 'Todos los usuarios han cerrado sesión o no hay usuarios conectados en este momento.')
            ])
        ]),

        // Modal de confirmación para cerrar sesión
        confirmacionCierre && e('div', {
            key: 'confirm-modal',
            style: {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000
            }
        }, [
            e('div', {
                key: 'confirm-content',
                style: {
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '2rem',
                    maxWidth: '400px',
                    margin: '1rem',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                }
            }, [
                e('div', {
                    key: 'confirm-header',
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginBottom: '1rem'
                    }
                }, [
                    e('div', {
                        key: 'warning-icon',
                        style: {
                            padding: '0.5rem',
                            backgroundColor: '#fef3c7',
                            borderRadius: '8px',
                            color: '#d97706'
                        }
                    }, Icons.alertTriangle()),
                    e('h3', {
                        key: 'confirm-title',
                        style: {
                            fontSize: '1.125rem',
                            fontWeight: '600',
                            color: '#111827',
                            margin: '0'
                        }
                    }, 'Confirmar Cierre de Sesión')
                ]),

                e('div', {
                    key: 'confirm-message',
                    style: { marginBottom: '1.5rem' }
                }, [
                    e('p', {
                        key: 'confirm-text',
                        style: {
                            color: '#6b7280',
                            margin: '0 0 1rem 0'
                        }
                    }, 'Estás a punto de cerrar la sesión de:'),
                    e('div', {
                        key: 'user-info-confirm',
                        style: {
                            padding: '1rem',
                            backgroundColor: '#f9fafb',
                            borderRadius: '8px',
                            border: '1px solid #e5e7eb'
                        }
                    }, [
                        e('p', {
                            key: 'user-name-confirm',
                            style: {
                                fontSize: '1rem',
                                fontWeight: '600',
                                color: '#111827',
                                margin: '0'
                            }
                        }, confirmacionCierre.nombre),
                        e('p', {
                            key: 'user-code-confirm',
                            style: {
                                fontSize: '0.875rem',
                                color: '#6b7280',
                                margin: '0.25rem 0 0 0'
                            }
                        }, confirmacionCierre.codigo)
                    ]),
                    e('p', {
                        key: 'warning-text',
                        style: {
                            fontSize: '0.875rem',
                            color: '#d97706',
                            margin: '1rem 0 0 0',
                            fontWeight: '500'
                        }
                    }, 'El usuario será desconectado inmediatamente y deberá iniciar sesión nuevamente.')
                ]),

                e('div', {
                    key: 'confirm-actions',
                    style: {
                        display: 'flex',
                        gap: '0.75rem',
                        justifyContent: 'flex-end'
                    }
                }, [
                    e('button', {
                        key: 'cancel-btn',
                        onClick: () => setConfirmacionCierre(null),
                        style: {
                            padding: '0.75rem 1rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            backgroundColor: 'white',
                            color: '#374151',
                            fontSize: '0.875rem',
                            cursor: 'pointer'
                        }
                    }, 'Cancelar'),
                    e('button', {
                        key: 'confirm-btn',
                        onClick: () => cerrarSesion(confirmacionCierre.id, confirmacionCierre.nombre),
                        style: {
                            padding: '0.75rem 1rem',
                            border: 'none',
                            borderRadius: '8px',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            fontWeight: '600'
                        }
                    }, 'Cerrar Sesión')
                ])
            ])
        ])
    ]);
}

export default SesionesActivas;
