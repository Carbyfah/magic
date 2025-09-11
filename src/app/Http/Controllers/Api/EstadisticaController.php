<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class EstadisticaController extends Controller
{
    /**
     * DATOS JSON: Dashboard principal con métricas clave
     */
    public function graficoDashboard(Request $request)
    {
        try {
            // Obtener datos básicos del sistema
            $reservasTotal = DB::table('reserva')->where('reserva_situacion', 1)->count();
            $vehiculosActivos = DB::table('vehiculo')->where('vehiculo_situacion', 1)->count();
            $rutasTotal = DB::table('ruta_activada')->where('ruta_activada_situacion', 1)->count();
            $ingresosTotal = DB::table('reserva')->where('reserva_situacion', 1)->sum('reserva_monto') ?? 0;

            // Crear datos del gráfico
            $chartData = [
                'type' => 'bar',
                'data' => [
                    'labels' => ['Reservas', 'Vehículos', 'Rutas', 'Ingresos Q'],
                    'datasets' => [[
                        'label' => 'Estado del Sistema',
                        'data' => [
                            $reservasTotal,
                            $vehiculosActivos,
                            $rutasTotal,
                            $ingresosTotal
                        ],
                        'backgroundColor' => [
                            'rgba(54, 162, 235, 0.6)',   // Azul
                            'rgba(75, 192, 192, 0.6)',   // Verde
                            'rgba(255, 206, 86, 0.6)',   // Amarillo
                            'rgba(153, 102, 255, 0.6)'   // Púrpura
                        ],
                        'borderColor' => [
                            'rgba(54, 162, 235, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(153, 102, 255, 1)'
                        ],
                        'borderWidth' => 1
                    ]]
                ],
                'options' => [
                    'responsive' => true,
                    'plugins' => [
                        'title' => [
                            'display' => true,
                            'text' => 'Magic Travel - Dashboard Principal'
                        ]
                    ],
                    'scales' => [
                        'y' => [
                            'beginAtZero' => true
                        ]
                    ]
                ]
            ];

            return response()->json($chartData);
        } catch (\Exception $e) {
            // Log del error para debugging
            \Log::error('Error en graficoDashboard: ' . $e->getMessage());

            // Respuesta de fallback con datos dummy
            return response()->json([
                'type' => 'bar',
                'data' => [
                    'labels' => ['Sistema', 'Activo', 'Magic', 'Travel'],
                    'datasets' => [[
                        'label' => 'Sistema Operativo',
                        'data' => [1, 1, 1, 1],
                        'backgroundColor' => ['rgba(54, 162, 235, 0.6)']
                    ]]
                ],
                'options' => [
                    'responsive' => true,
                    'plugins' => [
                        'title' => [
                            'display' => true,
                            'text' => 'Magic Travel - Sistema Activo'
                        ]
                    ]
                ]
            ]);
        }
    }

    /**
     * DATOS JSON: Ingresos diarios - USANDO VISTA REAL
     */
    public function graficoIngresosDiarios(Request $request)
    {
        try {
            $dias = $request->get('dias', 30);

            // Usar la vista v_ingresos_diarios que ya tienes datos
            $ingresos = DB::table('v_ingresos_diarios')
                ->orderBy('fecha', 'desc')
                ->limit($dias)
                ->get();

            // Si no hay datos en la vista, buscar directamente en reservas
            if ($ingresos->isEmpty()) {
                $ingresos = DB::table('reserva')
                    ->selectRaw('DATE(created_at) as fecha,
                                COUNT(*) as total_reservas,
                                SUM(reserva_cantidad_adultos + IFNULL(reserva_cantidad_ninos, 0)) as total_pasajeros,
                                SUM(IFNULL(reserva_monto, 0)) as ingresos_brutos')
                    ->where('reserva_situacion', 1)
                    ->groupBy(DB::raw('DATE(created_at)'))
                    ->orderBy('fecha', 'desc')
                    ->limit($dias)
                    ->get();
            }

            if ($ingresos->isEmpty()) {
                return response()->json([
                    'type' => 'line',
                    'data' => [
                        'labels' => ['Sin datos'],
                        'datasets' => [[
                            'label' => 'Ingresos Diarios (Q)',
                            'data' => [0],
                            'borderColor' => 'rgba(75, 192, 192, 1)',
                            'backgroundColor' => 'rgba(75, 192, 192, 0.2)',
                        ]]
                    ]
                ]);
            }

            $labels = [];
            $datos = [];

            foreach ($ingresos->reverse() as $ingreso) {
                $labels[] = Carbon::parse($ingreso->fecha)->format('d/m');
                $datos[] = floatval($ingreso->ingresos_brutos ?? 0);
            }

            $chartData = [
                'type' => 'line',
                'data' => [
                    'labels' => $labels,
                    'datasets' => [[
                        'label' => 'Ingresos Diarios (Q)',
                        'data' => $datos,
                        'borderColor' => 'rgba(75, 192, 192, 1)',
                        'backgroundColor' => 'rgba(75, 192, 192, 0.2)',
                        'tension' => 0.4,
                        'fill' => true
                    ]]
                ],
                'options' => [
                    'responsive' => true,
                    'plugins' => [
                        'title' => [
                            'display' => true,
                            'text' => 'Ingresos Diarios - Histórico Real'
                        ]
                    ],
                    'scales' => [
                        'y' => [
                            'beginAtZero' => true
                        ]
                    ]
                ]
            ];

            return response()->json($chartData);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al generar ingresos',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * DATOS JSON: Ocupación de vehículos - CORREGIDO
     */
    public function graficoOcupacionVehiculos(Request $request)
    {
        try {
            $fecha = $request->get('fecha', null);

            // Usar los nombres EXACTOS según las migraciones
            $query = DB::table('ruta_activada as ra')
                ->join('vehiculo as v', 'ra.vehiculo_id', '=', 'v.vehiculo_id')
                ->leftJoin('reserva as r', function ($join) {
                    $join->on('r.ruta_activada_id', '=', 'ra.ruta_activada_id')
                        ->where('r.reserva_situacion', 1);
                })
                ->select([
                    'v.vehiculo_placa as placa',
                    'v.vehiculo_capacidad as capacidad_total',
                    DB::raw('IFNULL(SUM(r.reserva_cantidad_adultos + IFNULL(r.reserva_cantidad_ninos, 0)), 0) as pasajeros_confirmados'),
                    DB::raw('IF(v.vehiculo_capacidad > 0,
                           ROUND((IFNULL(SUM(r.reserva_cantidad_adultos + IFNULL(r.reserva_cantidad_ninos, 0)), 0) / v.vehiculo_capacidad) * 100, 1),
                           0) as porcentaje_ocupacion')
                ])
                ->where('ra.ruta_activada_situacion', 1);

            // CORRECCIÓN: Usar el campo correcto de fecha
            if ($fecha) {
                $query->whereDate('ra.ruta_activada_fecha_hora', $fecha);
            }

            $ocupacion = $query->groupBy('ra.vehiculo_id', 'v.vehiculo_placa', 'v.vehiculo_capacidad')
                ->orderBy('porcentaje_ocupacion', 'desc')
                ->limit(8)
                ->get();

            // Si no hay datos con fecha específica, buscar sin filtro de fecha
            if ($ocupacion->isEmpty() && $fecha) {
                $ocupacion = DB::table('ruta_activada as ra')
                    ->join('vehiculo as v', 'ra.vehiculo_id', '=', 'v.vehiculo_id')
                    ->leftJoin('reserva as r', function ($join) {
                        $join->on('r.ruta_activada_id', '=', 'ra.ruta_activada_id')
                            ->where('r.reserva_situacion', 1);
                    })
                    ->select([
                        'v.vehiculo_placa as placa',
                        'v.vehiculo_capacidad as capacidad_total',
                        DB::raw('IFNULL(SUM(r.reserva_cantidad_adultos + IFNULL(r.reserva_cantidad_ninos, 0)), 0) as pasajeros_confirmados'),
                        DB::raw('IF(v.vehiculo_capacidad > 0,
                               ROUND((IFNULL(SUM(r.reserva_cantidad_adultos + IFNULL(r.reserva_cantidad_ninos, 0)), 0) / v.vehiculo_capacidad) * 100, 1),
                               0) as porcentaje_ocupacion')
                    ])
                    ->where('ra.ruta_activada_situacion', 1)
                    ->groupBy('ra.vehiculo_id', 'v.vehiculo_placa', 'v.vehiculo_capacidad')
                    ->orderBy('porcentaje_ocupacion', 'desc')
                    ->limit(8)
                    ->get();
            }

            if ($ocupacion->isEmpty()) {
                return response()->json([
                    'type' => 'bar',
                    'data' => [
                        'labels' => ['Sin datos'],
                        'datasets' => [[
                            'label' => 'Ocupación (%)',
                            'data' => [0],
                            'backgroundColor' => 'rgba(75, 192, 192, 0.8)',
                        ]]
                    ],
                    'options' => [
                        'responsive' => true,
                        'plugins' => [
                            'title' => [
                                'display' => true,
                                'text' => 'No hay datos de ocupación disponibles'
                            ]
                        ]
                    ]
                ]);
            }

            $labels = [];
            $datos = [];
            $colores = [];

            foreach ($ocupacion as $item) {
                $labels[] = $item->placa ?? 'Sin placa';
                $porcentaje = floatval($item->porcentaje_ocupacion ?? 0);
                $datos[] = $porcentaje;

                if ($porcentaje >= 90) {
                    $colores[] = 'rgba(239, 68, 68, 0.8)';   // Rojo
                } elseif ($porcentaje >= 70) {
                    $colores[] = 'rgba(249, 115, 22, 0.8)';  // Naranja
                } else {
                    $colores[] = 'rgba(34, 197, 94, 0.8)';   // Verde
                }
            }

            $chartData = [
                'type' => 'bar',
                'data' => [
                    'labels' => $labels,
                    'datasets' => [[
                        'label' => 'Ocupación (%)',
                        'data' => $datos,
                        'backgroundColor' => $colores,
                        'borderColor' => array_map(function ($color) {
                            return str_replace('0.8)', '1)', $color);
                        }, $colores),
                        'borderWidth' => 1
                    ]]
                ],
                'options' => [
                    'responsive' => true,
                    'maintainAspectRatio' => false,
                    'plugins' => [
                        'title' => [
                            'display' => true,
                            'text' => 'Ocupación de Vehículos'
                        ],
                        'legend' => [
                            'display' => false
                        ]
                    ],
                    'scales' => [
                        'y' => [
                            'beginAtZero' => true,
                            'max' => 100,
                            'ticks' => [
                                'callback' => "function(value) { return value + '%'; }"
                            ]
                        ]
                    ]
                ]
            ];

            return response()->json($chartData);
        } catch (\Exception $e) {
            \Log::error('Error en graficoOcupacionVehiculos: ' . $e->getMessage());
            return response()->json([
                'error' => 'Error al generar ocupación',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * DATOS JSON: Reservas por estado - CORREGIDO
     */
    public function graficoReservasPorEstado(Request $request)
    {
        try {
            $fechaInicio = $request->get('fecha_inicio', now()->subDays(30)->format('Y-m-d'));
            $fechaFin = $request->get('fecha_fin', now()->format('Y-m-d'));

            // Usar los nombres originales de tabla (singular)
            $estados = DB::table('reserva as r')
                ->join('estado as e', 'r.estado_id', '=', 'e.estado_id')
                ->whereBetween('r.created_at', [$fechaInicio . ' 00:00:00', $fechaFin . ' 23:59:59'])
                ->where('r.reserva_situacion', 1)
                ->select('e.estado_estado as estado', DB::raw('COUNT(*) as cantidad'))
                ->groupBy('e.estado_id', 'e.estado_estado')
                ->orderByDesc('cantidad')
                ->get();

            // Si no hay datos con filtro de fecha, buscar todas las reservas
            if ($estados->isEmpty()) {
                $estados = DB::table('reserva as r')
                    ->join('estado as e', 'r.estado_id', '=', 'e.estado_id')
                    ->where('r.reserva_situacion', 1)
                    ->select('e.estado_estado as estado', DB::raw('COUNT(*) as cantidad'))
                    ->groupBy('e.estado_id', 'e.estado_estado')
                    ->orderByDesc('cantidad')
                    ->get();
            }

            if ($estados->isEmpty()) {
                return response()->json([
                    'type' => 'doughnut',
                    'data' => [
                        'labels' => ['Sin datos'],
                        'datasets' => [[
                            'data' => [1],
                            'backgroundColor' => ['rgba(156, 163, 175, 0.8)'],
                            'borderWidth' => 1
                        ]]
                    ],
                    'options' => [
                        'responsive' => true,
                        'plugins' => [
                            'title' => [
                                'display' => true,
                                'text' => 'No hay reservas en el período seleccionado'
                            ]
                        ]
                    ]
                ]);
            }

            $labels = [];
            $datos = [];
            $colores = [
                'rgba(34, 197, 94, 0.8)',   // Verde - Confirmada
                'rgba(59, 130, 246, 0.8)',  // Azul - Pendiente
                'rgba(249, 115, 22, 0.8)',  // Naranja - En proceso
                'rgba(239, 68, 68, 0.8)',   // Rojo - Cancelada
                'rgba(168, 85, 247, 0.8)',  // Morado - Completada
                'rgba(156, 163, 175, 0.8)'  // Gris - Otros
            ];

            foreach ($estados as $index => $estado) {
                $labels[] = $estado->estado;
                $datos[] = intval($estado->cantidad);
            }

            $chartData = [
                'type' => 'doughnut',
                'data' => [
                    'labels' => $labels,
                    'datasets' => [[
                        'label' => 'Reservas',
                        'data' => $datos,
                        'backgroundColor' => array_slice($colores, 0, count($labels)),
                        'borderColor' => '#ffffff',
                        'borderWidth' => 2
                    ]]
                ],
                'options' => [
                    'responsive' => true,
                    'maintainAspectRatio' => false,
                    'plugins' => [
                        'title' => [
                            'display' => true,
                            'text' => 'Distribución de Reservas por Estado'
                        ],
                        'legend' => [
                            'position' => 'bottom'
                        ]
                    ]
                ]
            ];

            return response()->json($chartData);
        } catch (\Exception $e) {
            \Log::error('Error en graficoReservasPorEstado: ' . $e->getMessage());
            return response()->json([
                'error' => 'Error al generar estados',
                'message' => $e->getMessage()
            ], 500);
        }
    }
    /**
     * DATOS JSON: Ventas por agencia vs directas - CORREGIDO
     */
    public function graficoVentasPorAgencia(Request $request)
    {
        try {
            $fechaInicio = $request->get('fecha_inicio', now()->subDays(30)->format('Y-m-d'));
            $fechaFin = $request->get('fecha_fin', now()->format('Y-m-d'));

            // Usar los nombres originales de tabla (singular)
            $ventas = DB::table('reserva as r')
                ->leftJoin('agencia as a', 'r.agencia_id', '=', 'a.agencia_id')
                ->whereBetween('r.created_at', [$fechaInicio . ' 00:00:00', $fechaFin . ' 23:59:59'])
                ->where('r.reserva_situacion', 1)
                ->select([
                    DB::raw('CASE WHEN a.agencia_razon_social IS NULL THEN "VENTA DIRECTA" ELSE a.agencia_razon_social END as tipo'),
                    DB::raw('SUM(r.reserva_monto) as total'),
                    DB::raw('COUNT(*) as cantidad_reservas')
                ])
                ->groupBy('a.agencia_id', 'a.agencia_razon_social')
                ->orderByDesc('total')
                ->get();

            // Si no hay datos con filtro de fecha, buscar todas las ventas
            if ($ventas->isEmpty()) {
                $ventas = DB::table('reserva as r')
                    ->leftJoin('agencia as a', 'r.agencia_id', '=', 'a.agencia_id')
                    ->where('r.reserva_situacion', 1)
                    ->select([
                        DB::raw('CASE WHEN a.agencia_razon_social IS NULL THEN "VENTA DIRECTA" ELSE a.agencia_razon_social END as tipo'),
                        DB::raw('SUM(r.reserva_monto) as total'),
                        DB::raw('COUNT(*) as cantidad_reservas')
                    ])
                    ->groupBy('a.agencia_id', 'a.agencia_razon_social')
                    ->orderByDesc('total')
                    ->get();
            }

            if ($ventas->isEmpty()) {
                return response()->json([
                    'type' => 'bar',
                    'data' => [
                        'labels' => ['Sin datos'],
                        'datasets' => [[
                            'label' => 'Ingresos (Q)',
                            'data' => [0],
                            'backgroundColor' => 'rgba(156, 163, 175, 0.8)',
                        ]]
                    ],
                    'options' => [
                        'responsive' => true,
                        'plugins' => [
                            'title' => [
                                'display' => true,
                                'text' => 'No hay ventas en el período seleccionado'
                            ]
                        ]
                    ]
                ]);
            }

            $labels = [];
            $datos = [];
            $colores = [];

            foreach ($ventas as $index => $venta) {
                $nombre = strlen($venta->tipo) > 15 ? substr($venta->tipo, 0, 15) . '...' : $venta->tipo;
                $labels[] = $nombre;
                $datos[] = floatval($venta->total);

                // Color diferente para ventas directas vs agencias
                if ($venta->tipo === 'VENTA DIRECTA') {
                    $colores[] = 'rgba(34, 197, 94, 0.8)';  // Verde para directas
                } else {
                    $colores[] = 'rgba(59, 130, 246, 0.8)'; // Azul para agencias
                }
            }

            $chartData = [
                'type' => 'bar',
                'data' => [
                    'labels' => $labels,
                    'datasets' => [[
                        'label' => 'Ingresos (Q)',
                        'data' => $datos,
                        'backgroundColor' => $colores,
                        'borderColor' => array_map(function ($color) {
                            return str_replace('0.8)', '1)', $color);
                        }, $colores),
                        'borderWidth' => 1
                    ]]
                ],
                'options' => [
                    'responsive' => true,
                    'maintainAspectRatio' => false,
                    'plugins' => [
                        'title' => [
                            'display' => true,
                            'text' => 'Ventas por Canal de Distribución'
                        ],
                        'legend' => [
                            'display' => false
                        ]
                    ],
                    'scales' => [
                        'y' => [
                            'beginAtZero' => true,
                            'ticks' => [
                                'callback' => "function(value) { return 'Q' + value.toLocaleString(); }"
                            ]
                        ]
                    ]
                ]
            ];

            return response()->json($chartData);
        } catch (\Exception $e) {
            \Log::error('Error en graficoVentasPorAgencia: ' . $e->getMessage());
            return response()->json([
                'error' => 'Error al generar ventas',
                'message' => $e->getMessage()
            ], 500);
        }
    }
    /**
     * DATOS JSON: Top rutas más rentables - TODAS LAS RUTAS
     */
    public function graficoTopRutas(Request $request)
    {
        try {
            $limite = $request->get('limite', 8);

            $rutas = DB::table('reserva as r')
                ->join('ruta_activada as ra', 'r.ruta_activada_id', '=', 'ra.ruta_activada_id')
                ->join('ruta as rt', 'ra.ruta_id', '=', 'rt.ruta_id')
                ->where('r.reserva_situacion', 1)
                ->select([
                    DB::raw('CONCAT(rt.ruta_origen, " → ", rt.ruta_destino) as ruta'),
                    DB::raw('SUM(r.reserva_monto) as ingresos'),
                    DB::raw('COUNT(r.reserva_id) as total_reservas'),
                    DB::raw('SUM(r.reserva_cantidad_adultos + IFNULL(r.reserva_cantidad_ninos, 0)) as total_pasajeros')
                ])
                ->groupBy('rt.ruta_id', 'rt.ruta_origen', 'rt.ruta_destino')
                ->orderByDesc('ingresos')
                ->limit($limite)
                ->get();

            if ($rutas->isEmpty()) {
                return response()->json([
                    'type' => 'bar',
                    'data' => [
                        'labels' => ['Sin datos'],
                        'datasets' => [[
                            'label' => 'Ingresos (Q)',
                            'data' => [0],
                            'backgroundColor' => 'rgba(153, 102, 255, 0.6)',
                        ]]
                    ],
                    'options' => [
                        'responsive' => true,
                        'plugins' => [
                            'title' => [
                                'display' => true,
                                'text' => 'No hay datos disponibles'
                            ]
                        ]
                    ]
                ]);
            }

            $labels = [];
            $datos = [];

            foreach ($rutas as $ruta) {
                $labels[] = $ruta->ruta;
                $datos[] = floatval($ruta->ingresos);
            }

            $chartData = [
                'type' => 'bar',
                'data' => [
                    'labels' => $labels,
                    'datasets' => [[
                        'label' => 'Ingresos (Q)',
                        'data' => $datos,
                        'backgroundColor' => 'rgba(153, 102, 255, 0.6)',
                        'borderColor' => 'rgba(153, 102, 255, 1)',
                        'borderWidth' => 1
                    ]]
                ],
                'options' => [
                    'indexAxis' => 'y',
                    'responsive' => true,
                    'plugins' => [
                        'title' => [
                            'display' => true,
                            'text' => 'Top Rutas por Ingresos'
                        ]
                    ],
                    'scales' => [
                        'x' => [
                            'beginAtZero' => true
                        ]
                    ]
                ]
            ];

            return response()->json($chartData);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al generar rutas',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * DATOS JSON: Dashboard con KPIs reales del negocio
     */
    public function dashboard(Request $request)
    {
        try {
            // KPIs PRINCIPALES DEL NEGOCIO TURÍSTICO
            $kpis = [
                // OPERACIONES
                'reservas_activas' => DB::table('reserva')
                    ->where('reserva_situacion', 1)
                    ->count(),

                'pasajeros_confirmados' => DB::table('reserva')
                    ->where('reserva_situacion', 1)
                    ->sum(DB::raw('reserva_cantidad_adultos + IFNULL(reserva_cantidad_ninos, 0)')),

                // INGRESOS
                'ingresos_totales' => DB::table('reserva')
                    ->where('reserva_situacion', 1)
                    ->sum('reserva_monto'),

                'ticket_promedio' => DB::table('reserva')
                    ->where('reserva_situacion', 1)
                    ->where('reserva_monto', '>', 0)
                    ->avg('reserva_monto'),

                // RECURSOS
                'vehiculos_operativos' => DB::table('vehiculo')
                    ->where('vehiculo_situacion', 1)
                    ->count(),

                'rutas_programadas' => DB::table('ruta_activada')
                    ->where('ruta_activada_situacion', 1)
                    ->count(),

                // OCUPACIÓN
                'ocupacion_promedio' => $this->calcularOcupacionPromedio(),

                // CANAL DE VENTAS
                'porcentaje_ventas_directas' => $this->calcularPorcentajeVentasDirectas(),

                // AGENCIAS
                'agencias_activas' => DB::table('agencia')
                    ->where('agencia_situacion', 1)
                    ->count(),

                // USUARIOS
                'usuarios_sistema' => DB::table('usuario')
                    ->where('usuario_situacion', 1)
                    ->count(),

                // MÉTRICAS DE TIEMPO
                'reservas_hoy' => DB::table('reserva')
                    ->whereDate('created_at', today())
                    ->where('reserva_situacion', 1)
                    ->count(),

                'reservas_semana' => DB::table('reserva')
                    ->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])
                    ->where('reserva_situacion', 1)
                    ->count(),

                'ingresos_semana' => DB::table('reserva')
                    ->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])
                    ->where('reserva_situacion', 1)
                    ->sum('reserva_monto'),
            ];

            $estadisticas = [
                'resumen_general' => $kpis,
                'enlaces_graficos' => [
                    'dashboard' => '/api/magic/estadisticas/grafico-dashboard',
                    'ingresos_diarios' => '/api/magic/estadisticas/grafico-ingresos-diarios',
                    'ocupacion_vehiculos' => '/api/magic/estadisticas/grafico-ocupacion-vehiculos',
                    'reservas_por_estado' => '/api/magic/estadisticas/grafico-reservas-por-estado',
                    'ventas_por_agencia' => '/api/magic/estadisticas/grafico-ventas-por-agencia',
                    'top_rutas' => '/api/magic/estadisticas/grafico-top-rutas'
                ],
                'ultima_actualizacion' => now()->format('Y-m-d H:i:s'),
                'estado_sistema' => 'operativo',
                'version_datos' => '3.0'
            ];

            return response()->json($estadisticas);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al obtener KPIs del dashboard',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Calcular ocupación promedio de vehículos
     */
    private function calcularOcupacionPromedio()
    {
        try {
            $ocupaciones = DB::table('ruta_activada as ra')
                ->join('vehiculo as v', 'ra.vehiculo_id', '=', 'v.vehiculo_id')
                ->leftJoin('reserva as r', function ($join) {
                    $join->on('r.ruta_activada_id', '=', 'ra.ruta_activada_id')
                        ->where('r.reserva_situacion', 1);
                })
                ->where('ra.ruta_activada_situacion', 1)
                ->where('v.vehiculo_capacidad', '>', 0)
                ->select([
                    'v.vehiculo_capacidad',
                    DB::raw('IFNULL(SUM(r.reserva_cantidad_adultos + IFNULL(r.reserva_cantidad_ninos, 0)), 0) as pasajeros')
                ])
                ->groupBy('ra.ruta_activada_id', 'v.vehiculo_capacidad')
                ->get();

            if ($ocupaciones->isEmpty()) {
                return 0;
            }

            $promedios = $ocupaciones->map(function ($ocupacion) {
                return ($ocupacion->pasajeros / $ocupacion->vehiculo_capacidad) * 100;
            });

            return round($promedios->avg(), 1);
        } catch (\Exception $e) {
            return 0;
        }
    }

    /**
     * Calcular porcentaje de ventas directas vs agencias
     */
    private function calcularPorcentajeVentasDirectas()
    {
        try {
            $totalReservas = DB::table('reserva')
                ->where('reserva_situacion', 1)
                ->count();

            if ($totalReservas == 0) {
                return 0;
            }

            $reservasDirectas = DB::table('reserva')
                ->where('reserva_situacion', 1)
                ->whereNull('agencia_id')
                ->count();

            return round(($reservasDirectas / $totalReservas) * 100, 1);
        } catch (\Exception $e) {
            return 0;
        }
    }

    /**
     * Verificar si una vista existe
     */
    private function vistaExiste($nombreVista)
    {
        try {
            DB::select("SELECT 1 FROM {$nombreVista} LIMIT 1");
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }
}
