// src/resources/js/components/reportes/estadisticas/GestionEstadisticas.js

import React from 'react';
import Icons from '../../../utils/Icons';
import Notifications from '../../../utils/notifications';

const { createElement: e, useState, useEffect, useRef } = React;

// CONFIGURACIÓN DIRECTA SINCRONIZADA CON EL BACKEND
const estadisticasConfig = {
    // Endpoints
    endpoints: {
        dashboard: '/api/magic/estadisticas/dashboard',
        graficoDashboard: '/api/magic/estadisticas/grafico-dashboard',
        graficoIngresosDiarios: '/api/magic/estadisticas/grafico-ingresos-diarios',
        graficoOcupacionVehiculos: '/api/magic/estadisticas/grafico-ocupacion-vehiculos',
        graficoReservasPorEstado: '/api/magic/estadisticas/grafico-reservas-por-estado',
        graficoVentasPorAgencia: '/api/magic/estadisticas/grafico-ventas-por-agencia',
        graficoTopRutas: '/api/magic/estadisticas/grafico-top-rutas'
    },

    // MÉTRICAS SINCRONIZADAS CON CAMPOS DEL BACKEND
    metricas: {
        reservasActivas: {
            titulo: 'Reservas Activas',
            campo: 'reservas_activas',
            formato: 'numero',
            color: 'azul',
            icono: 'calendar-plus',
            descripcion: 'Total de reservas activas en el sistema'
        },
        pasajerosConfirmados: {
            titulo: 'Pasajeros Confirmados',
            campo: 'pasajeros_confirmados',
            formato: 'numero',
            color: 'verde',
            icono: 'users',
            descripcion: 'Total de pasajeros confirmados'
        },
        vehiculosOperativos: {
            titulo: 'Vehículos Operativos',
            campo: 'vehiculos_operativos',
            formato: 'numero',
            color: 'naranja',
            icono: 'truck',
            descripcion: 'Vehículos disponibles para operar'
        },
        rutasProgramadas: {
            titulo: 'Rutas Programadas',
            campo: 'rutas_programadas',
            formato: 'numero',
            color: 'morado',
            icono: 'route',
            descripcion: 'Rutas programadas en el sistema'
        },
        ingresosTotales: {
            titulo: 'Ingresos Totales',
            campo: 'ingresos_totales',
            formato: 'moneda',
            color: 'verde',
            icono: 'dollar-sign',
            descripcion: 'Ingresos totales del sistema'
        },
        ticketPromedio: {
            titulo: 'Ticket Promedio',
            campo: 'ticket_promedio',
            formato: 'moneda',
            color: 'info',
            icono: 'trending-up',
            descripcion: 'Precio promedio por reserva'
        },
        ocupacionPromedio: {
            titulo: 'Ocupación Promedio',
            campo: 'ocupacion_promedio',
            formato: 'porcentaje',
            color: 'terciario',
            icono: 'percent',
            descripcion: 'Porcentaje promedio de ocupación de vehículos'
        },
        ventasDirectas: {
            titulo: 'Ventas Directas',
            campo: 'porcentaje_ventas_directas',
            formato: 'porcentaje',
            color: 'secundario',
            icono: 'user-check',
            descripcion: 'Porcentaje de ventas directas vs agencias'
        }
    },

    // GRÁFICOS CON CONFIGURACIÓN CHART.JS
    graficos: {
        dashboard: {
            titulo: 'Métricas Principales',
            endpoint: 'graficoDashboard',
            descripcion: 'Resumen de KPIs del sistema',
            canvasId: 'chart-dashboard',
            parametros: {}
        },
        ingresosDiarios: {
            titulo: 'Ingresos Diarios',
            endpoint: 'graficoIngresosDiarios',
            descripcion: 'Tendencia de ingresos por día',
            canvasId: 'chart-ingresos-diarios',
            parametros: {
                dias: {
                    label: 'Días a mostrar',
                    tipo: 'select',
                    opciones: [
                        { value: 7, label: '7 días' },
                        { value: 15, label: '15 días' },
                        { value: 30, label: '30 días' },
                        { value: 60, label: '60 días' }
                    ],
                    default: 30
                }
            }
        },
        ocupacionVehiculos: {
            titulo: 'Ocupación de Vehículos',
            endpoint: 'graficoOcupacionVehiculos',
            descripcion: 'Porcentaje de ocupación por vehículo',
            canvasId: 'chart-ocupacion-vehiculos',
            parametros: {
                fecha: {
                    label: 'Fecha',
                    tipo: 'date',
                    default: 'hoy'
                }
            }
        },
        reservasPorEstado: {
            titulo: 'Distribución por Estado',
            endpoint: 'graficoReservasPorEstado',
            descripcion: 'Gráfico circular de reservas por estado',
            canvasId: 'chart-reservas-estado',
            parametros: {
                fecha_inicio: {
                    label: 'Fecha inicio',
                    tipo: 'date',
                    default: '-30d'
                },
                fecha_fin: {
                    label: 'Fecha fin',
                    tipo: 'date',
                    default: 'hoy'
                }
            }
        },
        ventasPorAgencia: {
            titulo: 'Ventas por Agencia vs Directas',
            endpoint: 'graficoVentasPorAgencia',
            descripcion: 'Comparativo de ventas por canal',
            canvasId: 'chart-ventas-agencia',
            parametros: {
                fecha_inicio: {
                    label: 'Fecha inicio',
                    tipo: 'date',
                    default: '-30d'
                },
                fecha_fin: {
                    label: 'Fecha fin',
                    tipo: 'date',
                    default: 'hoy'
                }
            }
        },
        topRutas: {
            titulo: 'Top Rutas Más Rentables',
            endpoint: 'graficoTopRutas',
            descripcion: 'Ranking de rutas por ingresos',
            canvasId: 'chart-top-rutas',
            parametros: {
                limite: {
                    label: 'Cantidad a mostrar',
                    tipo: 'select',
                    opciones: [
                        { value: 5, label: 'Top 5' },
                        { value: 8, label: 'Top 8' },
                        { value: 10, label: 'Top 10' },
                        { value: 15, label: 'Top 15' }
                    ],
                    default: 8
                },
                fecha_inicio: {
                    label: 'Fecha inicio',
                    tipo: 'date',
                    default: '-30d'
                },
                fecha_fin: {
                    label: 'Fecha fin',
                    tipo: 'date',
                    default: 'hoy'
                }
            }
        }
    },

    // COLORES DEL SISTEMA
    colores: {
        primario: '#3b82f6',
        secundario: '#10b981',
        terciario: '#f59e0b',
        peligro: '#ef4444',
        info: '#8b5cf6',
        exito: '#10b981',
        advertencia: '#f59e0b',
        neutro: '#6b7280',
        azul: '#3b82f6',
        verde: '#10b981',
        naranja: '#f59e0b',
        morado: '#8b5cf6'
    },

    // LAYOUT
    layout: {
        dashboard: { altura: '400px' },
        ingresosDiarios: { altura: '400px' },
        ocupacionVehiculos: { altura: '400px' },
        reservasPorEstado: { altura: '350px' },
        ventasPorAgencia: { altura: '350px' },
        topRutas: { altura: '350px' }
    },

    // FORMATEADORES
    formateadores: {
        moneda: (value) => {
            return 'Q ' + parseFloat(value || 0).toLocaleString('es-GT', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        },
        numero: (value) => {
            return parseInt(value || 0).toLocaleString('es-GT');
        },
        porcentaje: (value) => {
            return parseFloat(value || 0).toFixed(1) + '%';
        }
    },

    // MENSAJES
    mensajes: {
        cargando: 'Generando gráfico estadístico...'
    },

    // ACTUALIZACIÓN
    actualizacion: {
        intervaloAutomatico: 300000,
        habilitarAutoRefresh: true
    },

    // HELPERS PARA CHART.JS
    helpers: {
        destruirGrafico: (instancia) => {
            if (instancia && typeof instancia.destroy === 'function') {
                instancia.destroy();
            }
        },
        crearGrafico: (canvasId, configuracion) => {
            try {
                const canvas = document.getElementById(canvasId);
                if (!canvas) {
                    console.error(`Canvas con ID ${canvasId} no encontrado`);
                    return null;
                }

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    console.error(`No se pudo obtener contexto 2D del canvas ${canvasId}`);
                    return null;
                }

                if (typeof Chart === 'undefined') {
                    console.error('Chart.js no está cargado');
                    return null;
                }

                // REGISTRAR EL PLUGIN DE DATALABELS
                if (typeof ChartDataLabels !== 'undefined') {
                    Chart.register(ChartDataLabels);
                }

                // AGREGAR CONFIGURACIÓN DE DATALABELS AL GRÁFICO DASHBOARD
                if (canvasId === 'chart-dashboard' && configuracion.options) {
                    configuracion.options.plugins = configuracion.options.plugins || {};
                    configuracion.options.plugins.datalabels = {
                        display: true,
                        anchor: 'end',
                        align: 'top',
                        formatter: function (value, context) {
                            // Si es la barra de ingresos (índice 3), agregar Q
                            if (context.dataIndex === 3) {
                                return 'Q' + value;
                            }
                            return value;
                        },
                        font: {
                            weight: 'bold',
                            size: 12
                        },
                        color: '#374151'
                    };
                }

                return new Chart(ctx, configuracion);
            } catch (error) {
                console.error(`Error creando gráfico ${canvasId}:`, error);
                return null;
            }
        }
    },

    // EXPORTACIÓN
    exportacion: {
        nombreArchivo: {
            prefijo: 'estadisticas_magic_travel'
        }
    }
};

// HELPER FUNCTIONS
const construirUrlGrafico = (tipoGrafico, parametros = {}) => {
    const config = estadisticasConfig.graficos[tipoGrafico];
    if (!config) return null;

    let url = estadisticasConfig.endpoints[config.endpoint];
    const params = new URLSearchParams();

    Object.keys(parametros).forEach(key => {
        let valor = parametros[key];

        if (valor === 'hoy') {
            valor = new Date().toISOString().split('T')[0];
        } else if (typeof valor === 'string' && valor.startsWith('-')) {
            const dias = parseInt(valor.replace(/[^\d]/g, ''));
            const fecha = new Date();
            fecha.setDate(fecha.getDate() - dias);
            valor = fecha.toISOString().split('T')[0];
        }

        if (valor) {
            params.append(key, valor);
        }
    });

    if (params.toString()) {
        url += '?' + params.toString();
    }

    return url;
};

const obtenerConfigGrafico = (tipo) => {
    return estadisticasConfig.graficos[tipo] || null;
};

const formatearValor = (valor, tipo) => {
    const formateador = estadisticasConfig.formateadores[tipo];
    return formateador ? formateador(valor) : valor;
};

function GestionEstadisticas() {
    // Estados principales
    const [datosGenerales, setDatosGenerales] = useState({});
    const [instanciasGraficos, setInstanciasGraficos] = useState({
        dashboard: null,
        ingresosDiarios: null,
        ocupacionVehiculos: null,
        reservasPorEstado: null,
        ventasPorAgencia: null,
        topRutas: null
    });
    const [parametros, setParametros] = useState({
        ingresosDiarios: { dias: 30 },
        ocupacionVehiculos: { fecha: 'hoy' },
        reservasPorEstado: { fecha_inicio: '-30d', fecha_fin: 'hoy' },
        ventasPorAgencia: { fecha_inicio: '-30d', fecha_fin: 'hoy' },
        topRutas: { limite: 8, fecha_inicio: '-30d', fecha_fin: 'hoy' }
    });
    const [loading, setLoading] = useState(true);
    const [loadingGraficos, setLoadingGraficos] = useState({});
    const [ultimaActualizacion, setUltimaActualizacion] = useState(null);
    const [erroresGraficos, setErroresGraficos] = useState({});

    // Referencias
    const intervaloRef = useRef(null);

    // Verificar que Chart.js esté disponible
    const verificarChartJS = () => {
        if (typeof Chart === 'undefined') {
            console.error('Chart.js no está cargado. Agregando script...');

            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
            script.onload = () => {
                console.log('Chart.js cargado exitosamente');
                cargarTodosLosGraficos();
            };
            script.onerror = () => {
                console.error('Error cargando Chart.js');
                Notifications.error('Error cargando librería de gráficos. Recargue la página.');
            };
            document.head.appendChild(script);
            return false;
        }
        return true;
    };

    // Efectos
    useEffect(() => {
        cargarDashboardGeneral();

        if (estadisticasConfig.actualizacion.habilitarAutoRefresh) {
            intervaloRef.current = setInterval(() => {
                cargarDashboardGeneral(true);
            }, estadisticasConfig.actualizacion.intervaloAutomatico);
        }

        return () => {
            if (intervaloRef.current) {
                clearInterval(intervaloRef.current);
            }
            Object.values(instanciasGraficos).forEach(instancia => {
                estadisticasConfig.helpers.destruirGrafico(instancia);
            });
        };
    }, []);

    useEffect(() => {
        if (!loading && Object.keys(datosGenerales).length > 0) {
            const timer = setTimeout(() => {
                if (verificarChartJS()) {
                    cargarTodosLosGraficos();
                }
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [loading, datosGenerales]);

    // Cargar datos generales del dashboard
    const cargarDashboardGeneral = async (silencioso = false) => {
        try {
            if (!silencioso) setLoading(true);

            const response = await fetch(estadisticasConfig.endpoints.dashboard);

            if (response.ok) {
                const data = await response.json();
                setDatosGenerales(data.resumen_general || {});
                setUltimaActualizacion(new Date().toLocaleString('es-GT'));

                if (!silencioso) {
                    Notifications.success('Datos generales actualizados');
                }
            } else {
                throw new Error('Error al cargar datos generales');
            }

        } catch (error) {
            console.error('Error cargando dashboard general:', error);
            if (!silencioso) {
                Notifications.error('Error al cargar datos generales');
            }
        } finally {
            setLoading(false);
        }
    };

    // Cargar todos los gráficos
    const cargarTodosLosGraficos = async () => {
        const tipos = ['dashboard', 'ingresosDiarios', 'ocupacionVehiculos', 'reservasPorEstado', 'ventasPorAgencia', 'topRutas'];

        for (const tipo of tipos) {
            await cargarGrafico(tipo, true);
        }
    };

    // Cargar gráfico individual
    const cargarGrafico = async (tipo, silencioso = false) => {
        try {
            setLoadingGraficos(prev => ({ ...prev, [tipo]: true }));
            setErroresGraficos(prev => ({ ...prev, [tipo]: null }));

            const url = construirUrlGrafico(tipo, parametros[tipo] || {});
            if (!url) {
                throw new Error(`Configuración no encontrada para gráfico: ${tipo}`);
            }

            const response = await fetch(url);

            if (response.ok) {
                const datosGrafico = await response.json();

                if (!datosGrafico || !datosGrafico.data) {
                    throw new Error('Datos del gráfico inválidos');
                }

                await crearActualizarGrafico(tipo, datosGrafico);

                if (!silencioso) {
                    Notifications.success(`Gráfico ${obtenerConfigGrafico(tipo)?.titulo || tipo} actualizado`);
                }
            } else {
                const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
                throw new Error(`Error ${response.status}: ${errorData.message || response.statusText}`);
            }

        } catch (error) {
            console.error(`Error cargando gráfico ${tipo}:`, error);
            setErroresGraficos(prev => ({ ...prev, [tipo]: error.message }));

            if (!silencioso) {
                Notifications.error(`Error al cargar gráfico: ${error.message}`);
            }
        } finally {
            setLoadingGraficos(prev => ({ ...prev, [tipo]: false }));
        }
    };

    // Crear o actualizar gráfico Chart.js
    const crearActualizarGrafico = async (tipo, datosGrafico) => {
        const config = obtenerConfigGrafico(tipo);
        if (!config || !config.canvasId) return;

        try {
            if (instanciasGraficos[tipo]) {
                estadisticasConfig.helpers.destruirGrafico(instanciasGraficos[tipo]);
            }

            let canvas = null;
            let intentos = 0;
            const maxIntentos = 10;

            while (!canvas && intentos < maxIntentos) {
                canvas = document.getElementById(config.canvasId);
                if (!canvas) {
                    console.log(`Intento ${intentos + 1}: Canvas ${config.canvasId} no encontrado, esperando...`);
                    await new Promise(resolve => setTimeout(resolve, 200));
                    intentos++;
                } else {
                    console.log(`Canvas ${config.canvasId} encontrado en intento ${intentos + 1}`);
                    break;
                }
            }

            if (!canvas) {
                console.error(`Canvas ${config.canvasId} no encontrado después de ${maxIntentos} intentos`);
                throw new Error(`Canvas ${config.canvasId} no encontrado`);
            }

            const nuevaInstancia = estadisticasConfig.helpers.crearGrafico(config.canvasId, datosGrafico);

            if (nuevaInstancia) {
                setInstanciasGraficos(prev => ({
                    ...prev,
                    [tipo]: nuevaInstancia
                }));
                console.log(`Gráfico ${tipo} creado exitosamente`);
            } else {
                throw new Error('No se pudo crear la instancia del gráfico');
            }

        } catch (error) {
            console.error(`Error creando gráfico ${tipo}:`, error);
            throw error;
        }
    };

    // Actualizar parámetro de gráfico
    const actualizarParametro = (tipoGrafico, parametro, valor) => {
        setParametros(prev => ({
            ...prev,
            [tipoGrafico]: {
                ...prev[tipoGrafico],
                [parametro]: valor
            }
        }));
    };

    // Aplicar parámetros y recargar gráfico
    const aplicarParametros = (tipoGrafico) => {
        cargarGrafico(tipoGrafico);
    };

    // Descargar gráfico
    const descargarGrafico = (tipo) => {
        const instancia = instanciasGraficos[tipo];
        if (!instancia) {
            Notifications.error('Gráfico no disponible para descargar');
            return;
        }

        try {
            const config = obtenerConfigGrafico(tipo);
            const nombreArchivo = `${estadisticasConfig.exportacion.nombreArchivo.prefijo}_${tipo}_${new Date().toISOString().split('T')[0]}.png`;

            const canvas = instancia.canvas;
            const url = canvas.toDataURL('image/png');

            const link = document.createElement('a');
            link.href = url;
            link.download = nombreArchivo;
            link.click();

            Notifications.success(`Gráfico ${config?.titulo || tipo} descargado`);
        } catch (error) {
            console.error('Error descargando gráfico:', error);
            Notifications.error('Error al descargar el gráfico');
        }
    };

    // Renderizar métrica individual
    const renderizarMetrica = (metricaKey, config) => {
        const valor = datosGenerales[config.campo] || 0;
        const valorFormateado = formatearValor(valor, config.formato);

        return e('div', {
            key: metricaKey,
            style: {
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: `3px solid ${estadisticasConfig.colores[config.color] || estadisticasConfig.colores.primario}`
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

                Icons[config.icono] ? Icons[config.icono](estadisticasConfig.colores[config.color]) : null
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

    // Renderizar controles de parámetros
    const renderizarControles = (tipoGrafico) => {
        const config = obtenerConfigGrafico(tipoGrafico);
        if (!config || !config.parametros) return null;

        return e('div', {
            style: {
                backgroundColor: '#f8fafc',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                border: '1px solid #e2e8f0'
            }
        }, [
            e('h4', {
                style: {
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#374151',
                    margin: '0 0 0.5rem 0'
                }
            }, 'Configuración'),

            e('div', {
                style: {
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    alignItems: 'end'
                }
            }, [
                ...Object.entries(config.parametros).map(([param, paramConfig]) => {
                    const valorActual = parametros[tipoGrafico]?.[param] || paramConfig.default;

                    if (paramConfig.tipo === 'select') {
                        return e('div', {
                            key: param,
                            style: { display: 'flex', flexDirection: 'column', gap: '0.25rem' }
                        }, [
                            e('label', {
                                style: { fontSize: '0.75rem', color: '#6b7280', fontWeight: '500' }
                            }, paramConfig.label),

                            e('select', {
                                value: valorActual,
                                onChange: (event) => actualizarParametro(tipoGrafico, param, event.target.value),
                                style: {
                                    padding: '0.5rem',
                                    borderRadius: '6px',
                                    border: '1px solid #d1d5db',
                                    fontSize: '0.875rem',
                                    backgroundColor: 'white'
                                }
                            }, paramConfig.opciones.map(opcion =>
                                e('option', {
                                    key: opcion.value,
                                    value: opcion.value
                                }, opcion.label)
                            ))
                        ]);
                    }

                    if (paramConfig.tipo === 'date') {
                        let fechaParaMostrar = valorActual;
                        if (valorActual === 'hoy') {
                            fechaParaMostrar = new Date().toISOString().split('T')[0];
                        } else if (typeof valorActual === 'string' && valorActual.startsWith('-')) {
                            const dias = parseInt(valorActual.replace(/[^\d]/g, ''));
                            const fecha = new Date();
                            fecha.setDate(fecha.getDate() - dias);
                            fechaParaMostrar = fecha.toISOString().split('T')[0];
                        }

                        return e('div', {
                            key: param,
                            style: { display: 'flex', flexDirection: 'column', gap: '0.25rem' }
                        }, [
                            e('label', {
                                style: { fontSize: '0.75rem', color: '#6b7280', fontWeight: '500' }
                            }, paramConfig.label),

                            e('input', {
                                type: 'date',
                                value: fechaParaMostrar,
                                onChange: (event) => actualizarParametro(tipoGrafico, param, event.target.value),
                                style: {
                                    padding: '0.5rem',
                                    borderRadius: '6px',
                                    border: '1px solid #d1d5db',
                                    fontSize: '0.875rem',
                                    backgroundColor: 'white'
                                }
                            })
                        ]);
                    }

                    return null;
                }),

                e('button', {
                    onClick: () => aplicarParametros(tipoGrafico),
                    disabled: loadingGraficos[tipoGrafico],
                    style: {
                        padding: '0.5rem 1rem',
                        backgroundColor: loadingGraficos[tipoGrafico] ? '#9ca3af' : estadisticasConfig.colores.primario,
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        cursor: loadingGraficos[tipoGrafico] ? 'not-allowed' : 'pointer'
                    }
                }, loadingGraficos[tipoGrafico] ? 'Aplicando...' : 'Aplicar')
            ])
        ]);
    };

    // Renderizar gráfico
    const renderizarGrafico = (tipo, config) => {
        const cargando = loadingGraficos[tipo];
        const error = erroresGraficos[tipo];
        const altura = estadisticasConfig.layout[tipo]?.altura || '350px';

        return e('div', {
            key: tipo,
            style: {
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                overflow: 'hidden'
            }
        }, [
            // Header del gráfico
            e('div', {
                style: {
                    padding: '1.5rem 1.5rem 0.5rem 1.5rem',
                    borderBottom: '1px solid #e5e7eb'
                }
            }, [
                e('div', {
                    style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.5rem'
                    }
                }, [
                    e('h3', {
                        style: {
                            fontSize: '1.125rem',
                            fontWeight: '600',
                            color: '#111827',
                            margin: 0
                        }
                    }, config.titulo),

                    e('div', {
                        style: { display: 'flex', gap: '0.5rem' }
                    }, [
                        e('button', {
                            onClick: () => cargarGrafico(tipo),
                            disabled: cargando,
                            title: 'Actualizar gráfico',
                            style: {
                                padding: '0.5rem',
                                backgroundColor: 'transparent',
                                color: estadisticasConfig.colores.primario,
                                border: `1px solid ${estadisticasConfig.colores.primario}`,
                                borderRadius: '6px',
                                cursor: cargando ? 'not-allowed' : 'pointer',
                                opacity: cargando ? 0.5 : 1
                            }
                        }, Icons.refreshCw('#3b82f6')),

                        instanciasGraficos[tipo] && !error && e('button', {
                            onClick: () => descargarGrafico(tipo),
                            title: 'Descargar gráfico',
                            style: {
                                padding: '0.5rem',
                                backgroundColor: 'transparent',
                                color: estadisticasConfig.colores.secundario,
                                border: `1px solid ${estadisticasConfig.colores.secundario}`,
                                borderRadius: '6px',
                                cursor: 'pointer'
                            }
                        }, Icons.download('#10b981'))
                    ])
                ]),

                e('p', {
                    style: {
                        fontSize: '0.875rem',
                        color: '#6b7280',
                        margin: 0
                    }
                }, config.descripcion)
            ]),

            // Controles
            config.parametros && e('div', {
                style: { padding: '0 1.5rem' }
            }, renderizarControles(tipo)),

            // Contenido del gráfico
            e('div', {
                style: {
                    padding: '1.5rem',
                    minHeight: altura,
                    position: 'relative'
                }
            }, [
                // Canvas SIEMPRE renderizado
                e('canvas', {
                    key: `canvas-${tipo}`,
                    id: config.canvasId,
                    style: {
                        width: '100%',
                        height: '100%',
                        maxHeight: altura,
                        display: error || cargando ? 'none' : 'block'
                    }
                }),

                // Overlay de error/loading
                (error || cargando) && e('div', {
                    style: {
                        position: 'absolute',
                        top: '1.5rem',
                        left: '1.5rem',
                        right: '1.5rem',
                        bottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '8px'
                    }
                }, error ? [
                    // Error
                    e('div', {
                        style: {
                            textAlign: 'center',
                            color: '#ef4444',
                            padding: '2rem'
                        }
                    }, [
                        Icons.alertCircle('#ef4444'),
                        e('p', {
                            style: {
                                margin: '1rem 0 0 0',
                                fontSize: '0.875rem',
                                fontWeight: '500'
                            }
                        }, 'Error al cargar el gráfico'),
                        e('p', {
                            style: {
                                margin: '0.5rem 0 0 0',
                                fontSize: '0.75rem',
                                color: '#6b7280'
                            }
                        }, error),
                        e('button', {
                            onClick: () => cargarGrafico(tipo),
                            style: {
                                marginTop: '1rem',
                                padding: '0.5rem 1rem',
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                cursor: 'pointer'
                            }
                        }, 'Reintentar')
                    ])
                ] : [
                    // Loading
                    e('div', {
                        style: {
                            textAlign: 'center',
                            color: '#6b7280'
                        }
                    }, [
                        Icons.loader('#3b82f6'),
                        e('p', {
                            style: {
                                margin: '0.5rem 0 0 0',
                                fontSize: '0.875rem'
                            }
                        }, 'Generando gráfico...')
                    ])
                ])
            ])
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
                }, 'Estadísticas y Gráficos'),

                ultimaActualizacion && e('p', {
                    style: {
                        color: '#6b7280',
                        fontSize: '0.875rem',
                        margin: '0.25rem 0 0 0'
                    }
                }, `Última actualización: ${ultimaActualizacion}`)
            ]),

            e('div', {
                style: { display: 'flex', gap: '0.5rem' }
            }, [
                e('button', {
                    onClick: () => cargarDashboardGeneral(),
                    disabled: loading,
                    style: {
                        padding: '0.75rem 1.5rem',
                        backgroundColor: loading ? '#9ca3af' : estadisticasConfig.colores.secundario,
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
                    'Actualizar Datos'
                ]),

                e('button', {
                    onClick: cargarTodosLosGraficos,
                    style: {
                        padding: '0.75rem 1.5rem',
                        backgroundColor: estadisticasConfig.colores.primario,
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }
                }, [
                    Icons.barChart('#ffffff'),
                    'Actualizar Gráficos'
                ])
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
        }, estadisticasConfig.mensajes.cargando),

        !loading && e('div', {
            key: 'estadisticas-content'
        }, [
            // Métricas principales
            e('div', {
                key: 'metricas',
                style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '2rem'
                }
            }, Object.entries(estadisticasConfig.metricas).map(([key, config]) =>
                renderizarMetrica(key, config)
            )),

            // Gráficos principales
            e('div', {
                key: 'graficos-grid',
                style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                    gap: '1.5rem'
                }
            }, Object.entries(estadisticasConfig.graficos).map(([tipo, config]) =>
                renderizarGrafico(tipo, config)
            ))
        ])
    ]);
}

export default GestionEstadisticas;
