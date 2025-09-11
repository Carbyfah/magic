// src/resources/js/components/catalogos/estados-sistema/estadosConfig.js

/**
 * CONFIGURACIONES PARA TODAS LAS TABLAS DEL SISTEMA MAGIC TRAVEL
 * Plantillas reutilizables para los 13 módulos principales
 */

import apiHelper from '../../../utils/apiHelper';

// CONFIGURACIÓN BASE COMPARTIDA
const baseConfig = {
    defaultItemsPerPage: 10,
    defaultSortDirection: 'asc',
    statusField: null, // Se calcula automáticamente como {tableName}_situacion
    searchableFields: [], // Si está vacío, busca en todos los campos
    apiEndpoint: '/api/magic'
};

// CONFIGURACIONES ESPECÍFICAS POR MÓDULO
export const configEstados = {
    ...baseConfig,
    tableName: 'estado',
    displayName: 'Estados',
    primaryKey: 'estado_id',
    defaultSortField: 'estado_estado',

    // Campos de la tabla con configuración
    fields: {
        estado_id: {
            label: 'ID',
            type: 'number',
            sortable: true,
            filterable: false,
            sortType: 'numeric'
        },
        contexto: {
            label: 'Contexto',
            type: 'select',
            sortable: false,
            filterable: false,
            options: [
                { value: 'vehiculo', label: 'Estados para Vehículos' },
                { value: 'reserva', label: 'Estados para Reservas' },
                { value: 'ruta-activada', label: 'Estados para Rutas Activadas' },
                { value: 'tour-activado', label: 'Estados para Tours Activados' },
                { value: 'factura', label: 'Estados para Facturas' }
            ],
            formOnly: true // Solo aparece en formularios, no en listados
        },
        estado_codigo: {
            label: 'Código',
            type: 'text',
            sortable: true,
            filterable: true,
            sortType: 'alphabetic'
        },
        estado_estado: {
            label: 'Estado',
            type: 'text',
            sortable: true,
            filterable: true,
            sortType: 'alphabetic'
        },
        estado_descripcion: {
            label: 'Descripción',
            type: 'text',
            sortable: true,
            filterable: true,
            sortType: 'alphabetic'
        },
        estado_situacion: {
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
    searchableFields: ['estado_codigo', 'estado_estado', 'estado_descripcion'],
    sortableFields: ['estado_codigo', 'estado_estado', 'estado_descripcion'],
    filterableFields: [] // SIN FILTROS ESPECÍFICOS
};

export const configTipoPersona = {
    ...baseConfig,
    tableName: 'tipo_persona',
    displayName: 'Tipos de Persona',
    primaryKey: 'tipo_persona_id',
    defaultSortField: 'tipo_persona_tipo_persona',

    fields: {
        tipo_persona_id: { label: 'ID', type: 'number', sortable: true, filterable: false, sortType: 'numeric' },
        tipo_persona_codigo: { label: 'Código', type: 'text', sortable: true, filterable: true, sortType: 'alphabetic' },
        tipo_persona_tipo_persona: { label: 'Tipo de Persona', type: 'text', sortable: true, filterable: true, sortType: 'alphabetic' },
        tipo_persona_situacion: {
            label: 'Estado',
            type: 'select',
            sortable: true,
            filterable: true,
            options: [{ value: 1, label: 'Activo' }, { value: 0, label: 'Inactivo' }]
        }
    },

    searchableFields: ['tipo_persona_codigo', 'tipo_persona_tipo_persona'],
    sortableFields: ['tipo_persona_codigo', 'tipo_persona_tipo_persona'],
    filterableFields: []
};

export const configRol = {
    ...baseConfig,
    tableName: 'rol',
    displayName: 'Roles',
    primaryKey: 'rol_id',
    defaultSortField: 'rol_rol',

    fields: {
        rol_id: { label: 'ID', type: 'number', sortable: true, filterable: false, sortType: 'numeric' },
        rol_codigo: { label: 'Código', type: 'text', sortable: true, filterable: true, sortType: 'alphabetic' },
        rol_rol: { label: 'Rol', type: 'text', sortable: true, filterable: true, sortType: 'alphabetic' },
        rol_descripcion: { label: 'Descripción', type: 'text', sortable: true, filterable: true, sortType: 'alphabetic' },
        rol_situacion: {
            label: 'Estado',
            type: 'select',
            sortable: true,
            filterable: true,
            options: [{ value: 1, label: 'Activo' }, { value: 0, label: 'Inactivo' }]
        }
    },

    searchableFields: ['rol_codigo', 'rol_rol', 'rol_descripcion'],
    sortableFields: ['rol_codigo', 'rol_rol'],
    filterableFields: []
};

export const configServicios = {
    ...baseConfig,
    tableName: 'servicio',
    displayName: 'Servicios',
    primaryKey: 'servicio_id',
    defaultSortField: 'servicio_servicio',

    fields: {
        servicio_id: {
            label: 'ID',
            type: 'number',
            sortable: true,
            filterable: false,
            sortType: 'numeric'
        },
        servicio_codigo: {
            label: 'Código',
            type: 'text',
            sortable: true,
            filterable: true,
            sortType: 'alphabetic'
        },
        servicio_servicio: {
            label: 'Servicio',
            type: 'text',
            sortable: true,
            filterable: true,
            sortType: 'alphabetic'
        },
        servicio_origen: {
            label: 'Origen',
            type: 'text',
            sortable: true,
            filterable: true,
            sortType: 'alphabetic'
        },
        servicio_destino: {
            label: 'Destino',
            type: 'text',
            sortable: true,
            filterable: true,
            sortType: 'alphabetic'
        },
        servicio_precio_normal: {
            label: 'Precio Normal',
            type: 'number',
            sortable: true,
            filterable: false,
            sortType: 'numeric'
        },
        servicio_precio_descuento: {
            label: 'Precio Descuento',
            type: 'number',
            sortable: true,
            filterable: false,
            sortType: 'numeric'
        },
        servicio_descripcion: {
            label: 'Descripción',
            type: 'text',
            sortable: false,
            filterable: true,
            sortType: 'alphabetic'
        },
        servicio_politicas: {
            label: 'Políticas',
            type: 'text',
            sortable: false,
            filterable: true,
            sortType: 'alphabetic'
        },
        servicio_situacion: {
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

    searchableFields: ['servicio_codigo', 'servicio_servicio', 'servicio_origen', 'servicio_destino'],
    sortableFields: ['servicio_codigo', 'servicio_servicio', 'servicio_precio_normal', 'servicio_precio_descuento'],
    filterableFields: []
};

export const configRutas = {
    ...baseConfig,
    tableName: 'ruta',
    displayName: 'Rutas',
    primaryKey: 'ruta_id',
    defaultSortField: 'ruta_ruta',

    // Campos de la tabla con configuración
    fields: {
        ruta_id: {
            label: 'ID',
            type: 'number',
            sortable: true,
            filterable: false,
            sortType: 'numeric'
        },
        ruta_codigo: {
            label: 'Código',
            type: 'text',
            sortable: true,
            filterable: true,
            sortType: 'alphabetic'
        },
        ruta_ruta: {
            label: 'Nombre de Ruta',
            type: 'text',
            sortable: true,
            filterable: true,
            sortType: 'alphabetic'
        },
        ruta_origen: {
            label: 'Origen',
            type: 'text',
            sortable: true,
            filterable: true,
            sortType: 'alphabetic'
        },
        ruta_destino: {
            label: 'Destino',
            type: 'text',
            sortable: true,
            filterable: true,
            sortType: 'alphabetic'
        },
        ruta_situacion: {
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
    searchableFields: ['ruta_codigo', 'ruta_ruta', 'ruta_origen', 'ruta_destino'],
    sortableFields: ['ruta_codigo', 'ruta_ruta', 'ruta_origen', 'ruta_destino'],
    filterableFields: [] // SIN FILTROS ESPECÍFICOS
};

export const configAgencia = {
    ...baseConfig,
    tableName: 'agencia',
    displayName: 'Agencias',
    primaryKey: 'agencia_id',
    defaultSortField: 'agencia_nombre',

    fields: {
        agencia_id: { label: 'ID', type: 'number', sortable: true, filterable: false, sortType: 'numeric' },
        agencia_codigo: { label: 'Código', type: 'text', sortable: true, filterable: true, sortType: 'alphabetic' },
        agencia_nombre: { label: 'Nombre', type: 'text', sortable: true, filterable: true, sortType: 'alphabetic' },
        agencia_direccion: { label: 'Dirección', type: 'text', sortable: false, filterable: true, sortType: 'alphabetic' },
        agencia_telefono: { label: 'Teléfono', type: 'number', sortable: true, filterable: true, sortType: 'numeric' },
        agencia_email: { label: 'Email', type: 'email', sortable: true, filterable: true, sortType: 'alphabetic' },
        agencia_sitio_web: { label: 'Sitio Web', type: 'url', sortable: false, filterable: false, sortType: 'alphabetic' },
        agencia_tipo: { label: 'Tipo', type: 'text', sortable: true, filterable: true, sortType: 'alphabetic' },
        agencia_situacion: {
            label: 'Estado',
            type: 'select',
            sortable: true,
            filterable: true,
            options: [{ value: 1, label: 'Activo' }, { value: 0, label: 'Inactivo' }]
        }
    },

    searchableFields: ['agencia_codigo', 'agencia_nombre', 'agencia_telefono', 'agencia_email'],
    sortableFields: ['agencia_codigo', 'agencia_nombre', 'agencia_telefono'],
    filterableFields: []
};

export const configVehiculo = {
    ...baseConfig,
    tableName: 'vehiculo',
    displayName: 'Vehículos',
    primaryKey: 'vehiculo_id',
    defaultSortField: 'vehiculo_placa',

    fields: {
        vehiculo_id: { label: 'ID', type: 'number', sortable: true, filterable: false, sortType: 'numeric' },
        vehiculo_codigo: { label: 'Código', type: 'text', sortable: true, filterable: true, sortType: 'alphabetic' },
        vehiculo_placa: { label: 'Placa', type: 'text', sortable: true, filterable: true, sortType: 'alphabetic' },
        vehiculo_marca: { label: 'Marca', type: 'text', sortable: true, filterable: true, sortType: 'alphabetic' },
        vehiculo_modelo: { label: 'Modelo', type: 'text', sortable: true, filterable: true, sortType: 'alphabetic' },
        vehiculo_año: { label: 'Año', type: 'number', sortable: true, filterable: true, sortType: 'numeric' },
        vehiculo_capacidad: { label: 'Capacidad', type: 'number', sortable: true, filterable: true, sortType: 'numeric' },
        vehiculo_tipo: { label: 'Tipo', type: 'text', sortable: true, filterable: true, sortType: 'alphabetic' },
        estado_id: { label: 'Estado', type: 'number', sortable: true, filterable: true, sortType: 'numeric' },
        vehiculo_situacion: {
            label: 'Estado',
            type: 'select',
            sortable: true,
            filterable: true,
            options: [{ value: 1, label: 'Activo' }, { value: 0, label: 'Inactivo' }]
        }
    },

    searchableFields: ['vehiculo_codigo', 'vehiculo_placa', 'vehiculo_marca', 'vehiculo_modelo'],
    sortableFields: ['vehiculo_codigo', 'vehiculo_placa', 'vehiculo_marca', 'vehiculo_modelo', 'vehiculo_año', 'vehiculo_capacidad'],
    filterableFields: []
};

export const configPersona = {
    ...baseConfig,
    tableName: 'persona',
    displayName: 'Personas',
    primaryKey: 'persona_id',
    defaultSortField: 'persona_nombres',

    fields: {
        persona_id: { label: 'ID', type: 'number', sortable: true, filterable: false, sortType: 'numeric' },
        persona_codigo: { label: 'Código', type: 'text', sortable: true, filterable: true, sortType: 'alphabetic' },
        persona_nombres: { label: 'Nombres', type: 'text', sortable: true, filterable: true, sortType: 'alphabetic' },
        persona_apellidos: { label: 'Apellidos', type: 'text', sortable: true, filterable: true, sortType: 'alphabetic' },
        persona_telefono: { label: 'Teléfono', type: 'number', sortable: true, filterable: true, sortType: 'numeric' },
        persona_email: { label: 'Email', type: 'email', sortable: true, filterable: true, sortType: 'alphabetic' },
        persona_direccion: { label: 'Dirección', type: 'text', sortable: false, filterable: true, sortType: 'alphabetic' },
        tipo_persona_id: { label: 'Tipo Persona', type: 'number', sortable: true, filterable: true, sortType: 'numeric' },
        persona_situacion: {
            label: 'Estado',
            type: 'select',
            sortable: true,
            filterable: true,
            options: [{ value: 1, label: 'Activo' }, { value: 0, label: 'Inactivo' }]
        }
    },

    searchableFields: ['persona_codigo', 'persona_nombres', 'persona_apellidos', 'persona_telefono', 'persona_email'],
    sortableFields: ['persona_codigo', 'persona_nombres', 'persona_apellidos', 'persona_telefono'],
    filterableFields: []
};

export const configContactosAgencia = {
    ...baseConfig,
    tableName: 'contactos_agencia',
    displayName: 'Contactos de Agencia',
    primaryKey: 'contactos_agencia_id',
    defaultSortField: 'contactos_agencia_nombres',

    fields: {
        contactos_agencia_id: { label: 'ID', type: 'number', sortable: true, filterable: false, sortType: 'numeric' },
        contactos_agencia_codigo: { label: 'Código', type: 'text', sortable: true, filterable: true, sortType: 'alphabetic' },
        contactos_agencia_nombres: { label: 'Nombres', type: 'text', sortable: true, filterable: true, sortType: 'alphabetic' },
        contactos_agencia_apellidos: { label: 'Apellidos', type: 'text', sortable: true, filterable: true, sortType: 'alphabetic' },
        contactos_agencia_telefono: { label: 'Teléfono', type: 'number', sortable: true, filterable: true, sortType: 'numeric' },
        contactos_agencia_email: { label: 'Email', type: 'email', sortable: true, filterable: true, sortType: 'alphabetic' },
        contactos_agencia_cargo: { label: 'Cargo', type: 'text', sortable: true, filterable: true, sortType: 'alphabetic' },
        agencia_id: { label: 'Agencia', type: 'number', sortable: true, filterable: true, sortType: 'numeric' },
        contactos_agencia_situacion: {
            label: 'Estado',
            type: 'select',
            sortable: true,
            filterable: true,
            options: [{ value: 1, label: 'Activo' }, { value: 0, label: 'Inactivo' }]
        }
    },

    searchableFields: ['contactos_agencia_nombres', 'contactos_agencia_apellidos', 'contactos_agencia_cargo'],
    sortableFields: ['contactos_agencia_nombres', 'contactos_agencia_apellidos', 'contactos_agencia_cargo'],
    filterableFields: []
};

export const configUsuario = {
    ...baseConfig,
    tableName: 'usuario',
    displayName: 'Usuarios',
    primaryKey: 'usuario_id',
    defaultSortField: 'usuario_codigo',

    fields: {
        usuario_id: { label: 'ID', type: 'number', sortable: true, filterable: false, sortType: 'numeric' },
        usuario_codigo: { label: 'Código Usuario', type: 'text', sortable: true, filterable: true, sortType: 'alphabetic' },
        persona_id: { label: 'Persona', type: 'number', sortable: true, filterable: true, sortType: 'numeric' },
        rol_id: { label: 'Rol', type: 'number', sortable: true, filterable: true, sortType: 'numeric' },
        usuario_situacion: {
            label: 'Estado',
            type: 'select',
            sortable: true,
            filterable: true,
            options: [{ value: 1, label: 'Activo' }, { value: 0, label: 'Inactivo' }]
        }
    },

    searchableFields: ['usuario_codigo'],
    sortableFields: ['usuario_codigo'],
    filterableFields: []
};

export const configRutaActivada = {
    ...baseConfig,
    tableName: 'ruta_activada',
    displayName: 'Rutas Activadas',
    primaryKey: 'ruta_activada_id',
    defaultSortField: 'ruta_activada_fecha',

    fields: {
        ruta_activada_id: { label: 'ID', type: 'number', sortable: true, filterable: false, sortType: 'numeric' },
        ruta_activada_codigo: { label: 'Código', type: 'text', sortable: true, filterable: true, sortType: 'alphabetic' },
        ruta_activada_fecha: { label: 'Fecha', type: 'date', sortable: true, filterable: true, sortType: 'date' },
        ruta_activada_hora: { label: 'Hora', type: 'time', sortable: true, filterable: false, sortType: 'alphabetic' },
        usuario_id: { label: 'Usuario', type: 'number', sortable: true, filterable: true, sortType: 'numeric' },
        estado_id: { label: 'Estado', type: 'number', sortable: true, filterable: true, sortType: 'numeric' },
        servicio_id: { label: 'Servicio', type: 'number', sortable: true, filterable: true, sortType: 'numeric' },
        ruta_id: { label: 'Ruta', type: 'number', sortable: true, filterable: true, sortType: 'numeric' },
        vehiculo_id: { label: 'Vehículo', type: 'number', sortable: true, filterable: true, sortType: 'numeric' },
        ruta_activada_situacion: {
            label: 'Situación',
            type: 'select',
            sortable: true,
            filterable: true,
            options: [{ value: 1, label: 'Activo' }, { value: 0, label: 'Inactivo' }]
        }
    },

    searchableFields: ['ruta_activada_codigo'],
    sortableFields: ['ruta_activada_fecha', 'ruta_activada_hora', 'ruta_activada_codigo'],
    filterableFields: []
};

export const configReserva = {
    ...baseConfig,
    tableName: 'reserva',
    displayName: 'Reservas',
    primaryKey: 'reserva_id',
    defaultSortField: 'created_at',
    defaultSortDirection: 'desc',

    fields: {
        reserva_id: { label: 'ID', type: 'number', sortable: true, filterable: false, sortType: 'numeric' },
        reserva_codigo: { label: 'Código', type: 'text', sortable: true, filterable: true, sortType: 'alphabetic' },
        reserva_nombres_cliente: { label: 'Nombres Cliente', type: 'text', sortable: true, filterable: true, sortType: 'alphabetic' },
        reserva_apellidos_cliente: { label: 'Apellidos Cliente', type: 'text', sortable: true, filterable: true, sortType: 'alphabetic' },
        reserva_telefono_cliente: { label: 'Teléfono', type: 'number', sortable: true, filterable: true, sortType: 'numeric' },
        reserva_cantidad_adultos: { label: 'Adultos', type: 'number', sortable: true, filterable: true, sortType: 'numeric' },
        reserva_cantidad_ninos: { label: 'Niños', type: 'number', sortable: true, filterable: true, sortType: 'numeric' },
        reserva_monto: { label: 'Monto', type: 'number', sortable: true, filterable: true, sortType: 'numeric' },
        usuario_id: { label: 'Usuario', type: 'number', sortable: true, filterable: true, sortType: 'numeric' },
        estado_id: { label: 'Estado', type: 'number', sortable: true, filterable: true, sortType: 'numeric' },
        agencia_id: { label: 'Agencia', type: 'number', sortable: true, filterable: true, sortType: 'numeric' },
        ruta_activada_id: { label: 'Ruta Activada', type: 'number', sortable: true, filterable: true, sortType: 'numeric' },
        created_at: { label: 'Fecha Creación', type: 'date', sortable: true, filterable: true, sortType: 'date' },
        reserva_situacion: {
            label: 'Situación',
            type: 'select',
            sortable: true,
            filterable: true,
            options: [{ value: 1, label: 'Activo' }, { value: 0, label: 'Inactivo' }]
        }
    },

    searchableFields: ['reserva_codigo', 'reserva_nombres_cliente', 'reserva_apellidos_cliente', 'reserva_telefono_cliente'],
    sortableFields: ['created_at', 'reserva_codigo', 'reserva_nombres_cliente', 'reserva_monto'],
    filterableFields: []
};

export const configFacturas = {
    ...baseConfig,
    tableName: 'facturas',
    displayName: 'Facturas',
    primaryKey: 'facturas_id',
    defaultSortField: 'facturas_fecha',
    defaultSortDirection: 'desc',

    fields: {
        facturas_id: { label: 'ID', type: 'number', sortable: true, filterable: false, sortType: 'numeric' },
        facturas_codigo: { label: 'Código', type: 'text', sortable: true, filterable: true, sortType: 'alphabetic' },
        facturas_fecha: { label: 'Fecha', type: 'date', sortable: true, filterable: true, sortType: 'date' },
        usuario_id: { label: 'Usuario', type: 'number', sortable: true, filterable: true, sortType: 'numeric' },
        servicio_id: { label: 'Servicio', type: 'number', sortable: true, filterable: true, sortType: 'numeric' },
        reserva_id: { label: 'Reserva', type: 'number', sortable: true, filterable: true, sortType: 'numeric' },
        facturas_situacion: {
            label: 'Estado',
            type: 'select',
            sortable: true,
            filterable: true,
            options: [{ value: 1, label: 'Activo' }, { value: 0, label: 'Inactivo' }]
        }
    },

    searchableFields: ['facturas_codigo'],
    sortableFields: ['facturas_fecha', 'facturas_codigo'],
    filterableFields: []
};

// EXPORTAR CONFIGURACIONES COMO OBJETO PARA FÁCIL ACCESO
export const magicTravelConfigs = {
    'tipo_persona': configTipoPersona,
    'rol': configRol,
    'estado': configEstados,
    'servicio': configServicios,
    'ruta': configRutas,
    'agencia': configAgencia,
    'persona': configPersona,
    'vehiculo': configVehiculo,
    'contactos_agencia': configContactosAgencia,
    'usuario': configUsuario,
    'ruta_activada': configRutaActivada,
    'reserva': configReserva,
    'facturas': configFacturas
};

// FUNCIÓN HELPER PARA OBTENER CONFIGURACIÓN
export const getTableConfig = (tableName) => {
    const config = magicTravelConfigs[tableName];
    if (!config) {
        console.warn(`Configuración no encontrada para la tabla: ${tableName}`);
        return null;
    }

    // Calcular statusField si no está definido
    if (!config.statusField) {
        config.statusField = `${tableName}_situacion`;
    }

    return config;
};

// CONFIGURACIÓN ESPECÍFICA PARA ESTADOS (TU MÓDULO ACTUAL)
export const estadosConfig = {
    estados: configEstados
};
