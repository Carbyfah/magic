// src/resources/js/components/operacion/tours-activados/toursActivadosConfig.js

/**
 * CONFIGURACIÓN ESPECÍFICA PARA TOURS ACTIVADOS (TABLA TOUR_ACTIVADO)
 * Sistema de notificaciones y lógica de negocio Magic Travel
 * Estados: Activado, En Ejecución, Cerrado
 * SIN vehículos, CON guía opcional (interno/externo), SIN límite de capacidad
 */

import AuthService from '../../../services/auth';

// CONFIGURACIÓN BASE COMPARTIDA
const baseConfig = {
    defaultItemsPerPage: 10,
    defaultSortDirection: 'desc',
    statusField: 'activo',
    searchableFields: [],
    apiEndpoint: '/api/magic'
};

// CONFIGURACIÓN ESPECÍFICA PARA TOURS ACTIVADOS
export const configToursActivados = {
    ...baseConfig,
    tableName: 'tours-activados',
    displayName: 'Tours Activados',
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
            label: 'Fecha y Hora del Tour',
            type: 'datetime-local',
            sortable: true,
            filterable: false,
            sortType: 'date',
            required: true,
            placeholder: 'Seleccionar fecha y hora del tour',
            width: 'completo',
            help: 'Fecha y hora cuando inicia el tour'
        },
        descripcion: {
            label: 'Descripción del Tour',
            type: 'textarea',
            sortable: false,
            filterable: false,
            required: false,
            placeholder: 'Descripción opcional del tour',
            width: 'completo',
            help: 'Información adicional sobre el tour'
        },
        punto_encuentro: {
            label: 'Punto de Encuentro',
            type: 'text',
            sortable: false,
            filterable: false,
            required: false,
            placeholder: 'Lugar donde se reunirán los turistas',
            width: 'medio',
            help: 'Ubicación de inicio del tour'
        },
        duracion_horas: {
            label: 'Duración (Horas)',
            type: 'number',
            sortable: false,
            filterable: false,
            required: false,
            placeholder: '0.0',
            width: 'medio',
            help: 'Duración estimada en horas (ej: 2.5)',
            min: 0,
            max: 24,
            step: 0.5
        },
        persona_id: {
            label: 'Guía (Opcional)',
            type: 'foreign_key',
            sortable: true,
            filterable: false,
            sortType: 'numeric',
            required: false,
            relatedTable: 'personas',
            relatedKey: 'persona_id',
            displayField: 'nombre_completo',
            endpoint: '/api/magic/personas',
            width: 'medio',
            help: 'Guía interno asignado (dejar vacío para guía externo)'
        },
        estado_id: {
            label: 'Estado del Tour',
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
    searchableFields: ['codigo', 'descripcion', 'punto_encuentro'],
    sortableFields: ['codigo', 'fecha_hora'],
    filterableFields: [],

    // Campos que se muestran en la lista (renderizarItem)
    displayFields: ['codigo', 'fecha_hora', 'servicio_id', 'persona_id', 'descripcion'],

    // Configuración específica para transaccionales (menos FK que rutas)
    foreignKeys: ['persona_id', 'estado_id', 'servicio_id'],

    // Validaciones específicas para tours activados
    validations: {
        codigo: {
            unique: true,
            endpoint: '/api/magic/tours-activados/verificar-codigo'
        }
    },

    // VALIDACIÓN DE ESTADOS NECESARIOS - LÓGICA DE NEGOCIO
    validateStates: async () => {
        try {
            const token = AuthService.getToken();
            const response = await fetch('/api/magic/estados/contexto/tour-activado', {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const estados = await response.json();

                // Estados necesarios para el flujo de negocio Tours
                const estadosNecesarios = ['Activado', 'En Ejecución', 'Cerrado'];

                const estadosFaltantes = estadosNecesarios.filter(necesario =>
                    !estados.some(estado =>
                        estado.estado_estado.toLowerCase().includes(necesario.toLowerCase())
                    )
                );

                if (estadosFaltantes.length > 0) {
                    return {
                        valido: false,
                        faltantes: estadosFaltantes,
                        mensaje: `Estados faltantes para tours activados: ${estadosFaltantes.join(', ')}`,
                        contexto: 'tour-activado'
                    };
                }

                return {
                    valido: true,
                    estados,
                    mensaje: 'Todos los estados necesarios están disponibles'
                };
            }
            return {
                valido: false,
                mensaje: 'Error al cargar estados de tours activados desde el servidor',
                contexto: 'tour-activado'
            };
        } catch (error) {
            console.error('Error validando estados de tours activados:', error);
            return {
                valido: false,
                mensaje: 'Error de conexión al validar estados de tours activados',
                contexto: 'tour-activado'
            };
        }
    },

    // DETECCIÓN DE ESTADOS ESPECÍFICOS
    stateDetection: {
        activado: (estado) => estado.estado_estado && (
            estado.estado_estado.toLowerCase().includes('activado') ||
            estado.estado_estado.toLowerCase().includes('programado') ||
            estado.estado_estado.toLowerCase().includes('pendiente')
        ),
        ejecucion: (estado) => estado.estado_estado && (
            estado.estado_estado.toLowerCase().includes('ejecución') ||
            estado.estado_estado.toLowerCase().includes('ejecutando') ||
            estado.estado_estado.toLowerCase().includes('en curso') ||
            estado.estado_estado.toLowerCase().includes('realizando')
        ),
        cerrado: (estado) => estado.estado_estado && (
            estado.estado_estado.toLowerCase().includes('cerrado') ||
            estado.estado_estado.toLowerCase().includes('completado') ||
            estado.estado_estado.toLowerCase().includes('finalizado')
        )
    },

    // OBTENER ESTADO POR TIPO
    getStateByType: async (tipo) => {
        try {
            const validation = await configToursActivados.validateStates();
            if (!validation.valido) {
                return null;
            }

            return validation.estados.find(estado =>
                configToursActivados.stateDetection[tipo] && configToursActivados.stateDetection[tipo](estado)
            );
        } catch (error) {
            console.error('Error obteniendo estado:', error);
            return null;
        }
    },

    // LÓGICA DE NEGOCIO - FLUJO DE ESTADOS SIN VEHÍCULOS
    businessLogic: {
        // Validar disponibilidad de guía interno
        canAssignGuide: async (personaId, fechaHora, tourId = null) => {
            if (!personaId) {
                return { valido: true }; // Guía opcional
            }

            try {
                const fecha = new Date(fechaHora).toISOString().split('T')[0];
                const response = await fetch('/api/magic/tours-activados');

                if (response.ok) {
                    const tours = await response.json();
                    const toursData = tours.data || tours;

                    // Verificar conflictos de horario para el guía
                    const conflicto = toursData.some(tour => {
                        if (tourId && tour.id === tourId) return false; // Excluir el tour actual al editar

                        if (tour.persona_id === personaId && tour.activo) {
                            const fechaTour = new Date(tour.fecha_completa).toISOString().split('T')[0];
                            return fechaTour === fecha; // Mismo día
                        }
                        return false;
                    });

                    if (conflicto) {
                        return {
                            valido: false,
                            mensaje: 'El guía ya está asignado a otro tour en esa fecha'
                        };
                    }
                }

                return { valido: true };
            } catch (error) {
                console.error('Error verificando disponibilidad de guía:', error);
                return { valido: false, mensaje: 'Error de conexión' };
            }
        },

        // Validar que se puede cerrar el tour (sin restricciones de vehículo)
        canCloseTour: async (tourActivado) => {
            if (!tourActivado.estado) {
                return { valido: false, mensaje: 'Tour no tiene estado definido' };
            }

            if (configToursActivados.stateDetection.cerrado(tourActivado.estado)) {
                return { valido: false, mensaje: 'El tour ya está cerrado' };
            }

            return { valido: true, mensaje: 'Tour puede ser cerrado' };
        }
    },

    // HELPERS DE FORMATEO
    helpers: {
        // Obtener color de badge según estado de tour
        getStateColor: (estado) => {
            if (!estado) return 'gris';

            if (configToursActivados.stateDetection.activado(estado)) return 'azul';
            if (configToursActivados.stateDetection.ejecucion(estado)) return 'verde';
            if (configToursActivados.stateDetection.cerrado(estado)) return 'gris';

            return 'gris';
        },

        // Obtener texto de estado para mostrar
        getStateText: (estado) => {
            if (!estado) return 'Sin estado';

            if (configToursActivados.stateDetection.activado(estado)) return 'Activado';
            if (configToursActivados.stateDetection.ejecucion(estado)) return 'En Ejecución';
            if (configToursActivados.stateDetection.cerrado(estado)) return 'Cerrado';

            return estado.estado_estado || 'Estado desconocido';
        },

        // Validar si puede recibir reservas (siempre puede, sin límite)
        canReceiveReservations: (tourActivado) => {
            if (!tourActivado.estado) return false;

            // Tours pueden recibir reservas si están "Activados" (sin límite de capacidad)
            return configToursActivados.stateDetection.activado(tourActivado.estado);
        },

        // Obtener tours que pueden recibir reservas
        getAvailableTours: (toursActivados) => {
            return toursActivados.filter(tour =>
                tour.activo &&
                tour.estado &&
                configToursActivados.helpers.canReceiveReservations(tour)
            );
        },

        // Formatear información del guía
        formatGuideInfo: (tourActivado) => {
            if (!tourActivado.persona_id || !tourActivado.guia) {
                return 'Guía externo';
            }

            return `Guía: ${tourActivado.guia.nombre || 'N/A'}`;
        },

        // Formatear duración
        formatDuration: (tourActivado) => {
            if (!tourActivado.duracion_horas) {
                return 'Duración no especificada';
            }

            const horas = Math.floor(tourActivado.duracion_horas);
            const minutos = Math.round((tourActivado.duracion_horas - horas) * 60);

            if (minutos === 0) {
                return `${horas} hora${horas !== 1 ? 's' : ''}`;
            } else {
                return `${horas}h ${minutos}m`;
            }
        },

        // Obtener notificaciones inteligentes
        obtenerNotificaciones: async (tourActivado) => {
            try {
                const response = await fetch(`/api/magic/tours-activados/${tourActivado.id}/notificaciones`);
                if (response.ok) {
                    return await response.json();
                }
                return { notificaciones: [] };
            } catch (error) {
                console.warn('Error obteniendo notificaciones:', error);
                return { notificaciones: [] };
            }
        },

        // Validar antes de agregar reserva (siempre válido)
        validarAgregarReserva: async (tourActivado, adultos, ninos = 0) => {
            try {
                const response = await fetch(`/api/magic/tours-activados/${tourActivado.id}/validar-reserva`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ adultos, ninos })
                });
                if (response.ok) {
                    return await response.json();
                }
                return { puede_recibir: true, mensaje: 'Tour sin límite de capacidad' };
            } catch (error) {
                console.warn('Error validando reserva:', error);
                return { puede_recibir: true, mensaje: 'Tours no tienen límite de capacidad' };
            }
        },

        // Formatear información de capacidad (sin límite)
        formatCapacidadDetallada: (disponibilidadDetallada) => {
            if (!disponibilidadDetallada) return 'Sin información de disponibilidad';

            const { total_reservas, total_pasajeros } = disponibilidadDetallada;

            return {
                texto_completo: `${total_reservas} reservas • ${total_pasajeros} pasajeros • Sin límite de capacidad`,
                texto_corto: `${total_reservas} reservas • ${total_pasajeros} pax`,
                reservas: `${total_reservas} reservas`,
                pasajeros: `${total_pasajeros} pasajeros`,
                disponibilidad: 'Sin límite de capacidad',
                porcentaje: 'N/A'
            };
        },

        // Color para indicador (siempre verde para tours)
        getCapacityColor: () => 'verde',

        // Obtener estado desde API
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
        // Validar disponibilidad de guía
        validateGuideAssignment: async (formData, tourId = null) => {
            if (!formData.persona_id) {
                return { valido: true }; // Guía opcional
            }

            const validation = await configToursActivados.businessLogic.canAssignGuide(
                formData.persona_id,
                formData.tour_activado_fecha_hora || formData.fecha_hora,
                tourId
            );

            return validation;
        },

        // Validar fecha y hora
        validateDateTime: (formData) => {
            const fechaField = formData.tour_activado_fecha_hora || formData.fecha_hora;
            if (!fechaField) {
                return { valido: true }; // Se valida como requerido en otro lugar
            }

            const fechaSeleccionada = new Date(fechaField);
            const hoy = new Date();

            if (fechaSeleccionada < hoy) {
                return {
                    valido: false,
                    mensaje: 'No se puede programar un tour en el pasado'
                };
            }

            return { valido: true };
        },

        // Validar duración
        validateDuration: (formData) => {
            const duracion = formData.tour_activado_duracion_horas || formData.duracion_horas;
            if (duracion !== undefined && duracion !== null && duracion !== '') {
                const duracionNum = parseFloat(duracion);
                if (isNaN(duracionNum) || duracionNum < 0 || duracionNum > 24) {
                    return {
                        valido: false,
                        mensaje: 'La duración debe estar entre 0 y 24 horas'
                    };
                }
            }

            return { valido: true };
        }
    },

    // Configuración de formulario por pasos
    formSteps: [
        {
            title: 'Información Básica',
            description: 'Fecha, hora y servicio',
            fields: ['fecha_hora', 'servicio_id']
        },
        {
            title: 'Detalles del Tour',
            description: 'Descripción, punto de encuentro y duración',
            fields: ['descripcion', 'punto_encuentro', 'duracion_horas']
        },
        {
            title: 'Asignación y Estado',
            description: 'Guía opcional y estado',
            fields: ['persona_id', 'estado_id']
        }
    ],

    // Valores por defecto al crear
    defaultValues: {
        activo: 1,
        duracion_horas: 2.0
    },

    // Callbacks de cambio de campo
    onFieldChange: {
        servicio_id: (valor, formulario, setFormulario) => {
            console.log('Servicio seleccionado:', valor);
        },
        fecha_hora: (valor, formulario, setFormulario) => {
            console.log('Fecha y hora programada:', valor);
        },
        persona_id: async (valor, formulario, setFormulario, showNotification) => {
            if (valor && formulario.fecha_hora) {
                const validation = await configToursActivados.businessLogic.canAssignGuide(
                    valor,
                    formulario.fecha_hora,
                    formulario.id
                );
                if (!validation.valido && showNotification) {
                    showNotification('warning', validation.mensaje);
                }
            }
        }
    },

    // Validación completa del formulario
    validateForm: async (formulario, tourId = null) => {
        const errores = {};

        // Validar fecha/hora
        const validacionFecha = configToursActivados.integrityValidators.validateDateTime(formulario);
        if (!validacionFecha.valido) {
            errores.tour_activado_fecha_hora = validacionFecha.mensaje;
            errores.fecha_hora = validacionFecha.mensaje;
        }

        // Validar guía disponible
        const validacionGuia = await configToursActivados.integrityValidators.validateGuideAssignment(formulario, tourId);
        if (!validacionGuia.valido) {
            errores.persona_id = validacionGuia.mensaje;
        }

        // Validar duración
        const validacionDuracion = configToursActivados.integrityValidators.validateDuration(formulario);
        if (!validacionDuracion.valido) {
            errores.tour_activado_duracion_horas = validacionDuracion.mensaje;
            errores.duracion_horas = validacionDuracion.mensaje;
        }

        return errores;
    },

    // Procesar datos antes de guardar
    processBeforeSave: (datos) => {
        // Convertir campos del frontend al formato backend
        if (datos.fecha_hora) {
            datos.tour_activado_fecha_hora = datos.fecha_hora;
            delete datos.fecha_hora;
        }

        if (datos.codigo) {
            datos.tour_activado_codigo = datos.codigo;
            delete datos.codigo;
        }

        if (datos.descripcion !== undefined) {
            datos.tour_activado_descripcion = datos.descripcion;
            delete datos.descripcion;
        }

        if (datos.punto_encuentro !== undefined) {
            datos.tour_activado_punto_encuentro = datos.punto_encuentro;
            delete datos.punto_encuentro;
        }

        if (datos.duracion_horas !== undefined) {
            datos.tour_activado_duracion_horas = datos.duracion_horas;
            delete datos.duracion_horas;
        }

        if (datos.activo !== undefined) {
            datos.tour_activado_situacion = datos.activo;
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

    // Configuración específica para rutas adicionales
    additionalRoutes: {
        activate: '/api/magic/tours-activados/{id}/activate',
        deactivate: '/api/magic/tours-activados/{id}/deactivate',
        porPersona: '/api/magic/tours-activados/persona/{personaId}',
        porEstado: '/api/magic/tours-activados/estado/{estadoId}',
        porServicio: '/api/magic/tours-activados/servicio/{servicioId}',
        conGuiaInterno: '/api/magic/tours-activados/con-guia-interno',
        conGuiaExterno: '/api/magic/tours-activados/con-guia-externo',
        verificarCodigo: '/api/magic/tours-activados/verificar-codigo',
        buscarDisponible: '/api/magic/tours-activados/buscar-disponible',
        notificaciones: '/api/magic/tours-activados/{id}/notificaciones',
        validarReserva: '/api/magic/tours-activados/{id}/validar-reserva',
        procesarReserva: '/api/magic/tours-activados/{id}/procesar-reserva',
        cerrarTour: '/api/magic/tours-activados/{id}/cerrar',
        asignarGuia: '/api/magic/tours-activados/{id}/asignar-guia',
        completarInfo: '/api/magic/tours-activados/{id}/completar-info'
    },

    // CONFIGURACIÓN PARA MODAL DE DETALLES
    camposDetalles: {
        excluir: [
            'created_at', 'updated_at', 'deleted_at',
            'tour_activado_situacion',
            'fecha_completa',
            'fecha_formateada',
            'fecha_iso',
            'activo'
        ],
        traducciones: {
            'id': 'ID',
            'codigo': 'Código',
            'fecha_hora': 'Fecha y Hora del Tour',
            'descripcion': 'Descripción',
            'punto_encuentro': 'Punto de Encuentro',
            'duracion_horas': 'Duración (Horas)',
            'persona_id': 'ID Guía',
            'servicio_id': 'ID Servicio',
            'estado_id': 'ID Estado',
            // Campos de relaciones
            'servicio': 'Servicio',
            'guia': 'Guía',
            'estado': 'Estado'
        },
        // Orden de campos
        orden: [
            'codigo', 'fecha_hora', 'servicio', 'descripcion',
            'punto_encuentro', 'duracion_horas', 'guia', 'estado'
        ]
    }
};

// EXPORTAR CONFIGURACIÓN
export const toursActivadosConfig = {
    toursActivados: configToursActivados
};
