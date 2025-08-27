// src/resources/js/components/common/DateSelectionModal.js
import React from 'react';
import Icons from '../../utils/Icons';
import Notifications from '../../utils/notifications'; // AGREGADO

const { createElement: e, useState, useEffect } = React;

function DateSelectionModal({
    show,
    onClose,
    onConfirm,
    title,
    description,
    confirmText,
    confirmColor = '#3b82f6',
    icon = null
}) {
    const [fecha, setFecha] = useState(
        new Date().toISOString().split('T')[0] // Fecha de hoy por defecto
    );
    const [rutaId, setRutaId] = useState('');
    const [horaPickup, setHoraPickup] = useState(''); // NUEVO CAMPO AGREGADO
    const [rutas, setRutas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingRutas, setLoadingRutas] = useState(true);

    // Cargar rutas disponibles al abrir el modal
    useEffect(() => {
        if (show) {
            cargarRutas();
        }
    }, [show]);

    // Auto-completar hora cuando se selecciona una ruta
    useEffect(() => {
        if (rutaId && rutas.length > 0) {
            const rutaSeleccionada = rutas.find(r => r.id.toString() === rutaId.toString());
            if (rutaSeleccionada && rutaSeleccionada.hora_salida && !horaPickup) {
                setHoraPickup(rutaSeleccionada.hora_salida);
            }
        }
    }, [rutaId, rutas]);

    const cargarRutas = async () => {
        try {
            setLoadingRutas(true);
            const response = await fetch('/api/v1/rutas?activas=1');
            const data = await response.json();

            // DEBUG: Ver qué campos tiene cada ruta
            console.log('Rutas cargadas:', data.data);
            if (data.data && data.data.length > 0) {
                console.log('Estructura de primera ruta:', Object.keys(data.data[0]));
                console.log('Primera ruta completa:', data.data[0]);
            }

            setRutas(data.data || []);
        } catch (error) {
            console.error('Error cargando rutas:', error);
        } finally {
            setLoadingRutas(false);
        }
    };

    const handleConfirm = async () => {
        if (!fecha || !rutaId) {
            return;
        }

        // VALIDACIÓN: Solo verificar que la fecha y hora no hayan pasado completamente
        const ahora = new Date();
        const fechaSeleccionada = new Date(fecha);

        // Si la fecha seleccionada es hoy, verificar también la hora
        if (fechaSeleccionada.toDateString() === ahora.toDateString()) {
            // Es hoy, verificar la hora si está disponible
            if (horaPickup) {
                const [horas, minutos] = horaPickup.split(':');
                const fechaConHora = new Date(fecha);
                fechaConHora.setHours(parseInt(horas), parseInt(minutos), 0, 0);

                // Solo rechazar si la hora YA PASÓ (sin margen)
                if (fechaConHora < ahora) {
                    Notifications.warning('La hora de pickup ya pasó', 'Hora Inválida');
                    return;
                }
            }
        } else if (fechaSeleccionada < ahora) {
            // Es una fecha anterior a hoy
            Notifications.warning('No se pueden confirmar rutas para fechas pasadas', 'Fecha Inválida');
            return;
        }

        setLoading(true);
        try {
            // Pasar la hora al callback
            await onConfirm(fecha, rutaId, horaPickup);
            onClose();
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setFecha(new Date().toISOString().split('T')[0]);
            setRutaId('');
            setHoraPickup(''); // RESET NUEVO CAMPO
            onClose();
        }
    };

    if (!show) return null;

    return e('div', {
        style: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        },
        onClick: handleClose
    }, [
        e('div', {
            key: 'modal-content',
            style: {
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '2rem',
                maxWidth: '500px',
                width: '90%',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                position: 'relative'
            },
            onClick: (e) => e.stopPropagation()
        }, [
            // Header con icono
            e('div', {
                key: 'header',
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '1.5rem'
                }
            }, [
                icon && e('div', {
                    key: 'icon-container',
                    style: {
                        width: '48px',
                        height: '48px',
                        backgroundColor: confirmColor + '15',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }
                }, e('div', {
                    key: 'icon',
                    style: { color: confirmColor }
                }, icon)),

                e('div', { key: 'text-content' }, [
                    e('h3', {
                        key: 'title',
                        style: {
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            color: '#1f2937',
                            margin: 0
                        }
                    }, title),
                    description && e('p', {
                        key: 'description',
                        style: {
                            color: '#6b7280',
                            margin: '0.25rem 0 0 0',
                            fontSize: '0.875rem'
                        }
                    }, description)
                ])
            ]),

            // Selector de fecha
            e('div', {
                key: 'date-input-container',
                style: {
                    marginBottom: '1.5rem'
                }
            }, [
                e('label', {
                    key: 'date-label',
                    style: {
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: '0.5rem'
                    }
                }, 'Seleccionar fecha:'),

                e('input', {
                    key: 'date-input',
                    type: 'date',
                    value: fecha,
                    min: new Date().toISOString().split('T')[0], // Permite desde hoy
                    onChange: (e) => setFecha(e.target.value),
                    disabled: loading,
                    style: {
                        width: '100%',
                        padding: '0.75rem 1rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        transition: 'border-color 0.2s',
                        backgroundColor: loading ? '#f9fafb' : 'white'
                    },
                    onFocus: (e) => e.target.style.borderColor = confirmColor,
                    onBlur: (e) => e.target.style.borderColor = '#e5e7eb'
                })
            ]),

            // Selector de ruta
            e('div', {
                key: 'ruta-input-container',
                style: {
                    marginBottom: '1.5rem'
                }
            }, [
                e('label', {
                    key: 'ruta-label',
                    style: {
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: '0.5rem'
                    }
                }, 'Seleccionar ruta:'),

                loadingRutas ?
                    e('div', {
                        key: 'loading-rutas',
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1rem',
                            border: '2px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            color: '#6b7280'
                        }
                    }, [
                        e('div', {
                            key: 'spinner',
                            style: {
                                width: '16px',
                                height: '16px',
                                border: '2px solid #e5e7eb',
                                borderTop: '2px solid #3b82f6',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                            }
                        }),
                        'Cargando rutas...'
                    ]) :
                    e('select', {
                        key: 'ruta-select',
                        value: rutaId,
                        onChange: (e) => setRutaId(e.target.value),
                        disabled: loading,
                        style: {
                            width: '100%',
                            padding: '0.75rem 1rem',
                            border: '2px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            transition: 'border-color 0.2s',
                            backgroundColor: loading ? '#f9fafb' : 'white'
                        },
                        onFocus: (e) => e.target.style.borderColor = confirmColor,
                        onBlur: (e) => e.target.style.borderColor = '#e5e7eb'
                    }, [
                        e('option', { key: 'empty-option', value: '' }, 'Seleccione una ruta'),
                        ...rutas.map(ruta =>
                            e('option', {
                                key: ruta.id,
                                value: ruta.id
                            }, `${ruta.nombre_ruta}${ruta.hora_salida ? ` (${ruta.hora_salida})` : ''}`)
                        )
                    ])
            ]),

            // NUEVO SELECTOR DE HORA
            e('div', {
                key: 'hora-input-container',
                style: {
                    marginBottom: '2rem'
                }
            }, [
                e('label', {
                    key: 'hora-label',
                    style: {
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: '0.5rem'
                    }
                }, [
                    'Hora de pickup:',
                    rutaId && rutas.length > 0 && (() => {
                        const rutaSeleccionada = rutas.find(r => r.id.toString() === rutaId.toString());
                        return rutaSeleccionada && rutaSeleccionada.hora_salida ?
                            e('span', {
                                key: 'hora-sugerida',
                                style: {
                                    fontSize: '0.75rem',
                                    color: '#6b7280',
                                    fontWeight: 'normal',
                                    marginLeft: '0.5rem'
                                }
                            }, `(Sugerida: ${rutaSeleccionada.hora_salida})`) : null;
                    })()
                ]),

                e('input', {
                    key: 'hora-input',
                    type: 'time',
                    value: horaPickup,
                    onChange: (e) => setHoraPickup(e.target.value),
                    disabled: loading,
                    style: {
                        width: '100%',
                        padding: '0.75rem 1rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        transition: 'border-color 0.2s',
                        backgroundColor: loading ? '#f9fafb' : 'white'
                    },
                    onFocus: (e) => e.target.style.borderColor = confirmColor,
                    onBlur: (e) => e.target.style.borderColor = '#e5e7eb'
                }),

                // Información adicional sobre la hora
                rutaId && rutas.length > 0 && (() => {
                    const rutaSeleccionada = rutas.find(r => r.id.toString() === rutaId.toString());
                    return rutaSeleccionada && rutaSeleccionada.hora_salida ?
                        e('p', {
                            key: 'hora-info',
                            style: {
                                fontSize: '0.75rem',
                                color: '#6b7280',
                                marginTop: '0.5rem',
                                fontStyle: 'italic'
                            }
                        }, `Hora de salida de la ruta: ${rutaSeleccionada.hora_salida}`) : null;
                })()
            ]),

            // Botones de acción
            e('div', {
                key: 'actions',
                style: {
                    display: 'flex',
                    gap: '1rem',
                    justifyContent: 'flex-end'
                }
            }, [
                // Botón Cancelar
                e('button', {
                    key: 'cancel-button',
                    onClick: handleClose,
                    disabled: loading,
                    style: {
                        padding: '0.75rem 1.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        backgroundColor: 'white',
                        color: '#374151',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                        opacity: loading ? 0.5 : 1
                    },
                    onMouseEnter: (e) => {
                        if (!loading) {
                            e.target.style.backgroundColor = '#f9fafb';
                        }
                    },
                    onMouseLeave: (e) => {
                        if (!loading) {
                            e.target.style.backgroundColor = 'white';
                        }
                    }
                }, 'Cancelar'),

                // Botón Confirmar
                e('button', {
                    key: 'confirm-button',
                    onClick: handleConfirm,
                    disabled: loading || !fecha || !rutaId || loadingRutas,
                    style: {
                        padding: '0.75rem 1.5rem',
                        border: 'none',
                        borderRadius: '8px',
                        backgroundColor: (!fecha || !rutaId || loading || loadingRutas) ? '#9ca3af' : confirmColor,
                        color: 'white',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        cursor: (!fecha || !rutaId || loading || loadingRutas) ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    },
                    onMouseEnter: (e) => {
                        if (!loading && fecha && rutaId && !loadingRutas) {
                            e.target.style.transform = 'translateY(-1px)';
                            e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                        }
                    },
                    onMouseLeave: (e) => {
                        if (!loading && fecha && rutaId && !loadingRutas) {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = 'none';
                        }
                    }
                }, [
                    loading && e('div', {
                        key: 'loading-spinner',
                        style: {
                            width: '16px',
                            height: '16px',
                            border: '2px solid rgba(255, 255, 255, 0.3)',
                            borderTop: '2px solid white',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                        }
                    }),
                    e('span', { key: 'confirm-text' }, loading ? 'Procesando...' : confirmText)
                ])
            ])
        ])
    ]);
}

export default DateSelectionModal;
