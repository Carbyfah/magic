// src/resources/js/components/operacion/tours-activados/GestionToursActivados.js
import React from 'react';
import Icons from '../../../utils/Icons';
import Notifications from '../../../utils/notifications';
import ModalUniversal from '../../common/ModalUniversal';
import BotonesUniversal from '../../common/BotonesUniversal';

// IMPORTAR EL NUEVO SISTEMA REUTILIZABLE
import useTableData from '../../common/useTableData';
import TableControls from '../../common/TableControls';
import TablePagination from '../../common/TablePagination';
import { toursActivadosConfig } from './toursActivadosConfig';

import apiHelper from '../../../utils/apiHelper';

const { createElement: e, useState, useEffect } = React;

function GestionToursActivados() {
    // Estados principales
    const [toursActivados, setToursActivados] = useState([]);
    const [personas, setPersonas] = useState([]);
    const [estados, setEstados] = useState([]);
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

    // NUEVO: Estados para notificaciones inteligentes
    const [notificacionesTours, setNotificacionesTours] = useState({});
    const [loadingNotificaciones, setLoadingNotificaciones] = useState(false);

    // INTEGRAR EL NUEVO SISTEMA REUTILIZABLE
    const currentConfig = toursActivadosConfig.toursActivados;
    const currentRawData = toursActivados;

    const tableData = useTableData(currentConfig, currentRawData);

    // Efectos principales
    useEffect(() => {
        cargarDatos();
        validarEstados(); // NUEVO: Validar estados al cargar
    }, []);

    // NUEVO: Cargar notificaciones automáticamente después de cargar tours
    useEffect(() => {
        if (toursActivados.length > 0) {
            cargarNotificacionesInteligentes();
        }
    }, [toursActivados]);

    // NUEVO: SISTEMA DE VALIDACIÓN DE ESTADOS
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

    // NUEVO: Función para cargar notificaciones inteligentes
    const cargarNotificacionesInteligentes = async () => {
        try {
            setLoadingNotificaciones(true);
            const notificaciones = {};

            // Cargar notificaciones para cada tour activo
            const toursActivos = toursActivados.filter(tour =>
                tour.activo && tour.estado &&
                !currentConfig.stateDetection?.cerrado(tour.estado)
            );

            const promesasNotificaciones = toursActivos.map(async (tour) => {
                try {
                    const response = await fetch(`/api/magic/tours-activados/${tour.id}/notificaciones`);
                    if (response.ok) {
                        const data = await response.json();
                        return { id: tour.id, notificaciones: data.notificaciones || [] };
                    }
                } catch (error) {
                    console.warn(`Error cargando notificaciones para tour ${tour.id}:`, error);
                }
                return { id: tour.id, notificaciones: [] };
            });

            const resultados = await Promise.all(promesasNotificaciones);

            resultados.forEach(({ id, notificaciones: notifs }) => {
                if (notifs.length > 0) {
                    notificaciones[id] = notifs;
                }
            });

            setNotificacionesTours(notificaciones);
        } catch (error) {
            console.warn('Error general cargando notificaciones:', error);
        } finally {
            setLoadingNotificaciones(false);
        }
    };

    // NUEVO: Renderizar notificaciones de un tour
    const renderizarNotificaciones = (tour) => {
        const notificaciones = notificacionesTours[tour.id] || [];

        if (notificaciones.length === 0) return null;

        return e('div', {
            style: {
                marginTop: '0.75rem',
                padding: '0.75rem',
                backgroundColor: '#fef3c7',
                borderRadius: '6px',
                border: '1px solid #f59e0b'
            }
        }, [
            e('div', {
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.5rem'
                }
            }, [
                Icons.alertTriangle('#f59e0b'),
                e('strong', {
                    style: { fontSize: '0.875rem', color: '#92400e' }
                }, 'Notificaciones del sistema:')
            ]),
            e('div', {
                style: { display: 'flex', flexDirection: 'column', gap: '0.25rem' }
            }, notificaciones.map((notif, idx) =>
                e('div', {
                    key: idx,
                    style: {
                        fontSize: '0.75rem',
                        color: '#92400e',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }
                }, [
                    e('span', {
                        style: {
                            width: '4px',
                            height: '4px',
                            backgroundColor: '#f59e0b',
                            borderRadius: '50%'
                        }
                    }),
                    notif.mensaje || notif
                ])
            ))
        ]);
    };

    // NUEVO: Función para obtener el color del estado según la lógica de negocio
    const obtenerColorEstado = (tour) => {
        if (!tour.estado || !tour.estado.estado_estado) return 'gris';

        if (currentConfig.stateDetection?.activado && currentConfig.stateDetection.activado(tour.estado)) return 'azul';
        if (currentConfig.stateDetection?.ejecucion && currentConfig.stateDetection.ejecucion(tour.estado)) return 'verde';
        if (currentConfig.stateDetection?.cerrado && currentConfig.stateDetection.cerrado(tour.estado)) return 'gris';

        return 'gris';
    };

    // NUEVO: Función para obtener texto del estado
    const obtenerTextoEstado = (tour) => {
        if (!tour.estado || !tour.estado.estado_estado) return 'Sin estado';
        return tour.estado.estado_estado;
    };

    // Función para cargar datos desde API
    const cargarDatos = async () => {
        try {
            setLoading(true);
            const [toursRes, personasRes, estadosRes, serviciosRes] = await Promise.all([
                apiHelper.toursActivados.getAll(),
                apiHelper.get('/personas'),
                apiHelper.get('/estados/contexto/ruta-activada'),
                apiHelper.servicios.getAll()
            ]);

            // Procesar tours activados
            try {
                const toursData = await apiHelper.handleResponse(toursRes);
                setToursActivados(toursData.data || toursData);
                console.log('Tours activados cargados:', (toursData.data || toursData).length, 'items');
            } catch (error) {
                console.error('Error al cargar tours activados:', error);
                Notifications.error(`Error al cargar tours activados: ${error.message}`);
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

            // Procesar estados
            try {
                const estadosData = await apiHelper.handleResponse(estadosRes);
                setEstados(estadosData.data || estadosData);
                console.log('Estados contextuales cargados:', (estadosData.data || estadosData).length, 'items');
            } catch (error) {
                console.error('Error al cargar estados:', error);
                Notifications.error(`Error al cargar estados: ${error.message}`);
            }

            // Procesar servicios
            try {
                const serviciosData = await apiHelper.handleResponse(serviciosRes);
                setServicios(serviciosData.data || serviciosData);
                console.log('Servicios cargados:', (serviciosData.data || serviciosData).length, 'items');
            } catch (error) {
                console.error('Error al cargar servicios:', error);
                Notifications.error(`Error al cargar servicios: ${error.message}`);
            }

        } catch (error) {
            console.error('Error de conexión:', error);
            Notifications.error('Error de conexión al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    // Obtener estado por tipo usando la configuración
    const obtenerEstadoPorTipo = (tipo) => {
        return estados.find(estado => {
            const detector = currentConfig.stateDetection?.[tipo];
            return detector && detector(estado);
        });
    };

    // Generar campos de formulario
    const generarCamposFormulario = () => {
        const campos = [];

        if (itemEditando && itemEditando.codigo) {
            campos.push({
                nombre: 'codigo',
                tipo: 'text',
                requerido: false,
                opciones: [],
                placeholder: 'Código del tour',
                soloLectura: true,
                ancho: 'completo',
                label: 'Código del Tour'
            });
        }

        // INFORMACIÓN BÁSICA DEL TOUR
        campos.push({
            nombre: 'fecha_hora',
            tipo: 'datetime-local',
            requerido: true,
            opciones: [],
            placeholder: 'Seleccionar fecha y hora del tour',
            soloLectura: false,
            ancho: 'completo',
            label: 'Fecha y Hora del Tour'
        });

        campos.push({
            nombre: 'servicio_id',
            tipo: 'select',
            searchable: true,
            requerido: true,
            opciones: servicios
                .filter(servicio => servicio.activo === true)
                .map(servicio => ({
                    value: servicio.servicio_id,
                    label: servicio.servicio_servicio
                })),
            placeholder: 'Seleccione el servicio',
            soloLectura: false,
            ancho: 'completo',
            label: 'Servicio'
        });

        campos.push({
            nombre: 'descripcion',
            tipo: 'textarea',
            requerido: false,
            opciones: [],
            placeholder: 'Descripción opcional del tour',
            soloLectura: false,
            ancho: 'completo',
            label: 'Descripción'
        });

        campos.push({
            nombre: 'punto_encuentro',
            tipo: 'text',
            requerido: false,
            opciones: [],
            placeholder: 'Lugar donde se reunirán los turistas',
            soloLectura: false,
            ancho: 'medio',
            label: 'Punto de Encuentro'
        });

        campos.push({
            nombre: 'duracion_horas',
            tipo: 'number',
            requerido: false,
            opciones: [],
            placeholder: '2.5',
            soloLectura: false,
            ancho: 'medio',
            label: 'Duración (Horas)',
            min: 0,
            max: 24,
            step: 0.5
        });

        // ASIGNACIONES
        campos.push({
            nombre: 'persona_id',
            tipo: 'select',
            searchable: true,
            requerido: false,
            opciones: [
                { value: '', label: 'Guía Externo' },
                ...personas
                    .filter(persona => persona.activo === true)
                    .map(persona => ({
                        value: persona.persona_id,
                        label: persona.persona_nombres + ' ' + persona.persona_apellidos
                    }))
            ],
            placeholder: 'Opcional - Dejar vacío para guía externo',
            soloLectura: false,
            ancho: 'medio',
            label: 'Guía Interno (Opcional)'
        });

        campos.push({
            nombre: 'estado_id',
            tipo: 'select',
            searchable: true,
            requerido: true,
            opciones: estados.map(estado => ({
                value: estado.estado_id,
                label: estado.estado_estado
            })),
            placeholder: 'Seleccione el estado',
            soloLectura: false,
            ancho: 'medio',
            label: 'Estado'
        });

        return campos;
    };

    // Renderizar item de lista - ACTUALIZADO con notificaciones y estados
    const renderizarItem = (item) => {
        const camposImportantes = [
            { campo: 'codigo', label: 'Código', tipo: 'texto' },
            { campo: 'fecha_completa', label: 'Fecha y Hora', tipo: 'fecha' },
            { campo: 'servicio', label: 'Servicio', tipo: 'objeto' },
            { campo: 'descripcion', label: 'Descripción', tipo: 'texto' },
            { campo: 'punto_encuentro', label: 'Punto de Encuentro', tipo: 'texto' },
            { campo: 'duracion_horas', label: 'Duración', tipo: 'duracion' },
            { campo: 'guia', label: 'Guía', tipo: 'guia' },
            { campo: 'estado', label: 'Estado', tipo: 'estado' }
        ];

        return e('div', {
            style: { display: 'flex', flexDirection: 'column', gap: '0.75rem' }
        }, [
            // Información básica
            e('div', {
                style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '1rem',
                    color: '#6b7280',
                    fontSize: '0.875rem'
                }
            }, camposImportantes.map(({ campo, label, tipo }) => {
                let valor = item[campo];
                let contenidoFormateado;

                if (tipo === 'fecha' && valor) {
                    contenidoFormateado = new Date(valor).toLocaleString();
                } else if (tipo === 'duracion' && valor) {
                    const horas = Math.floor(valor);
                    const minutos = Math.round((valor - horas) * 60);
                    contenidoFormateado = minutos === 0 ? `${horas}h` : `${horas}h ${minutos}m`;
                } else if (tipo === 'guia') {
                    contenidoFormateado = valor ?
                        `${valor.persona_nombres} ${valor.persona_apellidos}` :
                        'Guía Externo';
                } else if (tipo === 'estado' && valor) {
                    // NUEVO: Renderizado especial para estados
                    const colorEstado = obtenerColorEstado(item);
                    const textoEstado = obtenerTextoEstado(item);

                    contenidoFormateado = BotonesUniversal.badge({
                        texto: textoEstado,
                        color: colorEstado
                    });
                } else if (tipo === 'objeto' && valor) {
                    contenidoFormateado = valor.servicio_servicio || valor.nombre || String(valor);
                } else if (tipo !== 'estado') {
                    contenidoFormateado = String(valor || 'N/A');
                }

                return e('div', { key: campo }, [
                    e('strong', { key: `label-${campo}` }, `${label}: `),
                    tipo === 'estado' ? contenidoFormateado : contenidoFormateado
                ]);
            })),

            // NUEVO: Notificaciones inteligentes
            renderizarNotificaciones(item)
        ]);
    };

    // Funciones auxiliares
    const obtenerNombreItem = (item) => {
        return item.codigo || `Tour #${item.id}`;
    };

    const obtenerIdItem = (item) => {
        return item.id;
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
                codigo: item.codigo,
                fecha_hora: item.fecha_hora ? item.fecha_hora.slice(0, 16) : '',
                descripcion: item.descripcion,
                punto_encuentro: item.punto_encuentro,
                duracion_horas: item.duracion_horas,
                persona_id: item.persona_id || '',
                servicio_id: item.servicio_id,
                estado_id: item.estado_id
            });
        } else {
            // Buscar estado activado dinámicamente
            const estadoActivado = obtenerEstadoPorTipo('activado');

            setFormulario({
                duracion_horas: 2.0,
                estado_id: estadoActivado?.estado_id || estados[0]?.estado_id || 1,
                persona_id: ''
            });
        }
        setErrores({});
        setModalFormulario(true);
    };

    // ACTUALIZADO - Manejo de cambios con validaciones inteligentes
    const manejarCambioFormulario = (campo, valor) => {
        console.log('Campo cambiado:', campo, 'Valor:', valor);
        setFormulario(prev => ({ ...prev, [campo]: valor }));
        if (errores[campo]) {
            setErrores(prev => ({ ...prev, [campo]: '' }));
        }

        // NUEVO: Validaciones inteligentes para cambios de estado
        if (campo === 'estado_id' && valor && itemEditando) {
            const estadoSeleccionado = estados.find(e => e.estado_id == valor);
            if (estadoSeleccionado && itemEditando.estado) {
                console.log('Cambio de estado detectado para tour');
            }
        }

        // Validar duración
        if (campo === 'duracion_horas' && valor) {
            const duracion = parseFloat(valor);
            if (isNaN(duracion) || duracion < 0 || duracion > 24) {
                setErrores(prev => ({ ...prev, [campo]: 'La duración debe estar entre 0 y 24 horas' }));
            }
        }
    };

    // Validación del formulario - ACTUALIZADA con validaciones inteligentes
    const validarFormulario = async () => {
        console.log('=== VALIDANDO FORMULARIO TOURS ===');
        console.log('Formulario completo:', Object.keys(formulario));

        const nuevosErrores = await currentConfig.validateForm(formulario, itemEditando?.id);

        console.log('Errores de validación:', nuevosErrores);

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    // Guardar item - CON REFRESCO DE NOTIFICACIONES
    const guardarItem = async () => {
        console.log('=== INICIANDO GUARDAR TOUR ===');
        console.log('Formulario actual:', formulario);

        const formularioValido = await validarFormulario();
        console.log('Formulario válido:', formularioValido);
        console.log('Errores encontrados:', errores);

        if (!formularioValido) {
            console.log('GUARDAR CANCELADO - Formulario inválido');
            return;
        }

        console.log('Continuando con el guardado...');

        try {
            setLoadingAction(true);

            const datosParaEnviar = currentConfig.processBeforeSave({ ...formulario });

            if (!itemEditando) {
                datosParaEnviar.tour_activado_situacion = 1;
            } else {
                if (datosParaEnviar.tour_activado_situacion === undefined) {
                    datosParaEnviar.tour_activado_situacion = itemEditando.tour_activado_situacion || 1;
                }
            }

            // Convertir persona_id vacío a null
            if (datosParaEnviar.persona_id === '') {
                datosParaEnviar.persona_id = null;
            }

            console.log('Datos a enviar:', datosParaEnviar);

            const url = itemEditando
                ? `/api/magic/tours-activados/${obtenerIdItem(itemEditando)}`
                : `/api/magic/tours-activados`;

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
                const data = await response.json();
                console.log('Respuesta del servidor:', data);

                Notifications.success(
                    `Tour ${itemEditando ? 'actualizado' : 'creado'} exitosamente`
                );
                setModalFormulario(false);
                cargarDatos(); // Esto recargará las notificaciones automáticamente
            } else {
                const errorData = await response.json();
                if (errorData.errors) {
                    setErrores(errorData.errors);
                    Notifications.error('Por favor corrige los errores en el formulario');
                } else {
                    Notifications.error(`Error al guardar: ${errorData.message || response.status}`);
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

    // Ejecutar acción individual
    const ejecutarAccion = async () => {
        if (!itemConfirmacion) return;

        try {
            setLoadingAction(true);
            const itemId = obtenerIdItem(itemConfirmacion);

            let response;
            let url;

            switch (accionConfirmacion) {
                case 'activar':
                    url = `/api/magic/tours-activados/${itemId}/activate`;
                    response = await fetch(url, {
                        method: 'PATCH',
                        headers: {
                            'Accept': 'application/json',
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                        }
                    });
                    break;

                case 'desactivar':
                    url = `/api/magic/tours-activados/${itemId}/deactivate`;
                    response = await fetch(url, {
                        method: 'PATCH',
                        headers: {
                            'Accept': 'application/json',
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                        }
                    });
                    break;

                case 'duplicar':
                    const estadoActivado = obtenerEstadoPorTipo('activado');
                    const itemDuplicado = {
                        tour_activado_fecha_hora: itemConfirmacion.fecha_hora,
                        tour_activado_descripcion: itemConfirmacion.descripcion ? `Duplicado: ${itemConfirmacion.descripcion}` : 'Tour duplicado',
                        tour_activado_punto_encuentro: itemConfirmacion.punto_encuentro,
                        tour_activado_duracion_horas: itemConfirmacion.duracion_horas,
                        persona_id: itemConfirmacion.persona_id,
                        servicio_id: itemConfirmacion.servicio_id,
                        estado_id: estadoActivado?.estado_id || estados[0]?.estado_id,
                        tour_activado_situacion: 1
                    };

                    url = `/api/magic/tours-activados`;
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
                    duplicar: 'Tour duplicado exitosamente',
                    activar: 'Tour activado exitosamente',
                    desactivar: 'Tour desactivado exitosamente'
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

    const datosActuales = tableData.data;
    const totalDatos = toursActivados.length;

    return e('div', {
        style: { padding: '1.5rem', maxWidth: '100%', minHeight: '100vh' }
    }, [
        // Header con indicador de notificaciones
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
                e('div', {
                    style: { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }
                }, [
                    e('h1', {
                        style: {
                            fontSize: '2rem',
                            fontWeight: '700',
                            color: '#111827',
                            margin: '0'
                        }
                    }, 'Gestión de Tours Activados'),

                    // NUEVO: Indicador de notificaciones
                    Object.keys(notificacionesTours).length > 0 && e('div', {
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 0.75rem',
                            backgroundColor: '#fef3c7',
                            borderRadius: '8px',
                            border: '1px solid #f59e0b'
                        }
                    }, [
                        Icons.alertTriangle('#f59e0b'),
                        e('span', {
                            style: {
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                color: '#92400e'
                            }
                        }, `${Object.keys(notificacionesTours).length} tours con notificaciones`)
                    ])
                ]),
                e('p', {
                    style: {
                        color: '#6b7280',
                        margin: '0.25rem 0 0 0',
                        fontSize: '1rem'
                    }
                }, `${datosActuales.length} de ${totalDatos} tours activados encontrados`)
            ]),
            e('div', {
                key: 'actions-section',
                style: { display: 'flex', gap: '1rem' }
            }, [
                BotonesUniversal.nuevo({
                    onClick: () => abrirModalFormulario(),
                    texto: 'Nuevo Tour Activado',
                    loading: loading
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
                        const esActivo = obtenerEstadoItem(item);
                        const tieneNotificaciones = notificacionesTours[item.id] && notificacionesTours[item.id].length > 0;

                        return e('div', {
                            key: `item-${itemId}`,
                            style: {
                                padding: '1.5rem',
                                borderBottom: index < datosActuales.length - 1 ?
                                    '1px solid #f3f4f6' : 'none',
                                // NUEVO: Resaltar tours con notificaciones
                                backgroundColor: tieneNotificaciones ? '#fffbeb' : 'white'
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

                                        item.codigo && BotonesUniversal.badge({
                                            texto: item.codigo,
                                            color: 'gris',
                                            key: `badge-codigo-${itemId}`
                                        }),

                                        BotonesUniversal.badge({
                                            texto: esActivo ? 'Activo' : 'Inactivo',
                                            color: esActivo ? 'verde' : 'rojo',
                                            key: `badge-estado-${itemId}`
                                        }),

                                        // Badge para tipo de guía
                                        BotonesUniversal.badge({
                                            texto: item.persona_id ? 'GUÍA INTERNO' : 'GUÍA EXTERNO',
                                            color: item.persona_id ? 'azul' : 'morado',
                                            key: `badge-guia-${itemId}`
                                        }),

                                        // NUEVO: Badge de notificación
                                        tieneNotificaciones && BotonesUniversal.badge({
                                            texto: `${notificacionesTours[item.id].length} notificaciones`,
                                            color: 'naranja',
                                            key: `badge-notif-${itemId}`
                                        })
                                    ]),

                                    e('div', {
                                        key: `item-fields-${itemId}`
                                    }, renderizarItem(item))
                                ]),

                                e('div', {
                                    key: `item-actions-${itemId}`,
                                    style: {
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.5rem'
                                    }
                                }, [
                                    // Acciones básicas
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
                    }, 'No hay tours activados que coincidan con los filtros')
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
            tipoItem: 'tour activado',
            campos: generarCamposFormulario(),
            esEdicion: !!itemEditando
        }),

        ModalUniversal.confirmacion({
            abierto: modalConfirmacion,
            cerrar: () => setModalConfirmacion(false),
            ejecutar: ejecutarAccion,
            accion: accionConfirmacion,
            item: itemConfirmacion,
            tipoItem: 'tour activado',
            loading: loadingAction,
            nombreItem: itemConfirmacion ? obtenerNombreItem(itemConfirmacion) : ''
        }),

        ModalUniversal.detalles({
            abierto: modalDetalles,
            cerrar: () => setModalDetalles(false),
            item: itemDetalles,
            tipoItem: 'tour activado',
            camposExcluir: currentConfig.camposDetalles?.excluir || [
                'created_at', 'updated_at', 'deleted_at', 'tour_activado_situacion',
                'fecha_completa', 'fecha_formateada', 'fecha_iso', 'activo'
            ]
        })
    ]);
}

export default GestionToursActivados;
