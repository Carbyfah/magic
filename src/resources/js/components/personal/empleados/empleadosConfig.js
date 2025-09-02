// src/resources/js/components/personal/empleados/empleadosConfig.js

/**
 * CONFIGURACIÓN ESPECÍFICA PARA EMPLEADOS (TABLA PERSONA)
 * Adaptado para tabla con FK hacia tipo_persona
 */

// CONFIGURACIÓN BASE COMPARTIDA
const baseConfig = {
    defaultItemsPerPage: 10,
    defaultSortDirection: 'asc',
    statusField: 'activo',
    searchableFields: [], // Si está vacío, busca en todos los campos
    apiEndpoint: '/api/magic'
};

// CONFIGURACIÓN ESPECÍFICA PARA EMPLEADOS
export const configEmpleados = {
    ...baseConfig,
    tableName: 'personas',
    displayName: 'Empleados',
    primaryKey: 'persona_id',
    defaultSortField: 'nombres',
    nameField: 'persona_nombres',

    // Campos de la tabla con configuración
    fields: {
        persona_id: {
            label: 'ID',
            type: 'number',
            sortable: true,
            filterable: false,
            sortType: 'numeric'
        },
        persona_codigo: {
            label: 'Código',
            type: 'text',
            sortable: true,
            filterable: true,
            sortType: 'alphabetic',
            placeholder: 'Se genera automáticamente'
        },
        persona_nombres: {
            label: 'Nombres',
            type: 'text',
            sortable: true,
            filterable: true,
            sortType: 'alphabetic',
            required: true,
            placeholder: 'Nombres del empleado'
        },
        persona_apellidos: {
            label: 'Apellidos',
            type: 'text',
            sortable: true,
            filterable: true,
            sortType: 'alphabetic',
            required: true,
            placeholder: 'Apellidos del empleado'
        },
        persona_telefono: {
            label: 'Teléfono',
            type: 'number',
            sortable: true,
            filterable: true,
            sortType: 'numeric',
            required: false,
            placeholder: '12345678'
        },
        persona_email: {
            label: 'Email',
            type: 'email',
            sortable: true,
            filterable: true,
            sortType: 'alphabetic',
            required: false,
            placeholder: 'empleado@magictravel.com'
        },
        tipo_persona_id: {
            label: 'Tipo de Empleado',
            type: 'foreign_key',
            sortable: true,
            filterable: true,
            sortType: 'numeric',
            required: true,
            relatedTable: 'tipo_persona',
            relatedKey: 'tipo_persona_id',
            displayField: 'tipo_persona_tipo',
            endpoint: '/api/magic/tipo-persona'
        },
        persona_situacion: {
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
    searchableFields: ['codigo', 'nombres', 'apellidos', 'email'],
    sortableFields: ['nombres', 'apellidos', 'codigo'],
    filterableFields: [],

    // Campos que se muestran en la lista (renderizarItem)
    displayFields: ['persona_nombres', 'persona_apellidos', 'persona_email', 'tipo_persona_id'],

    // Configuración específica para dependientes simples
    foreignKeys: ['tipo_persona_id'],

    // Validaciones específicas
    validations: {
        persona_email: {
            unique: true,
            endpoint: '/api/magic/personas/verificar-email'
        }
    }
};

// EXPORTAR CONFIGURACIÓN
export const empleadosConfig = {
    empleados: configEmpleados
};
