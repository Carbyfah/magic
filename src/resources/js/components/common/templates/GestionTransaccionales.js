// src/resources/js/components/common/templates/GestionTransaccionales.js
import React from 'react';
import Icons from '../../../utils/Icons';
import Notifications from '../../../utils/notifications';
import ModalUniversal from '../ModalUniversal';
import BotonesUniversal from '../BotonesUniversal';

// IMPORTAR EL NUEVO SISTEMA REUTILIZABLE
import useTableData from '../useTableData';
import TableControls from '../TableControls';
import TablePagination from '../TablePagination';

const { createElement: e, useState, useEffect, useMemo } = React;

function GestionTransaccionales({ config }) {
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

    // Estados del formulario (para formularios complejos)
    const [formulario, setFormulario] = useState({});
    const [errores, setErrores] = useState({});
    const [pasoFormulario, setPasoFormulario] = useState(1);

    // Estados para datos relacionados (múltiples FK)
    const [datosRelacionados, setDatosRelacionados] = useState({});
    const [dependenciasActivas, setDependenciasActivas] = useState({});

    // INTEGRAR EL NUEVO SISTEMA REUTILIZABLE
    const currentConfig = config;
    const currentRawData = items || [];

    const tableData = useTableData(currentConfig, currentRawData);

    // Efectos principales
    useEffect(() => {
        cargarDatos();
        cargarDatosRelacionados();
    }, []);

    // Efecto para manejar dependencias entre campos FK
    useEffect(() => {
        if (config.fieldDependencies && formulario) {
            actualizarDependencias();
        }
    }, [formulario]);

    // FUNCIÓN PARA CARGAR DATOS RELACIONADOS (MÚLTIPLES FK)
    async function cargarDatosRelacionados() {
        try {
            setLoading(true);
            const relacionesPromises = [];

            // Identificar todos los campos FK
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
                            data: data,
                            config: fieldConfig
                        }))
                    );
                }
            });

            const resultados = await Promise.all(relacionesPromises);
            const relacionesData = {};

            resultados.forEach(({ field, data, config: fieldConfig }) => {
                relacionesData[field] = {
                    data: data,
                    config: fieldConfig
                };
            });

            setDatosRelacionados(relacionesData);
        } catch (error) {
            console.error('Error cargando datos relacionados:', error);
            Notifications.error('Error al cargar datos relacionados');
        }
    }

    // FUNCIÓN PARA MANEJAR DEPENDENCIAS ENTRE CAMPOS
    function actualizarDependencias() {
        if (!config.fieldDependencies) return;

        const nuevasDependencias = {};

        Object.entries(config.fieldDependencies).forEach(([campoDestino, configuracion]) => {
            const { dependsOn, filter } = configuracion;
            const valorDependiente = formulario[dependsOn];

            if (valorDependiente && datosRelacionados[campoDestino]) {
                const datosFiltrados = datosRelacionados[campoDestino].data.filter(item => {
                    if (typeof filter === 'function') {
                        return filter(item, valorDependiente, formulario);
                    } else {
                        return item[filter.field] === valorDependiente;
                    }
                });

                nuevasDependencias[campoDestino] = datosFiltrados;
            } else {
                nuevasDependencias[campoDestino] = datosRelacionados[campoDestino]?.data || [];
            }
        });

        setDependenciasActivas(nuevasDependencias);
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

    // Generar campos de formulario por pasos (wizard)
    function generarCamposFormulario() {
        if (!config.formSteps) {
            // Formulario simple si no hay pasos definidos
            return generarCamposSimples();
        }

        const pasoActual = config.formSteps[pasoFormulario - 1];
        if (!pasoActual) return [];

        return pasoActual.fields.map(fieldName => {
            const fieldConfig = config.fields[fieldName];
            if (!fieldConfig) return null;

            let campo = {
                nombre: fieldName,
                tipo: fieldConfig.type === 'foreign_key' ? 'select' : fieldConfig.type,
                requerido: fieldConfig.required || false,
                opciones: [],
                placeholder: fieldConfig.placeholder || fieldConfig.label,
                soloLectura: fieldName.includes('_codigo') && itemEditando ? true : false,
                ancho: fieldConfig.width || 'completo',
                grupo: pasoActual.title
            };

            // Configurar opciones para campos FK con dependencias
            if (fieldConfig.type === 'foreign_key') {
                let opcionesData = [];

                if (dependenciasActivas[fieldName]) {
                    opcionesData = dependenciasActivas[fieldName];
                } else if (datosRelacionados[fieldName]) {
                    opcionesData = datosRelacionados[fieldName].data;
                }

                campo.opciones = opcionesData.map(item => ({
                    value: item[fieldConfig.relatedKey],
                    label: item[fieldConfig.displayField] || item[fieldConfig.relatedKey],
                    data: item // Para acceso a datos completos si es necesario
                }));
                campo.tipo = 'select';
            }

            return campo;
        }).filter(Boolean);
    }

    // Generar campos simples (fallback)
    function generarCamposSimples() {
        const campos = [];

        Object.entries(config.fields).forEach(([fieldName, fieldConfig]) => {
            if (fieldName === config.primaryKey) return;
            if (fieldName.includes('_situacion')) return;

            let campo = {
                nombre: fieldName,
                tipo: fieldConfig.type === 'foreign_key' ? 'select' : fieldConfig.type,
                requerido: fieldConfig.required || false,
                opciones: [],
                placeholder: fieldConfig.placeholder || fieldConfig.label,
                soloLectura: fieldName.includes('_codigo') && itemEditando ? true : false,
                ancho: 'completo'
            };

            if (fieldConfig.type === 'foreign_key') {
                const relacionData = datosRelacionados[fieldName]?.data || [];
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

    // Renderizar item de lista con información enriquecida
    function renderizarItem(item) {
        const camposImportantes = config.displayFields || Object.keys(config.fields).slice(1, 4);

        return e('div', {
            style: {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
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
                const relacionData = datosRelacionados[fieldName]?.data || [];
                const itemRelacionado = relacionData.find(rel =>
                    rel[fieldConfig.relatedKey] === valor
                );
                contenidoFormateado = itemRelacionado
                    ? itemRelacionado[fieldConfig.displayField]
                    : `ID: ${valor}`;
            } else if (fieldConfig.type === 'money') {
                contenidoFormateado = formatearMonto(valor);
            } else if (fieldConfig.type === 'date' || fieldConfig.type === 'datetime') {
                contenidoFormateado = formatearFecha(valor);
            } else {
                contenidoFormateado = String(valor || 'N/A');
            }

            return e('div', { key: fieldName }, [
                e('strong', { key: `label-${fieldName}` }, `${fieldConfig.label}: `),
                contenidoFormateado
            ]);
        }));
    }

    // Funciones de formato
    function formatearMonto(monto) {
        return new Intl.NumberFormat('es-GT', {
            style: 'currency',
            currency: 'GTQ'
        }).format(monto || 0);
    }

    function formatearFecha(fecha) {
        if (!fecha) return 'N/A';
        return new Date(fecha).toLocaleDateString('es-GT');
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

    // Funciones de gestión de modales con wizard
    function abrirModalFormulario(item = null) {
        setItemEditando(item);
        setPasoFormulario(1);

        if (item) {
            setFormulario({ ...item });
        } else {
            // Inicializar formulario con valores por defecto
            const formularioInicial = {};
            if (config.defaultValues) {
                Object.assign(formularioInicial, config.defaultValues);
            }
            setFormulario(formularioInicial);
        }
        setErrores({});
        setModalFormulario(true);
    }

    function manejarCambioFormulario(campo, valor) {
        setFormulario(prev => ({ ...prev, [campo]: valor }));
        if (errores[campo]) {
            setErrores(prev => ({ ...prev, [campo]: '' }));
        }

        // Ejecutar callbacks de cambio si existen
        if (config.onFieldChange && config.onFieldChange[campo]) {
            config.onFieldChange[campo](valor, formulario, setFormulario);
        }
    }

    // Validación por pasos
    function validarPasoActual() {
        if (!config.formSteps) {
            return validarFormularioCompleto();
        }

        const pasoActual = config.formSteps[pasoFormulario - 1];
        if (!pasoActual) return true;

        const nuevosErrores = {};

        pasoActual.fields.forEach(fieldName => {
            const fieldConfig = config.fields[fieldName];
            if (fieldConfig?.required && !formulario[fieldName]) {
                nuevosErrores[fieldName] = `${fieldConfig.label} es requerido`;
            }
        });

        // Validaciones customizadas del paso
        if (pasoActual.validate) {
            const erroresCustom = pasoActual.validate(formulario);
            Object.assign(nuevosErrores, erroresCustom);
        }

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    }

    function validarFormularioCompleto() {
        const nuevosErrores = {};

        Object.entries(config.fields).forEach(([fieldName, fieldConfig]) => {
            if (fieldConfig.required && !formulario[fieldName]) {
                nuevosErrores[fieldName] = `${fieldConfig.label} es requerido`;
            }
        });

        // Validaciones globales customizadas
        if (config.validateForm) {
            const erroresCustom = config.validateForm(formulario);
            Object.assign(nuevosErrores, erroresCustom);
        }

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    }

    function siguientePaso() {
        if (!validarPasoActual()) return;
        setPasoFormulario(prev => prev + 1);
    }

    function pasoAnterior() {
        setPasoFormulario(prev => Math.max(1, prev - 1));
    }

    async function guardarItem() {
        if (!validarFormularioCompleto()) return;

        setLoadingAction(true);
        try {
            const endpoint = `${config.apiEndpoint}/${config.tableName}`;
            const url = itemEditando
                ? `${endpoint}/${obtenerIdItem(itemEditando)}`
                : endpoint;
            const method = itemEditando ? 'PUT' : 'POST';

            // Procesar datos antes de enviar si es necesario
            let datosEnvio = { ...formulario };
            if (config.processBeforeSave) {
                datosEnvio = config.processBeforeSave(datosEnvio);
            }

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify(datosEnvio)
            });

            if (response.ok) {
                Notifications.success(
                    itemEditando
                        ? `${config.displayName.slice(0, -1)} actualizado exitosamente`
                        : `${config.displayName.slice(0, -1)} creado exitosamente`
                );
                setModalFormulario(false);
                cargarDatos();

                // Callback post-guardado si existe
                if (config.afterSave) {
                    config.afterSave(await response.json(), itemEditando);
                }
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

    // Resto de funciones similares a la plantilla simple...
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

                    // Lógica específica de duplicación si existe
                    if (config.processDuplicate) {
                        itemDuplicado = config.processDuplicate(itemDuplicado);
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

    // Información del wizard
    const infoWizard = useMemo(() => {
        if (!config.formSteps) return null;

        return {
            pasoActual: pasoFormulario,
            totalPasos: config.formSteps.length,
            tituloStep: config.formSteps[pasoFormulario - 1]?.title || '',
            puedeAvanzar: pasoFormulario < config.formSteps.length,
            puedeRetroceder: pasoFormulario > 1
        };
    }, [pasoFormulario, config.formSteps]);

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

        // Lista principal (similar a dependientes simples pero con más información)
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
                                // Información del item (más detallada)
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

        // Modales usando ModalUniversal (con soporte para wizard)
        ModalUniversal.formulario({
            abierto: modalFormulario,
            cerrar: () => setModalFormulario(false),
            guardar: infoWizard && infoWizard.puedeAvanzar ? siguientePaso : guardarItem,
            formulario: formulario,
            cambiarCampo: manejarCambioFormulario,
            errores: errores,
            loading: loadingAction,
            tipoItem: config.displayName.slice(0, -1).toLowerCase(),
            campos: generarCamposFormulario(),
            esEdicion: !!itemEditando,
            // Props específicos del wizard
            wizard: infoWizard,
            onPasoAnterior: infoWizard && infoWizard.puedeRetroceder ? pasoAnterior : null,
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
            datosRelacionados: datosRelacionados, // Para mostrar info enriquecida
            key: 'modal-detalles'
        })
    ]);
}

export default GestionTransaccionales;
