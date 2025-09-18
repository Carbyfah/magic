<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CajaRequest;
use App\Http\Resources\CajaResource;
use App\Models\Caja;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CajaController extends Controller
{
    /**
     * Listar movimientos de caja con filtros básicos
     * GET /api/caja
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Caja::with(['reserva', 'estado']);

        // Filtros básicos
        if ($request->filled('fecha_desde')) {
            $query->whereDate('fecha_servicio', '>=', $request->get('fecha_desde'));
        }

        if ($request->filled('fecha_hasta')) {
            $query->whereDate('fecha_servicio', '<=', $request->get('fecha_hasta'));
        }

        if ($request->filled('origen')) {
            $query->where('origen', 'like', '%' . $request->get('origen') . '%');
        }

        if ($request->filled('destino')) {
            $query->where('destino', 'like', '%' . $request->get('destino') . '%');
        }

        if ($request->filled('monto_min')) {
            $query->where('servicio_cobrar_pax', '>=', $request->get('monto_min'));
        }

        if ($request->filled('monto_max')) {
            $query->where('servicio_cobrar_pax', '<=', $request->get('monto_max'));
        }

        // Ordenamiento
        $sortBy = $request->get('sort_by', 'fecha_servicio');
        $sortOrder = $request->get('sort_order', 'desc');

        if (in_array($sortBy, ['fecha_servicio', 'servicio_cobrar_pax', 'total_pax', 'created_at'])) {
            $query->orderBy($sortBy, $sortOrder);
        }

        // Paginación
        $perPage = min($request->get('per_page', 15), 100);
        $movimientos = $query->paginate($perPage);

        return CajaResource::collection($movimientos)->additional([
            'meta' => [
                'filtros_aplicados' => $request->only([
                    'fecha_desde',
                    'fecha_hasta',
                    'origen',
                    'destino',
                    'monto_min',
                    'monto_max'
                ]),
                'resumen' => [
                    'total_movimientos' => $movimientos->total(),
                    'total_ingresos' => $movimientos->getCollection()->sum('servicio_cobrar_pax'),
                ]
            ]
        ]);
    }

    /**
     * Mostrar movimiento específico
     * GET /api/caja/{caja}
     */
    public function show(Caja $caja): CajaResource
    {
        $caja->load(['reserva', 'estado']);
        return new CajaResource($caja);
    }

    /**
     * Crear nuevo movimiento
     * POST /api/caja
     */
    public function store(CajaRequest $request): JsonResponse
    {
        try {
            $caja = Caja::create(array_merge(
                $request->validated(),
                ['created_by' => $request->user()->id_usuarios]
            ));

            $caja->load(['reserva', 'estado']);

            return response()->json([
                'success' => true,
                'message' => 'Movimiento de caja creado exitosamente',
                'data' => new CajaResource($caja)
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creando movimiento: ' . $e->getMessage()
            ], 422);
        }
    }

    /**
     * Actualizar movimiento
     * PUT /api/caja/{caja}
     */
    public function update(CajaRequest $request, Caja $caja): JsonResponse
    {
        try {
            $caja->update($request->validated());
            $caja->load(['reserva', 'estado']);

            return response()->json([
                'success' => true,
                'message' => 'Movimiento actualizado exitosamente',
                'data' => new CajaResource($caja)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error actualizando movimiento: ' . $e->getMessage()
            ], 422);
        }
    }

    /**
     * Eliminar movimiento
     * DELETE /api/caja/{caja}
     */
    public function destroy(Caja $caja): JsonResponse
    {
        try {
            $caja->delete();

            return response()->json([
                'success' => true,
                'message' => 'Movimiento eliminado exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error eliminando movimiento: ' . $e->getMessage()
            ], 422);
        }
    }

    /**
     * Resumen de caja por período
     * GET /api/caja/resumen
     */
    public function resumen(Request $request): JsonResponse
    {
        $fechaInicio = $request->get('fecha_inicio', today()->startOfMonth()->format('Y-m-d'));
        $fechaFin = $request->get('fecha_fin', today()->format('Y-m-d'));

        try {
            $movimientos = Caja::whereBetween('fecha_servicio', [$fechaInicio, $fechaFin])
                ->whereNull('deleted_at')
                ->get();

            $resumen = [
                'periodo' => [
                    'inicio' => $fechaInicio,
                    'fin' => $fechaFin
                ],
                'totales' => [
                    'movimientos' => $movimientos->count(),
                    'total_pasajeros' => $movimientos->sum('total_pax'),
                    'ingresos_brutos' => $movimientos->sum('precio_total'),
                    'ingresos_cobrados' => $movimientos->sum('servicio_cobrar_pax'),
                    'promedio_por_servicio' => $movimientos->count() > 0
                        ? round($movimientos->avg('servicio_cobrar_pax'), 2)
                        : 0,
                ],
                'por_dia' => $movimientos->groupBy(function ($item) {
                    return $item->fecha_servicio->format('Y-m-d');
                })->map(function ($movimientosDia) {
                    return [
                        'movimientos' => $movimientosDia->count(),
                        'pasajeros' => $movimientosDia->sum('total_pax'),
                        'ingresos' => $movimientosDia->sum('servicio_cobrar_pax'),
                    ];
                })
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
     * Buscar movimientos
     * GET /api/caja/buscar
     */
    public function buscar(Request $request): AnonymousResourceCollection
    {
        $request->validate([
            'termino' => 'required|string|min:2'
        ]);

        $termino = $request->get('termino');

        $query = Caja::with(['reserva', 'estado'])
            ->where(function ($q) use ($termino) {
                $q->where('origen', 'like', "%{$termino}%")
                    ->orWhere('destino', 'like', "%{$termino}%")
                    ->orWhere('direccion', 'like', "%{$termino}%")
                    ->orWhereHas('reserva', function ($sq) use ($termino) {
                        $sq->where('reservas_nombres_cliente', 'like', "%{$termino}%")
                            ->orWhere('reservas_apellidos_cliente', 'like', "%{$termino}%");
                    });
            });

        $movimientos = $query->limit(20)->get();

        return CajaResource::collection($movimientos);
    }
}
