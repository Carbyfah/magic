// src/resources/js/components/operacion/control-flota/GestionVehiculos.js
import React from 'react';
import Icons from '../../../utils/Icons';
import Notifications from '../../../utils/notifications';
import ModalUniversal from '../../common/ModalUniversal';
import BotonesUniversal from '../../common/BotonesUniversal';

// IMPORTAR EL NUEVO SISTEMA REUTILIZABLE
import useTableData from '../../common/useTableData';
import TableControls from '../../common/TableControls';
import TablePagination from '../../common/TablePagination';
import { vehiculosConfig } from './vehiculosConfig';

const { createElement: e, useState, useEffect } = React;

function GestionVehiculos() {
    // Estados principales
    const [vehiculos, setVehiculos] = useState([]);
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
    const currentConfig = vehiculosConfig.vehiculos;
    const currentRawData = vehiculos;

    const tableData = useTableData(currentConfig, currentRawData);

    // Efectos principales
    useEffect(() => {
        cargarDatos();
        validarEstados();
    }, []);

    // SISTEMA DE VALIDACIÓN DE ESTADOS - MEJORADO
    const validarEstados = async () => {
        try {
            const validacion = await currentConfig.validateStates();
            if (!validacion.valido) {
                // Mostrar notificación warning con mensaje específico
                Notifications.warning(
                    `${validacion.mensaje} - El sistema necesita estos estados para funcionar correctamente`,
                    'Estados Faltantes'
                );

                console.warn('Validación de estados falló:', validacion);

                // Opcional: Mostrar botón para crear estados automáticamente
                setTimeout(() => {
                    Notifications.info(
                        'Puede crear los estados faltantes desde el módulo de Estados del Sistema',
                        'Sugerencia'
                    );
                }, 3000);
            } else {
                console.log('Validación de estados exitosa:', validacion.mensaje);
            }
        } catch (error) {
            console.error('Error validando estados:', error);
            Notifications.error('Error al validar estados del sistema');
        }
    };

    // Función para cargar datos desde API - MEJORADA
    const cargarDatos = async () => {
        try {
            setLoading(true);
            const [vehiculosRes, estadosRes] = await Promise.all([
                fetch('/api/magic/vehiculos', {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                }),
                fetch('/api/magic/estados/contexto/vehiculo', {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                })
            ]);

            if (vehiculosRes.ok) {
                const vehiculosData = await vehiculosRes.json();
                setVehiculos(vehiculosData.data || vehiculosData);
                console.log('Vehículos cargados:', (vehiculosData.data || vehiculosData).length, 'items');
            } else {
                console.error('Error al cargar vehículos:', vehiculosRes.status);
                Notifications.error(`Error al cargar vehículos: ${vehiculosRes.status}`);
            }

            if (estadosRes.ok) {
                const estadosData = await estadosRes.json();
                setEstados(estadosData.data || estadosData);
                console.log('Estados de vehículo cargados:', (estadosData.data || estadosData).length, 'items');
            } else {
                console.error('Error al cargar estados:', estadosRes.status);
                Notifications.error(`Error al cargar estados: ${estadosRes.status}`);
            }

        } catch (error) {
            console.error('Error de conexión:', error);
            Notifications.error('Error de conexión al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    // Generar campos de formulario - MEJORADO CON VALIDACIONES
    const generarCamposFormulario = () => {
        const campos = [];

        if (itemEditando && itemEditando.vehiculo_codigo) {
            campos.push({
                nombre: 'vehiculo_codigo',
                tipo: 'text',
                requerido: false,
                opciones: [],
                placeholder: 'Código del vehículo',
                soloLectura: true,
                ancho: 'completo',
                label: 'Código del vehículo'
            });
        }

        campos.push({
            nombre: 'vehiculo_placa',
            tipo: 'text',
            requerido: true,
            opciones: [],
            placeholder: 'Placa del vehículo',
            soloLectura: false,
            ancho: 'medio',
            label: 'Placa del vehículo'
        });

        campos.push({
            nombre: 'vehiculo_marca',
            tipo: 'text',
            requerido: true,
            opciones: [],
            placeholder: 'Marca del vehículo',
            soloLectura: false,
            ancho: 'medio',
            label: 'Marca del vehículo'
        });

        campos.push({
            nombre: 'vehiculo_modelo',
            tipo: 'text',
            requerido: false,
            opciones: [],
            placeholder: 'Modelo del vehículo',
            soloLectura: false,
            ancho: 'medio',
            label: 'Modelo'
        });

        campos.push({
            nombre: 'vehiculo_capacidad',
            tipo: 'number',
            requerido: true,
            opciones: [],
            placeholder: 'Número de pasajeros (1-60)',
            soloLectura: false,
            ancho: 'medio',
            label: 'Capacidad'
        });

        campos.push({
            nombre: 'estado_id',
            tipo: 'select',
            searchable: true,
            requerido: true,
            opciones: estados.map(estado => ({
                value: estado.estado_id,
                label: `${estado.estado_estado} - ${estado.estado_descripcion || ''}`
            })),
            placeholder: 'Seleccione el estado del vehículo',
            soloLectura: false,
            ancho: 'completo',
            label: 'Estado del vehículo'
        });

        return campos;
    };

    // Renderizar item de lista - MEJORADO CON NUEVOS HELPERS
    const renderizarItem = (item) => {
        const camposImportantes = [
            { campo: 'placa', label: 'Placa', tipo: 'placa' },
            { campo: 'capacidad', label: 'Capacidad', tipo: 'capacidad' },
            { campo: 'estado', label: 'Estado del Vehículo', tipo: 'estado' }
        ];

        return e('div', {
            style: {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                color: '#6b7280',
                fontSize: '0.875rem'
            }
        }, camposImportantes.map(({ campo, label, tipo }) => {
            let valor = item[campo];
            let contenidoFormateado;

            if (tipo === 'placa') {
                contenidoFormateado = currentConfig.helpers.formatPlate(valor);
            } else if (tipo === 'capacidad') {
                contenidoFormateado = `${valor || 0} pasajeros`;
            } else if (tipo === 'estado' && valor) {
                const estadoColor = currentConfig.helpers.getStateColor(valor);
                const estadoTexto = currentConfig.helpers.getStateText(valor);

                return e('div', { key: campo }, [
                    e('strong', { key: `label-${campo}` }, `${label}: `),
                    e('span', {
                        key: `badge-${campo}`,
                        style: {
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            backgroundColor: estadoColor === 'verde' ? '#dcfce7' :
                                estadoColor === 'naranja' ? '#fed7aa' :
                                    estadoColor === 'azul' ? '#dbeafe' : '#f3f4f6',
                            color: estadoColor === 'verde' ? '#166534' :
                                estadoColor === 'naranja' ? '#ea580c' :
                                    estadoColor === 'azul' ? '#1e40af' : '#6b7280'
                        }
                    }, estadoTexto)
                ]);
            } else {
                contenidoFormateado = String(valor || 'N/A');
            }

            return e('div', { key: campo }, [
                e('strong', { key: `label-${campo}` }, `${label}: `),
                contenidoFormateado
            ]);
        }));
    };

    // Funciones auxiliares - MANTENIDAS
    const obtenerNombreItem = (item) => {
        return item.nombre_completo || `${item.vehiculo_marca} ${item.vehiculo_modelo}` || item.vehiculo_placa || item.vehiculo_codigo || `Vehículo #${item.vehiculo_id}`;
    };

    const obtenerIdItem = (item) => {
        return item.vehiculo_id || item.id;
    };

    const obtenerEstadoItem = (item) => {
        const status = item.activo;
        return status === true || status === 1 || status === '1';
    };

    // Funciones de gestión de modales - MANTENIDAS
    const abrirModalFormulario = (item = null) => {
        setItemEditando(item);
        if (item) {
            setFormulario({
                vehiculo_codigo: item.vehiculo_codigo || item.codigo,
                vehiculo_placa: item.vehiculo_placa || item.placa,
                vehiculo_marca: item.vehiculo_marca || item.marca,
                vehiculo_modelo: item.vehiculo_modelo || item.modelo,
                vehiculo_capacidad: item.vehiculo_capacidad || item.capacidad,
                estado_id: item.estado_id || item.estado?.id
            });
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

    // Validación del formulario - SIN VALIDACIÓN DE FORMATO DE PLACA
    const validarFormulario = async () => {
        const nuevosErrores = {};

        // Validaciones básicas
        if (!formulario.vehiculo_placa?.trim()) {
            nuevosErrores.vehiculo_placa = 'La placa es requerida';
        }

        if (!formulario.vehiculo_marca?.trim()) {
            nuevosErrores.vehiculo_marca = 'La marca es requerida';
        }

        if (!formulario.estado_id) {
            nuevosErrores.estado_id = 'El estado del vehículo es requerido';
        }

        // Usar validadores de la configuración
        if (formulario.vehiculo_capacidad !== undefined) {
            const validacionCapacidad = currentConfig.integrityValidators.validateCapacity(formulario);
            if (!validacionCapacidad.valido) {
                nuevosErrores.vehiculo_capacidad = validacionCapacidad.mensaje;
            }
        }

        // Validar estado si existe
        if (formulario.estado_id) {
            try {
                const validacionEstado = await currentConfig.integrityValidators.validateState(formulario);
                if (!validacionEstado.valido) {
                    nuevosErrores.estado_id = validacionEstado.mensaje;
                }
            } catch (error) {
                console.warn('Error validando estado:', error);
            }
        }

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    // Guardar item - MEJORADO CON PROCESAMIENTO
    const guardarItem = async () => {
        const formularioValido = await validarFormulario();
        if (!formularioValido) return;

        try {
            setLoadingAction(true);

            // Procesar datos usando helper de configuración
            let datosParaEnviar = currentConfig.processBeforeSave({ ...formulario });

            if (!itemEditando) {
                datosParaEnviar.vehiculo_situacion = 1;
            } else {
                if (datosParaEnviar.vehiculo_situacion === undefined) {
                    datosParaEnviar.vehiculo_situacion = itemEditando.vehiculo_situacion || 1;
                }
            }

            console.log('Datos procesados a enviar:', datosParaEnviar);

            const url = itemEditando
                ? `/api/magic/vehiculos/${obtenerIdItem(itemEditando)}`
                : `/api/magic/vehiculos`;

            const method = itemEditando ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                },
                body: JSON.stringify(datosParaEnviar)
            });

            if (response.ok) {
                Notifications.success(
                    `Vehículo ${itemEditando ? 'actualizado' : 'creado'} exitosamente`
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

    // Ejecutar acción - MEJORADO CON VALIDACIONES DE ESTADO
    const ejecutarAccion = async () => {
        if (!itemConfirmacion) return;

        try {
            setLoadingAction(true);
            const itemId = obtenerIdItem(itemConfirmacion);

            let response;
            let url;

            switch (accionConfirmacion) {
                case 'activar':
                    url = `/api/magic/vehiculos/${itemId}/activate`;
                    response = await fetch(url, {
                        method: 'PATCH',
                        headers: {
                            'Accept': 'application/json',
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                        }
                    });
                    break;

                case 'desactivar':
                    // Validar si tiene rutas activas antes de desactivar
                    if (itemConfirmacion.estado && currentConfig.stateDetection.asignado(itemConfirmacion.estado)) {
                        Notifications.warning('No se puede desactivar un vehículo que está asignado a una ruta activa');
                        setModalConfirmacion(false);
                        setLoadingAction(false);
                        return;
                    }

                    url = `/api/magic/vehiculos/${itemId}/deactivate`;
                    response = await fetch(url, {
                        method: 'PATCH',
                        headers: {
                            'Accept': 'application/json',
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                        }
                    });
                    break;

                case 'duplicar':
                    const itemDuplicado = {
                        vehiculo_placa: '',
                        vehiculo_marca: itemConfirmacion.vehiculo_marca || itemConfirmacion.marca,
                        vehiculo_modelo: itemConfirmacion.vehiculo_modelo || itemConfirmacion.modelo,
                        vehiculo_capacidad: itemConfirmacion.vehiculo_capacidad || itemConfirmacion.capacidad,
                        estado_id: itemConfirmacion.estado_id || itemConfirmacion.estado?.id,
                        vehiculo_situacion: 1
                    };

                    url = `/api/magic/vehiculos`;
                    response = await fetch(url, {
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                        },
                        body: JSON.stringify(itemDuplicado)
                    });
                    break;

                default:
                    return;
            }

            if (response && response.ok) {
                const mensajes = {
                    activar: 'Vehículo activado exitosamente',
                    desactivar: 'Vehículo desactivado exitosamente',
                    duplicar: 'Vehículo duplicado exitosamente - Recuerda agregar la placa'
                };

                Notifications.success(mensajes[accionConfirmacion]);
                setModalConfirmacion(false);
                cargarDatos();

                // Si es duplicar, abrir formulario de edición del nuevo item
                if (accionConfirmacion === 'duplicar') {
                    setTimeout(() => {
                        Notifications.info('Completa la información del vehículo duplicado, especialmente la placa');
                    }, 2000);
                }
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
                }, 'Gestión de Vehículos'),
                e('p', {
                    style: {
                        color: '#6b7280',
                        margin: '0.25rem 0 0 0',
                        fontSize: '1rem'
                    }
                }, `${datosActuales.length} de ${totalDatos} vehículos encontrados`)
            ]),
            BotonesUniversal.nuevo({
                onClick: () => abrirModalFormulario(),
                texto: 'Nuevo Vehículo',
                loading: loading
            })
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
                        const esActivo = obtenerEstadoItem(item);

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

                                        (item.vehiculo_codigo || item.codigo) && BotonesUniversal.badge({
                                            texto: item.vehiculo_codigo || item.codigo,
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
                                        onDuplicar: () => abrirModalConfirmacion(item, 'duplicar'),
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
                    }, 'No hay vehículos que coincidan con los filtros')
        ]),

        // COMPONENTE DE PAGINACIÓN
        e(TablePagination, {
            key: 'table-pagination',
            pagination: tableData.pagination,
            actions: tableData.actions,
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
            tipoItem: 'vehículo',
            campos: generarCamposFormulario(),
            esEdicion: !!itemEditando
        }),

        ModalUniversal.confirmacion({
            abierto: modalConfirmacion,
            cerrar: () => setModalConfirmacion(false),
            ejecutar: ejecutarAccion,
            accion: accionConfirmacion,
            item: itemConfirmacion,
            tipoItem: 'vehículo',
            loading: loadingAction,
            nombreItem: itemConfirmacion ? obtenerNombreItem(itemConfirmacion) : ''
        }),

        ModalUniversal.detalles({
            abierto: modalDetalles,
            cerrar: () => setModalDetalles(false),
            item: itemDetalles,
            tipoItem: 'vehículo'
        })
    ]);
}

export default GestionVehiculos;
