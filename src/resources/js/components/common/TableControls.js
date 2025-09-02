// src/resources/js/components/common/TableControls.js
import React from 'react';
import Icons from '../../utils/Icons';
import BotonesUniversal from './BotonesUniversal';

const { createElement: e } = React;

/**
 * Componente reutilizable de controles para tablas
 * Compatible con todas las 13 tablas del sistema Magic Travel
 */
const TableControls = ({
    config,
    filters,
    statistics,
    actions,
    loading = false,
    onRefresh = null,
    customFilters = null,
    showStatistics = true
}) => {

    // Renderizar estadísticas
    const renderStatistics = () => {
        if (!showStatistics) return null;

        const tarjetas = [
            {
                key: 'total',
                titulo: `Total ${config.displayName || config.tableName}`,
                valor: statistics.total,
                color: '#111827',
                icono: Icons.database('#111827')
            },
            {
                key: 'active',
                titulo: 'Activos',
                valor: statistics.active,
                color: '#22c55e',
                icono: Icons.checkCircle('#22c55e')
            },
            {
                key: 'inactive',
                titulo: 'Inactivos',
                valor: statistics.inactive,
                color: '#ef4444',
                icono: Icons.alertCircle('#ef4444')
            }
        ];

        // Agregar tarjeta de filtrados si hay filtros activos
        if (statistics.isFiltered) {
            tarjetas.push({
                key: 'filtered',
                titulo: 'Filtrados',
                valor: statistics.filtered,
                color: '#8b5cf6',
                icono: Icons.filter('#8b5cf6')
            });
        }

        return e('div', {
            key: 'statistics-section',
            style: {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '1rem',
                marginBottom: '1.5rem'
            }
        }, tarjetas.map(({ key, titulo, valor, color, icono }) =>
            e('div', {
                key: `stat-${key}`,
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                }
            }, [
                e('div', { key: `stat-content-${key}` }, [
                    e('p', {
                        key: `stat-title-${key}`,
                        style: {
                            fontSize: '0.75rem',
                            color: '#6b7280',
                            margin: '0 0 0.25rem 0',
                            fontWeight: '500'
                        }
                    }, titulo),
                    e('p', {
                        key: `stat-value-${key}`,
                        style: {
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            color: color,
                            margin: '0'
                        }
                    }, valor.toString())
                ]),
                e('div', {
                    key: `stat-icon-${key}`,
                    style: {
                        padding: '0.75rem',
                        backgroundColor: color + '20',
                        borderRadius: '8px',
                        color: color
                    }
                }, icono)
            ])
        ));
    };

    // Renderizar controles de ordenamiento
    const renderSortControls = () => {
        const sortableFields = config.sortableFields || [];
        if (sortableFields.length === 0) return null;

        return e('div', {
            key: 'sort-controls',
            style: {
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
            }
        }, [
            e('label', {
                style: {
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    whiteSpace: 'nowrap'
                }
            }, 'Ordenar por:'),

            e('select', {
                value: filters.sortField,
                onChange: (e) => actions.setSorting(e.target.value),
                style: {
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    backgroundColor: 'white',
                    minWidth: '150px'
                }
            }, [
                e('option', { key: 'none', value: '' }, 'Sin ordenar'),
                ...sortableFields.map(fieldName => {
                    const fieldConfig = config.fields[fieldName];
                    return e('option', {
                        key: fieldName,
                        value: fieldName
                    }, fieldConfig?.label || fieldName);
                })
            ]),

            filters.sortField && e('button', {
                key: 'sort-direction',
                onClick: () => actions.setSorting(filters.sortField),
                style: {
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    backgroundColor: '#f9fafb',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                },
                title: `Ordenamiento ${filters.sortDirection === 'asc' ? 'ascendente' : 'descendente'}`
            }, [
                filters.sortDirection === 'asc' ? Icons.sortAsc('#374151') : Icons.sortDesc('#374151'),
                e('span', {
                    style: { fontSize: '0.75rem', color: '#6b7280' }
                }, filters.sortDirection === 'asc' ? 'A-Z' : 'Z-A')
            ])
        ]);
    };

    // Renderizar filtros por campo específico
    const renderFieldFilters = () => {
        const filterableFields = config.filterableFields || [];
        if (filterableFields.length === 0) return null;

        return filterableFields.map(fieldName => {
            const fieldConfig = config.fields[fieldName];
            if (!fieldConfig || !fieldConfig.filterable) return null;

            const currentValue = filters.fieldFilters[fieldName] || '';

            return e('div', {
                key: `filter-${fieldName}`,
                style: {
                    display: 'flex',
                    flexDirection: 'column'
                }
            }, [
                e('label', {
                    style: {
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: '0.5rem'
                    }
                }, fieldConfig.label || fieldName),

                fieldConfig.type === 'select'
                    ? e('select', {
                        value: currentValue,
                        onChange: (e) => actions.setFieldFilter(fieldName, e.target.value),
                        style: {
                            padding: '0.5rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '0.875rem',
                            backgroundColor: 'white'
                        }
                    }, [
                        e('option', { key: 'all', value: '' }, 'Todos'),
                        ...(fieldConfig.options || []).map(option =>
                            e('option', {
                                key: option.value || option,
                                value: option.value || option
                            }, option.label || option)
                        )
                    ])
                    : e('input', {
                        type: fieldConfig.type === 'number' ? 'number' : 'text',
                        value: currentValue,
                        onChange: (e) => actions.setFieldFilter(fieldName, e.target.value),
                        placeholder: `Filtrar por ${fieldConfig.label || fieldName}`,
                        style: {
                            padding: '0.5rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '0.875rem',
                            width: '100%'
                        }
                    })
            ]);
        });
    };

    return e('div', {
        key: 'table-controls',
        style: {
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }
    }, [
        // Estadísticas
        renderStatistics(),

        // Panel de filtros principal
        e('div', {
            key: 'main-filters',
            style: {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1rem',
                alignItems: 'end',
                marginBottom: customFilters || config.filterableFields?.length ? '1rem' : '0'
            }
        }, [
            // Búsqueda global
            e('div', { key: 'global-search' }, [
                e('label', {
                    style: {
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: '0.5rem'
                    }
                }, 'Búsqueda Global'),
                BotonesUniversal.busqueda({
                    valor: filters.globalSearch,
                    onChange: actions.setGlobalSearch,
                    placeholder: `Buscar ${config.displayName || config.tableName}...`
                })
            ])
        ]),

        // Controles en línea: Ordenar por + Items por página + Mostrar inactivos
        e('div', {
            key: 'inline-controls',
            style: {
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem',
                flexWrap: 'wrap',
                marginBottom: customFilters || config.filterableFields?.length ? '1rem' : '0'
            }
        }, [
            // Controles de ordenamiento
            renderSortControls(),

            // Control de items por página
            e('div', {
                key: 'items-per-page-control',
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }
            }, [
                e('label', {
                    style: {
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: '#374151',
                        whiteSpace: 'nowrap'
                    }
                }, 'Mostrar:'),

                e('select', {
                    value: filters.itemsPerPage,
                    onChange: (e) => actions.setItemsPerPage(parseInt(e.target.value)),
                    style: {
                        padding: '0.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        backgroundColor: 'white',
                        minWidth: '80px'
                    }
                }, [
                    e('option', { key: '5', value: '5' }, '5'),
                    e('option', { key: '10', value: '10' }, '10'),
                    e('option', { key: '20', value: '20' }, '20'),
                    e('option', { key: '50', value: '50' }, '50')
                ]),

                e('label', {
                    style: {
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: '#374151',
                        whiteSpace: 'nowrap'
                    }
                }, 'por página')
            ]),

            // Toggle mostrar inactivos
            e('label', {
                key: 'show-inactive-toggle',
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                }
            }, [
                e('input', {
                    type: 'checkbox',
                    checked: filters.showInactive,
                    onChange: (e) => actions.setShowInactive(e.target.checked)
                }),
                'Mostrar inactivos'
            ]),

            // Botones de acción
            e('div', {
                key: 'action-buttons',
                style: {
                    display: 'flex',
                    gap: '0.5rem',
                    marginLeft: 'auto'
                }
            }, [
                // Botón actualizar
                onRefresh && BotonesUniversal.actualizar({
                    onClick: onRefresh,
                    loading: loading
                }),

                // Botón limpiar filtros
                BotonesUniversal.limpiar({
                    onClick: actions.clearFilters
                })
            ])
        ]),

        // Filtros por campo específico
        config.filterableFields?.length > 0 && e('div', {
            key: 'field-filters',
            style: {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                paddingTop: '1rem',
                borderTop: '1px solid #e5e7eb'
            }
        }, renderFieldFilters()),

        // Filtros personalizados
        customFilters && e('div', {
            key: 'custom-filters',
            style: {
                paddingTop: '1rem',
                borderTop: '1px solid #e5e7eb'
            }
        }, customFilters)
    ]);
};

export default TableControls;
