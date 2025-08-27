// src/resources/js/components/catalogos/common/ToggleConfirmationModal.js
import React from 'react';
import Icons from '../../../utils/Icons';

const { createElement: e, useState } = React;

function ToggleConfirmationModal({
    isOpen,
    item,
    onConfirm,
    onCancel
}) {
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const isActive = item?.situacion === 1;
    const action = isActive ? 'desactivar' : 'activar';
    const actionTitle = isActive ? 'Desactivar' : 'Activar';
    const actionColor = isActive ? '#dc2626' : '#059669';
    const actionBgColor = isActive ? '#fef2f2' : '#f0fdf4';
    const actionIcon = isActive ? Icons.close() : Icons.checkCircle();

    // Obtener nombre del elemento para mostrar
    const getItemName = (item) => {
        return item?.nombre ||
            item?.nombre_estado ||
            item?.codigo ||
            item?.name ||
            `Registro #${item?.id}` ||
            'este registro';
    };

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await onConfirm();
        } finally {
            setLoading(false);
        }
    };

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
        onClick: (e) => e.target === e.currentTarget && !loading && onCancel()
    }, [
        e('div', {
            key: 'modal',
            style: {
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                maxWidth: '500px',
                width: '100%',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
            }
        }, [
            // Header
            e('div', {
                key: 'header',
                style: {
                    padding: '1.5rem',
                    borderBottom: '1px solid #e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    backgroundColor: actionBgColor
                }
            }, [
                e('div', {
                    key: 'icon',
                    style: {
                        width: '48px',
                        height: '48px',
                        backgroundColor: actionColor,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                    }
                }, actionIcon),
                e('div', { key: 'title-section' }, [
                    e('h3', {
                        key: 'title',
                        style: {
                            fontSize: '1.125rem',
                            fontWeight: '600',
                            color: actionColor,
                            margin: 0
                        }
                    }, `${actionTitle} Registro`),
                    e('p', {
                        key: 'subtitle',
                        style: {
                            fontSize: '0.875rem',
                            color: '#6b7280',
                            margin: '0.25rem 0 0 0'
                        }
                    }, `¿Está seguro que desea ${action} este registro?`)
                ])
            ]),

            // Content
            e('div', {
                key: 'content',
                style: {
                    padding: '1.5rem'
                }
            }, [
                // Información del registro
                e('div', {
                    key: 'item-info',
                    style: {
                        padding: '1rem',
                        backgroundColor: '#f9fafb',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        marginBottom: '1.5rem'
                    }
                }, [
                    e('h4', {
                        key: 'item-title',
                        style: {
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: '#111827',
                            margin: '0 0 0.5rem 0'
                        }
                    }, 'Registro a modificar:'),
                    e('div', {
                        key: 'item-name',
                        style: {
                            fontSize: '1rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }
                    }, getItemName(item)),
                    e('div', {
                        key: 'current-status',
                        style: {
                            fontSize: '0.75rem',
                            color: '#6b7280',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }
                    }, [
                        'Estado actual:',
                        e('span', {
                            key: 'status-badge',
                            style: {
                                padding: '0.125rem 0.5rem',
                                borderRadius: '9999px',
                                backgroundColor: isActive ? '#dcfce7' : '#fee2e2',
                                color: isActive ? '#166534' : '#991b1b',
                                fontSize: '0.75rem',
                                fontWeight: '500'
                            }
                        }, isActive ? 'Activo' : 'Inactivo')
                    ])
                ]),

                // Advertencia sobre la acción
                e('div', {
                    key: 'warning-info',
                    style: {
                        padding: '1rem',
                        backgroundColor: isActive ? '#fef3c7' : '#f0f9ff',
                        border: `1px solid ${isActive ? '#fbbf24' : '#93c5fd'}`,
                        borderRadius: '8px',
                        marginBottom: '1rem'
                    }
                }, [
                    e('div', {
                        key: 'warning-header',
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginBottom: '0.5rem'
                        }
                    }, [
                        e('div', {
                            key: 'warning-icon',
                            style: {
                                color: isActive ? '#d97706' : '#2563eb'
                            }
                        }, isActive ? Icons.alertTriangle() : Icons.info()),
                        e('h4', {
                            key: 'warning-title',
                            style: {
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                color: isActive ? '#92400e' : '#1e40af',
                                margin: 0
                            }
                        }, isActive ? 'Al desactivar este registro:' : 'Al activar este registro:')
                    ]),
                    e('ul', {
                        key: 'warning-list',
                        style: {
                            fontSize: '0.75rem',
                            color: isActive ? '#a16207' : '#1e40af',
                            margin: 0,
                            paddingLeft: '1rem'
                        }
                    }, [
                        e('li', {
                            key: 'effect1',
                            style: { marginBottom: '0.25rem' }
                        }, isActive
                            ? 'No aparecerá en las listas principales'
                            : 'Volverá a aparecer en las listas principales'
                        ),
                        e('li', {
                            key: 'effect2',
                            style: { marginBottom: '0.25rem' }
                        }, isActive
                            ? 'No estará disponible para nuevas asignaciones'
                            : 'Estará disponible para nuevas asignaciones'
                        ),
                        e('li', {
                            key: 'effect3'
                        }, isActive
                            ? 'Podrá reactivarlo desde el filtro "Inactivos"'
                            : 'Los datos existentes no se perderán'
                        )
                    ])
                ])
            ]),

            // Actions
            e('div', {
                key: 'actions',
                style: {
                    padding: '1.5rem',
                    borderTop: '1px solid #e5e7eb',
                    display: 'flex',
                    gap: '0.75rem',
                    justifyContent: 'flex-end'
                }
            }, [
                e('button', {
                    key: 'cancel',
                    onClick: onCancel,
                    disabled: loading,
                    style: {
                        padding: '0.75rem 1.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        backgroundColor: 'white',
                        color: '#374151',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.5 : 1
                    }
                }, 'Cancelar'),

                e('button', {
                    key: 'confirm',
                    onClick: handleConfirm,
                    disabled: loading,
                    style: {
                        padding: '0.75rem 1.5rem',
                        border: 'none',
                        borderRadius: '6px',
                        backgroundColor: loading ? '#9ca3af' : actionColor,
                        color: 'white',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        cursor: loading ? 'not-allowed' : 'pointer',
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
                            border: '2px solid transparent',
                            borderTop: '2px solid white',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                        }
                    }),
                    loading ? 'Procesando...' : `${actionTitle} Registro`
                ])
            ])
        ])
    ]);
}

export default ToggleConfirmationModal;
