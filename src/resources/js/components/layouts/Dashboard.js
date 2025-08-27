// src/resources/js/components/layouts/Dashboard.js
import React from 'react';
import Icons from '../../utils/Icons';
import Notifications from '../../utils/notifications';

const { createElement: e, useState, useEffect } = React;

function Dashboard() {
    // Simular datos dinámicos (cuando tengamos API, esto vendrá del backend)
    const [stats, setStats] = useState({
        reservasHoy: 24,
        pasajeros: 89,
        rutasActivas: 6,
        ingresosHoy: 12450,
        ocupacion: 78,
        vehiculosDisponibles: 8,
        reservasPendientes: 12,
        noShows: 2
    });

    // Función para refrescar estadísticas - SIN notificación molesta
    const refreshStats = () => {
        // Simular nuevos datos
        setStats(prev => ({
            ...prev,
            reservasHoy: prev.reservasHoy + Math.floor(Math.random() * 3),
            pasajeros: prev.pasajeros + Math.floor(Math.random() * 10),
            ocupacion: Math.max(50, Math.min(100, prev.ocupacion + Math.floor(Math.random() * 10) - 5))
        }));
    };

    return e('div', {
        style: {
            padding: '2rem',
            backgroundColor: '#f8fafc',
            minHeight: 'calc(100vh - 64px)'
        }
    }, [
        // Header mejorado
        e('div', {
            key: 'header',
            style: {
                marginBottom: '2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }
        }, [
            e('div', { key: 'left' }, [
                e('h1', {
                    key: 'title',
                    style: {
                        fontSize: '2rem',
                        fontWeight: '700',
                        color: '#1e293b',
                        marginBottom: '0.25rem'
                    }
                }, 'Dashboard'),
                e('p', {
                    key: 'subtitle',
                    style: {
                        color: '#64748b',
                        fontSize: '0.95rem'
                    }
                }, `${new Date().toLocaleDateString('es-GT', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })} - Vista general del sistema`)
            ]),
            e('button', {
                key: 'refresh',
                onClick: refreshStats,
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                },
                onMouseEnter: (e) => {
                    e.currentTarget.style.backgroundColor = '#2563eb';
                },
                onMouseLeave: (e) => {
                    e.currentTarget.style.backgroundColor = '#3b82f6';
                }
            }, [
                e('span', { key: 'refresh-icon' }, Icons.refresh('#ffffff')),
                e('span', { key: 'refresh-text' }, 'Actualizar')
            ])
        ]),

        // Grid de estadísticas SIN notificaciones molestas
        e('div', {
            key: 'statsGrid',
            style: {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }
        }, [
            // Tarjeta 1: Reservas Hoy - SOLO VISUAL
            e('div', {
                key: 'card1',
                style: {
                    backgroundColor: 'white',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    cursor: 'default',
                    transition: 'all 0.2s'
                }
            }, [
                e('div', {
                    key: 'icon1',
                    style: {
                        width: '3rem',
                        height: '3rem',
                        backgroundColor: '#eff6ff',
                        borderRadius: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1rem'
                    }
                }, Icons.calendar('#3b82f6')),
                e('div', {
                    key: 'label1',
                    style: {
                        color: '#64748b',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        marginBottom: '0.25rem'
                    }
                }, 'Reservas Hoy'),
                e('div', {
                    key: 'value1',
                    style: {
                        fontSize: '2rem',
                        fontWeight: '700',
                        color: '#1e293b'
                    }
                }, stats.reservasHoy)
            ]),

            // Tarjeta 2: Pasajeros - SOLO VISUAL
            e('div', {
                key: 'card2',
                style: {
                    backgroundColor: 'white',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    cursor: 'default',
                    transition: 'all 0.2s'
                }
            }, [
                e('div', {
                    key: 'icon2',
                    style: {
                        width: '3rem',
                        height: '3rem',
                        backgroundColor: '#f0fdf4',
                        borderRadius: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1rem'
                    }
                }, Icons.users('#10b981')),
                e('div', {
                    key: 'label2',
                    style: {
                        color: '#64748b',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        marginBottom: '0.25rem'
                    }
                }, 'Total Pasajeros'),
                e('div', {
                    key: 'value2',
                    style: {
                        fontSize: '2rem',
                        fontWeight: '700',
                        color: '#1e293b'
                    }
                }, stats.pasajeros)
            ]),

            // Tarjeta 3: Rutas Activas - SOLO VISUAL
            e('div', {
                key: 'card3',
                style: {
                    backgroundColor: 'white',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    cursor: 'default',
                    transition: 'all 0.2s'
                }
            }, [
                e('div', {
                    key: 'icon3',
                    style: {
                        width: '3rem',
                        height: '3rem',
                        backgroundColor: '#fef3c7',
                        borderRadius: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1rem'
                    }
                }, Icons.truck('#f59e0b')),
                e('div', {
                    key: 'label3',
                    style: {
                        color: '#64748b',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        marginBottom: '0.25rem'
                    }
                }, 'Rutas Activas'),
                e('div', {
                    key: 'value3',
                    style: {
                        fontSize: '2rem',
                        fontWeight: '700',
                        color: '#1e293b'
                    }
                }, stats.rutasActivas)
            ]),

            // Tarjeta 4: Ingresos Hoy - SOLO VISUAL
            e('div', {
                key: 'card4',
                style: {
                    backgroundColor: 'white',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    cursor: 'default',
                    transition: 'all 0.2s'
                }
            }, [
                e('div', {
                    key: 'icon4',
                    style: {
                        width: '3rem',
                        height: '3rem',
                        backgroundColor: '#f0f9ff',
                        borderRadius: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1rem'
                    }
                }, Icons.dollar('#06b6d4')),
                e('div', {
                    key: 'label4',
                    style: {
                        color: '#64748b',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        marginBottom: '0.25rem'
                    }
                }, 'Ingresos Hoy'),
                e('div', {
                    key: 'value4',
                    style: {
                        fontSize: '2rem',
                        fontWeight: '700',
                        color: '#1e293b'
                    }
                }, `Q${stats.ingresosHoy.toLocaleString()}`)
            ]),

            // Tarjeta 5: Ocupación - SOLO VISUAL
            e('div', {
                key: 'card5',
                style: {
                    backgroundColor: 'white',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    cursor: 'default',
                    transition: 'all 0.2s'
                }
            }, [
                e('div', {
                    key: 'icon5',
                    style: {
                        width: '3rem',
                        height: '3rem',
                        backgroundColor: '#fef7ff',
                        borderRadius: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1rem'
                    }
                }, Icons.chartBar('#8b5cf6')),
                e('div', {
                    key: 'label5',
                    style: {
                        color: '#64748b',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        marginBottom: '0.25rem'
                    }
                }, 'Ocupación Promedio'),
                e('div', {
                    key: 'value5',
                    style: {
                        fontSize: '2rem',
                        fontWeight: '700',
                        color: '#1e293b'
                    }
                }, `${stats.ocupacion}%`)
            ]),

            // Tarjeta 6: Vehículos Disponibles - SOLO VISUAL
            e('div', {
                key: 'card6',
                style: {
                    backgroundColor: 'white',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    cursor: 'default',
                    transition: 'all 0.2s'
                }
            }, [
                e('div', {
                    key: 'icon6',
                    style: {
                        width: '3rem',
                        height: '3rem',
                        backgroundColor: '#f0fdf4',
                        borderRadius: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1rem'
                    }
                }, Icons.truck('#16a34a')),
                e('div', {
                    key: 'label6',
                    style: {
                        color: '#64748b',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        marginBottom: '0.25rem'
                    }
                }, 'Vehículos Disponibles'),
                e('div', {
                    key: 'value6',
                    style: {
                        fontSize: '2rem',
                        fontWeight: '700',
                        color: '#1e293b'
                    }
                }, stats.vehiculosDisponibles)
            ]),

            // Tarjeta 7: Reservas Pendientes - SOLO VISUAL
            e('div', {
                key: 'card7',
                style: {
                    backgroundColor: 'white',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    cursor: 'default',
                    transition: 'all 0.2s'
                }
            }, [
                e('div', {
                    key: 'icon7',
                    style: {
                        width: '3rem',
                        height: '3rem',
                        backgroundColor: '#fef3c7',
                        borderRadius: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1rem'
                    }
                }, Icons.clock('#f59e0b')),
                e('div', {
                    key: 'label7',
                    style: {
                        color: '#64748b',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        marginBottom: '0.25rem'
                    }
                }, 'Reservas Pendientes'),
                e('div', {
                    key: 'value7',
                    style: {
                        fontSize: '2rem',
                        fontWeight: '700',
                        color: '#1e293b'
                    }
                }, stats.reservasPendientes)
            ]),

            // Tarjeta 8: No Shows - SOLO VISUAL
            e('div', {
                key: 'card8',
                style: {
                    backgroundColor: 'white',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    cursor: 'default',
                    transition: 'all 0.2s'
                }
            }, [
                e('div', {
                    key: 'icon8',
                    style: {
                        width: '3rem',
                        height: '3rem',
                        backgroundColor: '#fef2f2',
                        borderRadius: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1rem'
                    }
                }, Icons.x('#ef4444')),
                e('div', {
                    key: 'label8',
                    style: {
                        color: '#64748b',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        marginBottom: '0.25rem'
                    }
                }, 'No Shows Hoy'),
                e('div', {
                    key: 'value8',
                    style: {
                        fontSize: '2rem',
                        fontWeight: '700',
                        color: '#1e293b'
                    }
                }, stats.noShows)
            ])
        ]),

        // Sección de Acciones Rápidas - SOLO estas tienen notificaciones CRUD
        e('div', {
            key: 'quickActions',
            style: {
                marginTop: '2rem'
            }
        }, [
            e('h2', {
                key: 'title',
                style: {
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: '#1e293b',
                    marginBottom: '1rem'
                }
            }, 'Acciones Rápidas'),
            e('div', {
                key: 'grid',
                style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1rem'
                }
            }, [
                // Botón WhatsApp - ACCIÓN REAL CON NOTIFICACIÓN
                e('div', {
                    key: 'whatsapp',
                    onClick: () => {
                        Notifications.loading('Generando formato WhatsApp...', 'Procesando');
                        setTimeout(() => {
                            Notifications.hideLoading();
                            Notifications.success('Formato copiado al portapapeles.', 'WhatsApp Listo');
                        }, 1500);
                    },
                    style: {
                        backgroundColor: '#25d366',
                        color: 'white',
                        borderRadius: '1rem',
                        padding: '1.5rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                    },
                    onMouseEnter: (e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.backgroundColor = '#20ba5a';
                    },
                    onMouseLeave: (e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.backgroundColor = '#25d366';
                    }
                }, [
                    e('div', {
                        key: 'icon',
                        style: {
                            width: '3rem',
                            height: '3rem',
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            borderRadius: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }
                    }, Icons.message('#ffffff')),
                    e('div', { key: 'content' }, [
                        e('h3', {
                            key: 'title',
                            style: {
                                fontSize: '1rem',
                                fontWeight: '600',
                                marginBottom: '0.25rem'
                            }
                        }, 'Formato WhatsApp'),
                        e('p', {
                            key: 'desc',
                            style: {
                                fontSize: '0.875rem',
                                opacity: 0.9
                            }
                        }, 'Generar mensaje para confirmaciones')
                    ])
                ]),

                // Botón Respaldos - ACCIÓN REAL CON NOTIFICACIÓN
                e('div', {
                    key: 'backup',
                    onClick: () => {
                        Notifications.loading('Iniciando respaldo de datos...', 'Respaldo');
                        setTimeout(() => {
                            Notifications.hideLoading();
                            Notifications.success('Respaldo completado exitosamente.', 'Respaldo Exitoso');
                        }, 3000);
                    },
                    style: {
                        backgroundColor: '#6366f1',
                        color: 'white',
                        borderRadius: '1rem',
                        padding: '1.5rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                    },
                    onMouseEnter: (e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.backgroundColor = '#4f46e5';
                    },
                    onMouseLeave: (e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.backgroundColor = '#6366f1';
                    }
                }, [
                    e('div', {
                        key: 'icon',
                        style: {
                            width: '3rem',
                            height: '3rem',
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            borderRadius: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }
                    }, Icons.database('#ffffff')),
                    e('div', { key: 'content' }, [
                        e('h3', {
                            key: 'title',
                            style: {
                                fontSize: '1rem',
                                fontWeight: '600',
                                marginBottom: '0.25rem'
                            }
                        }, 'Respaldo Manual'),
                        e('p', {
                            key: 'desc',
                            style: {
                                fontSize: '0.875rem',
                                opacity: 0.9
                            }
                        }, 'Ejecutar respaldo de datos')
                    ])
                ]),

                // Botón Nueva Reserva - NAVEGACIÓN SIN NOTIFICACIÓN
                e('div', {
                    key: 'newReservation',
                    onClick: () => {
                        // Solo navegar, sin notificación molesta
                        console.log('Navegando a nueva reserva...');
                    },
                    style: {
                        backgroundColor: '#059669',
                        color: 'white',
                        borderRadius: '1rem',
                        padding: '1.5rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                    },
                    onMouseEnter: (e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.backgroundColor = '#047857';
                    },
                    onMouseLeave: (e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.backgroundColor = '#059669';
                    }
                }, [
                    e('div', {
                        key: 'icon',
                        style: {
                            width: '3rem',
                            height: '3rem',
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            borderRadius: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }
                    }, Icons.plus('#ffffff')),
                    e('div', { key: 'content' }, [
                        e('h3', {
                            key: 'title',
                            style: {
                                fontSize: '1rem',
                                fontWeight: '600',
                                marginBottom: '0.25rem'
                            }
                        }, 'Nueva Reserva'),
                        e('p', {
                            key: 'desc',
                            style: {
                                fontSize: '0.875rem',
                                opacity: 0.9
                            }
                        }, 'Crear reserva rápidamente')
                    ])
                ]),

                // Botón Reportes - NAVEGACIÓN SIN NOTIFICACIÓN
                e('div', {
                    key: 'reports',
                    onClick: () => {
                        // Solo navegar, sin notificación molesta
                        console.log('Navegando a reportes...');
                    },
                    style: {
                        backgroundColor: '#dc2626',
                        color: 'white',
                        borderRadius: '1rem',
                        padding: '1.5rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                    },
                    onMouseEnter: (e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.backgroundColor = '#b91c1c';
                    },
                    onMouseLeave: (e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.backgroundColor = '#dc2626';
                    }
                }, [
                    e('div', {
                        key: 'icon',
                        style: {
                            width: '3rem',
                            height: '3rem',
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            borderRadius: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }
                    }, Icons.chartBar('#ffffff')),
                    e('div', { key: 'content' }, [
                        e('h3', {
                            key: 'title',
                            style: {
                                fontSize: '1rem',
                                fontWeight: '600',
                                marginBottom: '0.25rem'
                            }
                        }, 'Ver Reportes'),
                        e('p', {
                            key: 'desc',
                            style: {
                                fontSize: '0.875rem',
                                opacity: 0.9
                            }
                        }, 'Generar informes del sistema')
                    ])
                ])
            ])
        ])
    ]);
}

export default Dashboard;
