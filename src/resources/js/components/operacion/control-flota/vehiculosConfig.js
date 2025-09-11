// src/resources/js/components/operacion/control-flota/vehiculosConfig.js

/**
 * CONFIGURACIÓN ESPECÍFICA PARA VEHÍCULOS (TABLA VEHICULO)
 * Adaptado para tabla con FK hacia estado y sistema de notificaciones
 */
import AuthService from '../../../services/auth';
import apiHelper from '../../../utils/apiHelper';

// CONFIGURACIÓN BASE COMPARTIDA
const baseConfig = {
    defaultItemsPerPage: 10,
    defaultSortDirection: 'asc',
    statusField: 'activo',
    searchableFields: [],
    apiEndpoint: '/api/magic'
};

// CONFIGURACIÓN ESPECÍFICA PARA VEHÍCULOS
export const configVehiculos = {
    ...baseConfig,
    tableName: 'vehiculos',
    displayName: 'Vehículos',
    primaryKey: 'vehiculo_id',
    defaultSortField: 'placa',
    nameField: 'vehiculo_placa',

    // Campos de la tabla con configuración
    fields: {
        vehiculo_id: {
            label: 'ID',
            type: 'number',
            sortable: true,
            filterable: false,
            sortType: 'numeric'
        },
        vehiculo_codigo: {
            label: 'Código',
            type: 'text',
            sortable: true,
            filterable: true,
            sortType: 'alphabetic',
            placeholder: 'Se genera automáticamente'
        },
        vehiculo_placa: {
            label: 'Placa',
            type: 'text',
            sortable: true,
            filterable: true,
            sortType: 'alphabetic',
            required: true,
            placeholder: 'Placa del vehículo'
        },
        vehiculo_marca: {
            label: 'Marca',
            type: 'text',
            sortable: true,
            filterable: true,
            sortType: 'alphabetic',
            required: true,
            placeholder: 'Marca del vehículo'
        },
        vehiculo_modelo: {
            label: 'Modelo',
            type: 'text',
            sortable: true,
            filterable: true,
            sortType: 'alphabetic',
            required: false,
            placeholder: 'Modelo del vehículo'
        },
        vehiculo_capacidad: {
            label: 'Capacidad',
            type: 'number',
            sortable: true,
            filterable: true,
            sortType: 'numeric',
            required: true,
            placeholder: 'Número de pasajeros'
        },
        estado_id: {
            label: 'Estado del Vehículo',
            type: 'foreign_key',
            sortable: true,
            filterable: true,
            sortType: 'numeric',
            required: true,
            relatedTable: 'estado',
            relatedKey: 'estado_id',
            displayField: 'estado_estado',
            endpoint: '/api/magic/estados/contexto/vehiculo'
        },
        vehiculo_situacion: {
            label: 'Estado',
            type: 'select',
            sortable: true,
            filterable: true,
            options: [
                { value: 1, label: 'Activo' },
                { value: 0, label: 'Inactivo' }
            ]
        }
    },

    // Campos específicos para funcionalidades
    searchableFields: ['codigo', 'placa', 'marca', 'modelo'],
    sortableFields: ['placa', 'marca', 'codigo'],
    filterableFields: [],

    // Campos que se muestran en la lista (renderizarItem)
    displayFields: ['vehiculo_placa', 'vehiculo_marca', 'vehiculo_modelo', 'vehiculo_capacidad', 'estado_id'],

    // Configuración específica para dependientes simples
    foreignKeys: ['estado_id'],

    // Validaciones específicas
    validations: {
        vehiculo_placa: {
            unique: true,
            endpoint: '/api/magic/vehiculos/verificar-placa'
        }
    },

    // VALIDACIÓN DE ESTADOS NECESARIOS - ACTUALIZADA PARA FLUJO DE NEGOCIO
    validateStates: async () => {
        try {
            const response = await apiHelper.get('/estados/contexto/vehiculo');
            const estados = await apiHelper.handleResponse(response);

            // Estados necesarios para el flujo de negocio Magic Travel
            const estadosNecesarios = ['Disponible', 'Mantenimiento', 'Asignado'];

            const estadosFaltantes = estadosNecesarios.filter(necesario =>
                !estados.some(estado =>
                    estado.estado_estado.toLowerCase() === necesario.toLowerCase()
                )
            );

            if (estadosFaltantes.length > 0) {
                return {
                    valido: false,
                    faltantes: estadosFaltantes,
                    mensaje: `Estados faltantes para vehículos: ${estadosFaltantes.join(', ')}`,
                    contexto: 'vehiculo'
                };
            }

            return {
                valido: true,
                estados,
                mensaje: 'Todos los estados necesarios están disponibles'
            };
        } catch (error) {
            console.error('Error validando estados de vehículos:', error);
            return {
                valido: false,
                mensaje: 'Error de conexión al validar estados de vehículos',
                contexto: 'vehiculo'
            };
        }
    },

    // DETECCIÓN DE ESTADOS ESPECÍFICOS - ACTUALIZADA
    stateDetection: {
        disponible: (estado) => {
            const estadoTexto = estado.nombre || estado.estado_estado || '';
            return estadoTexto && (
                estadoTexto.toLowerCase().includes('disponible') ||
                estadoTexto.toLowerCase().includes('activo') ||
                estadoTexto.toLowerCase().includes('operativo')
            );
        },
        mantenimiento: (estado) => {
            const estadoTexto = estado.nombre || estado.estado_estado || '';
            return estadoTexto && (
                estadoTexto.toLowerCase().includes('mantenimiento') ||
                estadoTexto.toLowerCase().includes('taller') ||
                estadoTexto.toLowerCase().includes('reparacion')
            );
        },
        asignado: (estado) => {
            const estadoTexto = estado.nombre || estado.estado_estado || '';
            return estadoTexto && (
                estadoTexto.toLowerCase().includes('asignado') ||
                estadoTexto.toLowerCase().includes('ocupado') ||
                estadoTexto.toLowerCase().includes('ruta')
            );
        }
    },

    // OBTENER ESTADO POR TIPO
    getStateByType: async (tipo) => {
        try {
            const validation = await configVehiculos.validateStates();
            if (!validation.valido) {
                return null;
            }

            return validation.estados.find(estado =>
                configVehiculos.stateDetection[tipo] && configVehiculos.stateDetection[tipo](estado)
            );
        } catch (error) {
            console.error('Error obteniendo estado:', error);
            return null;
        }
    },

    // FLUJO DE ESTADOS PARA VEHÍCULOS - LÓGICA DE NEGOCIO MAGIC TRAVEL
    stateFlow: {
        // Solo vehículos "Disponible" pueden asignarse a rutas
        canAssignToRoute: (vehiculo) => {
            return vehiculo.estado && configVehiculos.stateDetection.disponible(vehiculo.estado);
        },

        // Transiciones automáticas del sistema
        autoTransitions: {
            // Disponible → Asignado (cuando se crea ruta activada)
            onRouteAssigned: async (vehiculoId) => {
                try {
                    const estadoAsignado = await configVehiculos.getStateByType('asignado');
                    if (estadoAsignado) {
                        return {
                            vehiculo_id: vehiculoId,
                            estado_id: estadoAsignado.estado_id,
                            motivo: 'Vehículo asignado automáticamente a ruta activada'
                        };
                    }
                    return null;
                } catch (error) {
                    console.error('Error en transición automática:', error);
                    return null;
                }
            },

            // Asignado → Disponible (cuando se cierra ruta)
            onRouteCompleted: async (vehiculoId) => {
                try {
                    const estadoDisponible = await configVehiculos.getStateByType('disponible');
                    if (estadoDisponible) {
                        return {
                            vehiculo_id: vehiculoId,
                            estado_id: estadoDisponible.estado_id,
                            motivo: 'Vehículo liberado automáticamente al cerrar ruta'
                        };
                    }
                    return null;
                } catch (error) {
                    console.error('Error en transición automática:', error);
                    return null;
                }
            }
        },

        // Validaciones de transiciones
        canTransitionTo: (estadoActual, estadoDestino) => {
            const transicionesPermitidas = {
                'disponible': ['mantenimiento', 'asignado'],
                'mantenimiento': ['disponible'],
                'asignado': ['disponible', 'mantenimiento'] // Solo si no hay ruta activa
            };

            const actualKey = Object.keys(configVehiculos.stateDetection).find(key =>
                configVehiculos.stateDetection[key]({ estado_estado: estadoActual })
            );

            const destinoKey = Object.keys(configVehiculos.stateDetection).find(key =>
                configVehiculos.stateDetection[key]({ estado_estado: estadoDestino })
            );

            return transicionesPermitidas[actualKey]?.includes(destinoKey) || false;
        }
    },

    // VALIDACIONES DE INTEGRIDAD ESPECÍFICAS
    integrityValidators: {
        // Validar capacidad del vehículo
        validateCapacity: (vehiculoData) => {
            if (!vehiculoData.vehiculo_capacidad || vehiculoData.vehiculo_capacidad < 1) {
                return {
                    valido: false,
                    mensaje: 'La capacidad debe ser mayor a 0'
                };
            }
            if (vehiculoData.vehiculo_capacidad > 60) {
                return {
                    valido: false,
                    mensaje: 'Capacidad máxima razonable: 60 pasajeros'
                };
            }
            return { valido: true };
        },

        // Validar placa (sin formato, solo unicidad)
        validatePlate: async (vehiculoData, vehiculoId = null) => {
            return { valido: true };
        },

        // Validar estado apropiado para vehículos
        validateState: async (vehiculoData) => {
            if (!vehiculoData.estado_id) {
                return { valido: true };
            }

            try {
                const response = await apiHelper.get('/estados/contexto/vehiculo');
                const estadosVehiculo = await apiHelper.handleResponse(response);

                const estadoValido = estadosVehiculo.some(estado =>
                    estado.estado_id == vehiculoData.estado_id
                );

                if (!estadoValido) {
                    return {
                        valido: false,
                        mensaje: 'Debe seleccionar un estado válido para vehículos'
                    };
                }
            } catch (error) {
                console.warn('Error validando estado de vehículo:', error);
            }

            return { valido: true };
        },

        // NUEVA: Validar si puede cambiar de estado (considerando rutas activas)
        validateStateChange: async (vehiculo, nuevoEstadoId) => {
            // Si intenta cambiar a "disponible" desde "asignado", verificar que no tenga rutas activas
            if (configVehiculos.stateDetection.asignado(vehiculo.estado)) {
                try {
                    const response = await apiHelper.get(`/vehiculos/${vehiculo.vehiculo_id}/rutas-activas`);
                    const rutasActivas = await apiHelper.handleResponse(response);

                    if (rutasActivas.length > 0) {
                        return {
                            valido: false,
                            mensaje: 'No se puede cambiar el estado: el vehículo tiene rutas activas asignadas',
                            rutasActivas: rutasActivas
                        };
                    }
                } catch (error) {
                    console.warn('No se pudo verificar rutas activas:', error);
                }
            }

            return { valido: true };
        }
    },

    // FUNCIONES HELPER ESPECÍFICAS
    helpers: {
        // Formatear placa para mostrar
        formatPlate: (placa) => {
            if (!placa) return 'Sin placa';
            return placa.toUpperCase();
        },

        // Obtener color de badge según estado
        getStateColor: (estado) => {
            if (!estado) return 'gris';

            if (configVehiculos.stateDetection.disponible(estado)) return 'verde';
            if (configVehiculos.stateDetection.mantenimiento(estado)) return 'naranja';
            if (configVehiculos.stateDetection.asignado(estado)) return 'azul';

            return 'gris';
        },

        // Obtener texto de estado para mostrar
        getStateText: (estado) => {
            if (!estado) return 'Sin estado';

            if (configVehiculos.stateDetection.disponible(estado)) return 'Disponible';
            if (configVehiculos.stateDetection.mantenimiento(estado)) return 'Mantenimiento';
            if (configVehiculos.stateDetection.asignado(estado)) return 'Asignado';

            return estado.nombre || estado.estado_estado || 'Estado desconocido';
        },

        // Validar si puede cambiar a un estado específico
        canChangeToState: (vehiculoActual, nuevoEstado) => {
            if (!vehiculoActual.estado || !nuevoEstado) return false;

            return configVehiculos.stateFlow.canTransitionTo(
                vehiculoActual.estado.estado_estado,
                nuevoEstado.estado_estado
            );
        },

        // NUEVA: Obtener vehículos disponibles para asignar
        getAvailableVehicles: (vehiculos) => {
            return vehiculos.filter(vehiculo =>
                vehiculo.vehiculo_situacion &&
                vehiculo.estado &&
                configVehiculos.stateDetection.disponible(vehiculo.estado)
            );
        },

        // NUEVA: Obtener capacidad total de flota disponible
        getTotalAvailableCapacity: (vehiculos) => {
            return configVehiculos.helpers.getAvailableVehicles(vehiculos)
                .reduce((total, vehiculo) => total + (vehiculo.vehiculo_capacidad || 0), 0);
        }
    },

    // CONFIGURACIÓN DE FILTROS ESPECÍFICOS
    filters: {
        estado_vehiculo: {
            label: 'Estado del Vehículo',
            type: 'foreign_key',
            endpoint: '/api/magic/estados/contexto/vehiculo',
            displayField: 'estado_estado',
            valueField: 'estado_id'
        },
        capacidad: {
            label: 'Capacidad',
            type: 'range',
            min: 1,
            max: 60
        },
        marca: {
            label: 'Marca',
            type: 'select_dynamic',
            endpoint: '/api/magic/vehiculos',
            extractOptions: (data) => {
                const marcas = [...new Set(data.map(v => v.vehiculo_marca))];
                return marcas.map(marca => ({ value: marca, label: marca }));
            }
        },

        // NUEVO: Obtener notificaciones del vehículo
        obtenerNotificaciones: async (vehiculo) => {
            try {
                const response = await apiHelper.get(`/vehiculos/${vehiculo.vehiculo_id}/notificaciones`);
                return await apiHelper.handleResponse(response);
            } catch (error) {
                console.warn('Error obteniendo notificaciones:', error);
                return { notificaciones: [] };
            }
        },

        // NUEVO: Validar cambio de estado antes de ejecutar
        validarCambioEstado: async (vehiculo, nuevoEstado) => {
            try {
                const response = await apiHelper.post(`/vehiculos/${vehiculo.vehiculo_id}/validar-estado`, { nuevo_estado: nuevoEstado });
                return await apiHelper.handleResponse(response);
            } catch (error) {
                console.warn('Error validando cambio de estado:', error);
                return { puede_cambiar: false, mensaje: 'Error de conexión' };
            }
        }
    },

    // RUTAS ADICIONALES BASADAS EN CONTROLADOR REAL
    additionalRoutes: {
        activate: '/api/magic/vehiculos/{id}/activate',
        deactivate: '/api/magic/vehiculos/{id}/deactivate',
        verificarPlaca: '/api/magic/vehiculos/verificar-placa',
        porEstado: '/api/magic/vehiculos/estado/{estadoId}',
        cambiarEstado: '/api/magic/vehiculos/{id}/cambiar-estado',
        rutasActivas: '/api/magic/vehiculos/{id}/rutas-activas',
        notificaciones: '/api/magic/vehiculos/{id}/notificaciones',
        validarEstado: '/api/magic/vehiculos/{id}/validar-estado'
    },

    // ACCIONES ESPECÍFICAS BASADAS EN CONTROLADOR
    actions: {
        activate: {
            label: 'Activar Vehículo',
            icon: 'check-circle',
            color: 'green',
            condition: (vehiculo) => !vehiculo.activo,
            requiresConfirmation: true,
            confirmMessage: '¿Activar este vehículo?'
        },
        deactivate: {
            label: 'Desactivar Vehículo',
            icon: 'x-circle',
            color: 'red',
            condition: (vehiculo) => vehiculo.activo,
            requiresConfirmation: true,
            confirmMessage: '¿Desactivar este vehículo? No podrá ser usado en rutas.'
        },
        enviar_mantenimiento: {
            label: 'Enviar a Mantenimiento',
            icon: 'tool',
            color: 'orange',
            condition: (vehiculo) => vehiculo.estado && configVehiculos.stateDetection.disponible(vehiculo.estado),
            requiresConfirmation: true,
            confirmMessage: '¿Enviar este vehículo a mantenimiento?'
        },
        activar_servicio: {
            label: 'Poner en Servicio',
            icon: 'play-circle',
            color: 'blue',
            condition: (vehiculo) => vehiculo.estado && configVehiculos.stateDetection.mantenimiento(vehiculo.estado),
            requiresConfirmation: true,
            confirmMessage: '¿Poner este vehículo en servicio?'
        }
    },

    // PROCESAMIENTO DE DATOS ANTES DE GUARDAR
    processBeforeSave: (datos) => {
        if (datos.vehiculo_placa) {
            datos.vehiculo_placa = datos.vehiculo_placa.trim();
        }

        if (datos.vehiculo_marca) {
            datos.vehiculo_marca = datos.vehiculo_marca.trim();
        }

        if (datos.vehiculo_modelo) {
            datos.vehiculo_modelo = datos.vehiculo_modelo.trim();
        }

        if (datos.vehiculo_capacidad) {
            datos.vehiculo_capacidad = parseInt(datos.vehiculo_capacidad);
        }

        return datos;
    }
};

// EXPORTAR CONFIGURACIÓN
export const vehiculosConfig = {
    vehiculos: configVehiculos
};
