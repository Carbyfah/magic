// src/resources/js/components/common/templates/GestionDependientesSimples.js
import React from 'react';
import Icons from '../../../utils/Icons';
import Notifications from '../../../utils/notifications';
import ModalUniversal from '../ModalUniversal';
import BotonesUniversal from '../BotonesUniversal';

// IMPORTAR EL NUEVO SISTEMA REUTILIZABLE
import useTableData from '../useTableData';
import TableControls from '../TableControls';
import TablePagination from '../TablePagination';

const { createElement: e, useState, useEffect } = React;

function GestionDependientesSimples({ config }) {
    // Estados principales
    const [items, setItems] = useState([]);
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

    // Estados para datos relacionados (FK)
    const [datosRelacionados, setDatosRelacionados] = useState({});

    // INTEGRAR EL NUEVO SISTEMA REUTILIZABLE
    const currentConfig = config;
    const currentRawData = items || [];

    const tableData = useTableData(currentConfig, currentRawData);

    // Efectos principales
    useEffect(() => {
        cargarDatos();
        cargarDatosRelacionados();
    }, []);

    // FUNCIÓN PARA CARGAR DATOS RELACIONADOS (FK)
    async function cargarDatosRelacionados() {
        try {
            const relacionesPromises = [];

            // Identificar campos FK basándose en la configuración
            Object.entries(config.fields).forEach(([fieldName, fieldConfig]) => {
                if (fieldConfig.type === 'foreign_key') {
                    const endpoint = fieldConfig.endpoint || `/api/magic/${fieldConfig.relatedTable}`;
                    relacionesPromises.push(
                        fetch(endpoint, {
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json',
                                'X-Requested-With': 'XMLHttpRequest'
                            }
                        }).then(res => res.ok ? res.json() : []).then(data => ({
                            field: fieldName,
                            data: data
                        }))
                    );
                }
            });

            const resultados = await Promise.all(relacionesPromises);
            const relacionesData = {};

            resultados.forEach(({ field, data }) => {
                relacionesData[field] = data;
            });

            setDatosRelacionados(relacionesData);
        } catch (error) {
            console.error('Error cargando datos relacionados:', error);
        }
    }

    // Función para cargar datos principales desde API
    async function cargarDatos() {
        try {
            setLoading(true);
            const endpoint = `${config.apiEndpoint}/${config.tableName}`;
            const response = await fetch(endpoint, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setItems(data);
                console.log(`${config.displayName} cargados:`, data.length, 'items');
            } else {
                console.error(`Error al cargar ${config.displayName.toLowerCase()}:`, response.status);
                Notifications.error(`Error al cargar ${config.displayName.toLowerCase()}: ${response.status}`);
            }

        } catch (error) {
            console.error('Error de conexión:', error);
            Notifications.error('Error de conexión al cargar datos');
        } finally {
            setLoading(false);
        }
    }

    // Generar campos de formulario incluyendo FK
    function generarCamposFormulario() {
        const campos = [];

        Object.entries(config.fields).forEach(([fieldName, fieldConfig]) => {
            if (fieldName === config.primaryKey) return; // Omitir primary key
            if (fieldName.includes('_situacion')) return; // Omitir situación, se maneja separadamente

            let campo = {
                nombre: fieldName,
                tipo: fieldConfig.type === 'foreign_key' ? 'select' : fieldConfig.type,
                requerido: fieldConfig.required || false,
                opciones: [],
                placeholder: fieldConfig.placeholder || fieldConfig.label,
                soloLectura: fieldName.includes('_codigo') && itemEditando ? true : false,
                ancho: 'completo'
            };

            // Configurar opciones para campos FK
            if (fieldConfig.type === 'foreign_key') {
                const relacionData = datosRelacionados[fieldName] || [];
                campo.opciones = relacionData.map(item => ({
                    value: item[fieldConfig.relatedKey],
                    label: item[fieldConfig.displayField] || item[fieldConfig.relatedKey]
                }));
                campo.tipo = 'select';
            }

            campos.push(campo);
        });

        return campos;
    }

    // Renderizar item de lista con datos relacionados
    function renderizarItem(item) {
        const camposImportantes = config.displayFields || Object.keys(config.fields).slice(1, 4);

        return e('div', {
            style: {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                color: '#6b7280',
                fontSize: '0.875rem'
            }
        }, camposImportantes.map((fieldName) => {
            const fieldConfig = config.fields[fieldName];
            if (!fieldConfig) return null;

            let valor = item[fieldName];
            let contenidoFormateado;

            // Formatear campos FK mostrando el valor relacionado
            if (fieldConfig.type === 'foreign_key') {
                const relacionData = datosRelacionados[fieldName] || [];
                const itemRelacionado = relacionData.find(rel =>
                    rel[fieldConfig.relatedKey] === valor
                );
                contenidoFormateado = itemRelacionado
                    ? itemRelacionado[fieldConfig.displayField]
                    : `ID: ${valor}`;
            } else {
                contenidoFormateado = String(valor || 'N/A');
            }

            return e('div', { key: fieldName }, [
                e('strong', { key: `label-${fieldName}` }, `${fieldConfig.label}: `),
                contenidoFormateado
            ]);
        }));
    }

    // Funciones auxiliares
    function obtenerNombreItem(item) {
        const nameField = config.nameField || Object.keys(config.fields)[1];
        return item[nameField] || item[config.primaryKey] || `Item #${item[config.primaryKey]}`;
    }

    function obtenerIdItem(item) {
        return item[config.primaryKey];
    }

    function obtenerEstadoItem(item) {
        const statusField = config.statusField || `${config.tableName}_situacion`;
        return item[statusField];
    }

    // Funciones de gestión de modales
    function abrirModalFormulario(item = null) {
        setItemEditando(item);
        if (item) {
            setFormulario({ ...item });
        } else {
            setFormulario({});
        }
        setErrores({});
        setModalFormulario(true);
    }

    function manejarCambioFormulario(campo, valor) {
        setFormulario(prev => ({ ...prev, [campo]: valor }));
        if (errores[campo]) {
            setErrores(prev => ({ ...prev, [campo]: '' }));
        }
    }

    // Validación del formulario
    function validarFormulario() {
        const nuevosErrores = {};

        Object.entries(config.fields).forEach(([fieldName, fieldConfig]) => {
            if (fieldConfig.required && !formulario[fieldName]) {
                nuevosErrores[fieldName] = `${fieldConfig.label} es requerido`;
            }
        });

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    }

    async function guardarItem() {
        if (!validarFormulario()) return;

        setLoadingAction(true);
        try {
            const endpoint = `${config.apiEndpoint}/${config.tableName}`;
            const url = itemEditando
                ? `${endpoint}/${obtenerIdItem(itemEditando)}`
                : endpoint;
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
                Notifications.success(
                    itemEditando
                        ? `${config.displayName.slice(0, -1)} actualizado exitosamente`
                        : `${config.displayName.slice(0, -1)} creado exitosamente`
                );
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
    }

    function abrirModalConfirmacion(item, accion) {
        setItemConfirmacion(item);
        setAccionConfirmacion(accion);
        setModalConfirmacion(true);
    }

    async function ejecutarAccion() {
        if (!itemConfirmacion || !accionConfirmacion) return;

        setLoadingAction(true);
        try {
            let response;
            const itemId = obtenerIdItem(itemConfirmacion);
            const endpoint = `${config.apiEndpoint}/${config.tableName}`;

            switch (accionConfirmacion) {
                case 'activar':
                    response = await fetch(`${endpoint}/${itemId}/activate`, {
                        method: 'PATCH',
                        headers: {
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                        }
                    });
                    break;

                case 'desactivar':
                    response = await fetch(`${endpoint}/${itemId}/deactivate`, {
                        method: 'PATCH',
                        headers: {
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                        }
                    });
                    break;

                case 'duplicar':
                    const itemDuplicado = { ...itemConfirmacion };
                    delete itemDuplicado[config.primaryKey];

                    // Modificar código si existe
                    const codigoField = Object.keys(config.fields).find(field => field.includes('_codigo'));
                    if (codigoField && itemDuplicado[codigoField]) {
                        itemDuplicado[codigoField] = itemDuplicado[codigoField] + '_COPIA';
                    }

                    response = await fetch(endpoint, {
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
                    activar: `${config.displayName.slice(0, -1)} activado exitosamente`,
                    desactivar: `${config.displayName.slice(0, -1)} desactivado exitosamente`,
                    duplicar: `${config.displayName.slice(0, -1)} duplicado exitosamente`
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
    }

    function abrirModalDetalles(item) {
        setItemDetalles(item);
        setModalDetalles(true);
    }

    // USAR DATOS DEL NUEVO SISTEMA REUTILIZABLE
    const datosActuales = tableData.data;

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
                }, `Gestión de ${config.displayName}`),
                e('p', {
                    key: 'subtitle',
                    style: {
                        color: '#6b7280',
                        margin: 0
                    }
                }, `Administrar ${config.displayName.toLowerCase()} del sistema`)
            ]),

            e('div', {
                key: 'header-actions',
                style: { display: 'flex', gap: '0.75rem', alignItems: 'center' }
            }, [
                BotonesUniversal.nuevo({
                    onClick: () => abrirModalFormulario(),
                    texto: `Nuevo ${config.displayName.slice(0, -1)}`,
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
                        }, `No hay ${config.displayName.toLowerCase()} disponibles`),
                        e('p', {
                            key: 'no-data-hint',
                            style: { fontSize: '0.875rem' }
                        }, `Comienza creando tu primer ${config.displayName.slice(0, -1).toLowerCase()}`)
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
            tipoItem: config.displayName.slice(0, -1).toLowerCase(),
            campos: generarCamposFormulario(),
            esEdicion: !!itemEditando,
            key: 'modal-formulario'
        }),

        ModalUniversal.confirmacion({
            abierto: modalConfirmacion,
            cerrar: () => setModalConfirmacion(false),
            ejecutar: ejecutarAccion,
            accion: accionConfirmacion,
            item: itemConfirmacion,
            tipoItem: config.displayName.slice(0, -1).toLowerCase(),
            loading: loadingAction,
            nombreItem: itemConfirmacion ? obtenerNombreItem(itemConfirmacion) : '',
            key: 'modal-confirmacion'
        }),

        ModalUniversal.detalles({
            abierto: modalDetalles,
            cerrar: () => setModalDetalles(false),
            item: itemDetalles,
            tipoItem: config.displayName.slice(0, -1).toLowerCase(),
            key: 'modal-detalles'
        })
    ]);
}

export default GestionDependientesSimples;
