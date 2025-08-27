// src/resources/js/components/reservaciones/ReservaModal.js
import React from 'react';
import Icons from '../../utils/Icons';
import Notifications from '../../utils/notifications';
import ReservaForm from './ReservaForm';
import WhatsAppFormat from './WhatsAppFormat';

const { createElement: e, useState, useEffect } = React;

function ReservaModal({
    show,
    onClose,
    reserva = null,
    mode = 'create', // 'create', 'edit', 'view'
    onSave,
    refreshList
}) {
    const [loading, setLoading] = useState(false);
    const [showWhatsApp, setShowWhatsApp] = useState(false);
    const [reservaActual, setReservaActual] = useState(null);

    useEffect(() => {
        if (show && reserva && mode !== 'create') {
            setReservaActual(reserva);
        } else if (show && mode === 'create') {
            setReservaActual(null);
        }
    }, [show, reserva, mode]);

    const handleClose = () => {
        setShowWhatsApp(false);
        setReservaActual(null);
        onClose();
    };

    const handleSave = async (datosReserva) => {
        setReservaActual(datosReserva);
        if (onSave) onSave(datosReserva);
        if (refreshList) refreshList();

        // Si es creación exitosa, mostrar opción de WhatsApp
        if (mode === 'create') {
            setTimeout(() => {
                setShowWhatsApp(true);
            }, 1000);
        } else {
            handleClose();
        }
    };

    const handleConfirmarReserva = async () => {
        if (!reservaActual?.id) return;

        setLoading(true);
        try {
            const response = await fetch(`/api/v1/reservas/${reservaActual.id}/confirmar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) throw new Error('Error al confirmar reserva');

            const data = await response.json();
            Notifications.success('Reserva confirmada exitosamente', 'Éxito');
            setReservaActual(data.data);
            if (refreshList) refreshList();
        } catch (error) {
            Notifications.error(error.message, 'Error');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelarReserva = async () => {
        if (!reservaActual?.id) return;

        if (!confirm('¿Está seguro de cancelar esta reserva?')) return;

        setLoading(true);
        try {
            const response = await fetch(`/api/v1/reservas/${reservaActual.id}/cancelar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) throw new Error('Error al cancelar reserva');

            const data = await response.json();
            Notifications.success('Reserva cancelada exitosamente', 'Éxito');
            setReservaActual(data.data);
            if (refreshList) refreshList();
        } catch (error) {
            Notifications.error(error.message, 'Error');
        } finally {
            setLoading(false);
        }
    };

    const getModalTitle = () => {
        switch (mode) {
            case 'create': return 'Nueva Reserva';
            case 'edit': return 'Editar Reserva';
            case 'view': return 'Detalles de Reserva';
            default: return 'Reserva';
        }
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
                padding: '0.5rem 1rem',
                borderRadius: '9999px',
                fontSize: '0.875rem',
                fontWeight: '600',
                backgroundColor: config.bg,
                color: config.text
            }
        }, config.label);
    };

    const renderViewMode = () => {
        if (!reservaActual) return null;

        return e('div', {
            style: {
                padding: '2rem',
                maxHeight: '70vh',
                overflowY: 'auto'
            }
        }, [
            // Header con estado y acciones
            e('div', {
                key: 'view-header',
                style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2rem',
                    paddingBottom: '1rem',
                    borderBottom: '1px solid #e5e7eb'
                }
            }, [
                e('div', {
                    key: 'reserva-info',
                    style: { display: 'flex', alignItems: 'center', gap: '1rem' }
                }, [
                    e('h3', {
                        key: 'numero',
                        style: {
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            color: '#1f2937',
                            margin: '0'
                        }
                    }, reservaActual.numero_reserva),
                    getEstadoBadge(reservaActual.estado_reserva)
                ]),
                e('div', {
                    key: 'action-buttons',
                    style: { display: 'flex', gap: '0.5rem' }
                }, [
                    // Botón confirmar (solo si está pendiente)
                    (reservaActual.estado_reserva?.codigo === 'PEND') && e('button', {
                        key: 'btn-confirmar',
                        onClick: handleConfirmarReserva,
                        disabled: loading,
                        style: {
                            padding: '0.5rem 1rem',
                            backgroundColor: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.6 : 1
                        }
                    }, 'Confirmar'),

                    // Botón cancelar (solo si no está finalizada o cancelada)
                    (!['FIN', 'CANC'].includes(reservaActual.estado_reserva?.codigo)) && e('button', {
                        key: 'btn-cancelar',
                        onClick: handleCancelarReserva,
                        disabled: loading,
                        style: {
                            padding: '0.5rem 1rem',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.6 : 1
                        }
                    }, 'Cancelar'),

                    // Botón WhatsApp
                    e('button', {
                        key: 'btn-whatsapp',
                        onClick: () => setShowWhatsApp(true),
                        style: {
                            padding: '0.5rem 1rem',
                            backgroundColor: '#25d366',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            cursor: 'pointer'
                        }
                    }, 'WhatsApp')
                ])
            ]),

            // Información de la reserva
            e('div', {
                key: 'reserva-details',
                style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '2rem'
                }
            }, [
                // Información del servicio
                e('div', {
                    key: 'servicio-section',
                    style: {
                        backgroundColor: '#f8fafc',
                        borderRadius: '12px',
                        padding: '1.5rem'
                    }
                }, [
                    e('h4', {
                        key: 'servicio-title',
                        style: {
                            fontSize: '1.125rem',
                            fontWeight: '600',
                            color: '#1f2937',
                            marginBottom: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }
                    }, [Icons.map('#3b82f6'), 'Información del Servicio']),

                    e('div', {
                        key: 'servicio-details',
                        style: { display: 'flex', flexDirection: 'column', gap: '0.75rem' }
                    }, [
                        e('div', { key: 'ruta' }, [
                            e('strong', { style: { color: '#374151' } }, 'Ruta: '),
                            e('span', { style: { color: '#6b7280' } }, reservaActual.ruta?.nombre_ruta || 'Sin ruta')
                        ]),
                        e('div', { key: 'fecha' }, [
                            e('strong', { style: { color: '#374151' } }, 'Fecha: '),
                            e('span', { style: { color: '#6b7280' } }, new Date(reservaActual.fecha_viaje).toLocaleDateString('es-GT'))
                        ]),
                        e('div', { key: 'precio' }, [
                            e('strong', { style: { color: '#374151' } }, 'Precio Total: '),
                            e('span', { style: { color: '#10b981', fontWeight: '600' } }, `Q${parseFloat(reservaActual.precio_total).toFixed(2)}`)
                        ])
                    ])
                ]),

                // Información de pasajeros
                e('div', {
                    key: 'pasajeros-section',
                    style: {
                        backgroundColor: '#f8fafc',
                        borderRadius: '12px',
                        padding: '1.5rem'
                    }
                }, [
                    e('h4', {
                        key: 'pasajeros-title',
                        style: {
                            fontSize: '1.125rem',
                            fontWeight: '600',
                            color: '#1f2937',
                            marginBottom: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }
                    }, [Icons.users('#3b82f6'), 'Información de Pasajeros']),

                    e('div', {
                        key: 'pasajeros-details',
                        style: { display: 'flex', flexDirection: 'column', gap: '0.75rem' }
                    }, [
                        e('div', { key: 'pasajero-principal' }, [
                            e('strong', { style: { color: '#374151' } }, 'Pasajero Principal: '),
                            e('span', { style: { color: '#6b7280' } }, reservaActual.nombre_pasajero_principal)
                        ]),
                        e('div', { key: 'pax-adultos' }, [
                            e('strong', { style: { color: '#374151' } }, 'Adultos: '),
                            e('span', { style: { color: '#6b7280' } }, reservaActual.pax_adultos)
                        ]),
                        e('div', { key: 'pax-ninos' }, [
                            e('strong', { style: { color: '#374151' } }, 'Niños: '),
                            e('span', { style: { color: '#6b7280' } }, reservaActual.pax_ninos || 0)
                        ]),
                        e('div', { key: 'total-pax' }, [
                            e('strong', { style: { color: '#374151' } }, 'Total PAX: '),
                            e('span', { style: { color: '#3b82f6', fontWeight: '600' } }, `${reservaActual.pax_adultos + (reservaActual.pax_ninos || 0)}`)
                        ])
                    ])
                ])
            ]),

            // Información de contacto (si existe)
            (reservaActual.telefono_contacto || reservaActual.hotel_pickup || reservaActual.notas_pickup) && e('div', {
                key: 'contacto-section',
                style: {
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    marginTop: '1.5rem'
                }
            }, [
                e('h4', {
                    key: 'contacto-title',
                    style: {
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        color: '#1f2937',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }
                }, [Icons.phone('#3b82f6'), 'Información de Contacto']),

                e('div', {
                    key: 'contacto-details',
                    style: { display: 'flex', flexDirection: 'column', gap: '0.75rem' }
                }, [
                    reservaActual.telefono_contacto && e('div', { key: 'telefono' }, [
                        e('strong', { style: { color: '#374151' } }, 'Teléfono: '),
                        e('span', { style: { color: '#6b7280' } }, reservaActual.telefono_contacto)
                    ]),
                    reservaActual.hotel_pickup && e('div', { key: 'hotel' }, [
                        e('strong', { style: { color: '#374151' } }, 'Hotel/Pickup: '),
                        e('span', { style: { color: '#6b7280' } }, reservaActual.hotel_pickup)
                    ]),
                    reservaActual.notas_pickup && e('div', { key: 'notas' }, [
                        e('strong', { style: { color: '#374151' } }, 'Notas: '),
                        e('span', { style: { color: '#6b7280' } }, reservaActual.notas_pickup)
                    ])
                ])
            ])
        ]);
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
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
        },
        onClick: handleClose
    }, [
        e('div', {
            key: 'modal-content',
            onClick: (e) => e.stopPropagation(),
            style: {
                backgroundColor: 'white',
                borderRadius: '16px',
                width: '90%',
                maxWidth: mode === 'view' ? '1000px' : '800px',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }
        }, [
            // Header del modal
            e('div', {
                key: 'modal-header',
                style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1.5rem',
                    borderBottom: '1px solid #e5e7eb',
                    backgroundColor: '#f8fafc',
                    borderTopLeftRadius: '16px',
                    borderTopRightRadius: '16px'
                }
            }, [
                e('h2', {
                    key: 'modal-title',
                    style: {
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        color: '#1f2937',
                        margin: '0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }
                }, [Icons.calendar('#3b82f6'), getModalTitle()]),
                e('button', {
                    key: 'close-button',
                    onClick: handleClose,
                    style: {
                        padding: '0.5rem',
                        backgroundColor: 'transparent',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }
                }, Icons.x('#6b7280'))
            ]),

            // Contenido del modal
            e('div', {
                key: 'modal-body',
                style: { padding: mode === 'view' ? '0' : '1rem' }
            }, [
                mode === 'view' ? renderViewMode() :
                    e(ReservaForm, {
                        key: 'reserva-form',
                        reserva: reservaActual,
                        mode: mode,
                        onSave: handleSave,
                        onCancel: handleClose
                    })
            ])
        ]),

        // Modal de WhatsApp
        showWhatsApp && e(WhatsAppFormat, {
            key: 'whatsapp-modal',
            show: showWhatsApp,
            reserva: reservaActual,
            onClose: () => setShowWhatsApp(false)
        })
    ]);
}

export default ReservaModal;
