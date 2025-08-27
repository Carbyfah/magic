// src/resources/js/components/usuarios/roles/PermisosTree.js
import React from 'react';
import Icons from '../../../utils/Icons';

const { createElement: e, useState } = React;

function PermisosTree({
    permisos = [],
    selectedPermisos = [],
    onPermisoChange,
    readOnly = false
}) {
    // Estados para controlar expansión de nodos
    const [expandedNodes, setExpandedNodes] = useState(new Set(['root']));

    // Estructura jerárquica de permisos
    const estructuraArbol = {
        root: {
            nombre: 'Sistema Magic Travel',
            icono: Icons.home(),
            hijos: ['personas', 'operaciones', 'comercial', 'reportes', 'administracion']
        },
        personas: {
            nombre: 'Gestión de Personas',
            icono: Icons.users(),
            descripcion: 'Administración de empleados, clientes y contactos',
            hijos: ['personas_basico', 'empleados', 'clientes'],
            permisos: ['personas.ver']
        },
        personas_basico: {
            nombre: 'Operaciones Básicas',
            icono: Icons.user(),
            permisos: ['personas.crear', 'personas.editar', 'personas.eliminar']
        },
        empleados: {
            nombre: 'Empleados',
            icono: Icons.userCheck(),
            permisos: ['empleados.ver', 'empleados.crear', 'empleados.editar', 'empleados.eliminar']
        },
        clientes: {
            nombre: 'Clientes',
            icono: Icons.userGroup(),
            permisos: ['clientes.ver', 'clientes.crear', 'clientes.editar', 'clientes.eliminar']
        },
        operaciones: {
            nombre: 'Operaciones',
            icono: Icons.truck(),
            descripcion: 'Vehículos, rutas y operaciones de transporte',
            hijos: ['vehiculos', 'rutas'],
            permisos: []
        },
        vehiculos: {
            nombre: 'Vehículos',
            icono: Icons.truck(),
            permisos: ['vehiculos.ver', 'vehiculos.crear', 'vehiculos.editar', 'vehiculos.eliminar']
        },
        rutas: {
            nombre: 'Rutas',
            icono: Icons.map(),
            permisos: ['rutas.ver', 'rutas.crear', 'rutas.editar', 'rutas.eliminar', 'rutas.ejecutar', 'rutas.asignar_chofer']
        },
        comercial: {
            nombre: 'Área Comercial',
            icono: Icons.dollar(),
            descripcion: 'Reservas, ventas y facturación',
            hijos: ['reservas', 'ventas'],
            permisos: []
        },
        reservas: {
            nombre: 'Reservas',
            icono: Icons.calendar(),
            permisos: ['reservas.ver', 'reservas.crear', 'reservas.editar', 'reservas.eliminar', 'reservas.confirmar', 'reservas.cancelar']
        },
        ventas: {
            nombre: 'Ventas y Facturación',
            icono: Icons.creditCard(),
            permisos: ['ventas.ver', 'ventas.crear', 'ventas.editar', 'ventas.anular', 'ventas.aplicar_descuento', 'ventas.autorizar_credito']
        },
        reportes: {
            nombre: 'Reportes y Dashboard',
            icono: Icons.chartBar(),
            descripcion: 'Informes y análisis del negocio',
            permisos: ['reportes.ver', 'reportes.exportar', 'dashboard.ver']
        },
        administracion: {
            nombre: 'Administración',
            icono: Icons.settings(),
            descripcion: 'Configuración y administración del sistema',
            hijos: ['auditoria', 'catalogos', 'sistema'],
            permisos: []
        },
        auditoria: {
            nombre: 'Auditoría',
            icono: Icons.eye(),
            permisos: ['auditoria.ver']
        },
        catalogos: {
            nombre: 'Catálogos',
            icono: Icons.database(),
            permisos: ['catalogos.ver', 'catalogos.editar']
        },
        sistema: {
            nombre: 'Sistema',
            icono: Icons.gear(),
            permisos: ['sistema.configurar', 'sistema.respaldos']
        }
    };

    // Función para expandir/colapsar un nodo
    const toggleNode = (nodeId) => {
        setExpandedNodes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(nodeId)) {
                newSet.delete(nodeId);
            } else {
                newSet.add(nodeId);
            }
            return newSet;
        });
    };

    // Verificar si un permiso está seleccionado
    const isPermisoSelected = (permiso) => {
        return selectedPermisos.includes(permiso);
    };

    // Verificar si todos los permisos de un nodo están seleccionados
    const areAllPermisosSelected = (nodo) => {
        if (!nodo.permisos || nodo.permisos.length === 0) return false;
        return nodo.permisos.every(permiso => isPermisoSelected(permiso));
    };

    // Verificar si algunos (pero no todos) permisos están seleccionados
    const areSomePermisosSelected = (nodo) => {
        if (!nodo.permisos || nodo.permisos.length === 0) return false;
        return nodo.permisos.some(permiso => isPermisoSelected(permiso)) &&
            !nodo.permisos.every(permiso => isPermisoSelected(permiso));
    };

    // Manejar selección de todos los permisos de un nodo
    const handleNodeToggle = (nodo, checked) => {
        if (readOnly || !onPermisoChange) return;

        nodo.permisos?.forEach(permiso => {
            onPermisoChange(permiso, checked);
        });

        // Recursivamente manejar hijos
        if (nodo.hijos) {
            nodo.hijos.forEach(hijoId => {
                const hijoNodo = estructuraArbol[hijoId];
                if (hijoNodo) {
                    handleNodeToggle(hijoNodo, checked);
                }
            });
        }
    };

    // Expandir todos los nodos
    const expandAll = () => {
        const allNodes = new Set(Object.keys(estructuraArbol));
        setExpandedNodes(allNodes);
    };

    // Colapsar todos los nodos
    const collapseAll = () => {
        setExpandedNodes(new Set(['root']));
    };

    // Función para renderizar un nodo del árbol
    const renderNode = (nodeId, nivel = 0) => {
        const nodo = estructuraArbol[nodeId];
        if (!nodo) return null;

        const isExpanded = expandedNodes.has(nodeId);
        const hasHijos = nodo.hijos && nodo.hijos.length > 0;
        const hasPermisos = nodo.permisos && nodo.permisos.length > 0;
        const allSelected = areAllPermisosSelected(nodo);
        const someSelected = areSomePermisosSelected(nodo);

        return e('div', {
            key: nodeId,
            style: {
                marginLeft: `${nivel * 1.5}rem`
            }
        }, [
            // Nodo principal
            e('div', {
                key: 'node-header',
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.5rem',
                    marginBottom: '0.25rem',
                    borderRadius: '6px',
                    cursor: hasHijos ? 'pointer' : 'default',
                    transition: 'all 0.2s',
                    backgroundColor: someSelected ? '#fef3c7' : (allSelected ? '#dcfce7' : 'transparent')
                },
                onClick: hasHijos ? () => toggleNode(nodeId) : undefined,
                onMouseEnter: (e) => {
                    if (hasHijos) e.currentTarget.style.backgroundColor = '#f3f4f6';
                },
                onMouseLeave: (e) => {
                    e.currentTarget.style.backgroundColor = someSelected ? '#fef3c7' : (allSelected ? '#dcfce7' : 'transparent');
                }
            }, [
                // Icono de expansión
                hasHijos && e('div', {
                    key: 'expand-icon',
                    style: {
                        marginRight: '0.5rem',
                        color: '#6b7280',
                        transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s'
                    }
                }, Icons.chevronRight()),

                // Checkbox para nodos con permisos
                (hasPermisos && !readOnly) && e('input', {
                    key: 'node-checkbox',
                    type: 'checkbox',
                    checked: allSelected,
                    ref: (el) => {
                        if (el && someSelected) {
                            el.indeterminate = true;
                        }
                    },
                    onChange: (e) => {
                        e.stopPropagation();
                        handleNodeToggle(nodo, e.target.checked);
                    },
                    style: {
                        marginRight: '0.75rem',
                        width: '16px',
                        height: '16px',
                        accentColor: '#dc2626'
                    }
                }),

                // Icono del nodo
                e('div', {
                    key: 'node-icon',
                    style: {
                        marginRight: '0.75rem',
                        color: allSelected ? '#059669' : (someSelected ? '#d97706' : '#6b7280')
                    }
                }, nodo.icono),

                // Información del nodo
                e('div', {
                    key: 'node-info',
                    style: { flex: '1' }
                }, [
                    e('div', {
                        key: 'node-name',
                        style: {
                            fontSize: '0.875rem',
                            fontWeight: hasHijos ? '600' : '500',
                            color: allSelected ? '#059669' : '#374151',
                            marginBottom: nodo.descripcion ? '0.25rem' : '0'
                        }
                    }, nodo.nombre),

                    nodo.descripcion && e('div', {
                        key: 'node-description',
                        style: {
                            fontSize: '0.75rem',
                            color: '#9ca3af',
                            lineHeight: '1.3'
                        }
                    }, nodo.descripcion)
                ]),

                // Contador de permisos
                (hasPermisos || hasHijos) && e('div', {
                    key: 'permissions-count',
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        marginLeft: '0.5rem'
                    }
                }, [
                    hasPermisos && e('span', {
                        key: 'permisos-badge',
                        style: {
                            padding: '0.125rem 0.375rem',
                            borderRadius: '9999px',
                            fontSize: '0.6875rem',
                            fontWeight: '500',
                            backgroundColor: allSelected ? '#dcfce7' : (someSelected ? '#fef3c7' : '#f3f4f6'),
                            color: allSelected ? '#16a34a' : (someSelected ? '#d97706' : '#6b7280')
                        }
                    }, `${nodo.permisos?.filter(p => isPermisoSelected(p)).length || 0}/${nodo.permisos?.length || 0}`)
                ])
            ]),

            // Permisos individuales (si están expandidos y es un nodo hoja)
            isExpanded && hasPermisos && !hasHijos && e('div', {
                key: 'permissions-list',
                style: {
                    marginLeft: '2rem',
                    marginBottom: '0.5rem'
                }
            }, nodo.permisos.map(permiso =>
                e('div', {
                    key: `permiso-${permiso}`,
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0.375rem 0.5rem',
                        marginBottom: '0.25rem',
                        borderRadius: '4px',
                        backgroundColor: isPermisoSelected(permiso) ? '#f0f9ff' : 'transparent',
                        border: isPermisoSelected(permiso) ? '1px solid #bae6fd' : '1px solid transparent'
                    }
                }, [
                    !readOnly && e('input', {
                        key: 'permiso-checkbox',
                        type: 'checkbox',
                        checked: isPermisoSelected(permiso),
                        onChange: (e) => onPermisoChange(permiso, e.target.checked),
                        style: {
                            marginRight: '0.75rem',
                            width: '14px',
                            height: '14px',
                            accentColor: '#3b82f6'
                        }
                    }),

                    e('div', {
                        key: 'permiso-info',
                        style: { flex: '1' }
                    }, [
                        e('div', {
                            key: 'permiso-action',
                            style: {
                                fontSize: '0.8125rem',
                                fontWeight: '500',
                                color: isPermisoSelected(permiso) ? '#1e40af' : '#374151'
                            }
                        }, permiso.split('.')[1]?.replace('_', ' ').toUpperCase()),

                        e('div', {
                            key: 'permiso-code',
                            style: {
                                fontSize: '0.6875rem',
                                color: '#9ca3af',
                                fontFamily: 'monospace',
                                marginTop: '0.125rem'
                            }
                        }, permiso)
                    ])
                ])
            )),

            // Nodos hijos
            isExpanded && hasHijos && e('div', {
                key: 'children',
                style: { marginBottom: '0.5rem' }
            }, nodo.hijos.map(hijoId => renderNode(hijoId, nivel + 1)))
        ]);
    };

    return e('div', {
        style: {
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            maxHeight: '600px',
            overflow: 'auto'
        }
    }, [
        // Header con controles
        e('div', {
            key: 'tree-header',
            style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
                paddingBottom: '1rem',
                borderBottom: '1px solid #e5e7eb'
            }
        }, [
            e('h3', {
                key: 'tree-title',
                style: {
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    color: '#111827',
                    margin: '0'
                }
            }, 'Estructura de Permisos'),

            e('div', {
                key: 'tree-controls',
                style: { display: 'flex', gap: '0.5rem' }
            }, [
                e('button', {
                    key: 'expand-all',
                    onClick: expandAll,
                    style: {
                        padding: '0.375rem 0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        backgroundColor: 'white',
                        color: '#374151',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                    }
                }, [Icons.plus(), 'Expandir']),

                e('button', {
                    key: 'collapse-all',
                    onClick: collapseAll,
                    style: {
                        padding: '0.375rem 0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        backgroundColor: 'white',
                        color: '#374151',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                    }
                }, [Icons.minus(), 'Colapsar'])
            ])
        ]),

        // Resumen de selección
        e('div', {
            key: 'selection-summary',
            style: {
                padding: '0.75rem 1rem',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                marginBottom: '1rem',
                fontSize: '0.875rem',
                color: '#64748b'
            }
        }, [
            e('div', {
                key: 'summary-info',
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }
            }, [
                Icons.info(),
                `${selectedPermisos.length} permisos seleccionados de ${Object.values(estructuraArbol).reduce((total, nodo) => total + (nodo.permisos?.length || 0), 0)} disponibles`
            ])
        ]),

        // Árbol de permisos
        e('div', {
            key: 'permissions-tree',
            style: {
                fontSize: '0.875rem',
                lineHeight: '1.5'
            }
        }, renderNode('root'))
    ]);
}

export default PermisosTree;
