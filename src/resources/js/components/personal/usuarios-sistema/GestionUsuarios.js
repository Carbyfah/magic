// src/resources/js/components/personal/usuarios-sistema/GestionUsuarios.js
import React from 'react';
import Icons from '../../../utils/Icons';
import Notifications from '../../../utils/notifications';
import ModalUniversal from '../../common/ModalUniversal';
import BotonesUniversal from '../../common/BotonesUniversal';

// IMPORTAR EL NUEVO SISTEMA REUTILIZABLE
import useTableData from '../../common/useTableData';
import TableControls from '../../common/TableControls';
import TablePagination from '../../common/TablePagination';
import { usuariosConfig } from './usuariosConfig';

import apiHelper from '../../../utils/apiHelper';

const { createElement: e, useState, useEffect } = React;

function GestionUsuarios() {
    // Estados principales
    const [usuarios, setUsuarios] = useState([]);
    const [personas, setPersonas] = useState([]);
    const [roles, setRoles] = useState([]);
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
    const currentConfig = usuariosConfig.usuarios;
    const currentRawData = usuarios;

    const tableData = useTableData(currentConfig, currentRawData);

    // Efectos principales
    useEffect(() => {
        cargarDatos();
    }, []);

    // Función para cargar datos desde API
    const cargarDatos = async () => {
        try {
            setLoading(true);
            const [usuariosRes, personasRes, rolesRes] = await Promise.all([
                apiHelper.usuarios.getAll(),
                apiHelper.get('/personas'),
                apiHelper.roles.getAll()
            ]);

            // Procesar usuarios
            try {
                const usuariosData = await apiHelper.handleResponse(usuariosRes);
                setUsuarios(usuariosData.data || usuariosData);
                console.log('Usuarios cargados:', (usuariosData.data || usuariosData).length, 'items');
            } catch (error) {
                console.error('Error al cargar usuarios:', error);
                Notifications.error(`Error al cargar usuarios: ${error.message}`);
            }

            // Procesar personas
            try {
                const personasData = await apiHelper.handleResponse(personasRes);
                setPersonas(personasData.data || personasData);
                console.log('Personas cargadas:', (personasData.data || personasData).length, 'items');
            } catch (error) {
                console.error('Error al cargar personas:', error);
                Notifications.error(`Error al cargar personas: ${error.message}`);
            }

            // Procesar roles
            try {
                const rolesData = await apiHelper.handleResponse(rolesRes);
                setRoles(rolesData.data || rolesData);
                console.log('Roles cargados:', (rolesData.data || rolesData).length, 'items');
            } catch (error) {
                console.error('Error al cargar roles:', error);
                Notifications.error(`Error al cargar roles: ${error.message}`);
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

        if (itemEditando && itemEditando.usuario_codigo) {
            campos.push({
                nombre: 'usuario_codigo',
                tipo: 'text',
                requerido: false,
                opciones: [],
                placeholder: 'Código del usuario',
                soloLectura: true,
                ancho: 'completo',
                label: 'Código del usuario'
            });
        }

        campos.push({
            nombre: 'persona_id',
            tipo: 'select',
            searchable: true,
            requerido: true,
            opciones: personas.map(persona => ({
                value: persona.id,
                label: persona.nombre_completo
            })),
            placeholder: 'Seleccione el empleado',
            soloLectura: false,
            ancho: 'medio',
            label: 'Empleado'
        });

        campos.push({
            nombre: 'rol_id',
            tipo: 'select',
            searchable: true,
            requerido: true,
            opciones: roles.map(rol => ({
                value: rol.rol_id,
                label: rol.rol_rol
            })),
            placeholder: 'Seleccione el rol',
            soloLectura: false,
            ancho: 'medio',
            label: 'Rol'
        });

        campos.push({
            nombre: 'usuario_password',
            tipo: 'password',
            requerido: !itemEditando, // Solo requerido al crear
            opciones: [],
            placeholder: 'Mínimo 8 caracteres',
            soloLectura: false,
            ancho: 'completo',
            label: itemEditando ? 'Nueva Contraseña (dejar vacío para mantener)' : 'Contraseña'
        });

        return campos;
    };

    // Renderizar item de lista
    const renderizarItem = (item) => {
        const camposImportantes = [
            { campo: 'nombre_completo', label: 'Empleado' },
            { campo: 'rol', label: 'Rol', tipo: 'objeto' },
            { campo: 'iniciales', label: 'Iniciales' }
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

    // Funciones auxiliares
    const obtenerNombreItem = (item) => {
        return item.nombre_completo || item.codigo || `Usuario #${item.usuario_id}`;
    };

    const obtenerIdItem = (item) => {
        return item.usuario_id || item.id;
    };

    const obtenerEstadoItem = (item) => {
        const status = item.activo;
        return status === true || status === 1 || status === '1';
    };

    // Funciones de gestión de modales
    const abrirModalFormulario = (item = null) => {
        setItemEditando(item);
        if (item) {
            setFormulario({
                usuario_codigo: item.usuario_codigo || item.codigo,
                persona_id: item.persona_id || item.persona?.id,
                rol_id: item.rol_id || item.rol?.id,
                usuario_password: '' // Siempre vacío para edición
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
        const nuevosErrores = await currentConfig.validateForm(formulario, itemEditando?.usuario_id);
        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    // Guardar item
    const guardarItem = async () => {
        const formularioValido = await validarFormulario();
        if (!formularioValido) return;

        try {
            setLoadingAction(true);

            const datosParaEnviar = { ...formulario };

            // Para edición, no enviar contraseña vacía
            if (itemEditando && !datosParaEnviar.usuario_password.trim()) {
                delete datosParaEnviar.usuario_password;
            }

            if (!itemEditando) {
                datosParaEnviar.usuario_situacion = 1;
            } else {
                if (datosParaEnviar.usuario_situacion === undefined) {
                    datosParaEnviar.usuario_situacion = itemEditando.usuario_situacion || 1;
                }
            }

            console.log('Datos a enviar:', datosParaEnviar);

            const response = itemEditando
                ? await apiHelper.put(`/usuarios/${obtenerIdItem(itemEditando)}`, datosParaEnviar)
                : await apiHelper.post('/usuarios', datosParaEnviar);

            const data = await apiHelper.handleResponse(response);

            if (response.ok) {
                Notifications.success(
                    `Usuario ${itemEditando ? 'actualizado' : 'creado'} exitosamente`
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
                    response = await apiHelper.patch(`/usuarios/${itemId}/activate`);
                    break;

                case 'desactivar':
                    response = await apiHelper.patch(`/usuarios/${itemId}/deactivate`);
                    break;

                case 'duplicar':
                    const itemDuplicado = {
                        persona_id: itemConfirmacion.persona_id || itemConfirmacion.persona?.id,
                        rol_id: itemConfirmacion.rol_id || itemConfirmacion.rol?.id,
                        usuario_password: 'temporal123', // Contraseña temporal para duplicado
                        usuario_situacion: 1
                    };

                    response = await apiHelper.post('/usuarios', itemDuplicado);
                    break;

                default:
                    return;
            }

            const data = await apiHelper.handleResponse(response);

            if (response.ok) {
                const mensajes = {
                    activar: 'Usuario activado exitosamente',
                    desactivar: 'Usuario desactivado exitosamente',
                    duplicar: 'Usuario duplicado exitosamente (contraseña temporal: temporal123)'
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
                }, 'Gestión de Usuarios Sistema'),
                e('p', {
                    style: {
                        color: '#6b7280',
                        margin: '0.25rem 0 0 0',
                        fontSize: '1rem'
                    }
                }, `${datosActuales.length} de ${totalDatos} usuarios encontrados`)
            ]),
            BotonesUniversal.nuevo({
                onClick: () => abrirModalFormulario(),
                texto: 'Nuevo Usuario',
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

                                        (item.usuario_codigo || item.codigo) && BotonesUniversal.badge({
                                            texto: item.usuario_codigo || item.codigo,
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
                    }, 'No hay usuarios que coincidan con los filtros')
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
            tipoItem: 'usuario',
            campos: generarCamposFormulario(),
            esEdicion: !!itemEditando
        }),

        ModalUniversal.confirmacion({
            abierto: modalConfirmacion,
            cerrar: () => setModalConfirmacion(false),
            ejecutar: ejecutarAccion,
            accion: accionConfirmacion,
            item: itemConfirmacion,
            tipoItem: 'usuario',
            loading: loadingAction,
            nombreItem: itemConfirmacion ? obtenerNombreItem(itemConfirmacion) : ''
        }),

        ModalUniversal.detalles({
            abierto: modalDetalles,
            cerrar: () => setModalDetalles(false),
            item: itemDetalles,
            tipoItem: 'usuario'
        })
    ]);
}

export default GestionUsuarios;
