// src/resources/js/components/usuarios/common/UserAvatar.js
import React from 'react';
import Icons from '../../../utils/Icons';

const { createElement: e } = React;

function UserAvatar({
    empleado,
    size = '32px',
    showStatus = false,
    onClick = null
}) {
    // Generar iniciales del nombre
    const getInitials = (empleado) => {
        if (!empleado || !empleado.persona) return 'U';

        const nombres = empleado.persona.nombres || '';
        const apellidos = empleado.persona.apellidos || '';

        if (nombres && apellidos) {
            return `${nombres.charAt(0)}${apellidos.charAt(0)}`.toUpperCase();
        } else if (nombres) {
            return nombres.substring(0, 2).toUpperCase();
        } else if (empleado.codigo_empleado) {
            return empleado.codigo_empleado.substring(0, 2).toUpperCase();
        }

        return 'U';
    };

    // Generar color basado en el nombre
    const getAvatarColor = (empleado) => {
        if (!empleado || !empleado.persona) return '#6b7280';

        const name = `${empleado.persona.nombres || ''} ${empleado.persona.apellidos || ''}`.trim();
        if (!name) return '#6b7280';

        // Colores profesionales para avatares
        const colors = [
            '#ef4444', // red-500
            '#f97316', // orange-500
            '#f59e0b', // amber-500
            '#eab308', // yellow-500
            '#84cc16', // lime-500
            '#22c55e', // green-500
            '#10b981', // emerald-500
            '#14b8a6', // teal-500
            '#06b6d4', // cyan-500
            '#0ea5e9', // sky-500
            '#3b82f6', // blue-500
            '#6366f1', // indigo-500
            '#8b5cf6', // violet-500
            '#a855f7', // purple-500
            '#d946ef', // fuchsia-500
            '#ec4899', // pink-500
        ];

        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }

        return colors[Math.abs(hash) % colors.length];
    };

    // Obtener nombre completo para tooltip
    const getFullName = (empleado) => {
        if (!empleado || !empleado.persona) return 'Usuario';

        const nombres = empleado.persona.nombres || '';
        const apellidos = empleado.persona.apellidos || '';

        return `${nombres} ${apellidos}`.trim() || empleado.codigo_empleado || 'Usuario';
    };

    const initials = getInitials(empleado);
    const backgroundColor = getAvatarColor(empleado);
    const fullName = getFullName(empleado);
    const isActive = empleado && empleado.situacion;

    return e('div', {
        style: {
            position: 'relative',
            display: 'inline-block'
        },
        title: fullName
    }, [
        // Avatar principal
        e('div', {
            key: 'avatar',
            onClick: onClick,
            style: {
                width: size,
                height: size,
                borderRadius: '50%',
                backgroundColor: backgroundColor,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: parseInt(size) > 40 ? '0.875rem' : '0.75rem',
                fontWeight: '600',
                cursor: onClick ? 'pointer' : 'default',
                border: '2px solid white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'all 0.2s ease'
            },
            onMouseEnter: onClick ? (e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
            } : undefined,
            onMouseLeave: onClick ? (e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            } : undefined
        }, initials),

        // Indicador de estado (si está habilitado)
        showStatus && e('div', {
            key: 'status-indicator',
            style: {
                position: 'absolute',
                bottom: '-2px',
                right: '-2px',
                width: Math.max(parseInt(size) / 4, 8) + 'px',
                height: Math.max(parseInt(size) / 4, 8) + 'px',
                borderRadius: '50%',
                backgroundColor: isActive ? '#22c55e' : '#ef4444',
                border: '2px solid white',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
            },
            title: isActive ? 'Usuario activo' : 'Usuario inactivo'
        })
    ]);
}

export default UserAvatar;
