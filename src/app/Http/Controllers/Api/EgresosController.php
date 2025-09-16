<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\EgresoRequest;
use App\Http\Resources\EgresoResource;
use App\Models\EgresoRutaActiva;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class EgresosController extends Controller
{
    /**
     * Listar egresos con filtros básicos
     * GET /api/egresos
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = EgresoRutaActiva::with(['rutaActiva.ruta', 'rutaActiva.vehiculo']);

        // Filtros básicos
        if ($request->filled('fecha_desde')) {
            $query->whereDate('fecha_egreso', '>=', $request->get('fecha_desde'));
        }

        if ($request->filled('fecha_hasta')) {
            $query->whereDate('fecha_egreso', '<=', $request->get('fecha_hasta'));
        }

        if ($request->filled('tipo')) {
            $query->where('tipo_egreso', 'like', '%' . $request->get('tipo') . '%');
        }

        if ($request->filled('ruta_activa_id')) {
            $query->where('id_ruta_activa', $request->get('ruta_activa_id'));
        }

        if ($request->filled('monto_min')) {
            $query->where('cantidad_egreso', '>=', $request->get('monto_min'));
        }

        if ($request->filled('monto_max')) {
            $query->where('cantidad_egreso', '<=', $request->get('monto_max'));
        }

        if ($request->filled('buscar')) {
            $termino = $request->get('buscar');
            $query->where(function ($q) use ($termino) {
                $q->where('descripcion_egreso', 'like', "%{$termino}%")
                    ->orWhere('tipo_egreso', 'like', "%{$termino}%")
                    ->orWhere('observaciones_egreso', 'like', "%{$termino}%");
            });
        }

        // Ordenamiento
        $sortBy = $request->get('sort_by', 'fecha_egreso');
        $sortOrder = $request->get('sort_order', 'desc');

        if (in_array($sortBy, ['fecha_egreso', 'cantidad_egreso', 'tipo_egreso', 'created_at'])) {
            $query->orderBy($sortBy, $sortOrder);
        }

        // Paginación
        $perPage = min($request->get('per_page', 15), 100);
        $egresos = $query->paginate($perPage);

        return EgresoResource::collection($egresos)->additional([
            'meta' => [
                'filtros_aplicados' => $request->only([
                    'fecha_desde',
                    'fecha_hasta',
                    'tipo',
                    'ruta_activa_id',
                    'monto_min',
                    'monto_max',
                    'buscar'
                ]),
                'resumen' => [
                    'total_egresos' => $egresos->total(),
                    'total_monto' => $egresos->getCollection()->sum('cantidad_egreso'),
                ]
            ]
        ]);
    }

    /**
     * Mostrar egreso específico
     * GET /api/egresos/{egreso}
     */
    public function show(EgresoRutaActiva $egreso): EgresoResource
    {
        $egreso->load(['rutaActiva.ruta', 'rutaActiva.vehiculo']);
        return new EgresoResource($egreso);
    }

    /**
     * Crear nuevo egreso
     * POST /api/egresos
     */
    public function store(EgresoRequest $request): JsonResponse
    {
        try {
            $egreso = EgresoRutaActiva::create(array_merge(
                $request->validated(),
                ['created_by' => $request->user()->id_usuarios]
            ));

            $egreso->load(['rutaActiva.ruta', 'rutaActiva.vehiculo']);

            return response()->json([
                'success' => true,
                'message' => 'Egreso creado exitosamente',
                'data' => new EgresoResource($egreso)
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creando egreso: ' . $e->getMessage()
            ], 422);
        }
    }

    /**
     * Actualizar egreso
     * PUT /api/egresos/{egreso}
     */
    public function update(EgresoRequest $request, EgresoRutaActiva $egreso): JsonResponse
    {
        try {
            $egreso->update($request->validated());
            $egreso->load(['rutaActiva.ruta', 'rutaActiva.vehiculo']);

            return response()->json([
                'success' => true,
                'message' => 'Egreso actualizado exitosamente',
                'data' => new EgresoResource($egreso)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error actualizando egreso: ' . $e->getMessage()
            ], 422);
        }
    }

    /**
     * Eliminar egreso
     * DELETE /api/egresos/{egreso}
     */
    public function destroy(EgresoRutaActiva $egreso): JsonResponse
    {
        try {
            $egreso->delete();

            return response()->json([
                'success' => true,
                'message' => 'Egreso eliminado exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error eliminando egreso: ' . $e->getMessage()
            ], 422);
        }
    }

    /**
     * Egresos por ruta activa
     * GET /api/egresos/por-ruta/{rutaActivaId}
     */
    public function porRuta($rutaActivaId): AnonymousResourceCollection
    {
        $egresos = EgresoRutaActiva::with(['rutaActiva.ruta', 'rutaActiva.vehiculo'])
            ->where('id_ruta_activa', $rutaActivaId)
            ->orderBy('fecha_egreso', 'desc')
            ->get();

        return EgresoResource::collection($egresos);
    }

    /**
     * Resumen de egresos por período
     * GET /api/egresos/resumen
     */
    public function resumen(Request $request): JsonResponse
    {
        $fechaInicio = $request->get('fecha_inicio', today()->startOfMonth()->format('Y-m-d'));
        $fechaFin = $request->get('fecha_fin', today()->format('Y-m-d'));

        try {
            $egresos = EgresoRutaActiva::whereBetween('fecha_egreso', [$fechaInicio, $fechaFin])
                ->whereNull('deleted_at')
                ->get();

            $resumen = [
                'periodo' => [
                    'inicio' => $fechaInicio,
                    'fin' => $fechaFin
                ],
                'totales' => [
                    'cantidad_egresos' => $egresos->count(),
                    'monto_total' => $egresos->sum('cantidad_egreso'),
                    'promedio_por_egreso' => $egresos->count() > 0
                        ? round($egresos->avg('cantidad_egreso'), 2)
                        : 0,
                ],
                'por_tipo' => $egresos->groupBy('tipo_egreso')->map(function ($egresosPorTipo) {
                    return [
                        'cantidad' => $egresosPorTipo->count(),
                        'monto_total' => $egresosPorTipo->sum('cantidad_egreso'),
                        'promedio' => round($egresosPorTipo->avg('cantidad_egreso'), 2),
                    ];
                }),
                'egresos_mayores' => $egresos->where('cantidad_egreso', '>', 500)->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => $resumen
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error generando resumen: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Tipos de egresos más comunes
     * GET /api/egresos/tipos-comunes
     */
    public function tiposComunes(): JsonResponse
    {
        try {
            $tipos = EgresoRutaActiva::selectRaw('tipo_egreso, COUNT(*) as cantidad, AVG(cantidad_egreso) as promedio')
                ->whereNull('deleted_at')
                ->groupBy('tipo_egreso')
                ->orderByDesc('cantidad')
                ->limit(10)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $tipos->map(function ($tipo) {
                    return [
                        'tipo' => $tipo->tipo_egreso,
                        'cantidad_usos' => $tipo->cantidad,
                        'monto_promedio' => round($tipo->promedio, 2),
                        'monto_promedio_formateado' => 'Q' . number_format($tipo->promedio, 2),
                    ];
                })
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error obteniendo tipos comunes: ' . $e->getMessage()
            ], 500);
        }
    }
}
