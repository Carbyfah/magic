// src/resources/js/utils/Icons.js
import React from 'react';
const { createElement: e } = React;

const Icons = {
    // ===== ICONOS PRINCIPALES DEL MENU =====
    dashboard: (color = '#6366f1') => e('svg', {
        width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('rect', { key: '1', x: '3', y: '3', width: '7', height: '7', rx: '1' }),
        e('rect', { key: '2', x: '14', y: '3', width: '7', height: '7', rx: '1' }),
        e('rect', { key: '3', x: '14', y: '14', width: '7', height: '7', rx: '1' }),
        e('rect', { key: '4', x: '3', y: '14', width: '7', height: '7', rx: '1' })
    ]),

    operacion: (color = '#06b6d4') => e('svg', {
        width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('circle', { key: '1', cx: '12', cy: '12', r: '10' }),
        e('polyline', { key: '2', points: '12 6 12 12 16 14' })
    ]),

    comercial: (color = '#10b981') => e('svg', {
        width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('line', { key: '1', x1: '12', y1: '1', x2: '12', y2: '23' }),
        e('path', { key: '2', d: 'M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' })
    ]),

    flota: (color = '#f59e0b') => e('svg', {
        width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('rect', { key: '1', x: '1', y: '3', width: '15', height: '13' }),
        e('polygon', { key: '2', points: '16 8 20 8 23 11 23 16 16 16 16 8' }),
        e('circle', { key: '3', cx: '5.5', cy: '18.5', r: '2.5' }),
        e('circle', { key: '4', cx: '18.5', cy: '18.5', r: '2.5' })
    ]),

    reportes: (color = '#8b5cf6') => e('svg', {
        width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('rect', { key: '1', x: '3', y: '3', width: '18', height: '18', rx: '2' }),
        e('line', { key: '2', x1: '9', y1: '9', x2: '15', y2: '9' }),
        e('line', { key: '3', x1: '9', y1: '13', x2: '15', y2: '13' }),
        e('line', { key: '4', x1: '9', y1: '17', x2: '13', y2: '17' })
    ]),

    configuracion: (color = '#64748b') => e('svg', {
        width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('circle', { key: '1', cx: '12', cy: '12', r: '3' }),
        e('path', { key: '2', d: 'M12 1v6m0 6v6m4.22-13.22l4.24 4.24M1.54 1.54l4.24 4.24M20.46 20.46l-4.24-4.24M1.54 20.46l4.24-4.24' })
    ]),

    // ===== ICONOS DE NAVEGACION =====
    menu: (color = '#6b7280') => e('svg', {
        width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('line', { key: '1', x1: '3', y1: '12', x2: '21', y2: '12' }),
        e('line', { key: '2', x1: '3', y1: '6', x2: '21', y2: '6' }),
        e('line', { key: '3', x1: '3', y1: '18', x2: '21', y2: '18' })
    ]),

    close: (color = '#6b7280') => e('svg', {
        width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('line', { key: '1', x1: '18', y1: '6', x2: '6', y2: '18' }),
        e('line', { key: '2', x1: '6', y1: '6', x2: '18', y2: '18' })
    ]),

    x: (color = '#6b7280') => e('svg', {
        width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('line', { key: '1', x1: '18', y1: '6', x2: '6', y2: '18' }),
        e('line', { key: '2', x1: '6', y1: '6', x2: '18', y2: '18' })
    ]),

    chevronDown: (color = '#6b7280') => e('svg', {
        width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [e('polyline', { key: '1', points: '6 9 12 15 18 9' })]),

    chevronRight: (color = '#6b7280') => e('svg', {
        width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [e('polyline', { key: '1', points: '9 18 15 12 9 6' })]),

    arrowLeft: (color = '#6b7280') => e('svg', {
        width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('line', { key: '1', x1: '19', y1: '12', x2: '5', y2: '12' }),
        e('polyline', { key: '2', points: '12 19 5 12 12 5' })
    ]),

    toggleSidebar: (direction = 'left') => e('svg', {
        width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none',
        stroke: '#4b5563', strokeWidth: '2.5', strokeLinecap: 'round', strokeLinejoin: 'round',
        style: {
            transform: direction === 'right' ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease'
        }
    }, [
        e('polyline', { key: '1', points: '15 18 9 12 15 6' }),
        e('line', { key: '2', x1: '3', y1: '12', x2: '9', y2: '12' })
    ]),

    // ===== ICONOS DE ACCIONES =====
    plus: (color = '#ffffff') => e('svg', {
        width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('line', { key: '1', x1: '12', y1: '5', x2: '12', y2: '19' }),
        e('line', { key: '2', x1: '5', y1: '12', x2: '19', y2: '12' })
    ]),

    edit: (color = '#3b82f6') => e('svg', {
        width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('path', { key: '1', d: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' }),
        e('path', { key: '2', d: 'M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z' })
    ]),

    trash: (color = '#dc2626') => e('svg', {
        width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('polyline', { key: '1', points: '3 6 5 6 21 6' }),
        e('path', { key: '2', d: 'm19 6-1 14c0 1.1-.9 2-2 2H8c-1.1 0-2-.9-2-2L5 6' }),
        e('path', { key: '3', d: 'M10 11v6' }),
        e('path', { key: '4', d: 'M14 11v6' }),
        e('path', { key: '5', d: 'M9 6V4c0-.6.4-1 1-1h4c.6 0 1 .4 1 1v2' })
    ]),

    eye: (color = '#6b7280') => e('svg', {
        width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('path', { key: '1', d: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z' }),
        e('circle', { key: '2', cx: '12', cy: '12', r: '3' })
    ]),

    eyeOff: (color = '#dc2626') => e('svg', {
        width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('path', { key: '1', d: 'm9.88 9.88a3 3 0 1 0 4.24 4.24' }),
        e('path', { key: '2', d: 'M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68' }),
        e('path', { key: '3', d: 'M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61' }),
        e('line', { key: '4', x1: '2', x2: '22', y1: '2', y2: '22' })
    ]),

    refresh: (color = '#ffffff') => e('svg', {
        width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('path', { key: '1', d: 'M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8' }),
        e('path', { key: '2', d: 'M21 3v5h-5' }),
        e('path', { key: '3', d: 'M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16' }),
        e('path', { key: '4', d: 'M8 16H3v5' })
    ]),

    download: (color = '#ffffff') => e('svg', {
        width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('path', { key: '1', d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }),
        e('polyline', { key: '2', points: '7,10 12,15 17,10' }),
        e('line', { key: '3', x1: '12', y1: '15', x2: '12', y2: '3' })
    ]),

    play: (color = '#3b82f6') => e('svg', {
        width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [e('polygon', { key: '1', points: '5,3 19,12 5,21' })]),

    pause: (color = '#f59e0b') => e('svg', {
        width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('rect', { key: '1', x: '6', y: '4', width: '4', height: '16' }),
        e('rect', { key: '2', x: '14', y: '4', width: '4', height: '16' })
    ]),

    copy: (color = '#6b7280') => e('svg', {
        width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('rect', { key: '1', x: '9', y: '9', width: '13', height: '13', rx: '2', ry: '2' }),
        e('path', { key: '2', d: 'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1' })
    ]),

    check: (color = '#059669') => e('svg', {
        width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [e('polyline', { key: '1', points: '20,6 9,17 4,12' })]),

    arrow: (color = '#f59e0b') => e('svg', {
        width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('line', { key: '1', x1: '5', y1: '12', x2: '19', y2: '12' }),
        e('polyline', { key: '2', points: '12 5 19 12 12 19' })
    ]),

    // ===== ICONOS DE BUSQUEDA Y FILTROS =====
    search: (color = '#9ca3af') => e('svg', {
        width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('circle', { key: '1', cx: '11', cy: '11', r: '8' }),
        e('path', { key: '2', d: 'm21 21-4.35-4.35' })
    ]),

    filter: (color = '#3b82f6') => e('svg', {
        width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [e('polygon', { key: '1', points: '22,3 2,3 10,12.46 10,19 14,21 14,12.46' })]),

    sortAsc: (color = 'currentColor') => e('svg', {
        width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('path', { key: '1', d: 'm3 8 4-4 4 4' }),
        e('path', { key: '2', d: 'M7 4v16' }),
        e('path', { key: '3', d: 'm21 16-4 4-4-4' }),
        e('path', { key: '4', d: 'M17 20V4' })
    ]),

    sortDesc: (color = 'currentColor') => e('svg', {
        width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('path', { key: '1', d: 'm3 16 4 4 4-4' }),
        e('path', { key: '2', d: 'M7 20V4' }),
        e('path', { key: '3', d: 'm21 8-4-4-4 4' }),
        e('path', { key: '4', d: 'M17 4v16' })
    ]),

    // ===== ICONOS DE ESTADO =====
    checkCircle: (color = '#10b981') => e('svg', {
        width: '12', height: '12', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('path', { key: '1', d: 'M22 11.08V12a10 10 0 1 1-5.93-9.14' }),
        e('polyline', { key: '2', points: '22 4 12 14.01 9 11.01' })
    ]),

    alertCircle: (color = '#dc2626') => e('svg', {
        width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('circle', { key: '1', cx: '12', cy: '12', r: '10' }),
        e('line', { key: '2', x1: '12', y1: '8', x2: '12', y2: '12' }),
        e('line', { key: '3', x1: '12', y1: '16', x2: '12.01', y2: '16' })
    ]),

    alertTriangle: (color = '#f59e0b') => e('svg', {
        width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('path', { key: '1', d: 'm21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z' }),
        e('path', { key: '2', d: 'M12 9v4' }),
        e('path', { key: '3', d: 'M12 17h.01' })
    ]),

    info: (color = '#3b82f6') => e('svg', {
        width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('circle', { key: '1', cx: '12', cy: '12', r: '10' }),
        e('path', { key: '2', d: 'M12 16v-4' }),
        e('path', { key: '3', d: 'M12 8h.01' })
    ]),

    xCircle: (color = '#ef4444') => e('svg', {
        width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('circle', { key: '1', cx: '12', cy: '12', r: '10' }),
        e('path', { key: '2', d: 'M15 9L9 15' }),
        e('path', { key: '3', d: 'M9 9l6 6' })
    ]),

    // ===== ICONOS DE USUARIOS Y PERMISOS =====
    user: (color = '#6b7280') => e('svg', {
        width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('path', { key: '1', d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' }),
        e('circle', { key: '2', cx: '12', cy: '7', r: '4' })
    ]),

    users: (color = '#6b7280') => e('svg', {
        width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('path', { key: '1', d: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' }),
        e('circle', { key: '2', cx: '9', cy: '7', r: '4' }),
        e('path', { key: '3', d: 'M23 21v-2a4 4 0 0 0-3-3.87' }),
        e('path', { key: '4', d: 'M16 3.13a4 4 0 0 1 0 7.75' })
    ]),

    userGroup: (color = '#ef4444') => e('svg', {
        width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('path', { key: '1', d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' }),
        e('circle', { key: '2', cx: '9', cy: '7', r: '4' }),
        e('path', { key: '3', d: 'M22 21v-2a4 4 0 0 0-3-3.87' }),
        e('path', { key: '4', d: 'M16 3.13a4 4 0 0 1 0 7.75' })
    ]),

    userCheck: (color = '#14b8a6') => e('svg', {
        width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('path', { key: '1', d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' }),
        e('circle', { key: '2', cx: '9', cy: '7', r: '4' }),
        e('polyline', { key: '3', points: '16 11 18 13 22 9' })
    ]),

    userX: (color = '#ec4899') => e('svg', {
        width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('path', { key: '1', d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' }),
        e('circle', { key: '2', cx: '9', cy: '7', r: '4' }),
        e('line', { key: '3', x1: '17', y1: '8', x2: '22', y2: '13' }),
        e('line', { key: '4', x1: '22', y1: '8', x2: '17', y2: '13' })
    ]),

    userSystem: (color = '#3b82f6') => e('svg', {
        width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('path', { key: '1', d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' }),
        e('circle', { key: '2', cx: '12', cy: '7', r: '4' }),
        e('path', { key: '3', d: 'M16 3v3' }),
        e('path', { key: '4', d: 'M20 5h-3' })
    ]),

    shield: (color = '#ef4444') => e('svg', {
        width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [e('path', { key: '1', d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' })]),

    key: (color = '#f59e0b') => e('svg', {
        width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [e('path', { key: '1', d: 'M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4' })]),

    hierarchy: (color = '#f59e0b') => e('svg', {
        width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('rect', { key: '1', x: '3', y: '3', width: '6', height: '6' }),
        e('rect', { key: '2', x: '15', y: '3', width: '6', height: '6' }),
        e('rect', { key: '3', x: '9', y: '15', width: '6', height: '6' }),
        e('path', { key: '4', d: 'M6 9v3a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V9' }),
        e('line', { key: '5', x1: '12', y1: '15', x2: '12', y2: '12' })
    ]),

    // ===== ICONOS DE VEHICULOS Y TRANSPORTE =====
    truck: (color = '#6b7280') => e('svg', {
        width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('rect', { key: '1', x: '1', y: '3', width: '15', height: '13' }),
        e('polygon', { key: '2', points: '16 8 20 8 23 11 23 16 16 16 16 8' }),
        e('circle', { key: '3', cx: '5.5', cy: '18.5', r: '2.5' }),
        e('circle', { key: '4', cx: '18.5', cy: '18.5', r: '2.5' })
    ]),

    busLogo: (color = '#3b82f6') => e('svg', {
        width: '32', height: '32', viewBox: '0 0 24 24', fill: color, stroke: 'none'
    }, [
        e('path', { key: '1', d: 'M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v11h-1a3 3 0 0 0-6 0h-2a3 3 0 0 0-6 0H4V6z', fill: color }),
        e('circle', { key: '2', cx: '7.5', cy: '17.5', r: '2.5', fill: '#1e293b' }),
        e('circle', { key: '3', cx: '16.5', cy: '17.5', r: '2.5', fill: '#1e293b' }),
        e('rect', { key: '4', x: '6', y: '7', width: '4', height: '4', rx: '0.5', fill: 'white' }),
        e('rect', { key: '5', x: '14', y: '7', width: '4', height: '4', rx: '0.5', fill: 'white' })
    ]),

    fuel: (color = '#f97316') => e('svg', {
        width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('line', { key: '1', x1: '3', y1: '22', x2: '15', y2: '22' }),
        e('line', { key: '2', x1: '4', y1: '9', x2: '14', y2: '9' }),
        e('path', { key: '3', d: 'M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18' }),
        e('path', { key: '4', d: 'M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2' }),
        e('circle', { key: '5', cx: '17', cy: '5', r: '1' })
    ]),

    wrench: (color = '#6b7280') => e('svg', {
        width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('path', { key: '1', d: 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z' })
    ]),

    // ===== ICONOS DE RUTAS Y UBICACION =====
    map: (color = '#6b7280') => e('svg', {
        width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('polygon', { key: '1', points: '1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6' }),
        e('line', { key: '2', x1: '8', y1: '2', x2: '8', y2: '18' }),
        e('line', { key: '3', x1: '16', y1: '6', x2: '16', y2: '22' })
    ]),

    mapPin: (color = '#3b82f6') => e('svg', {
        width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('path', { key: '1', d: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z' }),
        e('circle', { key: '2', cx: '12', cy: '10', r: '3' })
    ]),

    route: (color = '#8b5cf6') => e('svg', {
        width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('circle', { key: '1', cx: '6', cy: '19', r: '3' }),
        e('path', { key: '2', d: 'M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15' }),
        e('circle', { key: '3', cx: '18', cy: '5', r: '3' })
    ]),

    home: (color = '#6b7280') => e('svg', {
        width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('path', { key: '1', d: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' }),
        e('polyline', { key: '2', points: '9,22 9,12 15,12 15,22' })
    ]),

    globe: (color = '#06b6d4') => e('svg', {
        width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('circle', { key: '1', cx: '12', cy: '12', r: '10' }),
        e('line', { key: '2', x1: '2', y1: '12', x2: '22', y2: '12' }),
        e('path', { key: '3', d: 'M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z' })
    ]),

    // ===== ICONOS DE TIEMPO Y FECHAS =====
    calendar: (color = '#6b7280') => e('svg', {
        width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('rect', { key: '1', x: '3', y: '4', width: '18', height: '18', rx: '2' }),
        e('line', { key: '2', x1: '16', y1: '2', x2: '16', y2: '6' }),
        e('line', { key: '3', x1: '8', y1: '2', x2: '8', y2: '6' }),
        e('line', { key: '4', x1: '3', y1: '10', x2: '21', y2: '10' })
    ]),

    calendarDays: (color = '#3b82f6') => e('svg', {
        width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('rect', { key: '1', x: '3', y: '4', width: '18', height: '18', rx: '2' }),
        e('line', { key: '2', x1: '16', y1: '2', x2: '16', y2: '6' }),
        e('line', { key: '3', x1: '8', y1: '2', x2: '8', y2: '6' }),
        e('line', { key: '4', x1: '3', y1: '10', x2: '21', y2: '10' }),
        e('path', { key: '5', d: 'M8 14h.01' }),
        e('path', { key: '6', d: 'M12 14h.01' }),
        e('path', { key: '7', d: 'M16 14h.01' }),
        e('path', { key: '8', d: 'M8 18h.01' }),
        e('path', { key: '9', d: 'M12 18h.01' })
    ]),

    clock: (color = '#10b981') => e('svg', {
        width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('circle', { key: '1', cx: '12', cy: '12', r: '10' }),
        e('polyline', { key: '2', points: '12 6 12 12 16 14' })
    ]),

    // ===== ICONOS COMERCIALES Y FINANCIEROS =====
    dollar: (color = '#6b7280') => e('svg', {
        width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('line', { key: '1', x1: '12', y1: '1', x2: '12', y2: '23' }),
        e('path', { key: '2', d: 'M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' })
    ]),

    dollarSign: (color = '#3b82f6') => e('svg', {
        width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('line', { key: '1', x1: '12', y1: '1', x2: '12', y2: '23' }),
        e('path', { key: '2', d: 'M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' })
    ]),

    currency: (color = '#10b981') => e('svg', {
        width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2.5', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('circle', { key: '1', cx: '12', cy: '12', r: '10' }),
        e('path', { key: '2', d: 'M9.5 8.5a3 3 0 0 1 5 0v7a3 3 0 0 1-5 0' }),
        e('line', { key: '3', x1: '12', y1: '3', x2: '12', y2: '6' }),
        e('line', { key: '4', x1: '12', y1: '18', x2: '12', y2: '21' })
    ]),

    creditCard: (color = '#6b7280') => e('svg', {
        width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('rect', { key: '1', x: '1', y: '4', width: '22', height: '16', rx: '2' }),
        e('line', { key: '2', x1: '1', y1: '10', x2: '23', y2: '10' })
    ]),

    receipt: (color = '#f59e0b') => e('svg', {
        width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('path', { key: '1', d: 'M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z' }),
        e('path', { key: '2', d: 'M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8' }),
        e('path', { key: '3', d: 'M12 18V6' })
    ]),

    percentage: (color = '#8b5cf6') => e('svg', {
        width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('line', { key: '1', x1: '19', y1: '5', x2: '5', y2: '19' }),
        e('circle', { key: '2', cx: '6.5', cy: '6.5', r: '2.5' }),
        e('circle', { key: '3', cx: '17.5', cy: '17.5', r: '2.5' })
    ]),

    calculator: (color = '#6b7280') => e('svg', {
        width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('rect', { key: '1', x: '4', y: '2', width: '16', height: '20', rx: '2', ry: '2' }),
        e('line', { key: '2', x1: '8', y1: '6', x2: '16', y2: '6' }),
        e('line', { key: '3', x1: '8', y1: '10', x2: '16', y2: '10' }),
        e('line', { key: '4', x1: '8', y1: '14', x2: '16', y2: '14' }),
        e('line', { key: '5', x1: '8', y1: '18', x2: '12', y2: '18' })
    ]),

    target: (color = '#374151') => e('svg', {
        width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('circle', { key: '1', cx: '12', cy: '12', r: '10' }),
        e('circle', { key: '2', cx: '12', cy: '12', r: '6' }),
        e('circle', { key: '3', cx: '12', cy: '12', r: '2' })
    ]),

    shoppingBag: (color = '#6b7280') => e('svg', {
        width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('path', { key: '1', d: 'M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z' }),
        e('line', { key: '2', x1: '3', y1: '6', x2: '21', y2: '6' }),
        e('path', { key: '3', d: 'M16 10a4 4 0 0 1-8 0' })
    ]),

    // ===== ICONOS DE DATOS Y REPORTES =====
    database: (color = '#6b7280') => e('svg', {
        width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('ellipse', { key: '1', cx: '12', cy: '5', rx: '9', ry: '3' }),
        e('path', { key: '2', d: 'M21 12c0 1.66-4 3-9 3s-9-1.34-9-3' }),
        e('path', { key: '3', d: 'M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5' })
    ]),

    chartBar: (color = '#10b981') => e('svg', {
        width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('line', { key: '1', x1: '12', y1: '20', x2: '12', y2: '10' }),
        e('line', { key: '2', x1: '18', y1: '20', x2: '18', y2: '4' }),
        e('line', { key: '3', x1: '6', y1: '20', x2: '6', y2: '16' })
    ]),

    chartLine: (color = '#f59e0b') => e('svg', {
        width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('polyline', { key: '1', points: '22 12 18 12 15 21 9 21 6 12 2 12' }),
        e('polyline', { key: '2', points: '1 6 7 12 13 8 22 14' })
    ]),

    trendingUp: (color = '#059669') => e('svg', {
        width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('polyline', { key: '1', points: '22 7 13.5 15.5 8.5 10.5 2 17' }),
        e('polyline', { key: '2', points: '16 7 22 7 22 13' })
    ]),

    analyticsIcon: (color = '#8b5cf6') => e('svg', {
        width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('path', { key: '1', d: 'M21 21V9' }),
        e('path', { key: '2', d: 'M15 21v-6' }),
        e('path', { key: '3', d: 'M9 21v-10' }),
        e('path', { key: '4', d: 'M3 21v-14' })
    ]),

    statsIcon: (color = '#10b981') => e('svg', {
        width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('path', { key: '1', d: 'M3 3v18h18' }),
        e('path', { key: '2', d: 'M18.7 8l-5.1 5.2-2.8-2.7L7 14.3' })
    ]),

    // ===== ICONOS DE EDIFICIOS Y EMPRESAS =====
    building: (color = '#6b7280') => e('svg', {
        width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('line', { key: '1', x1: '3', y1: '21', x2: '21', y2: '21' }),
        e('line', { key: '2', x1: '9', y1: '8', x2: '10', y2: '8' }),
        e('line', { key: '3', x1: '9', y1: '12', x2: '10', y2: '12' }),
        e('line', { key: '4', x1: '9', y1: '16', x2: '10', y2: '16' }),
        e('line', { key: '5', x1: '14', y1: '8', x2: '15', y2: '8' }),
        e('line', { key: '6', x1: '14', y1: '12', x2: '15', y2: '12' }),
        e('line', { key: '7', x1: '14', y1: '16', x2: '15', y2: '16' }),
        e('path', { key: '8', d: 'M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16' })
    ]),

    // ===== ICONOS DE SERVICIOS Y PRODUCTOS =====
    package: (color = '#16a34a') => e('svg', {
        width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('line', { key: '1', x1: '16.5', y1: '9.4', x2: '7.5', y2: '4.21' }),
        e('path', { key: '2', d: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z' }),
        e('polyline', { key: '3', points: '3.27,6.96 12,12.01 20.73,6.96' }),
        e('line', { key: '4', x1: '12', y1: '22.08', x2: '12', y2: '12' })
    ]),

    card: (color = '#84cc16') => e('svg', {
        width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('rect', { key: '1', x: '1', y: '4', width: '22', height: '16', rx: '2', ry: '2' }),
        e('line', { key: '2', x1: '1', y1: '10', x2: '23', y2: '10' })
    ]),

    // ===== ICONOS DE DOCUMENTOS Y ARCHIVOS =====
    fileText: (color = '#374151') => e('svg', {
        width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('path', { key: '1', d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }),
        e('polyline', { key: '2', points: '14 2 14 8 20 8' }),
        e('line', { key: '3', x1: '16', y1: '13', x2: '8', y2: '13' }),
        e('line', { key: '4', x1: '16', y1: '17', x2: '8', y2: '17' }),
        e('polyline', { key: '5', points: '10 9 9 9 8 9' })
    ]),

    document: (color = '#6b7280') => e('svg', {
        width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('path', { key: '1', d: 'M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z' }),
        e('path', { key: '2', d: 'M14 2v6h6' }),
        e('path', { key: '3', d: 'M10 9H8' }),
        e('path', { key: '4', d: 'M16 13H8' }),
        e('path', { key: '5', d: 'M16 17H8' })
    ]),

    folder: (color = '#3b82f6') => e('svg', {
        width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('path', { key: '1', d: 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z' })
    ]),

    note: (color = '#6b7280') => e('svg', {
        width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('path', { key: '1', d: 'M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z' }),
        e('polyline', { key: '2', points: '14,2 14,8 20,8' }),
        e('line', { key: '3', x1: '16', y1: '13', x2: '8', y2: '13' }),
        e('line', { key: '4', x1: '16', y1: '17', x2: '8', y2: '17' }),
        e('line', { key: '5', x1: '10', y1: '9', x2: '8', y2: '9' })
    ]),

    archive: (color = '#dc2626') => e('svg', {
        width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('polyline', { key: '1', points: '21,8 21,21 3,21 3,8' }),
        e('rect', { key: '2', x: '1', y: '3', width: '22', height: '5' }),
        e('line', { key: '3', x1: '10', y1: '12', x2: '14', y2: '12' })
    ]),

    // ===== ICONOS DE INTERFAZ Y TOPBAR =====
    bell: (color = '#6b7280') => e('svg', {
        width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('path', { key: '1', d: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9' }),
        e('path', { key: '2', d: 'M13.73 21a2 2 0 0 1-3.46 0' })
    ]),

    notification: (color = '#6b7280') => e('svg', {
        width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('path', { key: '1', d: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9' }),
        e('path', { key: '2', d: 'M13.73 21a2 2 0 0 1-3.46 0' }),
        e('circle', { key: 'dot', cx: '17', cy: '7', r: '3', fill: '#ef4444', stroke: 'none' })
    ]),

    settings: (color = '#6b7280') => e('svg', {
        width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('circle', { key: '1', cx: '12', cy: '12', r: '3' }),
        e('path', { key: '2', d: 'M12 1v6m0 6v6m4.22-13.22l4.24 4.24M1.54 1.54l4.24 4.24M20.46 20.46l-4.24-4.24M1.54 20.46l4.24-4.24' })
    ]),

    logout: (color = '#6b7280') => e('svg', {
        width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('path', { key: '1', d: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' }),
        e('polyline', { key: '2', points: '16 17 21 12 16 7' }),
        e('line', { key: '3', x1: '21', y1: '12', x2: '9', y2: '12' })
    ]),

    help: (color = '#6b7280') => e('svg', {
        width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('circle', { key: '1', cx: '12', cy: '12', r: '10' }),
        e('path', { key: '2', d: 'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3' }),
        e('line', { key: '3', x1: '12', y1: '17', x2: '12.01', y2: '17' })
    ]),

    inbox: (color = '#9ca3af') => e('svg', {
        width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('polyline', { key: '1', points: '22 12 18 12 15 21 9 21 6 12 2 12' }),
        e('path', { key: '2', d: 'M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z' })
    ]),

    monitor: (color = '#06b6d4') => e('svg', {
        width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('rect', { key: '1', x: '2', y: '3', width: '20', height: '14', rx: '2', ry: '2' }),
        e('line', { key: '2', x1: '8', y1: '21', x2: '16', y2: '21' }),
        e('line', { key: '3', x1: '12', y1: '17', x2: '12', y2: '21' })
    ]),

    gear: (color = '#64748b') => e('svg', {
        width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('circle', { key: '1', cx: '12', cy: '12', r: '3' }),
        e('path', { key: '2', d: 'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z' })
    ]),

    // ===== ICONOS DE COMUNICACION Y WHATSAPP =====
    message: (color = '#ffffff') => e('svg', {
        width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('path', { key: '1', d: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z' })
    ]),

    messageCircle: (color = '#25d366') => e('svg', {
        width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('path', { key: '1', d: 'm3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z' })
    ]),

    whatsapp: (color = '#25d366') => e('svg', {
        width: '18', height: '18', viewBox: '0 0 24 24', fill: color, stroke: 'none'
    }, [
        e('path', {
            key: '1',
            d: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.507'
        })
    ]),

    phone: (color = '#3b82f6') => e('svg', {
        width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('path', { key: '1', d: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z' })
    ]),

    // ===== ICONOS DE IDENTIFICACION Y CODIGOS =====
    hash: (color = '#6b7280') => e('svg', {
        width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('line', { key: '1', x1: '4', y1: '9', x2: '20', y2: '9' }),
        e('line', { key: '2', x1: '4', y1: '15', x2: '20', y2: '15' }),
        e('line', { key: '3', x1: '10', y1: '3', x2: '8', y2: '21' }),
        e('line', { key: '4', x1: '16', y1: '3', x2: '14', y2: '21' })
    ]),

    tag: (color = '#a855f7') => e('svg', {
        width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('path', { key: '1', d: 'M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z' }),
        e('line', { key: '2', x1: '7', y1: '7', x2: '7.01', y2: '7' })
    ]),

    status: (color = '#6b7280') => e('svg', {
        width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('circle', { key: '1', cx: '12', cy: '12', r: '10' }),
        e('line', { key: '2', x1: '12', y1: '6', x2: '12', y2: '10' }),
        e('line', { key: '3', x1: '12', y1: '16', x2: '12.01', y2: '16' })
    ]),

    // ===== ICONOS DE INTERACTIVIDAD =====
    checkbox: (color = '#10b981') => e('svg', {
        width: '18', height: '18', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('rect', {
            key: '1',
            x: '3', y: '3', width: '18', height: '18', rx: '3',
            fill: 'none', stroke: color
        })
    ]),

    checkboxChecked: (color = '#10b981') => e('svg', {
        width: '18', height: '18', viewBox: '0 0 24 24', fill: 'none', stroke: 'none'
    }, [
        e('rect', {
            key: '1',
            x: '3', y: '3', width: '18', height: '18', rx: '3',
            fill: color, stroke: color, strokeWidth: '2'
        }),
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

    list: (color = '#374151') => e('svg', {
        width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('line', { key: '1', x1: '8', y1: '6', x2: '21', y2: '6' }),
        e('line', { key: '2', x1: '8', y1: '12', x2: '21', y2: '12' }),
        e('line', { key: '3', x1: '8', y1: '18', x2: '21', y2: '18' }),
        e('line', { key: '4', x1: '3', y1: '6', x2: '3.01', y2: '6' }),
        e('line', { key: '5', x1: '3', y1: '12', x2: '3.01', y2: '12' }),
        e('line', { key: '6', x1: '3', y1: '18', x2: '3.01', y2: '18' })
    ]),

    grid: (color = '#374151') => e('svg', {
        width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('rect', { key: '1', x: '3', y: '3', width: '7', height: '7' }),
        e('rect', { key: '2', x: '14', y: '3', width: '7', height: '7' }),
        e('rect', { key: '3', x: '14', y: '14', width: '7', height: '7' }),
        e('rect', { key: '4', x: '3', y: '14', width: '7', height: '7' })
    ]),

    // ===== ICONOS ESPECIALES ADICIONALES =====
    alertTriangleFilled: (color = '#ef4444') => e('svg', {
        width: '24', height: '24', viewBox: '0 0 24 24', fill: color,
        stroke: 'white', strokeWidth: '1', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('path', { key: '1', d: 'm21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z' }),
        e('path', { key: '2', d: 'M12 9v4', stroke: 'white', strokeWidth: '2' }),
        e('path', { key: '3', d: 'M12 17h.01', stroke: 'white', strokeWidth: '2' })
    ]),

    // Si no tienes estos otros iconos también necesarios, agregarlos:
    arrowRight: (color = '#f59e0b') => e('svg', {
        width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('line', { key: '1', x1: '5', y1: '12', x2: '19', y2: '12' }),
        e('polyline', { key: '2', points: '12 5 19 12 12 19' })
    ]),

    transition: (color = '#f59e0b') => e('svg', {
        width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('polyline', { key: '1', points: '9 11 12 14 22 4' }),
        e('path', { key: '2', d: 'M21 3H9' }),
        e('path', { key: '3', d: 'M3 12v9a2 2 0 0 0 2 2h16' })
    ]),

    // ===== ICONOS ADICIONALES PARA EL SISTEMA UNIVERSAL =====

    // Iconos de navegación faltantes
    chevronLeft: (color = '#6b7280') => e('svg', {
        width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [e('polyline', { key: '1', points: '15 18 9 12 15 6' })]),

    // Iconos de formulario
    save: (color = '#ffffff') => e('svg', {
        width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('path', { key: '1', d: 'M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z' }),
        e('polyline', { key: '2', points: '17 21 17 13 7 13 7 21' }),
        e('polyline', { key: '3', points: '7 3 7 8 15 8' })
    ]),

    // Iconos de validación y estado
    loading: (color = '#3b82f6') => e('svg', {
        width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('line', { key: '1', x1: '12', y1: '2', x2: '12', y2: '6' }),
        e('line', { key: '2', x1: '12', y1: '18', x2: '12', y2: '22' }),
        e('line', { key: '3', x1: '4.93', y1: '4.93', x2: '7.76', y2: '7.76' }),
        e('line', { key: '4', x1: '16.24', y1: '16.24', x2: '19.07', y2: '19.07' }),
        e('line', { key: '5', x1: '2', y1: '12', x2: '6', y2: '12' }),
        e('line', { key: '6', x1: '18', y1: '12', x2: '22', y2: '12' }),
        e('line', { key: '7', x1: '4.93', y1: '19.07', x2: '7.76', y2: '16.24' }),
        e('line', { key: '8', x1: '16.24', y1: '7.76', x2: '19.07', y2: '4.93' })
    ]),

    // Iconos de expansión y colapso
    expand: (color = '#6b7280') => e('svg', {
        width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('polyline', { key: '1', points: '15 3 21 3 21 9' }),
        e('polyline', { key: '2', points: '9 21 3 21 3 15' }),
        e('line', { key: '3', x1: '21', y1: '3', x2: '14', y2: '10' }),
        e('line', { key: '4', x1: '3', y1: '21', x2: '10', y2: '14' })
    ]),

    collapse: (color = '#6b7280') => e('svg', {
        width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('polyline', { key: '1', points: '4 14 10 14 10 20' }),
        e('polyline', { key: '2', points: '20 10 14 10 14 4' }),
        e('line', { key: '3', x1: '14', y1: '10', x2: '21', y2: '3' }),
        e('line', { key: '4', x1: '3', y1: '21', x2: '10', y2: '14' })
    ]),

    // Iconos de multimedia
    image: (color = '#6b7280') => e('svg', {
        width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('rect', { key: '1', x: '3', y: '3', width: '18', height: '18', rx: '2', ry: '2' }),
        e('circle', { key: '2', cx: '8.5', cy: '8.5', r: '1.5' }),
        e('polyline', { key: '3', points: '21,15 16,10 5,21' })
    ]),

    // Iconos de conexión y red
    wifi: (color = '#10b981') => e('svg', {
        width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('path', { key: '1', d: 'm1 9 4-4 4 4' }),
        e('path', { key: '2', d: 'm1 9 4-4 4 4' }),
        e('path', { key: '3', d: 'm1 9 4-4 4 4' })
    ]),

    // Iconos de seguridad
    lock: (color = '#dc2626') => e('svg', {
        width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('rect', { key: '1', x: '3', y: '11', width: '18', height: '11', rx: '2', ry: '2' }),
        e('path', { key: '2', d: 'M7 11V7a5 5 0 0 1 10 0v4' })
    ]),

    unlock: (color = '#10b981') => e('svg', {
        width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('rect', { key: '1', x: '3', y: '11', width: '18', height: '11', rx: '2', ry: '2' }),
        e('path', { key: '2', d: 'M7 11V7a5 5 0 0 1 9.9-1' })
    ]),

    // Iconos de navegación temporal
    today: (color = '#3b82f6') => e('svg', {
        width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('rect', { key: '1', x: '3', y: '4', width: '18', height: '18', rx: '2' }),
        e('line', { key: '2', x1: '16', y1: '2', x2: '16', y2: '6' }),
        e('line', { key: '3', x1: '8', y1: '2', x2: '8', y2: '6' }),
        e('line', { key: '4', x1: '3', y1: '10', x2: '21', y2: '10' }),
        e('circle', { key: '5', cx: '12', cy: '15', r: '2', fill: color })
    ]),

    // Iconos de medición y métricas
    ruler: (color = '#f59e0b') => e('svg', {
        width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('path', { key: '1', d: 'M21.3 8.7 8.7 21.3c-.4.4-1 .4-1.4 0L2.7 16.7c-.4-.4-.4-1 0-1.4L15.3 2.7c.4-.4 1-.4 1.4 0l4.6 4.6c.4.4.4 1 0 1.4Z' }),
        e('path', { key: '2', d: 'M7 10h2v2' }),
        e('path', { key: '3', d: 'M10.5 7.5h2v2' }),
        e('path', { key: '4', d: 'M14 5h2v2' })
    ]),

    // Iconos de control de volumen/cantidad
    plus2: (color = '#10b981') => e('svg', {
        width: '14', height: '14', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '3', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('circle', { key: '1', cx: '12', cy: '12', r: '10' }),
        e('line', { key: '2', x1: '12', y1: '8', x2: '12', y2: '16' }),
        e('line', { key: '3', x1: '8', y1: '12', x2: '16', y2: '12' })
    ]),

    minus: (color = '#dc2626') => e('svg', {
        width: '14', height: '14', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '3', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('circle', { key: '1', cx: '12', cy: '12', r: '10' }),
        e('line', { key: '2', x1: '8', y1: '12', x2: '16', y2: '12' })
    ]),

    layers: (color = '#6b7280') => e('svg', {
        width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('polygon', { key: '1', points: '12,2 2,7 12,12 22,7' }),
        e('polyline', { key: '2', points: '2,17 12,22 22,17' }),
        e('polyline', { key: '3', points: '2,12 12,17 22,12' })
    ]),

    execute: (color = '#16a34a') => e('svg', {
        width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('polygon', { key: '1', points: '5,3 19,12 5,21' }),
        e('line', { key: '2', x1: '22', y1: '12', x2: '19', y2: '12' })
    ]),

    // ICONOS PARA VENTAS
    refreshCw: (color = '#666666') => e('svg', {
        width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('polyline', { key: '1', points: '23,4 23,10 17,10' }),
        e('polyline', { key: '2', points: '1,20 1,14 7,14' }),
        e('path', { key: '3', d: 'm3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15' })
    ]),

    trendingUp: (color = '#666666') => e('svg', {
        width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('polyline', { key: '1', points: '22,7 13.5,15.5 8.5,10.5 2,17' }),
        e('polyline', { key: '2', points: '16,7 22,7 22,13' })
    ]),

    calendar: (color = '#666666') => e('svg', {
        width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('rect', { key: '1', x: '3', y: '4', width: '18', height: '18', rx: '2', ry: '2' }),
        e('line', { key: '2', x1: '16', y1: '2', x2: '16', y2: '6' }),
        e('line', { key: '3', x1: '8', y1: '2', x2: '8', y2: '6' }),
        e('line', { key: '4', x1: '3', y1: '10', x2: '21', y2: '10' })
    ]),

    clock: (color = '#666666') => e('svg', {
        width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('circle', { key: '1', cx: '12', cy: '12', r: '10' }),
        e('polyline', { key: '2', points: '12,6 12,12 16,14' })
    ]),

    // Iconos que necesitas agregar a Icons.js:

    barChart: (color = '#000000') => React.createElement('svg', {
        width: 20,
        height: 20,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: 2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    }, [
        React.createElement('rect', { key: '1', x: 3, y: 3, width: 18, height: 18, rx: 2, ry: 2 }),
        React.createElement('rect', { key: '2', x: 7, y: 8, width: 4, height: 9 }),
        React.createElement('rect', { key: '3', x: 13, y: 5, width: 4, height: 12 })
    ]),

    download: (color = '#000000') => React.createElement('svg', {
        width: 20,
        height: 20,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: 2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    }, [
        React.createElement('path', { key: '1', d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }),
        React.createElement('polyline', { key: '2', points: '7,10 12,15 17,10' }),
        React.createElement('line', { key: '3', x1: 12, y1: 15, x2: 12, y2: 3 })
    ]),

    loader: (color = '#000000') => React.createElement('svg', {
        width: 20,
        height: 20,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: 2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        style: { animation: 'spin 1s linear infinite' }
    }, [
        React.createElement('line', { key: '1', x1: 12, y1: 2, x2: 12, y2: 6 }),
        React.createElement('line', { key: '2', x1: 12, y1: 18, x2: 12, y2: 22 }),
        React.createElement('line', { key: '3', x1: 4.93, y1: 4.93, x2: 7.76, y2: 7.76 }),
        React.createElement('line', { key: '4', x1: 16.24, y1: 16.24, x2: 19.07, y2: 19.07 }),
        React.createElement('line', { key: '5', x1: 2, y1: 12, x2: 6, y2: 12 }),
        React.createElement('line', { key: '6', x1: 18, y1: 12, x2: 22, y2: 12 }),
        React.createElement('line', { key: '7', x1: 4.93, y1: 19.07, x2: 7.76, y2: 16.24 }),
        React.createElement('line', { key: '8', x1: 16.24, y1: 7.76, x2: 19.07, y2: 4.93 })
    ]),

    imageOff: (color = '#000000') => React.createElement('svg', {
        width: 20,
        height: 20,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: 2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    }, [
        React.createElement('rect', { key: '1', x: 3, y: 3, width: 18, height: 18, rx: 2, ry: 2 }),
        React.createElement('circle', { key: '2', cx: 8.5, cy: 8.5, r: 1.5 }),
        React.createElement('polyline', { key: '3', points: '21,15 16,10 5,21' }),
        React.createElement('line', { key: '4', x1: 1, y1: 1, x2: 23, y2: 23 })
    ]),

    // Agregar estos iconos a tu archivo Icons.js

    download: (color = '#000000') => React.createElement('svg', {
        width: 20,
        height: 20,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: 2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    }, [
        React.createElement('path', { key: '1', d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }),
        React.createElement('polyline', { key: '2', points: '7,10 12,15 17,10' }),
        React.createElement('line', { key: '3', x1: 12, y1: 15, x2: 12, y2: 3 })
    ]),

    alertTriangle: (color = '#000000') => React.createElement('svg', {
        width: 20,
        height: 20,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: 2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    }, [
        React.createElement('path', { key: '1', d: 'm21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z' }),
        React.createElement('path', { key: '2', d: 'M12 9v4' }),
        React.createElement('path', { key: '3', d: 'M12 17h.01' })
    ]),

    layers: (color = '#000000') => React.createElement('svg', {
        width: 20,
        height: 20,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: 2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
    }, [
        React.createElement('polygon', { key: '1', points: '12,2 2,7 12,12 22,7 12,2' }),
        React.createElement('polyline', { key: '2', points: '2,17 12,22 22,17' }),
        React.createElement('polyline', { key: '3', points: '2,12 12,17 22,12' })
    ]),

    // Agregar estos iconos faltantes a Icons.js:

    percent: (color = '#8b5cf6') => e('svg', {
        width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none',
        stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'
    }, [
        e('line', { key: '1', x1: '19', y1: '5', x2: '5', y2: '19' }),
        e('circle', { key: '2', cx: '6.5', cy: '6.5', r: '2.5' }),
        e('circle', { key: '3', cx: '17.5', cy: '17.5', r: '2.5' })
    ]),

    // Iconos adicionales para autenticación
    lock: () => e('svg', { width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }, [
        e('rect', { key: '1', x: '3', y: '11', width: '18', height: '11', rx: '2', ry: '2' }),
        e('path', { key: '2', d: 'M7 11V7a5 5 0 0 1 10 0v4' })
    ]),

    alertTriangle: () => e('svg', { width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }, [
        e('path', { key: '1', d: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z' }),
        e('line', { key: '2', x1: '12', y1: '9', x2: '12', y2: '13' }),
        e('line', { key: '3', x1: '12', y1: '17', x2: '12.01', y2: '17' })
    ])

};

export default Icons;
