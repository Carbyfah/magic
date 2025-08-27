// src/resources/js/components/usuarios/empleados/EmpleadosList.js
import React from 'react';
import Icons from '../../../utils/Icons';
import UserAvatar from '../common/UserAvatar';
import RolesBadge from '../common/RolesBadge';

const { createElement: e } = React;

function EmpleadosList({
    data = [],
    loading = false,
    error = null,
    onEdit,
    onView,
    onToggleStatus,
    onDelete
}) {
    // Función para formatear fechas
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        try {
            return new Date(dateString).toLocaleDateString('es-GT', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        } catch (e) {
            return '-';
        }
    };

    // Función para calcular días desde ingreso
    const calcularAntiguedad = (fechaIngreso) => {
        if (!fechaIngreso) return '-';
        try {
            const ingreso = new Date(fechaIngreso);
            const hoy = new Date();
            const diffTime = Math.abs(hoy - ingreso);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays < 30) {
                return `${diffDays} días`;
            } else if (diffDays < 365) {
                const meses = Math.floor(diffDays / 30);
                return `${meses} mes${meses > 1 ? 'es' : ''}`;
            } else {
                const años = Math.floor(diffDays / 365);
                const mesesRestantes = Math.floor((diffDays % 365) / 30);
                return `${años} año${años > 1 ? 's' : ''}${mesesRestantes > 0 ? ` ${mesesRestantes}m` : ''}`;
            }
        } catch (e) {
            return '-';
        }
    };

    // Función para obtener color del estado
    const getEstadoColor = (estado) => {
        if (!estado) return '#6b7280';

        const colores = {
            'ACTIVO': '#059669',
            'INACTIVO': '#dc2626',
            'LICENCIA': '#f59e0b',
            'VACACIONES': '#3b82f6',
            'SUSPENDIDO': '#ef4444'
        };

        return colores[estado.codigo] || '#6b7280';
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
                    borderTop: '3px solid #3b82f6',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    marginBottom: '1rem'
                }
            }),
            e('p', {
                key: 'loading-text',
                style: { color: '#6b7280', fontSize: '0.875rem' }
            }, 'Cargando empleados...')
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
            }, Icons.users()),
            e('p', {
                key: 'empty-text',
                style: { color: '#6b7280', fontSize: '1rem', marginBottom: '0.5rem' }
            }, 'No hay empleados registrados'),
            e('p', {
                key: 'empty-subtitle',
                style: { color: '#9ca3af', fontSize: '0.875rem' }
            }, 'Crea el primer empleado para comenzar')
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
                key: 'empleados-table',
                style: { width: '100%', borderCollapse: 'collapse' }
            }, [
                // Header
                e('thead', {
                    key: 'table-head',
                    style: { backgroundColor: '#f9fafb' }
                }, [
                    e('tr', { key: 'header-row' }, [
                        e('th', {
                            key: 'th-empleado',
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
                        }, 'Empleado'),
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
                            key: 'th-contacto',
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
                        }, 'Contacto'),
                        e('th', {
                            key: 'th-rol',
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
                        }, 'Rol'),
                        e('th', {
                            key: 'th-ingreso',
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
                        }, 'Ingreso'),
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
                }, data.map(empleado =>
                    e('tr', {
                        key: `empleado-${empleado.id}`,
                        style: {
                            borderBottom: '1px solid #f3f4f6'
                        },
                        onMouseEnter: (e) => e.currentTarget.style.backgroundColor = '#f9fafb',
                        onMouseLeave: (e) => e.currentTarget.style.backgroundColor = 'transparent'
                    }, [
                        // Empleado (Avatar + Nombre)
                        e('td', {
                            key: 'td-empleado',
                            style: { padding: '1rem', verticalAlign: 'top' }
                        }, [
                            e('div', {
                                key: 'empleado-info',
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem'
                                }
                            }, [
                                e(UserAvatar, {
                                    key: 'avatar',
                                    empleado: empleado,
                                    size: '40px'
                                }),
                                e('div', { key: 'empleado-details' }, [
                                    e('div', {
                                        key: 'nombre',
                                        style: {
                                            fontSize: '0.875rem',
                                            fontWeight: '600',
                                            color: '#111827',
                                            marginBottom: '0.25rem'
                                        }
                                    }, empleado.persona?.nombre_completo || `${empleado.persona?.nombres || ''} ${empleado.persona?.apellidos || ''}`.trim() || 'Sin nombre'),
                                    empleado.persona?.documento_identidad && e('div', {
                                        key: 'documento',
                                        style: {
                                            fontSize: '0.75rem',
                                            color: '#6b7280'
                                        }
                                    }, `DPI: ${empleado.persona.documento_identidad}`)
                                ])
                            ])
                        ]),

                        // Código de empleado
                        e('td', {
                            key: 'td-codigo',
                            style: { padding: '1rem', verticalAlign: 'top' }
                        }, [
                            e('span', {
                                key: 'codigo',
                                style: {
                                    fontFamily: 'monospace',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    color: '#374151',
                                    backgroundColor: '#f3f4f6',
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '4px'
                                }
                            }, empleado.codigo_empleado || '-')
                        ]),

                        // Contacto
                        e('td', {
                            key: 'td-contacto',
                            style: { padding: '1rem', verticalAlign: 'top' }
                        }, [
                            e('div', {
                                key: 'contacto-info',
                                style: { fontSize: '0.875rem' }
                            }, [
                                empleado.persona?.email && e('div', {
                                    key: 'email',
                                    style: {
                                        color: '#374151',
                                        marginBottom: '0.25rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem'
                                    }
                                }, [
                                    e('span', { key: 'email-icon', style: { color: '#9ca3af' } }, Icons.mail()),
                                    e('span', { key: 'email-text' }, empleado.persona.email)
                                ]),
                                empleado.persona?.telefono_principal && e('div', {
                                    key: 'telefono',
                                    style: {
                                        color: '#6b7280',
                                        fontSize: '0.8125rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem'
                                    }
                                }, [
                                    e('span', { key: 'phone-icon', style: { color: '#9ca3af' } }, Icons.phone()),
                                    e('span', { key: 'phone-text' }, empleado.persona.telefono_principal)
                                ])
                            ])
                        ]),

                        // Rol
                        e('td', {
                            key: 'td-rol',
                            style: { padding: '1rem', verticalAlign: 'top' }
                        }, [
                            e(RolesBadge, {
                                key: 'rol-badge',
                                rol: empleado.rol
                            })
                        ]),

                        // Fecha ingreso y antigüedad
                        e('td', {
                            key: 'td-ingreso',
                            style: { padding: '1rem', verticalAlign: 'top' }
                        }, [
                            e('div', {
                                key: 'ingreso-info',
                                style: { fontSize: '0.875rem' }
                            }, [
                                e('div', {
                                    key: 'fecha-ingreso',
                                    style: {
                                        color: '#374151',
                                        fontWeight: '500',
                                        marginBottom: '0.25rem'
                                    }
                                }, formatDate(empleado.fecha_ingreso)),
                                e('div', {
                                    key: 'antiguedad',
                                    style: {
                                        color: '#6b7280',
                                        fontSize: '0.75rem'
                                    }
                                }, calcularAntiguedad(empleado.fecha_ingreso))
                            ])
                        ]),

                        // Estado
                        e('td', {
                            key: 'td-estado',
                            style: { padding: '1rem', verticalAlign: 'top', textAlign: 'center' }
                        }, [
                            e('div', {
                                key: 'estado-container',
                                style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }
                            }, [
                                // Estado empleado
                                empleado.estado_empleado && e('span', {
                                    key: 'estado-badge',
                                    style: {
                                        display: 'inline-block',
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '6px',
                                        fontSize: '0.75rem',
                                        fontWeight: '500',
                                        backgroundColor: getEstadoColor(empleado.estado_empleado) + '20',
                                        color: getEstadoColor(empleado.estado_empleado),
                                        border: `1px solid ${getEstadoColor(empleado.estado_empleado)}40`
                                    }
                                }, empleado.estado_empleado.nombre_estado),

                                // Situación activo/inactivo
                                e('span', {
                                    key: 'situacion-badge',
                                    style: {
                                        display: 'inline-block',
                                        padding: '0.125rem 0.375rem',
                                        borderRadius: '9999px',
                                        fontSize: '0.6875rem',
                                        fontWeight: '500',
                                        backgroundColor: empleado.situacion ? '#dcfce7' : '#fef3c7',
                                        color: empleado.situacion ? '#16a34a' : '#d97706'
                                    }
                                }, empleado.situacion ? 'Activo' : 'Inactivo')
                            ])
                        ]),

                        // Acciones
                        e('td', {
                            key: 'td-acciones',
                            style: { padding: '1rem', verticalAlign: 'top', textAlign: 'center' }
                        }, [
                            e('div', {
                                key: 'acciones-container',
                                style: { display: 'flex', gap: '0.25rem', justifyContent: 'center' }
                            }, [
                                // Ver
                                e('button', {
                                    key: 'btn-view',
                                    onClick: () => onView(empleado),
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
                                    onClick: () => onEdit(empleado),
                                    title: 'Editar empleado',
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
                                    onClick: () => onToggleStatus(empleado),
                                    title: empleado.situacion ? 'Desactivar empleado' : 'Activar empleado',
                                    style: {
                                        padding: '0.5rem',
                                        border: 'none',
                                        borderRadius: '6px',
                                        backgroundColor: empleado.situacion ? '#fef3c7' : '#dcfce7',
                                        color: empleado.situacion ? '#d97706' : '#16a34a',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    },
                                    onMouseEnter: (e) => {
                                        if (empleado.situacion) {
                                            e.target.style.backgroundColor = '#fde68a';
                                            e.target.style.color = '#b45309';
                                        } else {
                                            e.target.style.backgroundColor = '#bbf7d0';
                                            e.target.style.color = '#059669';
                                        }
                                    },
                                    onMouseLeave: (e) => {
                                        e.target.style.backgroundColor = empleado.situacion ? '#fef3c7' : '#dcfce7';
                                        e.target.style.color = empleado.situacion ? '#d97706' : '#16a34a';
                                    }
                                }, empleado.situacion ? Icons.userMinus() : Icons.userPlus()),
                                // Eliminar
                                e('button', {
                                    key: 'btn-delete',
                                    onClick: () => onDelete(empleado),
                                    title: 'Eliminar empleado',
                                    style: {
                                        padding: '0.5rem',
                                        border: 'none',
                                        borderRadius: '6px',
                                        backgroundColor: '#fee2e2',
                                        color: '#dc2626',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    },
                                    onMouseEnter: (e) => {
                                        e.target.style.backgroundColor = '#fecaca';
                                        e.target.style.color = '#b91c1c';
                                    },
                                    onMouseLeave: (e) => {
                                        e.target.style.backgroundColor = '#fee2e2';
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

export default EmpleadosList;
