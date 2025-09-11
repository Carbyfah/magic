// src/resources/js/components/operacion/reservaciones/reservasConfig.js

/**
 * CONFIGURACIÓN ESPECÍFICA PARA RESERVAS - SINCRONIZADA CON NUEVA DB
 * Sistema de notificaciones y lógica de negocio Magic Travel
 * Estados: Pendiente, Confirmada, Cancelada
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

// CONFIGURACIÓN ESPECÍFICA PARA RESERVAS
export const configReservas = {
    ...baseConfig,
    tableName: 'reservas',
    displayName: 'Reservas',
    primaryKey: 'id',
    defaultSortField: 'created_at',
    nameField: 'codigo',

    // Campos de la tabla con configuración ACTUALIZADA
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
            width: 'medio'
        },
        nombres_cliente: {
            label: 'Nombres',
            type: 'text',
            sortable: true,
            filterable: false,
            sortType: 'alphabetic',
            required: true,
            placeholder: 'Nombres del cliente',
            width: 'medio'
        },
        apellidos_cliente: {
            label: 'Apellidos',
            type: 'text',
            sortable: true,
            filterable: false,
            sortType: 'alphabetic',
            required: true,
            placeholder: 'Apellidos del cliente',
            width: 'medio'
        },
        nit_cliente: {
            label: 'NIT',
            type: 'text',
            sortable: true,
            filterable: false,
            sortType: 'alphabetic',
            placeholder: 'NIT del cliente (opcional)',
            width: 'medio'
        },
        telefono_cliente: {
            label: 'Teléfono',
            type: 'tel',
            sortable: true,
            filterable: false,
            sortType: 'numeric',
            required: true,
            placeholder: 'Teléfono del cliente',
            width: 'medio'
        },
        email_cliente: {
            label: 'Email',
            type: 'email',
            sortable: true,
            filterable: false,
            sortType: 'alphabetic',
            placeholder: 'Email del cliente (opcional)',
            width: 'completo'
        },
        cantidad_adultos: {
            label: 'Adultos',
            type: 'number',
            sortable: true,
            filterable: false,
            sortType: 'numeric',
            required: true,
            min: 1,
            placeholder: 'Cantidad de adultos',
            width: 'medio'
        },
        cantidad_ninos: {
            label: 'Niños',
            type: 'number',
            sortable: true,
            filterable: false,
            sortType: 'numeric',
            min: 0,
            placeholder: 'Cantidad de niños',
            width: 'medio'
        },
        // CAMPO CALCULADO DINÁMICAMENTE - Sin envío a backend
        total_pasajeros: {
            label: 'Total Pasajeros',
            type: 'number',
            sortable: true,
            filterable: false,
            sortType: 'numeric',
            readonly: true,
            computed: true,
            computeFrom: ['cantidad_adultos', 'cantidad_ninos'],
            calculateOnFrontend: true // NUEVO: Se calcula solo en frontend
        },
        direccion_abordaje: {
            label: 'Punto de Abordaje',
            type: 'textarea',
            sortable: false,
            filterable: false,
            placeholder: 'Hotel, dirección o punto de recogida',
            width: 'completo'
        },
        notas: {
            label: 'Notas',
            type: 'textarea',
            sortable: false,
            filterable: false,
            placeholder: 'Observaciones adicionales',
            width: 'completo'
        },
        // MONTO CALCULADO POR TRIGGERS DE BD
        monto: {
            label: 'Monto',
            type: 'currency',
            sortable: true,
            filterable: false,
            sortType: 'numeric',
            readonly: true,
            computed: true,
            computedByDatabase: true, // NUEVO: Calculado por triggers de BD
            computeFrom: ['ruta_activada_id', 'cantidad_adultos', 'cantidad_ninos', 'agencia_id']
        },
        usuario_id: {
            label: 'Vendedor',
            type: 'foreign_key',
            sortable: true,
            filterable: false,
            sortType: 'numeric',
            required: true,
            relatedTable: 'usuarios',
            relatedKey: 'usuario_id',
            displayField: 'nombre_completo',
            endpoint: '/api/magic/usuarios',
            width: 'medio'
        },
        estado_id: {
            label: 'Estado',
            type: 'foreign_key',
            sortable: true,
            filterable: false,
            sortType: 'numeric',
            required: true,
            relatedTable: 'estados',
            relatedKey: 'estado_id',
            displayField: 'estado_estado',
            endpoint: '/api/magic/estados/contexto/reserva', // ENDPOINT CONTEXTUAL
            width: 'medio'
        },
        agencia_id: {
            label: 'Agencia',
            type: 'foreign_key',
            sortable: true,
            filterable: false,
            sortType: 'numeric',
            nullable: true,
            relatedTable: 'agencias',
            relatedKey: 'agencia_id',
            displayField: 'agencia_razon_social',
            endpoint: '/api/magic/agencias',
            width: 'completo',
            placeholder: 'Opcional - Venta directa si está vacío'
        },
        ruta_activada_id: {
            label: 'Ruta Programada',
            type: 'foreign_key',
            sortable: true,
            filterable: false,
            sortType: 'numeric',
            required: true,
            relatedTable: 'rutasActivadas',
            relatedKey: 'ruta_activada_id',
            displayField: 'ruta_completa',
            endpoint: '/api/magic/rutas-activadas',
            width: 'completo'
        },
        activo: {
            label: 'Estado',
            type: 'select',
            sortable: true,
            filterable: false,
            options: [
                { value: 1, label: 'Activa' },
                { value: 0, label: 'Inactiva' }
            ]
        }
    },

    // Campos específicos para funcionalidades
    searchableFields: ['codigo', 'nombres_cliente', 'apellidos_cliente', 'telefono_cliente', 'email_cliente'],
    sortableFields: ['codigo', 'nombres_cliente', 'apellidos_cliente', 'monto', 'created_at'],
    filterableFields: [],

    // Campos que se muestran en la lista (renderizarItem)
    displayFields: ['codigo', 'nombres_cliente', 'telefono_cliente', 'total_pasajeros', 'estado_id', 'monto'],

    // Configuración específica para transaccionales (múltiples FK)
    foreignKeys: ['usuario_id', 'estado_id', 'agencia_id', 'ruta_activada_id'],

    // Validaciones específicas para reservas
    validations: {
        codigo: {
            unique: true,
            endpoint: '/api/magic/reservas/verificar-codigo'
        },
        telefono_cliente: {
            pattern: /^[0-9]{8}$/,
            message: 'Teléfono debe tener 8 dígitos'
        },
        email_cliente: {
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Email no válido'
        }
    },

    // VALIDACIÓN DE ESTADOS NECESARIOS - LÓGICA DE NEGOCIO
    validateStates: async () => {
        try {
            const token = AuthService.getToken();
            const response = await fetch('/api/magic/estados/contexto/reserva', {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const estados = await response.json();

                // Estados necesarios para el flujo de negocio Magic Travel
                const estadosNecesarios = ['Pendiente', 'Confirmada', 'Cancelada'];

                const estadosFaltantes = estadosNecesarios.filter(necesario =>
                    !estados.some(estado =>
                        estado.estado_estado.toLowerCase() === necesario.toLowerCase()
                    )
                );

                if (estadosFaltantes.length > 0) {
                    return {
                        valido: false,
                        faltantes: estadosFaltantes,
                        mensaje: `Estados faltantes para reservas: ${estadosFaltantes.join(', ')}`,
                        contexto: 'reserva'
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
                mensaje: 'Error al cargar estados de reservas desde el servidor',
                contexto: 'reserva'
            };
        } catch (error) {
            console.error('Error validando estados de reservas:', error);
            return {
                valido: false,
                mensaje: 'Error de conexión al validar estados de reservas',
                contexto: 'reserva'
            };
        }
    },

    // DETECCIÓN DE ESTADOS ESPECÍFICOS
    stateDetection: {
        pendiente: (estado) => estado.estado_estado && (
            estado.estado_estado.toLowerCase().includes('pendiente') ||
            estado.estado_estado.toLowerCase().includes('nueva') ||
            estado.estado_estado.toLowerCase().includes('recibida')
        ),
        confirmada: (estado) => estado.estado_estado && (
            estado.estado_estado.toLowerCase().includes('confirm') ||
            estado.estado_estado.toLowerCase().includes('aprobada') ||
            estado.estado_estado.toLowerCase().includes('aceptada')
        ),
        cancelada: (estado) => estado.estado_estado && (
            estado.estado_estado.toLowerCase().includes('cancel') ||
            estado.estado_estado.toLowerCase().includes('anulada') ||
            estado.estado_estado.toLowerCase().includes('rechazada')
        )
    },

    // OBTENER ESTADO POR TIPO
    getStateByType: async (tipo) => {
        try {
            const validation = await configReservas.validateStates();
            if (!validation.valido) {
                return null;
            }

            return validation.estados.find(estado =>
                configReservas.stateDetection[tipo] && configReservas.stateDetection[tipo](estado)
            );
        } catch (error) {
            console.error('Error obteniendo estado:', error);
            return null;
        }
    },

    // LÓGICA DE NEGOCIO - FLUJO DE ESTADOS
    businessLogic: {
        // Validar que solo reservas pendientes puedan confirmarse
        canConfirm: (reserva) => {
            return reserva.estado && configReservas.stateDetection.pendiente(reserva.estado);
        },

        // Validar que reservas pendientes y confirmadas puedan cancelarse
        canCancel: (reserva) => {
            if (!reserva.estado) return false;
            return configReservas.stateDetection.pendiente(reserva.estado) ||
                configReservas.stateDetection.confirmada(reserva.estado);
        },

        // Validar que solo reservas confirmadas puedan facturarse
        canGenerateInvoice: (reserva) => {
            return reserva.estado && configReservas.stateDetection.confirmada(reserva.estado);
        },

        // Las reservas canceladas no pueden cambiar de estado
        canChangeFromCancelled: (reserva) => {
            return !(reserva.estado && configReservas.stateDetection.cancelada(reserva.estado));
        },

        // Validar que solo reservas confirmadas puedan facturarse
        canGenerateInvoice: (reserva) => {
            return reserva.estado && configReservas.stateDetection.confirmada(reserva.estado);
        },

        // Validar si ya está facturada
        isInvoiced: (reserva) => {
            return reserva.tiene_factura || reserva.esta_facturada;
        }
    },

    // HELPERS DE FORMATEO
    helpers: {
        // Obtener color de badge según estado de reserva
        getStateColor: (estado) => {
            if (!estado) return 'gris';

            if (configReservas.stateDetection.pendiente(estado)) return 'naranja';
            if (configReservas.stateDetection.confirmada(estado)) return 'verde';
            if (configReservas.stateDetection.cancelada(estado)) return 'rojo';

            return 'gris';
        },

        // Obtener texto de estado para mostrar
        getStateText: (estado) => {
            if (!estado) return 'Sin estado';

            if (configReservas.stateDetection.pendiente(estado)) return 'Pendiente';
            if (configReservas.stateDetection.confirmada(estado)) return 'Confirmada';
            if (configReservas.stateDetection.cancelada(estado)) return 'Cancelada';

            return estado.estado_estado || 'Estado desconocido';
        },

        // Validar si puede cambiar a un estado específico
        canChangeToState: (reservaActual, nuevoEstado) => {
            if (!reservaActual.estado || !nuevoEstado) return false;

            return configReservas.stateFlow.canTransitionTo(
                reservaActual.estado.estado_estado,
                nuevoEstado.estado_estado
            );
        },

        // NUEVO: Obtener reservas que pueden ser confirmadas
        getConfirmableReservations: (reservas) => {
            return reservas.filter(reserva =>
                reserva.activo &&
                reserva.estado &&
                configReservas.businessLogic.canConfirm(reserva)
            );
        },

        // NUEVO: Obtener reservas que pueden ser facturadas
        getInvoiceableReservations: (reservas) => {
            return reservas.filter(reserva =>
                reserva.activo &&
                reserva.estado &&
                configReservas.businessLogic.canGenerateInvoice(reserva)
            );
        },

        // NUEVO: Obtener notificaciones inteligentes
        obtenerNotificaciones: async (reserva) => {
            try {
                const response = await fetch(`/api/magic/reservas/${reserva.id}/notificaciones`);
                if (response.ok) {
                    return await response.json();
                }
                return { notificaciones: [] };
            } catch (error) {
                console.warn('Error obteniendo notificaciones:', error);
                return { notificaciones: [] };
            }
        },

        // NUEVO: Validar antes de cambiar estado
        validarCambioEstado: async (reserva, nuevoEstado) => {
            try {
                const response = await fetch(`/api/magic/reservas/${reserva.id}/validar-estado`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ nuevo_estado: nuevoEstado })
                });
                if (response.ok) {
                    return await response.json();
                }
                return { puede_cambiar: false, mensaje: 'Error de validación' };
            } catch (error) {
                console.warn('Error validando cambio de estado:', error);
                return { puede_cambiar: false, mensaje: 'Error de conexión' };
            }
        }
    },

    // FLUJO DE ESTADOS - SOLO 3 ESTADOS
    stateFlow: {
        canTransitionTo: (estadoActual, estadoDestino) => {
            const transicionesPermitidas = {
                'pendiente': ['confirmada', 'cancelada'],
                'confirmada': ['cancelada'], // Solo puede cancelarse
                'cancelada': [] // Estado final
            };

            const actualKey = Object.keys(configReservas.stateDetection).find(key =>
                configReservas.stateDetection[key]({ estado_estado: estadoActual })
            );

            const destinoKey = Object.keys(configReservas.stateDetection).find(key =>
                configReservas.stateDetection[key]({ estado_estado: estadoDestino })
            );

            return transicionesPermitidas[actualKey]?.includes(destinoKey) || false;
        }
    },

    // VALIDADORES DE INTEGRIDAD
    integrityValidators: {
        // Validar que los triggers estén funcionando
        validateTriggers: async (reservaData) => {
            // Verificar que el monto se calculó automáticamente
            if (!reservaData.monto || reservaData.monto <= 0) {
                console.warn('Los triggers de cálculo automático pueden no estar funcionando');
                return {
                    valido: false,
                    mensaje: 'Error en cálculo automático de monto'
                };
            }
            return { valido: true };
        },

        // Validar capacidad antes de guardar
        validateCapacity: async (formData) => {
            if (!formData.ruta_activada_id || !formData.cantidad_adultos) {
                return { valido: true }; // No hay suficientes datos para validar
            }

            const totalPasajeros = parseInt(formData.cantidad_adultos) + parseInt(formData.cantidad_ninos || 0);

            try {
                const response = await fetch('/api/magic/reservas/buscar-disponibilidad', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        servicio_id: formData.servicio_id,
                        fecha: formData.fecha,
                        pasajeros: totalPasajeros
                    })
                });

                const result = await response.json();
                return {
                    valido: result.ruta_disponible > 0,
                    mensaje: result.mensaje
                };
            } catch (error) {
                console.error('Error validando capacidad:', error);
                return { valido: true }; // No bloquear por error de validación
            }
        },

        // Validar estado apropiado para reservas
        validateState: async (formData) => {
            if (!formData.estado_id) {
                return { valido: true };
            }

            try {
                const response = await fetch('/api/magic/estados/contexto/reserva');
                if (response.ok) {
                    const estadosReserva = await response.json();
                    const estadoValido = estadosReserva.some(estado =>
                        estado.estado_id == formData.estado_id
                    );

                    if (!estadoValido) {
                        return {
                            valido: false,
                            mensaje: 'Debe seleccionar un estado válido para reservas'
                        };
                    }
                }
            } catch (error) {
                console.warn('Error validando estado de reserva:', error);
            }

            return { valido: true };
        }
    },

    // Configuración de formulario por pasos (wizard)
    formSteps: [
        {
            title: 'Información del Cliente',
            description: 'Datos personales y contacto',
            fields: ['nombres_cliente', 'apellidos_cliente', 'telefono_cliente', 'email_cliente', 'nit_cliente']
        },
        {
            title: 'Detalles del Viaje',
            description: 'Pasajeros y punto de abordaje',
            fields: ['cantidad_adultos', 'cantidad_ninos', 'direccion_abordaje', 'notas']
        },
        {
            title: 'Asignación y Venta',
            description: 'Ruta, agencia y vendedor',
            fields: ['ruta_activada_id', 'agencia_id', 'usuario_id', 'estado_id'],
            validate: (formulario) => {
                const errores = {};
                if (formulario.cantidad_adultos && formulario.cantidad_ninos) {
                    const total = parseInt(formulario.cantidad_adultos) + parseInt(formulario.cantidad_ninos || 0);
                    if (total > 15) {
                        errores.cantidad_adultos = 'Máximo 15 pasajeros por reserva';
                    }
                }
                return errores;
            }
        }
    ],

    // Valores por defecto al crear
    defaultValues: {
        activo: 1,
        cantidad_ninos: 0
    },

    // Dependencias entre campos ACTUALIZADAS
    fieldDependencies: {
        // Total pasajeros se calcula solo en frontend
        cantidad_adultos: ['total_pasajeros'],
        cantidad_ninos: ['total_pasajeros'],
        // Monto se calcula automáticamente por triggers de BD
        ruta_activada_id: [], // Ya no necesita recálculo manual
        agencia_id: [] // Ya no necesita recálculo manual
    },

    // Callbacks de cambio de campo - SIMPLIFICADOS
    onFieldChange: {
        cantidad_adultos: (valor, formulario, setFormulario) => {
            const adultos = parseInt(valor) || 0;
            const ninos = parseInt(formulario.cantidad_ninos) || 0;
            setFormulario(prev => ({
                ...prev,
                total_pasajeros: adultos + ninos
            }));
        },

        cantidad_ninos: (valor, formulario, setFormulario) => {
            const adultos = parseInt(formulario.cantidad_adultos) || 0;
            const ninos = parseInt(valor) || 0;
            setFormulario(prev => ({
                ...prev,
                total_pasajeros: adultos + ninos
            }));
        },

        agencia_id: (valor, formulario, setFormulario, showNotification) => {
            if (valor) {
                console.log('Venta por agencia - se aplicará descuento automáticamente por triggers de BD');
                if (showNotification) {
                    showNotification('info', 'Se aplicará descuento por agencia automáticamente');
                }
            } else {
                console.log('Venta directa - precio normal aplicado por triggers de BD');
            }
            // El monto se calculará automáticamente en el backend
        },

        estado_id: async (valor, formulario, setFormulario, showNotification) => {
            if (valor && formulario.id) { // Solo para reservas existentes
                const estadoSeleccionado = await configReservas.helpers.validarCambioEstado(
                    { id: formulario.id, estado: { estado_id: formulario.estado_id } },
                    valor
                );
                if (!estadoSeleccionado.puede_cambiar && showNotification) {
                    showNotification('warning', estadoSeleccionado.mensaje);
                }
            }
        }
    },

    // Validación completa del formulario
    validateForm: async (formulario) => {
        const errores = {};

        // Validar que tenga al menos un adulto - USAR EL NOMBRE CORRECTO
        if (!formulario.reserva_cantidad_adultos || formulario.reserva_cantidad_adultos < 1) {
            errores.reserva_cantidad_adultos = 'Debe tener al menos 1 adulto';
        }

        // Validar total de pasajeros - USAR LOS NOMBRES CORRECTOS
        const total = parseInt(formulario.reserva_cantidad_adultos || 0) + parseInt(formulario.reserva_cantidad_ninos || 0);
        if (total > 15) {
            errores.reserva_cantidad_adultos = 'Máximo 15 pasajeros por reserva';
        }

        // Validar teléfono Guatemala - USAR EL NOMBRE CORRECTO
        if (formulario.reserva_telefono_cliente && !/^[0-9]{8}$/.test(formulario.reserva_telefono_cliente)) {
            errores.reserva_telefono_cliente = 'Teléfono debe tener 8 dígitos';
        }

        // Validar estado
        const validacionEstado = await configReservas.integrityValidators.validateState(formulario);
        if (!validacionEstado.valido) {
            errores.estado_id = validacionEstado.mensaje;
        }

        return errores;
    },

    // Procesar datos antes de guardar - ACTUALIZADO para nueva DB
    processBeforeSave: (datos) => {
        // NO ENVIAR total_pasajeros porque es calculado automáticamente por la BD
        if (datos.total_pasajeros !== undefined) {
            delete datos.total_pasajeros;
        }

        // Convertir los campos al formato que espera el backend
        if (datos.codigo) {
            datos.reserva_codigo = datos.codigo;
            delete datos.codigo;
        }
        if (datos.nombres_cliente) {
            datos.reserva_nombres_cliente = datos.nombres_cliente;
            delete datos.nombres_cliente;
        }
        if (datos.apellidos_cliente) {
            datos.reserva_apellidos_cliente = datos.apellidos_cliente;
            delete datos.apellidos_cliente;
        }
        if (datos.nit_cliente) {
            datos.reserva_cliente_nit = datos.nit_cliente;
            delete datos.nit_cliente;
        }
        if (datos.telefono_cliente) {
            datos.reserva_telefono_cliente = datos.telefono_cliente;
            delete datos.telefono_cliente;
        }
        if (datos.email_cliente) {
            datos.reserva_email_cliente = datos.email_cliente;
            delete datos.email_cliente;
        }
        if (datos.cantidad_adultos) {
            datos.reserva_cantidad_adultos = datos.cantidad_adultos;
            delete datos.cantidad_adultos;
        }
        if (datos.cantidad_ninos !== undefined) {
            datos.reserva_cantidad_ninos = datos.cantidad_ninos;
            delete datos.cantidad_ninos;
        }
        if (datos.direccion_abordaje) {
            datos.reserva_direccion_abordaje = datos.direccion_abordaje;
            delete datos.direccion_abordaje;
        }
        if (datos.notas) {
            datos.reserva_notas = datos.notas;
            delete datos.notas;
        }
        if (datos.activo !== undefined) {
            datos.reserva_situacion = datos.activo;
            delete datos.activo;
        }

        return datos;
    },

    // Procesar duplicación
    processDuplicate: (datos) => {
        // Al duplicar, mantener datos del cliente pero generar nuevo código
        delete datos.codigo;
        delete datos.monto; // Se calculará automáticamente

        // Cambiar estado a pendiente (se definirá dinámicamente)
        datos.estado_id = null;

        // Limpiar campos específicos
        datos.notas = datos.notas ? `Duplicado: ${datos.notas}` : 'Reserva duplicada';

        return datos;
    },

    // Callback después de guardar
    afterSave: (respuesta, esEdicion, showNotification) => {
        if (!esEdicion) {
            console.log('Nueva reserva creada:', respuesta);
            console.log('Monto calculado automáticamente por triggers:', respuesta.monto);
            if (showNotification) {
                showNotification('info', `Monto calculado automáticamente: Q.${respuesta.monto || '0.00'}`);
            }
        }
    },

    // CONFIGURACIÓN RUTAS ADICIONALES
    additionalRoutes: {
        // Acciones individuales
        confirm: '/api/magic/reservas/{id}/confirm',
        cancel: '/api/magic/reservas/{id}/cancel',
        execute: '/api/magic/reservas/{id}/execute',
        facturar: '/api/magic/reservas/{id}/facturar',
        whatsapp: '/api/magic/reservas/{id}/whatsapp',

        // NUEVAS: Notificaciones inteligentes
        notificaciones: '/api/magic/reservas/{id}/notificaciones',
        validarEstado: '/api/magic/reservas/{id}/validar-estado',
        procesarEstado: '/api/magic/reservas/{id}/procesar-estado',

        // Acciones masivas
        confirmByRuta: '/api/magic/reservas/ruta/{rutaActivadaId}/confirm-all',
        cancelByRuta: '/api/magic/reservas/ruta/{rutaActivadaId}/cancel-all',

        // Consultas específicas
        porUsuario: '/api/magic/reservas/usuario/{usuarioId}',
        porEstado: '/api/magic/reservas/estado/{estadoId}',
        porAgencia: '/api/magic/reservas/agencia/{agenciaId}',
        directas: '/api/magic/reservas/directas',
        buscarDisponibilidad: '/api/magic/reservas/buscar-disponibilidad',
        verificarCodigo: '/api/magic/reservas/verificar-codigo',

        // NUEVAS: Usando vistas de la BD
        completas: '/api/magic/reservas/completas',
        ingresosDiarios: '/api/magic/reservas/ingresos-diarios',

        // NUEVA: Facturación
        facturar: '/api/magic/reservas/{id}/facturar',
        facturaPdf: '/api/magic/reservas/{id}/factura-pdf',
    },

    // ACCIONES ESPECÍFICAS DE RESERVA
    actions: {
        // Acciones individuales
        confirm: {
            label: 'Confirmar',
            icon: 'check',
            color: 'green',
            condition: (reserva) => reserva.puede_ser_confirmada
        },
        cancel: {
            label: 'Cancelar',
            icon: 'x',
            color: 'red',
            condition: (reserva) => reserva.puede_ser_cancelada,
            requiresConfirmation: true,
            confirmMessage: '¿Está seguro de cancelar esta reserva?'
        },
        facturar: {
            label: 'Facturar',
            icon: 'file-text',
            color: 'purple',
            condition: (reserva) => reserva.puede_generar_factura,
            requiresConfirmation: true,
            confirmMessage: '¿Generar factura para esta reserva?'
        },
        whatsapp: {
            label: 'WhatsApp',
            icon: 'message-circle',
            color: 'green',
            condition: (reserva) => reserva.activo,
            types: ['confirmacion', 'recordatorio', 'cancelacion']
        },

        facturar: {
            label: 'Facturar',
            icon: 'file-text',
            color: 'purple',
            condition: (reserva) => reserva.puede_generar_factura && !reserva.tiene_factura,
            requiresConfirmation: true,
            confirmMessage: '¿Generar factura para esta reserva?'
        },

        descargarFactura: {
            label: 'Descargar Factura',
            icon: 'download',
            color: 'blue',
            condition: (reserva) => reserva.puede_generar_factura,
            isDownload: true
        }
    },

    // Configuración de filtros específicos
    filters: {
        tipo_venta: {
            label: 'Tipo de Venta',
            type: 'select',
            options: [
                { value: '', label: 'Todas' },
                { value: 'directa', label: 'Ventas Directas' },
                { value: 'agencia', label: 'Ventas por Agencia' }
            ]
        },
        estado: {
            label: 'Estado',
            type: 'foreign_key',
            endpoint: '/api/magic/estados/contexto/reserva',
            displayField: 'estado_estado',
            valueField: 'estado_id'
        }
    },

    // CONFIGURACIÓN PARA MODAL DE DETALLES
    camposDetalles: {
        excluir: [
            'created_at', 'updated_at', 'deleted_at',
            'reserva_situacion',
            'total_pasajeros', // Se muestra calculado
            'monto', // Se muestra formateado
            'activo'
        ],
        traducciones: {
            'id': 'ID',
            'codigo': 'Código',
            'nombres_cliente': 'Nombres del Cliente',
            'apellidos_cliente': 'Apellidos del Cliente',
            'nit_cliente': 'NIT',
            'telefono_cliente': 'Teléfono',
            'email_cliente': 'Email',
            'cantidad_adultos': 'Adultos',
            'cantidad_ninos': 'Niños',
            'direccion_abordaje': 'Punto de Abordaje',
            'notas': 'Notas',
            'usuario_id': 'ID Vendedor',
            'estado_id': 'ID Estado',
            'agencia_id': 'ID Agencia',
            'ruta_activada_id': 'ID Ruta',
            // Campos de relaciones
            'vendedor': 'Vendedor',
            'estado': 'Estado',
            'agencia': 'Agencia',
            'ruta': 'Ruta Programada'
        },
        // Orden de campos (opcional)
        orden: [
            'codigo', 'nombres_cliente', 'apellidos_cliente', 'telefono_cliente',
            'cantidad_adultos', 'cantidad_ninos', 'estado', 'agencia', 'vendedor'
        ]
    }
};

// EXPORTAR CONFIGURACIÓN
export const reservasConfig = {
    reservas: configReservas
};
