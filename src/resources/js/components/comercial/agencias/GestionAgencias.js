// src/resources/js/components/comercial/agencias/GestionAgencias.js
import React from 'react';
import Icons from '../../../utils/Icons';
import Notifications from '../../../utils/notifications';
import ModalUniversal from '../../common/ModalUniversal';
import BotonesUniversal from '../../common/BotonesUniversal';

// IMPORTAR EL NUEVO SISTEMA REUTILIZABLE
import useTableData from '../../common/useTableData';
import TableControls from '../../common/TableControls';
import TablePagination from '../../common/TablePagination';
import { agenciasConfig } from './agenciasConfig';

import apiHelper from '../../../utils/apiHelper';

const { createElement: e, useState, useEffect } = React;

function GestionAgencias() {
    // Estados principales
    const [agencias, setAgencias] = useState([]);
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
    const currentConfig = agenciasConfig.agencias;
    const currentRawData = agencias;

    const tableData = useTableData(currentConfig, currentRawData);

    // Efectos principales
    useEffect(() => {
        cargarDatos();
    }, []);

    // Función para cargar datos desde API
    const cargarDatos = async () => {
        try {
            setLoading(true);
            const response = await apiHelper.agencias.getAll();
            const data = await apiHelper.handleResponse(response);
            setAgencias(data);
            console.log('Agencias cargadas:', data.length, 'items');
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

        if (itemEditando && itemEditando.agencia_codigo) {
            campos.push({
                nombre: 'agencia_codigo',
                tipo: 'text',
                requerido: false,
                opciones: [],
                placeholder: 'Código de la agencia',
                soloLectura: true,
                ancho: 'completo'
            });
        }

        campos.push({
            nombre: 'agencia_razon_social',
            tipo: 'text',
            requerido: true,
            opciones: [],
            placeholder: 'Razón social de la agencia',
            soloLectura: false,
            ancho: 'completo'
        });

        campos.push({
            nombre: 'agencia_nit',
            tipo: 'text',
            requerido: false,
            opciones: [],
            placeholder: 'NIT de la agencia',
            soloLectura: false,
            ancho: 'medio'
        });

        campos.push({
            nombre: 'agencia_email',
            tipo: 'email',
            requerido: false,
            opciones: [],
            placeholder: 'Email de contacto',
            soloLectura: false,
            ancho: 'medio'
        });

        campos.push({
            nombre: 'agencia_telefono',
            tipo: 'number',
            requerido: false,
            opciones: [],
            placeholder: 'Teléfono de contacto',
            soloLectura: false,
            ancho: 'completo'
        });

        return campos;
    };

    // Renderizar item de lista
    const renderizarItem = (item) => {
        const camposImportantes = [
            { campo: 'agencia_codigo', label: 'Código' },
            { campo: 'agencia_razon_social', label: 'Razón Social' },
            { campo: 'agencia_nit', label: 'NIT' },
            { campo: 'agencia_email', label: 'Email' },
            { campo: 'agencia_telefono', label: 'Teléfono' }
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
            let contenidoFormateado = String(valor || 'N/A');

            // Formatear teléfono
            if (campo === 'agencia_telefono' && valor) {
                const phone = String(valor);
                if (phone.length === 8) {
                    contenidoFormateado = `${phone.slice(0, 4)}-${phone.slice(4)}`;
                }
            }

            return e('div', { key: campo }, [
                e('strong', { key: `label-${campo}` }, `${label}: `),
                contenidoFormateado
            ]);
        }));
    };

    // Funciones auxiliares
    const obtenerNombreItem = (item) => {
        return item.agencia_razon_social || item.agencia_codigo || `Agencia #${item.agencia_id || item.id}`;
    };

    const obtenerIdItem = (item) => {
        return item.agencia_id;
    };

    const obtenerEstadoItem = (item) => {
        return item.agencia_situacion;
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

        if (!formulario.agencia_razon_social?.trim()) {
            nuevosErrores.agencia_razon_social = 'La razón social es requerida';
        }

        if (formulario.agencia_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formulario.agencia_email)) {
            nuevosErrores.agencia_email = 'Email no válido';
        }

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const guardarItem = async () => {
        if (!validarFormulario()) return;

        setLoadingAction(true);
        try {
            const url = itemEditando
                ? `/api/magic/agencias/${obtenerIdItem(itemEditando)}`
                : '/api/magic/agencias';
            const method = itemEditando ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify(formulario)
            });

            if (response.ok) {
                Notifications.success(itemEditando ? 'Agencia actualizada exitosamente' : 'Agencia creada exitosamente');
                setModalFormulario(false);
                cargarDatos();
            } else {
                const errorData = await response.json();
                if (errorData.errors) {
                    setErrores(errorData.errors);
                } else {
                    Notifications.error(errorData.message || 'Error al guardar');
                }
            }
        } catch (error) {
            console.error('Error:', error);
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
        if (!itemConfirmacion || !accionConfirmacion) return;

        setLoadingAction(true);
        try {
            let response;
            const itemId = obtenerIdItem(itemConfirmacion);

            switch (accionConfirmacion) {
                case 'activar':
                    response = await fetch(`/api/magic/agencias/${itemId}/activate`, {
                        method: 'PATCH',
                        headers: {
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                        }
                    });
                    break;

                case 'desactivar':
                    response = await fetch(`/api/magic/agencias/${itemId}/deactivate`, {
                        method: 'PATCH',
                        headers: {
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                        }
                    });
                    break;

                case 'duplicar':
                    const itemDuplicado = { ...itemConfirmacion };
                    delete itemDuplicado.agencia_id;
                    itemDuplicado.agencia_codigo = itemDuplicado.agencia_codigo + '_COPIA';
                    itemDuplicado.agencia_razon_social = itemDuplicado.agencia_razon_social + ' (Copia)';

                    response = await fetch('/api/magic/agencias', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                        },
                        body: JSON.stringify(itemDuplicado)
                    });
                    break;

                default:
                    return;
            }

            if (response && response.ok) {
                const mensajes = {
                    activar: 'Agencia activada exitosamente',
                    desactivar: 'Agencia desactivada exitosamente',
                    duplicar: 'Agencia duplicada exitosamente'
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
                }, 'Gestión de Agencias'),
                e('p', {
                    key: 'subtitle',
                    style: {
                        color: '#6b7280',
                        margin: 0
                    }
                }, 'Administrar socios comerciales y agencias colaboradoras')
            ]),

            e('div', {
                key: 'header-actions',
                style: { display: 'flex', gap: '0.75rem', alignItems: 'center' }
            }, [
                BotonesUniversal.nuevo({
                    onClick: () => abrirModalFormulario(),
                    texto: 'Nueva Agencia',
                    icono: Icons.plus('#ffffff'),
                    loading: loadingAction,
                    key: 'btn-nuevo'
                })
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
                        }, 'No hay agencias disponibles'),
                        e('p', {
                            key: 'no-data-hint',
                            style: { fontSize: '0.875rem' }
                        }, 'Comienza creando tu primera agencia')
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
            tipoItem: 'agencia',
            campos: generarCamposFormulario(),
            esEdicion: !itemEditando
        }),

        ModalUniversal.confirmacion({
            abierto: modalConfirmacion,
            cerrar: () => setModalConfirmacion(false),
            ejecutar: ejecutarAccion,
            accion: accionConfirmacion,
            item: itemConfirmacion,
            tipoItem: 'agencia',
            loading: loadingAction,
            nombreItem: itemConfirmacion ? obtenerNombreItem(itemConfirmacion) : ''
        }),

        ModalUniversal.detalles({
            abierto: modalDetalles,
            cerrar: () => setModalDetalles(false),
            item: itemDetalles,
            tipoItem: 'agencia'
        })
    ]);
}

export default GestionAgencias;
