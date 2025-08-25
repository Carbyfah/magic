<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reserva;
use App\Models\Venta;
use App\Models\RutaEjecutada;
use App\Models\Vehiculo;
use App\Models\Empleado;
use App\Models\Cliente;
use App\Models\Agencia;
use Illuminate\Http\Request;
use Carbon\Carbon;
use DB;
use Exception;

class DashboardController extends Controller
{
    /**
     * Obtener estadísticas generales del dashboard
     */
    public function estadisticas(Request $request)
    {
        try {
            $hoy = Carbon::today();
            $inicioMes = Carbon::now()->startOfMonth();
            $finMes = Carbon::now()->endOfMonth();

            // Estadísticas del día
            $estadisticasHoy = [
                'reservas_hoy' => Reserva::porFechaViaje($hoy)->count(),
                'pasajeros_hoy' => Reserva::porFechaViaje($hoy)->sum('pax_total'),
                'rutas_programadas' => RutaEjecutada::porFecha($hoy)->count(),
                'rutas_en_curso' => RutaEjecutada::porFecha($hoy)->porEstado('en_ruta')->count(),
                'rutas_completadas' => RutaEjecutada::porFecha($hoy)->porEstado('completada')->count(),
                'ventas_hoy' => Venta::whereDate('fecha_hora_venta', $hoy)->count(),
                'monto_ventas_hoy' => Venta::whereDate('fecha_hora_venta', $hoy)->sum('total_venta')
            ];

            // Estadísticas del mes
            $estadisticasMes = [
                'reservas_mes' => Reserva::porRangoFechas($inicioMes, $finMes)->count(),
                'pasajeros_mes' => Reserva::porRangoFechas($inicioMes, $finMes)->sum('pax_total'),
                'ventas_mes' => Venta::porPeriodo($inicioMes, $finMes)->count(),
                'monto_ventas_mes' => Venta::porPeriodo($inicioMes, $finMes)->sum('total_venta'),
                'comisiones_mes' => Venta::porPeriodo($inicioMes, $finMes)->sum('comision_agencia')
            ];

            // Estados de vehículos
            $estadosVehiculos = [
                'total' => Vehiculo::activo()->count(),
                'disponibles' => Vehiculo::disponibles()->count(),
                'en_ruta' => RutaEjecutada::porFecha($hoy)->porEstado('en_ruta')->distinct('vehiculo_id')->count(),
                'mantenimiento' => Vehiculo::whereHas('estadoVehiculo', function ($q) {
                    $q->where('codigo', 'MANT');
                })->count()
            ];

            // Top rutas del mes
            $topRutas = Reserva::select('ruta_id', DB::raw('COUNT(*) as total_reservas'), DB::raw('SUM(pax_total) as total_pasajeros'))
                ->with('ruta:id,nombre_ruta')
                ->porRangoFechas($inicioMes, $finMes)
                ->groupBy('ruta_id')
                ->orderBy('total_reservas', 'desc')
                ->limit(5)
                ->get();

            // Top agencias del mes
            $topAgencias = Venta::select('agencia_id', DB::raw('COUNT(*) as total_ventas'), DB::raw('SUM(total_venta) as monto_total'))
                ->with('agencia:id,nombre_comercial')
                ->whereNotNull('agencia_id')
                ->porPeriodo($inicioMes, $finMes)
                ->groupBy('agencia_id')
                ->orderBy('monto_total', 'desc')
                ->limit(5)
                ->get();

            // Próximas salidas (próximas 2 horas)
            $proximasSalidas = RutaEjecutada::with(['ruta', 'vehiculo', 'chofer.persona'])
                ->porFecha($hoy)
                ->porEstado('programada')
                ->where('hora_salida_programada', '>=', Carbon::now()->format('H:i'))
                ->where('hora_salida_programada', '<=', Carbon::now()->addHours(2)->format('H:i'))
                ->orderBy('hora_salida_programada')
                ->get();

            return response()->json([
                'hoy' => $estadisticasHoy,
                'mes' => $estadisticasMes,
                'vehiculos' => $estadosVehiculos,
                'top_rutas' => $topRutas,
                'top_agencias' => $topAgencias,
                'proximas_salidas' => $proximasSalidas
            ]);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Error al obtener estadísticas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener ventas por periodo
     */
    public function ventasPorPeriodo(Request $request)
    {
        $request->validate([
            'periodo' => 'required|in:dia,semana,mes,año',
            'fecha' => 'nullable|date'
        ]);

        try {
            $fecha = $request->fecha ? Carbon::parse($request->fecha) : Carbon::now();

            switch ($request->periodo) {
                case 'dia':
                    $inicio = $fecha->copy()->startOfDay();
                    $fin = $fecha->copy()->endOfDay();
                    $intervalo = 'hour';
                    break;
                case 'semana':
                    $inicio = $fecha->copy()->startOfWeek();
                    $fin = $fecha->copy()->endOfWeek();
                    $intervalo = 'day';
                    break;
                case 'mes':
                    $inicio = $fecha->copy()->startOfMonth();
                    $fin = $fecha->copy()->endOfMonth();
                    $intervalo = 'day';
                    break;
                case 'año':
                    $inicio = $fecha->copy()->startOfYear();
                    $fin = $fecha->copy()->endOfYear();
                    $intervalo = 'month';
                    break;
            }

            $ventas = Venta::select(
                DB::raw('DATE(fecha_hora_venta) as fecha'),
                DB::raw('COUNT(*) as cantidad'),
                DB::raw('SUM(total_venta) as monto')
            )
                ->porPeriodo($inicio, $fin)
                ->groupBy('fecha')
                ->orderBy('fecha')
                ->get();

            return response()->json([
                'periodo' => $request->periodo,
                'inicio' => $inicio->format('Y-m-d'),
                'fin' => $fin->format('Y-m-d'),
                'total_ventas' => $ventas->sum('cantidad'),
                'monto_total' => $ventas->sum('monto'),
                'detalle' => $ventas
            ]);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Error al obtener ventas por periodo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener ocupación de rutas
     */
    public function ocupacionRutas(Request $request)
    {
        $request->validate([
            'fecha' => 'required|date'
        ]);

        try {
            $fecha = Carbon::parse($request->fecha);

            $rutas = RutaEjecutada::with(['ruta', 'vehiculo'])
                ->porFecha($fecha)
                ->get()
                ->map(function ($rutaEjecutada) {
                    return [
                        'ruta' => $rutaEjecutada->ruta->nombre_ruta,
                        'hora_salida' => $rutaEjecutada->hora_salida_programada,
                        'vehiculo' => $rutaEjecutada->vehiculo->placa,
                        'capacidad' => $rutaEjecutada->capacidad_vehiculo,
                        'reservados' => $rutaEjecutada->asientos_reservados,
                        'disponibles' => $rutaEjecutada->asientos_libres,
                        'porcentaje_ocupacion' => $rutaEjecutada->porcentaje_ocupacion,
                        'estado' => $rutaEjecutada->estado
                    ];
                });

            $resumen = [
                'total_rutas' => $rutas->count(),
                'capacidad_total' => $rutas->sum('capacidad'),
                'asientos_reservados' => $rutas->sum('reservados'),
                'asientos_disponibles' => $rutas->sum('disponibles'),
                'porcentaje_ocupacion_general' => $rutas->count() > 0
                    ? round(($rutas->sum('reservados') / $rutas->sum('capacidad')) * 100, 2)
                    : 0,
                'rutas_llenas' => $rutas->where('porcentaje_ocupacion', '>=', 90)->count(),
                'rutas_con_disponibilidad' => $rutas->where('disponibles', '>', 0)->count()
            ];

            return response()->json([
                'fecha' => $fecha->format('Y-m-d'),
                'resumen' => $resumen,
                'rutas' => $rutas
            ]);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Error al obtener ocupación de rutas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener rendimiento de empleados
     */
    public function rendimientoEmpleados(Request $request)
    {
        $request->validate([
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio'
        ]);

        try {
            $inicio = Carbon::parse($request->fecha_inicio);
            $fin = Carbon::parse($request->fecha_fin);

            // Rendimiento de vendedores
            $vendedores = Empleado::select('empleados.id', 'empleados.codigo_empleado')
                ->with('persona:id,nombres,apellidos')
                ->withCount(['ventasRealizadas as ventas_total' => function ($q) use ($inicio, $fin) {
                    $q->porPeriodo($inicio, $fin);
                }])
                ->withSum(['ventasRealizadas as monto_total' => function ($q) use ($inicio, $fin) {
                    $q->porPeriodo($inicio, $fin);
                }], 'total_venta')
                ->withSum(['ventasRealizadas as comisiones_total' => function ($q) use ($inicio, $fin) {
                    $q->porPeriodo($inicio, $fin);
                }], 'comision_vendedor')
                ->having('ventas_total', '>', 0)
                ->orderBy('monto_total', 'desc')
                ->get();

            // Rendimiento de choferes
            $choferes = Empleado::select('empleados.id', 'empleados.codigo_empleado')
                ->with('persona:id,nombres,apellidos')
                ->withCount(['rutasComoChofer as rutas_total' => function ($q) use ($inicio, $fin) {
                    $q->whereBetween('fecha_operacion', [$inicio, $fin])
                        ->where('estado', 'completada');
                }])
                ->withSum(['rutasComoChofer as pasajeros_transportados' => function ($q) use ($inicio, $fin) {
                    $q->whereBetween('fecha_operacion', [$inicio, $fin])
                        ->where('estado', 'completada');
                }], 'pasajeros_abordaron')
                ->withSum(['rutasComoChofer as kilometros_recorridos' => function ($q) use ($inicio, $fin) {
                    $q->whereBetween('fecha_operacion', [$inicio, $fin])
                        ->where('estado', 'completada');
                }], 'kilometros_recorridos')
                ->having('rutas_total', '>', 0)
                ->orderBy('rutas_total', 'desc')
                ->get();

            return response()->json([
                'periodo' => [
                    'inicio' => $inicio->format('Y-m-d'),
                    'fin' => $fin->format('Y-m-d')
                ],
                'vendedores' => $vendedores->map(function ($vendedor) {
                    return [
                        'id' => $vendedor->id,
                        'codigo' => $vendedor->codigo_empleado,
                        'nombre' => $vendedor->persona->nombre_completo,
                        'ventas_realizadas' => $vendedor->ventas_total,
                        'monto_vendido' => $vendedor->monto_total ?? 0,
                        'comisiones_ganadas' => $vendedor->comisiones_total ?? 0,
                        'promedio_por_venta' => $vendedor->ventas_total > 0
                            ? round($vendedor->monto_total / $vendedor->ventas_total, 2)
                            : 0
                    ];
                }),
                'choferes' => $choferes->map(function ($chofer) {
                    return [
                        'id' => $chofer->id,
                        'codigo' => $chofer->codigo_empleado,
                        'nombre' => $chofer->persona->nombre_completo,
                        'rutas_completadas' => $chofer->rutas_total,
                        'pasajeros_transportados' => $chofer->pasajeros_transportados ?? 0,
                        'kilometros_recorridos' => $chofer->kilometros_recorridos ?? 0,
                        'promedio_pasajeros_por_ruta' => $chofer->rutas_total > 0
                            ? round($chofer->pasajeros_transportados / $chofer->rutas_total, 2)
                            : 0
                    ];
                })
            ]);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Error al obtener rendimiento de empleados',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener análisis de rentabilidad
     */
    public function analisisRentabilidad(Request $request)
    {
        $request->validate([
            'mes' => 'required|date_format:Y-m'
        ]);

        try {
            $mes = Carbon::parse($request->mes . '-01');
            $inicioMes = $mes->copy()->startOfMonth();
            $finMes = $mes->copy()->endOfMonth();

            // Ingresos
            $ingresos = Venta::porPeriodo($inicioMes, $finMes)
                ->whereHas('estadoVenta', function ($q) {
                    $q->where('cuenta_ingreso', true);
                })
                ->sum('total_venta');

            // Costos operativos
            $costosOperativos = RutaEjecutada::whereBetween('fecha_operacion', [$inicioMes, $finMes])
                ->where('estado', 'completada')
                ->select(
                    DB::raw('SUM(costo_combustible) as combustible'),
                    DB::raw('SUM(costo_chofer) as choferes'),
                    DB::raw('SUM(costo_peajes) as peajes')
                )
                ->first();

            // Comisiones
            $comisiones = Venta::porPeriodo($inicioMes, $finMes)
                ->select(
                    DB::raw('SUM(comision_agencia) as agencias'),
                    DB::raw('SUM(comision_vendedor) as vendedores')
                )
                ->first();

            // Análisis por ruta
            $rentabilidadPorRuta = Reserva::select('ruta_id')
                ->with('ruta:id,nombre_ruta')
                ->porRangoFechas($inicioMes, $finMes)
                ->groupBy('ruta_id')
                ->selectRaw('COUNT(*) as total_reservas')
                ->selectRaw('SUM(precio_total) as ingresos')
                ->get()
                ->map(function ($item) use ($inicioMes, $finMes) {
                    $costos = RutaEjecutada::where('ruta_id', $item->ruta_id)
                        ->whereBetween('fecha_operacion', [$inicioMes, $finMes])
                        ->where('estado', 'completada')
                        ->sum(DB::raw('costo_combustible + costo_chofer + costo_peajes'));

                    return [
                        'ruta' => $item->ruta->nombre_ruta,
                        'reservas' => $item->total_reservas,
                        'ingresos' => $item->ingresos,
                        'costos' => $costos,
                        'utilidad' => $item->ingresos - $costos,
                        'margen' => $item->ingresos > 0
                            ? round((($item->ingresos - $costos) / $item->ingresos) * 100, 2)
                            : 0
                    ];
                });

            $totalCostos = ($costosOperativos->combustible ?? 0) +
                ($costosOperativos->choferes ?? 0) +
                ($costosOperativos->peajes ?? 0) +
                ($comisiones->agencias ?? 0) +
                ($comisiones->vendedores ?? 0);

            $utilidadBruta = $ingresos - $totalCostos;
            $margenUtilidad = $ingresos > 0 ? round(($utilidadBruta / $ingresos) * 100, 2) : 0;

            return response()->json([
                'periodo' => $mes->format('Y-m'),
                'resumen' => [
                    'ingresos_totales' => $ingresos,
                    'costos_totales' => $totalCostos,
                    'utilidad_bruta' => $utilidadBruta,
                    'margen_utilidad' => $margenUtilidad
                ],
                'detalle_costos' => [
                    'combustible' => $costosOperativos->combustible ?? 0,
                    'choferes' => $costosOperativos->choferes ?? 0,
                    'peajes' => $costosOperativos->peajes ?? 0,
                    'comisiones_agencias' => $comisiones->agencias ?? 0,
                    'comisiones_vendedores' => $comisiones->vendedores ?? 0
                ],
                'rentabilidad_por_ruta' => $rentabilidadPorRuta->sortByDesc('utilidad')->values()
            ]);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Error al obtener análisis de rentabilidad',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener alertas y notificaciones del sistema
     */
    public function alertas()
    {
        try {
            $alertas = [];
            $hoy = Carbon::today();

            // Vehículos con documentos por vencer (próximos 30 días)
            $vehiculosDocumentos = Vehiculo::where(function ($q) use ($hoy) {
                $q->whereBetween('vencimiento_seguro', [$hoy, $hoy->copy()->addDays(30)])
                    ->orWhereBetween('vencimiento_tarjeta_circulacion', [$hoy, $hoy->copy()->addDays(30)]);
            })
                ->get()
                ->map(function ($vehiculo) {
                    $alertas = [];
                    if ($vehiculo->vencimiento_seguro && $vehiculo->vencimiento_seguro->diffInDays() <= 30) {
                        $alertas[] = [
                            'tipo' => 'warning',
                            'categoria' => 'vehiculo_documento',
                            'mensaje' => "Seguro del vehículo {$vehiculo->placa} vence en {$vehiculo->vencimiento_seguro->diffInDays()} días",
                            'fecha_vencimiento' => $vehiculo->vencimiento_seguro->format('Y-m-d')
                        ];
                    }
                    if ($vehiculo->vencimiento_tarjeta_circulacion && $vehiculo->vencimiento_tarjeta_circulacion->diffInDays() <= 30) {
                        $alertas[] = [
                            'tipo' => 'warning',
                            'categoria' => 'vehiculo_documento',
                            'mensaje' => "Tarjeta de circulación del vehículo {$vehiculo->placa} vence en {$vehiculo->vencimiento_tarjeta_circulacion->diffInDays()} días",
                            'fecha_vencimiento' => $vehiculo->vencimiento_tarjeta_circulacion->format('Y-m-d')
                        ];
                    }
                    return $alertas;
                })
                ->flatten();

            // Licencias de choferes por vencer
            $licenciasChoferes = ChoferDetalle::whereBetween('fecha_vencimiento_licencia', [$hoy, $hoy->copy()->addDays(30)])
                ->with('empleado.persona')
                ->get()
                ->map(function ($chofer) {
                    return [
                        'tipo' => 'warning',
                        'categoria' => 'chofer_licencia',
                        'mensaje' => "Licencia de {$chofer->empleado->nombre_completo} vence en {$chofer->fecha_vencimiento_licencia->diffInDays()} días",
                        'fecha_vencimiento' => $chofer->fecha_vencimiento_licencia->format('Y-m-d')
                    ];
                });

            // Rutas con alta ocupación para hoy
            $rutasAltaOcupacion = RutaEjecutada::porFecha($hoy)
                ->where('estado', 'programada')
                ->get()
                ->filter(function ($ruta) {
                    return $ruta->porcentaje_ocupacion >= 85;
                })
                ->map(function ($ruta) {
                    return [
                        'tipo' => 'info',
                        'categoria' => 'ruta_ocupacion',
                        'mensaje' => "Ruta {$ruta->ruta->nombre_ruta} tiene {$ruta->porcentaje_ocupacion}% de ocupación",
                        'hora_salida' => $ruta->hora_salida_programada
                    ];
                });

            // Reservas pendientes de confirmar
            $reservasPendientes = Reserva::pendientes()
                ->whereDate('fecha_viaje', '<=', $hoy->copy()->addDays(2))
                ->count();

            if ($reservasPendientes > 0) {
                $alertas[] = [
                    'tipo' => 'warning',
                    'categoria' => 'reservas_pendientes',
                    'mensaje' => "Hay {$reservasPendientes} reservas pendientes de confirmar para los próximos 2 días"
                ];
            }

            // Compilar todas las alertas
            $todasLasAlertas = collect($alertas)
                ->merge($vehiculosDocumentos)
                ->merge($licenciasChoferes)
                ->merge($rutasAltaOcupacion)
                ->sortBy('tipo')
                ->values();

            return response()->json([
                'total_alertas' => $todasLasAlertas->count(),
                'alertas' => $todasLasAlertas
            ]);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Error al obtener alertas',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
