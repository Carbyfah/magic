// src/resources/js/components/reservaciones/ReservasList.js
import React from 'react';
import Icons from '../../utils/Icons';
import Notifications from '../../utils/notifications';

const { createElement: e, useState, useEffect } = React;

function ReservasList({ onEdit, onView, onDelete, refreshTrigger }) {
    // Estados principales
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtros, setFiltros] = useState({
        search: '',
        estado: '',
        fecha_desde: '',
        fecha_hasta: '',
        ruta: '',
        empleado: '',
        agencia: ''
    });

    // Estados para catálogos
    const [estados, setEstados] = useState([]);
    const [rutas, setRutas] = useState([]);
    const [empleados, setEmpleados] = useState([]);
    const [agencias, setAgencias] = useState([]);

    // Estados de vista
    const [vistaActual, setVistaActual] = useState('lista'); // 'lista' o 'cards'
    const [paginaActual, setPaginaActual] = useState(1);
    const [itemsPorPagina] = useState(20);

    useEffect(() => {
        fetchReservas();
        fetchCatalogos();
    }, [refreshTrigger, filtros, paginaActual]);

    const fetchReservas = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: paginaActual,
                per_page: itemsPorPagina,
                ...Object.fromEntries(
                    Object.entries(filtros).filter(([_, value]) => value !== '')
                )
            });

            const response = await fetch(`/api/v1/reservas?${params}`);
            const data = await response.json();
            setReservas(data.data || []);
        } catch (error) {
            Notifications.error('Error al cargar reservas', 'Error');
        } finally {
            setLoading(false);
        }
    };

    const fetchCatalogos = async () => {
        try {
            const [estadosRes, rutasRes, empleadosRes, agenciasRes] = await Promise.all([
                fetch('/api/v1/estados-reserva'),
                fetch('/api/v1/rutas'),
                fetch('/api/v1/empleados'),
                fetch('/api/v1/agencias')
            ]);

            setEstados((await estadosRes.json()).data || []);
            setRutas((await rutasRes.json()).data || []);
            setEmpleados((await empleadosRes.json()).data || []);
            setAgencias((await agenciasRes.json()).data || []);
        } catch (error) {
            console.error('Error al cargar catálogos:', error);
        }
    };

    const handleFiltroChange = (campo, valor) => {
        setFiltros(prev => ({
            ...prev,
            [campo]: valor
        }));
        setPaginaActual(1); // Reset a primera página
    };

    const limpiarFiltros = () => {
        setFiltros({
            search: '',
            estado: '',
            fecha_desde: '',
            fecha_hasta: '',
            ruta: '',
            empleado: '',
            agencia: ''
        });
        setPaginaActual(1);
    };

    const getEstadoBadge = (estado) => {
        const colores = {
            'PEND': { bg: '#fef3c7', text: '#d97706', label: 'Pendiente' },
            'CONF': { bg: '#d1fae5', text: '#10b981', label: 'Confirmada' },
            'EJEC': { bg: '#dbeafe', text: '#3b82f6', label: 'En Ejecución' },
            'FIN': { bg: '#f3f4f6', text: '#6b7280', label: 'Finalizada' },
            'CANC': { bg: '#fee2e2', text: '#ef4444', label: 'Cancelada' }
        };

        const config = colores[estado?.codigo] || colores['PEND'];

        return e('span', {
            style: {
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: '500',
                backgroundColor: config.bg,
                color: config.text
            }
        }, config.label);
    };

    const renderVista = () => {
        if (loading) {
            return e('div', {
                style: {
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '200px'
                }
            }, [
                e('div', {
                    key: 'loading-spinner',
                    style: {
                        width: '48px',
                        height: '48px',
                        border: '4px solid #f3f4f6',
                        borderTop: '4px solid #3b82f6',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }
                })
            ]);
        }

        if (reservas.length === 0) {
            return e('div', {
                style: {
                    textAlign: 'center',
                    padding: '3rem',
                    color: '#6b7280'
                }
            }, [
                e('div', { key: 'empty-icon', style: { fontSize: '3rem', marginBottom: '1rem' } }, Icons.calendar()),
                e('h3', { key: 'empty-title', style: { fontSize: '1.25rem', fontWeight: '600', margin: '0 0 0.5rem 0' } }, 'No se encontraron reservas'),
                e('p', { key: 'empty-desc', style: { margin: '0' } }, 'Intente modificar los filtros de búsqueda')
            ]);
        }

        return vistaActual === 'lista' ? renderTabla() : renderCards();
    };

    const renderTabla = () => {
        return e('div', {
            style: {
                backgroundColor: 'white',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid #e5e7eb'
            }
        }, [
            e('table', {
                key: 'reservas-table',
                style: { width: '100%', borderCollapse: 'collapse' }
            }, [
                // Header
                e('thead', {
                    key: 'thead',
                    style: { backgroundColor: '#f8fafc' }
                }, [
                    e('tr', { key: 'header-row' }, [
                        e('th', { key: 'th-numero', style: { padding: '1rem', textAlign: 'left', fontWeight: '600', fontSize: '0.875rem', color: '#374151' } }, 'Número'),
                        e('th', { key: 'th-pasajero', style: { padding: '1rem', textAlign: 'left', fontWeight: '600', fontSize: '0.875rem', color: '#374151' } }, 'Pasajero Principal'),
                        e('th', { key: 'th-ruta', style: { padding: '1rem', textAlign: 'left', fontWeight: '600', fontSize: '0.875rem', color: '#374151' } }, 'Ruta'),
                        e('th', { key: 'th-fecha', style: { padding: '1rem', textAlign: 'left', fontWeight: '600', fontSize: '0.875rem', color: '#374151' } }, 'Fecha Viaje'),
                        e('th', { key: 'th-pax', style: { padding: '1rem', textAlign: 'center', fontWeight: '600', fontSize: '0.875rem', color: '#374151' } }, 'PAX'),
                        e('th', { key: 'th-estado', style: { padding: '1rem', textAlign: 'center', fontWeight: '600', fontSize: '0.875rem', color: '#374151' } }, 'Estado'),
                        e('th', { key: 'th-acciones', style: { padding: '1rem', textAlign: 'center', fontWeight: '600', fontSize: '0.875rem', color: '#374151', width: '120px' } }, 'Acciones')
                    ])
                ]),
                // Body
                e('tbody', { key: 'tbody' }, reservas.map((reserva, index) =>
                    e('tr', {
                        key: reserva.id,
                        style: {
                            borderBottom: index < reservas.length - 1 ? '1px solid #f3f4f6' : 'none',
                            transition: 'background-color 0.2s'
                        },
                        onMouseEnter: (e) => e.currentTarget.style.backgroundColor = '#f9fafb',
                        onMouseLeave: (e) => e.currentTarget.style.backgroundColor = 'transparent'
                    }, [
                        e('td', {
                            key: 'numero',
                            style: { padding: '1rem', fontSize: '0.875rem', fontWeight: '600', color: '#1f2937' }
                        }, reserva.numero_reserva),
                        e('td', {
                            key: 'pasajero',
                            style: { padding: '1rem', fontSize: '0.875rem', color: '#374151' }
                        }, reserva.nombre_pasajero_principal),
                        e('td', {
                            key: 'ruta',
                            style: { padding: '1rem', fontSize: '0.875rem', color: '#374151' }
                        }, reserva.ruta?.nombre_ruta || 'Sin ruta'),
                        e('td', {
                            key: 'fecha',
                            style: { padding: '1rem', fontSize: '0.875rem', color: '#374151' }
                        }, new Date(reserva.fecha_viaje).toLocaleDateString('es-GT')),
                        e('td', {
                            key: 'pax',
                            style: { padding: '1rem', fontSize: '0.875rem', color: '#374151', textAlign: 'center' }
                        }, `${reserva.pax_adultos + (reserva.pax_ninos || 0)}`),
                        e('td', {
                            key: 'estado',
                            style: { padding: '1rem', textAlign: 'center' }
                        }, getEstadoBadge(reserva.estado_reserva)),
                        e('td', {
                            key: 'acciones',
                            style: { padding: '1rem', textAlign: 'center' }
                        }, [
                            e('div', {
                                key: 'actions-container',
                                style: { display: 'flex', gap: '0.5rem', justifyContent: 'center' }
                            }, [
                                e('button', {
                                    key: 'btn-view',
                                    onClick: () => onView && onView(reserva),
                                    style: {
                                        padding: '0.5rem',
                                        borderRadius: '6px',
                                        border: '1px solid #d1d5db',
                                        backgroundColor: 'white',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }
                                }, Icons.eye('#6b7280')),
                                e('button', {
                                    key: 'btn-edit',
                                    onClick: () => onEdit && onEdit(reserva),
                                    style: {
                                        padding: '0.5rem',
                                        borderRadius: '6px',
                                        border: '1px solid #d1d5db',
                                        backgroundColor: 'white',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }
                                }, Icons.edit('#3b82f6'))
                            ])
                        ])
                    ])
                ))
            ])
        ]);
    };

    const renderCards = () => {
        return e('div', {
            style: {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: '1.5rem'
            }
        }, reservas.map(reserva =>
            e('div', {
                key: reserva.id,
                style: {
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    transition: 'transform 0.2s',
                    cursor: 'pointer'
                },
                onClick: () => onView && onView(reserva),
                onMouseEnter: (e) => e.currentTarget.style.transform = 'translateY(-2px)',
                onMouseLeave: (e) => e.currentTarget.style.transform = 'translateY(0)'
            }, [
                // Header de la card
                e('div', {
                    key: 'card-header',
                    style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1rem'
                    }
                }, [
                    e('h4', {
                        key: 'numero',
                        style: {
                            fontSize: '1.125rem',
                            fontWeight: '600',
                            color: '#1f2937',
                            margin: '0'
                        }
                    }, reserva.numero_reserva),
                    getEstadoBadge(reserva.estado_reserva)
                ]),
                // Contenido de la card
                e('div', {
                    key: 'card-content',
                    style: { marginBottom: '1rem' }
                }, [
                    e('p', {
                        key: 'pasajero',
                        style: {
                            fontSize: '1rem',
                            fontWeight: '500',
                            color: '#374151',
                            margin: '0 0 0.5rem 0'
                        }
                    }, reserva.nombre_pasajero_principal),
                    e('p', {
                        key: 'ruta',
                        style: {
                            fontSize: '0.875rem',
                            color: '#6b7280',
                            margin: '0 0 0.25rem 0'
                        }
                    }, reserva.ruta?.nombre_ruta || 'Sin ruta'),
                    e('div', {
                        key: 'details',
                        style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '0.875rem',
                            color: '#6b7280'
                        }
                    }, [
                        e('span', { key: 'fecha' }, new Date(reserva.fecha_viaje).toLocaleDateString('es-GT')),
                        e('span', { key: 'pax' }, `${reserva.pax_adultos + (reserva.pax_ninos || 0)} PAX`)
                    ])
                ])
            ])
        ));
    };

    return e('div', {
        style: {
            padding: '1rem',
            maxWidth: '100%'
        }
    }, [
        // Filtros avanzados
        e('div', {
            key: 'filtros',
            style: {
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '1.5rem',
                border: '1px solid #e5e7eb'
            }
        }, [
            // Primera fila de filtros
            e('div', {
                key: 'filtros-row-1',
                style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1rem',
                    marginBottom: '1rem'
                }
            }, [
                // Búsqueda general
                e('div', { key: 'search-container', style: { position: 'relative' } }, [
                    e('input', {
                        key: 'search-input',
                        type: 'text',
                        placeholder: 'Buscar por número, pasajero, hotel...',
                        value: filtros.search,
                        onChange: (e) => handleFiltroChange('search', e.target.value),
                        style: {
                            width: '100%',
                            padding: '0.75rem 1rem 0.75rem 2.5rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '0.875rem'
                        }
                    }),
                    e('div', {
                        key: 'search-icon',
                        style: {
                            position: 'absolute',
                            left: '0.75rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#9ca3af'
                        }
                    }, Icons.search())
                ]),
                // Filtro por estado
                e('select', {
                    key: 'estado-filter',
                    value: filtros.estado,
                    onChange: (e) => handleFiltroChange('estado', e.target.value),
                    style: {
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '0.875rem'
                    }
                }, [
                    e('option', { key: 'estado-all', value: '' }, 'Todos los estados'),
                    ...estados.map(estado =>
                        e('option', { key: estado.id, value: estado.id }, estado.nombre_estado)
                    )
                ])
            ]),
            // Segunda fila de filtros
            e('div', {
                key: 'filtros-row-2',
                style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    marginBottom: '1rem'
                }
            }, [
                // Fecha desde
                e('input', {
                    key: 'fecha-desde',
                    type: 'date',
                    placeholder: 'Fecha desde',
                    value: filtros.fecha_desde,
                    onChange: (e) => handleFiltroChange('fecha_desde', e.target.value),
                    style: {
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '0.875rem'
                    }
                }),
                // Fecha hasta
                e('input', {
                    key: 'fecha-hasta',
                    type: 'date',
                    placeholder: 'Fecha hasta',
                    value: filtros.fecha_hasta,
                    onChange: (e) => handleFiltroChange('fecha_hasta', e.target.value),
                    style: {
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '0.875rem'
                    }
                }),
                // Filtro por ruta
                e('select', {
                    key: 'ruta-filter',
                    value: filtros.ruta,
                    onChange: (e) => handleFiltroChange('ruta', e.target.value),
                    style: {
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '0.875rem'
                    }
                }, [
                    e('option', { key: 'ruta-all', value: '' }, 'Todas las rutas'),
                    ...rutas.map(ruta =>
                        e('option', { key: ruta.id, value: ruta.id }, ruta.nombre_ruta)
                    )
                ])
            ]),
            // Botones de acción
            e('div', {
                key: 'filtros-actions',
                style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }
            }, [
                e('button', {
                    key: 'btn-limpiar',
                    onClick: limpiarFiltros,
                    style: {
                        padding: '0.75rem 1.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        backgroundColor: 'white',
                        color: '#374151',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }
                }, [
                    e('span', { key: 'clear-icon' }, Icons.refresh()),
                    e('span', { key: 'clear-text' }, 'Limpiar Filtros')
                ]),
                // Toggle vista
                e('div', {
                    key: 'vista-toggle',
                    style: {
                        display: 'flex',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        overflow: 'hidden'
                    }
                }, [
                    e('button', {
                        key: 'btn-lista',
                        onClick: () => setVistaActual('lista'),
                        style: {
                            padding: '0.75rem',
                            border: 'none',
                            backgroundColor: vistaActual === 'lista' ? '#3b82f6' : 'white',
                            color: vistaActual === 'lista' ? 'white' : '#374151',
                            cursor: 'pointer'
                        }
                    }, Icons.list()),
                    e('button', {
                        key: 'btn-cards',
                        onClick: () => setVistaActual('cards'),
                        style: {
                            padding: '0.75rem',
                            border: 'none',
                            backgroundColor: vistaActual === 'cards' ? '#3b82f6' : 'white',
                            color: vistaActual === 'cards' ? 'white' : '#374151',
                            cursor: 'pointer'
                        }
                    }, Icons.grid())
                ])
            ])
        ]),

        // Contenido principal
        renderVista()
    ]);
}

export default ReservasList;
