// src/resources/js/components/catalogos/rutas-servicios/GestionRutasServicios.js
import React from 'react';
import Icons from '../../../utils/Icons';
import Notifications from '../../../utils/notifications';
import ModalUniversal from '../../common/ModalUniversal';
import BotonesUniversal from '../../common/BotonesUniversal';

// IMPORTAR EL NUEVO SISTEMA REUTILIZABLE
import useTableData from '../../common/useTableData';
import TableControls from '../../common/TableControls';
import TablePagination from '../../common/TablePagination';
import { rutasServiciosConfig } from './rutasServiciosConfig';

import apiHelper from '../../../utils/apiHelper';

const { createElement: e, useState, useEffect } = React;

function GestionRutasServicios() {
    // Estados principales
    const [vistaActiva, setVistaActiva] = useState('rutas');
    const [rutas, setRutas] = useState([]);
    const [servicios, setServicios] = useState([]);
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
    const currentConfig = vistaActiva === 'rutas' ? rutasServiciosConfig.rutas : rutasServiciosConfig.servicios;
    const currentRawData = vistaActiva === 'rutas' ? rutas : servicios;

    const tableData = useTableData(currentConfig, currentRawData);

    // Efectos principales
    useEffect(() => {
        cargarDatos();
    }, []);

    // Función para cargar datos desde API
    const cargarDatos = async () => {
        try {
            setLoading(true);

            // Usar Promise.all con apiHelper
            const [rutasRes, serviciosRes] = await Promise.all([
                apiHelper.rutas.getAll(),
                apiHelper.servicios.getAll()
            ]);

            // Procesar rutas
            try {
                const rutasData = await apiHelper.handleResponse(rutasRes);
                setRutas(rutasData);
                console.log('Rutas cargadas:', rutasData.length, 'items');
            } catch (rutasError) {
                console.error('Error al cargar rutas:', rutasError);
                Notifications.error(`Error al cargar rutas: ${rutasError.message}`);
            }

            // Procesar servicios
            try {
                const serviciosData = await apiHelper.handleResponse(serviciosRes);
                setServicios(serviciosData);
                console.log('Servicios cargados:', serviciosData.length, 'items');
            } catch (serviciosError) {
                console.error('Error al cargar servicios:', serviciosError);
                Notifications.error(`Error al cargar servicios: ${serviciosError.message}`);
            }

        } catch (error) {
            console.error('Error de conexión:', error);
            Notifications.error('Error de conexión al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    // Generar campos de formulario
    const generarCamposFormulario = () => {
        if (vistaActiva === 'rutas') {
            const campos = [];

            if (itemEditando && itemEditando.ruta_codigo) {
                campos.push({
                    nombre: 'ruta_codigo',
                    tipo: 'text',
                    requerido: false,
                    opciones: [],
                    placeholder: 'Código de la ruta',
                    soloLectura: true,
                    ancho: 'completo'
                });
            }

            campos.push({
                nombre: 'ruta_ruta',
                tipo: 'text',
                requerido: true,
                opciones: [],
                placeholder: 'Nombre de la ruta',
                soloLectura: false,
                ancho: 'completo'
            });

            campos.push({
                nombre: 'ruta_origen',
                tipo: 'city_autocomplete',
                requerido: true,
                opciones: [],
                placeholder: 'Ciudad de origen',
                soloLectura: false,
                ancho: 'medio'
            });

            campos.push({
                nombre: 'ruta_destino',
                tipo: 'city_autocomplete',
                requerido: true,
                opciones: [],
                placeholder: 'Ciudad de destino',
                soloLectura: false,
                ancho: 'medio'
            });

            return campos;
        } else {
            const campos = [];

            if (itemEditando && itemEditando.servicio_codigo) {
                campos.push({
                    nombre: 'servicio_codigo',
                    tipo: 'text',
                    requerido: false,
                    opciones: [],
                    placeholder: 'Código del servicio',
                    soloLectura: true,
                    ancho: 'completo'
                });
            }

            campos.push({
                nombre: 'servicio_servicio',
                tipo: 'text',
                requerido: true,
                opciones: [],
                placeholder: 'Nombre del servicio',
                soloLectura: false,
                ancho: 'completo'
            });

            campos.push({
                nombre: 'servicio_precio_normal',
                tipo: 'number',
                requerido: true,
                opciones: [],
                placeholder: 'Precio normal (GTQ)',
                soloLectura: false,
                ancho: 'medio'
            });

            campos.push({
                nombre: 'servicio_precio_descuento',
                tipo: 'number',
                requerido: false,
                opciones: [],
                placeholder: 'Precio con descuento (GTQ)',
                soloLectura: false,
                ancho: 'medio'
            });

            return campos;
        }
    };

    // Renderizar item de lista
    const renderizarItem = (item) => {
        let camposImportantes;

        if (vistaActiva === 'rutas') {
            camposImportantes = [
                { campo: 'ruta_ruta', label: 'Nombre' },
                { campo: 'ruta_origen', label: 'Origen' },
                { campo: 'ruta_destino', label: 'Destino' }
            ];
        } else {
            camposImportantes = [
                { campo: 'servicio_servicio', label: 'Nombre' },
                { campo: 'servicio_precio_normal', label: 'Precio Normal', tipo: 'precio' },
                { campo: 'servicio_precio_descuento', label: 'Precio Descuento', tipo: 'precio' }
            ];
        }

        return e('div', {
            style: {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                color: '#6b7280',
                fontSize: '0.875rem'
            }
        }, camposImportantes.map(({ campo, label, tipo }) => {
            const valor = item[campo];
            let contenidoFormateado;

            if (tipo === 'precio' && valor) {
                contenidoFormateado = formatearMonto(valor);
            } else {
                contenidoFormateado = String(valor || 'N/A');
            }

            return e('div', { key: campo }, [
                e('strong', { key: `label-${campo}` }, `${label}: `),
                contenidoFormateado
            ]);
        }));
    };

    // Funciones auxiliares
    const formatearMonto = (monto) => {
        return new Intl.NumberFormat('es-GT', {
            style: 'currency',
            currency: 'GTQ'
        }).format(monto || 0);
    };

    const obtenerNombreItem = (item) => {
        if (vistaActiva === 'rutas') {
            return item.ruta_ruta || item.ruta_codigo || `Ruta #${item.ruta_id || item.id}`;
        } else {
            return item.servicio_servicio || item.servicio_codigo || `Servicio #${item.servicio_id || item.id}`;
        }
    };

    const obtenerIdItem = (item) => {
        return vistaActiva === 'rutas' ? item.ruta_id : item.servicio_id;
    };

    const obtenerEstadoItem = (item) => {
        return vistaActiva === 'rutas' ? item.ruta_situacion : item.servicio_situacion;
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

        if (vistaActiva === 'rutas') {
            if (!formulario.ruta_ruta?.trim()) {
                nuevosErrores.ruta_ruta = 'El nombre de la ruta es requerido';
            }

            if (!formulario.ruta_origen?.trim()) {
                nuevosErrores.ruta_origen = 'El origen es requerido';
            }

            if (!formulario.ruta_destino?.trim()) {
                nuevosErrores.ruta_destino = 'El destino es requerido';
            }

            if (formulario.ruta_origen && formulario.ruta_destino &&
                formulario.ruta_origen.trim() === formulario.ruta_destino.trim()) {
                nuevosErrores.ruta_destino = 'El destino debe ser diferente al origen';
            }
        } else {
            if (!formulario.servicio_servicio?.trim()) {
                nuevosErrores.servicio_servicio = 'El nombre del servicio es requerido';
            }

            if (!formulario.servicio_precio_normal || formulario.servicio_precio_normal <= 0) {
                nuevosErrores.servicio_precio_normal = 'El precio normal debe ser mayor a 0';
            }

            if (formulario.servicio_precio_descuento && formulario.servicio_precio_descuento < 0) {
                nuevosErrores.servicio_precio_descuento = 'El precio de descuento no puede ser negativo';
            }

            if (formulario.servicio_precio_descuento && formulario.servicio_precio_normal &&
                parseFloat(formulario.servicio_precio_descuento) > parseFloat(formulario.servicio_precio_normal)) {
                nuevosErrores.servicio_precio_descuento = 'El precio de descuento no puede ser mayor al precio normal';
            }
        }

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    // Guardar item
    const guardarItem = async () => {
        if (!validarFormulario()) return;

        try {
            setLoadingAction(true);

            const datosParaEnviar = { ...formulario };

            if (!itemEditando) {
                if (vistaActiva === 'rutas') {
                    datosParaEnviar.ruta_situacion = true;
                } else {
                    datosParaEnviar.servicio_situacion = true;
                }
            }

            const endpoint = vistaActiva;
            const idField = vistaActiva === 'rutas' ? 'ruta_id' : 'servicio_id';

            const response = itemEditando
                ? await apiHelper.put(`/${endpoint}/${itemEditando[idField]}`, datosParaEnviar)
                : await apiHelper.post(`/${endpoint}`, datosParaEnviar);

            const data = await apiHelper.handleResponse(response);

            if (response.ok) {
                Notifications.success(
                    `${vistaActiva.slice(0, -1)} ${itemEditando ? 'actualizado' : 'creado'} exitosamente`
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

    // Ejecutar acción
    const ejecutarAccion = async () => {
        if (!itemConfirmacion) return;

        try {
            setLoadingAction(true);
            const endpoint = vistaActiva;
            const idField = vistaActiva === 'rutas' ? 'ruta_id' : 'servicio_id';
            const itemId = itemConfirmacion[idField];

            let response;

            switch (accionConfirmacion) {
                case 'activar':
                    response = await apiHelper.patch(`/${endpoint}/${itemId}/activate`);
                    break;

                case 'desactivar':
                    response = await apiHelper.patch(`/${endpoint}/${itemId}/deactivate`);
                    break;

                default:
                    return;
            }

            if (response && response.ok) {
                const mensajes = {
                    activar: `${vistaActiva.slice(0, -1)} activado exitosamente`,
                    desactivar: `${vistaActiva.slice(0, -1)} desactivado exitosamente`
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
                marginBottom: '2rem'
            }
        }, [
            e('div', { key: 'title-section' }, [
                e('h1', {
                    style: {
                        fontSize: '2rem',
                        fontWeight: '700',
                        color: '#111827',
                        margin: '0'
                    }
                }, 'Gestión de Rutas y Servicios'),
                e('p', {
                    style: {
                        color: '#6b7280',
                        margin: '0.25rem 0 0 0',
                        fontSize: '1rem'
                    }
                }, `${datosActuales.length} de ${totalDatos} ${vistaActiva} encontrados`)
            ]),
            BotonesUniversal.nuevo({
                onClick: () => abrirModalFormulario(),
                texto: `Nuevo ${vistaActiva.slice(0, -1)}`,
                loading: loading
            })
        ]),

        // Tabs dinámicos
        e('div', {
            key: 'tabs',
            style: {
                display: 'flex',
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '0.5rem',
                marginBottom: '2rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }
        }, [
            e('button', {
                key: 'tab-rutas',
                onClick: () => setVistaActiva('rutas'),
                style: {
                    flex: 1,
                    padding: '0.75rem 1.5rem',
                    border: 'none',
                    borderRadius: '8px',
                    backgroundColor: vistaActiva === 'rutas' ? '#8b5cf6' : 'transparent',
                    color: vistaActiva === 'rutas' ? 'white' : '#6b7280',
                    cursor: 'pointer',
                    fontWeight: '500'
                }
            }, `Rutas (${rutas.length})`),
            e('button', {
                key: 'tab-servicios',
                onClick: () => setVistaActiva('servicios'),
                style: {
                    flex: 1,
                    padding: '0.75rem 1.5rem',
                    border: 'none',
                    borderRadius: '8px',
                    backgroundColor: vistaActiva === 'servicios' ? '#8b5cf6' : 'transparent',
                    color: vistaActiva === 'servicios' ? 'white' : '#6b7280',
                    cursor: 'pointer',
                    fontWeight: '500'
                }
            }, `Servicios (${servicios.length})`)
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
                                borderBottom: index < datosActuales.length - 1 ?
                                    '1px solid #f3f4f6' : 'none'
                            }
                        }, [
                            e('div', {
                                key: `item-content-${itemId}`,
                                style: {
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    justifyContent: 'space-between',
                                    gap: '1rem'
                                }
                            }, [
                                e('div', {
                                    key: `item-info-${itemId}`,
                                    style: { flex: 1 }
                                }, [
                                    e('div', {
                                        key: `item-header-${itemId}`,
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem',
                                            marginBottom: '0.75rem'
                                        }
                                    }, [
                                        e('h3', {
                                            key: `item-title-${itemId}`,
                                            style: {
                                                fontSize: '1.125rem',
                                                fontWeight: '600',
                                                margin: '0',
                                                color: '#111827'
                                            }
                                        }, obtenerNombreItem(item)),

                                        (item.ruta_codigo || item.servicio_codigo) && BotonesUniversal.badge({
                                            texto: item.ruta_codigo || item.servicio_codigo,
                                            color: 'gris',
                                            key: `badge-codigo-${itemId}`
                                        }),

                                        BotonesUniversal.badge({
                                            texto: esActivo ? 'Activo' : 'Inactivo',
                                            color: esActivo ? 'verde' : 'rojo',
                                            key: `badge-estado-${itemId}`
                                        })
                                    ]),

                                    e('div', {
                                        key: `item-fields-${itemId}`
                                    }, renderizarItem(item))
                                ]),

                                e('div', {
                                    key: `item-actions-${itemId}`
                                }, [
                                    BotonesUniversal.grupoAcciones({
                                        item: item,
                                        onVer: () => abrirModalDetalles(item),
                                        onEditar: () => abrirModalFormulario(item),
                                        mostrarDuplicar: false,
                                        // onDuplicar: () => abrirModalConfirmacion(item, 'duplicar'),
                                        onActivar: () => abrirModalConfirmacion(
                                            item,
                                            esActivo ? 'desactivar' : 'activar'
                                        ),
                                        activo: esActivo,
                                        key: `actions-${itemId}`
                                    })
                                ])
                            ])
                        ]);
                    }) : e('div', {
                        key: 'no-items',
                        style: {
                            padding: '3rem',
                            textAlign: 'center',
                            color: '#6b7280'
                        }
                    }, `No hay ${vistaActiva} que coincidan con los filtros`)
        ]),

        // COMPONENTE DE PAGINACIÓN
        e(TablePagination, {
            key: 'table-pagination',
            pagination: tableData.pagination,
            actions: tableData.actions,
            showItemsPerPage: true,
            showInfo: true,
            compact: false
        }),

        // Modales
        ModalUniversal.formulario({
            abierto: modalFormulario,
            cerrar: () => setModalFormulario(false),
            guardar: guardarItem,
            formulario: formulario,
            cambiarCampo: manejarCambioFormulario,
            errores: errores,
            loading: loadingAction,
            tipoItem: vistaActiva.slice(0, -1),
            campos: generarCamposFormulario(),
            esEdicion: !!itemEditando
        }),

        ModalUniversal.confirmacion({
            abierto: modalConfirmacion,
            cerrar: () => setModalConfirmacion(false),
            ejecutar: ejecutarAccion,
            accion: accionConfirmacion,
            item: itemConfirmacion,
            tipoItem: vistaActiva.slice(0, -1),
            loading: loadingAction,
            nombreItem: itemConfirmacion ? obtenerNombreItem(itemConfirmacion) : ''
        }),

        ModalUniversal.detalles({
            abierto: modalDetalles,
            cerrar: () => setModalDetalles(false),
            item: itemDetalles,
            tipoItem: vistaActiva.slice(0, -1)
        })
    ]);
}

export default GestionRutasServicios;
