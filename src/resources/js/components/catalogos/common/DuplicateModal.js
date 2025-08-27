// src/resources/js/components/catalogos/common/DuplicateModal.js
import React from 'react';
import Icons from '../../../utils/Icons';

const { createElement: e, useState } = React;

function DuplicateModal({
    isOpen,
    inactiveRecord,
    newData,
    onReactivate,
    onCreateNew,
    onCancel
}) {
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleReactivate = async () => {
        setLoading(true);
        try {
            await onReactivate();
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNew = () => {
        onCreateNew();
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
        onClick: (e) => e.target === e.currentTarget && onCancel()
    }, [
        e('div', {
            key: 'modal',
            style: {
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                maxWidth: '600px',
                width: '100%',
                maxHeight: '80vh',
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
                    backgroundColor: '#fef3c7'
                }
            }, [
                e('div', {
                    key: 'icon',
                    style: {
                        width: '48px',
                        height: '48px',
                        backgroundColor: '#f59e0b',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                    }
                }, Icons.alertTriangle()),
                e('div', { key: 'title-section' }, [
                    e('h3', {
                        key: 'title',
                        style: {
                            fontSize: '1.125rem',
                            fontWeight: '600',
                            color: '#92400e',
                            margin: 0
                        }
                    }, 'Registro Inactivo Encontrado'),
                    e('p', {
                        key: 'subtitle',
                        style: {
                            fontSize: '0.875rem',
                            color: '#a16207',
                            margin: '0.25rem 0 0 0'
                        }
                    }, `Ya existe un registro con código "${inactiveRecord.value}"`)
                ])
            ]),

            // Content
            e('div', {
                key: 'content',
                style: {
                    padding: '1.5rem',
                    flex: 1,
                    overflow: 'auto'
                }
            }, [
                e('div', {
                    key: 'comparison',
                    style: {
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '1rem',
                        marginBottom: '1.5rem'
                    }
                }, [
                    // Registro existente (inactivo)
                    e('div', {
                        key: 'existing',
                        style: {
                            padding: '1rem',
                            backgroundColor: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: '8px'
                        }
                    }, [
                        e('h4', {
                            key: 'existing-title',
                            style: {
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                color: '#dc2626',
                                margin: '0 0 0.75rem 0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }
                        }, [
                            Icons.archive(),
                            'Registro Inactivo'
                        ]),
                        ...Object.entries(inactiveRecord.data).map(([key, value]) => {
                            if (['id', 'created_at', 'updated_at', 'deleted_at', 'situacion'].includes(key)) return null;
                            return e('div', {
                                key: `inactive-${key}`,
                                style: {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginBottom: '0.5rem',
                                    fontSize: '0.75rem'
                                }
                            }, [
                                e('span', {
                                    key: `inactive-${key}-label`,
                                    style: { fontWeight: '500', color: '#6b7280' }
                                }, key + ':'),
                                e('span', {
                                    key: `inactive-${key}-value`,
                                    style: { color: '#374151' }
                                }, String(value || '-'))
                            ]);
                        }).filter(Boolean)
                    ]),

                    // Datos nuevos
                    e('div', {
                        key: 'new',
                        style: {
                            padding: '1rem',
                            backgroundColor: '#f0f9ff',
                            border: '1px solid #bae6fd',
                            borderRadius: '8px'
                        }
                    }, [
                        e('h4', {
                            key: 'new-title',
                            style: {
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                color: '#0284c7',
                                margin: '0 0 0.75rem 0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }
                        }, [
                            Icons.plus(),
                            'Datos Nuevos'
                        ]),
                        ...Object.entries(newData).map(([key, value]) => {
                            if (['situacion'].includes(key)) return null;
                            return e('div', {
                                key: `new-${key}`,
                                style: {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginBottom: '0.5rem',
                                    fontSize: '0.75rem'
                                }
                            }, [
                                e('span', {
                                    key: `new-${key}-label`,
                                    style: { fontWeight: '500', color: '#6b7280' }
                                }, key + ':'),
                                e('span', {
                                    key: `new-${key}-value`,
                                    style: { color: '#374151' }
                                }, String(value || '-'))
                            ]);
                        })
                    ])
                ]),

                // Options explanation
                e('div', {
                    key: 'options-info',
                    style: {
                        padding: '1rem',
                        backgroundColor: '#f3f4f6',
                        borderRadius: '8px',
                        marginBottom: '1rem'
                    }
                }, [
                    e('h4', {
                        key: 'options-title',
                        style: {
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: '#374151',
                            margin: '0 0 0.5rem 0'
                        }
                    }, '¿Qué desea hacer?'),
                    e('ul', {
                        key: 'options-list',
                        style: {
                            fontSize: '0.75rem',
                            color: '#6b7280',
                            margin: 0,
                            paddingLeft: '1rem'
                        }
                    }, [
                        e('li', {
                            key: 'option1',
                            style: { marginBottom: '0.25rem' }
                        }, 'Reactivar: El registro inactivo será reactivado con los datos nuevos'),
                        e('li', {
                            key: 'option2'
                        }, 'Crear Nuevo: Cambie el código y cree un registro diferente')
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
                }, 'Crear Nuevo'),

                e('button', {
                    key: 'reactivate',
                    onClick: handleReactivate,
                    disabled: loading,
                    style: {
                        padding: '0.75rem 1.5rem',
                        border: 'none',
                        borderRadius: '6px',
                        backgroundColor: loading ? '#9ca3af' : '#059669',
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
                    loading ? 'Reactivando...' : 'Reactivar Registro'
                ])
            ])
        ])
    ]);
}

export default DuplicateModal;
