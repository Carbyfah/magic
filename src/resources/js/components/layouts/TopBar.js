// src/resources/js/components/layouts/TopBar.js
import React from 'react';
import Icons from '../../utils/Icons';
import Notifications from '../../utils/notifications';
const { createElement: e, useState } = React;

function TopBar({ onMenuClick, sidebarCollapsed, currentUser, onLogout }) {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [searchFocused, setSearchFocused] = useState(false);

    // Manejar logout
    const handleLogout = async () => {
        try {
            setShowUserMenu(false);
            await onLogout();
        } catch (error) {
            console.error('Error en logout desde TopBar:', error);
            Notifications.error('Error al cerrar sesión', 'Intente nuevamente');
        }
    };

    // Obtener datos del usuario con valores por defecto
    const userName = currentUser?.nombre_completo || 'Usuario';
    const userRole = currentUser?.rol?.nombre || 'Sin rol';
    const userInitials = currentUser?.iniciales || 'US';
    const userCode = currentUser?.codigo || '';

    return e('header', {
        style: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '64px',
            backgroundColor: 'white',
            borderBottom: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1.5rem'
        }
    }, [
        // Sección Izquierda - Logo y Título
        e('div', {
            key: 'left-section',
            style: {
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
            }
        }, [
            // Logo con gradiente
            e('div', {
                key: 'logo-container',
                style: {
                    width: '42px',
                    height: '42px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)'
                }
            }, Icons.busLogo('white')),

            // Título y empresa
            e('div', {
                key: 'branding-container',
                style: {
                    display: 'flex',
                    flexDirection: 'column'
                }
            }, [
                e('h1', {
                    key: 'main-title',
                    style: {
                        fontSize: '1.25rem',
                        fontWeight: '700',
                        color: '#1e293b',
                        lineHeight: '1.2'
                    }
                }, 'Magic Travel'),
                e('span', {
                    key: 'subtitle-span',
                    style: {
                        fontSize: '0.75rem',
                        color: '#64748b',
                        fontWeight: '500'
                    }
                }, 'Sistema de Gestión')
            ])
        ]),

        // Sección Central - Búsqueda mejorada
        e('div', {
            key: 'center-section',
            style: {
                flex: 1,
                maxWidth: '600px',
                margin: '0 2rem',
                position: 'relative'
            }
        }, [
            // Icono de búsqueda
            e('div', {
                key: 'search-icon-container',
                style: {
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: searchFocused ? '#3b82f6' : '#9ca3af',
                    transition: 'color 0.2s',
                    pointerEvents: 'none'
                }
            }, Icons.search(searchFocused ? '#3b82f6' : '#9ca3af')),

            // Input de búsqueda
            e('input', {
                key: 'search-input-field',
                type: 'text',
                placeholder: 'Buscar reservas, clientes, rutas...',
                onFocus: () => setSearchFocused(true),
                onBlur: () => setSearchFocused(false),
                style: {
                    width: '100%',
                    padding: '10px 44px',
                    border: searchFocused ? '2px solid #3b82f6' : '2px solid #e2e8f0',
                    borderRadius: '10px',
                    backgroundColor: searchFocused ? 'white' : '#f8fafc',
                    outline: 'none',
                    fontSize: '0.875rem',
                    transition: 'all 0.2s',
                    color: '#1e293b'
                }
            })
        ]),

        // Sección Derecha - Acciones y usuario
        e('div', {
            key: 'right-section',
            style: {
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
            }
        }, [
            // Botón de ayuda
            e('button', {
                key: 'help-button',
                title: 'Centro de ayuda',
                style: {
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    color: '#64748b'
                },
                onMouseEnter: (e) => {
                    e.currentTarget.style.backgroundColor = '#f1f5f9';
                    e.currentTarget.style.color = '#475569';
                },
                onMouseLeave: (e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#64748b';
                }
            }, Icons.help()),

            // Separador
            e('div', {
                key: 'separator-line',
                style: {
                    width: '1px',
                    height: '24px',
                    backgroundColor: '#e2e8f0',
                    margin: '0 0.5rem'
                }
            }),

            // Perfil de usuario mejorado con datos reales
            e('div', {
                key: 'profile-container',
                style: { position: 'relative' }
            }, [
                e('button', {
                    key: 'profile-button',
                    onClick: () => setShowUserMenu(!showUserMenu),
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '10px',
                        border: 'none',
                        backgroundColor: showUserMenu ? '#f8fafc' : 'transparent',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    },
                    onMouseEnter: (e) => {
                        if (!showUserMenu) {
                            e.currentTarget.style.backgroundColor = '#f8fafc';
                        }
                    },
                    onMouseLeave: (e) => {
                        if (!showUserMenu) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                        }
                    }
                }, [
                    // Avatar con iniciales reales del usuario
                    e('div', {
                        key: 'user-avatar',
                        style: {
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '0.875rem',
                            fontWeight: '600'
                        }
                    }, userInitials),

                    // Nombre y rol reales del usuario
                    e('div', {
                        key: 'user-info',
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            textAlign: 'left'
                        }
                    }, [
                        e('span', {
                            key: 'user-name',
                            style: {
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                color: '#1e293b',
                                lineHeight: '1.2'
                            }
                        }, userName),
                        e('span', {
                            key: 'user-role',
                            style: {
                                fontSize: '0.75rem',
                                color: '#64748b',
                                lineHeight: '1.2'
                            }
                        }, userRole)
                    ]),

                    // Chevron
                    e('div', {
                        key: 'chevron-icon',
                        style: {
                            marginLeft: '0.5rem',
                            transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s'
                        }
                    }, Icons.chevronDown('#94a3b8'))
                ]),

                // Dropdown del menú de usuario
                showUserMenu && e('div', {
                    key: 'user-dropdown',
                    style: {
                        position: 'absolute',
                        top: 'calc(100% + 8px)',
                        right: 0,
                        width: '220px',
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                        border: '1px solid #e2e8f0',
                        zIndex: 1001,
                        overflow: 'hidden'
                    }
                }, [
                    e('div', {
                        key: 'user-info-section',
                        style: {
                            padding: '1rem',
                            borderBottom: '1px solid #f1f5f9'
                        }
                    }, [
                        e('div', {
                            key: 'user-code',
                            style: {
                                fontSize: '0.75rem',
                                color: '#64748b',
                                marginBottom: '4px'
                            }
                        }, `Código: ${userCode}`),
                        e('div', {
                            key: 'user-email',
                            style: {
                                fontSize: '0.75rem',
                                color: '#64748b'
                            }
                        }, `${userName.toLowerCase().replace(' ', '.')}@magictravel.gt`)
                    ]),

                    // Opciones del menú
                    e('div', {
                        key: 'menu-options',
                        style: {
                            padding: '0.5rem'
                        }
                    }, [
                        e('button', {
                            key: 'profile-option',
                            style: {
                                width: '100%',
                                padding: '0.625rem 0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                border: 'none',
                                backgroundColor: 'transparent',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s',
                                fontSize: '0.875rem',
                                color: '#334155',
                                textAlign: 'left'
                            },
                            onClick: () => {
                                setShowUserMenu(false);
                                Notifications.info('Próximamente disponible', 'Mi Perfil');
                            },
                            onMouseEnter: (e) => {
                                e.currentTarget.style.backgroundColor = '#f8fafc';
                            },
                            onMouseLeave: (e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                            }
                        }, [
                            e('span', { key: 'profile-icon' }, Icons.user('#64748b')),
                            e('span', { key: 'profile-text' }, 'Mi Perfil')
                        ]),

                        e('button', {
                            key: 'settings-option',
                            style: {
                                width: '100%',
                                padding: '0.625rem 0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                border: 'none',
                                backgroundColor: 'transparent',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s',
                                fontSize: '0.875rem',
                                color: '#334155',
                                textAlign: 'left'
                            },
                            onClick: () => {
                                setShowUserMenu(false);
                                Notifications.info('Próximamente disponible', 'Configuración');
                            },
                            onMouseEnter: (e) => {
                                e.currentTarget.style.backgroundColor = '#f8fafc';
                            },
                            onMouseLeave: (e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                            }
                        }, [
                            e('span', { key: 'settings-icon' }, Icons.settings('#64748b')),
                            e('span', { key: 'settings-text' }, 'Configuración')
                        ])
                    ]),

                    // Separador y logout funcional
                    e('div', {
                        key: 'logout-section',
                        style: {
                            borderTop: '1px solid #f1f5f9',
                            padding: '0.5rem'
                        }
                    }, [
                        e('button', {
                            key: 'logout-button',
                            onClick: handleLogout,
                            style: {
                                width: '100%',
                                padding: '0.625rem 0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                border: 'none',
                                backgroundColor: 'transparent',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s',
                                fontSize: '0.875rem',
                                color: '#ef4444',
                                textAlign: 'left'
                            },
                            onMouseEnter: (e) => {
                                e.currentTarget.style.backgroundColor = '#fef2f2';
                            },
                            onMouseLeave: (e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                            }
                        }, [
                            e('span', { key: 'logout-icon' }, Icons.logout('#ef4444')),
                            e('span', { key: 'logout-text' }, 'Cerrar Sesión')
                        ])
                    ])
                ])
            ])
        ])
    ]);
}

export default TopBar;
