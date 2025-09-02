// src/resources/js/components/catalogos/tipos-persona/tiposEmpleadosConfig.js

/**
 * CONFIGURACIÓN ESPECÍFICA PARA TIPOS DE PERSONA
 * Tabla independiente sin FK - SIGUIENDO EL PATRÓN EXACTO DE RUTAS
 */

// CONFIGURACIÓN BASE COMPARTIDA - IGUAL QUE rutasServiciosConfig.js
const baseConfig = {
    defaultItemsPerPage: 10,
    defaultSortDirection: 'asc',
    statusField: null, // Se calcula automáticamente como {tableName}_situacion
    searchableFields: [], // Si está vacío, busca en todos los campos
    apiEndpoint: '/api/magic'
};

// CONFIGURACIÓN ESPECÍFICA PARA TIPOS DE PERSONA - CORREGIDA
export const configTiposPersona = {
    ...baseConfig,
    tableName: 'tipo_persona',          // CORREGIDO: Nombre real de la tabla en BD
    displayName: 'Tipos de Persona',
    primaryKey: 'tipo_persona_id',
    defaultSortField: 'tipo_persona_tipo',

    // Campos de la tabla con configuración - IGUAL ESTRUCTURA QUE RUTAS
    fields: {
        tipo_persona_id: {
            label: 'ID',
            type: 'number',
            sortable: true,
            filterable: false,
            sortType: 'numeric'
        },
        tipo_persona_codigo: {
            label: 'Código',
            type: 'text',
            sortable: true,
            filterable: true,
            sortType: 'alphabetic'
        },
        tipo_persona_tipo: {
            label: 'Tipo de Persona',
            type: 'text',
            sortable: true,
            filterable: true,
            sortType: 'alphabetic'
        },
        tipo_persona_situacion: {
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

    // Campos específicos para funcionalidades - IGUAL PATRÓN QUE RUTAS
    searchableFields: ['tipo_persona_codigo', 'tipo_persona_tipo'],
    sortableFields: ['tipo_persona_codigo', 'tipo_persona_tipo'],
    filterableFields: [] // SIN FILTROS ESPECÍFICOS
};

// EXPORTAR CONFIGURACIÓN - MANTENIENDO EL PATRÓN
export const tiposEmpleadosConfig = {
    tiposPersona: configTiposPersona
};

// EXPORTAR TAMBIÉN LA CONFIGURACIÓN INDIVIDUAL PARA COMPATIBILIDAD
export default configTiposPersona;
