// src/resources/js/components/operacion/rutas-activas/rutasActivasConfig.js

/**
 * CONFIGURACIÓN ESPECÍFICA PARA RUTAS ACTIVADAS (TABLA RUTA_ACTIVADA)
 * Sistema de notificaciones y lógica de negocio Magic Travel
 * Estados: Activada, Llena, Ejecución, Cerrada
 * Cambios automáticos de vehículos: Disponible → Asignado → Disponible
 */
import AuthService from '../../../services/auth';
import apiHelper from '../../../utils/apiHelper';

// CONFIGURACIÓN BASE COMPARTIDA
const baseConfig = {
    defaultItemsPerPage: 10,
    defaultSortDirection: 'desc',
    statusField: 'activo',
    searchableFields: [],
    apiEndpoint: '/api/magic'
};

// CONFIGURACIÓN ESPECÍFICA PARA RUTAS ACTIVADAS
export const configRutasActivadas = {
    ...baseConfig,
    tableName: 'rutas-activadas',
    displayName: 'Rutas Activadas',
    primaryKey: 'id',
    defaultSortField: 'codigo',
    nameField: 'codigo',

    // Campos de la tabla con configuración
    fields: {
        id: {
            label: 'ID',
            type: 'number',
            sortable: true,
            filterable: false,
            sortType: 'numeric'
        },
        codigo: {
            label: 'Código',
            type: 'text',
            sortable: true,
            filterable: false,
            sortType: 'alphabetic',
            placeholder: 'Se genera automáticamente',
            width: 'completo'
        },
        fecha_hora: {
            label: 'Fecha y Hora de Salida',
            type: 'datetime-local',
            sortable: true,
            filterable: false,
            sortType: 'date',
            required: true,
            placeholder: 'Seleccionar fecha y hora de salida',
            width: 'completo',
            help: 'Fecha y hora cuando sale la ruta'
        },
        ruta_completa: {
            label: 'Ruta',
            type: 'text',
            sortable: true,
            filterable: false,
            sortType: 'alphabetic'
        },
        persona_id: {
            label: 'Conductor',
            type: 'foreign_key',
            sortable: true,
            filterable: false,
            sortType: 'numeric',
            required: true,
            relatedTable: 'personas',
            relatedKey: 'persona_id',
            displayField: 'nombre_completo',
            endpoint: '/api/magic/personas',
            width: 'medio'
        },
        estado_id: {
            label: 'Estado de la Ruta',
            type: 'foreign_key',
            sortable: true,
            filterable: false,
            sortType: 'numeric',
            required: true,
            relatedTable: 'estados',
            relatedKey: 'estado_id',
            displayField: 'estado_estado',
            endpoint: '/api/magic/estados/contexto/ruta-activada',
            width: 'medio'
        },
        servicio_id: {
            label: 'Servicio',
            type: 'foreign_key',
            sortable: true,
            filterable: false,
            sortType: 'numeric',
            required: true,
            relatedTable: 'servicios',
            relatedKey: 'servicio_id',
            displayField: 'servicio_servicio',
            endpoint: '/api/magic/servicios',
            width: 'completo'
        },
        ruta_id: {
            label: 'Ruta Base',
            type: 'foreign_key',
            sortable: true,
            filterable: false,
            sortType: 'numeric',
            required: true,
            relatedTable: 'rutas',
            relatedKey: 'ruta_id',
            displayField: 'ruta_ruta',
            endpoint: '/api/magic/rutas',
            width: 'medio'
        },
        vehiculo_id: {
            label: 'Vehículo',
            type: 'foreign_key',
            sortable: true,
            filterable: false,
            sortType: 'numeric',
            required: true,
            relatedTable: 'vehiculos',
            relatedKey: 'vehiculo_id',
            displayField: 'vehiculo_placa',
            endpoint: '/api/magic/vehiculos',
            width: 'medio',
            filterOptions: 'disponibles_solo'
        },
        activo: {
            label: 'Estado',
            type: 'select',
            sortable: true,
            filterable: false,
            options: [
                { value: 1, label: 'Activo' },
                { value: 0, label: 'Inactivo' }
            ]
        }
    },

    // Campos específicos para funcionalidades
    searchableFields: ['codigo', 'ruta_completa'],
    sortableFields: ['codigo', 'fecha_hora', 'ruta_completa'],
    filterableFields: [],

    // Campos que se muestran en la lista (renderizarItem)
    displayFields: ['codigo', 'fecha_hora', 'servicio_id', 'persona_id', 'vehiculo_id'],

    // Configuración específica para transaccionales (múltiples FK)
    foreignKeys: ['persona_id', 'estado_id', 'servicio_id', 'ruta_id', 'vehiculo_id'],

    // Validaciones específicas para rutas activadas
    validations: {
        codigo: {
            unique: true,
            endpoint: '/api/magic/rutas-activadas/verificar-codigo'
        }
    },

    // VALIDACIÓN DE ESTADOS NECESARIOS - LÓGICA DE NEGOCIO
    validateStates: async () => {
        try {
            const response = await apiHelper.get('/estados/contexto/ruta-activada');
            const estados = await apiHelper.handleResponse(response);

            // Estados necesarios para el flujo de negocio Magic Travel
            const estadosNecesarios = ['Activada', 'Llena', 'Ejecución', 'Cerrada'];

            const estadosFaltantes = estadosNecesarios.filter(necesario =>
                !estados.some(estado =>
                    estado.estado_estado.toLowerCase() === necesario.toLowerCase()
                )
            );

            if (estadosFaltantes.length > 0) {
                return {
                    valido: false,
                    faltantes: estadosFaltantes,
                    mensaje: `Estados faltantes para rutas activadas: ${estadosFaltantes.join(', ')}`,
                    contexto: 'ruta-activada'
                };
            }

            return {
                valido: true,
                estados,
                mensaje: 'Todos los estados necesarios están disponibles'
            };
        } catch (error) {
            console.error('Error validando estados de rutas activadas:', error);
            return {
                valido: false,
                mensaje: 'Error de conexión al validar estados de rutas activadas',
                contexto: 'ruta-activada'
            };
        }
    },

    // DETECCIÓN DE ESTADOS ESPECÍFICOS
    stateDetection: {
        activada: (estado) => {
            if (!estado) return false;
            const estadoTexto = estado.estado_estado || estado.nombre || '';
            return estadoTexto.toLowerCase().includes('activada') ||
                estadoTexto.toLowerCase().includes('programada') ||
                estadoTexto.toLowerCase().includes('pendiente') ||
                estadoTexto.toLowerCase().includes('activ');
        },
        llena: (estado) => {
            if (!estado) return false;
            const estadoTexto = estado.estado_estado || estado.nombre || '';
            return estadoTexto.toLowerCase().includes('llena') ||
                estadoTexto.toLowerCase().includes('completa') ||
                estadoTexto.toLowerCase().includes('ocupada') ||
                estadoTexto.toLowerCase().includes('llen');
        },
        ejecucion: (estado) => {
            if (!estado) return false;
            const estadoTexto = estado.estado_estado || estado.nombre || '';
            return estadoTexto.toLowerCase().includes('ejecución') ||
                estadoTexto.toLowerCase().includes('ejecutando') ||
                estadoTexto.toLowerCase().includes('en ruta') ||
                estadoTexto.toLowerCase().includes('viajando') ||
                estadoTexto.toLowerCase().includes('ejecuc');
        },
        cerrada: (estado) => {
            if (!estado) return false;
            const estadoTexto = estado.estado_estado || estado.nombre || '';
            return estadoTexto.toLowerCase().includes('cerrada') ||
                estadoTexto.toLowerCase().includes('completada') ||
                estadoTexto.toLowerCase().includes('finalizada') ||
                estadoTexto.toLowerCase().includes('cerr');
        }
    },

    // OBTENER ESTADO POR TIPO
    getStateByType: async (tipo) => {
        try {
            const validation = await configRutasActivadas.validateStates();
            if (!validation.valido) {
                return null;
            }

            return validation.estados.find(estado =>
                configRutasActivadas.stateDetection[tipo] && configRutasActivadas.stateDetection[tipo](estado)
            );
        } catch (error) {
            console.error('Error obteniendo estado:', error);
            return null;
        }
    },

    // LÓGICA DE NEGOCIO - FLUJO DE ESTADOS Y VEHÍCULOS
    businessLogic: {
        // Validar que solo vehículos disponibles puedan asignarse
        canAssignVehicle: async (vehiculoId) => {
            try {
                const response = await apiHelper.get(`/vehiculos/${vehiculoId}`);
                const vehiculo = await apiHelper.handleResponse(response);

                // Verificar que el vehículo esté disponible
                if (!vehiculo.caracteristicas?.puede_ser_asignado) {
                    return {
                        valido: false,
                        mensaje: 'Solo se pueden asignar vehículos en estado "Disponible"'
                    };
                }

                return { valido: true };
            } catch (error) {
                console.error('Error verificando vehículo:', error);
                return { valido: false, mensaje: 'Error de conexión' };
            }
        },
        // Cambio automático de vehículo al crear ruta
        autoChangeVehicleToAssigned: async (vehiculoId) => {
            try {
                // Obtener estado "Asignado" para vehículos
                const response = await apiHelper.get('/estados/contexto/vehiculo');
                const estados = await apiHelper.handleResponse(response);

                const estadoAsignado = estados.find(estado =>
                    estado.estado_estado.toLowerCase().includes('asignado')
                );

                if (estadoAsignado) {
                    // Cambiar estado del vehículo automáticamente
                    const updateResponse = await apiHelper.put(`/vehiculos/${vehiculoId}`, {
                        estado_id: estadoAsignado.estado_id
                    });

                    const updateData = await apiHelper.handleResponse(updateResponse);

                    if (updateResponse.ok) {
                        return {
                            valido: true,
                            mensaje: 'Vehículo cambiado automáticamente a estado "Asignado"'
                        };
                    }
                }
                return { valido: false, mensaje: 'No se pudo cambiar estado del vehículo automáticamente' };
            } catch (error) {
                console.error('Error en cambio automático de vehículo:', error);
                return { valido: false, mensaje: 'Error en cambio automático' };
            }
        },

        // Control de capacidad - cambio a "Llena"
        checkCapacityAndChangeState: async (rutaActivadaId) => {
            try {
                const response = await apiHelper.get(`/rutas-activadas/${rutaActivadaId}`);
                const ruta = await apiHelper.handleResponse(response);

                // Verificar si la ruta está llena (100% capacidad)
                if (ruta.porcentaje_ocupacion >= 100) {
                    const estadoLlena = await configRutasActivadas.getStateByType('llena');

                    if (estadoLlena) {
                        // Cambiar estado a "Llena" automáticamente
                        const updateResponse = await apiHelper.put(`/rutas-activadas/${rutaActivadaId}`, {
                            estado_id: estadoLlena.estado_id
                        });

                        const updateData = await apiHelper.handleResponse(updateResponse);

                        if (updateResponse.ok) {
                            return {
                                valido: true,
                                mensaje: 'Ruta cambiada automáticamente a estado "Llena"'
                            };
                        }
                    }
                }
                return { valido: true }; // No necesita cambio
            } catch (error) {
                console.error('Error verificando capacidad:', error);
                return { valido: false, mensaje: 'Error verificando capacidad' };
            }
        }
    },

    // HELPERS DE FORMATEO
    helpers: {
        // Obtener color de badge según estado de ruta
        getStateColor: (estado) => {
            if (!estado) return 'gris';

            if (configRutasActivadas.stateDetection.activada(estado)) return 'azul';
            if (configRutasActivadas.stateDetection.llena(estado)) return 'naranja';
            if (configRutasActivadas.stateDetection.ejecucion(estado)) return 'verde';
            if (configRutasActivadas.stateDetection.cerrada(estado)) return 'gris';

            return 'gris';
        },

        // Obtener texto de estado para mostrar
        getStateText: (estado) => {
            if (!estado) return 'Sin estado';

            if (configRutasActivadas.stateDetection.activada(estado)) return 'Activada';
            if (configRutasActivadas.stateDetection.llena(estado)) return 'Llena';
            if (configRutasActivadas.stateDetection.ejecucion(estado)) return 'En Ejecución';
            if (configRutasActivadas.stateDetection.cerrada(estado)) return 'Cerrada';

            return estado.estado_estado || 'Estado desconocido';
        },

        // Validar si puede recibir reservas
        canReceiveReservations: (rutaActivada) => {
            if (!rutaActivada.estado) return false;

            // Solo puede recibir reservas si está "Activada" y no está "Llena"
            return configRutasActivadas.stateDetection.activada(rutaActivada.estado) &&
                rutaActivada.capacidad_disponible > 0;
        },

        // Obtener rutas que pueden recibir reservas
        getAvailableRoutes: (rutasActivadas) => {
            return rutasActivadas.filter(ruta =>
                ruta.activo &&
                ruta.estado &&
                configRutasActivadas.helpers.canReceiveReservations(ruta)
            );
        },

        // Formatear ocupación
        formatOccupancy: (rutaActivada) => {
            if (!rutaActivada.vehiculo?.capacidad) return 'Sin capacidad definida';

            return `${rutaActivada.ocupacion_actual || 0}/${rutaActivada.vehiculo.capacidad} pasajeros (${rutaActivada.porcentaje_ocupacion || 0}%)`;
        },

        // NUEVO: Obtener notificaciones inteligentes
        obtenerNotificaciones: async (rutaActivada) => {
            try {
                const response = await apiHelper.get(`/rutas-activadas/${rutaActivada.id}/notificaciones`);
                const data = await apiHelper.handleResponse(response);
                return data;
            } catch (error) {
                console.warn('Error obteniendo notificaciones:', error);
                return { notificaciones: [] };
            }
        },
        // NUEVO: Validar antes de agregar reserva
        validarAgregarReserva: async (rutaActivada, adultos, ninos = 0) => {
            try {
                const response = await apiHelper.post(`/rutas-activadas/${rutaActivada.id}/validar-reserva`, { adultos, ninos });
                const data = await apiHelper.handleResponse(response);
                return data;
            } catch (error) {
                console.warn('Error validando reserva:', error);
                return { puede_recibir: false, mensaje: 'Error de conexión' };
            }
        },


        // NUEVO: Formatear información de capacidad detallada desde la API
        formatCapacidadDetallada: (capacidadDetallada) => {
            if (!capacidadDetallada) return 'Sin información de capacidad';

            const { total_reservas, total_pasajeros, asientos_libres, capacidad_total, porcentaje_ocupacion } = capacidadDetallada;

            return {
                texto_completo: `${total_reservas} reservas • ${total_pasajeros} pasajeros • ${asientos_libres} libres de ${capacidad_total} (${porcentaje_ocupacion}%)`,
                texto_corto: `${total_pasajeros}/${capacidad_total} (${porcentaje_ocupacion}%)`,
                reservas: `${total_reservas} reservas`,
                pasajeros: `${total_pasajeros} pasajeros`,
                disponibilidad: `${asientos_libres} de ${capacidad_total} libres`,
                porcentaje: `${porcentaje_ocupacion}%`
            };
        },

        // NUEVO: Obtener color para indicador de capacidad
        getCapacityColor: (capacidadDetallada) => {
            if (!capacidadDetallada || !capacidadDetallada.porcentaje_ocupacion) return 'gris';

            const porcentaje = capacidadDetallada.porcentaje_ocupacion;

            if (porcentaje >= 100) return 'rojo';
            if (porcentaje >= 80) return 'naranja';
            if (porcentaje >= 50) return 'amarillo';
            return 'verde';
        },

        // NUEVO: Obtener estado de disponibilidad desde la nueva API
        getStatusFromAPI: (response) => {
            if (response.estado_actual) {
                return {
                    nombre: response.estado_actual,
                    codigo: response.data?.estado?.codigo || null,
                    id: response.data?.estado_id || null
                };
            }
            return null;
        }
    },

    // VALIDADORES DE INTEGRIDAD
    integrityValidators: {
        // Validar que el vehículo esté disponible antes de asignar
        validateVehicleAssignment: async (formData) => {
            if (!formData.vehiculo_id) {
                return { valido: true }; // Se valida como requerido en otro lugar
            }

            const validation = await configRutasActivadas.businessLogic.canAssignVehicle(formData.vehiculo_id);
            if (!validation.valido) {
                return {
                    valido: false,
                    mensaje: validation.mensaje
                };
            }

            return { valido: true };
        },

        // Validar fecha y hora
        validateDateTime: (formData) => {
            if (!formData.ruta_activada_fecha_hora) {
                return { valido: true }; // Se valida como requerido en otro lugar
            }

            const fechaSeleccionada = new Date(formData.ruta_activada_fecha_hora);
            const hoy = new Date();

            if (fechaSeleccionada < hoy) {
                return {
                    valido: false,
                    mensaje: 'No se puede programar una ruta en el pasado'
                };
            }

            return { valido: true };
        },

        // Validar estado apropiado para rutas activadas
        validateState: async (formData) => {
            if (!formData.estado_id) {
                return { valido: true };
            }

            try {
                const response = await apiHelper.get('/estados/contexto/ruta-activada');
                const estadosRuta = await apiHelper.handleResponse(response);

                const estadoValido = estadosRuta.some(estado =>
                    estado.estado_id == formData.estado_id
                );

                if (!estadoValido) {
                    return {
                        valido: false,
                        mensaje: 'Debe seleccionar un estado válido para rutas activadas'
                    };
                }
            } catch (error) {
                console.warn('Error validando estado de ruta:', error);
            }

            return { valido: true };
        }
    },

    // Configuración de formulario por pasos (wizard)
    formSteps: [
        {
            title: 'Información Básica',
            description: 'Fecha, hora y servicio',
            fields: ['fecha_hora', 'servicio_id', 'ruta_id']
        },
        {
            title: 'Asignación Operativa',
            description: 'Conductor, vehículo y estado',
            fields: ['persona_id', 'vehiculo_id', 'estado_id'],
            validate: (formulario) => {
                const errores = {};
                if (formulario.fecha_hora) {
                    const fechaSeleccionada = new Date(formulario.fecha_hora);
                    const hoy = new Date();
                    if (fechaSeleccionada < hoy) {
                        errores.fecha_hora = 'No se puede programar una ruta en el pasado';
                    }
                }
                return errores;
            }
        }
    ],

    // Valores por defecto al crear
    defaultValues: {
        activo: 1
    },

    // Callbacks de cambio de campo
    onFieldChange: {
        servicio_id: (valor, formulario, setFormulario) => {
            console.log('Servicio seleccionado:', valor);
        },
        fecha_hora: (valor, formulario, setFormulario) => {
            console.log('Fecha y hora programada:', valor);
        },
        vehiculo_id: async (valor, formulario, setFormulario, showNotification) => {
            if (valor && !formulario.id) { // Solo para nuevas rutas
                const validation = await configRutasActivadas.businessLogic.canAssignVehicle(valor);
                if (!validation.valido && showNotification) {
                    showNotification('warning', validation.mensaje);
                }
            }
        }
    },

    // Validación completa del formulario
    validateForm: async (formulario) => {
        const errores = {};

        // Validar fecha/hora
        const validacionFecha = configRutasActivadas.integrityValidators.validateDateTime(formulario);
        if (!validacionFecha.valido) {
            errores.ruta_activada_fecha_hora = validacionFecha.mensaje;
        }

        // Validar vehículo disponible
        if (formulario.vehiculo_id) {
            const validacionVehiculo = await configRutasActivadas.integrityValidators.validateVehicleAssignment(formulario);
            if (!validacionVehiculo.valido) {
                errores.vehiculo_id = validacionVehiculo.mensaje;
            }
        }

        // Validar estado
        const validacionEstado = await configRutasActivadas.integrityValidators.validateState(formulario);
        if (!validacionEstado.valido) {
            errores.estado_id = validacionEstado.mensaje;
        }

        return errores;
    },

    // Procesar datos antes de guardar
    processBeforeSave: (datos) => {
        // Convertir campo datetime-local unificado al formato que espera el backend
        if (datos.fecha_hora) {
            datos.ruta_activada_fecha_hora = datos.fecha_hora;
            delete datos.fecha_hora;
        }

        if (datos.codigo) {
            datos.ruta_activada_codigo = datos.codigo;
            delete datos.codigo;
        }

        if (datos.activo !== undefined) {
            datos.ruta_activada_situacion = datos.activo;
            delete datos.activo;
        }

        return datos;
    },

    // Procesar duplicación
    processDuplicate: (datos) => {
        // Al duplicar, cambiar fecha a mañana a la misma hora
        if (datos.fecha_hora) {
            const fechaOriginal = new Date(datos.fecha_hora);
            const mañana = new Date(fechaOriginal);
            mañana.setDate(mañana.getDate() + 1);
            datos.fecha_hora = mañana.toISOString().slice(0, 16);
        }

        // Generar nuevo código automáticamente
        delete datos.codigo;

        return datos;
    },

    // Callback después de guardar - IMPLEMENTA CAMBIO AUTOMÁTICO
    afterSave: async (respuesta, esEdicion, showNotification) => {
        if (!esEdicion && respuesta.vehiculo_id) {
            // Cambiar vehículo automáticamente a "Asignado"
            try {
                const cambioVehiculo = await configRutasActivadas.businessLogic.autoChangeVehicleToAssigned(respuesta.vehiculo_id);
                if (cambioVehiculo.valido && showNotification) {
                    showNotification('info', cambioVehiculo.mensaje);
                }
            } catch (error) {
                console.warn('Error en cambio automático de vehículo:', error);
            }
        }
    },

    // Configuración específica para rutas adicionales
    additionalRoutes: {
        activate: '/api/magic/rutas-activadas/{id}/activate',
        deactivate: '/api/magic/rutas-activadas/{id}/deactivate',
        porPersona: '/api/magic/rutas-activadas/persona/{personaId}',
        porEstado: '/api/magic/rutas-activadas/estado/{estadoId}',
        porServicio: '/api/magic/rutas-activadas/servicio/{servicioId}',
        porVehiculo: '/api/magic/rutas-activadas/vehiculo/{vehiculoId}',
        verificarCodigo: '/api/magic/rutas-activadas/verificar-codigo',
        notificaciones: '/api/magic/rutas-activadas/{id}/notificaciones',
        validarReserva: '/api/magic/rutas-activadas/{id}/validar-reserva',
        procesarReserva: '/api/magic/rutas-activadas/{id}/procesar-reserva'
    },

    // CONFIGURACIÓN PARA MODAL DE DETALLES
    camposDetalles: {
        excluir: [
            'created_at', 'updated_at', 'deleted_at',
            'ruta_activada_situacion',
            'fecha_completa',
            'fecha_formateada',
            'fecha_iso',
            'activo'
        ],
        traducciones: {
            'id': 'ID',
            'codigo': 'Código',
            'fecha_hora': 'Fecha y Hora de Salida',
            'persona_id': 'ID Conductor',
            'servicio_id': 'ID Servicio',
            'ruta_id': 'ID Ruta Base',
            'vehiculo_id': 'ID Vehículo',
            'estado_id': 'ID Estado',
            // Campos de relaciones
            'servicio': 'Servicio',
            'conductor': 'Conductor',
            'vehiculo': 'Vehículo',
            'estado': 'Estado',
            'ruta': 'Ruta'
        },
        // Orden de campos (opcional)
        orden: [
            'codigo', 'fecha_hora', 'servicio', 'ruta',
            'conductor', 'vehiculo', 'estado'
        ]
    }
};

// EXPORTAR CONFIGURACIÓN
export const rutasActivasConfig = {
    rutasActivadas: configRutasActivadas
};
