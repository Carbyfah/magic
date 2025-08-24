// src/resources/js/components/layouts/TopBar.js
import React from 'react';
const { createElement: e } = React;

function TopBar({ onMenuClick, sidebarCollapsed }) {
    return e('header', {
        style: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '64px',
            backgroundColor: 'white',
            borderBottom: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1.5rem'
        }
    }, [
        // Logo Section con botón de menú
        e('div', {
            key: 'logo',
            style: {
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
            }
        }, [
            // NUEVO: Botón de menú hamburguesa
            e('button', {
                key: 'menuBtn',
                onClick: onMenuClick,
                style: {
                    width: '40px',
                    height: '40px',
                    border: 'none',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '20px',
                    transition: 'all 0.2s'
                },
                onMouseEnter: (e) => {
                    e.target.style.backgroundColor = '#e5e7eb';
                },
                onMouseLeave: (e) => {
                    e.target.style.backgroundColor = '#f3f4f6';
                }
            }, sidebarCollapsed ? '☰' : '✕'),

            e('div', {
                key: 'icon',
                style: {
                    width: '40px',
                    height: '40px',
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '18px'
                }
            }, '🚌'),
            e('h1', {
                key: 'title',
                style: {
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#1f2937'
                }
            }, 'Magic Travel')
        ]),

        // Search Bar
        e('div', {
            key: 'search',
            style: {
                flex: 1,
                maxWidth: '500px',
                margin: '0 2rem',
                position: 'relative'
            }
        }, [
            e('input', {
                key: 'input',
                type: 'text',
                placeholder: 'Buscar reservas, clientes, rutas...',
                style: {
                    width: '100%',
                    padding: '8px 40px 8px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '25px',
                    backgroundColor: '#f9fafb',
                    outline: 'none'
                }
            }),
            e('div', {
                key: 'searchIcon',
                style: {
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#6b7280'
                }
            }, '🔍')
        ]),

        // User Section
        e('div', {
            key: 'user',
            style: {
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
            }
        }, [
            e('div', {
                key: 'notifications',
                style: {
                    position: 'relative',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                }
            }, '🔔'),
            e('div', {
                key: 'avatar',
                style: {
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                }
            }, 'A')
        ])
    ]);
}

export default TopBar;
