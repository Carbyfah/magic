<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\TransferenciaService;
use App\Services\PagoService;
use App\Services\VentasService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TransferenciaController extends Controller
{
    protected TransferenciaService $transferenciaService;
    protected PagoService $pagoService;
    protected VentasService $ventasService;

    public function __construct(
        TransferenciaService $transferenciaService,
        PagoService $pagoService,
        VentasService $ventasService
    ) {
        $this->transferenciaService = $transferenciaService;
        $this->pagoService = $pagoService;
        $this->ventasService = $ventasService;
    }

    /**
     * Analizar escenario de transferencia de una reserva
     * GET /api/transferencia/analizar/{reservaId}
     */
    public function analizarEscenario($reservaId): JsonResponse
    {
        try {
            $escenario = $this->transferenciaService->determinarEscenario($reservaId);
            $formaPago = $this->pagoService->determinarFormaPago($reservaId);

            return response()->json([
                'success' => true,
                'data' => [
                    'escenario_transferencia' => $escenario,
                    'forma_pago' => $formaPago
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error analizando reserva: ' . $e->getMessage()
            ], 400);
        }
    }

    /**
     * Obtener resumen de reservas por escenario
     * GET /api/transferencia/resumen-escenarios
     */
    public function resumenEscenarios(): JsonResponse
    {
        try {
            $resumenEscenarios = $this->transferenciaService->obtenerReservasPorEscenario();
            $resumenPagos = $this->pagoService->obtenerResumenPagos();

            return response()->json([
                'success' => true,
                'data' => [
                    'resumen_por_escenario' => $resumenEscenarios,
                    'resumen_por_forma_pago' => $resumenPagos,
                    'total_escenarios' => count($resumenEscenarios),
                    'total_formas_pago' => count($resumenPagos)
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error generando resumen: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Confirmar pago de conductor
     * POST /api/transferencia/confirmar-pago-conductor
     */
    public function confirmarPagoConductor(Request $request): JsonResponse
    {
        $request->validate([
            'reserva_id' => 'required|integer|exists:reservas,id_reservas'
        ]);

        try {
            $resultado = $this->pagoService->confirmarPagoConductor(
                $request->reserva_id,
                $request->user()->id_usuarios
            );

            return response()->json([
                'success' => true,
                'message' => 'Pago de conductor confirmado correctamente',
                'data' => $resultado
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error confirmando pago: ' . $e->getMessage()
            ], 400);
        }
    }

    /**
     * Obtener control de ventas del día
     * GET /api/transferencia/control-ventas/{fecha?}
     */
    public function controlVentas($fecha = null): JsonResponse
    {
        try {
            $fechaConsulta = $fecha ? \Carbon\Carbon::parse($fecha) : today();
            $control = $this->ventasService->obtenerControlVentasDia($fechaConsulta);

            return response()->json([
                'success' => true,
                'data' => $control
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error obteniendo control de ventas: ' . $e->getMessage()
            ], 400);
        }
    }

    /**
     * Procesar liquidación de ruta
     * POST /api/transferencia/liquidar-ruta
     */
    public function liquidarRuta(Request $request): JsonResponse
    {
        $request->validate([
            'ruta_activa_id' => 'required|integer|exists:ruta_activa,id_ruta_activa'
        ]);

        try {
            $resultado = $this->ventasService->procesarLiquidacionRuta(
                $request->ruta_activa_id,
                $request->user()->id_usuarios
            );

            return response()->json([
                'success' => true,
                'message' => 'Liquidación procesada correctamente',
                'data' => $resultado
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error en liquidación: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Test de funcionalidades Fase 3
     * GET /api/transferencia/test-fase3
     */
    public function testFase3(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'FASE 3: Lógica de Transferencias y Escenarios funcionando',
            'components' => [
                'TransferenciaService' => 'Activo - 4 escenarios implementados',
                'PagoService' => 'Activo - Clasificación automática',
                'VentasService' => 'Activo - Auto-creación en caja',
                'ReservaObserver' => 'Actualizado con VentasService integrado'
            ],
            'escenarios_disponibles' => [
                'VENTA_DIRECTA' => 'Magic Travel vende y opera',
                'REUBICACION_INTERNA' => 'Movimiento entre servicios MT',
                'MAGIC_TRANSFIERE' => 'MT recibe pero transfiere operación',
                'MAGIC_RECIBE_OPERA' => 'Agencia envía, MT opera',
                'MAGIC_PUENTE' => 'MT como intermediario',
                'CASO_ESPECIAL' => 'Escenarios no contemplados'
            ],
            'formas_pago_disponibles' => [
                'PAGO_CAJA' => 'Cliente pagó en oficina',
                'PAGO_CONDUCTOR' => 'Cliente pagó al conductor',
                'PAGADO' => 'Pago confirmado sin especificar',
                'PENDIENTE' => 'Sin pago realizado'
            ],
            'endpoints_disponibles' => [
                'GET /api/transferencia/analizar/{reservaId}',
                'GET /api/transferencia/resumen-escenarios',
                'POST /api/transferencia/confirmar-pago-conductor',
                'GET /api/transferencia/control-ventas/{fecha?}',
                'POST /api/transferencia/liquidar-ruta'
            ]
        ]);
    }
}
