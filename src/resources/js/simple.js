import './bootstrap';
import React from 'react';
import { createRoot } from 'react-dom/client';
import '../css/app.css';

// Crear elementos usando solo React.createElement (sin JSX)
const { createElement: e, useState } = React;

// TopBar Component
function TopBar({ onMenuClick }) {
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
        // Logo Section
        e('div', {
            key: 'logo',
            style: {
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
            }
        }, [
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

// Sidebar Component
function Sidebar({ activeModule, onModuleChange }) {
    const menuItems = [
        { id: 'dashboard', icon: '🏠', label: 'Dashboard', active: true },
        {
            id: 'reservaciones',
            icon: '📅',
            label: 'Reservaciones',
            subItems: [
                { id: 'libro', label: 'Libro Diario' },
                { id: 'nueva', label: 'Nueva Reserva' },
                { id: 'reportes', label: 'Reportes' }
            ]
        },
        {
            id: 'rutas',
            icon: '🛣️',
            label: 'Rutas & Servicios',
            subItems: [
                { id: 'gestion', label: 'Gestión Rutas' },
                { id: 'horarios', label: 'Horarios' },
                { id: 'tarifas', label: 'Tarifas' }
            ]
        },
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
            width: '260px',
            height: 'calc(100vh - 64px)',
            backgroundColor: 'white',
            borderRight: '1px solid #e2e8f0',
            overflowY: 'auto',
            zIndex: 900
        }
    }, [
        // Quick Stats
        e('div', {
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
        }, menuItems.map((item, index) =>
            e('div', {
                key: item.id,
                style: { marginBottom: '4px' }
            }, [
                e('div', {
                    key: 'mainItem',
                    onClick: () => onModuleChange(item.id),
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 16px',
                        margin: '0 8px',
                        borderRadius: '8px',
                        backgroundColor: activeModule === item.id ? '#eff6ff' : 'transparent',
                        color: activeModule === item.id ? '#1d4ed8' : '#374151',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }
                }, [
                    e('span', { key: 'icon' }, item.icon),
                    e('span', {
                        key: 'label',
                        style: { fontWeight: activeModule === item.id ? '600' : '500' }
                    }, item.label)
                ])
            ])
        ))
    ]);
}

// Dashboard Content Component
function DashboardContent() {
    return e('div', {
        style: {
            padding: '2rem'
        }
    }, [
        // Header
        e('div', {
            key: 'header',
            style: {
                marginBottom: '2rem'
            }
        }, [
            e('h1', {
                key: 'title',
                style: {
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                    color: '#1f2937',
                    marginBottom: '0.5rem'
                }
            }, 'Dashboard'),
            e('p', {
                key: 'subtitle',
                style: {
                    color: '#6b7280',
                    fontSize: '1.1rem'
                }
            }, 'Vista general del sistema Magic Travel')
        ]),

        // Stats Grid
        e('div', {
            key: 'stats',
            style: {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }
        }, [
            // Card 1 - Reservas
            e('div', {
                key: 'card1',
                style: {
                    backgroundColor: 'white',
                    padding: '2rem',
                    borderRadius: '1rem',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
                    borderLeft: '5px solid #3b82f6',
                    cursor: 'pointer',
                    transition: 'transform 0.2s'
                }
            }, [
                e('div', {
                    key: 'icon1',
                    style: {
                        width: '4rem',
                        height: '4rem',
                        backgroundColor: '#3b82f6',
                        borderRadius: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1rem'
                    }
                }, e('span', { style: { fontSize: '1.5rem' } }, '📅')),
                e('div', {
                    key: 'value1',
                    style: {
                        fontSize: '2.5rem',
                        fontWeight: 'bold',
                        color: '#1f2937',
                        marginBottom: '0.5rem'
                    }
                }, '24'),
                e('div', {
                    key: 'label1',
                    style: {
                        color: '#6b7280',
                        fontWeight: '600'
                    }
                }, 'Reservas Hoy'),
                e('div', {
                    key: 'change1',
                    style: {
                        color: '#059669',
                        fontSize: '0.875rem',
                        marginTop: '0.5rem'
                    }
                }, '↗ +12% vs ayer')
            ]),

            // Card 2 - Pasajeros
            e('div', {
                key: 'card2',
                style: {
                    backgroundColor: 'white',
                    padding: '2rem',
                    borderRadius: '1rem',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
                    borderLeft: '5px solid #10b981',
                    cursor: 'pointer'
                }
            }, [
                e('div', {
                    key: 'icon2',
                    style: {
                        width: '4rem',
                        height: '4rem',
                        backgroundColor: '#10b981',
                        borderRadius: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1rem'
                    }
                }, e('span', { style: { fontSize: '1.5rem' } }, '👥')),
                e('div', {
                    key: 'value2',
                    style: {
                        fontSize: '2.5rem',
                        fontWeight: 'bold',
                        color: '#1f2937',
                        marginBottom: '0.5rem'
                    }
                }, '89'),
                e('div', {
                    key: 'label2',
                    style: {
                        color: '#6b7280',
                        fontWeight: '600'
                    }
                }, 'Pasajeros'),
                e('div', {
                    key: 'change2',
                    style: {
                        color: '#059669',
                        fontSize: '0.875rem',
                        marginTop: '0.5rem'
                    }
                }, '↗ +8% vs ayer')
            ]),

            // Card 3 - Rutas
            e('div', {
                key: 'card3',
                style: {
                    backgroundColor: 'white',
                    padding: '2rem',
                    borderRadius: '1rem',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
                    borderLeft: '5px solid #f59e0b',
                    cursor: 'pointer'
                }
            }, [
                e('div', {
                    key: 'icon3',
                    style: {
                        width: '4rem',
                        height: '4rem',
                        backgroundColor: '#f59e0b',
                        borderRadius: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1rem'
                    }
                }, e('span', { style: { fontSize: '1.5rem' } }, '🚌')),
                e('div', {
                    key: 'value3',
                    style: {
                        fontSize: '2.5rem',
                        fontWeight: 'bold',
                        color: '#1f2937',
                        marginBottom: '0.5rem'
                    }
                }, '6'),
                e('div', {
                    key: 'label3',
                    style: {
                        color: '#6b7280',
                        fontWeight: '600'
                    }
                }, 'Rutas Activas'),
                e('div', {
                    key: 'change3',
                    style: {
                        color: '#6b7280',
                        fontSize: '0.875rem',
                        marginTop: '0.5rem'
                    }
                }, '— Sin cambios')
            ]),

            // Card 4 - Ingresos
            e('div', {
                key: 'card4',
                style: {
                    backgroundColor: 'white',
                    padding: '2rem',
                    borderRadius: '1rem',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
                    borderLeft: '5px solid #8b5cf6',
                    cursor: 'pointer'
                }
            }, [
                e('div', {
                    key: 'icon4',
                    style: {
                        width: '4rem',
                        height: '4rem',
                        backgroundColor: '#8b5cf6',
                        borderRadius: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1rem'
                    }
                }, e('span', { style: { fontSize: '1.5rem' } }, '💰')),
                e('div', {
                    key: 'value4',
                    style: {
                        fontSize: '2.5rem',
                        fontWeight: 'bold',
                        color: '#1f2937',
                        marginBottom: '0.5rem'
                    }
                }, 'Q12,450'),
                e('div', {
                    key: 'label4',
                    style: {
                        color: '#6b7280',
                        fontWeight: '600'
                    }
                }, 'Ingresos Hoy'),
                e('div', {
                    key: 'change4',
                    style: {
                        color: '#059669',
                        fontSize: '0.875rem',
                        marginTop: '0.5rem'
                    }
                }, '↗ +15% vs ayer')
            ])
        ]),

        // Quick Access Section
        e('div', {
            key: 'quickAccess',
            style: {
                marginTop: '2rem'
            }
        }, [
            e('h2', {
                key: 'title',
                style: {
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '1rem'
                }
            }, 'Acceso Rápido'),
            e('div', {
                key: 'grid',
                style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '1rem'
                }
            }, [
                e('div', {
                    key: 'access1',
                    style: {
                        backgroundColor: 'white',
                        padding: '1.5rem',
                        borderRadius: '0.75rem',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                        transition: 'transform 0.2s'
                    }
                }, [
                    e('h3', {
                        key: 'title1',
                        style: {
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            color: '#1f2937',
                            marginBottom: '0.5rem'
                        }
                    }, '📖 Libro Diario'),
                    e('p', {
                        key: 'desc1',
                        style: {
                            color: '#6b7280',
                            fontSize: '0.9rem'
                        }
                    }, 'Gestionar reservas del día')
                ]),
                e('div', {
                    key: 'access2',
                    style: {
                        backgroundColor: 'white',
                        padding: '1.5rem',
                        borderRadius: '0.75rem',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                        transition: 'transform 0.2s'
                    }
                }, [
                    e('h3', {
                        key: 'title2',
                        style: {
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            color: '#1f2937',
                            marginBottom: '0.5rem'
                        }
                    }, '➕ Nueva Reserva'),
                    e('p', {
                        key: 'desc2',
                        style: {
                            color: '#6b7280',
                            fontSize: '0.9rem'
                        }
                    }, 'Crear nueva reserva')
                ])
            ])
        ])
    ]);
}

// Module Content Component
function ModuleContent({ module }) {
    switch (module) {
        case 'dashboard':
            return e(DashboardContent);
        case 'reservaciones':
            return e('div', {
                style: { padding: '2rem' }
            }, [
                e('h1', {
                    key: 'title',
                    style: { fontSize: '2rem', color: '#1f2937' }
                }, '📅 Módulo de Reservaciones'),
                e('p', {
                    key: 'desc',
                    style: { color: '#6b7280', marginTop: '1rem' }
                }, 'Gestión completa de reservas - En desarrollo')
            ]);
        case 'rutas':
            return e('div', {
                style: { padding: '2rem' }
            }, [
                e('h1', {
                    key: 'title',
                    style: { fontSize: '2rem', color: '#1f2937' }
                }, '🛣️ Módulo de Rutas'),
                e('p', {
                    key: 'desc',
                    style: { color: '#6b7280', marginTop: '1rem' }
                }, 'Gestión de rutas y servicios - En desarrollo')
            ]);
        default:
            return e('div', {
                style: { padding: '2rem' }
            }, [
                e('h1', {
                    key: 'title',
                    style: { fontSize: '2rem', color: '#1f2937' }
                }, `Módulo: ${module}`),
                e('p', {
                    key: 'desc',
                    style: { color: '#6b7280', marginTop: '1rem' }
                }, 'Módulo en desarrollo')
            ]);
    }
}

// Main App Component
function App() {
    const [activeModule, setActiveModule] = useState('dashboard');

    return e('div', {
        style: {
            minHeight: '100vh',
            backgroundColor: '#f8fafc'
        }
    }, [
        e(TopBar, {
            key: 'topbar',
            onMenuClick: () => console.log('Menu clicked')
        }),
        e(Sidebar, {
            key: 'sidebar',
            activeModule,
            onModuleChange: setActiveModule
        }),
        e('main', {
            key: 'main',
            style: {
                marginLeft: '260px',
                marginTop: '64px',
                minHeight: 'calc(100vh - 64px)'
            }
        }, [
            e(ModuleContent, {
                key: 'content',
                module: activeModule
            })
        ])
    ]);
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('app');
    if (container) {
        const root = createRoot(container);
        root.render(e(App));
        console.log('🎉 Magic Travel SPA completo cargado!');
    }
});
