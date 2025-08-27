// src/resources/js/components/usuarios/common/PermisosChecker.js
import React from 'react';

const { createElement: e } = React;

class PermisosChecker {
    constructor() {
        this.empleadoActual = null;
        this.rolActual = null;
        this.permisosActuales = [];
    }

    // Inicializar con datos del empleado actual
    init(empleado) {
        this.empleadoActual = empleado;
        this.rolActual = empleado?.rol || null;
        this.permisosActuales = empleado?.rol?.permisos_json || [];

        console.log('PermisosChecker inicializado:', {
            empleado: this.empleadoActual?.codigo_empleado,
            rol: this.rolActual?.nombre_rol,
            permisos: this.permisosActuales.length
        });
    }

    // Verificar si tiene un permiso específico
    tienePermiso(permiso) {
        if (!this.permisosActuales || this.permisosActuales.length === 0) {
            return false;
        }

        return this.permisosActuales.includes(permiso);
    }

    // Verificar si tiene alguno de los permisos de una lista
    tieneAlgunPermiso(permisos) {
        if (!Array.isArray(permisos)) {
            permisos = [permisos];
        }

        return permisos.some(permiso => this.tienePermiso(permiso));
    }

    // Verificar si tiene todos los permisos de una lista
    tieneTodosLosPermisos(permisos) {
        if (!Array.isArray(permisos)) {
            permisos = [permisos];
        }

        return permisos.every(permiso => this.tienePermiso(permiso));
    }

    // Verificar nivel jerárquico
    tieneNivelJerarquico(nivelMinimo) {
        if (!this.rolActual || !this.rolActual.nivel_jerarquia) {
            return false;
        }

        return this.rolActual.nivel_jerarquia >= nivelMinimo;
    }

    // Verificar si puede autorizar
    puedeAutorizar() {
        return this.rolActual?.puede_autorizar === true;
    }

    // Verificar si es administrador
    esAdministrador() {
        return this.rolActual?.codigo === 'ADMIN' || this.tieneNivelJerarquico(10);
    }

    // Verificar permisos por módulo
    puedeAccederModulo(modulo) {
        const permisosModulo = {
            'empleados': ['empleados.ver'],
            'clientes': ['clientes.ver'],
            'vehiculos': ['vehiculos.ver'],
            'rutas': ['rutas.ver'],
            'reservas': ['reservas.ver'],
            'ventas': ['ventas.ver'],
            'reportes': ['reportes.ver'],
            'auditoria': ['auditoria.ver'],
            'catalogos': ['catalogos.ver'],
            'sistema': ['sistema.configurar']
        };

        const permisos = permisosModulo[modulo];
        if (!permisos) {
            return false;
        }

        return this.tieneAlgunPermiso(permisos);
    }

    // Verificar acciones específicas
    puedeHacerAccion(modulo, accion) {
        const permiso = `${modulo}.${accion}`;
        return this.tienePermiso(permiso);
    }

    // Obtener información del empleado actual
    getEmpleadoActual() {
        return this.empleadoActual;
    }

    // Obtener rol actual
    getRolActual() {
        return this.rolActual;
    }

    // Obtener todos los permisos
    getPermisos() {
        return this.permisosActuales;
    }

    // Limpiar datos (logout)
    limpiar() {
        this.empleadoActual = null;
        this.rolActual = null;
        this.permisosActuales = [];
        console.log('PermisosChecker limpiado');
    }
}

// Instancia global del verificador
const permisosChecker = new PermisosChecker();

// Componente HOC para verificar permisos
function ConPermisos({
    permisos,
    nivelMinimo = null,
    requiereAutorizacion = false,
    modulo = null,
    accion = null,
    children,
    fallback = null,
    mostrarError = false
}) {
    // Verificar diferentes tipos de permisos
    let tieneAcceso = true;

    // Verificar permisos específicos
    if (permisos) {
        if (Array.isArray(permisos)) {
            tieneAcceso = permisosChecker.tieneAlgunPermiso(permisos);
        } else {
            tieneAcceso = permisosChecker.tienePermiso(permisos);
        }
    }

    // Verificar nivel jerárquico
    if (tieneAcceso && nivelMinimo !== null) {
        tieneAcceso = permisosChecker.tieneNivelJerarquico(nivelMinimo);
    }

    // Verificar autorización
    if (tieneAcceso && requiereAutorizacion) {
        tieneAcceso = permisosChecker.puedeAutorizar();
    }

    // Verificar módulo
    if (tieneAcceso && modulo) {
        tieneAcceso = permisosChecker.puedeAccederModulo(modulo);
    }

    // Verificar acción específica
    if (tieneAcceso && modulo && accion) {
        tieneAcceso = permisosChecker.puedeHacerAccion(modulo, accion);
    }

    // Mostrar contenido según permisos
    if (tieneAcceso) {
        return children;
    }

    // Mostrar fallback o error
    if (fallback) {
        return fallback;
    }

    if (mostrarError) {
        return e('div', {
            style: {
                padding: '1rem',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                color: '#dc2626',
                fontSize: '0.875rem',
                textAlign: 'center'
            }
        }, 'No tiene permisos para ver este contenido');
    }

    return null;
}

// Hook personalizado para verificar permisos
function usePermisos() {
    return {
        tienePermiso: (permiso) => permisosChecker.tienePermiso(permiso),
        tieneAlgunPermiso: (permisos) => permisosChecker.tieneAlgunPermiso(permisos),
        tieneTodosLosPermisos: (permisos) => permisosChecker.tieneTodosLosPermisos(permisos),
        tieneNivelJerarquico: (nivel) => permisosChecker.tieneNivelJerarquico(nivel),
        puedeAutorizar: () => permisosChecker.puedeAutorizar(),
        esAdministrador: () => permisosChecker.esAdministrador(),
        puedeAccederModulo: (modulo) => permisosChecker.puedeAccederModulo(modulo),
        puedeHacerAccion: (modulo, accion) => permisosChecker.puedeHacerAccion(modulo, accion),
        empleadoActual: permisosChecker.getEmpleadoActual(),
        rolActual: permisosChecker.getRolActual(),
        permisos: permisosChecker.getPermisos()
    };
}

// Utilidades para botones y elementos condicionales
const PermisoButton = ({ permiso, nivelMinimo, requiereAutorizacion, children, ...props }) => {
    return e(ConPermisos, {
        permisos: permiso,
        nivelMinimo,
        requiereAutorizacion
    }, e('button', props, children));
};

const PermisoLink = ({ permiso, nivelMinimo, requiereAutorizacion, children, ...props }) => {
    return e(ConPermisos, {
        permisos: permiso,
        nivelMinimo,
        requiereAutorizacion
    }, e('a', props, children));
};

const PermisoDiv = ({ permiso, nivelMinimo, requiereAutorizacion, children, ...props }) => {
    return e(ConPermisos, {
        permisos: permiso,
        nivelMinimo,
        requiereAutorizacion
    }, e('div', props, children));
};

export default permisosChecker;
export {
    ConPermisos,
    usePermisos,
    PermisoButton,
    PermisoLink,
    PermisoDiv
};
