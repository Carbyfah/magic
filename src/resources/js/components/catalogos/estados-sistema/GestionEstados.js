// src/resources/js/components/catalogos/estados-sistema/GestionEstados.js
import React from 'react';
import Icons from '../../../utils/Icons';
import Notifications from '../../../utils/notifications';
import ModalUniversal from '../../common/ModalUniversal';
import BotonesUniversal from '../../common/BotonesUniversal';

// IMPORTAR EL NUEVO SISTEMA REUTILIZABLE
import useTableData from '../../common/useTableData';
import TableControls from '../../common/TableControls';
import TablePagination from '../../common/TablePagination';
import { estadosConfig } from './estadosConfig';
import apiHelper from '../../../utils/apiHelper';

const { createElement: e, useState, useEffect } = React;

function GestionEstados() {
    // Estados principales
    const [estados, setEstados] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingAction, setLoadingAction] = useState(false);

    // Estados de modales
    const [modalFormulario, setModalFormulario] = useState(false);
    const [modalConfirmacion, setModalConfirmacion] = useState(false);
    const [modalDetalles, setModalDetalles] = useState(false);

    // Estados de datos específicos
    const [itemEditando, setItemEditando] = useState(null);
    const [itemConfirmacion, setItemConfirmacion] = useState(null);
    const [accionConfirmacion, setAccionConfirmacion] = useState(null);
    const [itemDetalles, setItemDetalles] = useState(null);

    // Estados del formulario
    const [formulario, setFormulario] = useState({});
    const [errores, setErrores] = useState({});

    // INTEGRAR EL NUEVO SISTEMA REUTILIZABLE
    const currentConfig = estadosConfig.estados;
    const currentRawData = estados;

    const tableData = useTableData(currentConfig, currentRawData);

    // Efectos principales
    useEffect(() => {
        cargarDatos();
    }, []);

    // Función para cargar datos desde API
    const cargarDatos = async () => {
        try {
            setLoading(true);
            const response = await apiHelper.estados.getAll();
            const data = await apiHelper.handleResponse(response);
            setEstados(data);
            console.log('Estados cargados:', data.length, 'items');
        } catch (error) {
            console.error('Error de conexión:', error);
            Notifications.error('Error de conexión al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    // Generar campos de formulario
    const generarCamposFormulario = () => {
        const campos = [];

        // Solo mostrar contexto al crear (no al editar)
        if (!itemEditando) {
            campos.push({
                nombre: 'contexto',
                tipo: 'select',
                requerido: true,
                opciones: [
                    { value: 'vehiculo', label: 'Estados para Vehículos' },
                    { value: 'ruta-activada', label: 'Estados para Rutas Activadas' },
                    { value: 'tour-activado', label: 'Estados para Tours Activados' },
                    { value: 'reserva', label: 'Estados para Reservas' }

                ],
                placeholder: 'Seleccione para qué módulo será este estado',
                soloLectura: false,
                ancho: 'completo',
                label: 'Contexto del Estado'
            });
        }

        if (itemEditando && itemEditando.estado_codigo) {
            campos.push({
                nombre: 'estado_codigo',
                tipo: 'text',
                requerido: false,
                opciones: [],
                placeholder: 'Código del estado',
                soloLectura: true,
                ancho: 'completo'
            });
        }

        campos.push({
            nombre: 'estado_estado',
            tipo: 'text',
            requerido: true,
            opciones: [],
            placeholder: 'Nombre del estado',
            soloLectura: false,
            ancho: 'completo'
        });

        campos.push({
            nombre: 'estado_descripcion',
            tipo: 'text',
            requerido: false,
            opciones: [],
            placeholder: 'Descripción del estado',
            soloLectura: false,
            ancho: 'completo'
        });

        return campos;
    };

    // Renderizar item de lista
    const renderizarItem = (item) => {
        const camposImportantes = [
            { campo: 'estado_codigo', label: 'Código' },
            { campo: 'estado_estado', label: 'Estado' },
            { campo: 'estado_descripcion', label: 'Descripción' }
        ];

        return e('div', {
            style: {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                color: '#6b7280',
                fontSize: '0.875rem'
            }
        }, camposImportantes.map(({ campo, label }) => {
            const valor = item[campo];
            const contenidoFormateado = String(valor || 'N/A');

            return e('div', { key: campo }, [
                e('strong', { key: `label-${campo}` }, `${label}: `),
                contenidoFormateado
            ]);
        }));
    };

    // Funciones auxiliares
    const obtenerNombreItem = (item) => {
        return item.estado_estado || item.estado_codigo || `Estado #${item.estado_id || item.id}`;
    };

    const obtenerIdItem = (item) => {
        return item.estado_id;
    };

    const obtenerEstadoItem = (item) => {
        return item.estado_situacion;
    };

    // Funciones de gestión de modales
    const abrirModalFormulario = (item = null) => {
        setItemEditando(item);
        if (item) {
            setFormulario({ ...item });
        } else {
            setFormulario({});
        }
        setErrores({});
        setModalFormulario(true);
    };

    const manejarCambioFormulario = (campo, valor) => {
        setFormulario(prev => ({ ...prev, [campo]: valor }));
        if (errores[campo]) {
            setErrores(prev => ({ ...prev, [campo]: '' }));
        }
    };

    // Validación del formulario
    const validarFormulario = () => {
        const nuevosErrores = {};

        if (!formulario.estado_estado?.trim()) {
            nuevosErrores.estado_estado = 'El nombre del estado es requerido';
        }

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const guardarItem = async () => {
        if (!validarFormulario()) return;

        try {
            setLoadingAction(true);

            const response = itemEditando
                ? await apiHelper.put(`/estados/${obtenerIdItem(itemEditando)}`, formulario)
                : await apiHelper.post('/estados', formulario);

            const data = await apiHelper.handleResponse(response);

            if (response.ok) {
                Notifications.success(
                    `Estado ${itemEditando ? 'actualizado' : 'creado'} exitosamente`
                );
                setModalFormulario(false);
                cargarDatos();
            } else {
                const errorData = await response.json();
                if (errorData.errors) {
                    setErrores(errorData.errors);
                    Notifications.error('Por favor corrige los errores en el formulario');
                } else {
                    Notifications.error(`Error al guardar: ${response.status}`);
                }
            }
        } catch (error) {
            console.error('Error de conexión:', error);
            Notifications.error('Error de conexión');
        } finally {
            setLoadingAction(false);
        }
    };

    const abrirModalConfirmacion = (item, accion) => {
        setItemConfirmacion(item);
        setAccionConfirmacion(accion);
        setModalConfirmacion(true);
    };

    const ejecutarAccion = async () => {
        if (!itemConfirmacion) return;

        try {
            setLoadingAction(true);
            const itemId = obtenerIdItem(itemConfirmacion);

            let response;

            switch (accionConfirmacion) {
                case 'activar':
                    response = await apiHelper.patch(`/estados/${itemId}/activate`);
                    break;

                case 'desactivar':
                    response = await apiHelper.patch(`/estados/${itemId}/deactivate`);
                    break;

                case 'duplicar':
                    const itemDuplicado = { ...itemConfirmacion };
                    delete itemDuplicado.estado_id;
                    itemDuplicado.estado_codigo = itemDuplicado.estado_codigo + '_COPIA';
                    itemDuplicado.estado_estado = itemDuplicado.estado_estado + ' (Copia)';

                    response = await apiHelper.post('/estados', itemDuplicado);
                    break;

                default:
                    return;
            }

            if (response && response.ok) {
                const mensajes = {
                    activar: 'Estado activado exitosamente',
                    desactivar: 'Estado desactivado exitosamente',
                    duplicar: 'Estado duplicado exitosamente'
                };

                Notifications.success(mensajes[accionConfirmacion]);
                setModalConfirmacion(false);
                cargarDatos();
            } else {
                const errorData = await response.json();
                Notifications.error(`Error al ${accionConfirmacion}: ${errorData.message || 'Error desconocido'}`);
            }
        } catch (error) {
            console.error('Error:', error);
            Notifications.error('Error de conexión');
        } finally {
            setLoadingAction(false);
        }
    };

    const abrirModalDetalles = (item) => {
        setItemDetalles(item);
        setModalDetalles(true);
    };

    // USAR DATOS DEL NUEVO SISTEMA REUTILIZABLE
    const datosActuales = tableData.data;
    const totalDatos = currentRawData.length;

    return e('div', {
        style: { padding: '1.5rem', maxWidth: '100%', minHeight: '100vh' }
    }, [
        // Header
        e('div', {
            key: 'header',
            style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem',
                flexWrap: 'wrap',
                gap: '1rem'
            }
        }, [
            e('div', { key: 'title-section' }, [
                e('h1', {
                    key: 'title',
                    style: {
                        fontSize: '2rem',
                        fontWeight: '700',
                        color: '#111827',
                        margin: '0 0 0.5rem 0'
                    }
                }, 'Gestión de Estados'),
                e('p', {
                    key: 'subtitle',
                    style: {
                        color: '#6b7280',
                        margin: 0
                    }
                }, 'Administrar estados del sistema')
            ]),

            e('div', {
                key: 'header-actions',
                style: { display: 'flex', gap: '0.75rem', alignItems: 'center' }
            }, [
                BotonesUniversal.nuevo({
                    onClick: () => abrirModalFormulario(),
                    texto: 'Nuevo Estado',
                    icono: Icons.plus('#ffffff'),
                    loading: loadingAction,
                    key: 'btn-nuevo'
                })
            ])
        ]),

        // NUEVO: Panel informativo con estados requeridos
        e('div', {
            key: 'panel-informativo',
            style: {
                backgroundColor: '#f0f9ff',
                border: '1px solid #bae6fd',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '2rem'
            }
        }, [
            e('div', {
                style: {
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem'
                }
            }, [
                Icons.info('#0369a1'),
                e('div', {
                    style: { flex: 1 }
                }, [
                    e('h3', {
                        style: {
                            fontSize: '1.125rem',
                            fontWeight: '600',
                            color: '#0369a1',
                            margin: '0 0 1rem 0'
                        }
                    }, 'Estados Requeridos para el Sistema Magic Travel'),

                    e('div', {
                        style: {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                            gap: '1.5rem'
                        }
                    }, [
                        // VEHÍCULOS
                        e('div', {
                            key: 'vehiculos-section',
                            style: {
                                padding: '1rem',
                                backgroundColor: 'white',
                                borderRadius: '8px',
                                border: '1px solid #e5e7eb'
                            }
                        }, [
                            e('h4', {
                                style: {
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    color: '#16a34a',
                                    margin: '0 0 0.75rem 0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }
                            }, [
                                Icons.truck('#16a34a'),
                                'Estados para Vehículos'
                            ]),
                            e('div', {
                                style: { display: 'flex', flexDirection: 'column', gap: '0.5rem' }
                            }, [
                                e('div', {
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        fontSize: '0.875rem',
                                        color: '#374151'
                                    }
                                }, [
                                    e('span', {
                                        style: {
                                            width: '6px',
                                            height: '6px',
                                            backgroundColor: '#22c55e',
                                            borderRadius: '50%'
                                        }
                                    }),
                                    e('strong', {}, 'Disponible'),
                                    e('span', { style: { color: '#6b7280' } }, '- Puede asignarse a rutas')
                                ]),
                                e('div', {
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        fontSize: '0.875rem',
                                        color: '#374151'
                                    }
                                }, [
                                    e('span', {
                                        style: {
                                            width: '6px',
                                            height: '6px',
                                            backgroundColor: '#f59e0b',
                                            borderRadius: '50%'
                                        }
                                    }),
                                    e('strong', {}, 'Mantenimiento'),
                                    e('span', { style: { color: '#6b7280' } }, '- En taller o reparación')
                                ]),
                                e('div', {
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        fontSize: '0.875rem',
                                        color: '#374151'
                                    }
                                }, [
                                    e('span', {
                                        style: {
                                            width: '6px',
                                            height: '6px',
                                            backgroundColor: '#3b82f6',
                                            borderRadius: '50%'
                                        }
                                    }),
                                    e('strong', {}, 'Asignado'),
                                    e('span', { style: { color: '#6b7280' } }, '- En ruta activa')
                                ])
                            ])
                        ]),

                        // RUTAS ACTIVADAS
                        e('div', {
                            key: 'rutas-section',
                            style: {
                                padding: '1rem',
                                backgroundColor: 'white',
                                borderRadius: '8px',
                                border: '1px solid #e5e7eb'
                            }
                        }, [
                            e('h4', {
                                style: {
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    color: '#8b5cf6',
                                    margin: '0 0 0.75rem 0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }
                            }, [
                                Icons.mapPin('#8b5cf6'),
                                'Estados para Rutas Activadas'
                            ]),
                            e('div', {
                                style: { display: 'flex', flexDirection: 'column', gap: '0.5rem' }
                            }, [
                                e('div', {
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        fontSize: '0.875rem',
                                        color: '#374151'
                                    }
                                }, [
                                    e('span', {
                                        style: {
                                            width: '6px',
                                            height: '6px',
                                            backgroundColor: '#3b82f6',
                                            borderRadius: '50%'
                                        }
                                    }),
                                    e('strong', {}, 'Activada'),
                                    e('span', { style: { color: '#6b7280' } }, '- Puede recibir reservas')
                                ]),
                                e('div', {
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        fontSize: '0.875rem',
                                        color: '#374151'
                                    }
                                }, [
                                    e('span', {
                                        style: {
                                            width: '6px',
                                            height: '6px',
                                            backgroundColor: '#f59e0b',
                                            borderRadius: '50%'
                                        }
                                    }),
                                    e('strong', {}, 'Llena'),
                                    e('span', { style: { color: '#6b7280' } }, '- Capacidad completa')
                                ]),
                                e('div', {
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        fontSize: '0.875rem',
                                        color: '#374151'
                                    }
                                }, [
                                    e('span', {
                                        style: {
                                            width: '6px',
                                            height: '6px',
                                            backgroundColor: '#22c55e',
                                            borderRadius: '50%'
                                        }
                                    }),
                                    e('strong', {}, 'Ejecución'),
                                    e('span', { style: { color: '#6b7280' } }, '- En viaje')
                                ]),
                                e('div', {
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        fontSize: '0.875rem',
                                        color: '#374151'
                                    }
                                }, [
                                    e('span', {
                                        style: {
                                            width: '6px',
                                            height: '6px',
                                            backgroundColor: '#6b7280',
                                            borderRadius: '50%'
                                        }
                                    }),
                                    e('strong', {}, 'Cerrada'),
                                    e('span', { style: { color: '#6b7280' } }, '- Completada')
                                ])
                            ])
                        ]),

                        // TOURS ACTIVADOS - Agregar después de la sección de rutas
                        e('div', {
                            key: 'tours-section',
                            style: {
                                padding: '1rem',
                                backgroundColor: 'white',
                                borderRadius: '8px',
                                border: '1px solid #e5e7eb'
                            }
                        }, [
                            e('h4', {
                                style: {
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    color: '#10b981',
                                    margin: '0 0 0.75rem 0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }
                            }, [
                                Icons.mapPin('#10b981'),
                                'Estados para Tours Activados'
                            ]),
                            e('div', {
                                style: { display: 'flex', flexDirection: 'column', gap: '0.5rem' }
                            }, [
                                e('div', {
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        fontSize: '0.875rem',
                                        color: '#374151'
                                    }
                                }, [
                                    e('span', {
                                        style: {
                                            width: '6px',
                                            height: '6px',
                                            backgroundColor: '#3b82f6',
                                            borderRadius: '50%'
                                        }
                                    }),
                                    e('strong', {}, 'Activado'),
                                    e('span', { style: { color: '#6b7280' } }, '- Puede recibir reservas')
                                ]),
                                e('div', {
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        fontSize: '0.875rem',
                                        color: '#374151'
                                    }
                                }, [
                                    e('span', {
                                        style: {
                                            width: '6px',
                                            height: '6px',
                                            backgroundColor: '#22c55e',
                                            borderRadius: '50%'
                                        }
                                    }),
                                    e('strong', {}, 'En Ejecución'),
                                    e('span', { style: { color: '#6b7280' } }, '- Tour en progreso')
                                ]),
                                e('div', {
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        fontSize: '0.875rem',
                                        color: '#374151'
                                    }
                                }, [
                                    e('span', {
                                        style: {
                                            width: '6px',
                                            height: '6px',
                                            backgroundColor: '#6b7280',
                                            borderRadius: '50%'
                                        }
                                    }),
                                    e('strong', {}, 'Cerrado'),
                                    e('span', { style: { color: '#6b7280' } }, '- Tour completado')
                                ])
                            ])
                        ]),

                        // RESERVAS
                        e('div', {
                            key: 'reservas-section',
                            style: {
                                padding: '1rem',
                                backgroundColor: 'white',
                                borderRadius: '8px',
                                border: '1px solid #e5e7eb'
                            }
                        }, [
                            e('h4', {
                                style: {
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    color: '#dc2626',
                                    margin: '0 0 0.75rem 0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }
                            }, [
                                Icons.calendar('#dc2626'),
                                'Estados para Reservas'
                            ]),
                            e('div', {
                                style: { display: 'flex', flexDirection: 'column', gap: '0.5rem' }
                            }, [
                                e('div', {
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        fontSize: '0.875rem',
                                        color: '#374151'
                                    }
                                }, [
                                    e('span', {
                                        style: {
                                            width: '6px',
                                            height: '6px',
                                            backgroundColor: '#f59e0b',
                                            borderRadius: '50%'
                                        }
                                    }),
                                    e('strong', {}, 'Pendiente'),
                                    e('span', { style: { color: '#6b7280' } }, '- Esperando confirmación')
                                ]),
                                e('div', {
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        fontSize: '0.875rem',
                                        color: '#374151'
                                    }
                                }, [
                                    e('span', {
                                        style: {
                                            width: '6px',
                                            height: '6px',
                                            backgroundColor: '#22c55e',
                                            borderRadius: '50%'
                                        }
                                    }),
                                    e('strong', {}, 'Confirmada'),
                                    e('span', { style: { color: '#6b7280' } }, '- Listo para facturar')
                                ]),
                                e('div', {
                                    style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        fontSize: '0.875rem',
                                        color: '#374151'
                                    }
                                }, [
                                    e('span', {
                                        style: {
                                            width: '6px',
                                            height: '6px',
                                            backgroundColor: '#dc2626',
                                            borderRadius: '50%'
                                        }
                                    }),
                                    e('strong', {}, 'Cancelada'),
                                    e('span', { style: { color: '#6b7280' } }, '- No se puede modificar')
                                ])
                            ])
                        ])
                    ]),

                    e('div', {
                        style: {
                            marginTop: '1rem',
                            padding: '0.75rem',
                            backgroundColor: '#fef3c7',
                            borderRadius: '6px',
                            border: '1px solid #f59e0b'
                        }
                    }, [
                        e('p', {
                            style: {
                                margin: '0',
                                fontSize: '0.875rem',
                                color: '#92400e'
                            }
                        }, [
                            e('strong', {}, 'Importante: '),
                            'Al crear estados, selecciona el contexto correcto (Vehículos, Rutas, Tours o Reservas). Los nombres deben coincidir exactamente con los mostrados arriba para que el sistema funcione correctamente.'
                        ])
                    ])
                ])
            ])
        ]),

        // USAR EL NUEVO COMPONENTE DE CONTROLES
        e(TableControls, {
            key: 'table-controls',
            config: currentConfig,
            filters: tableData.filters,
            statistics: tableData.statistics,
            actions: tableData.actions,
            loading: loading,
            onRefresh: cargarDatos,
            showStatistics: true
        }),

        // Lista principal
        e('div', {
            key: 'lista-principal',
            style: {
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                overflow: 'hidden'
            }
        }, [
            loading ? e('div', {
                key: 'loading',
                style: { padding: '3rem', textAlign: 'center' }
            }, 'Cargando...') :
                datosActuales.length > 0 ?
                    datosActuales.map((item, index) => {
                        const itemId = obtenerIdItem(item) || index;
                        const esActivo = obtenerEstadoItem(item) === true || obtenerEstadoItem(item) === 1;

                        return e('div', {
                            key: `item-${itemId}`,
                            style: {
                                padding: '1.5rem',
                                borderBottom: index < datosActuales.length - 1 ? '1px solid #f3f4f6' : 'none',
                                transition: 'background-color 0.2s ease'
                            },
                            onMouseEnter: (e) => e.currentTarget.style.backgroundColor = '#f9fafb',
                            onMouseLeave: (e) => e.currentTarget.style.backgroundColor = 'transparent'
                        }, [
                            e('div', {
                                key: `item-content-${itemId}`,
                                style: {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    gap: '1.5rem'
                                }
                            }, [
                                // Información del item
                                e('div', {
                                    key: `item-info-${itemId}`,
                                    style: { flex: '1' }
                                }, [
                                    // Estado visual
                                    e('div', {
                                        key: `item-status-${itemId}`,
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            marginBottom: '1rem'
                                        }
                                    }, [
                                        e('div', {
                                            key: `status-indicator-${itemId}`,
                                            style: {
                                                width: '8px',
                                                height: '8px',
                                                borderRadius: '50%',
                                                backgroundColor: esActivo ? '#22c55e' : '#ef4444'
                                            }
                                        }),
                                        BotonesUniversal.badge({
                                            texto: esActivo ? 'Activo' : 'Inactivo',
                                            color: esActivo ? 'verde' : 'rojo'
                                        })
                                    ]),

                                    // Campos del item
                                    renderizarItem(item)
                                ]),

                                // Acciones
                                e('div', {
                                    key: `item-actions-${itemId}`,
                                    style: {
                                        display: 'flex',
                                        gap: '0.5rem',
                                        flexShrink: 0
                                    }
                                }, [
                                    BotonesUniversal.ver({ onClick: () => abrirModalDetalles(item) }),
                                    BotonesUniversal.editar({ onClick: () => abrirModalFormulario(item) }),
                                    BotonesUniversal.duplicar({ onClick: () => abrirModalConfirmacion(item, 'duplicar') }),
                                    BotonesUniversal.toggleEstado({
                                        activo: esActivo,
                                        onClick: () => abrirModalConfirmacion(item, esActivo ? 'desactivar' : 'activar')
                                    })
                                ])
                            ])
                        ]);
                    }) :
                    e('div', {
                        key: 'no-data',
                        style: {
                            padding: '4rem',
                            textAlign: 'center',
                            color: '#9ca3af'
                        }
                    }, [
                        e('p', {
                            key: 'no-data-text',
                            style: { fontSize: '1.125rem', marginBottom: '0.5rem' }
                        }, 'No hay estados disponibles'),
                        e('p', {
                            key: 'no-data-hint',
                            style: { fontSize: '0.875rem' }
                        }, 'Comienza creando tu primer estado')
                    ])
        ]),

        // USAR EL NUEVO COMPONENTE DE PAGINACIÓN
        e(TablePagination, {
            key: 'table-pagination',
            pagination: tableData.pagination,
            actions: tableData.actions,
            showItemsPerPage: true,
            showInfo: true,
            compact: false
        }),

        // Modales usando ModalUniversal
        ModalUniversal.formulario({
            abierto: modalFormulario,
            cerrar: () => setModalFormulario(false),
            guardar: guardarItem,
            formulario: formulario,
            cambiarCampo: manejarCambioFormulario,
            errores: errores,
            loading: loadingAction,
            tipoItem: 'estado',
            campos: generarCamposFormulario(),
            esEdicion: !itemEditando
        }),

        ModalUniversal.confirmacion({
            abierto: modalConfirmacion,
            cerrar: () => setModalConfirmacion(false),
            ejecutar: ejecutarAccion,
            accion: accionConfirmacion,
            item: itemConfirmacion,
            tipoItem: 'estado',
            loading: loadingAction,
            nombreItem: itemConfirmacion ? obtenerNombreItem(itemConfirmacion) : ''
        }),

        ModalUniversal.detalles({
            abierto: modalDetalles,
            cerrar: () => setModalDetalles(false),
            item: itemDetalles,
            tipoItem: 'estado'
        })
    ]);
}

export default GestionEstados;
