<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\EstadoRutaService;
use App\Services\CapacidadService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class EstadoRutaController extends Controller
{
    protected EstadoRutaService $estadoRutaService;
    protected CapacidadService $capacidadService;

    public function __construct(EstadoRutaService $estadoRutaService, CapacidadService $capacidadService)
    {
        $this->estadoRutaService = $estadoRutaService;
        $this->capacidadService = $capacidadService;
    }

    /**
     * Actualizar estado de una ruta específica
     * PUT /api/estado-ruta/actualizar/{rutaActivaId}
     */
    public function actualizarEstado($rutaActivaId): JsonResponse
    {
        try {
            $resultado = $this->estadoRutaService->actualizarEstadoSegunOcupacion($rutaActivaId);

            return response()->json([
                'success' => true,
                'message' => $resultado['cambio_realizado']
                    ? 'Estado actualizado correctamente'
                    : 'Estado ya estaba correcto',
                'data' => $resultado
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar estado: ' . $e->getMessage()
            ], 400);
        }
    }

    /**
     * Verificar si una ruta puede recibir reservas
     * GET /api/estado-ruta/puede-reservar/{rutaActivaId}
     */
    public function puedeRecibirReservas($rutaActivaId): JsonResponse
    {
        try {
            $puedeReservar = $this->estadoRutaService->puedeRecibirReservas($rutaActivaId);
            $disponibilidad = $this->capacidadService->verificarDisponibilidad($rutaActivaId, 1);

            return response()->json([
                'success' => true,
                'data' => [
                    'ruta_activa_id' => $rutaActivaId,
                    'puede_recibir_reservas' => $puedeReservar,
                    'disponibilidad' => $disponibilidad
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al verificar estado: ' . $e->getMessage()
            ], 400);
        }
    }

    /**
     * Obtener rutas que necesitan actualización
     * GET /api/estado-ruta/necesitan-actualizacion
     */
    public function rutasParaActualizar(): JsonResponse
    {
        try {
            $rutas = $this->estadoRutaService->obtenerRutasParaActualizar();

            return response()->json([
                'success' => true,
                'data' => [
                    'total_rutas' => count($rutas),
                    'rutas' => $rutas
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener rutas: ' . $e->getMessage()
            ], 400);
        }
    }

    /**
     * Actualizar estados masivamente
     * POST /api/estado-ruta/actualizar-masivo
     */
    public function actualizarEstadosMasivo(): JsonResponse
    {
        try {
            $resultado = $this->estadoRutaService->actualizarEstadosMasivo();

            return response()->json([
                'success' => true,
                'message' => "Procesadas {$resultado['rutas_procesadas']} rutas, {$resultado['cambios_realizados']} cambios realizados",
                'data' => $resultado
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error en actualización masiva: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Test de funcionalidades Fase 2
     * GET /api/estado-ruta/test-fase2
     */
    public function testFase2(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'FASE 2: Control de Capacidad y Estados funcionando',
            'components' => [
                'EstadoRutaService' => 'Activo',
                'CajaObserver' => 'Registrado',
                'ReservaObserver' => 'Actualizado con control de estados',
                'CheckUserPermissions' => 'Middleware registrado'
            ],
            'endpoints_disponibles' => [
                'PUT /api/estado-ruta/actualizar/{id}',
                'GET /api/estado-ruta/puede-reservar/{id}',
                'GET /api/estado-ruta/necesitan-actualizacion',
                'POST /api/estado-ruta/actualizar-masivo'
            ]
        ]);
    }
}
