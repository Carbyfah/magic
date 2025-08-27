// src/resources/js/components/catalogos/common/CatalogoModal.js
import React from 'react';
import CatalogoForm from './CatalogoForm';
import Icons from '../../../utils/Icons';

const { createElement: e, useEffect } = React;

function CatalogoModal({
    isOpen,
    mode,
    item,
    campos,
    validaciones,
    titulo,
    onClose,
    onSave
}) {

    // Cerrar modal con ESC
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            // Prevenir scroll del body cuando el modal está abierto
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    // Función para formatear valores para vista
    const formatViewValue = (value, campo) => {
        if (value === null || value === undefined) return 'N/A';

        switch (campo.tipo) {
            case 'boolean':
                return value ? 'Sí' : 'No';
            case 'date':
                return new Date(value).toLocaleDateString();
            case 'datetime':
                return new Date(value).toLocaleString();
            case 'decimal':
                return parseFloat(value).toFixed(2);
            default:
                return value.toString();
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
        onClick: (e) => {
            // Cerrar modal si se hace clic en el backdrop
            if (e.target === e.currentTarget) {
                onClose();
            }
        }
    }, [
        e('div', {
            key: 'modal-content',
            style: {
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                width: '100%',
                maxWidth: mode === 'view' ? '600px' : '500px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                animation: 'modalSlideIn 0.3s ease-out'
            },
            onClick: (e) => e.stopPropagation() // Prevenir cierre al hacer clic dentro del modal
        }, [
            // Header del modal
            e('div', {
                key: 'modal-header',
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1.5rem',
                    borderBottom: '1px solid #e5e7eb',
                    backgroundColor: mode === 'view' ? '#f9fafb' : 'white',
                    borderTopLeftRadius: '12px',
                    borderTopRightRadius: '12px'
                }
            }, [
                e('div', {
                    key: 'title-section',
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                    }
                }, [
                    e('div', {
                        key: 'mode-icon',
                        style: {
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            ...(mode === 'create' && {
                                backgroundColor: '#dcfce7',
                                color: '#166534'
                            }),
                            ...(mode === 'edit' && {
                                backgroundColor: '#dbeafe',
                                color: '#1d4ed8'
                            }),
                            ...(mode === 'view' && {
                                backgroundColor: '#f3f4f6',
                                color: '#374151'
                            })
                        }
                    }, mode === 'create' ? Icons.plus() :
                        mode === 'edit' ? Icons.edit() : Icons.eye()),
                    e('h2', {
                        key: 'title',
                        style: {
                            fontSize: '1.25rem',
                            fontWeight: '600',
                            color: '#111827',
                            margin: 0
                        }
                    }, titulo)
                ]),
                e('button', {
                    key: 'close-btn',
                    onClick: onClose,
                    style: {
                        padding: '0.5rem',
                        backgroundColor: 'transparent',
                        border: 'none',
                        borderRadius: '6px',
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

            // Contenido del modal
            e('div', {
                key: 'modal-body',
                style: {
                    flex: 1,
                    overflowY: 'auto',
                    padding: mode === 'view' ? '0' : '1.5rem'
                }
            }, [
                mode === 'view'
                    ? // Vista de solo lectura
                    e('div', {
                        key: 'view-content',
                        style: {
                            padding: '1.5rem'
                        }
                    }, campos.map((campo) =>
                        e('div', {
                            key: campo.key,
                            style: {
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '0.75rem 0',
                                borderBottom: '1px solid #f3f4f6'
                            }
                        }, [
                            e('span', {
                                key: 'label',
                                style: {
                                    fontWeight: '500',
                                    color: '#374151'
                                }
                            }, campo.label + ':'),
                            e('span', {
                                key: 'value',
                                style: {
                                    color: '#6b7280',
                                    textAlign: 'right'
                                }
                            }, formatViewValue(item?.[campo.key], campo))
                        ])
                    ))
                    : // Formulario para crear/editar
                    e(CatalogoForm, {
                        key: 'form',
                        campos,
                        validaciones,
                        initialData: mode === 'edit' ? item : null,
                        onSubmit: onSave,
                        onCancel: onClose
                    })
            ])
        ])
    ]);
}

export default CatalogoModal;
