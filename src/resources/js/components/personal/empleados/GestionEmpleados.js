// src/resources/js/components/personal/empleados/GestionEmpleados.js
import React from 'react';
import Icons from '../../../utils/Icons';
import Notifications from '../../../utils/notifications';
import ModalUniversal from '../../common/ModalUniversal';
import BotonesUniversal from '../../common/BotonesUniversal';

// IMPORTAR EL NUEVO SISTEMA REUTILIZABLE
import useTableData from '../../common/useTableData';
import TableControls from '../../common/TableControls';
import TablePagination from '../../common/TablePagination';
import { empleadosConfig } from './empleadosConfig';

import apiHelper from '../../../utils/apiHelper';

const { createElement: e, useState, useEffect } = React;

function GestionEmpleados() {
    // Estados principales
    const [empleados, setEmpleados] = useState([]);
    const [tiposPersona, setTiposPersona] = useState([]);
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
    const currentConfig = empleadosConfig.empleados;
    const currentRawData = empleados;

    const tableData = useTableData(currentConfig, currentRawData);

    // Efectos principales
    useEffect(() => {
        cargarDatos();
    }, []);

    // Función para cargar datos desde API
    const cargarDatos = async () => {
        try {
            setLoading(true);
            const [empleadosRes, tiposRes] = await Promise.all([
                apiHelper.get('/personas'),
                apiHelper.tiposPersona.getAll()
            ]);

            // Procesar empleados
            try {
                const empleadosData = await apiHelper.handleResponse(empleadosRes);
                setEmpleados(empleadosData.data || empleadosData);
                console.log('Empleados cargados:', (empleadosData.data || empleadosData).length, 'items');
            } catch (error) {
                console.error('Error al cargar empleados:', error);
                Notifications.error(`Error al cargar empleados: ${error.message}`);
            }

            // Procesar tipos de persona
            try {
                const tiposData = await apiHelper.handleResponse(tiposRes);
                setTiposPersona(tiposData.data || tiposData);
                console.log('Tipos de persona cargados:', (tiposData.data || tiposData).length, 'items');
            } catch (error) {
                console.error('Error al cargar tipos de persona:', error);
                Notifications.error(`Error al cargar tipos de persona: ${error.message}`);
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
        const campos = [];

        if (itemEditando && itemEditando.persona_codigo) {
            campos.push({
                nombre: 'persona_codigo',
                tipo: 'text',
                requerido: false,
                opciones: [],
                placeholder: 'Código del empleado',
                soloLectura: true,
                ancho: 'completo',
                label: 'Código del empleado'
            });
        }

        campos.push({
            nombre: 'persona_nombres',
            tipo: 'text',
            requerido: true,
            opciones: [],
            placeholder: 'Nombres del empleado',
            soloLectura: false,
            ancho: 'medio',
            label: 'Nombres del empleado'
        });

        campos.push({
            nombre: 'persona_apellidos',
            tipo: 'text',
            requerido: true,
            opciones: [],
            placeholder: 'Apellidos del empleado',
            soloLectura: false,
            ancho: 'medio',
            label: 'Apellidos del empleado'
        });

        campos.push({
            nombre: 'persona_telefono',
            tipo: 'number',
            requerido: false,
            opciones: [],
            placeholder: '12345678',
            soloLectura: false,
            ancho: 'medio',
            label: 'Teléfono'
        });

        campos.push({
            nombre: 'persona_email',
            tipo: 'email',
            requerido: false,
            opciones: [],
            placeholder: 'empleado@magictravel.com',
            soloLectura: false,
            ancho: 'medio',
            label: 'Correo'
        });

        campos.push({
            nombre: 'tipo_persona_id',
            tipo: 'select',
            searchable: true,
            requerido: true,
            opciones: tiposPersona.map(tipo => ({
                value: tipo.tipo_persona_id,
                label: tipo.tipo_persona_tipo
            })),
            placeholder: 'tipo de empleado',
            soloLectura: false,
            ancho: 'completo',
            label: 'Tipo de empleado'
        });

        return campos;
    };

    // Renderizar item de lista
    const renderizarItem = (item) => {
        const camposImportantes = [
            { campo: 'nombre_completo', label: 'Nombre Completo' },
            { campo: 'email', label: 'Email' },
            { campo: 'tipo_persona', label: 'Tipo de Empleado', tipo: 'objeto' }
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

            if (tipo === 'objeto' && valor) {
                contenidoFormateado = valor.nombre || 'N/A';
            } else {
                contenidoFormateado = String(valor || 'N/A');
            }

            return e('div', { key: campo }, [
                e('strong', { key: `label-${campo}` }, `${label}: `),
                contenidoFormateado
            ]);
        }));
    };

    // Funciones auxiliares - CORREGIDAS
    const obtenerNombreItem = (item) => {
        return item.nombre_completo || `${item.persona_nombres} ${item.persona_apellidos}` || item.persona_codigo || `Empleado #${item.persona_id}`;
    };

    const obtenerIdItem = (item) => {
        return item.persona_id || item.id;
    };

    const obtenerEstadoItem = (item) => {
        // CORRECCIÓN: Usar el campo 'activo' que viene del PersonaResource
        const status = item.activo;
        return status === true || status === 1 || status === '1';
    };

    // Funciones de gestión de modales
    const abrirModalFormulario = (item = null) => {
        setItemEditando(item);
        if (item) {
            setFormulario({
                persona_codigo: item.persona_codigo || item.codigo,
                persona_nombres: item.persona_nombres || item.nombres,
                persona_apellidos: item.persona_apellidos || item.apellidos,
                persona_telefono: item.persona_telefono || item.telefono,
                persona_email: item.persona_email || item.email,
                tipo_persona_id: item.tipo_persona_id || item.tipo_persona?.id
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

    // Validación del formulario - USAR CONFIG
    const validarFormulario = async () => {
        const nuevosErrores = await currentConfig.validateForm(formulario, itemEditando?.persona_id);
        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    // Guardar item - CORREGIDO
    const guardarItem = async () => {
        const formularioValido = await validarFormulario();
        if (!formularioValido) return;

        try {
            setLoadingAction(true);

            const datosParaEnviar = { ...formulario };

            // CORRECCIÓN: Manejar persona_situacion correctamente
            if (!itemEditando) {
                // Nuevo empleado: SIEMPRE activo
                datosParaEnviar.persona_situacion = 1; // Usar 1 en lugar de true
            } else {
                // Editando: mantener el estado actual SI NO está en el formulario
                if (datosParaEnviar.persona_situacion === undefined) {
                    datosParaEnviar.persona_situacion = itemEditando.persona_situacion || 1;
                }
            }

            console.log('Datos a enviar:', datosParaEnviar);

            const response = itemEditando
                ? await apiHelper.put(`/personas/${obtenerIdItem(itemEditando)}`, datosParaEnviar)
                : await apiHelper.post('/personas', datosParaEnviar);

            const data = await apiHelper.handleResponse(response);

            if (response.ok) {
                Notifications.success(
                    `Empleado ${itemEditando ? 'actualizado' : 'creado'} exitosamente`
                );
                setModalFormulario(false);
                cargarDatos();
            } else {
                if (data.errors) {
                    setErrores(data.errors);
                    Notifications.error('Por favor corrige los errores en el formulario');
                } else {
                    Notifications.error(`Error al guardar: ${data.message || 'Error desconocido'}`);
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
            const itemId = obtenerIdItem(itemConfirmacion);

            let response;

            switch (accionConfirmacion) {
                case 'activar':
                    response = await apiHelper.patch(`/personas/${itemId}/activate`);
                    break;

                case 'desactivar':
                    response = await apiHelper.patch(`/personas/${itemId}/deactivate`);
                    break;

                case 'duplicar':
                    const itemDuplicado = {
                        persona_nombres: itemConfirmacion.persona_nombres || itemConfirmacion.nombres,
                        persona_apellidos: itemConfirmacion.persona_apellidos || itemConfirmacion.apellidos,
                        persona_telefono: itemConfirmacion.persona_telefono || itemConfirmacion.telefono,
                        persona_email: '', // Email vacío para evitar duplicados
                        tipo_persona_id: itemConfirmacion.tipo_persona_id || itemConfirmacion.tipo_persona?.id,
                        persona_situacion: 1 // Usar 1 en lugar de true
                    };

                    response = await apiHelper.post('/personas', itemDuplicado);
                    break;

                default:
                    return;
            }

            const data = await apiHelper.handleResponse(response);

            if (response.ok) {
                const mensajes = {
                    activar: 'Empleado activado exitosamente',
                    desactivar: 'Empleado desactivado exitosamente',
                    duplicar: 'Empleado duplicado exitosamente'
                };

                Notifications.success(mensajes[accionConfirmacion]);
                setModalConfirmacion(false);
                cargarDatos();
            } else {
                Notifications.error(`Error al ${accionConfirmacion}: ${data.message || 'Error desconocido'}`);
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
                }, 'Gestión de Empleados'),
                e('p', {
                    style: {
                        color: '#6b7280',
                        margin: '0.25rem 0 0 0',
                        fontSize: '1rem'
                    }
                }, `${datosActuales.length} de ${totalDatos} empleados encontrados`)
            ]),
            BotonesUniversal.nuevo({
                onClick: () => abrirModalFormulario(),
                texto: 'Nuevo Empleado',
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
                        const esActivo = obtenerEstadoItem(item); // SIMPLIFICADO - ya devuelve boolean

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

                                        (item.persona_codigo || item.codigo) && BotonesUniversal.badge({
                                            texto: item.persona_codigo || item.codigo,
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
                    }, 'No hay empleados que coincidan con los filtros')
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
            tipoItem: 'empleado',
            campos: generarCamposFormulario(),
            esEdicion: !!itemEditando
        }),

        ModalUniversal.confirmacion({
            abierto: modalConfirmacion,
            cerrar: () => setModalConfirmacion(false),
            ejecutar: ejecutarAccion,
            accion: accionConfirmacion,
            item: itemConfirmacion,
            tipoItem: 'empleado',
            loading: loadingAction,
            nombreItem: itemConfirmacion ? obtenerNombreItem(itemConfirmacion) : ''
        }),

        ModalUniversal.detalles({
            abierto: modalDetalles,
            cerrar: () => setModalDetalles(false),
            item: itemDetalles,
            tipoItem: 'empleado'
        })
    ]);
}

export default GestionEmpleados;
