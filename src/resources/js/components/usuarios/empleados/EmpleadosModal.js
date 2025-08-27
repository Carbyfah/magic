// src/resources/js/components/usuarios/empleados/EmpleadosModal.js
import React from 'react';
import EmpleadosForm from './EmpleadosForm';
import Icons from '../../../utils/Icons';

const { createElement: e, useEffect } = React;

function EmpleadosModal({
    isOpen = false,
    mode = 'create', // create, edit, view
    empleado = null,
    roles = [],
    estadosEmpleado = [],
    onClose,
    onSave
}) {
    // Cerrar modal con ESC
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
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

    // Obtener configuración según el modo
    const getModalConfig = () => {
        switch (mode) {
            case 'create':
                return {
                    title: 'Nuevo Empleado',
                    subtitle: 'Registrar un nuevo empleado en el sistema',
                    icon: Icons.userPlus(),
                    iconColor: '#059669',
                    iconBg: '#d1fae5'
                };
            case 'edit':
                return {
                    title: 'Editar Empleado',
                    subtitle: empleado?.persona?.nombre_completo || 'Modificar información del empleado',
                    icon: Icons.edit(),
                    iconColor: '#3b82f6',
                    iconBg: '#dbeafe'
                };
            case 'view':
                return {
                    title: 'Detalles del Empleado',
                    subtitle: empleado?.persona?.nombre_completo || 'Información del empleado',
                    icon: Icons.eye(),
                    iconColor: '#6b7280',
                    iconBg: '#f3f4f6'
                };
            default:
                return {
                    title: 'Empleado',
                    subtitle: '',
                    icon: Icons.user(),
                    iconColor: '#6b7280',
                    iconBg: '#f3f4f6'
                };
        }
    };

    if (!isOpen) return null;

    const config = getModalConfig();

    return e('div', {
        style: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
            backdropFilter: 'blur(4px)'
        },
        onClick: handleBackdropClick
    }, [
        e('div', {
            key: 'modal-container',
            style: {
                backgroundColor: 'white',
                borderRadius: '16px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                width: '100%',
                maxWidth: mode === 'view' ? '700px' : '600px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                animation: 'modalSlideIn 0.3s ease-out'
            }
        }, [
            // Header del modal
            e('div', {
                key: 'modal-header',
                style: {
                    padding: '1.5rem 2rem 1rem 2rem',
                    borderBottom: '1px solid #f1f5f9',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between'
                }
            }, [
                e('div', {
                    key: 'header-content',
                    style: {
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '1rem',
                        flex: '1'
                    }
                }, [
                    // Icono
                    e('div', {
                        key: 'modal-icon',
                        style: {
                            padding: '0.75rem',
                            backgroundColor: config.iconBg,
                            borderRadius: '12px',
                            color: config.iconColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }
                    }, config.icon),

                    // Títulos
                    e('div', {
                        key: 'header-text',
                        style: { flex: '1', minWidth: 0 }
                    }, [
                        e('h2', {
                            key: 'modal-title',
                            style: {
                                fontSize: '1.5rem',
                                fontWeight: '700',
                                color: '#111827',
                                margin: '0 0 0.25rem 0',
                                lineHeight: '1.2'
                            }
                        }, config.title),
                        e('p', {
                            key: 'modal-subtitle',
                            style: {
                                color: '#6b7280',
                                margin: '0',
                                fontSize: '0.875rem',
                                lineHeight: '1.4',
                                wordBreak: 'break-word'
                            }
                        }, config.subtitle)
                    ])
                ]),

                // Botón cerrar
                e('button', {
                    key: 'close-button',
                    onClick: onClose,
                    style: {
                        padding: '0.5rem',
                        border: 'none',
                        borderRadius: '8px',
                        backgroundColor: 'transparent',
                        color: '#6b7280',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        flexShrink: 0,
                        marginLeft: '1rem'
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

            // Body del modal
            e('div', {
                key: 'modal-body',
                style: {
                    flex: '1',
                    overflow: 'auto',
                    padding: '0'
                }
            }, [
                // Información adicional para modo vista
                mode === 'view' && empleado && e('div', {
                    key: 'view-header',
                    style: {
                        backgroundColor: '#f8fafc',
                        padding: '1.5rem 2rem',
                        borderBottom: '1px solid #e2e8f0'
                    }
                }, [
                    e('div', {
                        key: 'employee-summary',
                        style: {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '1rem'
                        }
                    }, [
                        // Código de empleado
                        e('div', {
                            key: 'codigo-summary',
                            style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem'
                            }
                        }, [
                            e('div', {
                                key: 'codigo-icon',
                                style: {
                                    padding: '0.5rem',
                                    backgroundColor: '#e0e7ff',
                                    borderRadius: '8px',
                                    color: '#4338ca'
                                }
                            }, Icons.hashtag()),
                            e('div', { key: 'codigo-info' }, [
                                e('div', {
                                    key: 'codigo-label',
                                    style: {
                                        fontSize: '0.75rem',
                                        color: '#64748b',
                                        fontWeight: '500',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em'
                                    }
                                }, 'Código'),
                                e('div', {
                                    key: 'codigo-value',
                                    style: {
                                        fontSize: '0.875rem',
                                        color: '#1e293b',
                                        fontWeight: '600',
                                        fontFamily: 'monospace'
                                    }
                                }, empleado.codigo_empleado || '-')
                            ])
                        ]),

                        // Fecha ingreso
                        empleado.fecha_ingreso && e('div', {
                            key: 'ingreso-summary',
                            style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem'
                            }
                        }, [
                            e('div', {
                                key: 'ingreso-icon',
                                style: {
                                    padding: '0.5rem',
                                    backgroundColor: '#dcfce7',
                                    borderRadius: '8px',
                                    color: '#16a34a'
                                }
                            }, Icons.calendar()),
                            e('div', { key: 'ingreso-info' }, [
                                e('div', {
                                    key: 'ingreso-label',
                                    style: {
                                        fontSize: '0.75rem',
                                        color: '#64748b',
                                        fontWeight: '500',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em'
                                    }
                                }, 'Ingreso'),
                                e('div', {
                                    key: 'ingreso-value',
                                    style: {
                                        fontSize: '0.875rem',
                                        color: '#1e293b',
                                        fontWeight: '600'
                                    }
                                }, new Date(empleado.fecha_ingreso).toLocaleDateString('es-GT'))
                            ])
                        ]),

                        // Último acceso
                        empleado.ultimo_acceso && e('div', {
                            key: 'acceso-summary',
                            style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem'
                            }
                        }, [
                            e('div', {
                                key: 'acceso-icon',
                                style: {
                                    padding: '0.5rem',
                                    backgroundColor: '#fef3c7',
                                    borderRadius: '8px',
                                    color: '#d97706'
                                }
                            }, Icons.clock()),
                            e('div', { key: 'acceso-info' }, [
                                e('div', {
                                    key: 'acceso-label',
                                    style: {
                                        fontSize: '0.75rem',
                                        color: '#64748b',
                                        fontWeight: '500',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em'
                                    }
                                }, 'Último Acceso'),
                                e('div', {
                                    key: 'acceso-value',
                                    style: {
                                        fontSize: '0.875rem',
                                        color: '#1e293b',
                                        fontWeight: '600'
                                    }
                                }, new Date(empleado.ultimo_acceso).toLocaleDateString('es-GT'))
                            ])
                        ])
                    ])
                ]),

                // Formulario
                e(EmpleadosForm, {
                    key: 'empleados-form',
                    empleado: empleado,
                    mode: mode,
                    roles: roles,
                    estadosEmpleado: estadosEmpleado,
                    onSave: onSave,
                    onCancel: onClose
                })
            ])
        ])
    ]);
}

export default EmpleadosModal;
