// src/resources/js/components/usuarios/seguridad/AccesosLog.js
import React from 'react';
import Icons from '../../../utils/Icons';
import Notifications from '../../../utils/notifications';
import UserAvatar from '../common/UserAvatar';

const { createElement: e, useState, useEffect } = React;

function AccesosLog({ onClose, empleadoId = null }) {
    const [loading, setLoading] = useState(false);
    const [accesos, setAccesos] = useState([]);
    const [filtros, setFiltros] = useState({
        empleado_id: empleadoId || '',
        tipo_acceso: 'todos',
        fecha_desde: '',
        fecha_hasta: '',
        ip: '',
        resultado: 'todos'
    });
    const [empleados, setEmpleados] = useState([]);
    const [paginacion, setPaginacion] = useState({
        pagina_actual: 1,
        por_pagina: 25,
        total: 0,
        total_paginas: 0
    });

    // Cargar datos al montar
    useEffect(() => {
        cargarEmpleados();
        cargarAccesos();
    }, []);

    // Recargar cuando cambien los filtros o paginación
    useEffect(() => {
        cargarAccesos();
    }, [filtros, paginacion.pagina_actual]);

    // Cargar lista de empleados para filtro
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

    // Cargar registros de accesos
    const cargarAccesos = async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams({
                pagina: paginacion.pagina_actual.toString(),
                por_pagina: paginacion.por_pagina.toString()
            });

            // Agregar filtros activos
            Object.entries(filtros).forEach(([key, value]) => {
                if (value && value !== 'todos' && value !== '') {
                    params.append(key, value);
                }
            });

            const response = await fetch(`/api/v1/auditoria/accesos?${params.toString()}`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setAccesos(data.data || []);
                setPaginacion(prev => ({
                    ...prev,
                    total: data.total || 0,
                    total_paginas: data.last_page || 0
                }));
            }
        } catch (error) {
            console.error('Error cargando accesos:', error);
            // Datos mock para desarrollo
            setAccesos([
                {
                    id: 1,
                    empleado: {
                        codigo_empleado: 'EMP001',
                        persona: { nombres: 'Juan', apellidos: 'Pérez' }
                    },
                    accion: 'login',
                    ip: '192.168.1.100',
                    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    resultado: 'exitoso',
                    created_at: '2024-08-26 08:30:15',
                    duracion_sesion: '2h 45min',
                    ubicacion: 'Guatemala, GT'
                },
                {
                    id: 2,
                    empleado: null,
                    accion: 'login',
                    ip: '192.168.1.105',
                    user_agent: 'Mozilla/5.0 Chrome/91.0',
                    resultado: 'fallido',
                    created_at: '2024-08-26 07:15:30',
                    motivo_fallo: 'Contraseña incorrecta',
                    intentos: 3
                }
            ]);
            setPaginacion(prev => ({ ...prev, total: 2, total_paginas: 1 }));
        } finally {
            setLoading(false);
        }
    };

    // Manejar cambio de filtros
    const handleFiltroChange = (campo, valor) => {
        setFiltros(prev => ({ ...prev, [campo]: valor }));
        setPaginacion(prev => ({ ...prev, pagina_actual: 1 }));
    };

    // Limpiar filtros
    const limpiarFiltros = () => {
        setFiltros({
            empleado_id: empleadoId || '',
            tipo_acceso: 'todos',
            fecha_desde: '',
            fecha_hasta: '',
            ip: '',
            resultado: 'todos'
        });
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
                minute: '2-digit',
                second: '2-digit'
            });
        } catch (e) {
            return dateString;
        }
    };

    // Obtener color según resultado
    const getResultadoColor = (resultado) => {
        const colores = {
            'exitoso': '#22c55e',
            'fallido': '#ef4444',
            'bloqueado': '#f59e0b',
            'timeout': '#6b7280'
        };
        return colores[resultado] || '#6b7280';
    };

    // Obtener icono según acción
    const getAccionIcon = (accion) => {
        switch (accion) {
            case 'login': return Icons.login();
            case 'logout': return Icons.logout();
            case 'view': return Icons.eye();
            case 'export': return Icons.download();
            default: return Icons.activity();
        }
    };

    // Cambiar página
    const cambiarPagina = (nuevaPagina) => {
        if (nuevaPagina >= 1 && nuevaPagina <= paginacion.total_paginas) {
            setPaginacion(prev => ({ ...prev, pagina_actual: nuevaPagina }));
        }
    };

    return e('div', {
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
            zIndex: 1000,
            padding: '1rem'
        }
    }, [
        e('div', {
            key: 'modal-content',
            style: {
                backgroundColor: 'white',
                borderRadius: '16px',
                maxWidth: '95vw',
                maxHeight: '95vh',
                width: '1200px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }
        }, [
            // Header del modal
            e('div', {
                key: 'modal-header',
                style: {
                    padding: '1.5rem',
                    borderBottom: '1px solid #e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#f9fafb'
                }
            }, [
                e('div', {
                    key: 'header-content',
                    style: { display: 'flex', alignItems: 'center', gap: '0.75rem' }
                }, [
                    e('div', {
                        key: 'header-icon',
                        style: {
                            padding: '0.5rem',
                            backgroundColor: '#dbeafe',
                            borderRadius: '8px',
                            color: '#3b82f6'
                        }
                    }, Icons.fileText()),
                    e('div', { key: 'header-text' }, [
                        e('h3', {
                            key: 'title',
                            style: {
                                fontSize: '1.25rem',
                                fontWeight: '600',
                                color: '#111827',
                                margin: '0'
                            }
                        }, 'Registro de Accesos'),
                        e('p', {
                            key: 'subtitle',
                            style: {
                                fontSize: '0.875rem',
                                color: '#6b7280',
                                margin: '0.25rem 0 0 0'
                            }
                        }, `${paginacion.total} registros encontrados`)
                    ])
                ]),
                e('button', {
                    key: 'close-btn',
                    onClick: onClose,
                    style: {
                        padding: '0.5rem',
                        border: 'none',
                        backgroundColor: 'transparent',
                        color: '#6b7280',
                        cursor: 'pointer',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center'
                    },
                    onMouseEnter: (e) => {
                        e.target.style.backgroundColor = '#f3f4f6';
                        e.target.style.color = '#374151';
                    },
                    onMouseLeave: (e) => {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.color = '#6b7280';
                    }
                }, Icons.x())
            ]),

            // Filtros
            e('div', {
                key: 'filtros-section',
                style: {
                    padding: '1.5rem',
                    backgroundColor: '#f9fafb',
                    borderBottom: '1px solid #e5e7eb'
                }
            }, [
                e('div', {
                    key: 'filtros-grid',
                    style: {
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem',
                        marginBottom: '1rem'
                    }
                }, [
                    // Filtro empleado
                    e('div', { key: 'filter-empleado' }, [
                        e('label', {
                            key: 'empleado-label',
                            style: {
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '0.5rem'
                            }
                        }, 'Empleado'),
                        e('select', {
                            key: 'empleado-select',
                            value: filtros.empleado_id,
                            onChange: (e) => handleFiltroChange('empleado_id', e.target.value),
                            style: {
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '0.875rem'
                            }
                        }, [
                            e('option', { key: 'todos-empleados', value: '' }, 'Todos los empleados'),
                            ...empleados.map(emp =>
                                e('option', {
                                    key: emp.id,
                                    value: emp.id.toString()
                                }, `${emp.persona?.nombres} ${emp.persona?.apellidos} (${emp.codigo_empleado})`)
                            )
                        ])
                    ]),

                    // Filtro tipo de acceso
                    e('div', { key: 'filter-tipo' }, [
                        e('label', {
                            key: 'tipo-label',
                            style: {
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '0.5rem'
                            }
                        }, 'Tipo de Acceso'),
                        e('select', {
                            key: 'tipo-select',
                            value: filtros.tipo_acceso,
                            onChange: (e) => handleFiltroChange('tipo_acceso', e.target.value),
                            style: {
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '0.875rem'
                            }
                        }, [
                            e('option', { key: 'todos-tipos', value: 'todos' }, 'Todos'),
                            e('option', { key: 'login', value: 'login' }, 'Inicio de Sesión'),
                            e('option', { key: 'logout', value: 'logout' }, 'Cierre de Sesión'),
                            e('option', { key: 'view', value: 'view' }, 'Consultas'),
                            e('option', { key: 'export', value: 'export' }, 'Exportaciones')
                        ])
                    ]),

                    // Filtro resultado
                    e('div', { key: 'filter-resultado' }, [
                        e('label', {
                            key: 'resultado-label',
                            style: {
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '0.5rem'
                            }
                        }, 'Resultado'),
                        e('select', {
                            key: 'resultado-select',
                            value: filtros.resultado,
                            onChange: (e) => handleFiltroChange('resultado', e.target.value),
                            style: {
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '0.875rem'
                            }
                        }, [
                            e('option', { key: 'todos-resultados', value: 'todos' }, 'Todos'),
                            e('option', { key: 'exitoso', value: 'exitoso' }, 'Exitoso'),
                            e('option', { key: 'fallido', value: 'fallido' }, 'Fallido'),
                            e('option', { key: 'bloqueado', value: 'bloqueado' }, 'Bloqueado')
                        ])
                    ]),

                    // Filtro fecha desde
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
                        }, 'Desde'),
                        e('input', {
                            key: 'fecha-desde-input',
                            type: 'date',
                            value: filtros.fecha_desde,
                            onChange: (e) => handleFiltroChange('fecha_desde', e.target.value),
                            style: {
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '0.875rem'
                            }
                        })
                    ]),

                    // Filtro fecha hasta
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
                        }, 'Hasta'),
                        e('input', {
                            key: 'fecha-hasta-input',
                            type: 'date',
                            value: filtros.fecha_hasta,
                            onChange: (e) => handleFiltroChange('fecha_hasta', e.target.value),
                            style: {
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '0.875rem'
                            }
                        })
                    ]),

                    // Filtro IP
                    e('div', { key: 'filter-ip' }, [
                        e('label', {
                            key: 'ip-label',
                            style: {
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '0.5rem'
                            }
                        }, 'Dirección IP'),
                        e('input', {
                            key: 'ip-input',
                            type: 'text',
                            value: filtros.ip,
                            onChange: (e) => handleFiltroChange('ip', e.target.value),
                            placeholder: '192.168.1.100',
                            style: {
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '0.875rem'
                            }
                        })
                    ])
                ]),

                // Botones de acción
                e('div', {
                    key: 'filter-actions',
                    style: { display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }
                }, [
                    e('button', {
                        key: 'btn-limpiar',
                        onClick: limpiarFiltros,
                        style: {
                            padding: '0.75rem 1rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            backgroundColor: 'white',
                            color: '#374151',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }
                    }, [Icons.refresh(), 'Limpiar']),
                    e('button', {
                        key: 'btn-filtrar',
                        onClick: cargarAccesos,
                        style: {
                            padding: '0.75rem 1rem',
                            border: 'none',
                            borderRadius: '8px',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }
                    }, [Icons.search(), 'Filtrar'])
                ])
            ]),

            // Contenido principal
            e('div', {
                key: 'content',
                style: {
                    flex: 1,
                    overflow: 'auto',
                    padding: '1.5rem'
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
                            borderTop: '3px solid #3b82f6',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            margin: '0 auto 1rem'
                        }
                    }),
                    e('p', { style: { color: '#6b7280' } }, 'Cargando registros de acceso...')
                ]) : e('div', { key: 'table-container' }, [
                    e('div', {
                        key: 'table-wrapper',
                        style: { overflow: 'auto', marginBottom: '1rem' }
                    }, [
                        e('table', {
                            key: 'accesos-table',
                            style: { width: '100%', borderCollapse: 'collapse' }
                        }, [
                            e('thead', {
                                key: 'table-head',
                                style: { backgroundColor: '#f9fafb', position: 'sticky', top: 0 }
                            }, [
                                e('tr', { key: 'header-row' }, [
                                    e('th', {
                                        style: {
                                            padding: '0.75rem',
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
                                            padding: '0.75rem',
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
                                            padding: '0.75rem',
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
                                            padding: '0.75rem',
                                            textAlign: 'left',
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            color: '#374151',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            borderBottom: '1px solid #e5e7eb'
                                        }
                                    }, 'Resultado'),
                                    e('th', {
                                        style: {
                                            padding: '0.75rem',
                                            textAlign: 'left',
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            color: '#374151',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            borderBottom: '1px solid #e5e7eb'
                                        }
                                    }, 'IP / Ubicación'),
                                    e('th', {
                                        style: {
                                            padding: '0.75rem',
                                            textAlign: 'left',
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            color: '#374151',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            borderBottom: '1px solid #e5e7eb'
                                        }
                                    }, 'Detalles')
                                ])
                            ]),
                            e('tbody', { key: 'table-body' },
                                accesos.length > 0 ? accesos.map((acceso, index) =>
                                    e('tr', {
                                        key: `acceso-${index}`,
                                        style: {
                                            borderBottom: '1px solid #f3f4f6'
                                        },
                                        onMouseEnter: (e) => e.currentTarget.style.backgroundColor = '#f9fafb',
                                        onMouseLeave: (e) => e.currentTarget.style.backgroundColor = 'transparent'
                                    }, [
                                        // Fecha
                                        e('td', {
                                            key: 'fecha',
                                            style: {
                                                padding: '1rem 0.75rem',
                                                fontSize: '0.875rem',
                                                fontFamily: 'monospace'
                                            }
                                        }, formatDateTime(acceso.created_at)),

                                        // Usuario
                                        e('td', {
                                            key: 'usuario',
                                            style: { padding: '1rem 0.75rem' }
                                        }, [
                                            acceso.empleado ? e('div', {
                                                key: 'user-info',
                                                style: { display: 'flex', alignItems: 'center', gap: '0.5rem' }
                                            }, [
                                                e(UserAvatar, {
                                                    key: 'avatar',
                                                    empleado: acceso.empleado,
                                                    size: '32px'
                                                }),
                                                e('div', { key: 'user-details' }, [
                                                    e('p', {
                                                        key: 'name',
                                                        style: {
                                                            fontSize: '0.875rem',
                                                            fontWeight: '500',
                                                            margin: '0',
                                                            color: '#111827'
                                                        }
                                                    }, `${acceso.empleado.persona?.nombres} ${acceso.empleado.persona?.apellidos}`),
                                                    e('p', {
                                                        key: 'code',
                                                        style: {
                                                            fontSize: '0.75rem',
                                                            color: '#6b7280',
                                                            margin: '0'
                                                        }
                                                    }, acceso.empleado.codigo_empleado)
                                                ])
                                            ]) : e('span', {
                                                style: {
                                                    color: '#ef4444',
                                                    fontSize: '0.875rem',
                                                    fontStyle: 'italic'
                                                }
                                            }, 'Usuario no identificado')
                                        ]),

                                        // Acción
                                        e('td', {
                                            key: 'accion',
                                            style: { padding: '1rem 0.75rem' }
                                        }, [
                                            e('div', {
                                                style: { display: 'flex', alignItems: 'center', gap: '0.5rem' }
                                            }, [
                                                e('span', {
                                                    style: {
                                                        color: '#6b7280',
                                                        fontSize: '0.875rem'
                                                    }
                                                }, getAccionIcon(acceso.accion)),
                                                e('span', {
                                                    style: {
                                                        fontSize: '0.875rem',
                                                        textTransform: 'capitalize'
                                                    }
                                                }, acceso.accion)
                                            ])
                                        ]),

                                        // Resultado
                                        e('td', {
                                            key: 'resultado',
                                            style: { padding: '1rem 0.75rem' }
                                        }, [
                                            e('span', {
                                                style: {
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '6px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '500',
                                                    backgroundColor: getResultadoColor(acceso.resultado) + '20',
                                                    color: getResultadoColor(acceso.resultado),
                                                    textTransform: 'capitalize'
                                                }
                                            }, acceso.resultado)
                                        ]),

                                        // IP / Ubicación
                                        e('td', {
                                            key: 'ip-ubicacion',
                                            style: { padding: '1rem 0.75rem' }
                                        }, [
                                            e('div', { key: 'ip-info' }, [
                                                e('p', {
                                                    key: 'ip',
                                                    style: {
                                                        fontSize: '0.875rem',
                                                        fontFamily: 'monospace',
                                                        margin: '0',
                                                        color: '#111827'
                                                    }
                                                }, acceso.ip || '-'),
                                                acceso.ubicacion && e('p', {
                                                    key: 'ubicacion',
                                                    style: {
                                                        fontSize: '0.75rem',
                                                        color: '#6b7280',
                                                        margin: '0.25rem 0 0 0'
                                                    }
                                                }, acceso.ubicacion)
                                            ])
                                        ]),

                                        // Detalles
                                        e('td', {
                                            key: 'detalles',
                                            style: { padding: '1rem 0.75rem' }
                                        }, [
                                            e('div', { key: 'details-info' }, [
                                                acceso.duracion_sesion && e('p', {
                                                    key: 'duracion',
                                                    style: {
                                                        fontSize: '0.75rem',
                                                        color: '#059669',
                                                        margin: '0'
                                                    }
                                                }, `Duración: ${acceso.duracion_sesion}`),
                                                acceso.motivo_fallo && e('p', {
                                                    key: 'motivo',
                                                    style: {
                                                        fontSize: '0.75rem',
                                                        color: '#ef4444',
                                                        margin: '0'
                                                    }
                                                }, `Error: ${acceso.motivo_fallo}`),
                                                acceso.intentos && acceso.intentos > 1 && e('p', {
                                                    key: 'intentos',
                                                    style: {
                                                        fontSize: '0.75rem',
                                                        color: '#f59e0b',
                                                        margin: '0'
                                                    }
                                                }, `${acceso.intentos} intentos`)
                                            ])
                                        ])
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
                                        }, 'No hay registros de acceso que coincidan con los filtros')
                                    ])
                                ]
                            )
                        ])
                    ])
                ])
            ]),

            // Footer con paginación
            paginacion.total > 0 && e('div', {
                key: 'modal-footer',
                style: {
                    padding: '1rem 1.5rem',
                    borderTop: '1px solid #e5e7eb',
                    backgroundColor: '#f9fafb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }
            }, [
                e('p', {
                    key: 'pagination-info',
                    style: {
                        fontSize: '0.875rem',
                        color: '#6b7280',
                        margin: '0'
                    }
                }, `Mostrando ${((paginacion.pagina_actual - 1) * paginacion.por_pagina) + 1}-${Math.min(paginacion.pagina_actual * paginacion.por_pagina, paginacion.total)} de ${paginacion.total} registros`),

                e('div', {
                    key: 'pagination-controls',
                    style: { display: 'flex', gap: '0.5rem', alignItems: 'center' }
                }, [
                    e('button', {
                        key: 'prev-btn',
                        onClick: () => cambiarPagina(paginacion.pagina_actual - 1),
                        disabled: paginacion.pagina_actual <= 1,
                        style: {
                            padding: '0.5rem 0.75rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            backgroundColor: paginacion.pagina_actual <= 1 ? '#f9fafb' : 'white',
                            color: paginacion.pagina_actual <= 1 ? '#9ca3af' : '#374151',
                            cursor: paginacion.pagina_actual <= 1 ? 'not-allowed' : 'pointer',
                            fontSize: '0.875rem'
                        }
                    }, 'Anterior'),

                    e('span', {
                        key: 'page-info',
                        style: {
                            fontSize: '0.875rem',
                            color: '#374151',
                            padding: '0 1rem'
                        }
                    }, `Página ${paginacion.pagina_actual} de ${paginacion.total_paginas}`),

                    e('button', {
                        key: 'next-btn',
                        onClick: () => cambiarPagina(paginacion.pagina_actual + 1),
                        disabled: paginacion.pagina_actual >= paginacion.total_paginas,
                        style: {
                            padding: '0.5rem 0.75rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            backgroundColor: paginacion.pagina_actual >= paginacion.total_paginas ? '#f9fafb' : 'white',
                            color: paginacion.pagina_actual >= paginacion.total_paginas ? '#9ca3af' : '#374151',
                            cursor: paginacion.pagina_actual >= paginacion.total_paginas ? 'not-allowed' : 'pointer',
                            fontSize: '0.875rem'
                        }
                    }, 'Siguiente')
                ])
            ])
        ])
    ]);
}

export default AccesosLog;
