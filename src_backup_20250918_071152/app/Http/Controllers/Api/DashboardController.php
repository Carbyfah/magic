<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reserva;
use App\Models\Empleado;
use App\Models\Vehiculo;
use App\Models\Ruta;
use App\Models\Caja;
use App\Models\EgresoRutaActiva;
use App\Models\FacturaSat;
use App\Models\Tour;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Métricas generales del dashboard
     * GET /api/dashboard/metricas
     */
    public function metricas(): JsonResponse
    {
        try {
            $hoy = today();
            $inicioMes = $hoy->startOfMonth()->copy();
            $finMes = $hoy->endOfMonth()->copy();

            $metricas = [
                'resumen_general' => [
                    'total_reservas' => Reserva::count(),
                    'reservas_mes_actual' => Reserva::whereBetween('created_at', [$inicioMes, $finMes])->count(),
                    'total_empleados' => Empleado::count(),
                    'empleados_activos' => Empleado::where('empleados_activo', true)->count(),
                    'total_vehiculos' => Vehiculo::count(),
                    'vehiculos_activos' => Vehiculo::where('vehiculo_activo', true)->count(),
                    'total_rutas' => Ruta::count(),
                    'rutas_activas' => Ruta::where('rutas_activa', true)->count(),
                ],
                'financiero_mensual' => [
                    'ingresos_caja' => Caja::whereBetween('fecha_servicio', [$inicioMes, $finMes])
                        ->sum('servicio_cobrar_pax'),
                    'egresos_total' => EgresoRutaActiva::whereBetween('fecha_egreso', [$inicioMes, $finMes])
                        ->sum('cantidad_egreso'),
                    'facturas_emitidas' => FacturaSat::whereBetween('fecha_factura', [$inicioMes, $finMes])->count(),
                    'monto_facturado' => FacturaSat::whereBetween('fecha_factura', [$inicioMes, $finMes])
                        ->sum('total_factura'),
                ],
                'actividad_reciente' => [
                    'reservas_hoy' => Reserva::whereDate('created_at', $hoy)->count(),
                    'servicios_hoy' => Caja::whereDate('fecha_servicio', $hoy)->count(),
                    'egresos_hoy' => EgresoRutaActiva::whereDate('fecha_egreso', $hoy)->count(),
                    'facturas_pendientes' => FacturaSat::where('estado_sat', 'Pendiente')->count(),
                ],
                'tours_populares' => Tour::where('tours_activo', true)
                    ->orderBy('tours_nombre')
                    ->limit(5)
                    ->get(['id_tours', 'tours_nombre', 'tours_precio_base'])
            ];

            return response()->json([
                'success' => true,
                'data' => $metricas
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error obteniendo métricas: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Estadísticas por período
     * GET /api/dashboard/estadisticas
     */
    public function estadisticas(Request $request): JsonResponse
    {
        $fechaInicio = $request->get('fecha_inicio', today()->subDays(30)->format('Y-m-d'));
        $fechaFin = $request->get('fecha_fin', today()->format('Y-m-d'));

        try {
            $estadisticas = [
                'periodo' => [
                    'inicio' => $fechaInicio,
                    'fin' => $fechaFin,
                    'dias' => Carbon::parse($fechaInicio)->diffInDays($fechaFin) + 1
                ],
                'reservas' => [
                    'total' => Reserva::whereBetween('created_at', [$fechaInicio, $fechaFin])->count(),
                    'promedio_diario' => round(
                        Reserva::whereBetween('created_at', [$fechaInicio, $fechaFin])->count() /
                            (Carbon::parse($fechaInicio)->diffInDays($fechaFin) + 1),
                        2
                    ),
                ],
                'ingresos' => [
                    'total_caja' => Caja::whereBetween('fecha_servicio', [$fechaInicio, $fechaFin])
                        ->sum('servicio_cobrar_pax'),
                    'total_facturado' => FacturaSat::whereBetween('fecha_factura', [$fechaInicio, $fechaFin])
                        ->sum('total_factura'),
                ],
                'gastos' => [
                    'total_egresos' => EgresoRutaActiva::whereBetween('fecha_egreso', [$fechaInicio, $fechaFin])
                        ->sum('cantidad_egreso'),
                    'promedio_por_egreso' => EgresoRutaActiva::whereBetween('fecha_egreso', [$fechaInicio, $fechaFin])
                        ->avg('cantidad_egreso'),
                ],
                'rentabilidad' => [
                    'margen_bruto' => $this->calcularMargenBruto($fechaInicio, $fechaFin)
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $estadisticas
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error obteniendo estadísticas: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Alertas y notificaciones importantes
     * GET /api/dashboard/alertas
     */
    public function alertas(): JsonResponse
    {
        try {
            $alertas = [
                'vehiculos_mantenimiento' => Vehiculo::where('vehiculo_activo', true)
                    ->whereNotNull('vehiculo_observaciones')
                    ->count(),
                'empleados_cumpleanos' => Empleado::where('empleados_activo', true)
                    ->whereMonth('empleados_fecha_nacimiento', today()->month)
                    ->whereDay('empleados_fecha_nacimiento', '>=', today()->day)
                    ->whereDay('empleados_fecha_nacimiento', '<=', today()->addDays(7)->day)
                    ->count(),
                'facturas_error' => FacturaSat::whereNotNull('error_sat')->count(),
                'reservas_pendientes' => Reserva::whereHas('estado', function ($q) {
                    $q->where('estado_nombre', 'like', '%pendiente%');
                })->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => $alertas
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error obteniendo alertas: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actividad reciente del sistema
     * GET /api/dashboard/actividad-reciente
     */
    public function actividadReciente(): JsonResponse
    {
        try {
            $actividad = [
                'reservas_recientes' => Reserva::with(['estado'])
                    ->orderBy('created_at', 'desc')
                    ->limit(5)
                    ->get()
                    ->map(function ($reserva) {
                        return [
                            'id' => $reserva->id_reservas,
                            'cliente' => $reserva->reservas_nombres_cliente . ' ' . $reserva->reservas_apellidos_cliente,
                            'fecha_servicio' => $reserva->reservas_fecha_servicio?->format('d/m/Y'),
                            'estado' => $reserva->estado->estado_nombre ?? 'Sin estado',
                            'tiempo' => $reserva->created_at->diffForHumans(),
                        ];
                    }),
                'servicios_recientes' => Caja::orderBy('fecha_servicio', 'desc')
                    ->limit(5)
                    ->get()
                    ->map(function ($servicio) {
                        return [
                            'id' => $servicio->id_caja,
                            'ruta' => $servicio->origen . ' → ' . $servicio->destino,
                            'monto' => 'Q' . number_format($servicio->servicio_cobrar_pax, 2),
                            'fecha' => $servicio->fecha_servicio->format('d/m/Y'),
                        ];
                    }),
                'facturas_recientes' => FacturaSat::orderBy('created_at', 'desc')
                    ->limit(5)
                    ->get()
                    ->map(function ($factura) {
                        return [
                            'id' => $factura->id_facturas_sat,
                            'cliente' => $factura->nombre_cliente,
                            'monto' => 'Q' . number_format($factura->total_factura, 2),
                            'estado' => $factura->estado_sat ?? 'Pendiente',
                            'fecha' => $factura->fecha_factura->format('d/m/Y'),
                        ];
                    }),
            ];

            return response()->json([
                'success' => true,
                'data' => $actividad
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error obteniendo actividad reciente: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Calcular margen bruto
     */
    private function calcularMargenBruto(string $fechaInicio, string $fechaFin): array
    {
        $ingresos = Caja::whereBetween('fecha_servicio', [$fechaInicio, $fechaFin])
            ->sum('servicio_cobrar_pax');

        $egresos = EgresoRutaActiva::whereBetween('fecha_egreso', [$fechaInicio, $fechaFin])
            ->sum('cantidad_egreso');

        $margenBruto = $ingresos - $egresos;
        $porcentajeMargen = $ingresos > 0 ? round(($margenBruto / $ingresos) * 100, 2) : 0;

        return [
            'ingresos' => $ingresos,
            'egresos' => $egresos,
            'margen_absoluto' => $margenBruto,
            'margen_porcentaje' => $porcentajeMargen,
            'ingresos_formateado' => 'Q' . number_format($ingresos, 2),
            'egresos_formateado' => 'Q' . number_format($egresos, 2),
            'margen_formateado' => 'Q' . number_format($margenBruto, 2),
        ];
    }
}
