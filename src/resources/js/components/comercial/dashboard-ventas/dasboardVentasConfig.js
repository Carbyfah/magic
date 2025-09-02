// src/resources/js/components/comercial/dashboard-ventas/dashboardVentasConfig.js

/**
 * CONFIGURACIÓN DEL DASHBOARD DE VENTAS - MAGIC TRAVEL
 * Sistema de métricas comerciales basado en reservas confirmadas
 */

export const dashboardVentasConfig = {
    // Configuración de endpoints
    endpoints: {
        metricas: '/api/magic/dashboard/ventas/metricas',
        ventasPorDia: '/api/magic/dashboard/ventas/ventas-por-dia',
        reservasPorEstado: '/api/magic/dashboard/ventas/reservas-por-estado',
        ventasPorAgencia: '/api/magic/dashboard/ventas/ventas-por-agencia',
        topVendedores: '/api/magic/dashboard/ventas/top-vendedores',
        rutasMasVendidas: '/api/magic/dashboard/ventas/rutas-mas-vendidas',
        resumenGeneral: '/api/magic/dashboard/ventas/resumen-general'
    },

    // Configuración de métricas principales (KPIs)
    kpis: {
        ventasDelDia: {
            titulo: 'Ventas del Día',
            campo: 'ventas_del_dia',
            formato: 'moneda',
            color: 'verde',
            icono: 'trending-up',
            descripcion: 'Total de ingresos confirmados hoy'
        },
        ventasDelMes: {
            titulo: 'Ventas del Mes',
            campo: 'ventas_del_mes',
            formato: 'moneda',
            color: 'azul',
            icono: 'calendar',
            descripcion: 'Acumulado mensual de ventas'
        },
        reservasActivas: {
            titulo: 'Reservas Activas',
            campo: 'reservas_activas',
            formato: 'numero',
            color: 'naranja',
            icono: 'users',
            descripcion: 'Pendientes + Confirmadas'
        },
        ingresosPendientes: {
            titulo: 'Ingresos Pendientes',
            campo: 'ingresos_pendientes',
            formato: 'moneda',
            color: 'morado',
            icono: 'clock',
            descripcion: 'Potenciales ingresos por confirmar'
        }
    },

    // Configuración de gráficos
    graficos: {
        ventasPorDia: {
            tipo: 'linea',
            titulo: 'Tendencia de Ventas (30 días)',
            endpoint: 'ventasPorDia',
            configuracion: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function (value) {
                                return 'Q.' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        },

        reservasPorEstado: {
            tipo: 'dona',
            titulo: 'Distribución por Estado',
            endpoint: 'reservasPorEstado',
            configuracion: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            },
            colores: ['#10b981', '#f59e0b', '#ef4444', '#6b7280']
        },

        ventasPorAgencia: {
            tipo: 'barra',
            titulo: 'Ventas por Canal',
            endpoint: 'ventasPorAgencia',
            configuracion: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function (value) {
                                return 'Q.' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        }
    },

    // Configuración de rankings
    rankings: {
        vendedores: {
            titulo: 'Top Vendedores',
            endpoint: 'topVendedores',
            limite: 5,
            campos: [
                { key: 'posicion', label: '#', width: '10%' },
                { key: 'vendedor', label: 'Vendedor', width: '40%' },
                { key: 'reservas', label: 'Reservas', width: '20%', formato: 'numero' },
                { key: 'ventas', label: 'Ventas', width: '30%', formato: 'moneda' }
            ]
        },

        rutas: {
            titulo: 'Rutas Más Vendidas',
            endpoint: 'rutasMasVendidas',
            limite: 5,
            campos: [
                { key: 'posicion', label: '#', width: '10%' },
                { key: 'ruta', label: 'Ruta', width: '45%' },
                { key: 'reservas', label: 'Reservas', width: '15%', formato: 'numero' },
                { key: 'ingresos', label: 'Ingresos', width: '30%', formato: 'moneda' }
            ]
        }
    },

    // Configuración de intervalos de actualización
    actualizacion: {
        intervaloAutomatico: 300000, // 5 minutos
        habilitarAutoRefresh: true,
        mostrarUltimaActualizacion: true
    },

    // Configuración de colores del dashboard
    colores: {
        primario: '#3b82f6',
        secundario: '#10b981',
        terciario: '#f59e0b',
        peligro: '#ef4444',
        info: '#8b5cf6',
        exito: '#10b981',
        advertencia: '#f59e0b',
        neutro: '#6b7280'
    },

    // Formateadores de datos
    formateadores: {
        moneda: (value) => {
            return 'Q.' + parseFloat(value || 0).toLocaleString('es-GT', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        },

        numero: (value) => {
            return parseInt(value || 0).toLocaleString('es-GT');
        },

        porcentaje: (value) => {
            return parseFloat(value || 0).toFixed(1) + '%';
        },

        fecha: (value) => {
            return new Date(value).toLocaleDateString('es-GT');
        },

        fechaHora: (value) => {
            return new Date(value).toLocaleString('es-GT');
        }
    },

    // Configuración de filtros disponibles
    filtros: {
        periodo: {
            label: 'Período',
            tipo: 'select',
            opciones: [
                { value: 'hoy', label: 'Hoy' },
                { value: 'ayer', label: 'Ayer' },
                { value: 'semana', label: 'Esta Semana' },
                { value: 'mes', label: 'Este Mes' },
                { value: 'personalizado', label: 'Personalizado' }
            ],
            default: 'hoy'
        },

        vendedor: {
            label: 'Vendedor',
            tipo: 'select',
            endpoint: '/api/magic/usuarios',
            campo: 'nombre_completo',
            valor: 'id'
        }
    },

    // Mensajes de estado
    mensajes: {
        cargando: 'Cargando datos del dashboard...',
        error: 'Error al cargar los datos',
        sinDatos: 'No hay datos disponibles para mostrar',
        actualizando: 'Actualizando información...',
        errorConexion: 'Error de conexión. Reintentando...'
    },

    // Configuración de notificaciones
    notificaciones: {
        mostrarCambios: true,
        umbralVariacion: 10, // Porcentaje para considerar cambio significativo
        tiposAlerta: {
            ventasBajas: {
                condicion: (ventasHoy, ventasAyer) => ventasHoy < (ventasAyer * 0.7),
                mensaje: 'Las ventas de hoy están significativamente por debajo de ayer',
                tipo: 'warning'
            },
            sinReservasHoy: {
                condicion: (reservasHoy) => reservasHoy === 0,
                mensaje: 'No se han registrado reservas hoy',
                tipo: 'info'
            },
            metaMensual: {
                condicion: (ventasMes) => ventasMes > 50000,
                mensaje: 'Excelente! Se ha superado la meta mensual',
                tipo: 'success'
            }
        }
    },

    // Layout del dashboard
    layout: {
        columnas: {
            kpis: 12, // Ancho completo para KPIs
            graficoIzquierdo: 8, // Gráfico principal
            rankingDerecho: 4, // Rankings
            graficoInferior: 12 // Gráfico inferior completo
        },

        responsive: {
            breakpointTablet: 768,
            breakpointMobile: 480,
            ajustesMovil: {
                ocultarRankings: false,
                apilarGraficos: true,
                kpisSimplificados: true
            }
        }
    },

    // Configuración de exportación
    exportacion: {
        habilitado: true,
        formatos: ['pdf', 'excel'],
        incluirGraficos: true,
        incluirRankings: true
    }
};

// Configuración específica para cada tipo de gráfico
export const configGraficos = {
    linea: {
        type: 'line',
        data: {
            datasets: [{
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true
            }]
        }
    },

    dona: {
        type: 'doughnut',
        data: {
            datasets: [{
                backgroundColor: [
                    '#10b981', // Verde - Confirmadas
                    '#f59e0b', // Amarillo - Pendientes
                    '#ef4444', // Rojo - Canceladas
                    '#6b7280'  // Gris - Otros
                ]
            }]
        }
    },

    barra: {
        type: 'bar',
        data: {
            datasets: [{
                backgroundColor: '#3b82f6',
                borderColor: '#2563eb',
                borderWidth: 1
            }]
        }
    }
};

// Helper para obtener configuración de color según el valor
export const obtenerColorPorValor = (valor, tipo = 'kpi') => {
    const config = dashboardVentasConfig.colores;

    if (tipo === 'variacion') {
        return valor > 0 ? config.exito : valor < 0 ? config.peligro : config.neutro;
    }

    return config.primario;
};

export default dashboardVentasConfig;
