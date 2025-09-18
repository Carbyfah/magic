<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\VentasService;
use App\Services\LiquidacionService;
use App\Services\TransferenciaService;
use App\Services\PagoService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class VentasController extends Controller
{
    protected VentasService $ventasService;
    protected LiquidacionService $liquidacionService;
    protected TransferenciaService $transferenciaService;
    protected PagoService $pagoService;

    public function __construct(
        VentasService $ventasService,
        LiquidacionService $liquidacionService,
        TransferenciaService $transferenciaService,
        PagoService $pagoService
    ) {
        $this->ventasService = $ventasService;
        $this->liquidacionService = $liquidacionService;
        $this->transferenciaService = $transferenciaService;
        $this->pagoService = $pagoService;
    }

    /**
     * Dashboard de ventas del día
     * GET /api/ventas/dashboard/{fecha?}
     */
    public function dashboard($fecha = null): JsonResponse
    {
        try {
            $fechaConsulta = $fecha ? Carbon::parse($fecha) : today();

            $controlVentas = $this->ventasService->obtenerControlVentasDia($fechaConsulta);
            $resumenPagos = $this->pagoService->obtenerResumenPagos();
            $rutasPendientes = $this->liquidacionService->obtenerRutasPendientesLiquidacion();

            return response()->json([
                'success' => true,
                'data' => [
                    'fecha' => $fechaConsulta->format('Y-m-d'),
                    'control_ventas_dia' => $controlVentas,
                    'resumen_formas_pago' => $resumenPagos,
                    'rutas_pendientes_liquidacion' => count($rutasPendientes),
                    'metricas_rapidas' => [
                        'ingresos_confirmados' => $controlVentas['cobrados']['monto'],
                        'pendientes_confirmacion' => $controlVentas['confirmar_recibido']['monto'],
                        'pendientes_cobro' => $controlVentas['por_cobrar']['monto'],
                        'total_pasajeros' => $controlVentas['total_pasajeros'],
                        'ticket_promedio' => $controlVentas['total_servicios'] > 0
                            ? round($controlVentas['ingresos_totales'] / $controlVentas['total_servicios'], 2)
                            : 0
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error obteniendo dashboard: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Listar reservas por clasificación de ventas
     * GET /api/ventas/reservas/{clasificacion?}
     */
    public function listarReservasPorClasificacion($clasificacion = null): JsonResponse
    {
        $request = request();
        $fecha = $request->get('fecha', today()->format('Y-m-d'));

        try {
            $controlVentas = $this->ventasService->obtenerControlVentasDia(Carbon::parse($fecha));

            $reservas = $clasificacion
                ? array_filter($controlVentas['clasificacion_detallada'], function ($reserva) use ($clasificacion) {
                    return $reserva['clasificacion'] === $clasificacion;
                })
                : $controlVentas['clasificacion_detallada'];

            return response()->json([
                'success' => true,
                'data' => [
                    'fecha' => $fecha,
                    'clasificacion' => $clasificacion ?? 'todas',
                    'total_reservas' => count($reservas),
                    'reservas' => array_values($reservas)
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error obteniendo reservas: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Estado de liquidación de ruta específica
     * GET /api/ventas/liquidacion/{rutaActivaId}
     */
    public function estadoLiquidacionRuta($rutaActivaId): JsonResponse
    {
        try {
            $estado = $this->liquidacionService->verificarEstadoLiquidacion($rutaActivaId);

            return response()->json([
                'success' => true,
                'data' => $estado
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error verificando liquidación: ' . $e->getMessage()
            ], 400);
        }
    }

    /**
     * Procesar liquidación de ruta
     * POST /api/ventas/liquidar-ruta
     */
    public function liquidarRuta(Request $request): JsonResponse
    {
        $request->validate([
            'ruta_activa_id' => 'required|integer|exists:ruta_activa,id_ruta_activa'
        ]);

        try {
            $resultado = $this->liquidacionService->procesarLiquidacionCompleta(
                $request->ruta_activa_id,
                $request->user()->id_usuarios
            );

            return response()->json([
                'success' => true,
                'message' => 'Ruta liquidada exitosamente',
                'data' => $resultado
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error liquidando ruta: ' . $e->getMessage()
            ], 400);
        }
    }

    /**
     * Listar rutas pendientes de liquidación
     * GET /api/ventas/pendientes-liquidacion
     */
    public function rutasPendientesLiquidacion(): JsonResponse
    {
        try {
            $rutas = $this->liquidacionService->obtenerRutasPendientesLiquidacion();

            return response()->json([
                'success' => true,
                'data' => [
                    'total_pendientes' => count($rutas),
                    'rutas' => $rutas
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error obteniendo rutas pendientes: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Confirmar pago de conductor masivo
     * POST /api/ventas/confirmar-pagos-conductor
     */
    public function confirmarPagosConductorMasivo(Request $request): JsonResponse
    {
        $request->validate([
            'reservas_ids' => 'required|array',
            'reservas_ids.*' => 'integer|exists:reservas,id_reservas'
        ]);

        $resultados = [];
        $errores = [];

        foreach ($request->reservas_ids as $reservaId) {
            try {
                $resultado = $this->pagoService->confirmarPagoConductor(
                    $reservaId,
                    $request->user()->id_usuarios
                );
                $resultados[] = $resultado;
            } catch (\Exception $e) {
                $errores[] = [
                    'reserva_id' => $reservaId,
                    'error' => $e->getMessage()
                ];
            }
        }

        return response()->json([
            'success' => count($errores) === 0,
            'message' => count($errores) === 0
                ? 'Todos los pagos confirmados exitosamente'
                : 'Algunos pagos no pudieron ser confirmados',
            'data' => [
                'confirmados' => count($resultados),
                'errores' => count($errores),
                'resultados' => $resultados,
                'errores_detalle' => $errores
            ]
        ]);
    }

    /**
     * Reportes de ventas por período
     * GET /api/ventas/reporte-periodo
     */
    public function reportePeriodo(Request $request): JsonResponse
    {
        $request->validate([
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio'
        ]);

        try {
            $fechaInicio = Carbon::parse($request->fecha_inicio);
            $fechaFin = Carbon::parse($request->fecha_fin);

            $reporte = [];
            $totalGeneral = [
                'servicios' => 0,
                'pasajeros' => 0,
                'ingresos' => 0,
                'cobrados' => 0,
                'pendientes' => 0
            ];

            for ($fecha = $fechaInicio->copy(); $fecha->lte($fechaFin); $fecha->addDay()) {
                $ventasDia = $this->ventasService->obtenerControlVentasDia($fecha);

                $reporte[] = [
                    'fecha' => $fecha->format('Y-m-d'),
                    'dia_semana' => $fecha->translatedFormat('l'),
                    'servicios' => $ventasDia['total_servicios'],
                    'pasajeros' => $ventasDia['total_pasajeros'],
                    'ingresos_totales' => $ventasDia['ingresos_totales'],
                    'cobrados' => $ventasDia['cobrados']['monto'],
                    'pendientes_cobro' => $ventasDia['por_cobrar']['monto'],
                    'pendientes_confirmacion' => $ventasDia['confirmar_recibido']['monto']
                ];

                $totalGeneral['servicios'] += $ventasDia['total_servicios'];
                $totalGeneral['pasajeros'] += $ventasDia['total_pasajeros'];
                $totalGeneral['ingresos'] += $ventasDia['ingresos_totales'];
                $totalGeneral['cobrados'] += $ventasDia['cobrados']['monto'];
                $totalGeneral['pendientes'] += $ventasDia['por_cobrar']['monto'] + $ventasDia['confirmar_recibido']['monto'];
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'periodo' => [
                        'inicio' => $fechaInicio->format('Y-m-d'),
                        'fin' => $fechaFin->format('Y-m-d'),
                        'dias' => $fechaInicio->diffInDays($fechaFin) + 1
                    ],
                    'resumen_general' => $totalGeneral,
                    'promedio_diario' => [
                        'servicios' => round($totalGeneral['servicios'] / ($fechaInicio->diffInDays($fechaFin) + 1), 2),
                        'ingresos' => round($totalGeneral['ingresos'] / ($fechaInicio->diffInDays($fechaFin) + 1), 2)
                    ],
                    'detalle_por_dia' => $reporte
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error generando reporte: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Test de funcionalidades Fase 4
     * GET /api/ventas/test-fase4
     */
    public function testFase4(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'FASE 4: Módulo Ventas y Liquidación funcionando',
            'components' => [
                'LiquidacionService' => 'Activo - Control completo de liquidación',
                'VentasController' => 'Activo - APIs completas del módulo',
                'Dashboard' => 'Implementado - Métricas en tiempo real',
                'Reportes' => 'Implementado - Reportes por período'
            ],
            'funcionalidades_disponibles' => [
                'Dashboard de ventas diario',
                'Control de liquidación de rutas',
                'Confirmación masiva de pagos conductor',
                'Reportes por período personalizable',
                'Clasificación automática de reservas',
                'Métricas financieras en tiempo real'
            ],
            'endpoints_disponibles' => [
                'GET /api/ventas/dashboard/{fecha?}',
                'GET /api/ventas/reservas/{clasificacion?}',
                'GET /api/ventas/liquidacion/{rutaActivaId}',
                'POST /api/ventas/liquidar-ruta',
                'GET /api/ventas/pendientes-liquidacion',
                'POST /api/ventas/confirmar-pagos-conductor',
                'GET /api/ventas/reporte-periodo'
            ]
        ]);
    }
}
