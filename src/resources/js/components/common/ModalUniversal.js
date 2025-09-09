// src/resources/js/components/common/ModalUniversal.js
import React from 'react';
import Icons from '../../utils/Icons';
import CityAutocomplete from './CityAutocomplete';

const { createElement: e, useState, useEffect } = React;

// COMPONENTE SEARCHABLE SELECT MEJORADO
const SearchableSelect = ({
    value,
    onChange,
    options,
    placeholder = "Buscar...",
    style = {},
    hasError = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredOptions, setFilteredOptions] = useState(options);
    const containerRef = React.useRef(null);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredOptions(options);
        } else {
            const filtered = options.filter(option => {
                const label = typeof option === 'object' ? option.label : option;
                return label.toLowerCase().includes(searchTerm.toLowerCase());
            });
            setFilteredOptions(filtered);
        }
    }, [searchTerm, options]);

    // Listener para clicks fuera del componente
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [isOpen]);

    const selectedOption = options.find(opt =>
        (typeof opt === 'object' ? opt.value : opt) === value
    );
    const displayText = selectedOption
        ? (typeof selectedOption === 'object' ? selectedOption.label : selectedOption)
        : '';

    return e('div', {
        ref: containerRef,
        style: { position: 'relative', width: '100%' }
    }, [
        // Input principal
        e('input', {
            key: 'search-input',
            type: 'text',
            value: isOpen ? searchTerm : displayText,
            onChange: (e) => {
                setSearchTerm(e.target.value);
                if (!isOpen) setIsOpen(true);
            },
            onFocus: () => {
                setIsOpen(true);
                setSearchTerm('');
            },
            placeholder: placeholder,
            style: {
                ...style,
                paddingRight: '2.5rem' // Espacio para la flecha
            }
        }),

        // Flecha desplegable
        e('div', {
            key: 'dropdown-arrow',
            onClick: () => {
                setIsOpen(!isOpen);
                if (!isOpen) setSearchTerm('');
            },
            style: {
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                cursor: 'pointer',
                color: '#6b7280',
                fontSize: '0.75rem',
                padding: '0.25rem',
                userSelect: 'none'
            }
        }, isOpen ? '▲' : '▼'),

        // Lista de opciones
        isOpen && e('div', {
            key: 'options-list',
            style: {
                position: 'absolute',
                // Detectar si está cerca del final del contenedor
                ...(containerRef.current &&
                    containerRef.current.getBoundingClientRect().bottom > window.innerHeight - 250
                    ? { bottom: '100%' }  // Abrir hacia arriba si está cerca del final
                    : { top: '100%' }     // Abrir hacia abajo normalmente
                ),
                left: '0',
                right: '0',
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                maxHeight: '150px',  // Reducir un poco la altura
                overflowY: 'auto',
                zIndex: 2500
            }
        }, [
            filteredOptions.length === 0
                ? e('div', {
                    key: 'no-results',
                    style: {
                        padding: '0.75rem',
                        color: '#6b7280',
                        textAlign: 'center',
                        fontSize: '0.875rem'
                    }
                }, 'No se encontraron resultados')
                : filteredOptions.map((option, index) => {
                    const optionValue = typeof option === 'object' ? option.value : option;
                    const optionLabel = typeof option === 'object' ? option.label : option;
                    const isSelected = value === optionValue;

                    return e('div', {
                        key: `option-${index}`,
                        onClick: () => {
                            onChange(optionValue);
                            setIsOpen(false);
                            setSearchTerm('');
                        },
                        style: {
                            padding: '0.75rem',
                            cursor: 'pointer',
                            borderBottom: index < filteredOptions.length - 1 ? '1px solid #f3f4f6' : 'none',
                            backgroundColor: isSelected ? '#f0f9ff' : 'white',
                            color: isSelected ? '#0369a1' : '#374151',
                            fontSize: '0.875rem'
                        },
                        onMouseEnter: (e) => {
                            if (!isSelected) {
                                e.target.style.backgroundColor = '#f9fafb';
                            }
                        },
                        onMouseLeave: (e) => {
                            e.target.style.backgroundColor = isSelected ? '#f0f9ff' : 'white';
                        }
                    }, optionLabel);
                })
        ])
    ]);
};

const ModalUniversal = {

    // MODAL DE CONFIRMACION UNIVERSAL
    confirmacion: ({
        abierto,
        cerrar,
        ejecutar,
        accion,
        item,
        tipoItem,
        loading = false,
        nombreItem = ''
    }) => {
        if (!abierto) return null;

        const configuraciones = {
            activar: {
                titulo: `Activar ${tipoItem}`,
                mensaje: `¿Está seguro que desea activar ${nombreItem}?`,
                backgroundColor: '#dcfce7',
                color: '#16a34a',
                icono: Icons.play('#16a34a'),
                botonTexto: 'Activar',
                botonColor: '#16a34a'
            },
            desactivar: {
                titulo: `Desactivar ${tipoItem}`,
                mensaje: `¿Está seguro que desea desactivar ${nombreItem}?`,
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                icono: Icons.pause('#dc2626'),
                botonTexto: 'Desactivar',
                botonColor: '#dc2626'
            },
            duplicar: {
                titulo: `Duplicar ${tipoItem}`,
                mensaje: `¿Está seguro que desea duplicar ${nombreItem}?`,
                backgroundColor: '#fef3c7',
                color: '#f59e0b',
                icono: Icons.copy('#f59e0b'),
                botonTexto: 'Duplicar',
                botonColor: '#f59e0b'
            },
            eliminar: {
                titulo: `Eliminar ${tipoItem}`,
                mensaje: `¿Está seguro que desea eliminar ${nombreItem}? Esta acción no se puede deshacer.`,
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                icono: Icons.trash('#dc2626'),
                botonTexto: 'Eliminar',
                botonColor: '#dc2626'
            },
            confirmar: {
                titulo: `Confirmar ${tipoItem}`,
                mensaje: `¿Está seguro que desea confirmar ${nombreItem}?`,
                backgroundColor: '#dbeafe',
                color: '#3b82f6',
                icono: Icons.check('#3b82f6'),
                botonTexto: 'Confirmar',
                botonColor: '#3b82f6'
            },
            cancelar: {
                titulo: `Cancelar ${tipoItem}`,
                mensaje: `¿Está seguro que desea cancelar ${nombreItem}?`,
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                icono: Icons.x('#dc2626'),
                botonTexto: 'Cancelar',
                botonColor: '#dc2626'
            },
            cambiarEstado: {
                titulo: `Cambiar Estado ${tipoItem}`,
                mensaje: `¿Está seguro que desea cambiar el estado de ${nombreItem}?`,
                backgroundColor: '#fef3c7',
                color: '#f59e0b',
                icono: Icons.alertTriangle('#f59e0b'),
                botonTexto: 'Cambiar',
                botonColor: '#f59e0b'
            },
            resetear: {
                titulo: `Resetear ${tipoItem}`,
                mensaje: `¿Está seguro que desea resetear ${nombreItem}?`,
                backgroundColor: '#f0f9ff',
                color: '#0369a1',
                icono: Icons.refresh('#0369a1'),
                botonTexto: 'Resetear',
                botonColor: '#0369a1'
            }
        };

        const config = configuraciones[accion] || configuraciones.cambiarEstado;

        return e('div', {
            key: 'modal-confirmacion-overlay',
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
                zIndex: 1100
            }
        }, [
            e('div', {
                key: 'modal-confirmacion-content',
                style: {
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    maxWidth: '450px',
                    width: '90%',
                    padding: '2rem',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                }
            }, [
                // Header con icono y título
                e('div', {
                    key: 'confirmacion-header',
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginBottom: '1.5rem'
                    }
                }, [
                    e('div', {
                        style: {
                            padding: '0.75rem',
                            borderRadius: '50%',
                            backgroundColor: config.backgroundColor
                        }
                    }, config.icono),
                    e('h3', {
                        style: {
                            fontSize: '1.125rem',
                            fontWeight: '600',
                            color: '#111827',
                            margin: '0'
                        }
                    }, config.titulo)
                ]),

                // Mensaje principal
                e('p', {
                    key: 'confirmacion-message',
                    style: {
                        margin: '0 0 1.5rem 0',
                        color: '#374151',
                        lineHeight: '1.5',
                        fontSize: '0.875rem'
                    }
                }, config.mensaje),

                // Información del item (si existe)
                item && e('div', {
                    key: 'item-info',
                    style: {
                        backgroundColor: '#f9fafb',
                        padding: '1rem',
                        borderRadius: '8px',
                        marginBottom: '1.5rem',
                        fontSize: '0.875rem',
                        color: '#6b7280'
                    }
                }, [
                    e('div', {
                        style: { display: 'grid', gap: '0.5rem' }
                    }, Object.entries(item)
                        .filter(([key]) => ['codigo', 'nombre', 'id', 'precio', 'tipo'].includes(key))
                        .slice(0, 3)
                        .map(([key, value]) =>
                            e('p', {
                                key,
                                style: { margin: '0', display: 'flex', justifyContent: 'space-between' }
                            }, [
                                e('strong', {}, `${key.charAt(0).toUpperCase() + key.slice(1)}: `),
                                e('span', {}, String(value || 'N/A'))
                            ])
                        )
                    )
                ]),

                // Botones de acción
                e('div', {
                    key: 'confirmacion-actions',
                    style: {
                        display: 'flex',
                        gap: '0.75rem',
                        justifyContent: 'flex-end'
                    }
                }, [
                    e('button', {
                        key: 'btn-cancelar',
                        onClick: cerrar,
                        disabled: loading,
                        style: {
                            padding: '0.75rem 1.5rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            backgroundColor: 'white',
                            color: '#374151',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            opacity: loading ? 0.7 : 1
                        }
                    }, 'Cancelar'),

                    e('button', {
                        key: 'btn-confirmar',
                        onClick: ejecutar,
                        disabled: loading,
                        style: {
                            padding: '0.75rem 1.5rem',
                            border: 'none',
                            borderRadius: '8px',
                            backgroundColor: loading ? '#9ca3af' : config.botonColor,
                            color: 'white',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }
                    }, [
                        loading && e('div', {
                            key: 'spinner',
                            style: {
                                width: '16px',
                                height: '16px',
                                border: '2px solid #ffffff40',
                                borderTop: '2px solid #ffffff',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                            }
                        }),
                        loading ? 'Procesando...' : config.botonTexto
                    ])
                ])
            ])
        ]);
    },

    // NUEVO: MODAL DE ACCIONES MASIVAS
    accionesMasivas: ({
        abierto,
        cerrar,
        ejecutar,
        rutas = [],
        accionSeleccionada,
        setAccionSeleccionada,
        rutaSeleccionada,
        setRutaSeleccionada,
        motivoCancelacion = '',
        setMotivoCancelacion,
        loading = false,
        tipoItem = 'reservas'
    }) => {
        if (!abierto) return null;

        const acciones = [
            {
                id: 'confirmar_todas',
                titulo: 'Confirmar Todas las Reservas',
                descripcion: 'Confirmar todas las reservas de la ruta seleccionada',
                color: '#16a34a',
                backgroundColor: '#dcfce7',
                icono: Icons.check('#16a34a'),
                requiereMotivo: false
            },
            {
                id: 'cancelar_todas',
                titulo: 'Cancelar Todas las Reservas',
                descripcion: 'Cancelar todas las reservas de la ruta seleccionada',
                color: '#dc2626',
                backgroundColor: '#fef2f2',
                icono: Icons.x('#dc2626'),
                requiereMotivo: true
            }
        ];

        const accionActual = acciones.find(a => a.id === accionSeleccionada);

        return e('div', {
            key: 'modal-masivas-overlay',
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
                zIndex: 1200,
                padding: '1rem'
            },
            onClick: cerrar
        }, [
            e('div', {
                key: 'modal-masivas-content',
                style: {
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    maxWidth: '600px',
                    width: '100%',
                    maxHeight: '90vh',
                    overflow: 'hidden',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                    display: 'flex',
                    flexDirection: 'column'
                },
                onClick: (e) => e.stopPropagation()
            }, [
                // Header
                e('div', {
                    key: 'masivas-header',
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
                        style: { display: 'flex', alignItems: 'center', gap: '0.75rem' }
                    }, [
                        e('div', {
                            style: {
                                padding: '0.75rem',
                                backgroundColor: '#8b5cf6',
                                borderRadius: '8px',
                                color: 'white'
                            }
                        }, Icons.layers('#ffffff')),
                        e('h3', {
                            style: {
                                fontSize: '1.25rem',
                                fontWeight: '600',
                                color: '#111827',
                                margin: '0'
                            }
                        }, `Acciones Masivas - ${tipoItem}`)
                    ]),
                    e('button', {
                        onClick: cerrar,
                        disabled: loading,
                        style: {
                            padding: '0.5rem',
                            border: 'none',
                            backgroundColor: 'transparent',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            color: '#6b7280',
                            borderRadius: '4px'
                        }
                    }, Icons.x())
                ]),

                // Contenido
                e('div', {
                    key: 'masivas-contenido',
                    style: {
                        padding: '1.5rem',
                        overflow: 'auto',
                        flex: 1
                    }
                }, [
                    // Paso 1: Seleccionar acción
                    e('div', {
                        key: 'paso-accion',
                        style: { marginBottom: '2rem' }
                    }, [
                        e('h4', {
                            style: {
                                fontSize: '1rem',
                                fontWeight: '600',
                                color: '#111827',
                                marginBottom: '1rem'
                            }
                        }, '1. Seleccionar Acción'),

                        e('div', {
                            style: {
                                display: 'grid',
                                gap: '0.75rem'
                            }
                        }, acciones.map(accion =>
                            e('div', {
                                key: accion.id,
                                onClick: () => setAccionSeleccionada(accion.id),
                                style: {
                                    padding: '1rem',
                                    border: accionSeleccionada === accion.id ? `2px solid ${accion.color}` : '2px solid #e5e7eb',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    backgroundColor: accionSeleccionada === accion.id ? accion.backgroundColor : 'white',
                                    transition: 'all 0.2s ease'
                                }
                            }, [
                                e('div', {
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        marginBottom: '0.5rem'
                                    }
                                }, [
                                    e('div', {
                                        style: {
                                            padding: '0.5rem',
                                            borderRadius: '6px',
                                            backgroundColor: accion.backgroundColor
                                        }
                                    }, accion.icono),
                                    e('h5', {
                                        style: {
                                            fontSize: '0.875rem',
                                            fontWeight: '600',
                                            color: accion.color,
                                            margin: '0'
                                        }
                                    }, accion.titulo)
                                ]),
                                e('p', {
                                    style: {
                                        fontSize: '0.75rem',
                                        color: '#6b7280',
                                        margin: '0',
                                        paddingLeft: '2.25rem'
                                    }
                                }, accion.descripcion)
                            ])
                        ))
                    ]),

                    // Paso 2: Seleccionar ruta (solo si hay acción seleccionada)
                    // Paso 2: Filtros de selección
                    accionSeleccionada && e('div', {
                        key: 'paso-filtros',
                        style: { marginBottom: '2rem' }
                    }, [
                        e('h4', {
                            style: {
                                fontSize: '1rem',
                                fontWeight: '600',
                                color: '#111827',
                                marginBottom: '1rem'
                            }
                        }, '2. Seleccionar Ruta Activada'),

                        // Filtro por Ruta Activada
                        e('div', {
                            style: { marginBottom: '1rem' }
                        }, [
                            e('label', {
                                style: {
                                    display: 'block',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    color: '#374151',
                                    marginBottom: '0.5rem'
                                }
                            }, 'Ruta Activada:'),
                            React.createElement(SearchableSelect, {
                                value: rutaSeleccionada || '',
                                onChange: (value) => setRutaSeleccionada(value),
                                options: [
                                    { value: '', label: 'Seleccionar ruta activada...' },
                                    ...rutas.map(ruta => ({
                                        value: ruta.id.toString(),
                                        label: `${ruta.nombre} - ${ruta.fecha} ${ruta.hora} (${ruta.reservas_count} reservas)`
                                    }))
                                ],
                                placeholder: 'Buscar ruta activada...',
                                style: {
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    fontSize: '0.875rem'
                                }
                            })
                        ]),

                        // Resumen de selección
                        rutaSeleccionada && e('div', {
                            style: {
                                padding: '1rem',
                                backgroundColor: '#f0f9ff',
                                borderRadius: '8px',
                                border: '1px solid #bae6fd'
                            }
                        }, [
                            e('p', { style: { margin: '0', fontSize: '0.875rem', color: '#0369a1' } },
                                `Se aplicará a: ${rutas.find(r => r.id == rutaSeleccionada)?.reservas_count || 0} reservas`
                            )
                        ])
                    ]),

                    // Paso 3: Motivo de cancelación (solo si es cancelar_todas)
                    accionActual?.requiereMotivo && rutaSeleccionada && e('div', {
                        key: 'paso-motivo',
                        style: { marginBottom: '2rem' }
                    }, [
                        e('h4', {
                            style: {
                                fontSize: '1rem',
                                fontWeight: '600',
                                color: '#111827',
                                marginBottom: '1rem'
                            }
                        }, '3. Motivo de Cancelación'),

                        e('textarea', {
                            value: motivoCancelacion,
                            onChange: (e) => setMotivoCancelacion(e.target.value),
                            placeholder: 'Ingrese el motivo de la cancelación masiva...',
                            rows: 3,
                            style: {
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '0.875rem',
                                resize: 'vertical'
                            }
                        })
                    ]),

                    // Resumen de la acción (si todo está seleccionado)
                    accionSeleccionada && rutaSeleccionada &&
                    (!accionActual?.requiereMotivo || motivoCancelacion.trim()) &&
                    e('div', {
                        key: 'resumen',
                        style: {
                            padding: '1rem',
                            backgroundColor: '#f0f9ff',
                            borderRadius: '8px',
                            border: '1px solid #bae6fd'
                        }
                    }, [
                        e('h4', {
                            style: {
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                color: '#0369a1',
                                margin: '0 0 0.5rem 0'
                            }
                        }, 'Resumen de la Acción'),

                        e('div', {
                            style: {
                                fontSize: '0.75rem',
                                color: '#0369a1',
                                lineHeight: '1.5'
                            }
                        }, [
                            e('p', { style: { margin: '0' } },
                                `Acción: ${accionActual?.titulo}`
                            ),
                            e('p', { style: { margin: '0.25rem 0 0 0' } },
                                `Ruta: ${rutas.find(r => r.id == rutaSeleccionada)?.nombre}`
                            ),
                            e('p', { style: { margin: '0.25rem 0 0 0' } },
                                `Reservas afectadas: ${rutas.find(r => r.id == rutaSeleccionada)?.reservas_count || 0}`
                            ),
                            accionActual?.requiereMotivo && e('p', {
                                style: { margin: '0.25rem 0 0 0' }
                            }, `Motivo: ${motivoCancelacion.slice(0, 50)}${motivoCancelacion.length > 50 ? '...' : ''}`)
                        ])
                    ])
                ]),

                // Footer
                e('div', {
                    key: 'masivas-footer',
                    style: {
                        padding: '1.5rem',
                        borderTop: '1px solid #e5e7eb',
                        backgroundColor: '#f9fafb',
                        display: 'flex',
                        gap: '0.75rem',
                        justifyContent: 'flex-end'
                    }
                }, [
                    e('button', {
                        onClick: cerrar,
                        disabled: loading,
                        style: {
                            padding: '0.75rem 1.5rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            backgroundColor: 'white',
                            color: '#374151',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '0.875rem',
                            opacity: loading ? 0.7 : 1
                        }
                    }, 'Cancelar'),

                    e('button', {
                        onClick: ejecutar,
                        disabled: loading || !accionSeleccionada || !rutaSeleccionada ||
                            (accionActual?.requiereMotivo && !motivoCancelacion.trim()),
                        style: {
                            padding: '0.75rem 1.5rem',
                            border: 'none',
                            borderRadius: '8px',
                            backgroundColor: loading || !accionSeleccionada || !rutaSeleccionada ?
                                '#9ca3af' :
                                (accionActual?.color || '#8b5cf6'),
                            color: 'white',
                            cursor: (loading || !accionSeleccionada || !rutaSeleccionada) ?
                                'not-allowed' : 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }
                    }, [
                        loading && e('div', {
                            key: 'spinner',
                            style: {
                                width: '16px',
                                height: '16px',
                                border: '2px solid #ffffff40',
                                borderTop: '2px solid #ffffff',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                            }
                        }),
                        loading ? 'Procesando...' : 'Ejecutar Acción'
                    ])
                ])
            ])
        ]);
    },

    // MODAL DE DETALLES INTELIGENTE - FUNCIONA CON RELACIONES Y TABLAS BÁSICAS
    detalles: ({
        abierto,
        cerrar,
        item,
        tipoItem,
        camposExcluir = ['id', 'created_at', 'updated_at', 'deleted_at'],
        labelsPersonalizados = {}
    }) => {
        if (!abierto || !item) return null;

        // FUNCIÓN INTELIGENTE PARA FORMATEAR VALORES
        const formatearValor = (valor, campo, item) => {
            if (valor === null || valor === undefined) return 'Sin información';
            if (typeof valor === 'boolean') return valor ? 'Sí' : 'No';

            // DETECTAR Y FORMATEAR RELACIONES FORÁNEAS AUTOMÁTICAMENTE
            if (campo.endsWith('_id')) {
                const relationBaseName = campo.replace('_id', '');

                // Buscar objeto relacionado en el item
                if (item[relationBaseName] && typeof item[relationBaseName] === 'object') {
                    const relationObj = item[relationBaseName];

                    // Intentar obtener nombre amigable en orden de preferencia
                    const friendlyName = relationObj.nombre ||
                        relationObj.name ||
                        relationObj[`${relationBaseName}_tipo`] ||
                        relationObj[`${relationBaseName}_nombre`] ||
                        relationObj[`${relationBaseName}_descripcion`] ||
                        relationObj.codigo ||
                        relationObj[`${relationBaseName}_codigo`] ||
                        `ID: ${valor}`;

                    return friendlyName;
                }

                // Si no hay relación, mostrar el ID con formato amigable
                return `ID: ${valor}`;
            }

            // FORMATEAR TELÉFONOS PRIMERO (antes que números grandes)
            if (campo.includes('telefono') || campo.includes('phone')) {
                const phone = String(valor);
                if (phone.length === 8) {
                    return `${phone.slice(0, 4)}-${phone.slice(4)}`;
                }
                return phone;
            }

            // Formatear precios
            if (typeof valor === 'number' && (campo.includes('precio') || campo.includes('monto') || campo.includes('costo'))) {
                return new Intl.NumberFormat('es-GT', {
                    style: 'currency',
                    currency: 'GTQ'
                }).format(valor);
            }

            // Formatear números grandes (DESPUÉS del teléfono)
            if (typeof valor === 'number' && valor > 1000000) {
                return new Intl.NumberFormat('es-GT').format(valor);
            }

            // Formatear fechas
            if (campo.includes('fecha') || campo.includes('date')) {
                try {
                    const date = new Date(valor);
                    if (!isNaN(date.getTime())) {
                        return date.toLocaleDateString('es-GT', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        });
                    }
                } catch (e) {
                    // Si falla el formateo de fecha, continuar con el valor original
                }
            }

            // Ocultar objetos complejos
            if (typeof valor === 'object') {
                return 'Información estructurada (oculta por claridad)';
            }

            // Formatear códigos y IDs
            if (campo.includes('codigo') || campo === 'id') {
                return String(valor).toUpperCase();
            }

            return String(valor);
        };

        // FUNCIÓN PARA FORMATEAR NOMBRES DE CAMPOS - MEJORADA
        const formatearNombreCampo = (campo) => {
            // PRIORIDAD 1: Usar labels personalizados si existen
            if (labelsPersonalizados[campo]) {
                return labelsPersonalizados[campo];
            }

            // PRIORIDAD 2: Diccionario de traducciones específicas
            const traducciones = {
                'tipo_persona_id': 'Tipo de Empleado',
                'persona_id': 'Persona',
                'usuario_id': 'Usuario',
                'rol_id': 'Rol',
                'agencia_id': 'Agencia',
                'vehiculo_id': 'Vehículo',
                'servicio_id': 'Servicio',
                'ruta_id': 'Ruta',
                'estado_id': 'Estado',
                'email': 'Correo Electrónico',
                'telefono': 'Teléfono',
                'nombres': 'Nombres',
                'apellidos': 'Apellidos',
                'codigo': 'Código',
                'situacion': 'Estado'
            };

            // Si existe traducción específica, usarla
            if (traducciones[campo]) {
                return traducciones[campo];
            }

            // PRIORIDAD 3: Formateo automático inteligente
            return campo
                .replace(/_/g, ' ')
                .replace(/([A-Z])/g, ' $1')
                .toLowerCase()
                .replace(/^./, str => str.toUpperCase())
                .replace(/\bid\b/gi, 'ID')
                .replace(/\bemail\b/gi, 'Correo')
                .replace(/\burl\b/gi, 'URL');
        };

        // FILTRAR CAMPOS INTELIGENTEMENTE
        const camposFiltrados = Object.entries(item)
            .filter(([key, value]) => {
                // Excluir campos técnicos estándar
                if (camposExcluir.includes(key)) return false;

                // Excluir campos que no son de la base de datos real
                const camposNoReales = [
                    'descripcion', 'caracteristicas', 'es_aeroporto',
                    'es_turistica', 'distancia_estimada', 'contacto',
                    'estadisticas', 'planificacion', 'auditoria'
                ];
                if (camposNoReales.includes(key)) return false;

                // Incluir objetos de relación solo si son simples
                if (typeof value === 'object' && value !== null) {
                    // Permitir objetos de relación que no sean arrays
                    if (!Array.isArray(value) && Object.keys(value).length <= 5) {
                        return false; // Los objetos se manejan a través de los campos _id
                    }
                    return false;
                }

                return true;
            })
            .sort(([a], [b]) => {
                // Ordenar campos: primero nombres, luego códigos, luego el resto
                const priority = { 'nombres': 1, 'codigo': 2, 'apellidos': 3 };
                const priorityA = priority[a] || 999;
                const priorityB = priority[b] || 999;
                return priorityA - priorityB;
            });

        return e('div', {
            key: 'modal-detalles-overlay',
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
                zIndex: 1200,
                padding: '1rem'
            }
        }, [
            e('div', {
                key: 'modal-detalles-content',
                style: {
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    maxWidth: '600px',
                    width: '100%',
                    maxHeight: '85vh',
                    overflow: 'hidden',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column'
                }
            }, [
                // Header mejorado
                e('div', {
                    key: 'detalles-header',
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
                        style: { display: 'flex', alignItems: 'center', gap: '0.75rem' }
                    }, [
                        e('div', {
                            style: {
                                padding: '0.75rem',
                                backgroundColor: '#3b82f6',
                                borderRadius: '8px',
                                color: 'white'
                            }
                        }, Icons.eye('#ffffff')),
                        e('h3', {
                            style: {
                                fontSize: '1.25rem',
                                fontWeight: '600',
                                color: '#111827',
                                margin: '0'
                            }
                        }, `Información del ${tipoItem}`)
                    ]),
                    e('button', {
                        onClick: cerrar,
                        style: {
                            padding: '0.75rem',
                            border: 'none',
                            backgroundColor: '#f3f4f6',
                            cursor: 'pointer',
                            color: '#6b7280',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.25rem',
                            fontWeight: 'bold',
                            minWidth: '40px',
                            minHeight: '40px'
                        }
                    }, '×')
                ]),

                // Contenido mejorado con información de relaciones
                e('div', {
                    key: 'detalles-contenido',
                    style: {
                        padding: '1.5rem',
                        overflow: 'auto',
                        flex: '1',
                        minHeight: '0'
                    }
                }, [
                    e('div', {
                        style: {
                            display: 'grid',
                            gap: '1.5rem'
                        }
                    }, camposFiltrados.map(([key, value]) => {
                        const isRelation = key.endsWith('_id');
                        const formattedValue = formatearValor(value, key, item);

                        return e('div', {
                            key: `detail-${key}`,
                            style: {
                                padding: '1.25rem',
                                backgroundColor: '#ffffff',
                                borderRadius: '8px',
                                border: isRelation ? '2px solid #e0e7ff' : '1px solid #e2e8f0',
                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                                position: 'relative'
                            }
                        }, [
                            // Indicador visual para relaciones
                            isRelation && e('div', {
                                style: {
                                    position: 'absolute',
                                    top: '0.5rem',
                                    right: '0.5rem',
                                    padding: '0.25rem',
                                    backgroundColor: '#3b82f6',
                                    borderRadius: '4px',
                                    fontSize: '0.625rem',
                                    color: 'white',
                                    fontWeight: 'bold'
                                }
                            }, 'REL'),

                            e('div', {
                                style: {
                                    marginBottom: '0.75rem',
                                    borderBottom: '1px solid #f1f5f9',
                                    paddingBottom: '0.5rem'
                                }
                            }, [
                                e('h4', {
                                    style: {
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        color: isRelation ? '#3b82f6' : '#374151',
                                        margin: '0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }
                                }, [
                                    formatearNombreCampo(key),
                                    isRelation && e('span', {
                                        style: {
                                            fontSize: '0.625rem',
                                            color: '#6b7280',
                                            fontWeight: 'normal'
                                        }
                                    }, '(relación)')
                                ])
                            ]),
                            e('div', {
                                style: {
                                    fontSize: '1rem',
                                    color: '#111827',
                                    wordBreak: 'break-word',
                                    lineHeight: '1.5',
                                    fontWeight: isRelation ? '500' : 'normal'
                                }
                            }, formattedValue)
                        ]);
                    }))
                ]),

                // Footer simplificado
                e('div', {
                    key: 'detalles-footer',
                    style: {
                        padding: '1.5rem',
                        borderTop: '1px solid #e5e7eb',
                        backgroundColor: '#f9fafb',
                        display: 'flex',
                        justifyContent: 'center',
                        flexShrink: 0
                    }
                }, [
                    e('button', {
                        onClick: cerrar,
                        style: {
                            padding: '0.75rem 2rem',
                            border: 'none',
                            borderRadius: '8px',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: '600'
                        }
                    }, 'Cerrar')
                ])
            ])
        ]);
    },

    // MODAL DE FORMULARIO UNIVERSAL
    formulario: ({
        abierto,
        cerrar,
        guardar,
        formulario,
        cambiarCampo,
        errores = {},
        loading = false,
        tipoItem,
        campos,
        esEdicion = false,
        catalogos = {}
    }) => {
        if (!abierto) return null;

        const renderizarCampo = (campo) => {
            const {
                nombre,
                tipo = 'text',
                requerido = false,
                opciones = [],
                placeholder = '',
                soloLectura = false,
                ancho = 'completo',
                label
            } = campo;

            const valor = formulario[nombre] || '';
            const error = errores[nombre];

            const estilosCampo = {
                width: '100%',
                padding: '0.75rem',
                border: error ? '1px solid #ef4444' : '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '0.875rem',
                backgroundColor: soloLectura ? '#f9fafb' : 'white',
                cursor: soloLectura ? 'not-allowed' : 'text'
            };

            const contenedor = e('div', {
                key: `campo-${nombre}`,
                style: {
                    gridColumn: ancho === 'medio' ? 'span 1' : 'span 2'
                }
            }, [
                // Label
                e('label', {
                    style: {
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: '0.5rem'
                    }
                }, `${label || placeholder || nombre.replace(/_/g, ' ')}${requerido ? ' *' : ''}`),

                // Campo según tipo
                tipo === 'city_autocomplete'
                    ? e('div', {
                        style: {
                            position: 'relative',
                            zIndex: 5000
                        }
                    }, [
                        React.createElement(CityAutocomplete, {
                            key: `city-${nombre}`,
                            value: valor,
                            onChange: (value) => cambiarCampo(nombre, value),
                            placeholder: placeholder,
                            hasError: !!error,
                            onCitySelect: (cityData) => {
                                cambiarCampo(nombre, cityData.nombre_ciudad);
                            },
                            style: estilosCampo
                        })
                    ])
                    : tipo === 'select'
                        ? campo.searchable
                            ? React.createElement(SearchableSelect, {
                                key: `searchable-${nombre}`,
                                value: valor,
                                onChange: (value) => cambiarCampo(nombre, value),
                                options: opciones,
                                placeholder: `Buscar ${placeholder || nombre}...`,
                                style: estilosCampo,
                                hasError: !!error
                            })
                            : e('select', {
                                value: valor,
                                onChange: (e) => cambiarCampo(nombre, e.target.value),
                                disabled: soloLectura,
                                style: estilosCampo
                            }, [
                                e('option', { key: 'vacio', value: '' }, `Seleccionar ${placeholder || nombre}`),
                                ...opciones.map((opcion, idx) =>
                                    e('option', {
                                        key: `${nombre}-option-${idx}`,
                                        value: typeof opcion === 'object' ? opcion.value : opcion
                                    }, typeof opcion === 'object' ? opcion.label : opcion)
                                )
                            ])
                        : tipo === 'textarea'
                            ? e('textarea', {
                                value: valor,
                                onChange: (e) => cambiarCampo(nombre, e.target.value),
                                readOnly: soloLectura,
                                placeholder: placeholder,
                                rows: 3,
                                style: { ...estilosCampo, resize: 'vertical', minHeight: '80px' }
                            })
                            : e('input', {
                                type: tipo,
                                value: valor,
                                onChange: (e) => cambiarCampo(nombre, e.target.value),
                                readOnly: soloLectura,
                                placeholder: placeholder,
                                min: tipo === 'number' ? '0' : undefined,
                                step: tipo === 'number' ? '0.01' : undefined,
                                style: estilosCampo
                            }),

                // Error
                error && e('p', {
                    style: {
                        color: '#ef4444',
                        fontSize: '0.75rem',
                        margin: '0.25rem 0 0 0'
                    }
                }, error)
            ]);

            return contenedor;
        };

        return e('div', {
            key: 'modal-formulario-overlay',
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
                key: 'modal-formulario-content',
                style: {
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    maxWidth: '700px',
                    width: '100%',
                    maxHeight: '90vh',
                    overflow: 'visible',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    zIndex: 1500
                }
            }, [
                // Header
                e('div', {
                    key: 'formulario-header',
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
                        style: { display: 'flex', alignItems: 'center', gap: '0.75rem' }
                    }, [
                        e('div', {
                            style: {
                                padding: '0.75rem',
                                backgroundColor: '#8b5cf6',
                                borderRadius: '8px',
                                color: 'white'
                            }
                        }, esEdicion ? Icons.edit('#ffffff') : Icons.plus('#ffffff')),
                        e('h3', {
                            style: {
                                fontSize: '1.25rem',
                                fontWeight: '600',
                                color: '#111827',
                                margin: '0'
                            }
                        }, `${esEdicion ? 'Editar' : 'Nuevo'} ${tipoItem}`)
                    ]),
                    e('button', {
                        onClick: cerrar,
                        disabled: loading,
                        style: {
                            padding: '0.5rem',
                            border: 'none',
                            backgroundColor: 'transparent',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            color: '#6b7280',
                            borderRadius: '4px'
                        }
                    }, Icons.x())
                ]),

                // Formulario
                e('div', {
                    key: 'formulario-contenido',
                    style: {
                        padding: '1.5rem',
                        paddingBottom: '0rem',           // CAMBIAR: eliminar padding inferior
                        overflowY: 'auto',
                        maxHeight: 'calc(90vh - 160px)',
                        flex: 1
                    }
                }, [
                    e('div', {
                        style: {
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '1rem',
                            position: 'relative',
                            zIndex: 1600,
                            marginBottom: '6rem'         // AGREGAR: 3rem de separación con el footer
                        }
                    }, campos.map(renderizarCampo))
                ]),

                // Footer
                e('div', {
                    key: 'formulario-footer',
                    style: {
                        padding: '1rem 1.5rem',
                        borderTop: '1px solid #e5e7eb',
                        backgroundColor: '#f9fafb',
                        display: 'flex',
                        gap: '0.75rem',
                        justifyContent: 'flex-end',
                        position: 'relative',
                        zIndex: 1300
                    }
                }, [
                    e('button', {
                        onClick: cerrar,
                        disabled: loading,
                        style: {
                            padding: '0.75rem 1.5rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            backgroundColor: 'white',
                            color: '#374151',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '0.875rem',
                            opacity: loading ? 0.7 : 1
                        }
                    }, 'Cancelar'),

                    e('button', {
                        onClick: guardar,
                        disabled: loading,
                        style: {
                            padding: '0.75rem 1.5rem',
                            border: 'none',
                            borderRadius: '8px',
                            backgroundColor: loading ? '#9ca3af' : '#8b5cf6',
                            color: 'white',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }
                    }, [
                        loading && e('div', {
                            key: 'spinner',
                            style: {
                                width: '16px',
                                height: '16px',
                                border: '2px solid #ffffff40',
                                borderTop: '2px solid #ffffff',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                            }
                        }),
                        loading ? 'Guardando...' : 'Guardar'
                    ])
                ])
            ])
        ]);
    }
};

export default ModalUniversal;
