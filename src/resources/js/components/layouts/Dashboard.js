// src/resources/js/components/layouts/Dashboard.js
import React from 'react';
import Icons from '../../utils/Icons';
import apiHelper from '../../utils/apiHelper';
import AuthService from '../../services/auth';
const { createElement: e, useState, useEffect } = React;

function Dashboard({ onNavigate }) {
    const [dashboardData, setDashboardData] = useState({
        kpis: {
            reservas_activas: 0,
            vehiculos_operativos: 0,
            ingresos_totales: 0,
            ocupacion_promedio: 0,
            pasajeros_confirmados: 0,
            rutas_programadas: 0,
            agencias_activas: 0,
            usuarios_sistema: 0,
            reservas_hoy: 0,
            reservas_semana: 0,
            ingresos_semana: 0,
            ticket_promedio: 0,
            porcentaje_ventas_directas: 0
        },
        loading: true,
        error: null
    });

    // Cargar datos del dashboard al montar el componente
    useEffect(() => {
        loadDashboardData();

        // Actualizar datos cada 5 minutos
        const interval = setInterval(() => {
            loadDashboardData();
        }, 300000);

        return () => clearInterval(interval);
    }, []);

    const loadDashboardData = async () => {
        try {
            setDashboardData(prev => ({ ...prev, loading: true, error: null }));

            const response = await apiHelper.get('/estadisticas/dashboard');
            const data = await apiHelper.handleResponse(response);

            setDashboardData(prev => ({
                ...prev,
                kpis: data.resumen_general || prev.kpis,
                loading: false,
                error: null
            }));

        } catch (error) {
            console.error('Error cargando dashboard:', error);

            // Fallback: intentar cargar stats generales
            try {
                const fallbackResponse = await apiHelper.get('/stats-generales');
                const fallbackData = await apiHelper.handleResponse(fallbackResponse);

                setDashboardData(prev => ({
                    ...prev,
                    kpis: {
                        ...prev.kpis,
                        reservas_activas: fallbackData.reservas_hoy || 0,
                        vehiculos_operativos: fallbackData.vehiculos_disponibles || 0,
                        ingresos_totales: fallbackData.ingresos_mes || 0,
                        ocupacion_promedio: fallbackData.ocupacion_promedio || 0
                    },
                    loading: false,
                    error: 'Algunos datos pueden no estar actualizados'
                }));
            } catch (fallbackError) {
                setDashboardData(prev => ({
                    ...prev,
                    loading: false,
                    error: 'No se pudieron cargar los datos del dashboard'
                }));
            }
        }
    };

    const formatCurrency = (value) => {
        if (!value) return 'Q 0.00';
        return `Q ${parseFloat(value).toLocaleString('es-GT', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };

    const formatNumber = (value) => {
        if (!value) return '0';
        return parseInt(value).toLocaleString('es-GT');
    };

    const formatPercentage = (value) => {
        if (!value) return '0%';
        return `${parseFloat(value).toFixed(1)}%`;
    };

    const KPICard = ({ title, value, icon, color = 'blue', formatter = formatNumber, subtitle = null, onClick = null }) => {
        const colorClasses = {
            blue: { bg: '#eff6ff', border: '#dbeafe', text: '#1e40af', icon: '#3b82f6' },
            green: { bg: '#f0fdf4', border: '#dcfce7', text: '#166534', icon: '#22c55e' },
            yellow: { bg: '#fffbeb', border: '#fed7aa', text: '#92400e', icon: '#f59e0b' },
            purple: { bg: '#faf5ff', border: '#e9d5ff', text: '#7c2d12', icon: '#8b5cf6' },
            red: { bg: '#fef2f2', border: '#fecaca', text: '#991b1b', icon: '#ef4444' },
            indigo: { bg: '#f0f9ff', border: '#e0e7ff', text: '#312e81', icon: '#6366f1' }
        };

        const colors = colorClasses[color] || colorClasses.blue;

        return e('div', {
            style: {
                backgroundColor: colors.bg,
                border: `1px solid ${colors.border}`,
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                transition: 'all 0.2s ease',
                cursor: onClick ? 'pointer' : 'default'
            },
            onClick: onClick,
            onMouseEnter: (e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
            },
            onMouseLeave: (e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
            }
        }, [
            e('div', {
                key: 'header',
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }
            }, [
                e('div', {
                    key: 'icon',
                    style: {
                        width: '44px',
                        height: '44px',
                        borderRadius: '10px',
                        backgroundColor: colors.icon,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                    }
                }, icon),
                e('div', {
                    key: 'title',
                    style: {
                        fontSize: '13px',
                        color: colors.text,
                        fontWeight: '600',
                        textAlign: 'right',
                        opacity: 0.8,
                        lineHeight: '1.2'
                    }
                }, title)
            ]),
            e('div', { key: 'content' }, [
                e('div', {
                    key: 'value',
                    style: {
                        fontSize: '28px',
                        fontWeight: '700',
                        color: colors.text,
                        lineHeight: '1.1',
                        marginBottom: subtitle ? '4px' : '0'
                    }
                }, dashboardData.loading ? '...' : formatter(value)),
                subtitle && e('div', {
                    key: 'subtitle',
                    style: {
                        fontSize: '12px',
                        color: colors.text,
                        opacity: 0.6
                    }
                }, subtitle)
            ])
        ]);
    };

    const QuickAccessCard = ({ title, description, icon, color, module, stats = null }) => {
        const colorClasses = {
            blue: { bg: '#eff6ff', border: '#dbeafe', text: '#1e40af', icon: '#3b82f6', button: '#3b82f6' },
            green: { bg: '#f0fdf4', border: '#dcfce7', text: '#166534', icon: '#22c55e', button: '#22c55e' },
            yellow: { bg: '#fffbeb', border: '#fed7aa', text: '#92400e', icon: '#f59e0b', button: '#f59e0b' },
            purple: { bg: '#faf5ff', border: '#e9d5ff', text: '#7c2d12', icon: '#8b5cf6', button: '#8b5cf6' }
        };

        const colors = colorClasses[color] || colorClasses.blue;

        return e('div', {
            style: {
                backgroundColor: colors.bg,
                border: `1px solid ${colors.border}`,
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                minHeight: '180px'
            },
            onClick: () => onNavigate && onNavigate(module),
            onMouseEnter: (e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.15)';
            },
            onMouseLeave: (e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
            }
        }, [
            // Header con icono y título
            e('div', {
                key: 'header',
                style: {
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '16px'
                }
            }, [
                e('div', {
                    key: 'icon',
                    style: {
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        backgroundColor: colors.icon,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        flexShrink: 0
                    }
                }, icon),
                e('div', {
                    key: 'title-section',
                    style: { flex: 1 }
                }, [
                    e('h3', {
                        key: 'title',
                        style: {
                            fontSize: '18px',
                            fontWeight: '700',
                            color: colors.text,
                            margin: '0 0 4px 0',
                            lineHeight: '1.2'
                        }
                    }, title),
                    e('p', {
                        key: 'description',
                        style: {
                            fontSize: '14px',
                            color: colors.text,
                            opacity: 0.7,
                            margin: 0,
                            lineHeight: '1.4'
                        }
                    }, description)
                ])
            ]),

            // Stats si existen
            stats && e('div', {
                key: 'stats',
                style: {
                    display: 'flex',
                    gap: '16px',
                    marginTop: 'auto'
                }
            }, stats.map((stat, index) =>
                e('div', {
                    key: index,
                    style: {
                        flex: 1,
                        textAlign: 'center',
                        padding: '8px',
                        backgroundColor: 'rgba(255,255,255,0.6)',
                        borderRadius: '8px'
                    }
                }, [
                    e('div', {
                        key: 'value',
                        style: {
                            fontSize: '16px',
                            fontWeight: '700',
                            color: colors.text,
                            marginBottom: '2px'
                        }
                    }, stat.value),
                    e('div', {
                        key: 'label',
                        style: {
                            fontSize: '11px',
                            color: colors.text,
                            opacity: 0.6
                        }
                    }, stat.label)
                ])
            )),

            // Botón de acción
            e('div', {
                key: 'action',
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 'auto',
                    paddingTop: '8px'
                }
            }, [
                e('span', {
                    key: 'action-text',
                    style: {
                        fontSize: '14px',
                        color: colors.text,
                        fontWeight: '600',
                        opacity: 0.8
                    }
                }, 'Ir al módulo'),
                Icons.arrowRight(colors.button)
            ])
        ]);
    };

    if (dashboardData.loading) {
        return e('div', {
            style: {
                padding: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '400px'
            }
        }, [
            e('div', {
                key: 'loading',
                style: {
                    textAlign: 'center',
                    color: '#6b7280'
                }
            }, [
                e('div', {
                    key: 'spinner',
                    style: {
                        width: '40px',
                        height: '40px',
                        border: '3px solid #e5e7eb',
                        borderTop: '3px solid #3b82f6',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 16px'
                    }
                }),
                e('p', { key: 'text' }, 'Cargando Dashboard...')
            ])
        ]);
    }

    return e('div', {
        style: {
            padding: '2rem',
            backgroundColor: '#f8fafc',
            minHeight: '100vh'
        }
    }, [
        // Header
        e('div', {
            key: 'header',
            style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem'
            }
        }, [
            e('div', { key: 'title' }, [
                e('h1', {
                    style: {
                        fontSize: '28px',
                        fontWeight: '700',
                        color: '#1f2937',
                        margin: '0 0 4px 0'
                    }
                }, 'Dashboard Magic Travel'),
                e('p', {
                    style: {
                        color: '#6b7280',
                        margin: 0,
                        fontSize: '14px'
                    }
                }, 'Sistema de gestión turística')
            ]),
            e('button', {
                key: 'refresh',
                onClick: () => loadDashboardData(),
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                },
                onMouseEnter: (e) => {
                    e.currentTarget.style.backgroundColor = '#2563eb';
                },
                onMouseLeave: (e) => {
                    e.currentTarget.style.backgroundColor = '#3b82f6';
                }
            }, [
                Icons.refresh(),
                'Actualizar'
            ])
        ]),

        // Error Alert
        dashboardData.error && e('div', {
            key: 'error',
            style: {
                backgroundColor: '#fef3c7',
                border: '1px solid #f59e0b',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '1.5rem',
                color: '#92400e',
                fontSize: '14px'
            }
        }, dashboardData.error),

        // KPI Cards Grid
        e('div', {
            key: 'kpis',
            style: {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }
        }, [
            KPICard({
                title: 'Reservas Activas',
                value: dashboardData.kpis.reservas_activas,
                icon: Icons.calendar(),
                color: 'blue',
                onClick: () => onNavigate && onNavigate('reservaciones')
            }),
            KPICard({
                title: 'Vehículos Operativos',
                value: dashboardData.kpis.vehiculos_operativos,
                icon: Icons.truck(),
                color: 'green',
                onClick: () => onNavigate && onNavigate('vehiculos')
            }),
            KPICard({
                title: 'Ingresos Totales',
                value: dashboardData.kpis.ingresos_totales,
                icon: Icons.dollarSign(),
                color: 'yellow',
                formatter: formatCurrency
            }),
            KPICard({
                title: 'Ocupación Promedio',
                value: dashboardData.kpis.ocupacion_promedio,
                icon: Icons.trendingUp(),
                color: 'purple',
                formatter: formatPercentage
            }),
            KPICard({
                title: 'Pasajeros Confirmados',
                value: dashboardData.kpis.pasajeros_confirmados,
                icon: Icons.users(),
                color: 'indigo'
            }),
            KPICard({
                title: 'Rutas Programadas',
                value: dashboardData.kpis.rutas_programadas,
                icon: Icons.route(),
                color: 'green',
                onClick: () => onNavigate && onNavigate('rutas-activas')
            })
        ]),

        // Secondary KPIs
        e('div', {
            key: 'secondary-kpis',
            style: {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '3rem'
            }
        }, [
            KPICard({
                title: 'Agencias Activas',
                value: dashboardData.kpis.agencias_activas,
                icon: Icons.building(),
                color: 'blue'
            }),
            KPICard({
                title: 'Usuarios Sistema',
                value: dashboardData.kpis.usuarios_sistema,
                icon: Icons.userCheck(),
                color: 'green',
                onClick: () => onNavigate && onNavigate('usuarios-sistema')
            }),
            KPICard({
                title: 'Reservas Hoy',
                value: dashboardData.kpis.reservas_hoy,
                icon: Icons.clock(),
                color: 'yellow'
            }),
            KPICard({
                title: 'Ticket Promedio',
                value: dashboardData.kpis.ticket_promedio,
                icon: Icons.calculator(),
                color: 'purple',
                formatter: formatCurrency
            }),
            KPICard({
                title: 'Ventas Directas',
                value: dashboardData.kpis.porcentaje_ventas_directas,
                icon: Icons.percent(),
                color: 'indigo',
                formatter: formatPercentage
            }),
            KPICard({
                title: 'Ingresos Semana',
                value: dashboardData.kpis.ingresos_semana,
                icon: Icons.dollarSign(),
                color: 'green',
                formatter: formatCurrency
            })
        ]),

        // Quick Access Cards - FILTRADAS POR ROL
        e('div', {
            key: 'quick-access-section',
            style: {
                marginBottom: '2rem'
            }
        }, [
            e('h2', {
                key: 'section-title',
                style: {
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#1f2937',
                    margin: '0 0 1.5rem 0'
                }
            }, 'Acceso Rápido a Módulos'),

            e('div', {
                key: 'quick-access-grid',
                style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '1.5rem'
                }
            }, [
                // Definir todas las tarjetas disponibles
                {
                    module: 'rutas-activas',
                    card: QuickAccessCard({
                        title: 'Rutas Activas',
                        description: 'Gestionar rutas del día y seguimiento en tiempo real',
                        icon: Icons.route(),
                        color: 'blue',
                        module: 'rutas-activas',
                        stats: [
                            { value: formatNumber(dashboardData.kpis.rutas_programadas), label: 'Programadas' },
                            { value: formatNumber(dashboardData.kpis.vehiculos_operativos), label: 'En ruta' }
                        ]
                    })
                },
                {
                    module: 'reservaciones',
                    card: QuickAccessCard({
                        title: 'Reservaciones',
                        description: 'Crear y administrar reservas de clientes',
                        icon: Icons.calendar(),
                        color: 'green',
                        module: 'reservaciones',
                        stats: [
                            { value: formatNumber(dashboardData.kpis.reservas_activas), label: 'Activas' },
                            { value: formatNumber(dashboardData.kpis.reservas_hoy), label: 'Hoy' }
                        ]
                    })
                },
                {
                    module: 'control-flota',
                    card: QuickAccessCard({
                        title: 'Control Flota',
                        description: 'Administrar vehículos y mantenimientos',
                        icon: Icons.truck(),
                        color: 'yellow',
                        module: 'control-flota',
                        stats: [
                            { value: formatNumber(dashboardData.kpis.vehiculos_operativos), label: 'Operativos' },
                            { value: formatPercentage(dashboardData.kpis.ocupacion_promedio), label: 'Ocupación' }
                        ]
                    })
                },
                {
                    module: 'tours-activados',
                    card: QuickAccessCard({
                        title: 'Tours Activados',
                        description: 'Gestionar tours y excursiones programadas',
                        icon: Icons.mapPin(),
                        color: 'purple',
                        module: 'tours-activados',
                        stats: [
                            { value: 'Tours', label: 'Activos' },
                            { value: 'Guías', label: 'Asignados' }
                        ]
                    })
                },
                {
                    module: 'contactos-agencia',
                    card: QuickAccessCard({
                        title: 'Contactos Agencia',
                        description: 'Gestionar contactos y relaciones comerciales',
                        icon: Icons.userGroup(),
                        color: 'blue',
                        module: 'contactos-agencia',
                        stats: [
                            { value: formatNumber(dashboardData.kpis.agencias_activas), label: 'Agencias' },
                            { value: 'Comercial', label: 'Gestión' }
                        ]
                    })
                },
                {
                    module: 'dashboard-ventas',
                    card: QuickAccessCard({
                        title: 'Dashboard Ventas',
                        description: 'Reportes y análisis de ventas y rendimiento',
                        icon: Icons.chartBar(),
                        color: 'green',
                        module: 'dashboard-ventas',
                        stats: [
                            { value: formatCurrency(dashboardData.kpis.ingresos_totales), label: 'Ingresos' },
                            { value: formatPercentage(dashboardData.kpis.porcentaje_ventas_directas), label: 'Directas' }
                        ]
                    })
                },
                {
                    module: 'usuarios-sistema',
                    card: QuickAccessCard({
                        title: 'Usuarios Sistema',
                        description: 'Gestionar usuarios y permisos del sistema',
                        icon: Icons.userCheck(),
                        color: 'purple',
                        module: 'usuarios-sistema',
                        stats: [
                            { value: formatNumber(dashboardData.kpis.usuarios_sistema), label: 'Total' },
                            { value: 'Permisos', label: 'Control' }
                        ]
                    })
                },
                {
                    module: 'empleados',
                    card: QuickAccessCard({
                        title: 'Empleados',
                        description: 'Gestionar personal y información laboral',
                        icon: Icons.users(),
                        color: 'yellow',
                        module: 'empleados',
                        stats: [
                            { value: 'Personal', label: 'Activo' },
                            { value: 'Gestión', label: 'RH' }
                        ]
                    })
                },
                {
                    module: 'rutas-servicios',
                    card: QuickAccessCard({
                        title: 'Rutas y Servicios',
                        description: 'Configurar rutas, servicios y tarifas del sistema',
                        icon: Icons.map(),
                        color: 'blue',
                        module: 'rutas-servicios',
                        stats: [
                            { value: 'Catálogo', label: 'Base' },
                            { value: 'Config', label: 'Sistema' }
                        ]
                    })
                }
            ].filter(item => AuthService.canAccessModule(item.module))
                .map(item => item.card))
        ]),

        // Footer Info
        e('div', {
            key: 'footer',
            style: {
                marginTop: '2rem',
                padding: '1rem',
                backgroundColor: 'white',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                textAlign: 'center',
                color: '#6b7280',
                fontSize: '12px'
            }
        }, [
            'Última actualización: ',
            new Date().toLocaleString('es-GT'),
            ' | Magic Travel Guatemala - Sistema de Gestión Turística'
        ])
    ]);
}

// CSS Animation for loading spinner
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

export default Dashboard;
