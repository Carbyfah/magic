// src/resources/js/components/personal/empleados/empleadosConfig.js

/**
 * CONFIGURACIÓN ESPECÍFICA PARA EMPLEADOS (TABLA PERSONA)
 * Adaptado para tabla con FK hacia tipo_persona
 */

import apiHelper from '../../../utils/apiHelper';

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
    },
    // VALIDACIÓN DE ESTADOS - para empleados no es necesaria validación específica
    validateStates: async () => {
        return {
            valido: true,
            mensaje: 'Los empleados no requieren validación de estados específicos'
        };
    },

    // VALIDADORES DE INTEGRIDAD
    integrityValidators: {
        // Validar email único
        validateEmail: async (formData, empleadoId = null) => {
            if (!formData.persona_email) {
                return { valido: true }; // Email opcional
            }

            try {
                const response = await apiHelper.post('/personas/verificar-email', {
                    email: formData.persona_email,
                    exclude_id: empleadoId
                });

                const data = await apiHelper.handleResponse(response);

                if (data.exists) {
                    return {
                        valido: false,
                        mensaje: 'Este email ya está registrado para otro empleado'
                    };
                }

                return { valido: true };
            } catch (error) {
                console.warn('Error validando email:', error);
                return { valido: true }; // No bloquear por error de validación
            }
        },

        // Validar teléfono formato Guatemala
        validatePhone: (formData) => {
            if (!formData.persona_telefono) {
                return { valido: true }; // Teléfono opcional
            }

            const telefono = formData.persona_telefono.toString();
            if (telefono.length < 8 || telefono.length > 15) {
                return {
                    valido: false,
                    mensaje: 'El teléfono debe tener entre 8 y 15 dígitos'
                };
            }

            return { valido: true };
        }
    },

    // HELPERS DE FORMATEO
    helpers: {
        // Formatear nombre completo
        formatFullName: (empleado) => {
            const nombres = empleado.persona_nombres || empleado.nombres || '';
            const apellidos = empleado.persona_apellidos || empleado.apellidos || '';
            return `${nombres} ${apellidos}`.trim();
        },

        // Formatear teléfono Guatemala
        formatPhone: (telefono) => {
            if (!telefono) return 'Sin teléfono';
            const tel = telefono.toString();
            if (tel.length === 8) {
                return `${tel.substring(0, 4)}-${tel.substring(4)}`;
            }
            return tel;
        },

        // Obtener empleados por tipo
        getByType: (empleados, tipoPersonaId) => {
            return empleados.filter(empleado =>
                empleado.activo &&
                empleado.tipo_persona_id === tipoPersonaId
            );
        },

        // Obtener conductores disponibles
        getConductores: (empleados) => {
            return empleados.filter(empleado =>
                empleado.activo &&
                empleado.tipo_persona?.nombre?.toLowerCase().includes('conductor')
            );
        },

        // Obtener guías disponibles
        getGuias: (empleados) => {
            return empleados.filter(empleado =>
                empleado.activo &&
                empleado.tipo_persona?.nombre?.toLowerCase().includes('guia')
            );
        }
    },

    // VALIDACIÓN COMPLETA DEL FORMULARIO
    validateForm: async (formulario, empleadoId = null) => {
        const errores = {};

        // Validar campos requeridos
        if (!formulario.persona_nombres?.trim()) {
            errores.persona_nombres = 'Los nombres son requeridos';
        }

        if (!formulario.persona_apellidos?.trim()) {
            errores.persona_apellidos = 'Los apellidos son requeridos';
        }

        if (!formulario.tipo_persona_id) {
            errores.tipo_persona_id = 'El tipo de empleado es requerido';
        }

        // Validar email
        const validacionEmail = await configEmpleados.integrityValidators.validateEmail(formulario, empleadoId);
        if (!validacionEmail.valido) {
            errores.persona_email = validacionEmail.mensaje;
        }

        // Validar teléfono
        const validacionTelefono = configEmpleados.integrityValidators.validatePhone(formulario);
        if (!validacionTelefono.valido) {
            errores.persona_telefono = validacionTelefono.mensaje;
        }

        return errores;
    },

    // PROCESAMIENTO ANTES DE GUARDAR
    processBeforeSave: (datos) => {
        // Limpiar espacios en nombres y apellidos
        if (datos.persona_nombres) {
            datos.persona_nombres = datos.persona_nombres.trim();
        }

        if (datos.persona_apellidos) {
            datos.persona_apellidos = datos.persona_apellidos.trim();
        }

        // Limpiar email
        if (datos.persona_email) {
            datos.persona_email = datos.persona_email.trim().toLowerCase();
        }

        return datos;
    }
};

// EXPORTAR CONFIGURACIÓN
export const empleadosConfig = {
    empleados: configEmpleados
};
