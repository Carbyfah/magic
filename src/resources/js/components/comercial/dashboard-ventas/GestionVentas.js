// src/resources/js/components/comercial/dashboard-ventas/GestionVentas.js

import React from 'react';
import Icons from '../../../utils/Icons';
import Notifications from '../../../utils/notifications';
import dashboardVentasConfig, { configGraficos, obtenerColorPorValor } from './dasboardVentasConfig';
import apiHelper from '../../../utils/apiHelper';

const { createElement: e, useState, useEffect, useRef } = React;

function GestionVentas() {
    // Estados principales
    const [metricas, setMetricas] = useState({});
    const [graficos, setGraficos] = useState({
        ventasPorDia: [],
        reservasPorEstado: [],
        ventasPorAgencia: []
    });
    const [rankings, setRankings] = useState({
        vendedores: [],
        rutas: []
    });
    const [loading, setLoading] = useState(true);
    const [ultimaActualizacion, setUltimaActualizacion] = useState(null);
    const [filtroSeleccionado, setFiltroSeleccionado] = useState('hoy');

    // Referencias para gráficos
    const chartRefs = useRef({});
    const intervaloRef = useRef(null);

    // Efectos
    useEffect(() => {
        cargarDashboard();

        // Auto-refresh
        if (dashboardVentasConfig.actualizacion.habilitarAutoRefresh) {
            intervaloRef.current = setInterval(() => {
                cargarDashboard(true);
            }, dashboardVentasConfig.actualizacion.intervaloAutomatico);
        }

        return () => {
            if (intervaloRef.current) {
                clearInterval(intervaloRef.current);
            }
            // Limpiar gráficos de Chart.js
            Object.values(chartRefs.current).forEach(chart => {
                if (chart && typeof chart.destroy === 'function') {
                    chart.destroy();
                }
            });
        };
    }, []);

    // Cargar todos los datos del dashboard
    const cargarDashboard = async (silencioso = false) => {
        try {
            if (!silencioso) setLoading(true);

            const [
                metricasRes,
                ventasDiaRes,
                reservasEstadoRes,
                ventasAgenciaRes,
                vendedoresRes,
                rutasRes
            ] = await Promise.all([
                apiHelper.get('/dashboard/ventas/metricas'),
                apiHelper.get('/dashboard/ventas/ventas-por-dia'),
                apiHelper.get('/dashboard/ventas/reservas-por-estado'),
                apiHelper.get('/dashboard/ventas/ventas-por-agencia'),
                apiHelper.get('/dashboard/ventas/top-vendedores'),
                apiHelper.get('/dashboard/ventas/rutas-mas-vendidas')
            ]);

            // Procesar métricas
            try {
                const metricasData = await apiHelper.handleResponse(metricasRes);
                setMetricas(metricasData);
                setUltimaActualizacion(new Date().toLocaleString('es-GT'));
            } catch (error) {
                console.error('Error en métricas:', error);
            }

            // Procesar ventas por día
            try {
                const ventasData = await apiHelper.handleResponse(ventasDiaRes);
                setGraficos(prev => ({ ...prev, ventasPorDia: ventasData.datos || [] }));
            } catch (error) {
                console.error('Error en ventas por día:', error);
            }

            // Procesar reservas por estado
            try {
                const reservasData = await apiHelper.handleResponse(reservasEstadoRes);
                setGraficos(prev => ({ ...prev, reservasPorEstado: reservasData.datos || [] }));
            } catch (error) {
                console.error('Error en reservas por estado:', error);
            }

            // Procesar ventas por agencia
            try {
                const agenciaData = await apiHelper.handleResponse(ventasAgenciaRes);
                setGraficos(prev => ({ ...prev, ventasPorAgencia: agenciaData.datos || [] }));
            } catch (error) {
                console.error('Error en ventas por agencia:', error);
            }

            // Procesar vendedores
            try {
                const vendedoresData = await apiHelper.handleResponse(vendedoresRes);
                setRankings(prev => ({ ...prev, vendedores: vendedoresData.datos || [] }));
            } catch (error) {
                console.error('Error en vendedores:', error);
            }

            // Procesar rutas
            try {
                const rutasData = await apiHelper.handleResponse(rutasRes);
                setRankings(prev => ({ ...prev, rutas: rutasData.datos || [] }));
            } catch (error) {
                console.error('Error en rutas:', error);
            }

            if (!silencioso) {
                Notifications.success('Dashboard actualizado correctamente');
            }

        } catch (error) {
            console.error('Error cargando dashboard:', error);
            if (!silencioso) {
                Notifications.error('Error al cargar el dashboard');
            }
        } finally {
            setLoading(false);
        }
    };

    // Renderizar KPI individual
    const renderizarKPI = (kpiKey, config) => {
        const valor = metricas[config.campo] || 0;
        const valorFormateado = dashboardVentasConfig.formateadores[config.formato](valor);

        return e('div', {
            key: kpiKey,
            style: {
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: `3px solid ${dashboardVentasConfig.colores[config.color] || dashboardVentasConfig.colores.primario}`
            }
        }, [
            e('div', {
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.5rem'
                }
            }, [
                e('h3', {
                    style: {
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: '#6b7280',
                        margin: 0
                    }
                }, config.titulo),

                Icons[config.icono] ? Icons[config.icono](dashboardVentasConfig.colores[config.color]) : null
            ]),

            e('div', {
                style: {
                    fontSize: '2rem',
                    fontWeight: '700',
                    color: '#111827',
                    marginBottom: '0.5rem'
                }
            }, valorFormateado),

            e('p', {
                style: {
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    margin: 0
                }
            }, config.descripcion)
        ]);
    };

    // Renderizar gráfico simple (sin Chart.js por simplicidad)
    const renderizarGraficoSimple = (tipo, datos, titulo) => {
        if (!datos || datos.length === 0) {
            return e('div', {
                style: {
                    backgroundColor: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    textAlign: 'center',
                    color: '#6b7280'
                }
            }, 'Sin datos disponibles');
        }

        return e('div', {
            style: {
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }
        }, [
            e('h3', {
                style: {
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    marginBottom: '1rem',
                    color: '#111827'
                }
            }, titulo),

            // Gráfico simplificado con barras CSS
            e('div', {
                style: { display: 'flex', flexDirection: 'column', gap: '0.5rem' }
            }, datos.slice(0, 5).map((item, index) => {
                const maxValor = Math.max(...datos.map(d => d.cantidad || d.total || 0));
                const porcentaje = ((item.cantidad || item.total || 0) / maxValor) * 100;

                return e('div', {
                    key: index,
                    style: { display: 'flex', alignItems: 'center', gap: '0.5rem' }
                }, [
                    e('div', {
                        style: {
                            minWidth: '80px',
                            fontSize: '0.75rem',
                            color: '#6b7280',
                            textAlign: 'right'
                        }
                    }, item.estado || item.tipo || item.fecha),

                    e('div', {
                        style: {
                            flex: 1,
                            height: '20px',
                            backgroundColor: '#f3f4f6',
                            borderRadius: '10px',
                            overflow: 'hidden'
                        }
                    }, [
                        e('div', {
                            style: {
                                width: `${porcentaje}%`,
                                height: '100%',
                                backgroundColor: dashboardVentasConfig.colores.primario,
                                borderRadius: '10px',
                                transition: 'width 0.3s ease'
                            }
                        })
                    ]),

                    e('div', {
                        style: {
                            minWidth: '60px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            color: '#111827'
                        }
                    }, item.cantidad || dashboardVentasConfig.formateadores.moneda(item.total || item.monto || 0))
                ]);
            }))
        ]);
    };

    // Renderizar tabla de ranking
    const renderizarRanking = (tipo, config) => {
        const datos = rankings[tipo] || [];

        if (datos.length === 0) {
            return e('div', {
                style: {
                    backgroundColor: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    textAlign: 'center',
                    color: '#6b7280'
                }
            }, 'Sin datos disponibles');
        }

        return e('div', {
            style: {
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }
        }, [
            e('h3', {
                style: {
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    marginBottom: '1rem',
                    color: '#111827'
                }
            }, config.titulo),

            e('div', {
                style: { display: 'flex', flexDirection: 'column', gap: '0.75rem' }
            }, datos.map((item, index) =>
                e('div', {
                    key: index,
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0.75rem',
                        backgroundColor: index < 3 ? '#f8fafc' : 'transparent',
                        borderRadius: '8px',
                        border: index < 3 ? '1px solid #e2e8f0' : 'none'
                    }
                }, [
                    e('div', {
                        style: {
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: index === 0 ? '#ffd700' :
                                index === 1 ? '#c0c0c0' :
                                    index === 2 ? '#cd7f32' :
                                        dashboardVentasConfig.colores.neutro,
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            marginRight: '0.75rem'
                        }
                    }, item.posicion),

                    e('div', {
                        style: { flex: 1 }
                    }, [
                        e('div', {
                            style: {
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#111827'
                            }
                        }, item.vendedor || item.ruta),

                        e('div', {
                            style: {
                                fontSize: '0.75rem',
                                color: '#6b7280',
                                display: 'flex',
                                gap: '1rem'
                            }
                        }, [
                            `${item.reservas} reservas`,
                            dashboardVentasConfig.formateadores.moneda(item.ventas || item.ingresos)
                        ])
                    ])
                ])
            ))
        ]);
    };

    return e('div', {
        style: { padding: '1.5rem', minHeight: '100vh', backgroundColor: '#f8fafc' }
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
            e('div', {}, [
                e('h1', {
                    style: {
                        fontSize: '2rem',
                        fontWeight: '700',
                        color: '#111827',
                        margin: 0
                    }
                }, 'Dashboard de Ventas'),

                ultimaActualizacion && e('p', {
                    style: {
                        color: '#6b7280',
                        fontSize: '0.875rem',
                        margin: '0.25rem 0 0 0'
                    }
                }, `Última actualización: ${ultimaActualizacion}`)
            ]),

            e('button', {
                onClick: () => cargarDashboard(),
                disabled: loading,
                style: {
                    padding: '0.75rem 1.5rem',
                    backgroundColor: loading ? '#9ca3af' : dashboardVentasConfig.colores.primario,
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }
            }, [
                Icons.refreshCw('#ffffff'),
                loading ? 'Actualizando...' : 'Actualizar'
            ])
        ]),

        loading && e('div', {
            key: 'loading',
            style: {
                backgroundColor: 'white',
                padding: '3rem',
                borderRadius: '12px',
                textAlign: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }
        }, dashboardVentasConfig.mensajes.cargando),

        !loading && e('div', {
            key: 'dashboard-content'
        }, [
            // KPIs Row
            e('div', {
                key: 'kpis',
                style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '2rem'
                }
            }, Object.entries(dashboardVentasConfig.kpis).map(([key, config]) =>
                renderizarKPI(key, config)
            )),

            // Gráficos Row
            e('div', {
                key: 'graficos',
                style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '2rem'
                }
            }, [
                renderizarGraficoSimple(
                    'reservasPorEstado',
                    graficos.reservasPorEstado,
                    'Distribución por Estado'
                ),

                renderizarGraficoSimple(
                    'ventasPorAgencia',
                    graficos.ventasPorAgencia,
                    'Ventas por Canal'
                )
            ]),

            // Rankings Row
            e('div', {
                key: 'rankings',
                style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '1.5rem'
                }
            }, [
                renderizarRanking('vendedores', dashboardVentasConfig.rankings.vendedores),
                renderizarRanking('rutas', dashboardVentasConfig.rankings.rutas)
            ])
        ])
    ]);
}

export default GestionVentas;
