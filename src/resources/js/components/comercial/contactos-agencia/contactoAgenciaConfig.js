// src/resources/js/components/comercial/contactos-agencia/contactoAgenciaConfig.js

/**
 * CONFIGURACIÓN ESPECÍFICA PARA CONTACTOS DE AGENCIA (TABLA CONTACTOS_AGENCIA)
 * Adaptado para tabla con FK hacia agencia
 */

// CONFIGURACIÓN BASE COMPARTIDA
const baseConfig = {
    defaultItemsPerPage: 10,
    defaultSortDirection: 'asc',
    statusField: 'activo',
    searchableFields: [], // Si está vacío, busca en todos los campos
    apiEndpoint: '/api/magic'
};

// CONFIGURACIÓN ESPECÍFICA PARA CONTACTOS DE AGENCIA
export const configContactosAgencia = {
    ...baseConfig,
    tableName: 'contactos-agencia',
    displayName: 'Contactos de Agencia',
    primaryKey: 'contactos_agencia_id',
    defaultSortField: 'nombres',
    nameField: 'contactos_agencia_nombres',

    // Campos de la tabla con configuración
    fields: {
        contactos_agencia_id: {
            label: 'ID',
            type: 'number',
            sortable: true,
            filterable: false,
            sortType: 'numeric'
        },
        contactos_agencia_codigo: {
            label: 'Código',
            type: 'text',
            sortable: true,
            filterable: true,
            sortType: 'alphabetic',
            placeholder: 'Se genera automáticamente'
        },
        contactos_agencia_nombres: {
            label: 'Nombres',
            type: 'text',
            sortable: true,
            filterable: true,
            sortType: 'alphabetic',
            required: true,
            placeholder: 'Nombres del contacto'
        },
        contactos_agencia_apellidos: {
            label: 'Apellidos',
            type: 'text',
            sortable: true,
            filterable: true,
            sortType: 'alphabetic',
            required: true,
            placeholder: 'Apellidos del contacto'
        },
        contactos_agencia_cargo: {
            label: 'Cargo',
            type: 'text',
            sortable: true,
            filterable: true,
            sortType: 'alphabetic',
            required: true,
            placeholder: 'Gerente, Director, etc.'
        },
        contactos_agencia_telefono: {
            label: 'Teléfono',
            type: 'number',
            sortable: true,
            filterable: true,
            sortType: 'numeric',
            required: true,
            placeholder: '12345678'
        },
        agencia_id: {
            label: 'Agencia',
            type: 'foreign_key',
            sortable: true,
            filterable: true,
            sortType: 'numeric',
            required: true,
            relatedTable: 'agencias',
            relatedKey: 'agencia_id',
            displayField: 'agencia_razon_social',
            endpoint: '/api/magic/agencias'
        },
        contactos_agencia_situacion: {
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
    searchableFields: ['codigo', 'nombres', 'apellidos', 'cargo'],
    sortableFields: ['nombres', 'apellidos', 'cargo', 'codigo'],
    filterableFields: [],

    // Campos que se muestran en la lista (renderizarItem)
    displayFields: ['contactos_agencia_nombres', 'contactos_agencia_apellidos', 'contactos_agencia_cargo', 'agencia_id'],

    // Configuración específica para dependientes simples
    foreignKeys: ['agencia_id'],

    // Validaciones específicas
    validations: {
        contactos_agencia_telefono: {
            unique_per_agencia: true,
            endpoint: '/api/magic/contactos-agencia/verificar-telefono'
        }
    }
};

// EXPORTAR CONFIGURACIÓN
export const contactoAgenciaConfig = {
    contactos: configContactosAgencia
};
