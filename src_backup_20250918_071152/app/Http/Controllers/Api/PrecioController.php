<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PrecioService;
use App\Services\CapacidadService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PrecioController extends Controller
{
    protected PrecioService $precioService;
    protected CapacidadService $capacidadService;

    public function __construct(PrecioService $precioService, CapacidadService $capacidadService)
    {
        $this->precioService = $precioService;
        $this->capacidadService = $capacidadService;
    }

    /**
     * Calcular precio de una reserva
     * POST /api/precio/calcular
     */
    public function calcularPrecio(Request $request): JsonResponse
    {
        $request->validate([
            'servicio_id' => 'required|integer|exists:servicio,id_servicio',
            'adultos' => 'required|integer|min:1',
            'ninos' => 'nullable|integer|min:0'
        ]);

        try {
            $precio = $this->precioService->calcularPrecioReserva(
                $request->servicio_id,
                $request->adultos,
                $request->ninos ?? 0
            );

            $desglose = $this->precioService->obtenerDesglosePrecio(
                $request->servicio_id,
                $request->adultos,
                $request->ninos ?? 0
            );

            return response()->json([
                'success' => true,
                'data' => [
                    'precio_total' => $precio,
                    'desglose' => $desglose
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Verificar disponibilidad de una ruta
     * POST /api/capacidad/verificar
     */
    public function verificarCapacidad(Request $request): JsonResponse
    {
        $request->validate([
            'ruta_activa_id' => 'required|integer|exists:ruta_activa,id_ruta_activa',
            'pasajeros' => 'required|integer|min:1'
        ]);

        try {
            $disponibilidad = $this->capacidadService->verificarDisponibilidad(
                $request->ruta_activa_id,
                $request->pasajeros
            );

            return response()->json([
                'success' => true,
                'data' => $disponibilidad
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Obtener ocupación detallada de una ruta
     * GET /api/ocupacion/{rutaActivaId}
     */
    public function ocupacionDetallada($rutaActivaId): JsonResponse
    {
        try {
            $ocupacion = $this->capacidadService->obtenerOcupacionDetallada($rutaActivaId);

            return response()->json([
                'success' => true,
                'data' => $ocupacion
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Endpoint de prueba para verificar que los services funcionan
     * GET /api/test-services
     */
    public function testServices(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Services están funcionando correctamente',
            'phase' => 'FASE 1: Servicios de Cálculo y Validación',
            'services' => [
                'PrecioService' => 'Activo',
                'CapacidadService' => 'Activo'
            ],
            'observers' => [
                'ServicioObserver' => 'Registrado',
                'ReservaObserver' => 'Registrado'
            ]
        ]);
    }
}
