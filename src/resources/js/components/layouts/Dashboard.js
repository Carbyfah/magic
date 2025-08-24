// src/resources/js/components/layouts/Dashboard.js
import React from 'react';
const { createElement: e } = React;

function Dashboard() {
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

export default Dashboard;
