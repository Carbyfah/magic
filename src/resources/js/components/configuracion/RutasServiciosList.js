// src/resources/js/components/configuracion/RutasServiciosList.js
import React from 'react';
import Icons from '../../utils/Icons';

const { createElement: e } = React;

function RutasServiciosList({
    data = [],
    loading = false,
    error = null,
    onEdit,
    onView,
    onToggleStatus,
    onDelete
}) {
    // Función para formatear precios
    const formatPrice = (price) => {
        if (!price) return 'Q0.00';
        return `Q${parseFloat(price).toFixed(2)}`;
    };

    // Función para formatear tipo de servicio
    const formatTipoServicio = (tipo) => {
        const tipos = {
            shuttle: 'Shuttle',
            tour: 'Tour',
            transfer: 'Transfer',
            privado: 'Privado'
        };
        return tipos[tipo] || tipo;
    };

    // Función para obtener color del badge del tipo de servicio
    const getTipoServicioColor = (tipo) => {
        const colores = {
            shuttle: '#3b82f6',
            tour: '#10b981',
            transfer: '#f59e0b',
            privado: '#8b5cf6'
        };
        return colores[tipo] || '#6b7280';
    };

    // Función para formatear horarios
    const formatHorario = (horaInicio, horaFin, duracion) => {
        if (!horaInicio) return '-';

        let resultado = horaInicio;
        if (horaFin) {
            resultado += ` - ${horaFin}`;
        }
        if (duracion) {
            resultado += ` (${duracion}min)`;
        }

        return resultado;
    };

    // Función para formatear días de operación
    const formatDiasOperacion = (diasArray) => {
        if (!diasArray || diasArray.length === 0) return '-';
        if (diasArray.length === 7) return 'Todos los días';
        return diasArray.join(', ');
    };

    if (loading) {
        return e('div', {
            style: {
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '3rem',
                textAlign: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }
        }, [
            e('div', {
                key: 'loading-icon',
                style: {
                    display: 'inline-block',
                    width: '32px',
                    height: '32px',
                    border: '3px solid #f3f4f6',
                    borderTop: '3px solid #8b5cf6',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    marginBottom: '1rem'
                }
            }),
            e('p', {
                key: 'loading-text',
                style: { color: '#6b7280', fontSize: '0.875rem' }
            }, 'Cargando rutas...')
        ]);
    }

    if (error) {
        return e('div', {
            style: {
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '3rem',
                textAlign: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }
        }, [
            e('div', {
                key: 'error-icon',
                style: { color: '#ef4444', marginBottom: '1rem' }
            }, Icons.exclamationTriangle()),
            e('p', {
                key: 'error-text',
                style: { color: '#dc2626', fontSize: '0.875rem' }
            }, `Error: ${error}`)
        ]);
    }

    if (!data || data.length === 0) {
        return e('div', {
            style: {
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '3rem',
                textAlign: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }
        }, [
            e('div', {
                key: 'empty-icon',
                style: { color: '#9ca3af', marginBottom: '1rem', fontSize: '48px' }
            }, Icons.route()),
            e('p', {
                key: 'empty-text',
                style: { color: '#6b7280', fontSize: '1rem', marginBottom: '0.5rem' }
            }, 'No hay rutas registradas'),
            e('p', {
                key: 'empty-subtitle',
                style: { color: '#9ca3af', fontSize: '0.875rem' }
            }, 'Crea la primera ruta para comenzar')
        ]);
    }

    return e('div', {
        style: {
            backgroundColor: 'white',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }
    }, [
        // Tabla
        e('div', {
            key: 'table-container',
            style: { overflow: 'auto' }
        }, [
            e('table', {
                key: 'rutas-table',
                style: { width: '100%', borderCollapse: 'collapse' }
            }, [
                // Header
                e('thead', {
                    key: 'table-head',
                    style: { backgroundColor: '#f9fafb' }
                }, [
                    e('tr', { key: 'header-row' }, [
                        e('th', {
                            key: 'th-codigo',
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
                        }, 'Código'),
                        e('th', {
                            key: 'th-nombre',
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
                        }, 'Nombre & Tipo'),
                        e('th', {
                            key: 'th-ruta',
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
                        }, 'Origen - Destino'),
                        e('th', {
                            key: 'th-horario',
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
                        }, 'Horario'),
                        e('th', {
                            key: 'th-precios',
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
                        }, 'Precios'),
                        e('th', {
                            key: 'th-capacidad',
                            style: {
                                padding: '0.75rem 1rem',
                                textAlign: 'center',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                color: '#374151',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                borderBottom: '1px solid #e5e7eb'
                            }
                        }, 'Capacidad'),
                        e('th', {
                            key: 'th-estado',
                            style: {
                                padding: '0.75rem 1rem',
                                textAlign: 'center',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                color: '#374151',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                borderBottom: '1px solid #e5e7eb'
                            }
                        }, 'Estado'),
                        e('th', {
                            key: 'th-acciones',
                            style: {
                                padding: '0.75rem 1rem',
                                textAlign: 'center',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                color: '#374151',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                borderBottom: '1px solid #e5e7eb'
                            }
                        }, 'Acciones')
                    ])
                ]),
                // Body
                e('tbody', {
                    key: 'table-body'
                }, data.map(ruta =>
                    e('tr', {
                        key: `ruta-${ruta.id}`,
                        style: {
                            borderBottom: '1px solid #f3f4f6'
                        },
                        onMouseEnter: (e) => e.currentTarget.style.backgroundColor = '#f9fafb',
                        onMouseLeave: (e) => e.currentTarget.style.backgroundColor = 'transparent'
                    }, [
                        // Código
                        e('td', {
                            key: 'td-codigo',
                            style: { padding: '1rem', verticalAlign: 'top' }
                        }, [
                            e('div', {
                                key: 'codigo-container',
                                style: {
                                    fontFamily: 'monospace',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    color: '#374151'
                                }
                            }, ruta.codigo_ruta || '-')
                        ]),

                        // Nombre y Tipo
                        e('td', {
                            key: 'td-nombre',
                            style: { padding: '1rem', verticalAlign: 'top' }
                        }, [
                            e('div', {
                                key: 'nombre-container',
                                style: { marginBottom: '0.5rem' }
                            }, [
                                e('div', {
                                    key: 'nombre-text',
                                    style: {
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        color: '#111827',
                                        marginBottom: '0.25rem'
                                    }
                                }, ruta.nombre_ruta || '-'),
                                e('span', {
                                    key: 'tipo-badge',
                                    style: {
                                        display: 'inline-block',
                                        padding: '0.125rem 0.5rem',
                                        backgroundColor: getTipoServicioColor(ruta.tipo_servicio) + '20',
                                        color: getTipoServicioColor(ruta.tipo_servicio),
                                        borderRadius: '9999px',
                                        fontSize: '0.75rem',
                                        fontWeight: '500'
                                    }
                                }, formatTipoServicio(ruta.tipo_servicio))
                            ])
                        ]),

                        // Origen - Destino
                        e('td', {
                            key: 'td-ruta',
                            style: { padding: '1rem', verticalAlign: 'top' }
                        }, [
                            e('div', {
                                key: 'ruta-container',
                                style: { fontSize: '0.875rem' }
                            }, [
                                e('div', {
                                    key: 'origen',
                                    style: { color: '#374151', fontWeight: '500' }
                                }, ruta.origen_destino?.ciudad_origen || '-'),
                                e('div', {
                                    key: 'arrow',
                                    style: { color: '#9ca3af', margin: '0.125rem 0', textAlign: 'center' }
                                }, '↓'),
                                e('div', {
                                    key: 'destino',
                                    style: { color: '#374151', fontWeight: '500' }
                                }, ruta.origen_destino?.ciudad_destino || '-'),
                                ruta.origen_destino?.distancia_km && e('div', {
                                    key: 'distancia',
                                    style: { color: '#9ca3af', fontSize: '0.75rem', marginTop: '0.25rem' }
                                }, `${ruta.origen_destino.distancia_km} km`)
                            ])
                        ]),

                        // Horario
                        e('td', {
                            key: 'td-horario',
                            style: { padding: '1rem', verticalAlign: 'top' }
                        }, [
                            e('div', {
                                key: 'horario-container',
                                style: { fontSize: '0.875rem' }
                            }, [
                                e('div', {
                                    key: 'horario-principal',
                                    style: { color: '#374151', fontWeight: '500', marginBottom: '0.25rem' }
                                }, formatHorario(
                                    ruta.horarios?.hora_salida,
                                    ruta.horarios?.hora_llegada_estimada,
                                    ruta.horarios?.duracion_minutos
                                )),
                                e('div', {
                                    key: 'dias-operacion',
                                    style: { color: '#9ca3af', fontSize: '0.75rem' }
                                }, formatDiasOperacion(ruta.dias_operacion_array))
                            ])
                        ]),

                        // Precios
                        e('td', {
                            key: 'td-precios',
                            style: { padding: '1rem', verticalAlign: 'top' }
                        }, [
                            e('div', {
                                key: 'precios-container',
                                style: { fontSize: '0.875rem' }
                            }, [
                                e('div', {
                                    key: 'precio-adulto',
                                    style: { color: '#374151', fontWeight: '600', marginBottom: '0.25rem' }
                                }, `Adulto: ${formatPrice(ruta.precios?.precio_adulto)}`),
                                ruta.precios?.precio_nino > 0 && e('div', {
                                    key: 'precio-nino',
                                    style: { color: '#9ca3af', fontSize: '0.75rem' }
                                }, `Niño: ${formatPrice(ruta.precios.precio_nino)}`)
                            ])
                        ]),

                        // Capacidad
                        e('td', {
                            key: 'td-capacidad',
                            style: { padding: '1rem', verticalAlign: 'top', textAlign: 'center' }
                        }, [
                            e('div', {
                                key: 'capacidad-container',
                                style: { fontSize: '0.875rem' }
                            }, [
                                e('div', {
                                    key: 'capacidad-maxima',
                                    style: { color: '#374151', fontWeight: '600', marginBottom: '0.25rem' }
                                }, ruta.capacidad?.capacidad_maxima || '-'),
                                e('div', {
                                    key: 'capacidad-recomendada',
                                    style: { color: '#9ca3af', fontSize: '0.75rem' }
                                }, `Rec: ${ruta.capacidad?.capacidad_recomendada || '-'}`)
                            ])
                        ]),

                        // Estado
                        e('td', {
                            key: 'td-estado',
                            style: { padding: '1rem', verticalAlign: 'top', textAlign: 'center' }
                        }, [
                            e('div', {
                                key: 'estado-container'
                            }, [
                                e('span', {
                                    key: 'estado-badge',
                                    style: {
                                        display: 'inline-block',
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '6px',
                                        fontSize: '0.75rem',
                                        fontWeight: '500',
                                        backgroundColor: ruta.acepta_reservas ? '#dcfce7' : '#fef3c7',
                                        color: ruta.acepta_reservas ? '#16a34a' : '#d97706'
                                    }
                                }, ruta.acepta_reservas ? 'Activa' : 'Inactiva'),
                                e('div', {
                                    key: 'estado-info',
                                    style: { color: '#9ca3af', fontSize: '0.75rem', marginTop: '0.25rem' }
                                }, ruta.estado_ruta?.nombre || '-')
                            ])
                        ]),

                        // Acciones
                        e('td', {
                            key: 'td-acciones',
                            style: { padding: '1rem', verticalAlign: 'top', textAlign: 'center' }
                        }, [
                            e('div', {
                                key: 'acciones-container',
                                style: { display: 'flex', gap: '0.5rem', justifyContent: 'center' }
                            }, [
                                // Ver
                                e('button', {
                                    key: 'btn-view',
                                    onClick: () => onView(ruta),
                                    title: 'Ver detalles',
                                    style: {
                                        padding: '0.5rem',
                                        border: 'none',
                                        borderRadius: '6px',
                                        backgroundColor: '#f3f4f6',
                                        color: '#6b7280',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    },
                                    onMouseEnter: (e) => {
                                        e.target.style.backgroundColor = '#e5e7eb';
                                        e.target.style.color = '#374151';
                                    },
                                    onMouseLeave: (e) => {
                                        e.target.style.backgroundColor = '#f3f4f6';
                                        e.target.style.color = '#6b7280';
                                    }
                                }, Icons.eye()),

                                // Editar
                                e('button', {
                                    key: 'btn-edit',
                                    onClick: () => onEdit(ruta),
                                    title: 'Editar ruta',
                                    style: {
                                        padding: '0.5rem',
                                        border: 'none',
                                        borderRadius: '6px',
                                        backgroundColor: '#dbeafe',
                                        color: '#3b82f6',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    },
                                    onMouseEnter: (e) => {
                                        e.target.style.backgroundColor = '#bfdbfe';
                                        e.target.style.color = '#1d4ed8';
                                    },
                                    onMouseLeave: (e) => {
                                        e.target.style.backgroundColor = '#dbeafe';
                                        e.target.style.color = '#3b82f6';
                                    }
                                }, Icons.edit()),

                                // Toggle Estado
                                e('button', {
                                    key: 'btn-toggle',
                                    onClick: () => onToggleStatus(ruta),
                                    title: ruta.situacion ? 'Desactivar ruta' : 'Activar ruta',
                                    style: {
                                        padding: '0.5rem',
                                        border: 'none',
                                        borderRadius: '6px',
                                        backgroundColor: ruta.situacion ? '#fef3c7' : '#dcfce7',
                                        color: ruta.situacion ? '#d97706' : '#16a34a',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    },
                                    onMouseEnter: (e) => {
                                        if (ruta.situacion) {
                                            e.target.style.backgroundColor = '#fde68a';
                                            e.target.style.color = '#b45309';
                                        } else {
                                            e.target.style.backgroundColor = '#bbf7d0';
                                            e.target.style.color = '#059669';
                                        }
                                    },
                                    onMouseLeave: (e) => {
                                        e.target.style.backgroundColor = ruta.situacion ? '#fef3c7' : '#dcfce7';
                                        e.target.style.color = ruta.situacion ? '#d97706' : '#16a34a';
                                    }
                                }, ruta.situacion ? Icons.pause() : Icons.play()),

                                // Eliminar
                                e('button', {
                                    key: 'btn-delete',
                                    onClick: () => onDelete(ruta),
                                    title: 'Eliminar ruta',
                                    style: {
                                        padding: '0.5rem',
                                        border: 'none',
                                        borderRadius: '6px',
                                        backgroundColor: '#fecaca',
                                        color: '#dc2626',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    },
                                    onMouseEnter: (e) => {
                                        e.target.style.backgroundColor = '#fca5a5';
                                        e.target.style.color = '#b91c1c';
                                    },
                                    onMouseLeave: (e) => {
                                        e.target.style.backgroundColor = '#fecaca';
                                        e.target.style.color = '#dc2626';
                                    }
                                }, Icons.trash())
                            ])
                        ])
                    ])
                ))
            ])
        ])
    ]);
}

export default RutasServiciosList;
