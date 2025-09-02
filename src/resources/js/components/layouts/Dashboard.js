// src/resources/js/components/layouts/Dashboard.js
import React from 'react';
import Icons from '../../utils/Icons';
import Notifications from '../../utils/notifications';
import api from '../../services/api';

const { createElement: e, useState, useEffect } = React;

function Dashboard() {
    // Estados reales del sistema
    const [stats, setStats] = useState({
        reservasHoy: 0,
        pasajeros: 0,
        rutasActivas: 0,
        ingresosHoy: 0,
        ocupacion: 0,
        vehiculosDisponibles: 0,
        reservasPendientes: 0,
        noShows: 0
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [ultimaActualizacion, setUltimaActualizacion] = useState(null);
    const [alertas, setAlertas] = useState([]);

    // Función para cargar estadísticas reales del backend
    const loadDashboardStats = async () => {
        try {
            setLoading(true);
            setError(null);

            // Usar una sola llamada consolidada
            const dashboardResponse = await api.getDashboardStats();

            const statsCalculadas = {
                reservasHoy: dashboardResponse.reservas_hoy || 0,
                pasajeros: dashboardResponse.pasajeros_hoy || 0,
                rutasActivas: dashboardResponse.rutas_activas || 0,
                ingresosHoy: dashboardResponse.ingresos_hoy || 0,
                ocupacion: dashboardResponse.ocupacion_promedio || 0,
                vehiculosDisponibles: dashboardResponse.vehiculos_disponibles || 0,
                reservasPendientes: 0,
                noShows: 0
            };

            // Calcular estadísticas consolidadas
            const hoy = new Date().toISOString().split('T')[0];

            setStats(statsCalculadas);

            // Verificar alertas del sistema
            const alertasDetectadas = [];

            if (statsCalculadas.ocupacion > 85) {
                alertasDetectadas.push({
                    tipo: 'warning',
                    mensaje: `Ocupación alta: ${statsCalculadas.ocupacion}%`
                });
            }

            if (statsCalculadas.vehiculosDisponibles < 3) {
                alertasDetectadas.push({
                    tipo: 'error',
                    mensaje: `Pocos vehículos disponibles: ${statsCalculadas.vehiculosDisponibles}`
                });
            }

            if (statsCalculadas.reservasPendientes > 10) {
                alertasDetectadas.push({
                    tipo: 'info',
                    mensaje: `${statsCalculadas.reservasPendientes} reservas pendientes de confirmación`
                });
            }

            setAlertas(alertasDetectadas);
            setUltimaActualizacion(new Date());

        } catch (error) {
            console.error('Error cargando estadísticas:', error);
            setError('No se pudieron cargar las estadísticas del sistema');
            Notifications.error('Error conectando con el servidor', 'Error de Conexión');
        } finally {
            setLoading(false);
        }
    };

    // Cargar datos iniciales
    useEffect(() => {
        loadDashboardStats();

        // Actualizar cada 30 segundos
        const interval = setInterval(loadDashboardStats, 30000);

        return () => clearInterval(interval);
    }, []);

    // Función para refrescar manualmente
    const handleRefresh = async () => {
        Notifications.loading('Actualizando estadísticas...', 'Cargando');
        await loadDashboardStats();
        Notifications.hideLoading();
        Notifications.success('Estadísticas actualizadas correctamente', 'Actualización Completa');
    };

    // Función para generar reporte WhatsApp real
    const handleWhatsAppReport = async () => {
        try {
            Notifications.loading('Generando reporte WhatsApp...', 'Procesando');

            const response = await api.post('/api/magic/reservas/whatsapp-report', {
                fecha: new Date().toISOString().split('T')[0],
                incluir_estadisticas: true
            });

            const mensaje = response.data.mensaje;

            // Copiar al portapapeles
            await navigator.clipboard.writeText(mensaje);

            Notifications.hideLoading();
            Notifications.success('Reporte copiado al portapapeles', 'WhatsApp Listo');

        } catch (error) {
            Notifications.hideLoading();
            Notifications.error('Error generando el reporte', 'Error');
            console.error('Error:', error);
        }
    };

    // Función para ejecutar respaldo real
    const handleBackup = async () => {
        try {
            Notifications.loading('Ejecutando respaldo de la base de datos...', 'Respaldo en Proceso');

            const response = await api.post('/api/magic/sistema/backup');

            Notifications.hideLoading();
            Notifications.success(
                `Respaldo completado: ${response.data.archivo}`,
                'Respaldo Exitoso'
            );

        } catch (error) {
            Notifications.hideLoading();
            Notifications.error('Error ejecutando el respaldo', 'Error de Respaldo');
            console.error('Error:', error);
        }
    };

    // Función para navegar a nueva reserva
    const handleNuevaReserva = () => {
        // Aquí iría la navegación real del router
        window.location.hash = '#/reservas/nueva';
    };

    // Función para navegar a reportes
    const handleReportes = () => {
        // Aquí iría la navegación real del router
        window.location.hash = '#/reportes';
    };

    if (loading && stats.reservasHoy === 0) {
        return e('div', {
            style: {
                padding: '2rem',
                backgroundColor: '#f8fafc',
                minHeight: 'calc(100vh - 64px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }
        }, [
            e('div', {
                key: 'loading',
                style: {
                    textAlign: 'center'
                }
            }, [
                e('div', {
                    key: 'spinner',
                    style: {
                        width: '3rem',
                        height: '3rem',
                        border: '3px solid #e2e8f0',
                        borderTop: '3px solid #3b82f6',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 1rem'
                    }
                }),
                e('p', {
                    key: 'text',
                    style: {
                        color: '#64748b',
                        fontSize: '0.95rem'
                    }
                }, 'Cargando estadísticas del sistema...')
            ])
        ]);
    }

    return e('div', {
        style: {
            padding: '2rem',
            backgroundColor: '#f8fafc',
            minHeight: 'calc(100vh - 64px)'
        }
    }, [
        // Header dinámico con estado de conexión
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
                }, 'Dashboard Magic Travel'),
                e('div', {
                    key: 'subtitle',
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: '#64748b',
                        fontSize: '0.95rem'
                    }
                }, [
                    e('span', { key: 'date' }, `${new Date().toLocaleDateString('es-GT', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}`),
                    ultimaActualizacion && e('span', {
                        key: 'update',
                        style: {
                            color: '#10b981',
                            fontSize: '0.875rem'
                        }
                    }, `• Actualizado: ${ultimaActualizacion.toLocaleTimeString('es-GT', {
                        hour: '2-digit',
                        minute: '2-digit'
                    })}`)
                ])
            ]),
            e('button', {
                key: 'refresh',
                onClick: handleRefresh,
                disabled: loading,
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.5rem',
                    backgroundColor: loading ? '#94a3b8' : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s'
                },
                onMouseEnter: (e) => {
                    if (!loading) {
                        e.currentTarget.style.backgroundColor = '#2563eb';
                    }
                },
                onMouseLeave: (e) => {
                    if (!loading) {
                        e.currentTarget.style.backgroundColor = '#3b82f6';
                    }
                }
            }, [
                e('span', {
                    key: 'refresh-icon',
                    style: {
                        animation: loading ? 'spin 1s linear infinite' : 'none'
                    }
                }, Icons.refresh('#ffffff')),
                e('span', { key: 'refresh-text' }, loading ? 'Actualizando...' : 'Actualizar')
            ])
        ]),

        // Alertas del sistema
        alertas.length > 0 && e('div', {
            key: 'alertas',
            style: {
                marginBottom: '2rem'
            }
        }, alertas.map((alerta, index) =>
            e('div', {
                key: index,
                style: {
                    backgroundColor: alerta.tipo === 'error' ? '#fef2f2' :
                        alerta.tipo === 'warning' ? '#fef3c7' : '#eff6ff',
                    border: `1px solid ${alerta.tipo === 'error' ? '#fecaca' :
                        alerta.tipo === 'warning' ? '#fde68a' : '#dbeafe'}`,
                    color: alerta.tipo === 'error' ? '#dc2626' :
                        alerta.tipo === 'warning' ? '#d97706' : '#2563eb',
                    borderRadius: '0.5rem',
                    padding: '0.75rem 1rem',
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                }
            }, alerta.mensaje)
        )),

        // Grid de estadísticas reales
        e('div', {
            key: 'statsGrid',
            style: {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }
        }, [
            // Tarjeta 1: Reservas Hoy (REAL)
            e('div', {
                key: 'card1',
                style: {
                    backgroundColor: 'white',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
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

            // Tarjeta 2: Pasajeros (REAL)
            e('div', {
                key: 'card2',
                style: {
                    backgroundColor: 'white',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
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

            // Tarjeta 3: Rutas Activas (REAL)
            e('div', {
                key: 'card3',
                style: {
                    backgroundColor: 'white',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
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

            // Tarjeta 4: Ingresos Hoy (REAL)
            e('div', {
                key: 'card4',
                style: {
                    backgroundColor: 'white',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
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

            // Tarjeta 5: Ocupación (REAL con color dinámico)
            e('div', {
                key: 'card5',
                style: {
                    backgroundColor: 'white',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    border: `1px solid ${stats.ocupacion > 85 ? '#fecaca' : '#e2e8f0'}`,
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.2s'
                }
            }, [
                e('div', {
                    key: 'icon5',
                    style: {
                        width: '3rem',
                        height: '3rem',
                        backgroundColor: stats.ocupacion > 85 ? '#fef2f2' : '#fef7ff',
                        borderRadius: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1rem'
                    }
                }, Icons.chartBar(stats.ocupacion > 85 ? '#ef4444' : '#8b5cf6')),
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
                        color: stats.ocupacion > 85 ? '#ef4444' : '#1e293b'
                    }
                }, `${stats.ocupacion}%`)
            ]),

            // Tarjeta 6: Vehículos Disponibles (REAL con color dinámico)
            e('div', {
                key: 'card6',
                style: {
                    backgroundColor: 'white',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    border: `1px solid ${stats.vehiculosDisponibles < 3 ? '#fecaca' : '#e2e8f0'}`,
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.2s'
                }
            }, [
                e('div', {
                    key: 'icon6',
                    style: {
                        width: '3rem',
                        height: '3rem',
                        backgroundColor: stats.vehiculosDisponibles < 3 ? '#fef2f2' : '#f0fdf4',
                        borderRadius: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1rem'
                    }
                }, Icons.truck(stats.vehiculosDisponibles < 3 ? '#ef4444' : '#16a34a')),
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
                        color: stats.vehiculosDisponibles < 3 ? '#ef4444' : '#1e293b'
                    }
                }, stats.vehiculosDisponibles)
            ]),

            // Tarjeta 7: Reservas Pendientes (REAL)
            e('div', {
                key: 'card7',
                style: {
                    backgroundColor: 'white',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
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

            // Tarjeta 8: No Shows (REAL)
            e('div', {
                key: 'card8',
                style: {
                    backgroundColor: 'white',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
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

        // Sección de Acciones Rápidas REALES
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
                // Botón WhatsApp - REAL
                e('div', {
                    key: 'whatsapp',
                    onClick: handleWhatsAppReport,
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
                        }, 'Reporte WhatsApp'),
                        e('p', {
                            key: 'desc',
                            style: {
                                fontSize: '0.875rem',
                                opacity: 0.9
                            }
                        }, 'Generar reporte del día para WhatsApp')
                    ])
                ]),

                // Botón Respaldos - REAL
                e('div', {
                    key: 'backup',
                    onClick: handleBackup,
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
                        }, 'Respaldo de BD'),
                        e('p', {
                            key: 'desc',
                            style: {
                                fontSize: '0.875rem',
                                opacity: 0.9
                            }
                        }, 'Ejecutar respaldo manual del sistema')
                    ])
                ]),

                // Botón Nueva Reserva - NAVEGACIÓN REAL
                e('div', {
                    key: 'newReservation',
                    onClick: handleNuevaReserva,
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
                        }, 'Crear reserva nueva rápidamente')
                    ])
                ]),

                // Botón Reportes - NAVEGACIÓN REAL
                e('div', {
                    key: 'reports',
                    onClick: handleReportes,
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
                        }, 'Generar informes y estadísticas')
                    ])
                ])
            ])
        ])
    ]);
}

export default Dashboard;
