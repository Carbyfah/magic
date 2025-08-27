// src/resources/js/components/reservaciones/ReservaCard.js
import React from 'react';
import Icons from '../../utils/Icons';
import Notifications from '../../utils/notifications';

const { createElement: e, useState } = React;

function ReservaCard({
    reserva,
    onEdit,
    onView,
    onDelete,
    onClick,
    showActions = true,
    compact = false
}) {
    const [loading, setLoading] = useState(false);

    const getEstadoBadge = (estado) => {
        const colores = {
            'PEND': { bg: '#fef3c7', text: '#d97706', label: 'Pendiente', icon: Icons.clock },
            'CONF': { bg: '#d1fae5', text: '#10b981', label: 'Confirmada', icon: Icons.checkCircle },
            'EJEC': { bg: '#dbeafe', text: '#3b82f6', label: 'En Ejecución', icon: Icons.play },
            'FIN': { bg: '#f3f4f6', text: '#6b7280', label: 'Finalizada', icon: Icons.check },
            'CANC': { bg: '#fee2e2', text: '#ef4444', label: 'Cancelada', icon: Icons.x },
            'NOSHOW': { bg: '#fdf2f8', text: '#ec4899', label: 'No Show', icon: Icons.userX }
        };

        const config = colores[estado?.codigo] || colores['PEND'];

        return e('div', {
            style: {
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: compact ? '0.25rem 0.75rem' : '0.5rem 1rem',
                borderRadius: '9999px',
                fontSize: compact ? '0.75rem' : '0.875rem',
                fontWeight: '600',
                backgroundColor: config.bg,
                color: config.text
            }
        }, [
            e('span', { key: 'estado-icon', style: { fontSize: compact ? '0.875rem' : '1rem' } }, config.icon(config.text)),
            e('span', { key: 'estado-text' }, config.label)
        ]);
    };

    const getPrioridadIndicator = () => {
        if (!reserva.fecha_viaje) return null;

        const fechaViaje = new Date(reserva.fecha_viaje);
        const hoy = new Date();
        const diferenciaDias = Math.ceil((fechaViaje - hoy) / (1000 * 60 * 60 * 24));

        if (diferenciaDias < 0) {
            return { color: '#ef4444', bg: '#fee2e2', texto: 'Vencida', urgente: true };
        } else if (diferenciaDias === 0) {
            return { color: '#f59e0b', bg: '#fef3c7', texto: 'Hoy', urgente: true };
        } else if (diferenciaDias === 1) {
            return { color: '#f59e0b', bg: '#fef3c7', texto: 'Mañana', urgente: true };
        } else if (diferenciaDias <= 3) {
            return { color: '#3b82f6', bg: '#dbeafe', texto: `${diferenciaDias} días`, urgente: false };
        }

        return null;
    };

    const prioridad = getPrioridadIndicator();

    const handleAction = async (action, e) => {
        e.stopPropagation(); // Evitar que se dispare el onClick del card

        switch (action) {
            case 'view':
                if (onView) onView(reserva);
                break;
            case 'edit':
                if (onEdit) onEdit(reserva);
                break;
            case 'delete':
                if (onDelete) onDelete(reserva);
                break;
            case 'whatsapp':
                await handleWhatsApp(e);
                break;
            case 'confirmar':
                await handleConfirmar(e);
                break;
        }
    };

    const handleWhatsApp = async (e) => {
        e.stopPropagation();
        setLoading(true);

        try {
            const response = await fetch(`/api/v1/reservas/${reserva.id}/formato-whatsapp`);
            const data = await response.json();

            if (data.mensaje) {
                // Copiar al clipboard
                await navigator.clipboard.writeText(data.mensaje);
                Notifications.success('Mensaje copiado al portapapeles', 'WhatsApp');
            }
        } catch (error) {
            Notifications.error('Error al generar mensaje de WhatsApp', 'Error');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmar = async (e) => {
        e.stopPropagation();

        if (reserva.estado_reserva?.codigo !== 'PEND') {
            Notifications.warning('Solo se pueden confirmar reservas pendientes', 'Advertencia');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`/api/v1/reservas/${reserva.id}/confirmar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) throw new Error('Error al confirmar reserva');

            Notifications.success('Reserva confirmada exitosamente', 'Éxito');
            // Actualizar el estado local si es necesario
            // window.location.reload(); // O mejor usar un callback para actualizar
        } catch (error) {
            Notifications.error(error.message, 'Error');
        } finally {
            setLoading(false);
        }
    };

    const renderCompactCard = () => {
        return e('div', {
            style: {
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '1rem',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.2s',
                cursor: onClick ? 'pointer' : 'default',
                position: 'relative'
            },
            onClick: onClick,
            onMouseEnter: (e) => {
                if (onClick) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                }
            },
            onMouseLeave: (e) => {
                if (onClick) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                }
            }
        }, [
            // Indicador de prioridad
            prioridad && prioridad.urgente && e('div', {
                key: 'priority-indicator',
                style: {
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: prioridad.color
                }
            }),

            e('div', {
                key: 'compact-header',
                style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.5rem'
                }
            }, [
                e('span', {
                    key: 'numero',
                    style: {
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#1f2937'
                    }
                }, reserva.numero_reserva),
                getEstadoBadge(reserva.estado_reserva)
            ]),

            e('p', {
                key: 'pasajero',
                style: {
                    fontSize: '0.75rem',
                    color: '#374151',
                    margin: '0 0 0.25rem 0',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                }
            }, reserva.nombre_pasajero_principal),

            e('div', {
                key: 'compact-details',
                style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.75rem',
                    color: '#6b7280'
                }
            }, [
                e('span', { key: 'fecha' }, new Date(reserva.fecha_viaje).toLocaleDateString('es-GT')),
                e('span', { key: 'pax' }, `${reserva.pax_adultos + (reserva.pax_ninos || 0)} PAX`)
            ])
        ]);
    };

    const renderFullCard = () => {
        return e('div', {
            style: {
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '1.5rem',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s',
                cursor: onClick ? 'pointer' : 'default',
                position: 'relative',
                minHeight: '200px'
            },
            onClick: onClick,
            onMouseEnter: (e) => {
                if (onClick) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 10px 25px -3px rgba(0, 0, 0, 0.1)';
                }
            },
            onMouseLeave: (e) => {
                if (onClick) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                }
            }
        }, [
            // Header de la card
            e('div', {
                key: 'card-header',
                style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '1rem'
                }
            }, [
                e('div', {
                    key: 'header-left',
                    style: { flex: 1 }
                }, [
                    e('h4', {
                        key: 'numero',
                        style: {
                            fontSize: '1.125rem',
                            fontWeight: '700',
                            color: '#1f2937',
                            margin: '0 0 0.25rem 0'
                        }
                    }, reserva.numero_reserva),
                    e('p', {
                        key: 'pasajero',
                        style: {
                            fontSize: '0.875rem',
                            color: '#374151',
                            margin: '0'
                        }
                    }, reserva.nombre_pasajero_principal)
                ]),
                e('div', {
                    key: 'header-right',
                    style: {
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        gap: '0.5rem'
                    }
                }, [
                    getEstadoBadge(reserva.estado_reserva),
                    prioridad && e('span', {
                        key: 'prioridad',
                        style: {
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            backgroundColor: prioridad.bg,
                            color: prioridad.color
                        }
                    }, prioridad.texto)
                ])
            ]),

            // Información del servicio
            e('div', {
                key: 'servicio-info',
                style: {
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    padding: '1rem',
                    marginBottom: '1rem'
                }
            }, [
                e('div', {
                    key: 'ruta-info',
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.5rem'
                    }
                }, [
                    Icons.map('#3b82f6'),
                    e('span', {
                        key: 'ruta-nombre',
                        style: {
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#1f2937'
                        }
                    }, reserva.ruta?.nombre_ruta || 'Sin ruta asignada')
                ]),
                e('div', {
                    key: 'fecha-info',
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }
                }, [
                    Icons.calendar('#6b7280'),
                    e('span', {
                        key: 'fecha',
                        style: {
                            fontSize: '0.875rem',
                            color: '#6b7280'
                        }
                    }, new Date(reserva.fecha_viaje).toLocaleDateString('es-GT', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    }))
                ])
            ]),

            // Información de pasajeros y precio
            e('div', {
                key: 'pax-precio',
                style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: showActions ? '1rem' : '0'
                }
            }, [
                e('div', {
                    key: 'pax-info',
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }
                }, [
                    Icons.users('#6b7280'),
                    e('span', {
                        key: 'pax-count',
                        style: {
                            fontSize: '0.875rem',
                            color: '#374151'
                        }
                    }, `${reserva.pax_adultos} adultos${reserva.pax_ninos ? `, ${reserva.pax_ninos} niños` : ''}`),
                    e('span', {
                        key: 'total-pax',
                        style: {
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: '#3b82f6',
                            marginLeft: '0.5rem'
                        }
                    }, `(${reserva.pax_adultos + (reserva.pax_ninos || 0)} PAX)`)
                ]),
                e('div', {
                    key: 'precio-info',
                    style: {
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end'
                    }
                }, [
                    e('span', {
                        key: 'precio',
                        style: {
                            fontSize: '1.125rem',
                            fontWeight: '700',
                            color: '#10b981'
                        }
                    }, `Q${parseFloat(reserva.precio_total || 0).toFixed(2)}`),
                    reserva.responsable_pago && e('span', {
                        key: 'responsable',
                        style: {
                            fontSize: '0.75rem',
                            color: '#6b7280'
                        }
                    }, reserva.responsable_pago)
                ])
            ]),

            // Botones de acción
            showActions && e('div', {
                key: 'actions',
                style: {
                    display: 'flex',
                    gap: '0.5rem',
                    borderTop: '1px solid #f3f4f6',
                    paddingTop: '1rem'
                }
            }, [
                // Ver detalles
                e('button', {
                    key: 'btn-view',
                    onClick: (e) => handleAction('view', e),
                    style: {
                        flex: 1,
                        padding: '0.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        backgroundColor: 'white',
                        color: '#374151',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.25rem',
                        transition: 'all 0.2s'
                    },
                    onMouseEnter: (e) => {
                        e.target.style.backgroundColor = '#f9fafb';
                        e.target.style.borderColor = '#9ca3af';
                    },
                    onMouseLeave: (e) => {
                        e.target.style.backgroundColor = 'white';
                        e.target.style.borderColor = '#d1d5db';
                    }
                }, [
                    e('span', { key: 'eye-icon' }, Icons.eye('#6b7280')),
                    e('span', { key: 'ver-text' }, 'Ver')
                ]),

                // Editar
                e('button', {
                    key: 'btn-edit',
                    onClick: (e) => handleAction('edit', e),
                    style: {
                        flex: 1,
                        padding: '0.5rem',
                        border: '1px solid #3b82f6',
                        borderRadius: '6px',
                        backgroundColor: 'white',
                        color: '#3b82f6',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.25rem',
                        transition: 'all 0.2s'
                    },
                    onMouseEnter: (e) => {
                        e.target.style.backgroundColor = '#3b82f6';
                        e.target.style.color = 'white';
                    },
                    onMouseLeave: (e) => {
                        e.target.style.backgroundColor = 'white';
                        e.target.style.color = '#3b82f6';
                    }
                }, [
                    e('span', { key: 'edit-icon' }, Icons.edit('#currentColor')),
                    e('span', { key: 'edit-text' }, 'Editar')
                ]),

                // WhatsApp
                e('button', {
                    key: 'btn-whatsapp',
                    onClick: (e) => handleAction('whatsapp', e),
                    disabled: loading,
                    style: {
                        padding: '0.5rem',
                        border: '1px solid #25d366',
                        borderRadius: '6px',
                        backgroundColor: loading ? '#f3f4f6' : 'white',
                        color: loading ? '#9ca3af' : '#25d366',
                        fontSize: '0.875rem',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                    },
                    onMouseEnter: (e) => {
                        if (!loading) {
                            e.target.style.backgroundColor = '#25d366';
                            e.target.style.color = 'white';
                        }
                    },
                    onMouseLeave: (e) => {
                        if (!loading) {
                            e.target.style.backgroundColor = 'white';
                            e.target.style.color = '#25d366';
                        }
                    }
                }, Icons.whatsapp('#currentColor')),

                // Confirmar (solo si está pendiente)
                (reserva.estado_reserva?.codigo === 'PEND') && e('button', {
                    key: 'btn-confirm',
                    onClick: (e) => handleAction('confirmar', e),
                    disabled: loading,
                    style: {
                        padding: '0.5rem',
                        border: '1px solid #10b981',
                        borderRadius: '6px',
                        backgroundColor: loading ? '#f3f4f6' : 'white',
                        color: loading ? '#9ca3af' : '#10b981',
                        fontSize: '0.875rem',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                    },
                    onMouseEnter: (e) => {
                        if (!loading) {
                            e.target.style.backgroundColor = '#10b981';
                            e.target.style.color = 'white';
                        }
                    },
                    onMouseLeave: (e) => {
                        if (!loading) {
                            e.target.style.backgroundColor = 'white';
                            e.target.style.color = '#10b981';
                        }
                    }
                }, Icons.checkbox('#10b981'))
            ])
        ]);
    };

    return compact ? renderCompactCard() : renderFullCard();
}

export default ReservaCard;
