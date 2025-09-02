// src/resources/js/components/comercial/contactos-agencia/GestionContactoAgencias.js
import React from 'react';
import Icons from '../../../utils/Icons';
import Notifications from '../../../utils/notifications';
import ModalUniversal from '../../common/ModalUniversal';
import BotonesUniversal from '../../common/BotonesUniversal';

// IMPORTAR EL NUEVO SISTEMA REUTILIZABLE
import useTableData from '../../common/useTableData';
import TableControls from '../../common/TableControls';
import TablePagination from '../../common/TablePagination';
import { contactoAgenciaConfig } from './contactoAgenciaConfig';

const { createElement: e, useState, useEffect } = React;

function GestionContactoAgencias() {
    // Estados principales
    const [contactos, setContactos] = useState([]);
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
    const currentConfig = contactoAgenciaConfig.contactos;
    const currentRawData = contactos;

    const tableData = useTableData(currentConfig, currentRawData);

    // Efectos principales
    useEffect(() => {
        cargarDatos();
    }, []);

    // Función para cargar datos desde API
    const cargarDatos = async () => {
        try {
            setLoading(true);
            const [contactosRes, agenciasRes] = await Promise.all([
                fetch('/api/magic/contactos-agencia', {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                }),
                fetch('/api/magic/agencias', {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                })
            ]);

            if (contactosRes.ok) {
                const contactosData = await contactosRes.json();
                setContactos(contactosData.data || contactosData);
                console.log('Contactos cargados:', (contactosData.data || contactosData).length, 'items');
            } else {
                console.error('Error al cargar contactos:', contactosRes.status);
                Notifications.error(`Error al cargar contactos: ${contactosRes.status}`);
            }

            if (agenciasRes.ok) {
                const agenciasData = await agenciasRes.json();
                setAgencias(agenciasData.data || agenciasData);
                console.log('Agencias cargadas:', (agenciasData.data || agenciasData).length, 'items');
            } else {
                console.error('Error al cargar agencias:', agenciasRes.status);
                Notifications.error(`Error al cargar agencias: ${agenciasRes.status}`);
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

        if (itemEditando && itemEditando.contactos_agencia_codigo) {
            campos.push({
                nombre: 'contactos_agencia_codigo',
                tipo: 'text',
                requerido: false,
                opciones: [],
                placeholder: 'Código del contacto',
                soloLectura: true,
                ancho: 'completo',
                label: 'Código del contacto'
            });
        }

        campos.push({
            nombre: 'contactos_agencia_nombres',
            tipo: 'text',
            requerido: true,
            opciones: [],
            placeholder: 'Nombres del contacto',
            soloLectura: false,
            ancho: 'medio',
            label: 'Nombres del contacto'
        });

        campos.push({
            nombre: 'contactos_agencia_apellidos',
            tipo: 'text',
            requerido: true,
            opciones: [],
            placeholder: 'Apellidos del contacto',
            soloLectura: false,
            ancho: 'medio',
            label: 'Apellidos del contacto'
        });

        campos.push({
            nombre: 'contactos_agencia_cargo',
            tipo: 'text',
            requerido: true,
            opciones: [],
            placeholder: 'Gerente, Director, etc.',
            soloLectura: false,
            ancho: 'medio',
            label: 'Cargo'
        });

        campos.push({
            nombre: 'contactos_agencia_telefono',
            tipo: 'number',
            requerido: true,
            opciones: [],
            placeholder: '12345678',
            soloLectura: false,
            ancho: 'medio',
            label: 'Teléfono'
        });

        campos.push({
            nombre: 'agencia_id',
            tipo: 'select',
            searchable: true,
            requerido: true,
            opciones: agencias.map(agencia => ({
                value: agencia.agencia_id,
                label: agencia.agencia_razon_social
            })),
            placeholder: 'Seleccione la agencia',
            soloLectura: false,
            ancho: 'completo',
            label: 'Agencia'
        });

        return campos;
    };

    // Renderizar item de lista
    const renderizarItem = (item) => {
        const camposImportantes = [
            { campo: 'nombre_completo', label: 'Nombre Completo' },
            { campo: 'cargo', label: 'Cargo' },
            { campo: 'agencia_nombre', label: 'Agencia', tipo: 'agencia' }
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

            if (tipo === 'agencia' && item.agencia) {
                contenidoFormateado = item.agencia.nombre || 'N/A';
            } else if (campo === 'nombre_completo') {
                contenidoFormateado = item.nombre_completo || 'N/A';
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
    const obtenerNombreItem = (item) => {
        return item.nombre_completo || `${item.contactos_agencia_nombres} ${item.contactos_agencia_apellidos}` || item.contactos_agencia_codigo || `Contacto #${item.contactos_agencia_id}`;
    };

    const obtenerIdItem = (item) => {
        return item.contactos_agencia_id || item.id;
    };

    const obtenerEstadoItem = (item) => {
        const status = item.activo || item.contactos_agencia_situacion;
        return status === true || status === 1 || status === '1';
    };

    // Funciones de gestión de modales
    const abrirModalFormulario = (item = null) => {
        setItemEditando(item);
        if (item) {
            setFormulario({
                contactos_agencia_codigo: item.contactos_agencia_codigo || item.codigo,
                contactos_agencia_nombres: item.contactos_agencia_nombres || item.nombres,
                contactos_agencia_apellidos: item.contactos_agencia_apellidos || item.apellidos,
                contactos_agencia_cargo: item.contactos_agencia_cargo || item.cargo,
                contactos_agencia_telefono: item.contactos_agencia_telefono || item.telefono,
                agencia_id: item.agencia_id || item.agencia?.id
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

    // Validación del formulario
    const validarFormulario = () => {
        const nuevosErrores = {};

        if (!formulario.contactos_agencia_nombres?.trim()) {
            nuevosErrores.contactos_agencia_nombres = 'Los nombres son requeridos';
        }

        if (!formulario.contactos_agencia_apellidos?.trim()) {
            nuevosErrores.contactos_agencia_apellidos = 'Los apellidos son requeridos';
        }

        if (!formulario.contactos_agencia_cargo?.trim()) {
            nuevosErrores.contactos_agencia_cargo = 'El cargo es requerido';
        }

        if (!formulario.contactos_agencia_telefono) {
            nuevosErrores.contactos_agencia_telefono = 'El teléfono es requerido';
        }

        if (!formulario.agencia_id) {
            nuevosErrores.agencia_id = 'La agencia es requerida';
        }

        if (formulario.contactos_agencia_telefono && (formulario.contactos_agencia_telefono.toString().length < 8 || formulario.contactos_agencia_telefono.toString().length > 15)) {
            nuevosErrores.contactos_agencia_telefono = 'El teléfono debe tener entre 8 y 15 dígitos';
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

            // Manejar contactos_agencia_situacion correctamente
            if (!itemEditando) {
                // Nuevo contacto: SIEMPRE activo
                datosParaEnviar.contactos_agencia_situacion = 1;
            } else {
                // Editando: mantener el estado actual SI NO está en el formulario
                if (datosParaEnviar.contactos_agencia_situacion === undefined) {
                    datosParaEnviar.contactos_agencia_situacion = itemEditando.contactos_agencia_situacion || 1;
                }
            }

            console.log('Datos a enviar:', datosParaEnviar);

            const url = itemEditando
                ? `/api/magic/contactos-agencia/${obtenerIdItem(itemEditando)}`
                : `/api/magic/contactos-agencia`;

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
                    `Contacto ${itemEditando ? 'actualizado' : 'creado'} exitosamente`
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

    // Ejecutar acción - CORREGIDO PARA MANEJAR ERROR 409
    const ejecutarAccion = async () => {
        if (!itemConfirmacion) return;

        try {
            setLoadingAction(true);
            const itemId = obtenerIdItem(itemConfirmacion);

            let response;
            let url;

            switch (accionConfirmacion) {
                case 'activar':
                    url = `/api/magic/contactos-agencia/${itemId}/activate`;
                    response = await fetch(url, {
                        method: 'PATCH',
                        headers: {
                            'Accept': 'application/json',
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                        }
                    });
                    break;

                case 'desactivar':
                    url = `/api/magic/contactos-agencia/${itemId}/deactivate`;
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
                        contactos_agencia_nombres: itemConfirmacion.contactos_agencia_nombres || itemConfirmacion.nombres,
                        contactos_agencia_apellidos: itemConfirmacion.contactos_agencia_apellidos || itemConfirmacion.apellidos,
                        contactos_agencia_cargo: itemConfirmacion.contactos_agencia_cargo || itemConfirmacion.cargo,
                        contactos_agencia_telefono: '', // Teléfono vacío para evitar duplicados
                        agencia_id: itemConfirmacion.agencia_id || itemConfirmacion.agencia?.id,
                        contactos_agencia_situacion: 1
                    };

                    url = `/api/magic/contactos-agencia`;
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
                    activar: 'Contacto activado exitosamente',
                    desactivar: 'Contacto desactivado exitosamente',
                    duplicar: 'Contacto duplicado exitosamente'
                };

                Notifications.success(mensajes[accionConfirmacion]);
                setModalConfirmacion(false);
                cargarDatos();
            } else {
                const errorData = await response.json();

                // MANEJO ESPECÍFICO PARA ERROR 409 (CONFLICT)
                if (response.status === 409) {
                    Notifications.error(
                        errorData.message || 'No se puede realizar esta acción debido a restricciones del sistema',
                        'Restricción del Sistema'
                    );
                } else {
                    Notifications.error(`Error al ${accionConfirmacion}: ${errorData.message || 'Error desconocido'}`);
                }
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
                }, 'Gestión de Contactos de Agencia'),
                e('p', {
                    style: {
                        color: '#6b7280',
                        margin: '0.25rem 0 0 0',
                        fontSize: '1rem'
                    }
                }, `${datosActuales.length} de ${totalDatos} contactos encontrados`)
            ]),
            BotonesUniversal.nuevo({
                onClick: () => abrirModalFormulario(),
                texto: 'Nuevo Contacto',
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

                                        (item.contactos_agencia_codigo || item.codigo) && BotonesUniversal.badge({
                                            texto: item.contactos_agencia_codigo || item.codigo,
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
                    }, 'No hay contactos que coincidan con los filtros')
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
            tipoItem: 'contacto',
            campos: generarCamposFormulario(),
            esEdicion: !!itemEditando
        }),

        ModalUniversal.confirmacion({
            abierto: modalConfirmacion,
            cerrar: () => setModalConfirmacion(false),
            ejecutar: ejecutarAccion,
            accion: accionConfirmacion,
            item: itemConfirmacion,
            tipoItem: 'contacto',
            loading: loadingAction,
            nombreItem: itemConfirmacion ? obtenerNombreItem(itemConfirmacion) : ''
        }),

        ModalUniversal.detalles({
            abierto: modalDetalles,
            cerrar: () => setModalDetalles(false),
            item: itemDetalles,
            tipoItem: 'contacto'
        })
    ]);
}

export default GestionContactoAgencias;
