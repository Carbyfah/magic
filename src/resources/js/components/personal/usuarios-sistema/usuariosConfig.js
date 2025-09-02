// src/resources/js/components/personal/usuarios-sistema/usuariosConfig.js

/**
 * CONFIGURACIÓN ESPECÍFICA PARA USUARIOS SISTEMA (TABLA USUARIO)
 * Adaptado para tabla de NIVEL 3 con múltiples FK (persona_id, rol_id)
 * Usa plantilla GestionTransaccionales.js
 */

// CONFIGURACIÓN BASE COMPARTIDA
const baseConfig = {
    defaultItemsPerPage: 10,
    defaultSortDirection: 'asc',
    statusField: 'activo',
    searchableFields: [], // Si está vacío, busca en todos los campos
    apiEndpoint: '/api/magic'
};

// CONFIGURACIÓN ESPECÍFICA PARA USUARIOS SISTEMA
export const configUsuarios = {
    ...baseConfig,
    tableName: 'usuarios',
    displayName: 'Usuarios Sistema',
    primaryKey: 'usuario_id',
    defaultSortField: 'codigo',
    nameField: 'usuario_codigo',

    // Campos de la tabla con configuración
    fields: {
        usuario_id: {
            label: 'ID',
            type: 'number',
            sortable: true,
            filterable: false,
            sortType: 'numeric'
        },
        usuario_codigo: {
            label: 'Código',
            type: 'text',
            sortable: true,
            filterable: true,
            sortType: 'alphabetic',
            placeholder: 'Se genera automáticamente',
            width: 'completo'
        },
        usuario_password: {
            label: 'Contraseña',
            type: 'password',
            sortable: false,
            filterable: false,
            required: true,
            placeholder: 'Mínimo 8 caracteres',
            width: 'completo'
        },
        persona_id: {
            label: 'Empleado',
            type: 'foreign_key',
            sortable: true,
            filterable: true,
            sortType: 'numeric',
            required: true,
            relatedTable: 'persona',
            relatedKey: 'persona_id',
            displayField: 'nombre_completo',
            endpoint: '/api/magic/personas',
            width: 'medio'
        },
        rol_id: {
            label: 'Rol',
            type: 'foreign_key',
            sortable: true,
            filterable: true,
            sortType: 'numeric',
            required: true,
            relatedTable: 'rol',
            relatedKey: 'rol_id',
            displayField: 'rol_rol',
            endpoint: '/api/magic/roles',
            width: 'medio'
        },
        usuario_situacion: {
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
    searchableFields: ['codigo'],
    sortableFields: ['codigo'],
    filterableFields: [],

    // Campos que se muestran en la lista (renderizarItem)
    displayFields: ['usuario_codigo', 'persona_id', 'rol_id'],

    // Configuración específica para transaccionales (múltiples FK)
    foreignKeys: ['persona_id', 'rol_id'],

    // Validaciones específicas para usuarios
    validations: {
        usuario_codigo: {
            unique: true,
            endpoint: '/api/magic/usuarios/verificar-codigo'
        },
        persona_id: {
            unique: true,
            message: 'La persona ya tiene un usuario registrado'
        }
    },

    // Configuración de formulario por pasos (wizard) - NIVEL 3
    formSteps: [
        {
            title: 'Información Básica',
            description: 'Datos principales del usuario',
            fields: ['persona_id', 'rol_id']
        },
        {
            title: 'Configuración de Acceso',
            description: 'Credenciales y permisos',
            fields: ['usuario_password'],
            validate: (formulario) => {
                const errores = {};
                if (formulario.usuario_password && formulario.usuario_password.length < 8) {
                    errores.usuario_password = 'La contraseña debe tener al menos 8 caracteres';
                }
                return errores;
            }
        }
    ],

    // Valores por defecto al crear
    defaultValues: {
        usuario_situacion: 1
    },

    // Dependencias entre campos (para GestionTransaccionales)
    fieldDependencies: {
        // Por ahora no hay dependencias complejas, pero la estructura está lista
    },

    // Callbacks de cambio de campo
    onFieldChange: {
        persona_id: (valor, formulario, setFormulario) => {
            // Lógica adicional cuando cambia la persona si es necesaria
            console.log('Persona seleccionada:', valor);
        },
        rol_id: (valor, formulario, setFormulario) => {
            // Lógica adicional cuando cambia el rol si es necesaria
            console.log('Rol seleccionado:', valor);
        }
    },

    // Validación completa del formulario
    validateForm: (formulario) => {
        const errores = {};

        // Validaciones específicas de usuarios
        if (formulario.usuario_password && formulario.usuario_password.length < 8) {
            errores.usuario_password = 'La contraseña debe tener al menos 8 caracteres';
        }

        return errores;
    },

    // Procesar datos antes de guardar
    processBeforeSave: (datos) => {
        // Para edición, no enviar contraseña vacía
        if (!datos.usuario_password || datos.usuario_password.trim() === '') {
            delete datos.usuario_password;
        }

        return datos;
    },

    // Procesar duplicación
    processDuplicate: (datos) => {
        // Al duplicar, establecer contraseña temporal
        datos.usuario_password = 'temporal123';

        // No duplicar la persona (debe ser única)
        delete datos.persona_id;

        return datos;
    },

    // Callback después de guardar
    afterSave: (respuesta, esEdicion) => {
        if (!esEdicion) {
            console.log('Nuevo usuario creado:', respuesta);
        }
    },

    // Configuración específica para rutas adicionales de NIVEL 3
    additionalRoutes: {
        activate: '/api/magic/usuarios/{id}/activate',
        deactivate: '/api/magic/usuarios/{id}/deactivate',
        porRol: '/api/magic/usuarios/rol/{rolId}',
        porPersona: '/api/magic/usuarios/persona/{personaId}',
        verificarCodigo: '/api/magic/usuarios/verificar-codigo'
    }
};

// EXPORTAR CONFIGURACIÓN
export const usuariosConfig = {
    usuarios: configUsuarios
};