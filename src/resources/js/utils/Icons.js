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
    )
};

export default Icons;
