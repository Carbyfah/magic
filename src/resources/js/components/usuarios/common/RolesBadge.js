// src/resources/js/components/usuarios/common/RolesBadge.js
import React from 'react';
import Icons from '../../../utils/Icons';

const { createElement: e } = React;

function RolesBadge({
    rol,
    size = 'normal',
    showIcon = true,
    showJerarquia = false,
    onClick = null
}) {
    if (!rol) {
        return e('span', {
            style: {
                padding: '0.25rem 0.5rem',
                borderRadius: '6px',
                fontSize: size === 'small' ? '0.6875rem' : '0.75rem',
                fontWeight: '500',
                backgroundColor: '#f3f4f6',
                color: '#6b7280',
                border: '1px solid #e5e7eb'
            }
        }, 'Sin rol');
    }

    // Configuración de colores por rol
    const getRolConfig = (rol) => {
        const configs = {
            'ADMIN': {
                bg: '#fef2f2',
                color: '#dc2626',
                border: '#fca5a5',
                icon: Icons.shield()
            },
            'GERENTE': {
                bg: '#f0f9ff',
                color: '#0369a1',
                border: '#93c5fd',
                icon: Icons.briefcase()
            },
            'VENDEDOR': {
                bg: '#f0fdf4',
                color: '#16a34a',
                border: '#86efac',
                icon: Icons.userCheck()
            },
            'CHOFER': {
                bg: '#fffbeb',
                color: '#d97706',
                border: '#fde68a',
                icon: Icons.truck()
            },
            'CAJERO': {
                bg: '#fdf4ff',
                color: '#a21caf',
                border: '#f0abfc',
                icon: Icons.calculator()
            },
            'OPERADOR': {
                bg: '#f5f3ff',
                color: '#7c3aed',
                border: '#c4b5fd',
                icon: Icons.settings()
            }
        };

        // Si existe configuración específica, usarla
        if (configs[rol.codigo]) {
            return configs[rol.codigo];
        }

        // Color por nivel jerárquico
        if (rol.nivel_jerarquia >= 8) {
            return configs['ADMIN']; // Alto nivel = rojo
        } else if (rol.nivel_jerarquia >= 6) {
            return configs['GERENTE']; // Medio nivel = azul
        } else if (rol.nivel_jerarquia >= 4) {
            return configs['VENDEDOR']; // Nivel medio-bajo = verde
        } else {
            return configs['OPERADOR']; // Nivel bajo = morado
        }
    };

    const config = getRolConfig(rol);

    // Función para formatear el nombre del rol
    const formatRolName = (rol) => {
        if (rol.nombre_rol) {
            return rol.nombre_rol;
        }

        // Formatear código si no hay nombre
        return rol.codigo ?
            rol.codigo.charAt(0).toUpperCase() + rol.codigo.slice(1).toLowerCase() :
            'Sin nombre';
    };

    const rolName = formatRolName(rol);

    return e('div', {
        onClick: onClick,
        style: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: showIcon ? '0.375rem' : '0',
            padding: size === 'small' ? '0.1875rem 0.375rem' : '0.25rem 0.5rem',
            borderRadius: '6px',
            fontSize: size === 'small' ? '0.6875rem' : '0.75rem',
            fontWeight: '500',
            backgroundColor: config.bg,
            color: config.color,
            border: `1px solid ${config.border}`,
            cursor: onClick ? 'pointer' : 'default',
            transition: 'all 0.2s ease',
            maxWidth: '100%'
        },
        title: `Rol: ${rolName}${rol.nivel_jerarquia ? ` (Nivel ${rol.nivel_jerarquia})` : ''}${rol.puede_autorizar ? ' - Puede autorizar' : ''}`,
        onMouseEnter: onClick ? (e) => {
            e.target.style.transform = 'scale(1.02)';
            e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        } : undefined,
        onMouseLeave: onClick ? (e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = 'none';
        } : undefined
    }, [
        // Icono del rol
        showIcon && e('span', {
            key: 'rol-icon',
            style: {
                display: 'flex',
                alignItems: 'center',
                fontSize: size === 'small' ? '0.75rem' : '0.875rem'
            }
        }, config.icon),

        // Nombre del rol
        e('span', {
            key: 'rol-name',
            style: {
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '120px'
            }
        }, rolName),

        // Nivel jerárquico (si está habilitado)
        showJerarquia && rol.nivel_jerarquia && e('span', {
            key: 'jerarquia',
            style: {
                marginLeft: '0.25rem',
                padding: '0.125rem 0.25rem',
                borderRadius: '4px',
                fontSize: '0.625rem',
                fontWeight: '600',
                backgroundColor: config.color + '20',
                color: config.color
            }
        }, `L${rol.nivel_jerarquia}`),

        // Indicador de autorización
        rol.puede_autorizar && e('span', {
            key: 'auth-indicator',
            style: {
                marginLeft: '0.125rem',
                fontSize: '0.625rem',
                color: config.color,
                opacity: 0.8
            },
            title: 'Puede autorizar operaciones'
        }, Icons.checkCircle())
    ]);
}

export default RolesBadge;
