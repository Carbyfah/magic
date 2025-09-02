// src/resources/js/components/common/TablePagination.js
import React from 'react';
import Icons from '../../utils/Icons';

const { createElement: e } = React;

/**
 * Componente reutilizable de paginación
 * Compatible con el sistema Magic Travel - SIN selector de items por página
 */
const TablePagination = ({
    pagination,
    actions,
    showInfo = true,
    compact = false
}) => {
    const {
        currentPage,
        totalPages,
        totalItems,
        startItem,
        endItem,
        hasPreviousPage,
        hasNextPage
    } = pagination;

    // Función para generar números de página visibles
    const getVisiblePages = () => {
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const delta = compact ? 1 : 2;
        const range = [];
        const rangeWithDots = [];

        // Calcular rango alrededor de la página actual
        for (
            let i = Math.max(2, currentPage - delta);
            i <= Math.min(totalPages - 1, currentPage + delta);
            i++
        ) {
            range.push(i);
        }

        // Agregar primera página
        if (currentPage - delta > 2) {
            rangeWithDots.push(1, '...');
        } else {
            rangeWithDots.push(1);
        }

        // Agregar rango del medio
        rangeWithDots.push(...range);

        // Agregar última página
        if (currentPage + delta < totalPages - 1) {
            rangeWithDots.push('...', totalPages);
        } else if (totalPages > 1) {
            rangeWithDots.push(totalPages);
        }

        return rangeWithDots;
    };

    const visiblePages = getVisiblePages();

    if (totalItems === 0) return null;

    return e('div', {
        style: {
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            padding: compact ? '1rem' : '1.5rem'
        }
    }, [
        // Header solo con información de elementos mostrados
        showInfo && e('div', {
            key: 'pagination-header',
            style: {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: compact ? '0.75rem' : '1rem'
            }
        }, [
            // Información de elementos mostrados
            e('div', {
                key: 'pagination-info',
                style: {
                    fontSize: '0.875rem',
                    color: '#6b7280'
                }
            }, `Mostrando ${startItem} a ${endItem} de ${totalItems} elementos`)
        ]),

        // Controles de paginación
        e('div', {
            key: 'pagination-controls',
            style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.25rem',
                flexWrap: 'wrap'
            }
        }, [
            // Botón primera página
            e('button', {
                key: 'first-page',
                onClick: () => actions.goToFirstPage(),
                disabled: !hasPreviousPage,
                title: 'Primera página',
                style: {
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px 0 0 6px',
                    backgroundColor: !hasPreviousPage ? '#f9fafb' : 'white',
                    color: !hasPreviousPage ? '#9ca3af' : '#374151',
                    cursor: !hasPreviousPage ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'all 0.2s'
                },
                onMouseEnter: function () {
                    if (hasPreviousPage) {
                        this.style.backgroundColor = '#f3f4f6';
                    }
                },
                onMouseLeave: function () {
                    if (hasPreviousPage) {
                        this.style.backgroundColor = 'white';
                    }
                }
            }, e('span', { style: { fontSize: '0.75rem' } }, '««')),

            // Botón página anterior
            e('button', {
                key: 'prev-page',
                onClick: () => actions.goToPreviousPage(),
                disabled: !hasPreviousPage,
                title: 'Página anterior',
                style: {
                    padding: '0.5rem 0.75rem',
                    border: '1px solid #d1d5db',
                    borderLeft: 'none',
                    backgroundColor: !hasPreviousPage ? '#f9fafb' : 'white',
                    color: !hasPreviousPage ? '#9ca3af' : '#374151',
                    cursor: !hasPreviousPage ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'all 0.2s'
                },
                onMouseEnter: function () {
                    if (hasPreviousPage) {
                        this.style.backgroundColor = '#f3f4f6';
                    }
                },
                onMouseLeave: function () {
                    if (hasPreviousPage) {
                        this.style.backgroundColor = 'white';
                    }
                }
            }, Icons.chevronLeft('#374151')),

            // Números de página
            ...visiblePages.map((page, index) => {
                if (page === '...') {
                    return e('span', {
                        key: `dots-${index}`,
                        style: {
                            padding: '0.5rem 0.75rem',
                            color: '#9ca3af',
                            fontSize: '0.875rem'
                        }
                    }, '...');
                }

                const isActive = page === currentPage;
                return e('button', {
                    key: `page-${page}`,
                    onClick: () => actions.goToPage(page),
                    style: {
                        padding: '0.5rem 0.75rem',
                        border: '1px solid #d1d5db',
                        borderLeft: 'none',
                        backgroundColor: isActive ? '#8b5cf6' : 'white',
                        color: isActive ? 'white' : '#374151',
                        cursor: 'pointer',
                        minWidth: '40px',
                        fontSize: '0.875rem',
                        fontWeight: isActive ? '600' : '400',
                        transition: 'all 0.2s'
                    },
                    onMouseEnter: function () {
                        if (!isActive) {
                            this.style.backgroundColor = '#f3f4f6';
                        }
                    },
                    onMouseLeave: function () {
                        if (!isActive) {
                            this.style.backgroundColor = 'white';
                        }
                    }
                }, page.toString());
            }),

            // Botón página siguiente
            e('button', {
                key: 'next-page',
                onClick: () => actions.goToNextPage(),
                disabled: !hasNextPage,
                title: 'Página siguiente',
                style: {
                    padding: '0.5rem 0.75rem',
                    border: '1px solid #d1d5db',
                    borderLeft: 'none',
                    backgroundColor: !hasNextPage ? '#f9fafb' : 'white',
                    color: !hasNextPage ? '#9ca3af' : '#374151',
                    cursor: !hasNextPage ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'all 0.2s'
                },
                onMouseEnter: function () {
                    if (hasNextPage) {
                        this.style.backgroundColor = '#f3f4f6';
                    }
                },
                onMouseLeave: function () {
                    if (hasNextPage) {
                        this.style.backgroundColor = 'white';
                    }
                }
            }, Icons.chevronRight('#374151')),

            // Botón última página
            e('button', {
                key: 'last-page',
                onClick: () => actions.goToLastPage(),
                disabled: !hasNextPage,
                title: 'Última página',
                style: {
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderLeft: 'none',
                    borderRadius: '0 6px 6px 0',
                    backgroundColor: !hasNextPage ? '#f9fafb' : 'white',
                    color: !hasNextPage ? '#9ca3af' : '#374151',
                    cursor: !hasNextPage ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'all 0.2s'
                },
                onMouseEnter: function () {
                    if (hasNextPage) {
                        this.style.backgroundColor = '#f3f4f6';
                    }
                },
                onMouseLeave: function () {
                    if (hasNextPage) {
                        this.style.backgroundColor = 'white';
                    }
                }
            }, e('span', { style: { fontSize: '0.75rem' } }, '»»'))
        ]),

        // Footer con información adicional (solo en modo no compacto)
        !compact && e('div', {
            key: 'pagination-footer',
            style: {
                marginTop: '1rem',
                paddingTop: '1rem',
                borderTop: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '0.5rem'
            }
        }, [
            e('span', {
                style: {
                    fontSize: '0.75rem',
                    color: '#6b7280'
                }
            }, `Página ${currentPage} de ${totalPages}`),

            totalPages > 10 && e('span', {
                style: {
                    fontSize: '0.75rem',
                    color: '#9ca3af'
                }
            }, '•'),

            totalPages > 10 && e('div', {
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                }
            }, [
                e('label', {
                    style: {
                        fontSize: '0.75rem',
                        color: '#6b7280'
                    }
                }, 'Ir a:'),
                e('input', {
                    type: 'number',
                    min: 1,
                    max: totalPages,
                    defaultValue: currentPage,
                    onKeyDown: (e) => {
                        if (e.key === 'Enter') {
                            const page = parseInt(e.target.value);
                            if (page >= 1 && page <= totalPages) {
                                actions.goToPage(page);
                            }
                            e.target.value = currentPage;
                        }
                    },
                    style: {
                        width: '50px',
                        padding: '0.25rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        textAlign: 'center'
                    }
                })
            ])
        ])
    ]);
};

export default TablePagination;
