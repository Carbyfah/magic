// src/resources/js/components/personal/usuarios-sistema/usuariosConfig.js

/**
 * CONFIGURACIÓN ESPECÍFICA PARA USUARIOS SISTEMA (TABLA USUARIO)
 * Adaptado para tabla de NIVEL 3 con múltiples FK (persona_id, rol_id)
 * Usa plantilla GestionTransaccionales.js
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
    },

    // VALIDACIÓN DE ESTADOS - No aplica para usuarios
    validateStates: async () => {
        return {
            valido: true,
            mensaje: 'Los usuarios no requieren validación de estados específicos'
        };
    },

    // VALIDADORES DE INTEGRIDAD
    integrityValidators: {
        // Validar código de usuario único
        validateUserCode: async (formData, usuarioId = null) => {
            if (!formData.usuario_codigo) {
                return { valido: true }; // Código se genera automáticamente
            }

            try {
                const response = await apiHelper.post('/usuarios/verificar-codigo', {
                    codigo: formData.usuario_codigo,
                    exclude_id: usuarioId
                });

                const data = await apiHelper.handleResponse(response);

                if (data.exists) {
                    return {
                        valido: false,
                        mensaje: 'Este código de usuario ya existe'
                    };
                }

                return { valido: true };
            } catch (error) {
                console.warn('Error validando código de usuario:', error);
                return { valido: true };
            }
        },

        // Validar que la persona no tenga ya un usuario
        validatePersonaUnique: async (formData, usuarioId = null) => {
            if (!formData.persona_id) {
                return { valido: true };
            }

            try {
                const response = await apiHelper.get(`/usuarios/persona/${formData.persona_id}`);
                const data = await apiHelper.handleResponse(response);

                // Si existe un usuario para esta persona y no es el actual
                if (data.usuario_id && data.usuario_id !== usuarioId) {
                    return {
                        valido: false,
                        mensaje: 'Esta persona ya tiene un usuario asignado'
                    };
                }

                return { valido: true };
            } catch (error) {
                console.warn('Error validando persona única:', error);
                return { valido: true };
            }
        },

        // Validar fortaleza de contraseña
        validatePassword: (formData, isEditing = false) => {
            const password = formData.usuario_password;

            // Si es edición y no se proporciona contraseña, es válido
            if (isEditing && (!password || password.trim() === '')) {
                return { valido: true };
            }

            // Para creación o cuando se proporciona contraseña en edición
            if (!password) {
                return {
                    valido: false,
                    mensaje: 'La contraseña es requerida'
                };
            }

            if (password.length < 8) {
                return {
                    valido: false,
                    mensaje: 'La contraseña debe tener al menos 8 caracteres'
                };
            }

            // Opcional: validar complejidad
            const tieneMinuscula = /[a-z]/.test(password);
            const tieneMayuscula = /[A-Z]/.test(password);
            const tieneNumero = /\d/.test(password);

            if (!tieneMinuscula || !tieneMayuscula || !tieneNumero) {
                return {
                    valido: false,
                    mensaje: 'La contraseña debe contener al menos una minúscula, una mayúscula y un número'
                };
            }

            return { valido: true };
        }
    },

    // HELPERS DE FORMATEO
    helpers: {
        // Formatear información del usuario
        formatUserInfo: (usuario) => {
            const persona = usuario.persona || {};
            const rol = usuario.rol || {};

            return {
                nombreCompleto: persona.nombre_completo || 'N/A',
                rolNombre: rol.nombre || 'Sin rol',
                codigo: usuario.usuario_codigo || usuario.codigo || 'Sin código'
            };
        },

        // Obtener usuarios por rol
        getByRole: (usuarios, rolId) => {
            return usuarios.filter(usuario =>
                usuario.activo &&
                (usuario.rol_id === rolId || usuario.rol?.id === rolId)
            );
        },

        // Obtener usuarios activos
        getActiveUsers: (usuarios) => {
            return usuarios.filter(usuario => usuario.activo);
        },

        // Verificar si puede ser desactivado
        canDeactivate: (usuario) => {
            // No permitir desactivar al último administrador
            const esAdmin = usuario.rol?.nombre?.toLowerCase().includes('admin');
            if (esAdmin) {
                console.warn('Verificar que no sea el último administrador antes de desactivar');
            }
            return true;
        },

        // Generar contraseña temporal
        generateTempPassword: () => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let result = '';
            for (let i = 0; i < 12; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
        }
    },

    // VALIDACIÓN COMPLETA DEL FORMULARIO - ACTUALIZADA
    validateForm: async (formulario, usuarioId = null) => {
        const errores = {};

        // Validar campos requeridos
        if (!formulario.persona_id) {
            errores.persona_id = 'El empleado es requerido';
        }

        if (!formulario.rol_id) {
            errores.rol_id = 'El rol es requerido';
        }

        // Validar código único
        const validacionCodigo = await configUsuarios.integrityValidators.validateUserCode(formulario, usuarioId);
        if (!validacionCodigo.valido) {
            errores.usuario_codigo = validacionCodigo.mensaje;
        }

        // Validar persona única
        const validacionPersona = await configUsuarios.integrityValidators.validatePersonaUnique(formulario, usuarioId);
        if (!validacionPersona.valido) {
            errores.persona_id = validacionPersona.mensaje;
        }

        // Validar contraseña
        const validacionPassword = configUsuarios.integrityValidators.validatePassword(formulario, !!usuarioId);
        if (!validacionPassword.valido) {
            errores.usuario_password = validacionPassword.mensaje;
        }

        return errores;
    },

    // PROCESAMIENTO ANTES DE GUARDAR - ACTUALIZADO
    processBeforeSave: (datos) => {
        // Para edición, no enviar contraseña vacía
        if (!datos.usuario_password || datos.usuario_password.trim() === '') {
            delete datos.usuario_password;
        }

        return datos;
    },

    // ACCIONES ESPECÍFICAS PARA USUARIOS
    actions: {
        activate: {
            label: 'Activar Usuario',
            icon: 'check-circle',
            color: 'green',
            condition: (usuario) => !usuario.activo,
            requiresConfirmation: true,
            confirmMessage: '¿Activar este usuario?'
        },
        deactivate: {
            label: 'Desactivar Usuario',
            icon: 'x-circle',
            color: 'red',
            condition: (usuario) => usuario.activo,
            requiresConfirmation: true,
            confirmMessage: '¿Desactivar este usuario? Perderá acceso al sistema.',
            validation: (usuario) => {
                return configUsuarios.helpers.canDeactivate(usuario) ?
                    { valido: true } :
                    { valido: false, mensaje: 'No se puede desactivar este usuario' };
            }
        },
        resetPassword: {
            label: 'Resetear Contraseña',
            icon: 'key',
            color: 'orange',
            condition: (usuario) => usuario.activo,
            requiresConfirmation: true,
            confirmMessage: '¿Resetear la contraseña de este usuario?'
        }
    }
};

// EXPORTAR CONFIGURACIÓN
export const usuariosConfig = {
    usuarios: configUsuarios
};
