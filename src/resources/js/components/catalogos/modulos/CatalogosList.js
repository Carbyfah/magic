// src/resources/js/components/catalogos/modulos/CatalogosList.js
import React from 'react';
import Icons from '../../../utils/Icons';

const { createElement: e, useState } = React;

function CatalogosList({ onSelectCatalogo }) {
    const [searchTerm, setSearchTerm] = useState('');

    // Definición de todos los catálogos disponibles
    const catalogos = [
        // GRUPO 1 - CRÍTICOS PARA OPERACIÓN ✅ YA IMPLEMENTADOS
        {
            id: 'estados_reserva',
            nombre: 'Estados de Reserva',
            descripcion: 'Estados del flujo de reservas (Pendiente, Confirmada, etc.)',
            categoria: 'Operación',
            icono: Icons.clock(),
            color: '#10b981',
            prioridad: 1,
            registros: 6,
            habilitado: true,
            archivo: 'EstadosReserva.js'
        },
        {
            id: 'formas_pago',
            nombre: 'Formas de Pago',
            descripcion: 'Métodos de pago disponibles (Efectivo, Tarjeta, etc.)',
            categoria: 'Comercial',
            icono: Icons.creditCard(),
            color: '#3b82f6',
            prioridad: 1,
            registros: 8,
            habilitado: true,
            archivo: 'FormasPago.js'
        },
        {
            id: 'tipos_cliente',
            nombre: 'Tipos de Cliente',
            descripcion: 'Clasificación de clientes (Individual, Agencia, etc.)',
            categoria: 'Comercial',
            icono: Icons.users(),
            color: '#8b5cf6',
            prioridad: 1,
            registros: 4,
            habilitado: true,
            archivo: 'TiposCliente.js'
        },
        {
            id: 'paises',
            nombre: 'Países',
            descripcion: 'Catálogo de países para agencias internacionales',
            categoria: 'Geografía',
            icono: Icons.globe(),
            color: '#06b6d4',
            prioridad: 1,
            registros: 25,
            habilitado: true,
            archivo: 'Paises.js'
        },

        // GRUPO 2 - SECUNDARIOS ✅ RECIÉN IMPLEMENTADOS
        {
            id: 'tipos_persona',
            nombre: 'Tipos de Persona',
            descripcion: 'Clasificación de personas (Empleado, Cliente, etc.)',
            categoria: 'Personas',
            icono: Icons.user(),
            color: '#f59e0b',
            prioridad: 2,
            registros: 3,
            habilitado: true,  // ✅ RECIÉN IMPLEMENTADO
            archivo: 'TiposPersona.js'
        },
        {
            id: 'roles',
            nombre: 'Roles de Usuario',
            descripcion: 'Roles y permisos del sistema',
            categoria: 'Seguridad',
            icono: Icons.shield(),
            color: '#ef4444',
            prioridad: 2,
            registros: 5,
            habilitado: true,  // ✅ RECIÉN IMPLEMENTADO
            archivo: 'Roles.js'
        },
        {
            id: 'estados_empleado',
            nombre: 'Estados de Empleado',
            descripcion: 'Estados de los empleados (Activo, Licencia, etc.)',
            categoria: 'Recursos Humanos',
            icono: Icons.userCheck(),
            color: '#14b8a6',
            prioridad: 2,
            registros: 6,
            habilitado: true,  // ✅ RECIÉN IMPLEMENTADO
            archivo: 'EstadosEmpleado.js'
        },
        {
            id: 'tipos_vehiculo',
            nombre: 'Tipos de Vehículo',
            descripcion: 'Clasificación de vehículos (Bus, Van, etc.)',
            categoria: 'Flota',
            icono: Icons.truck(),
            color: '#a855f7',
            prioridad: 2,
            registros: 5,
            habilitado: true,  // ✅ RECIÉN IMPLEMENTADO
            archivo: 'TiposVehiculo.js'
        },

        // GRUPO 3 - AVANZADOS ✅ RECIÉN IMPLEMENTADOS
        {
            id: 'tipos_licencia',
            nombre: 'Tipos de Licencia',
            descripcion: 'Tipos de licencias de conducir',
            categoria: 'Recursos Humanos',
            icono: Icons.card(),
            color: '#84cc16',
            prioridad: 3,
            registros: 4,
            habilitado: true,  // ✅ RECIÉN IMPLEMENTADO
            archivo: 'TiposLicencia.js'
        },
        {
            id: 'tipos_combustible',
            nombre: 'Tipos de Combustible',
            descripcion: 'Tipos de combustible para vehículos',
            categoria: 'Flota',
            icono: Icons.fuel(),
            color: '#f97316',
            prioridad: 3,
            registros: 3,
            habilitado: true,  // ✅ RECIÉN IMPLEMENTADO
            archivo: 'TiposCombustible.js'
        },
        {
            id: 'estados_vehiculo',
            nombre: 'Estados de Vehículo',
            descripcion: 'Estados de los vehículos (Disponible, Mantenimiento, etc.)',
            categoria: 'Flota',
            icono: Icons.settings(),
            color: '#6b7280',
            prioridad: 3,
            registros: 5,
            habilitado: true,  // ✅ RECIÉN IMPLEMENTADO
            archivo: 'EstadosVehiculo.js'
        },
        {
            id: 'tipos_agencia',
            nombre: 'Tipos de Agencia',
            descripcion: 'Clasificación de agencias colaboradoras',
            categoria: 'Comercial',
            icono: Icons.building(),
            color: '#ec4899',
            prioridad: 3,
            registros: 4,
            habilitado: true,  // ✅ RECIÉN IMPLEMENTADO
            archivo: 'TiposAgencia.js'
        },
        // GRUPO 3 - NUEVOS CATÁLOGOS COMERCIALES Y OPERATIVOS
        {
            id: 'estados_comercial',
            nombre: 'Estados Comerciales',
            descripcion: 'Estados comerciales de clientes y agencias (Activo, Suspendido, Moroso)',
            categoria: 'Comercial',
            icono: Icons.trendingUp(),
            color: '#10b981',
            prioridad: 2,
            registros: 5,
            habilitado: true,
            archivo: 'EstadosComercial.js'
        },
        {
            id: 'estados_ruta',
            nombre: 'Estados de Ruta',
            descripcion: 'Estados de las rutas (Activa, Inactiva, Temporal, Cancelada)',
            categoria: 'Operación',
            icono: Icons.route(),
            color: '#3b82f6',
            prioridad: 1,
            registros: 4,
            habilitado: true,
            archivo: 'EstadosRuta.js'
        },
        {
            id: 'tipos_venta',
            nombre: 'Tipos de Venta',
            descripcion: 'Tipos de venta (Directa, Agencia, Online, Shuttle, Tour)',
            categoria: 'Comercial',
            icono: Icons.tag(),
            color: '#8b5cf6',
            prioridad: 2,
            registros: 6,
            habilitado: true,
            archivo: 'TiposVenta.js'
        },
        {
            id: 'estados_venta',
            nombre: 'Estados de Venta',
            descripcion: 'Estados de las ventas (Activa, Cancelada, Reembolso, Anulada)',
            categoria: 'Comercial',
            icono: Icons.dollarSign(),
            color: '#f59e0b',
            prioridad: 2,
            registros: 4,
            habilitado: true,
            archivo: 'EstadosVenta.js'
        },
        {
            id: 'estados_pago',
            nombre: 'Estados de Pago',
            descripcion: 'Estados de pago (Pendiente, Parcial, Pagado, Vencido, Incobrable)',
            categoria: 'Comercial',
            icono: Icons.creditCard(),
            color: '#ef4444',
            prioridad: 2,
            registros: 5,
            habilitado: true,
            archivo: 'EstadosPago.js'
        }
    ];

    // Filtrar catálogos según búsqueda
    const filteredCatalogos = catalogos.filter(catalogo =>
        catalogo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        catalogo.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        catalogo.categoria.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Agrupar por categoría
    const catalogosPorCategoria = filteredCatalogos.reduce((acc, catalogo) => {
        if (!acc[catalogo.categoria]) {
            acc[catalogo.categoria] = [];
        }
        acc[catalogo.categoria].push(catalogo);
        return acc;
    }, {});

    // Función para obtener el badge de prioridad
    const getPrioridadBadge = (prioridad) => {
        const configs = {
            1: { text: 'Crítico', color: '#dc2626', bg: '#fef2f2' },
            2: { text: 'Importante', color: '#d97706', bg: '#fefbf2' },
            3: { text: 'Secundario', color: '#059669', bg: '#f0fdf4' }
        };
        const config = configs[prioridad] || configs[3];

        return e('span', {
            key: 'priority-badge',
            style: {
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.25rem 0.5rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: '500',
                backgroundColor: config.bg,
                color: config.color
            }
        }, config.text);
    };

    return e('div', {
        style: {
            padding: '2rem',
            maxWidth: '1200px',
            margin: '0 auto'
        }
    }, [
        // Header
        e('div', {
            key: 'header',
            style: {
                textAlign: 'center',
                marginBottom: '3rem'
            }
        }, [
            e('h1', {
                key: 'title',
                style: {
                    fontSize: '2.5rem',
                    fontWeight: '700',
                    color: '#111827',
                    marginBottom: '0.5rem'
                }
            }, 'Gestión de Catálogos'),
            e('p', {
                key: 'subtitle',
                style: {
                    fontSize: '1.125rem',
                    color: '#6b7280',
                    marginBottom: '2rem'
                }
            }, 'Administración de catálogos maestros del sistema'),

            // Barra de búsqueda
            e('div', {
                key: 'search-container',
                style: {
                    position: 'relative',
                    maxWidth: '400px',
                    margin: '0 auto'
                }
            }, [
                e('input', {
                    key: 'search',
                    type: 'text',
                    placeholder: 'Buscar catálogos...',
                    value: searchTerm,
                    onChange: (e) => setSearchTerm(e.target.value),
                    style: {
                        width: '100%',
                        padding: '1rem 1rem 1rem 3rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        backgroundColor: 'white',
                        outline: 'none',
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                        transition: 'all 0.2s'
                    },
                    onFocus: (e) => {
                        e.target.style.borderColor = '#3b82f6';
                        e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    },
                    onBlur: (e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                    }
                }),
                e('div', {
                    key: 'search-icon',
                    style: {
                        position: 'absolute',
                        left: '1rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#9ca3af'
                    }
                }, Icons.search())
            ])
        ]),

        // Lista de catálogos por categoría
        e('div', {
            key: 'catalogos',
            style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '2rem'
            }
        }, Object.entries(catalogosPorCategoria).map(([categoria, catalogosCategoria]) =>
            e('div', {
                key: categoria,
                style: {
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    border: '1px solid #e5e7eb',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }
            }, [
                // Header de categoría
                e('div', {
                    key: `categoria-header-${categoria}`,
                    style: {
                        backgroundColor: '#f9fafb',
                        padding: '1rem 1.5rem',
                        borderBottom: '1px solid #e5e7eb'
                    }
                }, [
                    e('h2', {
                        key: `categoria-title-${categoria}`,
                        style: {
                            fontSize: '1.25rem',
                            fontWeight: '600',
                            color: '#111827',
                            margin: 0
                        }
                    }, categoria),
                    e('p', {
                        key: `categoria-count-${categoria}`,
                        style: {
                            fontSize: '0.875rem',
                            color: '#6b7280',
                            margin: '0.25rem 0 0 0'
                        }
                    }, `${catalogosCategoria.length} catálogo${catalogosCategoria.length !== 1 ? 's' : ''}`)
                ]),

                // Grid de catálogos
                e('div', {
                    key: `catalogos-grid-${categoria}`,
                    style: {
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                        gap: '0',
                        padding: '0'
                    }
                }, catalogosCategoria.map((catalogo, index) =>
                    e('div', {
                        key: `catalogo-${catalogo.id}`,
                        onClick: () => catalogo.habilitado && onSelectCatalogo(catalogo.id),
                        style: {
                            padding: '1.5rem',
                            borderBottom: index < catalogosCategoria.length - 1 ? '1px solid #f3f4f6' : 'none',
                            borderRight: index % 2 === 0 && index < catalogosCategoria.length - 1 ? '1px solid #f3f4f6' : 'none',
                            cursor: catalogo.habilitado ? 'pointer' : 'not-allowed',
                            transition: 'all 0.2s',
                            position: 'relative',
                            opacity: catalogo.habilitado ? 1 : 0.6
                        },
                        onMouseEnter: (e) => {
                            if (catalogo.habilitado) {
                                e.currentTarget.style.backgroundColor = '#f9fafb';
                            }
                        },
                        onMouseLeave: (e) => {
                            e.currentTarget.style.backgroundColor = 'white';
                        }
                    }, [
                        e('div', {
                            key: `catalogo-content-${catalogo.id}`,
                            style: {
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '1rem'
                            }
                        }, [
                            // Icono
                            e('div', {
                                key: `icon-${catalogo.id}`,
                                style: {
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: `${catalogo.color}15`,
                                    color: catalogo.color,
                                    flexShrink: 0
                                }
                            }, catalogo.icono),

                            // Información
                            e('div', {
                                key: `info-${catalogo.id}`,
                                style: {
                                    flex: 1,
                                    minWidth: 0
                                }
                            }, [
                                e('div', {
                                    key: `header-row-${catalogo.id}`,
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        marginBottom: '0.5rem'
                                    }
                                }, [
                                    e('h3', {
                                        key: `name-${catalogo.id}`,
                                        style: {
                                            fontSize: '1.125rem',
                                            fontWeight: '600',
                                            color: '#111827',
                                            margin: 0
                                        }
                                    }, catalogo.nombre),
                                    getPrioridadBadge(catalogo.prioridad)
                                ]),
                                e('p', {
                                    key: `description-${catalogo.id}`,
                                    style: {
                                        fontSize: '0.875rem',
                                        color: '#6b7280',
                                        margin: '0 0 0.75rem 0',
                                        lineHeight: '1.4'
                                    }
                                }, catalogo.descripcion),
                                e('div', {
                                    key: `stats-${catalogo.id}`,
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem'
                                    }
                                }, [
                                    e('div', {
                                        key: `count-${catalogo.id}`,
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.25rem',
                                            fontSize: '0.75rem',
                                            color: '#9ca3af'
                                        }
                                    }, [
                                        e('span', { key: 'db-icon' }, Icons.database()),
                                        e('span', { key: 'db-text' }, `${catalogo.registros} registro${catalogo.registros !== 1 ? 's' : ''}`)
                                    ]),
                                    e('div', {
                                        key: `status-${catalogo.id}`,
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.25rem',
                                            fontSize: '0.75rem',
                                            color: catalogo.habilitado ? '#10b981' : '#f59e0b'
                                        }
                                    }, [
                                        e('span', { key: 'status-icon' }, catalogo.habilitado ? Icons.checkCircle() : Icons.clock()),
                                        e('span', { key: 'status-text' }, catalogo.habilitado ? 'Disponible' : 'Pendiente')
                                    ])
                                ])
                            ])
                        ]),

                        // Flecha indicadora (solo si habilitado)
                        catalogo.habilitado && e('div', {
                            key: `arrow-${catalogo.id}`,
                            style: {
                                position: 'absolute',
                                right: '1rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#d1d5db',
                                transition: 'all 0.2s'
                            }
                        }, Icons.chevronRight())
                    ])
                ))
            ])
        )),

        // Estadísticas generales
        e('div', {
            key: 'stats',
            style: {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1rem',
                marginTop: '2rem'
            }
        }, [
            e('div', {
                key: 'total-catalogos',
                style: {
                    backgroundColor: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    textAlign: 'center'
                }
            }, [
                e('div', {
                    key: 'total-catalogos-icon',
                    style: {
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        backgroundColor: '#eff6ff',
                        color: '#3b82f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem auto'
                    }
                }, Icons.folder()),
                e('p', {
                    key: 'total-catalogos-number',
                    style: {
                        fontSize: '2rem',
                        fontWeight: '700',
                        color: '#111827',
                        margin: '0'
                    }
                }, catalogos.length),
                e('p', {
                    key: 'total-catalogos-label',
                    style: {
                        fontSize: '0.875rem',
                        color: '#6b7280',
                        margin: '0.25rem 0 0 0'
                    }
                }, 'Catálogos Totales')
            ]),

            e('div', {
                key: 'catalogos-habilitados',
                style: {
                    backgroundColor: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    textAlign: 'center'
                }
            }, [
                e('div', {
                    key: 'habilitados-icon',
                    style: {
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        backgroundColor: '#f0fdf4',
                        color: '#10b981',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem auto'
                    }
                }, Icons.checkCircle()),
                e('p', {
                    key: 'habilitados-number',
                    style: {
                        fontSize: '2rem',
                        fontWeight: '700',
                        color: '#111827',
                        margin: '0'
                    }
                }, catalogos.filter(cat => cat.habilitado).length),
                e('p', {
                    key: 'habilitados-label',
                    style: {
                        fontSize: '0.875rem',
                        color: '#6b7280',
                        margin: '0.25rem 0 0 0'
                    }
                }, 'Disponibles')
            ]),

            e('div', {
                key: 'total-registros',
                style: {
                    backgroundColor: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    textAlign: 'center'
                }
            }, [
                e('div', {
                    key: 'total-registros-icon',
                    style: {
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        backgroundColor: '#fef7ff',
                        color: '#a855f7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem auto'
                    }
                }, Icons.database()),
                e('p', {
                    key: 'total-registros-number',
                    style: {
                        fontSize: '2rem',
                        fontWeight: '700',
                        color: '#111827',
                        margin: '0'
                    }
                }, catalogos.reduce((sum, cat) => sum + cat.registros, 0)),
                e('p', {
                    key: 'total-registros-label',
                    style: {
                        fontSize: '0.875rem',
                        color: '#6b7280',
                        margin: '0.25rem 0 0 0'
                    }
                }, 'Registros Totales')
            ])
        ])
    ]);
}

export default CatalogosList;
