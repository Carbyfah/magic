// src/resources/js/components/common/BotonesUniversal.js
import React from 'react';
import Icons from '../../utils/Icons';

const { createElement: e } = React;

const BotonesUniversal = {

    // BOTONES DE ACCION PRINCIPAL
    nuevo: ({ onClick, texto = 'Nuevo', icono = Icons.plus(), loading = false, color = '#8b5cf6' }) =>
        e('button', {
            onClick,
            disabled: loading,
            style: {
                padding: '0.75rem 1.5rem',
                backgroundColor: loading ? '#9ca3af' : color,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                opacity: loading ? 0.7 : 1,
                transition: 'all 0.2s ease'
            }
        }, [
            loading ? e('div', {
                key: 'spinner',
                style: {
                    width: '16px',
                    height: '16px',
                    border: '2px solid #ffffff40',
                    borderTop: '2px solid #ffffff',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }
            }) : icono,
            loading ? 'Procesando...' : texto
        ]),

    // GRUPO DE BOTONES DE ACCION PARA ITEMS
    grupoAcciones: ({
        item,
        onVer,
        onEditar,
        onDuplicar,
        onActivar,
        onEliminar,
        activo = true,
        mostrarVer = true,
        mostrarEditar = true,
        mostrarDuplicar = true,
        mostrarActivar = true,
        mostrarEliminar = false
    }) => {
        const botones = [];

        if (mostrarVer) {
            botones.push(
                BotonesUniversal.ver({
                    onClick: () => onVer?.(item),
                    key: 'btn-ver'
                })
            );
        }

        if (mostrarEditar) {
            botones.push(
                BotonesUniversal.editar({
                    onClick: () => onEditar?.(item),
                    key: 'btn-editar'
                })
            );
        }

        if (mostrarDuplicar) {
            botones.push(
                BotonesUniversal.duplicar({
                    onClick: () => onDuplicar?.(item),
                    key: 'btn-duplicar'
                })
            );
        }

        if (mostrarActivar) {
            botones.push(
                BotonesUniversal.toggleEstado({
                    onClick: () => onActivar?.(item),
                    activo: activo,
                    key: 'btn-toggle'
                })
            );
        }

        if (mostrarEliminar) {
            botones.push(
                BotonesUniversal.eliminar({
                    onClick: () => onEliminar?.(item),
                    key: 'btn-eliminar'
                })
            );
        }

        return e('div', {
            style: {
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'center'
            }
        }, botones);
    },

    // BOTONES INDIVIDUALES DE ACCION
    ver: ({ onClick, titulo = 'Ver detalles', key }) =>
        e('button', {
            key,
            onClick,
            title: titulo,
            style: {
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: '#f0f9ff',
                color: '#0369a1',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.2s ease'
            }
        }, Icons.eye('#0369a1')),

    editar: ({ onClick, titulo = 'Editar', key }) =>
        e('button', {
            key,
            onClick,
            title: titulo,
            style: {
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: 'white',
                color: '#374151',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.2s ease'
            }
        }, Icons.edit('#374151')),

    duplicar: ({ onClick, titulo = 'Duplicar', key }) =>
        e('button', {
            key,
            onClick,
            title: titulo,
            style: {
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: '#fef3c7',
                color: '#f59e0b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.2s ease'
            }
        }, Icons.copy('#f59e0b')),

    eliminar: ({ onClick, titulo = 'Eliminar', key }) =>
        e('button', {
            key,
            onClick,
            title: titulo,
            style: {
                padding: '0.5rem',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.2s ease'
            }
        }, Icons.trash('#dc2626')),

    toggleEstado: ({ onClick, activo = true, titulo, key }) =>
        e('button', {
            key,
            onClick,
            title: titulo || (activo ? 'Desactivar' : 'Activar'),
            style: {
                padding: '0.5rem',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: activo ? '#fef2f2' : '#dcfce7',
                color: activo ? '#dc2626' : '#16a34a',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.2s ease'
            }
        }, activo ? Icons.pause('#dc2626') : Icons.play('#16a34a')),

    // BOTONES DE NAVEGACION Y UTILIDAD
    actualizar: ({ onClick, loading = false, texto = 'Actualizar' }) =>
        e('button', {
            onClick,
            disabled: loading,
            style: {
                padding: '0.5rem 1rem',
                backgroundColor: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                color: '#374151',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                opacity: loading ? 0.7 : 1
            }
        }, [
            loading ? e('div', {
                key: 'spinner',
                style: {
                    width: '14px',
                    height: '14px',
                    border: '2px solid #d1d5db',
                    borderTop: '2px solid #374151',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }
            }) : Icons.refresh('#374151'),
            texto
        ]),

    limpiar: ({ onClick, texto = 'Limpiar' }) =>
        e('button', {
            onClick,
            style: {
                padding: '0.5rem 1rem',
                backgroundColor: 'transparent',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                color: '#6b7280',
                cursor: 'pointer',
                fontSize: '0.875rem',
                transition: 'all 0.2s ease'
            }
        }, texto),

    // BOTONES DE FILTROS Y BUSQUEDA
    filtro: ({ activo = false, onClick, children, icono }) =>
        e('button', {
            onClick,
            style: {
                padding: '0.5rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: activo ? '#3b82f6' : 'white',
                color: activo ? 'white' : '#374151',
                cursor: 'pointer',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease'
            }
        }, [icono, children]),

    busqueda: ({ onSearch, placeholder = 'Buscar...', valor = '', onChange }) =>
        e('div', {
            style: {
                position: 'relative',
                flex: 1,
                maxWidth: '300px'
            }
        }, [
            e('input', {
                type: 'text',
                placeholder,
                value: valor,
                onChange: (e) => onChange?.(e.target.value),
                style: {
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    outline: 'none'
                }
            }),
            e('div', {
                style: {
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#9ca3af',
                    pointerEvents: 'none'
                }
            }, Icons.search('#9ca3af'))
        ]),

    // BOTONES DE EXPORTACION Y DESCARGA
    exportar: ({ onClick, formato = 'Excel', loading = false }) =>
        e('button', {
            onClick,
            disabled: loading,
            style: {
                padding: '0.75rem 1rem',
                backgroundColor: loading ? '#9ca3af' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.875rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                opacity: loading ? 0.7 : 1
            }
        }, [
            loading ? e('div', {
                key: 'spinner',
                style: {
                    width: '16px',
                    height: '16px',
                    border: '2px solid #ffffff40',
                    borderTop: '2px solid #ffffff',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }
            }) : Icons.download('#ffffff'),
            loading ? 'Exportando...' : `Exportar ${formato}`
        ]),

    imprimir: ({ onClick }) =>
        e('button', {
            onClick,
            style: {
                padding: '0.75rem 1rem',
                backgroundColor: '#6366f1',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.875rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
            }
        }, [Icons.fileText('#ffffff'), 'Imprimir']),

    // BOTONES DE PAGINACION
    paginacion: ({
        paginaActual = 1,
        totalPaginas = 1,
        onCambiarPagina,
        mostrarInfo = true
    }) => {
        const botones = [];

        // Botón anterior
        botones.push(
            e('button', {
                key: 'prev',
                onClick: () => onCambiarPagina?.(paginaActual - 1),
                disabled: paginaActual <= 1,
                style: {
                    padding: '0.5rem 0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px 0 0 6px',
                    backgroundColor: 'white',
                    color: paginaActual <= 1 ? '#9ca3af' : '#374151',
                    cursor: paginaActual <= 1 ? 'not-allowed' : 'pointer'
                }
            }, Icons.chevronLeft('#374151'))
        );

        // Páginas
        const rango = 2;
        const inicio = Math.max(1, paginaActual - rango);
        const fin = Math.min(totalPaginas, paginaActual + rango);

        for (let i = inicio; i <= fin; i++) {
            botones.push(
                e('button', {
                    key: `page-${i}`,
                    onClick: () => onCambiarPagina?.(i),
                    style: {
                        padding: '0.5rem 0.75rem',
                        border: '1px solid #d1d5db',
                        borderLeft: 'none',
                        backgroundColor: i === paginaActual ? '#3b82f6' : 'white',
                        color: i === paginaActual ? 'white' : '#374151',
                        cursor: 'pointer',
                        minWidth: '40px'
                    }
                }, i.toString())
            );
        }

        // Botón siguiente
        botones.push(
            e('button', {
                key: 'next',
                onClick: () => onCambiarPagina?.(paginaActual + 1),
                disabled: paginaActual >= totalPaginas,
                style: {
                    padding: '0.5rem 0.75rem',
                    border: '1px solid #d1d5db',
                    borderLeft: 'none',
                    borderRadius: '0 6px 6px 0',
                    backgroundColor: 'white',
                    color: paginaActual >= totalPaginas ? '#9ca3af' : '#374151',
                    cursor: paginaActual >= totalPaginas ? 'not-allowed' : 'pointer'
                }
            }, Icons.chevronRight('#374151'))
        );

        return e('div', {
            style: {
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
            }
        }, [
            e('div', {
                key: 'botones-pag',
                style: { display: 'flex' }
            }, botones),

            mostrarInfo && e('span', {
                key: 'info-pag',
                style: {
                    fontSize: '0.875rem',
                    color: '#6b7280'
                }
            }, `Página ${paginaActual} de ${totalPaginas}`)
        ]);
    },

    // BOTONES DE ESTADOS Y BADGES
    badge: ({
        texto,
        color = 'gris',
        onClick,
        icono
    }) => {
        const colores = {
            verde: { bg: '#dcfce7', color: '#16a34a' },
            rojo: { bg: '#fef2f2', color: '#dc2626' },
            azul: { bg: '#dbeafe', color: '#3b82f6' },
            amarillo: { bg: '#fef3c7', color: '#f59e0b' },
            gris: { bg: '#f3f4f6', color: '#374151' },
            morado: { bg: '#ede9fe', color: '#8b5cf6' }
        };

        const estilos = colores[color] || colores.gris;

        return e('span', {
            onClick,
            style: {
                padding: '0.25rem 0.75rem',
                backgroundColor: estilos.bg,
                color: estilos.color,
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: '500',
                cursor: onClick ? 'pointer' : 'default',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem'
            }
        }, [icono, texto]);
    },

    // BOTONES DE WHATSAPP Y COMUNICACION
    whatsapp: ({ onClick, telefono, mensaje = '' }) =>
        e('a', {
            href: `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`,
            target: '_blank',
            rel: 'noopener noreferrer',
            onClick,
            style: {
                padding: '0.5rem',
                backgroundColor: '#25d366',
                border: 'none',
                borderRadius: '6px',
                color: 'white',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                textDecoration: 'none'
            }
        }, Icons.whatsapp('#ffffff')),

    copiarTexto: ({ texto, onCopiar }) =>
        e('button', {
            onClick: async () => {
                try {
                    await navigator.clipboard.writeText(texto);
                    onCopiar?.();
                } catch (error) {
                    console.error('Error al copiar:', error);
                }
            },
            title: 'Copiar al portapapeles',
            style: {
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: 'white',
                color: '#374151',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
            }
        }, Icons.copy('#374151')),

    // BOTONES DE CALCULADORA Y HERRAMIENTAS
    calculadora: ({ onClick }) =>
        e('button', {
            onClick,
            title: 'Calculadora de precios',
            style: {
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: '#dcfce7',
                color: '#16a34a',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
            }
        }, Icons.calculator('#16a34a')),

    // BOTONES DE CONFIGURACION Y HERRAMIENTAS ADMIN
    configuracion: ({ onClick }) =>
        e('button', {
            onClick,
            title: 'Configuración',
            style: {
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: '#f8fafc',
                color: '#64748b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
            }
        }, Icons.gear('#64748b')),

    // BOTONES AUXILIARES
    ayuda: ({ onClick }) =>
        e('button', {
            onClick,
            title: 'Ayuda',
            style: {
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: 'white',
                color: '#6b7280',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
            }
        }, Icons.help('#6b7280')),


    // Agregar estas funciones al final de tu BotonesUniversal.js, antes del export default

    secundario: ({
        onClick,
        texto = 'Acción',
        icono = null,
        loading = false,
        disabled = false,
        key
    }) => e('button', {
        key,
        onClick: disabled || loading ? undefined : onClick,
        disabled: disabled || loading,
        style: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            backgroundColor: loading ? '#f3f4f6' : '#ffffff',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            color: loading ? '#9ca3af' : '#374151',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: disabled || loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            opacity: disabled ? 0.6 : 1
        }
    }, [
        loading ? e('div', {
            key: 'spinner',
            style: {
                width: '16px',
                height: '16px',
                border: '2px solid #d1d5db',
                borderTop: '2px solid #374151',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
            }
        }) : icono,
        loading ? 'Procesando...' : texto
    ]),

    peligro: ({
        onClick,
        texto = 'Eliminar',
        icono = null,
        loading = false,
        disabled = false,
        key
    }) => e('button', {
        key,
        onClick: disabled || loading ? undefined : onClick,
        disabled: disabled || loading,
        style: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            backgroundColor: loading ? '#f3f4f6' : '#ef4444',
            border: 'none',
            borderRadius: '8px',
            color: loading ? '#9ca3af' : '#ffffff',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: disabled || loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            opacity: disabled ? 0.6 : 1
        }
    }, [
        loading ? e('div', {
            key: 'spinner',
            style: {
                width: '16px',
                height: '16px',
                border: '2px solid #ffffff40',
                borderTop: '2px solid #ffffff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
            }
        }) : icono,
        loading ? 'Procesando...' : texto
    ]),

    primario: ({
        onClick,
        texto = 'Guardar',
        icono = null,
        loading = false,
        disabled = false,
        key
    }) => e('button', {
        key,
        onClick: disabled || loading ? undefined : onClick,
        disabled: disabled || loading,
        style: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            backgroundColor: loading ? '#9ca3af' : '#3b82f6',
            border: 'none',
            borderRadius: '8px',
            color: '#ffffff',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: disabled || loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            opacity: disabled ? 0.6 : 1
        }
    }, [
        loading ? e('div', {
            key: 'spinner',
            style: {
                width: '16px',
                height: '16px',
                border: '2px solid #ffffff40',
                borderTop: '2px solid #ffffff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
            }
        }) : icono,
        loading ? 'Procesando...' : texto
    ])
};

export default BotonesUniversal;
