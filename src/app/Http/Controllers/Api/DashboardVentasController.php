<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardVentasController extends Controller
{
    /**
     * Métricas principales del dashboard
     */
    public function metricas(Request $request)
    {
        try {
            $hoy = Carbon::now('America/Guatemala');
            $inicioMes = $hoy->copy()->startOfMonth();
            $finMes = $hoy->copy()->endOfMonth();

            // Ventas del día (solo reservas confirmadas)
            $ventasDelDia = DB::table('reserva as r')
                ->join('estado as e', 'r.estado_id', '=', 'e.estado_id')
                ->where('e.estado_estado', 'LIKE', '%confirm%')
                ->whereDate('r.created_at', $hoy->toDateString())
                ->where('r.reserva_situacion', 1)
                ->sum('r.reserva_monto');

            // Ventas del mes
            $ventasDelMes = DB::table('reserva as r')
                ->join('estado as e', 'r.estado_id', '=', 'e.estado_id')
                ->where('e.estado_estado', 'LIKE', '%confirm%')
                ->whereBetween('r.created_at', [$inicioMes, $finMes])
                ->where('r.reserva_situacion', 1)
                ->sum('r.reserva_monto');

            // Reservas activas (pendientes + confirmadas)
            $reservasActivas = DB::table('reserva as r')
                ->join('estado as e', 'r.estado_id', '=', 'e.estado_id')
                ->where(function ($query) {
                    $query->where('e.estado_estado', 'LIKE', '%pendiente%')
                        ->orWhere('e.estado_estado', 'LIKE', '%confirm%');
                })
                ->where('r.reserva_situacion', 1)
                ->count();

            // Ingresos pendientes (reservas pendientes)
            $ingresosPendientes = DB::table('reserva as r')
                ->join('estado as e', 'r.estado_id', '=', 'e.estado_id')
                ->where('e.estado_estado', 'LIKE', '%pendiente%')
                ->where('r.reserva_situacion', 1)
                ->sum('r.reserva_monto');

            return response()->json([
                'ventas_del_dia' => floatval($ventasDelDia ?? 0),
                'ventas_del_mes' => floatval($ventasDelMes ?? 0),
                'reservas_activas' => intval($reservasActivas ?? 0),
                'ingresos_pendientes' => floatval($ingresosPendientes ?? 0),
                'fecha_actualizacion' => $hoy->format('Y-m-d H:i:s')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al obtener métricas',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Ventas por día (últimos 30 días)
     */
    public function ventasPorDia(Request $request)
    {
        try {
            $fechaInicio = Carbon::now('America/Guatemala')->subDays(30);
            $fechaFin = Carbon::now('America/Guatemala');

            $ventas = DB::table('reserva as r')
                ->join('estado as e', 'r.estado_id', '=', 'e.estado_id')
                ->select(
                    DB::raw('DATE(r.created_at) as fecha'),
                    DB::raw('SUM(r.reserva_monto) as total'),
                    DB::raw('COUNT(*) as cantidad_reservas')
                )
                ->where('e.estado_estado', 'LIKE', '%confirm%')
                ->where('r.reserva_situacion', 1)
                ->whereBetween('r.created_at', [$fechaInicio, $fechaFin])
                ->groupBy(DB::raw('DATE(r.created_at)'))
                ->orderBy('fecha')
                ->get();

            return response()->json([
                'datos' => $ventas->map(function ($venta) {
                    return [
                        'fecha' => $venta->fecha,
                        'total' => floatval($venta->total),
                        'cantidad' => intval($venta->cantidad_reservas)
                    ];
                })
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al obtener ventas por día',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Distribución de reservas por estado
     */
    public function reservasPorEstado(Request $request)
    {
        try {
            $distribucion = DB::table('reserva as r')
                ->join('estado as e', 'r.estado_id', '=', 'e.estado_id')
                ->select(
                    'e.estado_estado as estado',
                    DB::raw('COUNT(*) as cantidad'),
                    DB::raw('SUM(r.reserva_monto) as total_monto')
                )
                ->where('r.reserva_situacion', 1)
                ->groupBy('e.estado_id', 'e.estado_estado')
                ->orderByDesc('cantidad')
                ->get();

            return response()->json([
                'datos' => $distribucion->map(function ($estado) {
                    return [
                        'estado' => $estado->estado,
                        'cantidad' => intval($estado->cantidad),
                        'monto' => floatval($estado->total_monto ?? 0)
                    ];
                })
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al obtener distribución por estado',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Ventas por agencia vs ventas directas
     */
    public function ventasPorAgencia(Request $request)
    {
        try {
            $ventasAgencia = DB::table('reserva as r')
                ->join('estado as e', 'r.estado_id', '=', 'e.estado_id')
                ->join('agencia as a', 'r.agencia_id', '=', 'a.agencia_id')
                ->select(
                    'a.agencia_razon_social as agencia',
                    DB::raw('COUNT(*) as cantidad_reservas'),
                    DB::raw('SUM(r.reserva_monto) as total_ventas')
                )
                ->where('e.estado_estado', 'LIKE', '%confirm%')
                ->where('r.reserva_situacion', 1)
                ->whereNotNull('r.agencia_id')
                ->groupBy('a.agencia_id', 'a.agencia_razon_social')
                ->orderByDesc('total_ventas')
                ->limit(10)
                ->get();

            // Ventas directas
            $ventasDirectas = DB::table('reserva as r')
                ->join('estado as e', 'r.estado_id', '=', 'e.estado_id')
                ->select(
                    DB::raw('COUNT(*) as cantidad_reservas'),
                    DB::raw('SUM(r.reserva_monto) as total_ventas')
                )
                ->where('e.estado_estado', 'LIKE', '%confirm%')
                ->where('r.reserva_situacion', 1)
                ->whereNull('r.agencia_id')
                ->first();

            $datos = collect();

            // Agregar ventas directas
            if ($ventasDirectas && $ventasDirectas->total_ventas > 0) {
                $datos->push([
                    'tipo' => 'VENTA DIRECTA',
                    'cantidad' => intval($ventasDirectas->cantidad_reservas),
                    'total' => floatval($ventasDirectas->total_ventas)
                ]);
            }

            // Agregar ventas por agencia
            foreach ($ventasAgencia as $venta) {
                $datos->push([
                    'tipo' => $venta->agencia,
                    'cantidad' => intval($venta->cantidad_reservas),
                    'total' => floatval($venta->total_ventas)
                ]);
            }

            return response()->json([
                'datos' => $datos->sortByDesc('total')->values()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al obtener ventas por agencia',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Top vendedores
     */
    public function topVendedores(Request $request)
    {
        try {
            $limite = $request->get('limite', 5);

            $vendedores = DB::table('reserva as r')
                ->join('estado as e', 'r.estado_id', '=', 'e.estado_id')
                ->join('usuario as u', 'r.usuario_id', '=', 'u.usuario_id')
                ->join('persona as p', 'u.persona_id', '=', 'p.persona_id')
                ->select(
                    DB::raw('CONCAT(p.persona_nombres, " ", p.persona_apellidos) as vendedor'),
                    DB::raw('COUNT(*) as total_reservas'),
                    DB::raw('SUM(r.reserva_monto) as total_ventas'),
                    DB::raw('AVG(r.reserva_monto) as promedio_venta')
                )
                ->where('e.estado_estado', 'LIKE', '%confirm%')
                ->where('r.reserva_situacion', 1)
                ->groupBy('u.usuario_id', 'p.persona_nombres', 'p.persona_apellidos')
                ->orderByDesc('total_ventas')
                ->limit($limite)
                ->get();

            return response()->json([
                'datos' => $vendedores->map(function ($vendedor, $index) {
                    return [
                        'posicion' => $index + 1,
                        'vendedor' => $vendedor->vendedor,
                        'reservas' => intval($vendedor->total_reservas),
                        'ventas' => floatval($vendedor->total_ventas),
                        'promedio' => floatval($vendedor->promedio_venta)
                    ];
                })
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al obtener top vendedores',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Rutas más vendidas
     */
    public function rutasMasVendidas(Request $request)
    {
        try {
            $limite = $request->get('limite', 5);

            $rutas = DB::table('reserva as r')
                ->join('estado as e', 'r.estado_id', '=', 'e.estado_id')
                ->join('ruta_activada as ra', 'r.ruta_activada_id', '=', 'ra.ruta_activada_id')
                ->join('ruta as rt', 'ra.ruta_id', '=', 'rt.ruta_id')
                ->select(
                    DB::raw('CONCAT(rt.ruta_origen, " → ", rt.ruta_destino) as ruta'),
                    DB::raw('COUNT(*) as total_reservas'),
                    DB::raw('SUM(r.reserva_monto) as total_ingresos'),
                    DB::raw('SUM(r.reserva_cantidad_adultos + COALESCE(r.reserva_cantidad_ninos, 0)) as total_pasajeros')
                )
                ->where('e.estado_estado', 'LIKE', '%confirm%')
                ->where('r.reserva_situacion', 1)
                ->groupBy('rt.ruta_id', 'rt.ruta_origen', 'rt.ruta_destino')
                ->orderByDesc('total_ingresos')
                ->limit($limite)
                ->get();

            return response()->json([
                'datos' => $rutas->map(function ($ruta, $index) {
                    return [
                        'posicion' => $index + 1,
                        'ruta' => $ruta->ruta,
                        'reservas' => intval($ruta->total_reservas),
                        'ingresos' => floatval($ruta->total_ingresos),
                        'pasajeros' => intval($ruta->total_pasajeros)
                    ];
                })
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al obtener rutas más vendidas',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Resumen general del dashboard
     */
    public function resumenGeneral(Request $request)
    {
        try {
            $metricas = $this->metricas($request)->getData();

            // Comparación con período anterior
            $hoy = Carbon::now('America/Guatemala');
            $ayer = $hoy->copy()->subDay();
            $mesAnterior = $hoy->copy()->subMonth();

            $ventasAyer = DB::table('reserva as r')
                ->join('estado as e', 'r.estado_id', '=', 'e.estado_id')
                ->where('e.estado_estado', 'LIKE', '%confirm%')
                ->whereDate('r.created_at', $ayer->toDateString())
                ->where('r.reserva_situacion', 1)
                ->sum('r.reserva_monto');

            $ventasMesAnterior = DB::table('reserva as r')
                ->join('estado as e', 'r.estado_id', '=', 'e.estado_id')
                ->where('e.estado_estado', 'LIKE', '%confirm%')
                ->whereBetween('r.created_at', [
                    $mesAnterior->startOfMonth(),
                    $mesAnterior->endOfMonth()
                ])
                ->where('r.reserva_situacion', 1)
                ->sum('r.reserva_monto');

            // Calcular variaciones
            $variacionDiaria = $ventasAyer > 0 ?
                (($metricas->ventas_del_dia - $ventasAyer) / $ventasAyer) * 100 : 0;

            $variacionMensual = $ventasMesAnterior > 0 ?
                (($metricas->ventas_del_mes - $ventasMesAnterior) / $ventasMesAnterior) * 100 : 0;

            return response()->json([
                'metricas_principales' => $metricas,
                'comparaciones' => [
                    'variacion_diaria' => round($variacionDiaria, 2),
                    'variacion_mensual' => round($variacionMensual, 2),
                    'ventas_ayer' => floatval($ventasAyer ?? 0),
                    'ventas_mes_anterior' => floatval($ventasMesAnterior ?? 0)
                ],
                'ultima_actualizacion' => Carbon::now('America/Guatemala')->format('Y-m-d H:i:s')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al obtener resumen general',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
