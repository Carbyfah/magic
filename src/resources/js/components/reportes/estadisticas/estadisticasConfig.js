// src/resources/js/components/reportes/estadisticas/estadisticasConfig.js

/**
 * CONFIGURACIÓN DEL MÓDULO DE ESTADÍSTICAS - MAGIC TRAVEL
 * Sistema de gráficos Chart.js basado en JSON de vistas de BD
 */

export const estadisticasConfig = {
    // Configuración de endpoints
    endpoints: {
        dashboard: '/api/magic/estadisticas/dashboard',
        graficoDashboard: '/api/magic/estadisticas/grafico-dashboard',
        graficoIngresosDiarios: '/api/magic/estadisticas/grafico-ingresos-diarios',
        graficoOcupacionVehiculos: '/api/magic/estadisticas/grafico-ocupacion-vehiculos',
        graficoReservasPorEstado: '/api/magic/estadisticas/grafico-reservas-por-estado',
        graficoVentasPorAgencia: '/api/magic/estadisticas/grafico-ventas-por-agencia',
        graficoTopRutas: '/api/magic/estadisticas/grafico-top-rutas'
    },

    // Configuración de gráficos principales - ACTUALIZADA PARA CHART.JS
    graficos: {
        dashboard: {
            titulo: 'Métricas Principales',
            endpoint: 'graficoDashboard',
            tipo: 'chartjs',
            chartType: 'bar',
            descripcion: 'Resumen de KPIs del sistema',
            actualizacionAuto: true,
            parametros: {},
            canvasId: 'chart-dashboard'
        },

        ingresosDiarios: {
            titulo: 'Ingresos Diarios',
            endpoint: 'graficoIngresosDiarios',
            tipo: 'chartjs',
            chartType: 'line',
            descripcion: 'Tendencia de ingresos por día',
            actualizacionAuto: true,
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
            tipo: 'chartjs',
            chartType: 'bar',
            descripcion: 'Porcentaje de ocupación por vehículo',
            actualizacionAuto: true,
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
            tipo: 'chartjs',
            chartType: 'doughnut',
            descripcion: 'Gráfico circular de reservas por estado',
            actualizacionAuto: true,
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
            tipo: 'chartjs',
            chartType: 'bar',
            descripcion: 'Comparativo de ventas por canal',
            actualizacionAuto: true,
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
            tipo: 'chartjs',
            chartType: 'bar',
            descripcion: 'Ranking de rutas por ingresos',
            actualizacionAuto: true,
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

    // REEMPLAZAR ESTA SECCIÓN EN estadisticasConfig.js (líneas 105-140 aprox)

    // Configuración de métricas del dashboard JSON - CORREGIDAS PARA BACKEND
    metricas: {
        reservasActivas: {
            titulo: 'Reservas Activas',
            campo: 'reservas_activas',  // Campo que envía el backend
            formato: 'numero',
            color: 'azul',
            icono: 'calendar-plus',
            descripcion: 'Total de reservas activas en el sistema'
        },
        pasajerosConfirmados: {
            titulo: 'Pasajeros Confirmados',
            campo: 'pasajeros_confirmados',  // Campo que envía el backend
            formato: 'numero',
            color: 'verde',
            icono: 'users',
            descripcion: 'Total de pasajeros confirmados'
        },
        vehiculosOperativos: {
            titulo: 'Vehículos Operativos',
            campo: 'vehiculos_operativos',  // Campo que envía el backend
            formato: 'numero',
            color: 'naranja',
            icono: 'truck',
            descripcion: 'Vehículos disponibles para operar'
        },
        rutasProgramadas: {
            titulo: 'Rutas Programadas',
            campo: 'rutas_programadas',  // Campo que envía el backend
            formato: 'numero',
            color: 'morado',
            icono: 'route',
            descripción: 'Rutas programadas en el sistema'
        },
        ingresosTotales: {
            titulo: 'Ingresos Totales',
            campo: 'ingresos_totales',  // Campo que envía el backend
            formato: 'moneda',
            color: 'verde',
            icono: 'dollar-sign',
            descripcion: 'Ingresos totales del sistema'
        },
        ticketPromedio: {
            titulo: 'Ticket Promedio',
            campo: 'ticket_promedio',  // Campo que envía el backend
            formato: 'moneda',
            color: 'info',
            icono: 'trending-up',
            descripcion: 'Precio promedio por reserva'
        },
        ocupacionPromedio: {
            titulo: 'Ocupación Promedio',
            campo: 'ocupacion_promedio',  // Campo que envía el backend
            formato: 'porcentaje',
            color: 'terciario',
            icono: 'percent',
            descripcion: 'Porcentaje promedio de ocupación de vehículos'
        },
        ventasDirectas: {
            titulo: 'Ventas Directas',
            campo: 'porcentaje_ventas_directas',  // Campo que envía el backend
            formato: 'porcentaje',
            color: 'secundario',
            icono: 'user-check',
            descripcion: 'Porcentaje de ventas directas vs agencias'
        }
    },

    // Layout del módulo
    layout: {
        dashboard: {
            columnas: 12,
            orden: 1,
            altura: '400px'
        },
        ingresosDiarios: {
            columnas: 6,
            orden: 2,
            altura: '400px'
        },
        ocupacionVehiculos: {
            columnas: 6,
            orden: 3,
            altura: '400px'
        },
        reservasPorEstado: {
            columnas: 4,
            orden: 4,
            altura: '350px'
        },
        ventasPorAgencia: {
            columnas: 4,
            orden: 5,
            altura: '350px'
        },
        topRutas: {
            columnas: 4,
            orden: 6,
            altura: '350px'
        }
    },

    // NUEVA: Configuración específica de Chart.js
    chartjsDefaults: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 1000,
            easing: 'easeInOutQuart'
        },
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    padding: 20,
                    usePointStyle: true,
                    font: {
                        size: 12,
                        family: 'Inter, system-ui, sans-serif'
                    }
                }
            },
            tooltip: {
                enabled: true,
                backgroundColor: 'rgba(0,0,0,0.8)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: 'rgba(255,255,255,0.2)',
                borderWidth: 1,
                cornerRadius: 8,
                padding: 12,
                titleFont: {
                    size: 14,
                    weight: 'bold'
                },
                bodyFont: {
                    size: 13
                },
                callbacks: {
                    title: function (context) {
                        return context[0].label || '';
                    },
                    label: function (context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }

                        // Formatear según el tipo de gráfico
                        const value = context.parsed.y || context.parsed || 0;

                        if (context.chart.canvas.id.includes('ingresos') || context.chart.canvas.id.includes('ventas')) {
                            label += 'Q ' + value.toLocaleString('es-GT', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            });
                        } else if (context.chart.canvas.id.includes('ocupacion')) {
                            label += value.toFixed(1) + '%';
                        } else {
                            label += value.toLocaleString('es-GT');
                        }

                        return label;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    color: 'rgba(0,0,0,0.05)',
                    borderColor: 'rgba(0,0,0,0.1)'
                },
                ticks: {
                    color: '#6b7280',
                    font: {
                        size: 11,
                        family: 'Inter, system-ui, sans-serif'
                    }
                }
            },
            y: {
                grid: {
                    color: 'rgba(0,0,0,0.05)',
                    borderColor: 'rgba(0,0,0,0.1)'
                },
                ticks: {
                    color: '#6b7280',
                    font: {
                        size: 11,
                        family: 'Inter, system-ui, sans-serif'
                    }
                }
            }
        }
    },

    // Configuración responsive
    responsive: {
        breakpoints: {
            mobile: 768,
            tablet: 1024
        },
        ajustes: {
            mobile: {
                columnasPorDefecto: 12,
                ocultarParametros: true,
                alturaReducida: '300px'
            },
            tablet: {
                columnasPorDefecto: 6,
                mostrarParametrosSimplificados: true
            }
        }
    },

    // Configuración de filtros globales
    filtrosGlobales: {
        periodo: {
            label: 'Período de Análisis',
            tipo: 'select',
            opciones: [
                { value: '7d', label: 'Últimos 7 días' },
                { value: '15d', label: 'Últimos 15 días' },
                { value: '30d', label: 'Últimos 30 días' },
                { value: '60d', label: 'Últimos 60 días' },
                { value: '90d', label: 'Últimos 90 días' },
                { value: 'personalizado', label: 'Rango personalizado' }
            ],
            default: '30d',
            aplicaA: ['ingresosDiarios', 'reservasPorEstado', 'ventasPorAgencia', 'topRutas']
        },

        fechaEspecifica: {
            label: 'Fecha Específica',
            tipo: 'date',
            default: 'hoy',
            aplicaA: ['ocupacionVehiculos']
        }
    },

    // Configuración de actualización automática
    actualizacion: {
        intervaloAutomatico: 300000, // 5 minutos
        habilitarAutoRefresh: true,
        mostrarUltimaActualizacion: true,
        notificarCambios: true
    },

    // Colores del sistema
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

    // Formateadores de datos
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
        },

        fecha: (value) => {
            if (!value) return '';
            if (value === 'hoy') return new Date().toLocaleDateString('es-GT');
            return new Date(value).toLocaleDateString('es-GT');
        },

        fechaHora: (value) => {
            return new Date(value).toLocaleString('es-GT');
        }
    },

    // Mensajes del sistema
    mensajes: {
        cargando: 'Generando gráfico estadístico...',
        error: 'Error al cargar el gráfico',
        sinDatos: 'No hay datos disponibles para el período seleccionado',
        actualizando: 'Actualizando estadísticas...',
        errorConexion: 'Error de conexión. Reintentando...',
        graficoGenerado: 'Gráfico generado exitosamente',
        parametrosInvalidos: 'Parámetros incorrectos para generar el gráfico'
    },

    // NUEVA: Funciones helper para Chart.js
    helpers: {
        // Crear configuración base de Chart.js
        crearConfiguracionBase: (tipo, datos, opciones = {}) => {
            const configBase = {
                type: tipo,
                data: datos,
                options: {
                    ...estadisticasConfig.chartjsDefaults,
                    ...opciones
                }
            };
            return configBase;
        },

        // Procesar datos del backend para Chart.js
        procesarDatosBackend: (datosBackend) => {
            if (datosBackend && datosBackend.data) {
                return datosBackend; // Ya viene en formato Chart.js
            }
            return null;
        },

        // Manejar errores de carga
        manejarError: (error, contenedorId) => {
            const contenedor = document.getElementById(contenedorId);
            if (contenedor) {
                contenedor.innerHTML = `
                    <div class="flex items-center justify-center h-full bg-gray-50 rounded-lg">
                        <div class="text-center text-gray-500">
                            <svg class="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            <p class="text-sm font-medium">${estadisticasConfig.mensajes.error}</p>
                            <p class="text-xs text-gray-400 mt-1">${error.message || 'Error desconocido'}</p>
                        </div>
                    </div>
                `;
            }
        },

        // Mostrar loading
        mostrarCargando: (contenedorId) => {
            const contenedor = document.getElementById(contenedorId);
            if (contenedor) {
                contenedor.innerHTML = `
                    <div class="flex items-center justify-center h-full">
                        <div class="text-center">
                            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p class="text-sm text-gray-600 mt-2">${estadisticasConfig.mensajes.cargando}</p>
                        </div>
                    </div>
                `;
            }
        },

        // Destruir gráfico existente
        destruirGrafico: (instanciaChart) => {
            if (instanciaChart && typeof instanciaChart.destroy === 'function') {
                instanciaChart.destroy();
            }
        },

        // Crear instancia Chart.js
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

                // Verificar que Chart.js esté disponible
                if (typeof Chart === 'undefined') {
                    console.error('Chart.js no está cargado. Asegúrate de incluir el CDN.');
                    return null;
                }

                return new Chart(ctx, configuracion);
            } catch (error) {
                console.error(`Error creando gráfico ${canvasId}:`, error);
                return null;
            }
        }
    },

    // Configuración de exportación
    exportacion: {
        habilitado: true,
        formatos: {
            imagen: {
                habilitado: true,
                extension: 'png',
                calidad: 'alta'
            },
            pdf: {
                habilitado: true,
                incluirParametros: true,
                incluirFecha: true
            }
        },
        nombreArchivo: {
            prefijo: 'estadisticas_magic_travel',
            incluirFecha: true,
            incluirHora: false
        }
    },

    // Configuración de notificaciones
    notificaciones: {
        mostrarCambios: true,
        tipos: {
            graficoActualizado: {
                mensaje: 'Gráfico actualizado exitosamente',
                tipo: 'success',
                duracion: 3000
            },
            errorCarga: {
                mensaje: 'Error al cargar el gráfico',
                tipo: 'error',
                duracion: 5000
            },
            sinDatos: {
                mensaje: 'No hay datos para mostrar en el período seleccionado',
                tipo: 'warning',
                duracion: 4000
            }
        }
    },

    // Configuración de ayuda y tooltips
    ayuda: {
        dashboard: 'Muestra un resumen de las métricas principales del sistema',
        ingresosDiarios: 'Gráfico de línea que muestra la evolución de los ingresos día a día',
        ocupacionVehiculos: 'Porcentaje de ocupación de cada vehículo para una fecha específica',
        reservasPorEstado: 'Distribución circular de las reservas según su estado actual',
        ventasPorAgencia: 'Comparación entre ventas directas y ventas por agencia',
        topRutas: 'Ranking de las rutas más rentables ordenadas por ingresos generados'
    },

    // VALIDACIÓN DE ESTADOS - No aplica para estadísticas
    validateStates: async () => {
        return {
            valido: true,
            mensaje: 'Las estadísticas no requieren validación de estados específicos'
        };
    },

    // VALIDADORES DE INTEGRIDAD PARA ESTADÍSTICAS
    integrityValidators: {
        // Validar parámetros de gráficos
        validateGraphParameters: (parametros) => {
            const errores = {};

            Object.entries(parametros).forEach(([key, value]) => {
                if (key === 'limite') {
                    const num = parseInt(value);
                    if (isNaN(num) || num < 1 || num > 50) {
                        errores[key] = 'El límite debe estar entre 1 y 50';
                    }
                }

                if (key === 'dias') {
                    const num = parseInt(value);
                    if (isNaN(num) || num < 1 || num > 365) {
                        errores[key] = 'Los días deben estar entre 1 y 365';
                    }
                }

                if (key.includes('fecha')) {
                    if (value && value !== 'hoy' && !value.startsWith('-')) {
                        const fecha = new Date(value);
                        if (isNaN(fecha.getTime())) {
                            errores[key] = 'Formato de fecha inválido';
                        }
                    }
                }
            });

            return Object.keys(errores).length === 0 ? { valido: true } : { valido: false, errores };
        },

        // Validar datos de respuesta de gráficos
        validateGraphData: (datos) => {
            if (!datos) {
                return { valido: false, mensaje: 'Datos vacíos' };
            }

            if (!datos.data) {
                return { valido: false, mensaje: 'Estructura de datos inválida' };
            }

            return { valido: true };
        }
    },

    // HELPERS ESPECÍFICOS PARA ESTADÍSTICAS
    helpers: {
        // Procesar fechas relativas
        procesarFechaRelativa: (valor) => {
            if (valor === 'hoy') {
                return new Date().toISOString().split('T')[0];
            } else if (typeof valor === 'string' && valor.startsWith('-')) {
                const dias = parseInt(valor.replace(/[^\d]/g, ''));
                const fecha = new Date();
                fecha.setDate(fecha.getDate() - dias);
                return fecha.toISOString().split('T')[0];
            }
            return valor;
        },

        // Construir URL con parámetros procesados
        construirURL: (endpoint, parametros) => {
            const params = new URLSearchParams();

            Object.entries(parametros).forEach(([key, value]) => {
                const valorProcesado = estadisticasConfig.helpers.procesarFechaRelativa(value);
                if (valorProcesado) {
                    params.append(key, valorProcesado);
                }
            });

            return params.toString() ? `${endpoint}?${params.toString()}` : endpoint;
        },

        // Formatear datos para Chart.js
        formatearDatosChart: (datos) => {
            if (!datos || !datos.data) return null;
            return datos;
        },

        // Validar disponibilidad de Chart.js
        validarChartJS: () => {
            return typeof Chart !== 'undefined';
        },

        // Obtener configuración de color por tipo
        obtenerColoresPorTipo: (tipo) => {
            const colores = {
                'bar': [estadisticasConfig.colores.primario, estadisticasConfig.colores.secundario],
                'line': [estadisticasConfig.colores.primario],
                'doughnut': [
                    estadisticasConfig.colores.primario,
                    estadisticasConfig.colores.secundario,
                    estadisticasConfig.colores.terciario,
                    estadisticasConfig.colores.info,
                    estadisticasConfig.colores.advertencia
                ]
            };
            return colores[tipo] || [estadisticasConfig.colores.primario];
        }
    },

    // VALIDACIÓN COMPLETA PARA ESTADÍSTICAS
    validateForm: (parametros) => {
        return estadisticasConfig.integrityValidators.validateGraphParameters(parametros);
    },

    // PROCESAMIENTO ANTES DE ENVIAR PARÁMETROS
    processBeforeRequest: (parametros) => {
        const parametrosProcesados = {};

        Object.entries(parametros).forEach(([key, value]) => {
            parametrosProcesados[key] = estadisticasConfig.helpers.procesarFechaRelativa(value);
        });

        return parametrosProcesados;
    },

    // ACCIONES ESPECÍFICAS PARA ESTADÍSTICAS
    actions: {
        refresh: {
            label: 'Actualizar Gráfico',
            icon: 'refresh-cw',
            color: 'blue',
            condition: () => true,
            requiresConfirmation: false
        },
        download: {
            label: 'Descargar PNG',
            icon: 'download',
            color: 'green',
            condition: (grafico) => grafico && grafico.canvas,
            requiresConfirmation: false
        },
        configure: {
            label: 'Configurar Parámetros',
            icon: 'settings',
            color: 'gray',
            condition: (config) => config && config.parametros,
            requiresConfirmation: false
        }
    }
};

// Helper para construir URLs con parámetros
export const construirUrlGrafico = (tipoGrafico, parametros = {}) => {
    const config = estadisticasConfig.graficos[tipoGrafico];
    if (!config) return null;

    let url = estadisticasConfig.endpoints[config.endpoint];
    const params = new URLSearchParams();

    // Procesar parámetros
    Object.keys(parametros).forEach(key => {
        let valor = parametros[key];

        // Procesar valores especiales
        if (valor === 'hoy') {
            valor = new Date().toISOString().split('T')[0];
        } else if (typeof valor === 'string' && valor.startsWith('-')) {
            // Fechas relativas como '-30d'
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

// Helper para obtener configuración por tipo de gráfico
export const obtenerConfigGrafico = (tipo) => {
    return estadisticasConfig.graficos[tipo] || null;
};

// Helper para formatear datos según tipo
export const formatearValor = (valor, tipo) => {
    const formateador = estadisticasConfig.formateadores[tipo];
    return formateador ? formateador(valor) : valor;
};

// Configuración de validaciones
export const validaciones = {
    parametros: {
        fecha: (fecha) => {
            if (!fecha) return true;
            const fechaObj = new Date(fecha);
            return !isNaN(fechaObj.getTime());
        },

        limite: (limite) => {
            const num = parseInt(limite);
            return num >= 1 && num <= 50;
        },

        dias: (dias) => {
            const num = parseInt(dias);
            return num >= 1 && num <= 365;
        }
    }
};

export default estadisticasConfig;
