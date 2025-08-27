// src/resources/js/components/configuracion/RutasServiciosModal.js
import React from 'react';
import RutasServiciosForm from './RutasServiciosForm';
import Icons from '../../utils/Icons';
import Notifications from '../../utils/notifications';

const { createElement: e, useState, useEffect } = React;

function RutasServiciosModal({
    isOpen = false,
    mode = 'create', // create, edit, view
    ruta = null,
    onClose,
    onSave
}) {
    // Estados del modal
    const [loading, setLoading] = useState(false);

    // Cerrar modal con ESC
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            // Bloquear scroll del body
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    // Manejar clic en backdrop
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // Manejar envío del formulario
    const handleFormSubmit = async (formData) => {
        setLoading(true);
        try {
            await onSave(formData);
            // onSave ya maneja el cierre del modal y las notificaciones
        } catch (err) {
            // El error ya se maneja en el componente padre
            console.error('Error en modal:', err);
        } finally {
            setLoading(false);
        }
    };

    // Obtener título del modal
    const getModalTitle = () => {
        switch (mode) {
            case 'create':
                return 'Crear Nueva Ruta';
            case 'edit':
                return 'Editar Ruta';
            case 'view':
                return 'Detalles de la Ruta';
            default:
                return 'Ruta';
        }
    };

    // Obtener icono del modal
    const getModalIcon = () => {
        switch (mode) {
            case 'create':
                return Icons.plus();
            case 'edit':
                return Icons.edit();
            case 'view':
                return Icons.eye();
            default:
                return Icons.route();
        }
    };

    if (!isOpen) return null;

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
            zIndex: 1000,
            padding: '1rem'
        },
        onClick: handleBackdropClick
    }, [
        e('div', {
            key: 'modal-container',
            style: {
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                width: '100%',
                maxWidth: '4xl',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            },
            onClick: (e) => e.stopPropagation()
        }, [
            // Header del modal
            e('div', {
                key: 'modal-header',
                style: {
                    padding: '1.5rem 2rem',
                    borderBottom: '1px solid #e5e7eb',
                    backgroundColor: '#f9fafb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }
            }, [
                e('div', {
                    key: 'header-content',
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                    }
                }, [
                    e('div', {
                        key: 'header-icon',
                        style: {
                            padding: '0.5rem',
                            backgroundColor: mode === 'create' ? '#dbeafe' :
                                mode === 'edit' ? '#fef3c7' : '#f3f4f6',
                            color: mode === 'create' ? '#3b82f6' :
                                mode === 'edit' ? '#d97706' : '#6b7280',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center'
                        }
                    }, getModalIcon()),
                    e('div', { key: 'header-text' }, [
                        e('h2', {
                            key: 'modal-title',
                            style: {
                                fontSize: '1.25rem',
                                fontWeight: '700',
                                color: '#111827',
                                margin: '0 0 0.25rem 0'
                            }
                        }, getModalTitle()),
                        e('p', {
                            key: 'modal-subtitle',
                            style: {
                                fontSize: '0.875rem',
                                color: '#6b7280',
                                margin: '0'
                            }
                        }, ruta && mode !== 'create' ?
                            `${ruta.codigo_ruta} - ${ruta.nombre_ruta}` :
                            'Complete los campos para configurar la nueva ruta')
                    ])
                ]),
                e('button', {
                    key: 'close-button',
                    onClick: onClose,
                    style: {
                        padding: '0.5rem',
                        border: 'none',
                        borderRadius: '6px',
                        backgroundColor: 'transparent',
                        color: '#6b7280',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'all 0.2s'
                    },
                    onMouseEnter: (e) => {
                        e.target.style.backgroundColor = '#f3f4f6';
                        e.target.style.color = '#374151';
                    },
                    onMouseLeave: (e) => {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.color = '#6b7280';
                    }
                }, Icons.x())
            ]),

            // Body del modal - Formulario
            e('div', {
                key: 'modal-body',
                style: {
                    flex: '1',
                    overflow: 'auto',
                    padding: '2rem'
                }
            }, [
                e(RutasServiciosForm, {
                    key: 'rutas-form',
                    ruta: ruta,
                    mode: mode,
                    loading: loading,
                    onSubmit: handleFormSubmit,
                    onCancel: onClose
                })
            ]),

            // Información adicional en modo view
            mode === 'view' && ruta && e('div', {
                key: 'modal-info',
                style: {
                    padding: '1.5rem 2rem',
                    backgroundColor: '#f9fafb',
                    borderTop: '1px solid #e5e7eb'
                }
            }, [
                e('div', {
                    key: 'info-grid',
                    style: {
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem'
                    }
                }, [
                    // Información de creación
                    ruta.created_at && e('div', {
                        key: 'created-info',
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.25rem'
                        }
                    }, [
                        e('span', {
                            key: 'created-label',
                            style: {
                                fontSize: '0.75rem',
                                fontWeight: '500',
                                color: '#6b7280',
                                textTransform: 'uppercase'
                            }
                        }, 'Fecha de Creación'),
                        e('span', {
                            key: 'created-value',
                            style: {
                                fontSize: '0.875rem',
                                color: '#374151'
                            }
                        }, new Date(ruta.created_at).toLocaleString('es-GT'))
                    ]),

                    // Información de actualización
                    ruta.updated_at && e('div', {
                        key: 'updated-info',
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.25rem'
                        }
                    }, [
                        e('span', {
                            key: 'updated-label',
                            style: {
                                fontSize: '0.75rem',
                                fontWeight: '500',
                                color: '#6b7280',
                                textTransform: 'uppercase'
                            }
                        }, 'Última Actualización'),
                        e('span', {
                            key: 'updated-value',
                            style: {
                                fontSize: '0.875rem',
                                color: '#374151'
                            }
                        }, new Date(ruta.updated_at).toLocaleString('es-GT'))
                    ]),

                    // Estado de la ruta
                    ruta.acepta_reservas !== undefined && e('div', {
                        key: 'reservas-info',
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.25rem'
                        }
                    }, [
                        e('span', {
                            key: 'reservas-label',
                            style: {
                                fontSize: '0.75rem',
                                fontWeight: '500',
                                color: '#6b7280',
                                textTransform: 'uppercase'
                            }
                        }, 'Acepta Reservas'),
                        e('span', {
                            key: 'reservas-value',
                            style: {
                                fontSize: '0.875rem',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '6px',
                                backgroundColor: ruta.acepta_reservas ? '#dcfce7' : '#fef3c7',
                                color: ruta.acepta_reservas ? '#16a34a' : '#d97706',
                                display: 'inline-block',
                                fontWeight: '500'
                            }
                        }, ruta.acepta_reservas ? 'Sí' : 'No')
                    ]),

                    // Reservas próximas
                    ruta.reservas_proximas !== undefined && e('div', {
                        key: 'proximas-info',
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.25rem'
                        }
                    }, [
                        e('span', {
                            key: 'proximas-label',
                            style: {
                                fontSize: '0.75rem',
                                fontWeight: '500',
                                color: '#6b7280',
                                textTransform: 'uppercase'
                            }
                        }, 'Reservas Próximas'),
                        e('span', {
                            key: 'proximas-value',
                            style: {
                                fontSize: '0.875rem',
                                color: '#374151',
                                fontWeight: '600'
                            }
                        }, ruta.reservas_proximas || 0)
                    ]),

                    // Opera hoy
                    ruta.opera_hoy !== undefined && e('div', {
                        key: 'hoy-info',
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.25rem'
                        }
                    }, [
                        e('span', {
                            key: 'hoy-label',
                            style: {
                                fontSize: '0.75rem',
                                fontWeight: '500',
                                color: '#6b7280',
                                textTransform: 'uppercase'
                            }
                        }, 'Opera Hoy'),
                        e('span', {
                            key: 'hoy-value',
                            style: {
                                fontSize: '0.875rem',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '6px',
                                backgroundColor: ruta.opera_hoy ? '#dbeafe' : '#f3f4f6',
                                color: ruta.opera_hoy ? '#1d4ed8' : '#6b7280',
                                display: 'inline-block',
                                fontWeight: '500'
                            }
                        }, ruta.opera_hoy ? 'Sí' : 'No')
                    ])
                ])
            ])
        ])
    ]);
}

export default RutasServiciosModal;
