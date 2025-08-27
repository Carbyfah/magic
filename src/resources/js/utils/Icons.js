// src/resources/js/utils/Icons.js
import React from 'react';
const { createElement: e } = React;

const Icons = {
    // ICONOS PRINCIPALES DEL MENU
    dashboard: (color = '#6366f1') => e('svg', {
        width: '20',
        height: '20',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    },
        [
            e('rect', { key: '1', x: '3', y: '3', width: '7', height: '7', rx: '1' }),
            e('rect', { key: '2', x: '14', y: '3', width: '7', height: '7', rx: '1' }),
            e('rect', { key: '3', x: '14', y: '14', width: '7', height: '7', rx: '1' }),
            e('rect', { key: '4', x: '3', y: '14', width: '7', height: '7', rx: '1' })
        ]
    ),

    operacion: (color = '#06b6d4') => e('svg', {
        width: '20',
        height: '20',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    },
        [
            e('circle', { key: '1', cx: '12', cy: '12', r: '10' }),
            e('polyline', { key: '2', points: '12 6 12 12 16 14' })
        ]
    ),

    comercial: (color = '#10b981') => e('svg', {
        width: '20',
        height: '20',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    },
        [
            e('line', { key: '1', x1: '12', y1: '1', x2: '12', y2: '23' }),
            e('path', { key: '2', d: 'M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' })
        ]
    ),

    flota: (color = '#f59e0b') => e('svg', {
        width: '20',
        height: '20',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    },
        [
            e('rect', { key: '1', x: '1', y: '3', width: '15', height: '13' }),
            e('polygon', { key: '2', points: '16 8 20 8 23 11 23 16 16 16 16 8' }),
            e('circle', { key: '3', cx: '5.5', cy: '18.5', r: '2.5' }),
            e('circle', { key: '4', cx: '18.5', cy: '18.5', r: '2.5' })
        ]
    ),

    reportes: (color = '#8b5cf6') => e('svg', {
        width: '20',
        height: '20',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    },
        [
            e('rect', { key: '1', x: '3', y: '3', width: '18', height: '18', rx: '2' }),
            e('line', { key: '2', x1: '9', y1: '9', x2: '15', y2: '9' }),
            e('line', { key: '3', x1: '9', y1: '13', x2: '15', y2: '13' }),
            e('line', { key: '4', x1: '9', y1: '17', x2: '13', y2: '17' })
        ]
    ),

    configuracion: (color = '#64748b') => e('svg', {
        width: '20',
        height: '20',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    },
        [
            e('circle', { key: '1', cx: '12', cy: '12', r: '3' }),
            e('path', { key: '2', d: 'M12 1v6m0 6v6m4.22-13.22l4.24 4.24M1.54 1.54l4.24 4.24M20.46 20.46l-4.24-4.24M1.54 20.46l4.24-4.24' })
        ]
    ),

    // ICONOS PARA SUB-ITEMS
    calendar: (color = '#6b7280') => e('svg', {
        width: '16',
        height: '16',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    },
        [
            e('rect', { key: '1', x: '3', y: '4', width: '18', height: '18', rx: '2' }),
            e('line', { key: '2', x1: '16', y1: '2', x2: '16', y2: '6' }),
            e('line', { key: '3', x1: '8', y1: '2', x2: '8', y2: '6' }),
            e('line', { key: '4', x1: '3', y1: '10', x2: '21', y2: '10' })
        ]
    ),

    map: (color = '#6b7280') => e('svg', {
        width: '16',
        height: '16',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    },
        [
            e('polygon', { key: '1', points: '1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6' }),
            e('line', { key: '2', x1: '8', y1: '2', x2: '8', y2: '18' }),
            e('line', { key: '3', x1: '16', y1: '6', x2: '16', y2: '22' })
        ]
    ),

    truck: (color = '#6b7280') => e('svg', {
        width: '16',
        height: '16',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    },
        [
            e('rect', { key: '1', x: '1', y: '3', width: '15', height: '13' }),
            e('polygon', { key: '2', points: '16 8 20 8 23 11 23 16 16 16 16 8' }),
            e('circle', { key: '3', cx: '5.5', cy: '18.5', r: '2.5' }),
            e('circle', { key: '4', cx: '18.5', cy: '18.5', r: '2.5' })
        ]
    ),

    users: (color = '#6b7280') => e('svg', {
        width: '16',
        height: '16',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    },
        [
            e('path', { key: '1', d: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' }),
            e('circle', { key: '2', cx: '9', cy: '7', r: '4' }),
            e('path', { key: '3', d: 'M23 21v-2a4 4 0 0 0-3-3.87' }),
            e('path', { key: '4', d: 'M16 3.13a4 4 0 0 1 0 7.75' })
        ]
    ),

    dollar: (color = '#6b7280') => e('svg', {
        width: '16',
        height: '16',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    },
        [
            e('line', { key: '1', x1: '12', y1: '1', x2: '12', y2: '23' }),
            e('path', { key: '2', d: 'M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' })
        ]
    ),

    creditCard: (color = '#6b7280') => e('svg', {
        width: '16',
        height: '16',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    },
        [
            e('rect', { key: '1', x: '1', y: '4', width: '22', height: '16', rx: '2' }),
            e('line', { key: '2', x1: '1', y1: '10', x2: '23', y2: '10' })
        ]
    ),

    building: (color = '#6b7280') => e('svg', {
        width: '16',
        height: '16',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    },
        [
            e('line', { key: '1', x1: '3', y1: '21', x2: '21', y2: '21' }),
            e('line', { key: '2', x1: '9', y1: '8', x2: '10', y2: '8' }),
            e('line', { key: '3', x1: '9', y1: '12', x2: '10', y2: '12' }),
            e('line', { key: '4', x1: '9', y1: '16', x2: '10', y2: '16' }),
            e('line', { key: '5', x1: '14', y1: '8', x2: '15', y2: '8' }),
            e('line', { key: '6', x1: '14', y1: '12', x2: '15', y2: '12' }),
            e('line', { key: '7', x1: '14', y1: '16', x2: '15', y2: '16' }),
            e('path', { key: '8', d: 'M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16' })
        ]
    ),

    user: (color = '#6b7280') => e('svg', {
        width: '16',
        height: '16',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    },
        [
            e('path', { key: '1', d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' }),
            e('circle', { key: '2', cx: '12', cy: '7', r: '4' })
        ]
    ),

    // ICONOS DE NAVEGACIÓN
    chevronDown: (color = '#6b7280') => e('svg', {
        width: '16',
        height: '16',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    },
        e('polyline', { points: '6 9 12 15 18 9' })
    ),

    chevronRight: (color = '#6b7280') => e('svg', {
        width: '16',
        height: '16',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    },
        e('polyline', { points: '9 18 15 12 9 6' })
    ),

    arrowLeft: (color = '#6b7280') => e('svg', {
        width: '16',
        height: '16',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    },
        [
            e('line', { key: '1', x1: '19', y1: '12', x2: '5', y2: '12' }),
            e('polyline', { key: '2', points: '12 19 5 12 12 5' })
        ]
    ),

    // ICONOS ESPECIALES
    menu: (color = '#6b7280') => e('svg', {
        width: '20',
        height: '20',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    },
        [
            e('line', { key: '1', x1: '3', y1: '12', x2: '21', y2: '12' }),
            e('line', { key: '2', x1: '3', y1: '6', x2: '21', y2: '6' }),
            e('line', { key: '3', x1: '3', y1: '18', x2: '21', y2: '18' })
        ]
    ),

    close: (color = '#6b7280') => e('svg', {
        width: '20',
        height: '20',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    },
        [
            e('line', { key: '1', x1: '18', y1: '6', x2: '6', y2: '18' }),
            e('line', { key: '2', x1: '6', y1: '6', x2: '18', y2: '18' })
        ]
    ),

    search: (color = '#6b7280') => e('svg', {
        width: '20',
        height: '20',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    },
        [
            e('circle', { key: '1', cx: '11', cy: '11', r: '8' }),
            e('path', { key: '2', d: 'm21 21-4.35-4.35' })
        ]
    ),

    bell: (color = '#6b7280') => e('svg', {
        width: '20',
        height: '20',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    },
        [
            e('path', { key: '1', d: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9' }),
            e('path', { key: '2', d: 'M13.73 21a2 2 0 0 1-3.46 0' })
        ]
    ),

    // ICONO PARA TOGGLE SIDEBAR
    toggleSidebar: (direction = 'left') => e('svg', {
        width: '20',
        height: '20',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: '#4b5563',
        strokeWidth: '2.5',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        style: {
            transform: direction === 'right' ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease'
        }
    },
        [
            e('polyline', { key: '1', points: '15 18 9 12 15 6' }),
            e('line', { key: '2', x1: '3', y1: '12', x2: '9', y2: '12' })
        ]
    ),

    // ICONOS PARA TOPBAR
    notification: (color = '#6b7280') => e('svg', {
        width: '20',
        height: '20',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    },
        [
            e('path', { key: '1', d: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9' }),
            e('path', { key: '2', d: 'M13.73 21a2 2 0 0 1-3.46 0' }),
            e('circle', { key: 'dot', cx: '17', cy: '7', r: '3', fill: '#ef4444', stroke: 'none' })
        ]
    ),

    settings: (color = '#6b7280') => e('svg', {
        width: '20',
        height: '20',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    },
        [
            e('circle', { key: '1', cx: '12', cy: '12', r: '3' }),
            e('path', { key: '2', d: 'M12 1v6m0 6v6m4.22-13.22l4.24 4.24M1.54 1.54l4.24 4.24M20.46 20.46l-4.24-4.24M1.54 20.46l4.24-4.24' })
        ]
    ),

    logout: (color = '#6b7280') => e('svg', {
        width: '20',
        height: '20',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    },
        [
            e('path', { key: '1', d: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' }),
            e('polyline', { key: '2', points: '16 17 21 12 16 7' }),
            e('line', { key: '3', x1: '21', y1: '12', x2: '9', y2: '12' })
        ]
    ),

    busLogo: (color = '#3b82f6') => e('svg', {
        width: '32',
        height: '32',
        viewBox: '0 0 24 24',
        fill: color,
        stroke: 'none'
    },
        [
            e('path', { key: '1', d: 'M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v11h-1a3 3 0 0 0-6 0h-2a3 3 0 0 0-6 0H4V6z', fill: color }),
            e('circle', { key: '2', cx: '7.5', cy: '17.5', r: '2.5', fill: '#1e293b' }),
            e('circle', { key: '3', cx: '16.5', cy: '17.5', r: '2.5', fill: '#1e293b' }),
            e('rect', { key: '4', x: '6', y: '7', width: '4', height: '4', rx: '0.5', fill: 'white' }),
            e('rect', { key: '5', x: '14', y: '7', width: '4', height: '4', rx: '0.5', fill: 'white' })
        ]
    ),

    help: (color = '#6b7280') => e('svg', {
        width: '20',
        height: '20',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    },
        [
            e('circle', { key: '1', cx: '12', cy: '12', r: '10' }),
            e('path', { key: '2', d: 'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3' }),
            e('line', { key: '3', x1: '12', y1: '17', x2: '12.01', y2: '17' })
        ]
    ),

    // AGREGAR ESTOS ICONOS AL ARCHIVO Icons.js EXISTENTE

    // ========== ICONOS FALTANTES PARA LOS CATÁLOGOS ==========

    // Iconos de acciones
    plus: (color = '#ffffff') => e('svg', {
        width: '16',
        height: '16',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    },
        [
            e('line', { key: '1', x1: '12', y1: '5', x2: '12', y2: '19' }),
            e('line', { key: '2', x1: '5', y1: '12', x2: '19', y2: '12' })
        ]
    ),

    search: (color = '#9ca3af') => e('svg', {
        width: '16',
        height: '16',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    },
        [
            e('circle', { key: '1', cx: '11', cy: '11', r: '8' }),
            e('line', { key: '2', x1: '21', y1: '21', x2: '16.65', y2: '16.65' })
        ]
    ),

    eye: (color = '#6b7280') => e('svg', {
        width: '16',
        height: '16',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    },
        [
            e('path', { key: '1', d: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z' }),
            e('circle', { key: '2', cx: '12', cy: '12', r: '3' })
        ]
    ),

    edit: (color = '#3b82f6') => e('svg', {
        width: '16',
        height: '16',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    },
        [
            e('path', { key: '1', d: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' }),
            e('path', { key: '2', d: 'M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z' })
        ]
    ),

    trash: (color = '#dc2626') => e('svg', {
        width: '16',
        height: '16',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    },
        [
            e('polyline', { key: '1', points: '3 6 5 6 21 6' }),
            e('path', { key: '2', d: 'm19 6-1 14c0 1.1-.9 2-2 2H8c-1.1 0-2-.9-2-2L5 6' }),
            e('path', { key: '3', d: 'M10 11v6' }),
            e('path', { key: '4', d: 'M14 11v6' }),
            e('path', { key: '5', d: 'M9 6V4c0-.6.4-1 1-1h4c.6 0 1 .4 1 1v2' })
        ]
    ),

    x: (color = '#6b7280') => e('svg', {
        width: '16',
        height: '16',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    },
        [
            e('line', { key: '1', x1: '18', y1: '6', x2: '6', y2: '18' }),
            e('line', { key: '2', x1: '6', y1: '6', x2: '18', y2: '18' })
        ]
    ),

    // Iconos de estado
    alertCircle: (color = '#dc2626') => e('svg', {
        width: '16',
        height: '16',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    },
        [
            e('circle', { key: '1', cx: '12', cy: '12', r: '10' }),
            e('line', { key: '2', x1: '12', y1: '8', x2: '12', y2: '12' }),
            e('line', { key: '3', x1: '12', y1: '16', x2: '12.01', y2: '16' })
        ]
    ),

    inbox: (color = '#9ca3af') => e('svg', {
        width: '24',
        height: '24',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    },
        [
            e('polyline', { key: '1', points: '22 12 18 12 15 21 9 21 6 12 2 12' }),
            e('path', { key: '2', d: 'M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z' })
        ]
    ),

    checkCircle: (color = '#10b981') => e('svg', {
        width: '12',
        height: '12',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    },
        [
            e('path', { key: '1', d: 'M22 11.08V12a10 10 0 1 1-5.93-9.14' }),
            e('polyline', { key: '2', points: '22 4 12 14.01 9 11.01' })
        ]
    ),

    // Iconos de catálogos específicos
    clock: (color = '#10b981') => e('svg', {
        width: '24',
        height: '24',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    },
        [
            e('circle', { key: '1', cx: '12', cy: '12', r: '10' }),
            e('polyline', { key: '2', points: '12 6 12 12 16 14' })
        ]
    ),

    globe: (color = '#06b6d4') => e('svg', {
        width: '24',
        height: '24',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    },
        [
            e('circle', { key: '1', cx: '12', cy: '12', r: '10' }),
            e('line', { key: '2', x1: '2', y1: '12', x2: '22', y2: '12' }),
            e('path', { key: '3', d: 'M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z' })
        ]
    ),

    shield: (color = '#ef4444') => e('svg', {
        width: '24',
        height: '24',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    },
        [
            e('path', { key: '1', d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' })
        ]
    ),

    userCheck: (color = '#14b8a6') => e('svg', {
        width: '24',
        height: '24',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    },
        [
            e('path', { key: '1', d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' }),
            e('circle', { key: '2', cx: '9', cy: '7', r: '4' }),
            e('polyline', { key: '3', points: '16 11 18 13 22 9' })
        ]
    ),

    card: (color = '#84cc16') => e('svg', {
        width: '24',
        height: '24',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    },
        [
            e('rect', { key: '1', x: '1', y: '4', width: '22', height: '16', rx: '2', ry: '2' }),
            e('line', { key: '2', x1: '1', y1: '10', x2: '23', y2: '10' })
        ]
    ),

    fuel: (color = '#f97316') => e('svg', {
        width: '24',
        height: '24',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    },
        [
            e('line', { key: '1', x1: '3', y1: '22', x2: '15', y2: '22' }),
            e('line', { key: '2', x1: '4', y1: '9', x2: '14', y2: '9' }),
            e('path', { key: '3', d: 'M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18' }),
            e('path', { key: '4', d: 'M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2' }),
            e('circle', { key: '5', cx: '17', cy: '5', r: '1' })
        ]
    ),

    // Iconos para estadísticas
    folder: (color = '#3b82f6') => e('svg', {
        width: '24',
        height: '24',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    },
        [
            e('path', { key: '1', d: 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z' })
        ]
    ),

    database: (color = '#10b981') => e('svg', {
        width: '16',
        height: '16',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    },
        [
            e('ellipse', { key: '1', cx: '12', cy: '5', rx: '9', ry: '3' }),
            e('path', { key: '2', d: 'M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5' }),
            e('path', { key: '3', d: 'M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3' })
        ]
    ),

    tag: (color = '#a855f7') => e('svg', {
        width: '24',
        height: '24',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    },
        [
            e('path', { key: '1', d: 'M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z' }),
            e('line', { key: '2', x1: '7', y1: '7', x2: '7.01', y2: '7' })
        ]
    ),

    // AGREGAR ESTOS ICONOS PROFESIONALES AL ARCHIVO Icons.js

    // Iconos para reportes y gráficos
    chartBar: (color = '#10b981') => e('svg', {
        width: '24',
        height: '24',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    },
        [
            e('line', { key: '1', x1: '12', y1: '20', x2: '12', y2: '10' }),
            e('line', { key: '2', x1: '18', y1: '20', x2: '18', y2: '4' }),
            e('line', { key: '3', x1: '6', y1: '20', x2: '6', y2: '16' })
        ]
    ),

    chartLine: (color = '#f59e0b') => e('svg', {
        width: '24',
        height: '24',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    },
        [
            e('polyline', { key: '1', points: '22 12 18 12 15 21 9 21 6 12 2 12' }),
            e('polyline', { key: '2', points: '1 6 7 12 13 8 22 14' })
        ]
    ),

    trendingUp: (color = '#059669') => e('svg', {
        width: '24',
        height: '24',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    },
        [
            e('polyline', { key: '1', points: '22 7 13.5 15.5 8.5 10.5 2 17' }),
            e('polyline', { key: '2', points: '16 7 22 7 22 13' })
        ]
    ),

    // Icono para rutas profesional
    route: (color = '#8b5cf6') => e('svg', {
        width: '24',
        height: '24',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    },
        [
            e('circle', { key: '1', cx: '6', cy: '19', r: '3' }),
            e('path', { key: '2', d: 'M9 19h8.5A3.5 3.5 0 0 0 21 15.5V7a3.5 3.5 0 0 0-3.5-3.5H9' }),
            e('circle', { key: '3', cx: '6', cy: '7', r: '3' }),
            e('path', { key: '4', d: 'M9 7h8.5A3.5 3.5 0 0 1 21 10.5v.5' })
        ]
    ),

    // Icono para grupos de usuarios
    userGroup: (color = '#ef4444') => e('svg', {
        width: '24',
        height: '24',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    },
        [
            e('path', { key: '1', d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' }),
            e('circle', { key: '2', cx: '9', cy: '7', r: '4' }),
            e('path', { key: '3', d: 'M22 21v-2a4 4 0 0 0-3-3.87' }),
            e('path', { key: '4', d: 'M16 3.13a4 4 0 0 1 0 7.75' })
        ]
    ),

    // Icono de configuración mejorado
    gear: (color = '#64748b') => e('svg', {
        width: '24',
        height: '24',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    },
        [
            e('circle', { key: '1', cx: '12', cy: '12', r: '3' }),
            e('path', { key: '2', d: 'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z' })
        ]
    ),

    // Icono de monitor/control
    monitor: (color = '#06b6d4') => e('svg', {
        width: '24',
        height: '24',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    },
        [
            e('rect', { key: '1', x: '2', y: '3', width: '20', height: '14', rx: '2', ry: '2' }),
            e('line', { key: '2', x1: '8', y1: '21', x2: '16', y2: '21' }),
            e('line', { key: '3', x1: '12', y1: '17', x2: '12', y2: '21' })
        ]
    ),

    // Icono profesional para documentos/auditoría
    fileText: (color = '#374151') => e('svg', {
        width: '24',
        height: '24',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    },
        [
            e('path', { key: '1', d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }),
            e('polyline', { key: '2', points: '14 2 14 8 20 8' }),
            e('line', { key: '3', x1: '16', y1: '13', x2: '8', y2: '13' }),
            e('line', { key: '4', x1: '16', y1: '17', x2: '8', y2: '17' }),
            e('polyline', { key: '5', points: '10 9 9 9 8 9' })
        ]
    ),
    // ICONOS FALTANTES CRÍTICOS
    refresh: (color = '#ffffff') => e('svg', {
        width: '16',
        height: '16',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    }, [
        e('path', { key: '1', d: 'M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8' }),
        e('path', { key: '2', d: 'M21 3v5h-5' }),
        e('path', { key: '3', d: 'M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16' }),
        e('path', { key: '4', d: 'M8 16H3v5' })
    ]),

    // SI NO TIENES ESTOS, AGREGARLOS TAMBIÉN:
    message: (color = '#ffffff') => e('svg', {
        width: '24',
        height: '24',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    }, [
        e('path', { key: '1', d: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z' })
    ]),

    check: (color = '#059669') => e('svg', {
        width: '16',
        height: '16',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    }, [
        e('polyline', { key: '1', points: '20,6 9,17 4,12' })
    ]),

    eyeOff: (color = '#dc2626') => e('svg', {
        width: '16',
        height: '16',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    }, [
        e('path', { key: '1', d: 'm9.88 9.88a3 3 0 1 0 4.24 4.24' }),
        e('path', { key: '2', d: 'M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68' }),
        e('path', { key: '3', d: 'M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61' }),
        e('line', { key: '4', x1: '2', x2: '22', y1: '2', y2: '22' })
    ]),
    // ICONOS FALTANTES PARA DUPLICATEMODAL
    alertTriangle: (color = '#f59e0b') => e('svg', {
        width: '24',
        height: '24',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    }, [
        e('path', { key: '1', d: 'm21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z' }),
        e('path', { key: '2', d: 'M12 9v4' }),
        e('path', { key: '3', d: 'M12 17h.01' })
    ]),

    archive: (color = '#dc2626') => e('svg', {
        width: '16',
        height: '16',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    }, [
        e('polyline', { key: '1', points: '21,8 21,21 3,21 3,8' }),
        e('rect', { key: '2', x: '1', y: '3', width: '22', height: '5' }),
        e('line', { key: '3', x1: '10', y1: '12', x2: '14', y2: '12' })
    ]),

    // ICONOS FALTANTES PARA RESERVAS - AGREGAR AL FINAL DEL ARCHIVO Icons.js

    // Icono de ubicación/pin para pickup
    mapPin: (color = '#3b82f6') => e('svg', {
        width: '24',
        height: '24',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    }, [
        e('path', { key: '1', d: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z' }),
        e('circle', { key: '2', cx: '12', cy: '10', r: '3' })
    ]),

    // Icono de signo de dólar
    dollarSign: (color = '#3b82f6') => e('svg', {
        width: '24',
        height: '24',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    }, [
        e('line', { key: '1', x1: '12', y1: '1', x2: '12', y2: '23' }),
        e('path', { key: '2', d: 'M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' })
    ]),

    // Icono X con círculo para errores
    xCircle: (color = '#ef4444') => e('svg', {
        width: '16',
        height: '16',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    }, [
        e('circle', { key: '1', cx: '12', cy: '12', r: '10' }),
        e('path', { key: '2', d: 'M15 9L9 15' }),
        e('path', { key: '3', d: 'M9 9l6 6' })
    ]),

    // Icono de teléfono
    phone: (color = '#3b82f6') => e('svg', {
        width: '24',
        height: '24',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    }, [
        e('path', { key: '1', d: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z' })
    ]),

    // ICONOS MEJORADOS PARA BOTONES DE ACCIÓN - AGREGAR AL ARCHIVO Icons.js

    // Icono WhatsApp más reconocible
    whatsapp: (color = '#25d366') => e('svg', {
        width: '18',
        height: '18',
        viewBox: '0 0 24 24',
        fill: color,
        stroke: 'none'
    }, [
        e('path', {
            key: '1',
            d: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.507'
        })
    ]),

    // Casilla de verificación (checkbox) vacía para poder "chequear"
    checkbox: (color = '#10b981') => e('svg', {
        width: '18',
        height: '18',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    }, [
        e('rect', {
            key: '1',
            x: '3',
            y: '3',
            width: '18',
            height: '18',
            rx: '3',
            fill: 'none',
            stroke: color
        })
    ]),

    // Casilla marcada (cuando ya está confirmada)
    checkboxChecked: (color = '#10b981') => e('svg', {
        width: '18',
        height: '18',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'none'
    }, [
        // Cuadro de fondo
        e('rect', {
            key: '1',
            x: '3',
            y: '3',
            width: '18',
            height: '18',
            rx: '3',
            fill: color,
            stroke: color,
            strokeWidth: '2'
        }),
        // Palomita blanca
        e('path', {
            key: '2',
            d: 'M8 12l3 3 6-6',
            stroke: 'white',
            strokeWidth: '2.5',
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            fill: 'none'
        })
    ]),

    // AGREGAR ESTOS ICONOS AL FINAL DEL ARCHIVO Icons.js (antes del };)

    // Iconos de ordenamiento para filtros
    sortDesc: (color = '#currentColor') => e('svg', {
        width: '16',
        height: '16',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    }, [
        e('path', { key: '1', d: 'm3 16 4 4 4-4' }),
        e('path', { key: '2', d: 'M7 20V4' }),
        e('path', { key: '3', d: 'm21 8-4-4-4 4' }),
        e('path', { key: '4', d: 'M17 4v16' })
    ]),

    sortAsc: (color = '#currentColor') => e('svg', {
        width: '16',
        height: '16',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    }, [
        e('path', { key: '1', d: 'm3 8 4-4 4 4' }),
        e('path', { key: '2', d: 'M7 4v16' }),
        e('path', { key: '3', d: 'm21 16-4 4-4-4' }),
        e('path', { key: '4', d: 'M17 20V4' })
    ]),

    // También agregar estos iconos útiles para filtros
    filter: (color = '#3b82f6') => e('svg', {
        width: '20',
        height: '20',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    }, [
        e('polygon', { key: '1', points: '22,3 2,3 10,12.46 10,19 14,21 14,12.46' })
    ]),

    copy: (color = '#6b7280') => e('svg', {
        width: '16',
        height: '16',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    }, [
        e('rect', { key: '1', x: '9', y: '9', width: '13', height: '13', rx: '2', ry: '2' }),
        e('path', { key: '2', d: 'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1' })
    ]),

    info: (color = '#3b82f6') => e('svg', {
        width: '16',
        height: '16',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    }, [
        e('circle', { key: '1', cx: '12', cy: '12', r: '10' }),
        e('path', { key: '2', d: 'M12 16v-4' }),
        e('path', { key: '3', d: 'M12 8h.01' })
    ]),

    messageCircle: (color = '#25d366') => e('svg', {
        width: '20',
        height: '20',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    }, [
        e('path', { key: '1', d: 'm3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z' })
    ]),

    play: (color = '#3b82f6') => e('svg', {
        width: '16',
        height: '16',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    }, [
        e('polygon', { key: '1', points: '5,3 19,12 5,21' })
    ]),

    userX: (color = '#ec4899') => e('svg', {
        width: '16',
        height: '16',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    }, [
        e('path', { key: '1', d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' }),
        e('circle', { key: '2', cx: '9', cy: '7', r: '4' }),
        e('line', { key: '3', x1: '17', y1: '8', x2: '22', y2: '13' }),
        e('line', { key: '4', x1: '22', y1: '8', x2: '17', y2: '13' })
    ]),

    list: (color = '#374151') => e('svg', {
        width: '16',
        height: '16',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    }, [
        e('line', { key: '1', x1: '8', y1: '6', x2: '21', y2: '6' }),
        e('line', { key: '2', x1: '8', y1: '12', x2: '21', y2: '12' }),
        e('line', { key: '3', x1: '8', y1: '18', x2: '21', y2: '18' }),
        e('line', { key: '4', x1: '3', y1: '6', x2: '3.01', y2: '6' }),
        e('line', { key: '5', x1: '3', y1: '12', x2: '3.01', y2: '12' }),
        e('line', { key: '6', x1: '3', y1: '18', x2: '3.01', y2: '18' })
    ]),

    grid: (color = '#374151') => e('svg', {
        width: '16',
        height: '16',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    }, [
        e('rect', { key: '1', x: '3', y: '3', width: '7', height: '7' }),
        e('rect', { key: '2', x: '14', y: '3', width: '7', height: '7' }),
        e('rect', { key: '3', x: '14', y: '14', width: '7', height: '7' }),
        e('rect', { key: '4', x: '3', y: '14', width: '7', height: '7' })
    ]),

    // iCONOS PARA RUTAS
    pause: (color = '#f59e0b') => e('svg', {
        width: '16',
        height: '16',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    }, [
        e('rect', { key: '1', x: '6', y: '4', width: '4', height: '16' }),
        e('rect', { key: '2', x: '14', y: '4', width: '4', height: '16' })
    ]),

    calculator: (color = '#6b7280') => e('svg', {
        width: '16',
        height: '16',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    }, [
        e('rect', { key: '1', x: '4', y: '2', width: '16', height: '20', rx: '2', ry: '2' }),
        e('line', { key: '2', x1: '8', y1: '6', x2: '16', y2: '6' }),
        e('line', { key: '3', x1: '8', y1: '10', x2: '16', y2: '10' }),
        e('line', { key: '4', x1: '8', y1: '14', x2: '16', y2: '14' }),
        e('line', { key: '5', x1: '8', y1: '18', x2: '12', y2: '18' })
    ]),

    // iconos de agencias
    percentage: (color = '#8b5cf6') => e('svg', {
        width: '16',
        height: '16',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    }, [
        e('line', { key: '1', x1: '19', y1: '5', x2: '5', y2: '19' }),
        e('circle', { key: '2', cx: '6.5', cy: '6.5', r: '2.5' }),
        e('circle', { key: '3', cx: '17.5', cy: '17.5', r: '2.5' })
    ]),
};

export default Icons;
