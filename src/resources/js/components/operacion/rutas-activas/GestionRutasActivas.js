// src/resources/js/components/operacion/rutas-activas/GestionRutasActivas.js
import React from 'react';
import Icons from '../../../utils/Icons';
import Notifications from '../../../utils/notifications';
import ModalUniversal from '../../common/ModalUniversal';
import BotonesUniversal from '../../common/BotonesUniversal';

// IMPORTAR EL NUEVO SISTEMA REUTILIZABLE
import useTableData from '../../common/useTableData';
import TableControls from '../../common/TableControls';
import TablePagination from '../../common/TablePagination';
import { rutasActivasConfig } from './rutasActivasConfig';

import apiHelper from '../../../utils/apiHelper';

const { createElement: e, useState, useEffect } = React;

function GestionRutasActivas() {
    // Estados principales
    const [rutasActivadas, setRutasActivadas] = useState([]);
    const [personas, setPersonas] = useState([]);
    const [estados, setEstados] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [rutas, setRutas] = useState([]);
    const [vehiculos, setVehiculos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingAction, setLoadingAction] = useState(false);

    // Estados de modales
    const [modalFormulario, setModalFormulario] = useState(false);
    const [modalConfirmacion, setModalConfirmacion] = useState(false);
    const [modalDetalles, setModalDetalles] = useState(false);
    const [modalCerrarRuta, setModalCerrarRuta] = useState(false); // NUEVO

    // Estados de datos específicos
    const [itemEditando, setItemEditando] = useState(null);
    const [itemConfirmacion, setItemConfirmacion] = useState(null);
    const [accionConfirmacion, setAccionConfirmacion] = useState(null);
    const [itemDetalles, setItemDetalles] = useState(null);
    const [rutaCerrando, setRutaCerrando] = useState(null); // NUEVO

    // Estados del formulario
    const [formulario, setFormulario] = useState({});
    const [errores, setErrores] = useState({});

    // NUEVO: Estado para filtro por tipo de estado
    const [filtroEstadoActivo, setFiltroEstadoActivo] = useState(null);

    // NUEVO: Estados para notificaciones inteligentes
    const [notificacionesRutas, setNotificacionesRutas] = useState({});
    const [loadingNotificaciones, setLoadingNotificaciones] = useState(false);

    // INTEGRAR EL NUEVO SISTEMA REUTILIZABLE
    const currentConfig = rutasActivasConfig.rutasActivadas;
    const currentRawData = rutasActivadas;

    const tableData = useTableData(currentConfig, currentRawData);

    // Efectos principales
    useEffect(() => {
        cargarDatos();
        validarEstados(); // NUEVO: Validar estados al cargar
    }, []);

    // NUEVO: Cargar notificaciones automáticamente después de cargar rutas
    useEffect(() => {
        if (rutasActivadas.length > 0) {
            cargarNotificacionesInteligentes();
        }
    }, [rutasActivadas]);

    // NUEVO: SISTEMA DE VALIDACIÓN DE ESTADOS - IGUAL QUE VEHÍCULOS
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

            // Cargar notificaciones para cada ruta activa
            const rutasActivas = rutasActivadas.filter(ruta =>
                ruta.activo && ruta.estado &&
                !currentConfig.stateDetection.cerrada(ruta.estado)
            );

            const promesasNotificaciones = rutasActivas.map(async (ruta) => {
                try {
                    // const response = await fetch(`/api/magic/rutas-activadas/${ruta.id}/notificaciones`);
                    const response = await apiHelper.get(`/rutas-activadas/${ruta.id}/notificaciones`);
                    if (response.ok) {
                        const data = await response.json();
                        return { id: ruta.id, notificaciones: data.notificaciones || [] };
                    }
                } catch (error) {
                    console.warn(`Error cargando notificaciones para ruta ${ruta.id}:`, error);
                }
                return { id: ruta.id, notificaciones: [] };
            });

            const resultados = await Promise.all(promesasNotificaciones);

            resultados.forEach(({ id, notificaciones: notifs }) => {
                if (notifs.length > 0) {
                    notificaciones[id] = notifs;
                }
            });

            setNotificacionesRutas(notificaciones);
        } catch (error) {
            console.warn('Error general cargando notificaciones:', error);
        } finally {
            setLoadingNotificaciones(false);
        }
    };

    // Cargar datos API
    const cargarDatos = async () => {
        try {
            setLoading(true);
            const [rutasActivadasRes, usuariosRes, estadosRes, serviciosRes, rutasRes, vehiculosRes] = await Promise.all([
                apiHelper.get('/rutas-activadas'),
                apiHelper.get('/personas'),
                apiHelper.get('/estados/contexto/ruta-activada'),
                apiHelper.servicios.getAll(),
                apiHelper.rutas.getAll(),
                apiHelper.vehiculos.getAll()
            ]);

            // Procesar rutas activadas
            try {
                const rutasActivadasData = await apiHelper.handleResponse(rutasActivadasRes);
                setRutasActivadas(rutasActivadasData.data || rutasActivadasData);
                console.log('Rutas activadas cargadas:', (rutasActivadasData.data || rutasActivadasData).length, 'items');
            } catch (error) {
                console.error('Error al cargar rutas activadas:', error);
                Notifications.error(`Error al cargar rutas activadas: ${error.message}`);
            }

            // Procesar personas
            try {
                const personasData = await apiHelper.handleResponse(usuariosRes);
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
                console.log('Estados cargados:', (estadosData.data || estadosData).length, 'items');
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

            // Procesar rutas
            try {
                const rutasData = await apiHelper.handleResponse(rutasRes);
                setRutas(rutasData.data || rutasData);
                console.log('Rutas cargadas:', (rutasData.data || rutasData).length, 'items');
            } catch (error) {
                console.error('Error al cargar rutas:', error);
                Notifications.error(`Error al cargar rutas: ${error.message}`);
            }

            // Procesar vehículos
            try {
                const vehiculosData = await apiHelper.handleResponse(vehiculosRes);
                setVehiculos(vehiculosData.data || vehiculosData);
                console.log('Vehículos cargados:', (vehiculosData.data || vehiculosData).length, 'items');
            } catch (error) {
                console.error('Error al cargar vehículos:', error);
                Notifications.error(`Error al cargar vehículos: ${error.message}`);
            }

        } catch (error) {
            console.error('Error de conexión:', error);
            Notifications.error('Error de conexión al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    // CORREGIR: Función para obtener color del estado
    const obtenerColorEstado = (ruta) => {
        if (!ruta.estado) return 'gris';

        if (currentConfig.stateDetection.activada(ruta.estado)) return 'azul';
        if (currentConfig.stateDetection.llena(ruta.estado)) return 'naranja';
        if (currentConfig.stateDetection.ejecucion(ruta.estado)) return 'verde';
        if (currentConfig.stateDetection.cerrada(ruta.estado)) return 'gris';

        return 'gris';
    };

    // CORREGIR: Función para obtener texto del estado
    const obtenerTextoEstado = (ruta) => {
        if (!ruta.estado) return 'Sin estado';

        // Usar la detección de estados del config
        if (currentConfig.stateDetection.activada(ruta.estado)) return 'Activada';
        if (currentConfig.stateDetection.llena(ruta.estado)) return 'Llena';
        if (currentConfig.stateDetection.ejecucion(ruta.estado)) return 'En Ejecución';
        if (currentConfig.stateDetection.cerrada(ruta.estado)) return 'Cerrada';

        // Fallback: usar el estado tal como viene de la API
        return ruta.estado.nombre || ruta.estado.estado_estado || 'Estado desconocido';
    };

    // ACTUALIZADO: Función para cerrar ruta - NUEVA LÓGICA
    const intentarCerrarRuta = async (ruta) => {
        try {
            setLoadingAction(true);

            // Llamar directamente al endpoint que cierra la ruta Y libera el vehículo
            const response = await apiHelper.post(`/rutas-activadas/${ruta.id}/cerrar`);

            if (response.ok) {
                const data = await apiHelper.handleResponse(response);

                // Mostrar mensaje del backend que confirma el cierre y liberación del vehículo
                Notifications.success(data.message || 'Ruta cerrada exitosamente');

                if (data.vehiculo_liberado) {
                    Notifications.info('Vehículo liberado automáticamente y puesto en estado "Disponible"');
                }

                cargarDatos();
            } else {
                const errorData = await apiHelper.handleResponse(response);
                Notifications.error(errorData.message || 'Error al cerrar la ruta');
            }

        } catch (error) {
            console.error('Error cerrando ruta:', error);
            Notifications.error('Error de conexión');
        } finally {
            setLoadingAction(false);
        }
    };

    // NUEVO: Renderizar notificaciones de una ruta
    const renderizarNotificaciones = (ruta) => {
        const notificaciones = notificacionesRutas[ruta.id] || [];

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

    // ACTUALIZAR: Renderizar indicadores de capacidad usando la nueva API
    const renderizarIndicadorCapacidad = (ruta) => {
        // Si la ruta fue cargada individualmente con capacidad_detallada
        if (ruta.capacidad_detallada) {
            const formato = currentConfig.helpers.formatCapacidadDetallada(ruta.capacidad_detallada);
            const color = currentConfig.helpers.getCapacityColor(ruta.capacidad_detallada);

            return e('div', {
                style: {
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.25rem 0.75rem',
                    backgroundColor: getColorBackground(color),
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: getColorText(color)
                }
            }, formato.texto_corto);
        }

        // Fallback: usar datos del listado general
        if (!ruta.vehiculo?.capacidad) return null;

        const ocupacion = ruta.total_pasajeros || ruta.ocupacion_actual || 0;
        const capacidad = ruta.vehiculo.capacidad;
        const porcentaje = Math.round((ocupacion / capacidad) * 100);

        let colorFondo, colorTexto, texto;
        if (porcentaje >= 100) {
            colorFondo = '#fef2f2';
            colorTexto = '#dc2626';
            texto = 'LLENA';
        } else if (porcentaje >= 80) {
            colorFondo = '#fef3c7';
            colorTexto = '#f59e0b';
            texto = 'CASI LLENA';
        } else {
            colorFondo = '#dcfce7';
            colorTexto = '#16a34a';
            texto = 'DISPONIBLE';
        }

        return e('div', {
            style: {
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.25rem 0.75rem',
                backgroundColor: colorFondo,
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: '600',
                color: colorTexto
            }
        }, [
            e('span', {}, `${ocupacion}/${capacidad}`),
            e('span', {}, texto)
        ]);
    };

    // AGREGAR: Funciones helper para colores
    const getColorBackground = (color) => {
        switch (color) {
            case 'rojo': return '#fef2f2';
            case 'naranja': return '#fef3c7';
            case 'amarillo': return '#fefce8';
            case 'verde': return '#dcfce7';
            default: return '#f9fafb';
        }
    };

    const getColorText = (color) => {
        switch (color) {
            case 'rojo': return '#dc2626';
            case 'naranja': return '#f59e0b';
            case 'amarillo': return '#ca8a04';
            case 'verde': return '#16a34a';
            default: return '#6b7280';
        }
    };

    // Generar campos de formulario
    const generarCamposFormulario = () => {
        const campos = [];

        if (itemEditando && itemEditando.codigo) {
            campos.push({
                nombre: 'ruta_activada_codigo',
                tipo: 'text',
                requerido: false,
                opciones: [],
                placeholder: 'Código de la ruta activada',
                soloLectura: true,
                ancho: 'completo',
                label: 'Código de la ruta'
            });
        }

        campos.push({
            nombre: 'ruta_activada_fecha_hora',
            tipo: 'datetime-local',
            requerido: true,
            opciones: [],
            placeholder: 'Seleccionar fecha y hora de salida',
            soloLectura: false,
            ancho: 'completo',
            label: 'Fecha y Hora de Salida'
        });

        campos.push({
            nombre: 'servicio_id',
            searchable: true,
            tipo: 'select',
            requerido: true,
            opciones: servicios.map(servicio => ({
                value: servicio.servicio_id,
                label: servicio.servicio_servicio
            })),
            placeholder: 'Seleccione el servicio',
            soloLectura: false,
            ancho: 'completo',
            label: 'Servicio'
        });

        campos.push({
            nombre: 'ruta_id',
            searchable: true,
            tipo: 'select',
            requerido: true,
            opciones: rutas.map(ruta => ({
                value: ruta.ruta_id,
                label: `${ruta.ruta_origen} → ${ruta.ruta_destino}`
            })),
            placeholder: 'Seleccione la ruta base',
            soloLectura: false,
            ancho: 'medio',
            label: 'Ruta Base'
        });

        campos.push({
            nombre: 'persona_id',
            tipo: 'select',
            searchable: true,
            requerido: true,
            opciones: personas
                .filter(persona =>
                    persona.activo === true &&
                    persona.tipo_persona?.nombre === 'Conductor'
                )
                .map(persona => ({
                    value: persona.id,
                    label: persona.nombre_completo
                })),
            placeholder: 'Seleccione el conductor',
            soloLectura: false,
            ancho: 'medio',
            label: 'Conductor'
        });

        // MODIFICADO: Solo mostrar vehículos disponibles
        campos.push({
            nombre: 'vehiculo_id',
            searchable: true,
            tipo: 'select',
            requerido: true,
            opciones: vehiculos
                .filter(vehiculo => {
                    if (!vehiculo.activo) return false;
                    // Solo mostrar vehículos disponibles para nuevas rutas
                    if (!itemEditando && vehiculo.estado) {
                        // CORREGIDO: usar vehiculo.estado.nombre en lugar de estado_estado
                        return vehiculo.estado.nombre &&
                            vehiculo.estado.nombre.toLowerCase().includes('disponible');
                    }
                    return true;
                })
                .map(vehiculo => ({
                    value: vehiculo.id,
                    label: `${vehiculo.placa} - ${vehiculo.marca || 'Sin marca'} (Cap: ${vehiculo.capacidad || 'N/A'}) ${vehiculo.estado ? `[${vehiculo.estado.nombre}]` : ''}`
                })),
            placeholder: 'Seleccione el vehículo (solo disponibles)',
            soloLectura: false,
            ancho: 'medio',
            label: 'Vehículo'
        });

        campos.push({
            nombre: 'estado_id',
            searchable: true,
            tipo: 'select',
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
            { campo: 'fecha_completa', label: 'Fecha/Hora', tipo: 'fecha' },
            { campo: 'servicio', label: 'Servicio', tipo: 'objeto' },
            { campo: 'conductor', label: 'Conductor', tipo: 'objeto' },
            { campo: 'vehiculo', label: 'Vehículo', tipo: 'objeto' },
            { campo: 'estado', label: 'Estado', tipo: 'estado' } // NUEVO: tipo estado
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
                    const fecha = new Date(valor);
                    contenidoFormateado = fecha.toLocaleDateString('es-GT', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                } else if (tipo === 'estado' && valor) {
                    // NUEVO: Renderizado especial para estados
                    const colorEstado = obtenerColorEstado(item);
                    const textoEstado = obtenerTextoEstado(item);

                    contenidoFormateado = e('div', {
                        style: { display: 'flex', alignItems: 'center', gap: '0.5rem' }
                    }, [
                        BotonesUniversal.badge({
                            texto: textoEstado,
                            color: colorEstado
                        }),
                        renderizarIndicadorCapacidad(item)
                    ]);
                } else if (tipo === 'objeto' && valor) {
                    switch (campo) {
                        case 'servicio':
                            contenidoFormateado = valor.nombre || 'N/A';
                            break;
                        case 'conductor':
                            contenidoFormateado = valor.nombre || 'N/A';
                            break;
                        case 'vehiculo':
                            contenidoFormateado = `${valor.placa || 'N/A'} - ${valor.marca || 'Sin marca'}`;
                            break;
                        default:
                            contenidoFormateado = valor.nombre || 'N/A';
                    }
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
        if (item.servicio?.nombre) {
            const fechaFormateada = new Date(item.fecha_completa).toLocaleDateString('es-GT');
            return `${item.servicio.nombre} - ${fechaFormateada}`;
        }
        return item.codigo || `Ruta #${item.id}`;
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
                ruta_activada_codigo: item.codigo,
                ruta_activada_fecha_hora: item.fecha_completa ?
                    new Date(item.fecha_completa).toISOString().slice(0, 16) : '',
                persona_id: item.persona_id,
                estado_id: item.estado_id,
                servicio_id: item.servicio_id,
                ruta_id: item.ruta_id,
                vehiculo_id: item.vehiculo_id
            });
        } else {
            const mañana = new Date();
            mañana.setDate(mañana.getDate() + 1);
            mañana.setHours(8, 0, 0, 0);

            setFormulario({
                ruta_activada_fecha_hora: mañana.toISOString().slice(0, 16),
                estado_id: estados.find(e => e.estado_estado === 'Activada')?.estado_id || estados[0]?.estado_id || 1
            });
        }
        setErrores({});
        setModalFormulario(true);
    };

    const manejarCambioFormulario = (campo, valor) => {
        setFormulario(prev => ({ ...prev, [campo]: valor }));
        if (errores[campo]) {
            setErrores(prev => ({ ...prev, [campo]: '' }));
        }

        // NUEVO: Validación automática para vehículos
        if (campo === 'vehiculo_id' && valor && !itemEditando) {
            const vehiculoSeleccionado = vehiculos.find(v => v.id == valor);
            if (vehiculoSeleccionado?.estado) {
                const esDisponible = vehiculoSeleccionado.estado.estado_estado &&
                    vehiculoSeleccionado.estado.estado_estado.toLowerCase().includes('disponible');
                if (!esDisponible) {
                    Notifications.warning('Solo se pueden asignar vehículos en estado "Disponible"');
                }
            }
        }
    };

    // Validación del formulario
    const validarFormulario = () => {
        const nuevosErrores = {};

        if (!formulario.ruta_activada_fecha_hora) {
            nuevosErrores.ruta_activada_fecha_hora = 'La fecha y hora es requerida';
        } else {
            const fechaSeleccionada = new Date(formulario.ruta_activada_fecha_hora);
            const hoy = new Date();
            if (fechaSeleccionada < hoy && !itemEditando) {
                nuevosErrores.ruta_activada_fecha_hora = 'No se puede programar una ruta en el pasado';
            }
        }

        if (!formulario.servicio_id) {
            nuevosErrores.servicio_id = 'El servicio es requerido';
        }

        if (!formulario.ruta_id) {
            nuevosErrores.ruta_id = 'La ruta base es requerida';
        }

        if (!formulario.persona_id) {
            nuevosErrores.persona_id = 'El conductor es requerido';
        }

        if (!formulario.vehiculo_id) {
            nuevosErrores.vehiculo_id = 'El vehículo es requerido';
        }

        if (!formulario.estado_id) {
            nuevosErrores.estado_id = 'El estado es requerido';
        }

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    // Guardar item - CON REFRESCO DE NOTIFICACIONES
    const guardarItem = async () => {
        if (!validarFormulario()) return;

        try {
            setLoadingAction(true);

            const datosParaEnviar = { ...formulario };

            if (!itemEditando) {
                datosParaEnviar.ruta_activada_situacion = 1;
            } else {
                if (datosParaEnviar.ruta_activada_situacion === undefined) {
                    datosParaEnviar.ruta_activada_situacion = itemEditando.ruta_activada_situacion || 1;
                }
            }

            const response = itemEditando
                ? await apiHelper.put(`/rutas-activadas/${obtenerIdItem(itemEditando)}`, datosParaEnviar)
                : await apiHelper.post('/rutas-activadas', datosParaEnviar);

            const data = await apiHelper.handleResponse(response);

            if (response.ok) {
                Notifications.success(
                    `Ruta activada ${itemEditando ? 'actualizada' : 'creada'} exitosamente`
                );

                // NUEVO: Mostrar notificación sobre cambio automático de vehículo
                if (!itemEditando && formulario.vehiculo_id) {
                    Notifications.info('Vehículo cambiado automáticamente a estado "Asignado"');
                }

                setModalFormulario(false);
                cargarDatos(); // Esto recargará las notificaciones automáticamente
            } else {
                const errorData = await apiHelper.handleResponse(response);
                if (errorData.errors) {
                    setErrores(errorData.errors);
                    Notifications.error('Por favor corrige los errores en el formulario');
                } else {
                    Notifications.error(`Error al guardar: ${errorData.message || 'Error desconocido'}`);
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

    // Ejecutar acción - CON LÓGICA ESPECÍFICA PARA CERRAR RUTA
    const ejecutarAccion = async () => {
        if (!itemConfirmacion) return;

        // NUEVO: Manejar acción de cerrar ruta por separado
        if (accionConfirmacion === 'cerrar') {
            setModalConfirmacion(false);
            await intentarCerrarRuta(itemConfirmacion);
            return;
        }

        try {
            setLoadingAction(true);
            const itemId = obtenerIdItem(itemConfirmacion);

            let response;

            switch (accionConfirmacion) {
                case 'activar':
                    response = await apiHelper.patch(`/rutas-activadas/${itemId}/activate`);
                    break;

                case 'desactivar':
                    response = await apiHelper.patch(`/rutas-activadas/${itemId}/deactivate`);
                    break;

                case 'duplicar':
                    const fechaOriginal = new Date(itemConfirmacion.fecha_completa);
                    const mañana = new Date(fechaOriginal);
                    mañana.setDate(mañana.getDate() + 1);

                    const itemDuplicado = {
                        ruta_activada_fecha_hora: mañana.toISOString().slice(0, 16),
                        persona_id: itemConfirmacion.persona_id,
                        estado_id: estados.find(e => e.estado_estado === 'Activada')?.estado_id || estados[0]?.estado_id,
                        servicio_id: itemConfirmacion.servicio_id,
                        ruta_id: itemConfirmacion.ruta_id,
                        vehiculo_id: itemConfirmacion.vehiculo_id,
                        ruta_activada_situacion: 1
                    };
                    response = await apiHelper.post('/rutas-activadas', itemDuplicado);
                    break;

                default:
                    return;
            }

            const data = await apiHelper.handleResponse(response);

            if (response.ok) {
                const mensajes = {
                    activar: 'Ruta activada exitosamente',
                    desactivar: 'Ruta desactivada exitosamente',
                    duplicar: 'Ruta duplicada exitosamente para mañana'
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
    // const datosActuales = tableData.data;
    // NUEVO: Aplicar filtro por estado si está activo
    const datosActuales = filtroEstadoActivo
        ? tableData.data.filter(ruta => {
            if (!ruta.estado) return false;
            return currentConfig.stateDetection[filtroEstadoActivo](ruta.estado);
        })
        : tableData.data;
    const totalDatos = currentRawData.length;

    // Función para descargar lista conductor
    const descargarListaConductor = async (rutaActivada) => {
        try {
            setLoadingAction(true);
            Notifications.info('Generando lista para conductor...');

            // const response = await fetch(`/api/magic/rutas-activadas/${rutaActivada.id}/lista-conductor-pdf`);
            const response = await apiHelper.get(`/rutas-activadas/${rutaActivada.id}/lista-conductor-pdf`);

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `lista-conductor-${rutaActivada.codigo}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);

                Notifications.success('Lista descargada exitosamente');
            } else {
                Notifications.error('Error al generar lista');
            }
        } catch (error) {
            console.error('Error:', error);
            Notifications.error('Error de conexión');
        } finally {
            setLoadingAction(false);
        }
    };

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
                    }, 'Gestión de Rutas Activadas'),

                    // NUEVO: Indicador de notificaciones
                    Object.keys(notificacionesRutas).length > 0 && e('div', {
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
                        }, `${Object.keys(notificacionesRutas).length} rutas con notificaciones`)
                    ])
                ]),
                e('p', {
                    style: {
                        color: '#6b7280',
                        margin: '0.25rem 0 0 0',
                        fontSize: '1rem'
                    }
                }, `${datosActuales.length} de ${totalDatos} rutas activadas encontradas`)
            ]),
            BotonesUniversal.nuevo({
                onClick: () => abrirModalFormulario(),
                texto: 'Nueva Ruta Activada',
                loading: loading
            })
        ]),

        // NUEVO: Tarjetas de estadísticas por estado (con filtro)
        e('div', {
            key: 'targets-estados',
            style: {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
            }
        }, [
            // Target: Activada
            e('div', {
                onClick: () => setFiltroEstadoActivo(filtroEstadoActivo === 'activada' ? null : 'activada'),
                style: {
                    backgroundColor: filtroEstadoActivo === 'activada' ? '#dbeafe' : 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    borderLeft: '4px solid #3b82f6',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: filtroEstadoActivo === 'activada' ? '2px solid #3b82f6' : '1px solid #e5e7eb'
                }
            }, [
                e('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' } }, [
                    e('h3', { style: { fontSize: '1rem', fontWeight: '600', color: '#1f2937', margin: '0' } }, 'Activada'),
                    e('span', {
                        style: {
                            fontSize: '2rem',
                            fontWeight: '700',
                            color: '#3b82f6'
                        }
                    }, (filtroEstadoActivo === 'activada' ? datosActuales : rutasActivadas.filter(r => r.estado && currentConfig.stateDetection.activada(r.estado))).length)
                ]),
                e('p', { style: { fontSize: '0.875rem', color: '#6b7280', margin: '0' } }, 'Puede recibir reservas'),
                filtroEstadoActivo === 'activada' && e('p', {
                    style: { fontSize: '0.75rem', color: '#3b82f6', margin: '0.25rem 0 0 0', fontWeight: '500' }
                }, 'Filtro activo - Click para quitar')
            ]),

            // Target: Llena
            e('div', {
                onClick: () => setFiltroEstadoActivo(filtroEstadoActivo === 'llena' ? null : 'llena'),
                style: {
                    backgroundColor: filtroEstadoActivo === 'llena' ? '#fef3c7' : 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    borderLeft: '4px solid #f59e0b',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: filtroEstadoActivo === 'llena' ? '2px solid #f59e0b' : '1px solid #e5e7eb'
                }
            }, [
                e('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' } }, [
                    e('h3', { style: { fontSize: '1rem', fontWeight: '600', color: '#1f2937', margin: '0' } }, 'Llena'),
                    e('span', {
                        style: {
                            fontSize: '2rem',
                            fontWeight: '700',
                            color: '#f59e0b'
                        }
                    }, (filtroEstadoActivo === 'llena' ? datosActuales : rutasActivadas.filter(r => r.estado && currentConfig.stateDetection.llena(r.estado))).length)
                ]),
                e('p', { style: { fontSize: '0.875rem', color: '#6b7280', margin: '0' } }, 'Capacidad completa'),
                filtroEstadoActivo === 'llena' && e('p', {
                    style: { fontSize: '0.75rem', color: '#f59e0b', margin: '0.25rem 0 0 0', fontWeight: '500' }
                }, 'Filtro activo - Click para quitar')
            ]),

            // Target: Ejecución
            e('div', {
                onClick: () => setFiltroEstadoActivo(filtroEstadoActivo === 'ejecucion' ? null : 'ejecucion'),
                style: {
                    backgroundColor: filtroEstadoActivo === 'ejecucion' ? '#dcfce7' : 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    borderLeft: '4px solid #10b981',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: filtroEstadoActivo === 'ejecucion' ? '2px solid #10b981' : '1px solid #e5e7eb'
                }
            }, [
                e('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' } }, [
                    e('h3', { style: { fontSize: '1rem', fontWeight: '600', color: '#1f2937', margin: '0' } }, 'Ejecución'),
                    e('span', {
                        style: {
                            fontSize: '2rem',
                            fontWeight: '700',
                            color: '#10b981'
                        }
                    }, (filtroEstadoActivo === 'ejecucion' ? datosActuales : rutasActivadas.filter(r => r.estado && currentConfig.stateDetection.ejecucion(r.estado))).length)
                ]),
                e('p', { style: { fontSize: '0.875rem', color: '#6b7280', margin: '0' } }, 'En viaje'),
                filtroEstadoActivo === 'ejecucion' && e('p', {
                    style: { fontSize: '0.75rem', color: '#10b981', margin: '0.25rem 0 0 0', fontWeight: '500' }
                }, 'Filtro activo - Click para quitar')
            ]),

            // Target: Cerrada
            e('div', {
                onClick: () => setFiltroEstadoActivo(filtroEstadoActivo === 'cerrada' ? null : 'cerrada'),
                style: {
                    backgroundColor: filtroEstadoActivo === 'cerrada' ? '#f3f4f6' : 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    borderLeft: '4px solid #6b7280',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: filtroEstadoActivo === 'cerrada' ? '2px solid #6b7280' : '1px solid #e5e7eb'
                }
            }, [
                e('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' } }, [
                    e('h3', { style: { fontSize: '1rem', fontWeight: '600', color: '#1f2937', margin: '0' } }, 'Cerrada'),
                    e('span', {
                        style: {
                            fontSize: '2rem',
                            fontWeight: '700',
                            color: '#6b7280'
                        }
                    }, (filtroEstadoActivo === 'cerrada' ? datosActuales : rutasActivadas.filter(r => r.estado && currentConfig.stateDetection.cerrada(r.estado))).length)
                ]),
                e('p', { style: { fontSize: '0.875rem', color: '#6b7280', margin: '0' } }, 'Completada'),
                filtroEstadoActivo === 'cerrada' && e('p', {
                    style: { fontSize: '0.75rem', color: '#6b7280', margin: '0.25rem 0 0 0', fontWeight: '500' }
                }, 'Filtro activo - Click para quitar')
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
                        const tieneNotificaciones = notificacionesRutas[item.id] && notificacionesRutas[item.id].length > 0;
                        const puedeSerCerrada = item.estado && !currentConfig.stateDetection.cerrada(item.estado);

                        return e('div', {
                            key: `item-${itemId}`,
                            style: {
                                padding: '1.5rem',
                                borderBottom: index < datosActuales.length - 1 ?
                                    '1px solid #f3f4f6' : 'none',
                                // NUEVO: Resaltar rutas con notificaciones
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

                                        // NUEVO: Badge de notificación
                                        tieneNotificaciones && BotonesUniversal.badge({
                                            texto: `${notificacionesRutas[item.id].length} notificaciones`,
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
                                    style: { display: 'flex', flexDirection: 'column', gap: '0.5rem' }
                                }, [
                                    BotonesUniversal.grupoAcciones({
                                        item: item,
                                        onVer: () => abrirModalDetalles(item),
                                        onEditar: () => abrirModalFormulario(item),
                                        // onDuplicar: () => abrirModalConfirmacion(item, 'duplicar'),
                                        mostrarDuplicar: false,
                                        onActivar: () => abrirModalConfirmacion(
                                            item,
                                            esActivo ? 'desactivar' : 'activar'
                                        ),
                                        activo: esActivo,
                                        key: `actions-${itemId}`
                                    }),

                                    // NUEVO: Botón para cerrar ruta
                                    puedeSerCerrada && e('button', {
                                        onClick: () => abrirModalConfirmacion(item, 'cerrar'),
                                        style: {
                                            padding: '0.25rem 0.75rem',
                                            fontSize: '0.75rem',
                                            fontWeight: '500',
                                            color: 'white',
                                            backgroundColor: '#dc2626',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease'
                                        }
                                    }, 'Cerrar Ruta'),

                                    // Generar pdf botón
                                    e('button', {
                                        onClick: () => descargarListaConductor(item),
                                        style: {
                                            padding: '0.25rem 0.75rem',
                                            fontSize: '0.75rem',
                                            fontWeight: '500',
                                            color: 'white',
                                            backgroundColor: '#3b82f6',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease'
                                        }
                                    }, 'Lista PDF')
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
                    }, 'No hay rutas activadas que coincidan con los filtros')
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
            tipoItem: 'ruta activada',
            campos: generarCamposFormulario(),
            esEdicion: !!itemEditando
        }),

        ModalUniversal.confirmacion({
            abierto: modalConfirmacion,
            cerrar: () => setModalConfirmacion(false),
            ejecutar: ejecutarAccion,
            accion: accionConfirmacion,
            item: itemConfirmacion,
            tipoItem: 'ruta activada',
            loading: loadingAction,
            nombreItem: itemConfirmacion ? obtenerNombreItem(itemConfirmacion) : ''
        }),

        ModalUniversal.detalles({
            abierto: modalDetalles,
            cerrar: () => setModalDetalles(false),
            item: itemDetalles,
            tipoItem: 'ruta activada',
            camposExcluir: currentConfig.camposDetalles?.excluir || [
                'created_at', 'updated_at', 'deleted_at', 'ruta_activada_situacion',
                'fecha_completa', 'fecha_formateada', 'fecha_iso', 'activo'
            ]
        })
    ]);
}

export default GestionRutasActivas;
