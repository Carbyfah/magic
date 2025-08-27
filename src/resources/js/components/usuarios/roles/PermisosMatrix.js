// src/resources/js/components/usuarios/roles/PermisosMatrix.js
import React from 'react';
import Icons from '../../../utils/Icons';
import Notifications from '../../../utils/notifications';
import RolesBadge from '../common/RolesBadge';

const { createElement: e, useState, useEffect } = React;

function PermisosMatrix() {
    // Estados principales
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [cambiosPendientes, setCambiosPendientes] = useState({});

    // Estructura de permisos organizados por módulo
    const [estructuraPermisos] = useState([
        {
            modulo: 'Personas',
            color: '#3b82f6',
            permisos: [
                { codigo: 'personas.ver', nombre: 'Ver' },
                { codigo: 'personas.crear', nombre: 'Crear' },
                { codigo: 'personas.editar', nombre: 'Editar' },
                { codigo: 'personas.eliminar', nombre: 'Eliminar' },
                { codigo: 'empleados.ver', nombre: 'Ver Empleados' },
                { codigo: 'empleados.crear', nombre: 'Crear Empleados' },
                { codigo: 'empleados.editar', nombre: 'Editar Empleados' },
                { codigo: 'empleados.eliminar', nombre: 'Eliminar Empleados' },
                { codigo: 'clientes.ver', nombre: 'Ver Clientes' },
                { codigo: 'clientes.crear', nombre: 'Crear Clientes' },
                { codigo: 'clientes.editar', nombre: 'Editar Clientes' },
                { codigo: 'clientes.eliminar', nombre: 'Eliminar Clientes' }
            ]
        },
        {
            modulo: 'Operaciones',
            color: '#059669',
            permisos: [
                { codigo: 'vehiculos.ver', nombre: 'Ver Vehículos' },
                { codigo: 'vehiculos.crear', nombre: 'Crear Vehículos' },
                { codigo: 'vehiculos.editar', nombre: 'Editar Vehículos' },
                { codigo: 'vehiculos.eliminar', nombre: 'Eliminar Vehículos' },
                { codigo: 'rutas.ver', nombre: 'Ver Rutas' },
                { codigo: 'rutas.crear', nombre: 'Crear Rutas' },
                { codigo: 'rutas.editar', nombre: 'Editar Rutas' },
                { codigo: 'rutas.eliminar', nombre: 'Eliminar Rutas' },
                { codigo: 'rutas.ejecutar', nombre: 'Ejecutar Rutas' },
                { codigo: 'rutas.asignar_chofer', nombre: 'Asignar Chofer' }
            ]
        },
        {
            modulo: 'Comercial',
            color: '#dc2626',
            permisos: [
                { codigo: 'reservas.ver', nombre: 'Ver Reservas' },
                { codigo: 'reservas.crear', nombre: 'Crear Reservas' },
                { codigo: 'reservas.editar', nombre: 'Editar Reservas' },
                { codigo: 'reservas.eliminar', nombre: 'Eliminar Reservas' },
                { codigo: 'reservas.confirmar', nombre: 'Confirmar Reservas' },
                { codigo: 'reservas.cancelar', nombre: 'Cancelar Reservas' },
                { codigo: 'ventas.ver', nombre: 'Ver Ventas' },
                { codigo: 'ventas.crear', nombre: 'Crear Ventas' },
                { codigo: 'ventas.editar', nombre: 'Editar Ventas' },
                { codigo: 'ventas.anular', nombre: 'Anular Ventas' },
                { codigo: 'ventas.aplicar_descuento', nombre: 'Aplicar Descuentos' },
                { codigo: 'ventas.autorizar_credito', nombre: 'Autorizar Créditos' }
            ]
        },
        {
            modulo: 'Administración',
            color: '#7c3aed',
            permisos: [
                { codigo: 'reportes.ver', nombre: 'Ver Reportes' },
                { codigo: 'reportes.exportar', nombre: 'Exportar Reportes' },
                { codigo: 'dashboard.ver', nombre: 'Ver Dashboard' },
                { codigo: 'auditoria.ver', nombre: 'Ver Auditoría' },
                { codigo: 'catalogos.ver', nombre: 'Ver Catálogos' },
                { codigo: 'catalogos.editar', nombre: 'Editar Catálogos' },
                { codigo: 'sistema.configurar', nombre: 'Configurar Sistema' },
                { codigo: 'sistema.respaldos', nombre: 'Gestionar Respaldos' }
            ]
        }
    ]);

    useEffect(() => {
        cargarRoles();
    }, []);

    // Cargar roles desde la API
    const cargarRoles = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/v1/roles', {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setRoles(Array.isArray(data) ? data : data.data || []);
            }
        } catch (error) {
            console.error('Error cargando roles:', error);
            Notifications.error('Error al cargar roles');
        } finally {
            setLoading(false);
        }
    };

    // Verificar si un rol tiene un permiso
    const rolTienePermiso = (rol, permiso) => {
        return rol.permisos_json && rol.permisos_json.includes(permiso);
    };

    // Manejar cambio de permiso en modo edición
    const handlePermisoChange = (rolId, permiso, checked) => {
        setCambiosPendientes(prev => {
            const rolKey = `rol_${rolId}`;
            const cambiosRol = prev[rolKey] || {};

            return {
                ...prev,
                [rolKey]: {
                    ...cambiosRol,
                    [permiso]: checked
                }
            };
        });
    };

    // Guardar cambios pendientes
    const guardarCambios = async () => {
        try {
            setLoading(true);

            for (const [rolKey, cambios] of Object.entries(cambiosPendientes)) {
                const rolId = rolKey.split('_')[1];
                const rol = roles.find(r => r.id == rolId);

                if (rol) {
                    const nuevosPermisos = [...(rol.permisos_json || [])];

                    // Aplicar cambios
                    Object.entries(cambios).forEach(([permiso, checked]) => {
                        if (checked && !nuevosPermisos.includes(permiso)) {
                            nuevosPermisos.push(permiso);
                        } else if (!checked && nuevosPermisos.includes(permiso)) {
                            const index = nuevosPermisos.indexOf(permiso);
                            nuevosPermisos.splice(index, 1);
                        }
                    });

                    // Actualizar en el backend
                    const response = await fetch(`/api/v1/roles/${rolId}`, {
                        method: 'PUT',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            ...rol,
                            permisos_json: nuevosPermisos
                        })
                    });

                    if (!response.ok) {
                        throw new Error(`Error al actualizar rol ${rol.nombre_rol}`);
                    }
                }
            }

            Notifications.success('Permisos actualizados correctamente');
            setCambiosPendientes({});
            setEditMode(false);
            await cargarRoles();

        } catch (error) {
            console.error('Error guardando cambios:', error);
            Notifications.error('Error al guardar cambios: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Cancelar cambios
    const cancelarCambios = () => {
        setCambiosPendientes({});
        setEditMode(false);
    };

    // Obtener estado actual del permiso (con cambios pendientes)
    const getEstadoPermiso = (rol, permiso) => {
        const rolKey = `rol_${rol.id}`;
        const cambiosPendientesRol = cambiosPendientes[rolKey];

        if (cambiosPendientesRol && cambiosPendientesRol.hasOwnProperty(permiso)) {
            return cambiosPendientesRol[permiso];
        }

        return rolTienePermiso(rol, permiso);
    };

    if (loading) {
        return e('div', {
            style: {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '3rem'
            }
        }, [
            e('div', {
                style: {
                    width: '32px',
                    height: '32px',
                    border: '3px solid #f3f4f6',
                    borderTop: '3px solid #dc2626',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }
            })
        ]);
    }

    return e('div', {
        style: { maxWidth: '100%', overflow: 'auto' }
    }, [
        // Header con controles
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
                }, 'Matriz de Permisos'),
                e('p', {
                    key: 'description',
                    style: {
                        color: '#6b7280',
                        margin: '0',
                        fontSize: '0.875rem'
                    }
                }, 'Vista completa de permisos por rol y módulo')
            ]),

            e('div', {
                key: 'action-buttons',
                style: { display: 'flex', gap: '0.75rem' }
            }, [
                editMode ? [
                    e('button', {
                        key: 'btn-cancelar',
                        onClick: cancelarCambios,
                        style: {
                            padding: '0.75rem 1.5rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            backgroundColor: 'white',
                            color: '#374151',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            cursor: 'pointer'
                        }
                    }, 'Cancelar'),

                    e('button', {
                        key: 'btn-guardar',
                        onClick: guardarCambios,
                        disabled: Object.keys(cambiosPendientes).length === 0,
                        style: {
                            padding: '0.75rem 1.5rem',
                            border: 'none',
                            borderRadius: '8px',
                            backgroundColor: Object.keys(cambiosPendientes).length > 0 ? '#dc2626' : '#9ca3af',
                            color: 'white',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            cursor: Object.keys(cambiosPendientes).length > 0 ? 'pointer' : 'not-allowed',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }
                    }, [
                        Icons.check(),
                        `Guardar ${Object.keys(cambiosPendientes).length > 0 ? `(${Object.keys(cambiosPendientes).length})` : ''}`
                    ])
                ] : e('button', {
                    key: 'btn-editar',
                    onClick: () => setEditMode(true),
                    style: {
                        padding: '0.75rem 1.5rem',
                        border: 'none',
                        borderRadius: '8px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }
                }, [Icons.edit(), 'Editar Permisos'])
            ])
        ]),

        // Leyenda de colores
        e('div', {
            key: 'legend',
            style: {
                backgroundColor: 'white',
                padding: '1rem 1.5rem',
                borderRadius: '12px',
                marginBottom: '1.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem',
                flexWrap: 'wrap'
            }
        }, [
            e('span', {
                key: 'legend-title',
                style: {
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#374151'
                }
            }, 'Módulos:'),

            ...estructuraPermisos.map(modulo =>
                e('div', {
                    key: `legend-${modulo.modulo}`,
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }
                }, [
                    e('div', {
                        key: 'color-dot',
                        style: {
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            backgroundColor: modulo.color
                        }
                    }),
                    e('span', {
                        key: 'modulo-name',
                        style: {
                            fontSize: '0.875rem',
                            color: '#374151'
                        }
                    }, modulo.modulo)
                ])
            )
        ]),

        // Tabla matriz
        e('div', {
            key: 'matrix-container',
            style: {
                backgroundColor: 'white',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }
        }, [
            e('div', {
                key: 'table-container',
                style: { overflow: 'auto' }
            }, [
                e('table', {
                    key: 'matrix-table',
                    style: {
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: '0.875rem'
                    }
                }, [
                    // Header de la tabla
                    e('thead', {
                        key: 'table-head',
                        style: { backgroundColor: '#f8fafc' }
                    }, [
                        e('tr', { key: 'header-row' }, [
                            // Columna de permisos
                            e('th', {
                                key: 'permisos-header',
                                style: {
                                    padding: '1rem',
                                    textAlign: 'left',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    color: '#374151',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    borderRight: '2px solid #e5e7eb',
                                    position: 'sticky',
                                    left: 0,
                                    backgroundColor: '#f8fafc',
                                    zIndex: 10,
                                    minWidth: '300px'
                                }
                            }, 'Permisos'),

                            // Columnas de roles
                            ...roles.map(rol =>
                                e('th', {
                                    key: `rol-header-${rol.id}`,
                                    style: {
                                        padding: '1rem 0.5rem',
                                        textAlign: 'center',
                                        borderRight: '1px solid #f3f4f6',
                                        minWidth: '120px',
                                        verticalAlign: 'top'
                                    }
                                }, [
                                    e('div', {
                                        key: 'rol-info',
                                        style: {
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }
                                    }, [
                                        e(RolesBadge, {
                                            key: 'rol-badge',
                                            rol: rol,
                                            size: 'small',
                                            showJerarquia: true
                                        }),
                                        e('div', {
                                            key: 'rol-name',
                                            style: {
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                                color: '#374151',
                                                textAlign: 'center',
                                                lineHeight: '1.2'
                                            }
                                        }, rol.nombre_rol)
                                    ])
                                ])
                            )
                        ])
                    ]),

                    // Body de la tabla
                    e('tbody', { key: 'table-body' },
                        estructuraPermisos.map(modulo =>
                            // Crear filas para cada módulo
                            [
                                // Fila header del módulo
                                e('tr', {
                                    key: `modulo-header-${modulo.modulo}`,
                                    style: { backgroundColor: '#f1f5f9' }
                                }, [
                                    e('td', {
                                        key: 'modulo-name',
                                        colSpan: roles.length + 1,
                                        style: {
                                            padding: '0.75rem 1rem',
                                            fontSize: '0.875rem',
                                            fontWeight: '600',
                                            color: modulo.color,
                                            borderTop: '2px solid #e5e7eb',
                                            borderBottom: '1px solid #e5e7eb',
                                            position: 'sticky',
                                            left: 0,
                                            backgroundColor: '#f1f5f9'
                                        }
                                    }, [
                                        e('div', {
                                            key: 'modulo-title',
                                            style: {
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }
                                        }, [
                                            e('div', {
                                                key: 'color-indicator',
                                                style: {
                                                    width: '8px',
                                                    height: '8px',
                                                    borderRadius: '50%',
                                                    backgroundColor: modulo.color
                                                }
                                            }),
                                            `MÓDULO ${modulo.modulo.toUpperCase()} (${modulo.permisos.length} permisos)`
                                        ])
                                    ])
                                ]),

                                // Filas de permisos del módulo
                                ...modulo.permisos.map((permiso, index) =>
                                    e('tr', {
                                        key: `permiso-${permiso.codigo}`,
                                        style: {
                                            borderBottom: '1px solid #f9fafb'
                                        },
                                        onMouseEnter: (e) => e.currentTarget.style.backgroundColor = '#fefefe',
                                        onMouseLeave: (e) => e.currentTarget.style.backgroundColor = 'transparent'
                                    }, [
                                        // Nombre del permiso
                                        e('td', {
                                            key: 'permiso-name',
                                            style: {
                                                padding: '0.75rem 1rem',
                                                borderRight: '2px solid #f3f4f6',
                                                position: 'sticky',
                                                left: 0,
                                                backgroundColor: 'inherit',
                                                zIndex: 5
                                            }
                                        }, [
                                            e('div', {
                                                key: 'permiso-info',
                                                style: {
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '0.25rem'
                                                }
                                            }, [
                                                e('span', {
                                                    key: 'permiso-title',
                                                    style: {
                                                        fontSize: '0.875rem',
                                                        fontWeight: '500',
                                                        color: '#374151'
                                                    }
                                                }, permiso.nombre),
                                                e('span', {
                                                    key: 'permiso-code',
                                                    style: {
                                                        fontSize: '0.75rem',
                                                        color: '#9ca3af',
                                                        fontFamily: 'monospace'
                                                    }
                                                }, permiso.codigo)
                                            ])
                                        ]),

                                        // Checkboxes para cada rol
                                        ...roles.map(rol => {
                                            const tienePermiso = getEstadoPermiso(rol, permiso.codigo);
                                            const tieneCambiosPendientes = cambiosPendientes[`rol_${rol.id}`]?.hasOwnProperty(permiso.codigo);

                                            return e('td', {
                                                key: `checkbox-${rol.id}-${permiso.codigo}`,
                                                style: {
                                                    padding: '0.75rem',
                                                    textAlign: 'center',
                                                    borderRight: '1px solid #f9fafb',
                                                    backgroundColor: tieneCambiosPendientes ? '#fef3c7' : 'transparent'
                                                }
                                            }, [
                                                e('input', {
                                                    key: 'permiso-checkbox',
                                                    type: 'checkbox',
                                                    checked: tienePermiso,
                                                    disabled: !editMode,
                                                    onChange: editMode ? (e) => handlePermisoChange(rol.id, permiso.codigo, e.target.checked) : undefined,
                                                    style: {
                                                        width: '18px',
                                                        height: '18px',
                                                        accentColor: modulo.color,
                                                        cursor: editMode ? 'pointer' : 'default'
                                                    }
                                                })
                                            ]);
                                        })
                                    ])
                                )
                            ]
                        ).flat()
                    )
                ])
            ])
        ]),

        // Resumen de cambios pendientes (si hay)
        Object.keys(cambiosPendientes).length > 0 && e('div', {
            key: 'cambios-pendientes',
            style: {
                position: 'fixed',
                bottom: '2rem',
                right: '2rem',
                backgroundColor: '#fef3c7',
                border: '1px solid #f59e0b',
                borderRadius: '12px',
                padding: '1rem 1.5rem',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                zIndex: 50
            }
        }, [
            e('div', {
                key: 'cambios-info',
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                    color: '#92400e',
                    fontWeight: '500'
                }
            }, [
                Icons.clock(),
                `${Object.keys(cambiosPendientes).length} cambio${Object.keys(cambiosPendientes).length !== 1 ? 's' : ''} pendiente${Object.keys(cambiosPendientes).length !== 1 ? 's' : ''}`
            ])
        ])
    ]);
}

export default PermisosMatrix;
