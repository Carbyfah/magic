// src/resources/js/components/reportes/auditoria/auditoriasConfig.js

/**
 * CONFIGURACIÓN PARA EL MÓDULO DE AUDITORÍAS MAGIC TRAVEL
 * Sistema de seguimiento y monitoreo de cambios
 */

// CONFIGURACIÓN BASE PARA AUDITORÍAS
const baseConfig = {
    defaultItemsPerPage: 15,
    defaultSortDirection: 'desc',
    statusField: null, // Las auditorías no tienen campo de estado
    searchableFields: [],
    apiEndpoint: '/api/magic/auditorias'
};

// CONFIGURACIÓN ESPECÍFICA PARA AUDITORÍAS
export const configAuditorias = {
    ...baseConfig,
    tableName: 'auditoria',
    displayName: 'Auditorías',
    primaryKey: 'auditoria_id',
    defaultSortField: 'fecha_modificacion',

    // Campos del sistema de auditoría
    fields: {
        auditoria_id: {
            label: 'ID Auditoría',
            type: 'number',
            sortable: true,
            filterable: false,
            sortType: 'numeric'
        },
        tabla_original: {
            label: 'Tabla',
            type: 'select',
            sortable: true,
            filterable: true,
            options: [
                { value: '', label: 'Todas las tablas' },
                { value: 'tipo_persona', label: 'Tipos de Persona' },
                { value: 'rol', label: 'Roles' },
                { value: 'estado', label: 'Estados' },
                { value: 'servicio', label: 'Servicios' },
                { value: 'ruta', label: 'Rutas' },
                { value: 'agencia', label: 'Agencias' },
                { value: 'persona', label: 'Personas' },
                { value: 'vehiculo', label: 'Vehículos' },
                { value: 'contactos_agencia', label: 'Contactos Agencia' },
                { value: 'usuario', label: 'Usuarios' },
                { value: 'ruta_activada', label: 'Rutas Activadas' },
                { value: 'reserva', label: 'Reservas' }
            ],
            sortType: 'alphabetic'
        },
        accion: {
            label: 'Acción',
            type: 'select',
            sortable: true,
            filterable: true,
            options: [
                { value: '', label: 'Todas las acciones' },
                { value: 'INSERT', label: 'Creación (INSERT)' },
                { value: 'UPDATE', label: 'Modificación (UPDATE)' },
                { value: 'DELETE', label: 'Eliminación (DELETE)' }
            ],
            sortType: 'alphabetic'
        },
        usuario_modificacion: {
            label: 'Usuario',
            type: 'number',
            sortable: true,
            filterable: true,
            sortType: 'numeric'
        },
        fecha_modificacion: {
            label: 'Fecha de Modificación',
            type: 'datetime',
            sortable: true,
            filterable: true,
            sortType: 'date'
        },
        ip_modificacion: {
            label: 'IP de Modificación',
            type: 'text',
            sortable: false,
            filterable: false,
            sortType: 'alphabetic'
        },
        // Campos dinámicos según la tabla (se manejan en runtime)
        registro_id: {
            label: 'ID del Registro',
            type: 'number',
            sortable: true,
            filterable: false,
            sortType: 'numeric'
        },
        campo_principal: {
            label: 'Registro Afectado',
            type: 'text',
            sortable: false,
            filterable: true,
            sortType: 'alphabetic'
        }
    },

    // Campos específicos para funcionalidades
    searchableFields: ['tabla_original', 'accion', 'campo_principal'],
    sortableFields: ['fecha_modificacion', 'tabla_original', 'accion', 'usuario_modificacion'],
    filterableFields: ['tabla_original', 'accion', 'usuario_modificacion', 'fecha_modificacion'],

    // Configuraciones específicas de auditoría
    auditoria: {
        // Mapeo de tablas de auditoría a sus nombres amigables
        tablasAuditoria: {
            'tipo_persona_auditoria': {
                nombre: 'Tipos de Persona',
                tabla_original: 'tipo_persona',
                color: '#3b82f6',
                descripcion: 'Auditoría de tipos de persona del sistema',
                camposPrincipales: ['tipo_persona_codigo', 'tipo_persona_tipo']
            },
            'rol_auditoria': {
                nombre: 'Roles',
                tabla_original: 'rol',
                color: '#8b5cf6',
                descripcion: 'Auditoría de roles y permisos del sistema',
                camposPrincipales: ['rol_codigo', 'rol_rol']
            },
            'estado_auditoria': {
                nombre: 'Estados',
                tabla_original: 'estado',
                color: '#06b6d4',
                descripcion: 'Auditoría de estados del sistema',
                camposPrincipales: ['estado_codigo', 'estado_estado']
            },
            'servicio_auditoria': {
                nombre: 'Servicios',
                tabla_original: 'servicio',
                color: '#10b981',
                descripcion: 'Auditoría de servicios turísticos',
                camposPrincipales: ['servicio_codigo', 'servicio_servicio']
            },
            'ruta_auditoria': {
                nombre: 'Rutas',
                tabla_original: 'ruta',
                color: '#f59e0b',
                descripcion: 'Auditoría de rutas de viaje',
                camposPrincipales: ['ruta_codigo', 'ruta_ruta']
            },
            'agencia_auditoria': {
                nombre: 'Agencias',
                tabla_original: 'agencia',
                color: '#ef4444',
                descripcion: 'Auditoría de agencias de viajes',
                camposPrincipales: ['agencia_codigo', 'agencia_razon_social']
            },
            'persona_auditoria': {
                nombre: 'Personas',
                tabla_original: 'persona',
                color: '#84cc16',
                descripcion: 'Auditoría de personas del sistema',
                camposPrincipales: ['persona_codigo', 'persona_nombres', 'persona_apellidos']
            },
            'vehiculo_auditoria': {
                nombre: 'Vehículos',
                tabla_original: 'vehiculo',
                color: '#6366f1',
                descripcion: 'Auditoría de vehículos de la flota',
                camposPrincipales: ['vehiculo_codigo', 'vehiculo_placa']
            },
            'contactos_agencia_auditoria': {
                nombre: 'Contactos de Agencia',
                tabla_original: 'contactos_agencia',
                color: '#f97316',
                descripcion: 'Auditoría de contactos de agencias',
                camposPrincipales: ['contactos_agencia_codigo', 'contactos_agencia_nombres']
            },
            'usuario_auditoria': {
                nombre: 'Usuarios',
                tabla_original: 'usuario',
                color: '#14b8a6',
                descripcion: 'Auditoría de usuarios del sistema',
                camposPrincipales: ['usuario_codigo']
            },
            'ruta_activada_auditoria': {
                nombre: 'Rutas Activadas',
                tabla_original: 'ruta_activada',
                color: '#a855f7',
                descripcion: 'Auditoría de rutas programadas',
                camposPrincipales: ['ruta_activada_codigo', 'ruta_activada_fecha_hora']
            },
            'reserva_auditoria': {
                nombre: 'Reservas',
                tabla_original: 'reserva',
                color: '#ec4899',
                descripcion: 'Auditoría de reservaciones de clientes',
                camposPrincipales: ['reserva_codigo', 'reserva_nombres_cliente', 'reserva_apellidos_cliente']
            }
        },

        // Colores para tipos de acción
        coloresAccion: {
            'INSERT': {
                color: '#22c55e',
                backgroundColor: '#dcfce7',
                borderColor: '#bbf7d0',
                icono: 'plus',
                label: 'Creación'
            },
            'UPDATE': {
                color: '#f59e0b',
                backgroundColor: '#fef3c7',
                borderColor: '#fde68a',
                icono: 'edit',
                label: 'Modificación'
            },
            'DELETE': {
                color: '#ef4444',
                backgroundColor: '#fef2f2',
                borderColor: '#fecaca',
                icono: 'trash',
                label: 'Eliminación'
            }
        },

        // Campos que se deben excluir de la visualización de detalles
        camposExcluir: [
            'auditoria_id',
            'fecha_modificacion',
            'usuario_modificacion',
            'ip_modificacion',
            'accion',
            'tabla_auditoria',
            'tabla_original',
            'original_created_at',
            'original_updated_at',
            'original_created_by',
            'original_updated_by',
            'original_deleted_at'
        ],

        // Prioridad de campos para mostrar como identificador principal
        prioridadCampos: [
            'codigo',
            'nombre',
            'nombres',
            'razon_social',
            'apellidos',
            'placa',
            'email',
            'telefono',
            'id'
        ],

        // Configuración de filtros avanzados
        filtrosAvanzados: {
            periodosPredefinidos: [
                { value: 'hoy', label: 'Hoy', dias: 0 },
                { value: 'ayer', label: 'Ayer', dias: 1 },
                { value: 'ultima_semana', label: 'Última Semana', dias: 7 },
                { value: 'ultimo_mes', label: 'Último Mes', dias: 30 },
                { value: 'ultimos_3_meses', label: 'Últimos 3 Meses', dias: 90 },
                { value: 'ultimo_ano', label: 'Último Año', dias: 365 }
            ],

            usuariosComunes: [
                { value: '', label: 'Todos los usuarios' },
                { value: '1', label: 'Sistema (ID: 1)' },
                { value: 'recent', label: 'Usuarios más activos' }
            ]
        },

        // Configuración de reportes
        reportes: {
            formatos: [
                { value: 'txt', label: 'Archivo de Texto (.txt)' },
                { value: 'csv', label: 'CSV para Excel (.csv)' },
                { value: 'json', label: 'JSON para desarrollo (.json)' }
            ],

            tiposReporte: [
                {
                    id: 'resumen',
                    nombre: 'Resumen General',
                    descripcion: 'Vista general de actividad por tabla y acción'
                },
                {
                    id: 'detallado',
                    nombre: 'Detallado',
                    descripcion: 'Lista completa de todos los registros de auditoría'
                },
                {
                    id: 'por_usuario',
                    nombre: 'Por Usuario',
                    descripcion: 'Actividad agrupada por usuario'
                },
                {
                    id: 'por_tabla',
                    nombre: 'Por Tabla',
                    descripcion: 'Actividad agrupada por tabla del sistema'
                }
            ]
        },

        // Configuración de limpieza
        limpieza: {
            diasMinimos: 30,
            diasRecomendados: 90,
            advertencias: {
                30: 'Limpieza mínima recomendada',
                60: 'Limpieza estándar',
                90: 'Limpieza recomendada',
                180: 'Limpieza extendida',
                365: 'Limpieza anual completa'
            }
        }
    }
};

// FUNCIÓN HELPER PARA OBTENER INFORMACIÓN DE TABLA DE AUDITORÍA
export const getTablaAuditoriaInfo = (tablaNombre) => {
    const tablaAuditoria = tablaNombre.endsWith('_auditoria')
        ? tablaNombre
        : tablaNombre + '_auditoria';

    return configAuditorias.auditoria.tablasAuditoria[tablaAuditoria] || {
        nombre: tablaNombre,
        tabla_original: tablaNombre.replace('_auditoria', ''),
        color: '#6b7280',
        descripcion: `Auditoría de ${tablaNombre}`,
        camposPrincipales: [`${tablaNombre}_codigo`, `${tablaNombre}_nombre`]
    };
};

// FUNCIÓN HELPER PARA OBTENER COLOR DE ACCIÓN
export const getColorAccion = (accion) => {
    return configAuditorias.auditoria.coloresAccion[accion] || {
        color: '#6b7280',
        backgroundColor: '#f3f4f6',
        borderColor: '#d1d5db',
        icono: 'help',
        label: 'Desconocida'
    };
};

// FUNCIÓN HELPER PARA EXTRAER CAMPO PRINCIPAL DE UN REGISTRO
export const extraerCampoPrincipal = (registro, tablaNombre) => {
    const info = getTablaAuditoriaInfo(tablaNombre);

    // Intentar con campos principales definidos
    for (const campo of info.camposPrincipales) {
        if (registro[campo]) {
            return registro[campo];
        }
    }

    // Intentar con campos de prioridad general
    for (const campo of configAuditorias.auditoria.prioridadCampos) {
        const posiblesCampos = [
            campo,
            `${info.tabla_original}_${campo}`,
            `${tablaNombre}_${campo}`
        ];

        for (const posibleCampo of posiblesCampos) {
            if (registro[posibleCampo]) {
                return registro[posibleCampo];
            }
        }
    }

    // Fallback al ID del registro principal
    const idPrincipal = `${info.tabla_original}_id`;
    if (registro[idPrincipal]) {
        return `ID: ${registro[idPrincipal]}`;
    }

    return 'Registro no identificado';
};

// FUNCIÓN HELPER PARA FORMATEAR FECHA DE AUDITORÍA
export const formatearFechaAuditoria = (fecha, formato = 'completo') => {
    if (!fecha) return 'Fecha no disponible';

    const fechaObj = new Date(fecha);
    if (isNaN(fechaObj.getTime())) return 'Fecha inválida';

    const opciones = {
        'completo': {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        },
        'fecha': {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        },
        'hora': {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        },
        'relativo': null // Se maneja por separado
    };

    if (formato === 'relativo') {
        const ahora = new Date();
        const diferencia = ahora.getTime() - fechaObj.getTime();
        const minutos = Math.floor(diferencia / (1000 * 60));
        const horas = Math.floor(minutos / 60);
        const dias = Math.floor(horas / 24);

        if (minutos < 1) return 'Hace menos de un minuto';
        if (minutos < 60) return `Hace ${minutos} minuto${minutos !== 1 ? 's' : ''}`;
        if (horas < 24) return `Hace ${horas} hora${horas !== 1 ? 's' : ''}`;
        if (dias < 7) return `Hace ${dias} día${dias !== 1 ? 's' : ''}`;

        // Para períodos más largos, mostrar fecha completa
        return fechaObj.toLocaleDateString('es-GT', opciones.completo);
    }

    return fechaObj.toLocaleDateString('es-GT', opciones[formato] || opciones.completo);
};

// FUNCIÓN HELPER PARA GENERAR ESTADÍSTICAS RÁPIDAS
export const generarEstadisticasRapidas = (auditorias) => {
    if (!Array.isArray(auditorias) || auditorias.length === 0) {
        return {
            total: 0,
            porAccion: { INSERT: 0, UPDATE: 0, DELETE: 0 },
            porTabla: {},
            ultimaActividad: null
        };
    }

    const stats = {
        total: auditorias.length,
        porAccion: { INSERT: 0, UPDATE: 0, DELETE: 0 },
        porTabla: {},
        ultimaActividad: null
    };

    let ultimaFecha = null;

    auditorias.forEach(auditoria => {
        // Contar por acción
        if (auditoria.accion && stats.porAccion.hasOwnProperty(auditoria.accion)) {
            stats.porAccion[auditoria.accion]++;
        }

        // Contar por tabla
        const tabla = auditoria.tabla_original || 'desconocida';
        stats.porTabla[tabla] = (stats.porTabla[tabla] || 0) + 1;

        // Encontrar última actividad
        if (auditoria.fecha_modificacion) {
            const fecha = new Date(auditoria.fecha_modificacion);
            if (!ultimaFecha || fecha > ultimaFecha) {
                ultimaFecha = fecha;
                stats.ultimaActividad = auditoria;
            }
        }
    });

    return stats;
};

// CONFIGURACIÓN ESPECÍFICA PARA AUDITORÍAS (EXPORTACIÓN PRINCIPAL)
export const auditoriasConfig = {
    auditorias: configAuditorias
};

// EXPORTAR CONFIGURACIONES COMO OBJETO PARA FÁCIL ACCESO
export const magicTravelAuditoriasConfigs = {
    'auditoria': configAuditorias
};

// FUNCIÓN HELPER PRINCIPAL PARA OBTENER CONFIGURACIÓN
export const getAuditoriaConfig = (configType = 'auditorias') => {
    const config = auditoriasConfig[configType];
    if (!config) {
        console.warn(`Configuración de auditoría no encontrada: ${configType}`);
        return null;
    }
    return config;
};

export default auditoriasConfig;
