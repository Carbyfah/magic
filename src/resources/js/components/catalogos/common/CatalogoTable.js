// src/resources/js/components/catalogos/common/CatalogoTable.js
import React from 'react';
import Icons from '../../../utils/Icons';

const { createElement: e } = React;

function CatalogoTable({
    data,
    campos,
    loading,
    error,
    onEdit,
    onView,
    onDelete,
    onToggleStatus
}) {

    // Función para renderizar valores de celda con tipos especiales
    const renderCellValue = (item, campo) => {
        const value = item[campo.key];

        // Casos especiales por nombre de campo o tipo
        switch (campo.key) {
            case 'color_hex':
                if (!value) return e('span', { style: { color: '#9ca3af' } }, 'Sin color');

                return e('div', {
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }
                }, [
                    // Círculo de color
                    e('div', {
                        key: 'color-circle',
                        style: {
                            width: '20px',
                            height: '20px',
                            backgroundColor: value,
                            border: '1px solid #d1d5db',
                            borderRadius: '50%',
                            flexShrink: 0
                        }
                    }),
                    // Código hex
                    e('span', {
                        key: 'color-text',
                        style: {
                            fontFamily: 'monospace',
                            fontSize: '0.75rem',
                            color: '#6b7280'
                        }
                    }, value)
                ]);

            case 'situacion':
                return e('span', {
                    style: {
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        backgroundColor: value ? '#dcfce7' : '#fee2e2',
                        color: value ? '#166534' : '#dc2626'
                    }
                }, value ? 'Activo' : 'Inactivo');

            case 'editable':
            case 'cuenta_ocupacion':
                return e('span', {
                    style: {
                        color: value ? '#059669' : '#dc2626',
                        fontWeight: '500'
                    }
                }, value ? 'Sí' : 'No');

            default:
                if (value === null || value === undefined || value === '') {
                    return e('span', { style: { color: '#9ca3af' } }, '-');
                }
                return String(value);
        }
    };

    if (loading) {
        return e('div', {
            style: {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '3rem',
                color: '#6b7280'
            }
        }, [
            e('div', {
                key: 'loading-spinner',
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                }
            }, [
                e('div', {
                    key: 'spinner',
                    style: {
                        width: '24px',
                        height: '24px',
                        border: '3px solid #e5e7eb',
                        borderTop: '3px solid #3b82f6',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }
                }),
                e('span', { key: 'loading-text' }, 'Cargando datos...')
            ])
        ]);
    }

    if (error) {
        return e('div', {
            style: {
                textAlign: 'center',
                padding: '3rem',
                color: '#dc2626',
                backgroundColor: '#fef2f2',
                borderRadius: '8px',
                border: '1px solid #fecaca'
            }
        }, [
            e('div', {
                key: 'error-icon',
                style: { marginBottom: '1rem', fontSize: '2rem' }
            }, '⚠️'),
            e('h3', {
                key: 'error-title',
                style: { marginBottom: '0.5rem', fontWeight: '600' }
            }, 'Error al cargar datos'),
            e('p', { key: 'error-message' }, error)
        ]);
    }

    if (!data || data.length === 0) {
        return e('div', {
            style: {
                textAlign: 'center',
                padding: '3rem',
                color: '#6b7280',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
            }
        }, [
            e('div', {
                key: 'empty-icon',
                style: { marginBottom: '1rem', fontSize: '3rem' }
            }, '📄'),
            e('h3', {
                key: 'empty-title',
                style: { marginBottom: '0.5rem', fontWeight: '600' }
            }, 'No hay registros'),
            e('p', { key: 'empty-message' }, 'No se encontraron datos para mostrar.')
        ]);
    }

    return e('div', {
        style: {
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }
    }, [
        e('table', {
            key: 'data-table',
            style: { width: '100%', borderCollapse: 'collapse' }
        }, [
            // Header
            e('thead', {
                key: 'thead',
                style: { backgroundColor: '#f8fafc' }
            }, [
                e('tr', { key: 'header-row' }, [
                    ...campos.map((campo, index) =>
                        e('th', {
                            key: campo.key,
                            style: {
                                padding: '1rem',
                                textAlign: 'left',
                                fontWeight: '600',
                                fontSize: '0.875rem',
                                color: '#374151',
                                borderRight: index < campos.length - 1 ? '1px solid #e5e7eb' : 'none'
                            }
                        }, campo.label)
                    ),
                    e('th', {
                        key: 'actions',
                        style: {
                            padding: '1rem',
                            textAlign: 'center',
                            fontWeight: '600',
                            fontSize: '0.875rem',
                            color: '#374151',
                            width: '120px'
                        }
                    }, 'Acciones')
                ])
            ]),

            // Body
            e('tbody', {
                key: 'tbody'
            }, data.map((item, rowIndex) =>
                e('tr', {
                    key: item.id || rowIndex,
                    style: {
                        borderBottom: '1px solid #f3f4f6',
                        transition: 'background-color 0.2s'
                    },
                    onMouseEnter: (e) => e.currentTarget.style.backgroundColor = '#f9fafb',
                    onMouseLeave: (e) => e.currentTarget.style.backgroundColor = 'transparent'
                }, [
                    ...campos.map((campo, colIndex) =>
                        e('td', {
                            key: campo.key,
                            style: {
                                padding: '1rem',
                                fontSize: '0.875rem',
                                color: '#374151',
                                borderRight: colIndex < campos.length - 1 ? '1px solid #f3f4f6' : 'none'
                            }
                        }, renderCellValue(item, campo))
                    ),

                    // Columna de acciones
                    e('td', {
                        key: 'actions',
                        style: {
                            padding: '1rem',
                            textAlign: 'center'
                        }
                    }, [
                        e('div', {
                            key: 'action-buttons',
                            style: {
                                display: 'flex',
                                gap: '0.5rem',
                                justifyContent: 'center'
                            }
                        }, [
                            // Botón Ver
                            e('button', {
                                key: 'btn-view',
                                onClick: () => onView(item),
                                title: 'Ver detalles',
                                style: {
                                    padding: '0.5rem',
                                    backgroundColor: 'transparent',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    color: '#6b7280',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    transition: 'all 0.2s'
                                },
                                onMouseEnter: (e) => {
                                    e.target.style.backgroundColor = '#f3f4f6';
                                    e.target.style.borderColor = '#9ca3af';
                                },
                                onMouseLeave: (e) => {
                                    e.target.style.backgroundColor = 'transparent';
                                    e.target.style.borderColor = '#d1d5db';
                                }
                            }, Icons.eye()),

                            // Botón Editar
                            e('button', {
                                key: 'btn-edit',
                                onClick: () => onEdit(item),
                                title: 'Editar registro',
                                style: {
                                    padding: '0.5rem',
                                    backgroundColor: 'transparent',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    color: '#3b82f6',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    transition: 'all 0.2s'
                                },
                                onMouseEnter: (e) => {
                                    e.target.style.backgroundColor = '#eff6ff';
                                    e.target.style.borderColor = '#3b82f6';
                                },
                                onMouseLeave: (e) => {
                                    e.target.style.backgroundColor = 'transparent';
                                    e.target.style.borderColor = '#d1d5db';
                                }
                            }, Icons.edit()),

                            // BOTÓN TOGGLE STATUS - LÓGICA CORREGIDA
                            e('button', {
                                key: 'btn-toggle-status',
                                onClick: () => onToggleStatus(item),
                                title: item.situacion ?
                                    'Desactivar registro (cambiar a inactivo)' :
                                    'Activar registro (cambiar a activo)',
                                style: {
                                    padding: '0.5rem',
                                    backgroundColor: 'transparent',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    // COLORES INVERTIDOS: Si está activo, mostrar color rojo (para desactivar)
                                    color: item.situacion ? '#dc2626' : '#059669',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    transition: 'all 0.2s'
                                },
                                onMouseEnter: (e) => {
                                    if (item.situacion) {
                                        // Registro activo → hover rojo (para desactivar)
                                        e.target.style.backgroundColor = '#fef2f2';
                                        e.target.style.borderColor = '#dc2626';
                                    } else {
                                        // Registro inactivo → hover verde (para activar)
                                        e.target.style.backgroundColor = '#f0fdf4';
                                        e.target.style.borderColor = '#059669';
                                    }
                                },
                                onMouseLeave: (e) => {
                                    e.target.style.backgroundColor = 'transparent';
                                    e.target.style.borderColor = '#d1d5db';
                                }
                            },
                                // ÍCONOS INTUITIVOS:
                                // Si está activo (situacion = 1) → mostrar X (para desactivar)
                                // Si está inactivo (situacion = 0) → mostrar check (para activar)
                                item.situacion ? Icons.close() : Icons.checkCircle())
                        ])
                    ])
                ])
            ))
        ])
    ]);
}

export default CatalogoTable;
