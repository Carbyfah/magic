// src/resources/js/components/layouts/Sidebar.js
import React from 'react';
const { createElement: e } = React;

function Sidebar({ activeModule, onModuleChange, collapsed, onToggle }) {
    const menuItems = [
        { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
        { id: 'reservaciones', icon: '📅', label: 'Reservaciones' },
        { id: 'rutas', icon: '🛣️', label: 'Rutas & Servicios' },
        { id: 'agencias', icon: '🏢', label: 'Agencias' },
        { id: 'clientes', icon: '👥', label: 'Clientes' },
        { id: 'flota', icon: '🚌', label: 'Flota' },
        { id: 'finanzas', icon: '💰', label: 'Finanzas' }
    ];

    return e('aside', {
        style: {
            position: 'fixed',
            left: 0,
            top: '64px',
            width: collapsed ? '80px' : '260px', // ← ANCHO DINÁMICO
            height: 'calc(100vh - 64px)',
            backgroundColor: 'white',
            borderRight: '1px solid #e2e8f0',
            overflowY: 'auto',
            overflowX: 'hidden',
            zIndex: 900,
            transition: 'width 0.3s ease' // ← ANIMACIÓN
        }
    }, [
        // Quick Stats - Solo mostrar si no está colapsado
        !collapsed && e('div', {
            key: 'quickStats',
            style: {
                padding: '1rem',
                borderBottom: '1px solid #f1f5f9'
            }
        }, [
            e('div', {
                key: 'statsGrid',
                style: {
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px'
                }
            }, [
                e('div', {
                    key: 'stat1',
                    style: {
                        backgroundColor: '#dbeafe',
                        padding: '8px',
                        borderRadius: '6px',
                        textAlign: 'center'
                    }
                }, [
                    e('div', {
                        key: 'value1',
                        style: { fontWeight: 'bold', color: '#1d4ed8' }
                    }, '24'),
                    e('div', {
                        key: 'label1',
                        style: { fontSize: '10px', color: '#3730a3' }
                    }, 'Reservas')
                ]),
                e('div', {
                    key: 'stat2',
                    style: {
                        backgroundColor: '#dcfce7',
                        padding: '8px',
                        borderRadius: '6px',
                        textAlign: 'center'
                    }
                }, [
                    e('div', {
                        key: 'value2',
                        style: { fontWeight: 'bold', color: '#166534' }
                    }, '6'),
                    e('div', {
                        key: 'label2',
                        style: { fontSize: '10px', color: '#15803d' }
                    }, 'Rutas')
                ])
            ])
        ]),

        // Navigation Menu
        e('nav', {
            key: 'nav',
            style: { padding: '1rem 0' }
        }, menuItems.map((item) =>
            e('div', {
                key: item.id,
                style: { marginBottom: '4px' }
            }, [
                e('div', {
                    key: 'mainItem',
                    onClick: () => onModuleChange(item.id),
                    title: collapsed ? item.label : '', // ← TOOLTIP cuando está colapsado
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: collapsed ? '10px' : '10px 16px', // ← PADDING DINÁMICO
                        margin: '0 8px',
                        borderRadius: '8px',
                        backgroundColor: activeModule === item.id ? '#eff6ff' : 'transparent',
                        color: activeModule === item.id ? '#1d4ed8' : '#374151',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        justifyContent: collapsed ? 'center' : 'flex-start' // ← CENTRAR ICONO
                    }
                }, [
                    e('span', {
                        key: 'icon',
                        style: { fontSize: collapsed ? '24px' : '20px' } // ← ICONO MÁS GRANDE
                    }, item.icon),
                    !collapsed && e('span', { // ← OCULTAR TEXTO
                        key: 'label',
                        style: { fontWeight: activeModule === item.id ? '600' : '500' }
                    }, item.label)
                ])
            ])
        )),

        // Botón de colapsar al final
        e('div', {
            key: 'toggleBtn',
            style: {
                position: 'absolute',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)'
            }
        },
            e('button', {
                onClick: onToggle,
                style: {
                    width: collapsed ? '40px' : '200px',
                    height: '40px',
                    backgroundColor: '#f3f4f6',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.3s',
                    fontSize: '14px',
                    color: '#6b7280'
                }
            }, [
                e('span', { key: 'icon' }, collapsed ? '→' : '←'),
                !collapsed && e('span', { key: 'text' }, 'Colapsar menú')
            ])
        )
    ]);
}

export default Sidebar;
