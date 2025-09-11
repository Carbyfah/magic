// src/resources/js/components/layouts/Sidebar.js
import React from 'react';
import Icons from '../../utils/Icons';
import AuthService from '../../services/auth';
const { createElement: e, useState } = React;

function Sidebar({ activeModule, onModuleChange, collapsed, onToggle }) {
    const [expandedSections, setExpandedSections] = useState({
        operacion: true,
        comercial: false,
        catalogos: false,
        personal: false,
        reportes: false
    });

    // Obtener módulos permitidos para el usuario actual
    const allowedModules = AuthService.getAllowedModules();
    const currentUser = AuthService.getUser();
    const permissions = AuthService.getPermissions();

    const toggleSection = (section) => {
        if (collapsed) {
            // Si está colapsado y se presiona una sección, expandir y abrir esa sección
            onToggle(); // Expandir sidebar
            setTimeout(() => {
                setExpandedSections(prev => ({
                    ...prev,
                    [section]: true
                }));
            }, 100); // Delay para que la animación se vea bien
        } else {
            // Comportamiento normal cuando está expandido
            setExpandedSections(prev => ({
                ...prev,
                [section]: !prev[section]
            }));
        }
    };

    const handleChildClick = (childId) => {
        if (collapsed) {
            // Si está colapsado, expandir primero y luego cambiar módulo
            onToggle();
            setTimeout(() => {
                onModuleChange(childId);
            }, 100);
        } else {
            onModuleChange(childId);
        }
    };

    // Función para verificar si un módulo está permitido
    const isModuleAllowed = (moduleId) => {
        return allowedModules.includes(moduleId);
    };

    // Estructura completa del menú (se filtrará según roles)
    const fullMenuStructure = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            icon: Icons.dashboard(),
            type: 'single'
        },
        {
            id: 'catalogos',
            label: 'CATÁLOGOS BASE',
            icon: Icons.database(),
            type: 'section',
            children: [
                { id: 'rutas-servicios', label: 'Rutas y Servicios', icon: Icons.map() },
                { id: 'estados-sistema', label: 'Estados del Sistema', icon: Icons.tag() },
                { id: 'tipos-persona', label: 'Tipos de Persona', icon: Icons.userGroup() },
                { id: 'agencias', label: 'Agencias', icon: Icons.building() },
            ]
        },
        {
            id: 'operacion',
            label: 'OPERACIÓN DIARIA',
            icon: Icons.operacion(),
            type: 'section',
            children: [
                { id: 'control-flota', label: 'Control de Flota', icon: Icons.truck() },
                { id: 'rutas-activas', label: 'Rutas Activas', icon: Icons.route() },
                { id: 'tours-activados', label: 'Tours Activados', icon: Icons.mapPin() },
                { id: 'reservaciones', label: 'Reservaciones', icon: Icons.calendar() }
            ]
        },
        {
            id: 'comercial',
            label: 'COMERCIAL',
            icon: Icons.comercial(),
            type: 'section',
            children: [
                { id: 'contactos-agencia', label: 'Contactos Agencias', icon: Icons.userGroup() },
                { id: 'dashboard-ventas', label: 'Dashboard Ventas', icon: Icons.chartBar() }
            ]
        },
        {
            id: 'personal',
            label: 'PERSONAL',
            icon: Icons.flota(),
            type: 'section',
            children: [
                { id: 'empleados', label: 'Empleados', icon: Icons.users() },
                { id: 'roles-permisos', label: 'Roles y Permisos', icon: Icons.shield() },
                { id: 'usuarios-sistema', label: 'Usuarios del Sistema', icon: Icons.userCheck() }
            ]
        },
        {
            id: 'reportes',
            label: 'REPORTES',
            icon: Icons.reportes(),
            type: 'section',
            children: [
                { id: 'auditoria', label: 'Auditoría', icon: Icons.fileText() },
                { id: 'estadisticas', label: 'Estadísticas', icon: Icons.trendingUp() }
            ]
        }
    ];

    // Filtrar estructura del menú según permisos
    const menuStructure = fullMenuStructure.filter(item => {
        if (item.type === 'single') {
            return isModuleAllowed(item.id);
        } else if (item.type === 'section') {
            // Filtrar hijos según permisos
            const allowedChildren = item.children.filter(child => isModuleAllowed(child.id));
            return allowedChildren.length > 0;
        }
        return true;
    }).map(item => {
        // Si es una sección, filtrar los hijos según permisos
        if (item.type === 'section') {
            return {
                ...item,
                children: item.children.filter(child => isModuleAllowed(child.id))
            };
        }
        return item;
    });

    // Función para obtener el badge del rol
    const getRoleBadge = () => {
        const rol = AuthService.getRoleName().toLowerCase();
        let color = '#6b7280';
        let bgColor = '#f3f4f6';

        if (rol.includes('administrador')) {
            color = '#dc2626';
            bgColor = '#fef2f2';
        } else if (rol.includes('operador')) {
            color = '#2563eb';
            bgColor = '#eff6ff';
        } else if (rol.includes('vendedor')) {
            color = '#059669';
            bgColor = '#ecfdf5';
        }

        return { color, bgColor };
    };

    const roleBadge = getRoleBadge();

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
        // User Info Panel (solo si no está colapsado)
        !collapsed && currentUser && e('div', {
            key: 'user-info',
            style: {
                padding: '1rem',
                borderBottom: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc'
            }
        }, [
            e('div', {
                key: 'user-container',
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }
            }, [
                e('div', {
                    key: 'user-avatar',
                    style: {
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: '#667eea',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '16px',
                        fontWeight: '600'
                    }
                }, currentUser.iniciales || 'US'),
                e('div', {
                    key: 'user-details',
                    style: { flex: 1 }
                }, [
                    e('div', {
                        key: 'user-name',
                        style: {
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#374151',
                            marginBottom: '4px'
                        }
                    }, currentUser.nombre_completo || 'Usuario'),
                    e('div', {
                        key: 'user-role',
                        style: {
                            display: 'inline-block',
                            fontSize: '11px',
                            fontWeight: '500',
                            color: roleBadge.color,
                            backgroundColor: roleBadge.bgColor,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.025em'
                        }
                    }, AuthService.getRoleName())
                ])
            ])
        ]),

        // Navigation Menu
        e('nav', {
            key: 'nav',
            style: {
                padding: collapsed ? '0.5rem 0' : '1rem 0'
            }
        }, menuStructure.map((item) => {
            if (item.type === 'single') {
                return e('div', {
                    key: item.id,
                    onClick: () => {
                        if (collapsed) {
                            onToggle();
                            setTimeout(() => {
                                onModuleChange(item.id);
                            }, 100);
                        } else {
                            onModuleChange(item.id);
                        }
                    },
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
                        title: collapsed ? item.label : '',
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
                        },
                        onMouseEnter: (e) => {
                            if (collapsed) {
                                e.currentTarget.style.backgroundColor = '#f3f4f6';
                            }
                        },
                        onMouseLeave: (e) => {
                            if (collapsed) {
                                e.currentTarget.style.backgroundColor = 'transparent';
                            }
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
                            onClick: () => handleChildClick(child.id),
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

        // Toggle Button
        e('div', {
            key: 'toggleBtn',
            style: {
                position: 'absolute',
                top: '50%',
                left: '12px',
                transform: 'translateY(-50%)',
                zIndex: 100,
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
                    borderRadius: '6px',
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
            }, collapsed ? Icons.chevronRight() : Icons.chevronLeft())
        )
    ]);
}

export default Sidebar;
