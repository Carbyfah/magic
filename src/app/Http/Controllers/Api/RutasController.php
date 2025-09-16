<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\RutaRequest;
use App\Http\Resources\RutaResource;
use App\Models\Ruta;
use App\Models\RutaActiva;
use App\Services\CapacidadService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class RutasController extends Controller
{
    protected CapacidadService $capacidadService;

    public function __construct(CapacidadService $capacidadService)
    {
        $this->capacidadService = $capacidadService;
    }

    /**
     * Listar rutas con filtros y paginación
     * GET /api/rutas
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Ruta::with(['agencia']);

        // Filtros disponibles
        if ($request->filled('origen')) {
            $query->where('rutas_origen', 'like', '%' . $request->get('origen') . '%');
        }

        if ($request->filled('destino')) {
            $query->where('rutas_destino', 'like', '%' . $request->get('destino') . '%');
        }

        if ($request->filled('agencia_id')) {
            $query->where('id_agencias', $request->get('agencia_id'));
        }

        if ($request->filled('activa')) {
            $activa = $request->get('activa');
            if ($activa === 'true' || $activa === '1') {
                $query->where('rutas_activa', true);
            } elseif ($activa === 'false' || $activa === '0') {
                $query->where('rutas_activa', false);
            }
        }

        if ($request->filled('precio_min')) {
            $query->where('rutas_precio_base', '>=', $request->get('precio_min'));
        }

        if ($request->filled('precio_max')) {
            $query->where('rutas_precio_base', '<=', $request->get('precio_max'));
        }

        if ($request->filled('distancia_min')) {
            $query->where('rutas_distancia_km', '>=', $request->get('distancia_min'));
        }

        if ($request->filled('distancia_max')) {
            $query->where('rutas_distancia_km', '<=', $request->get('distancia_max'));
        }

        // Filtro de búsqueda general
        if ($request->filled('buscar')) {
            $termino = $request->get('buscar');
            $query->where(function ($q) use ($termino) {
                $q->where('rutas_origen', 'like', "%{$termino}%")
                    ->orWhere('rutas_destino', 'like', "%{$termino}%")
                    ->orWhere('rutas_descripcion', 'like', "%{$termino}%");
            });
        }

        // Filtro por eliminados
        if ($request->get('incluir_eliminados') === 'true') {
            $query->withTrashed();
        } elseif ($request->get('solo_eliminados') === 'true') {
            $query->onlyTrashed();
        }

        // Incluir estadísticas si se solicita
        if ($request->get('con_estadisticas') === 'true') {
            $query->withCount(['rutasActivas', 'rutasActivas as reservas_count' => function ($q) {
                $q->withCount('reservas');
            }]);
        }

        // Ordenamiento
        $sortBy = $request->get('sort_by', 'rutas_origen');
        $sortOrder = $request->get('sort_order', 'asc');

        $allowedSorts = [
            'rutas_origen',
            'rutas_destino',
            'rutas_precio_base',
            'rutas_distancia_km',
            'rutas_activa',
            'created_at'
        ];

        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortOrder);
        }

        // Paginación
        $perPage = min($request->get('per_page', 15), 100);
        $rutas = $query->paginate($perPage);

        return RutaResource::collection($rutas)->additional([
            'meta' => [
                'filtros_aplicados' => $request->only([
                    'origen',
                    'destino',
                    'agencia_id',
                    'activa',
                    'precio_min',
                    'precio_max',
                    'distancia_min',
                    'distancia_max',
                    'buscar'
                ]),
                'ordenamiento' => [
                    'campo' => $sortBy,
                    'direccion' => $sortOrder
                ],
                'con_estadisticas' => $request->get('con_estadisticas') === 'true'
            ]
        ]);
    }

    /**
     * Mostrar ruta específica
     * GET /api/rutas/{ruta}
     */
    public function show(Ruta $ruta): RutaResource
    {
        $ruta->load([
            'agencia',
            'rutasActivas.estado',
            'rutasActivas.vehiculo',
            'rutasActivas.reservas'
        ]);

        return new RutaResource($ruta);
    }

    /**
     * Crear nueva ruta
     * POST /api/rutas
     */
    public function store(RutaRequest $request): JsonResponse
    {
        try {
            $ruta = Ruta::create(array_merge(
                $request->validated(),
                ['created_by' => $request->user()->id_usuarios]
            ));

            $ruta->load('agencia');

            return response()->json([
                'success' => true,
                'message' => 'Ruta creada exitosamente',
                'data' => new RutaResource($ruta)
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creando ruta: ' . $e->getMessage(),
                'errors' => [
                    'general' => [$e->getMessage()]
                ]
            ], 422);
        }
    }

    /**
     * Actualizar ruta
     * PUT /api/rutas/{ruta}
     */
    public function update(RutaRequest $request, Ruta $ruta): JsonResponse
    {
        try {
            $ruta->update($request->validated());
            $ruta->load('agencia');

            return response()->json([
                'success' => true,
                'message' => 'Ruta actualizada exitosamente',
                'data' => new RutaResource($ruta)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error actualizando ruta: ' . $e->getMessage(),
                'errors' => [
                    'general' => [$e->getMessage()]
                ]
            ], 422);
        }
    }

    /**
     * Eliminar ruta (soft delete)
     * DELETE /api/rutas/{ruta}
     */
    public function destroy(Ruta $ruta): JsonResponse
    {
        try {
            // Verificar que no tenga rutas activas pendientes
            $rutasActivasPendientes = RutaActiva::where('id_rutas', $ruta->id_rutas)
                ->whereDate('ruta_activa_fecha', '>=', today())
                ->whereNull('deleted_at')
                ->count();

            if ($rutasActivasPendientes > 0) {
                return response()->json([
                    'success' => false,
                    'message' => "No se puede eliminar la ruta porque tiene {$rutasActivasPendientes} programaciones futuras."
                ], 422);
            }

            $ruta->delete();

            return response()->json([
                'success' => true,
                'message' => 'Ruta eliminada exitosamente',
                'data' => [
                    'id' => $ruta->id_rutas,
                    'eliminada_en' => now()->format('Y-m-d H:i:s')
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error eliminando ruta: ' . $e->getMessage()
            ], 422);
        }
    }

    /**
     * Restaurar ruta eliminada
     * PATCH /api/rutas/{ruta}/restore
     */
    public function restore($rutaId): JsonResponse
    {
        try {
            $ruta = Ruta::withTrashed()->findOrFail($rutaId);
            $ruta->restore();
            $ruta->load('agencia');

            return response()->json([
                'success' => true,
                'message' => 'Ruta restaurada exitosamente',
                'data' => new RutaResource($ruta)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error restaurando ruta: ' . $e->getMessage()
            ], 422);
        }
    }

    /**
     * Obtener rutas activas de una ruta específica
     * GET /api/rutas/{ruta}/rutas-activas
     */
    public function rutasActivas(Ruta $ruta, Request $request): JsonResponse
    {
        $query = RutaActiva::with(['estado', 'vehiculo', 'reservas'])
            ->where('id_rutas', $ruta->id_rutas);

        // Filtros para rutas activas
        if ($request->filled('fecha_desde')) {
            $query->whereDate('ruta_activa_fecha', '>=', $request->get('fecha_desde'));
        }

        if ($request->filled('fecha_hasta')) {
            $query->whereDate('ruta_activa_fecha', '<=', $request->get('fecha_hasta'));
        }

        if ($request->filled('estado_id')) {
            $query->where('estado_id', $request->get('estado_id'));
        }

        $rutasActivas = $query->orderBy('ruta_activa_fecha', 'desc')->get();

        $rutasFormateadas = $rutasActivas->map(function ($rutaActiva) {
            $disponibilidad = $this->capacidadService->verificarDisponibilidad($rutaActiva->id_ruta_activa, 1);

            return [
                'id' => $rutaActiva->id_ruta_activa,
                'fecha' => $rutaActiva->ruta_activa_fecha?->format('Y-m-d'),
                'fecha_formateada' => $rutaActiva->ruta_activa_fecha?->format('d/m/Y'),
                'hora' => $rutaActiva->ruta_activa_hora,
                'estado' => [
                    'id' => $rutaActiva->estado->estado_id,
                    'nombre' => $rutaActiva->estado->estado_nombre,
                ],
                'vehiculo' => $rutaActiva->vehiculo ? [
                    'id' => $rutaActiva->vehiculo->vehiculo_id,
                    'placa' => $rutaActiva->vehiculo->vehiculo_placa,
                    'capacidad' => $rutaActiva->vehiculo->vehiculo_capacidad,
                ] : null,
                'reservas' => [
                    'total' => $rutaActiva->reservas->count(),
                    'total_pasajeros' => $rutaActiva->reservas->sum(function ($reserva) {
                        return $reserva->reservas_cantidad_adultos + ($reserva->reservas_cantidad_ninos ?? 0);
                    }),
                ],
                'disponibilidad' => $disponibilidad,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'ruta' => [
                    'id' => $ruta->id_rutas,
                    'descripcion' => $ruta->rutas_origen . ' → ' . $ruta->rutas_destino,
                ],
                'total_programaciones' => $rutasFormateadas->count(),
                'rutas_activas' => $rutasFormateadas,
            ]
        ]);
    }

    /**
     * Duplicar ruta
     * POST /api/rutas/{ruta}/duplicar
     */
    public function duplicar(Ruta $ruta): JsonResponse
    {
        try {
            $nuevaRuta = $ruta->replicate();
            $nuevaRuta->created_by = request()->user()->id_usuarios;
            $nuevaRuta->rutas_origen = $ruta->rutas_origen . ' (Copia)';
            $nuevaRuta->save();

            $nuevaRuta->load('agencia');

            return response()->json([
                'success' => true,
                'message' => 'Ruta duplicada exitosamente',
                'data' => new RutaResource($nuevaRuta)
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error duplicando ruta: ' . $e->getMessage()
            ], 422);
        }
    }

    /**
     * Buscar rutas
     * GET /api/rutas/buscar
     */
    public function buscar(Request $request): AnonymousResourceCollection
    {
        $request->validate([
            'termino' => 'required|string|min:2'
        ]);

        $termino = $request->get('termino');

        $query = Ruta::with('agencia')
            ->where(function ($q) use ($termino) {
                $q->where('rutas_origen', 'like', "%{$termino}%")
                    ->orWhere('rutas_destino', 'like', "%{$termino}%")
                    ->orWhere('rutas_descripcion', 'like', "%{$termino}%");
            })
            ->where('rutas_activa', true);

        $rutas = $query->limit(20)->get();

        return RutaResource::collection($rutas);
    }
}
