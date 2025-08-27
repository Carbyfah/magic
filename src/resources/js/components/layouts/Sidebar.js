// src/resources/js/components/layouts/Sidebar.js
import React from 'react';
import Icons from '../../utils/Icons'; // Importar iconos
const { createElement: e, useState } = React;

function Sidebar({ activeModule, onModuleChange, collapsed, onToggle }) {
    const [expandedSections, setExpandedSections] = useState({
        operacion: true,
        comercial: false,
        flota: false,
        reportes: false,
        configuracion: false
    });

    const toggleSection = (section) => {
        if (!collapsed) {
            setExpandedSections(prev => ({
                ...prev,
                [section]: !prev[section]
            }));
        }
    };

    const menuStructure = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            icon: Icons.dashboard(),
            type: 'single'
        },
        {
            id: 'operacion',
            label: 'OPERACIÓN DIARIA',
            icon: Icons.operacion(),
            type: 'section',
            children: [
                { id: 'reservaciones', label: 'Reservaciones', icon: Icons.calendar() },
                { id: 'rutas-dia', label: 'Rutas del Día', icon: Icons.map() },
                { id: 'control-flota', label: 'Control de Flota', icon: Icons.truck() }
            ]
        },
        {
            id: 'comercial',
            label: 'COMERCIAL',
            icon: Icons.comercial(),
            type: 'section',
            children: [
                { id: 'ventas', label: 'Ventas', icon: Icons.dollar() },
                { id: 'pagos', label: 'Pagos', icon: Icons.creditCard() },
                { id: 'agencias', label: 'Agencias', icon: Icons.building() },
                { id: 'clientes', label: 'Clientes', icon: Icons.user() }
            ]
        },
        {
            id: 'flota',
            label: 'FLOTA Y PERSONAL',
            icon: Icons.flota(),
            type: 'section',
            children: [
                { id: 'vehiculos', label: 'Vehículos', icon: Icons.truck() },
                { id: 'choferes', label: 'Choferes', icon: Icons.user() },
                { id: 'empleados', label: 'Empleados', icon: Icons.users() }
            ]
        },
        {
            id: 'reportes',
            label: 'REPORTES',
            icon: Icons.reportes(),
            type: 'section',
            children: [
                { id: 'reporte-ventas', label: 'Ventas', icon: Icons.dollar() },
                { id: 'reporte-operacion', label: 'Operación', icon: Icons.truck() },
                { id: 'reporte-financiero', label: 'Financiero', icon: Icons.creditCard() },
                { id: 'auditoria', label: 'Auditoría', icon: Icons.calendar() }
            ]
        },
        {
            id: 'configuracion',
            label: 'CONFIGURACIÓN',
            icon: Icons.configuracion(),
            type: 'section',
            children: [
                { id: 'rutas-servicios', label: 'Rutas y Servicios', icon: Icons.map() },
                { id: 'catalogos', label: 'Catálogos', icon: Icons.calendar() },
                { id: 'usuarios', label: 'Usuarios y Permisos', icon: Icons.users() }
            ]
        }
    ];

    return e('aside', {
        style: {
            position: 'fixed',
            left: 0,
            top: '64px',
            width: collapsed ? '80px' : '280px',
            height: 'calc(100vh - 64px)',
            backgroundColor: '#ffffff',
            borderRight: '1px solid #e2e8f0',
            overflowY: 'auto',
            overflowX: 'hidden',
            zIndex: 900,
            transition: 'width 0.3s ease'
        }
    }, [
        // Navigation Menu (SIN STATS)
        e('nav', {
            key: 'nav',
            style: {
                padding: collapsed ? '0.5rem 0' : '1rem 0'
            }
        }, menuStructure.map((item) => {
            if (item.type === 'single') {
                return e('div', {
                    key: item.id,
                    onClick: () => onModuleChange(item.id),
                    title: collapsed ? item.label : '',
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: collapsed ? '12px' : '12px 20px',
                        margin: '0 8px 4px 8px',
                        borderRadius: '8px',
                        backgroundColor: activeModule === item.id ? '#f0f4ff' : 'transparent',
                        color: activeModule === item.id ? '#4f46e5' : '#4b5563',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        justifyContent: collapsed ? 'center' : 'flex-start'
                    },
                    onMouseEnter: (e) => {
                        if (activeModule !== item.id) {
                            e.currentTarget.style.backgroundColor = '#f9fafb';
                        }
                    },
                    onMouseLeave: (e) => {
                        if (activeModule !== item.id) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                        }
                    }
                }, [
                    e('div', { key: 'icon', style: { display: 'flex', alignItems: 'center' } }, item.icon),
                    !collapsed && e('span', {
                        key: 'label',
                        style: { fontWeight: activeModule === item.id ? '600' : '500' }
                    }, item.label)
                ]);
            } else {
                // Section with children
                const isExpanded = expandedSections[item.id];
                return e('div', { key: item.id, style: { marginBottom: '4px' } }, [
                    // Section Header
                    e('div', {
                        key: 'header',
                        onClick: () => toggleSection(item.id),
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: collapsed ? 'center' : 'space-between',
                            padding: collapsed ? '12px' : '10px 20px',
                            margin: '0 8px',
                            borderRadius: '8px',
                            backgroundColor: collapsed ? 'transparent' : '#f9fafb',
                            color: '#6b7280',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            fontSize: collapsed ? '20px' : '11px',
                            fontWeight: '600',
                            letterSpacing: collapsed ? '0' : '0.05em',
                            textTransform: collapsed ? 'none' : 'uppercase'
                        }
                    }, [
                        e('div', {
                            key: 'left',
                            style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }
                        }, [
                            e('div', { key: 'icon', style: { display: 'flex', alignItems: 'center' } }, item.icon),
                            !collapsed && e('span', { key: 'label' }, item.label)
                        ]),
                        !collapsed && e('div', {
                            key: 'chevron',
                            style: {
                                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s'
                            }
                        }, Icons.chevronDown())
                    ]),
                    // Children Items
                    !collapsed && isExpanded && e('div', {
                        key: 'children',
                        style: {
                            marginLeft: '20px',
                            marginTop: '4px'
                        }
                    }, item.children.map(child =>
                        e('div', {
                            key: child.id,
                            onClick: () => onModuleChange(child.id),
                            style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '8px 20px',
                                marginBottom: '2px',
                                borderRadius: '6px',
                                backgroundColor: activeModule === child.id ? '#f0f4ff' : 'transparent',
                                color: activeModule === child.id ? '#4f46e5' : '#6b7280',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                fontSize: '14px'
                            },
                            onMouseEnter: (e) => {
                                if (activeModule !== child.id) {
                                    e.currentTarget.style.backgroundColor = '#f9fafb';
                                }
                            },
                            onMouseLeave: (e) => {
                                if (activeModule !== child.id) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }
                            }
                        }, [
                            e('div', { key: 'icon', style: { display: 'flex', alignItems: 'center', opacity: 0.7 } }, child.icon),
                            e('span', { key: 'label' }, child.label)
                        ])
                    ))
                ]);
            }
        })),

        // Toggle Button - INTEGRADO EN EL SIDEBAR (PARTE IZQUIERDA)
        e('div', {
            key: 'toggleBtn',
            style: {
                position: 'absolute',  // Parte del sidebar
                top: '50%',  // Centrado vertical
                left: '12px',  // SIEMPRE a la izquierda dentro del sidebar
                transform: 'translateY(-50%)',  // Centrado vertical
                zIndex: 100,  // Normal, no necesita estar tan alto
                transition: 'all 0.3s ease'
            }
        },
            e('button', {
                onClick: onToggle,
                title: collapsed ? 'Expandir menú' : 'Colapsar menú',
                style: {
                    width: '28px',
                    height: '28px',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: '1.5px solid #d1d5db',
                    borderRadius: '6px',  // Bordes ligeramente redondeados
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    outline: 'none',
                    padding: '0'
                },
                onMouseEnter: (e) => {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                    e.currentTarget.style.borderColor = '#9ca3af';
                },
                onMouseLeave: (e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                    e.currentTarget.style.borderColor = '#d1d5db';
                }
            }, Icons.toggleSidebar(collapsed ? 'right' : 'left'))  // USANDO EL ÍCONO MEJORADO
        )
    ]);
}

export default Sidebar;
