<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\VehiculoRequest;
use App\Http\Resources\VehiculoResource;
use App\Models\Vehiculo;
use App\Models\RutaActiva;
use App\Services\CapacidadService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class VehiculosController extends Controller
{
    protected CapacidadService $capacidadService;

    public function __construct(CapacidadService $capacidadService)
    {
        $this->capacidadService = $capacidadService;
    }

    /**
     * Listar vehículos con filtros y paginación
     * GET /api/vehiculos
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Vehiculo::query();

        // Filtros disponibles
        if ($request->filled('placa')) {
            $query->where('vehiculo_placa', 'like', '%' . $request->get('placa') . '%');
        }

        if ($request->filled('marca')) {
            $query->where('vehiculo_marca', 'like', '%' . $request->get('marca') . '%');
        }

        if ($request->filled('modelo')) {
            $query->where('vehiculo_modelo', 'like', '%' . $request->get('modelo') . '%');
        }

        if ($request->filled('tipo')) {
            $query->where('vehiculo_tipo', 'like', '%' . $request->get('tipo') . '%');
        }

        if ($request->filled('estado')) {
            $query->where('vehiculo_estado', 'like', '%' . $request->get('estado') . '%');
        }

        if ($request->filled('activo')) {
            $activo = $request->get('activo');
            if ($activo === 'true' || $activo === '1') {
                $query->where('vehiculo_activo', true);
            } elseif ($activo === 'false' || $activo === '0') {
                $query->where('vehiculo_activo', false);
            }
        }

        if ($request->filled('capacidad_min')) {
            $query->where('vehiculo_capacidad', '>=', $request->get('capacidad_min'));
        }

        if ($request->filled('capacidad_max')) {
            $query->where('vehiculo_capacidad', '<=', $request->get('capacidad_max'));
        }

        if ($request->filled('ano_desde')) {
            $query->where('vehiculo_ano', '>=', $request->get('ano_desde'));
        }

        if ($request->filled('ano_hasta')) {
            $query->where('vehiculo_ano', '<=', $request->get('ano_hasta'));
        }

        if ($request->filled('kilometraje_max')) {
            $query->where('vehiculo_kilometraje', '<=', $request->get('kilometraje_max'));
        }

        // Filtro de búsqueda general
        if ($request->filled('buscar')) {
            $termino = $request->get('buscar');
            $query->where(function ($q) use ($termino) {
                $q->where('vehiculo_placa', 'like', "%{$termino}%")
                    ->orWhere('vehiculo_marca', 'like', "%{$termino}%")
                    ->orWhere('vehiculo_modelo', 'like', "%{$termino}%")
                    ->orWhere('vehiculo_tipo', 'like', "%{$termino}%")
                    ->orWhere('vehiculo_numero_motor', 'like', "%{$termino}%")
                    ->orWhere('vehiculo_numero_chasis', 'like', "%{$termino}%");
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
        $sortBy = $request->get('sort_by', 'vehiculo_placa');
        $sortOrder = $request->get('sort_order', 'asc');

        $allowedSorts = [
            'vehiculo_placa',
            'vehiculo_marca',
            'vehiculo_modelo',
            'vehiculo_ano',
            'vehiculo_capacidad',
            'vehiculo_tipo',
            'vehiculo_estado',
            'vehiculo_kilometraje',
            'vehiculo_activo',
            'created_at'
        ];

        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortOrder);
        }

        // Paginación
        $perPage = min($request->get('per_page', 15), 100);
        $vehiculos = $query->paginate($perPage);

        return VehiculoResource::collection($vehiculos)->additional([
            'meta' => [
                'filtros_aplicados' => $request->only([
                    'placa',
                    'marca',
                    'modelo',
                    'tipo',
                    'estado',
                    'activo',
                    'capacidad_min',
                    'capacidad_max',
                    'ano_desde',
                    'ano_hasta',
                    'kilometraje_max',
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
     * Mostrar vehículo específico
     * GET /api/vehiculos/{vehiculo}
     */
    public function show(Vehiculo $vehiculo): VehiculoResource
    {
        $vehiculo->load([
            'rutasActivas.ruta',
            'rutasActivas.estado',
            'rutasActivas.reservas'
        ]);

        return new VehiculoResource($vehiculo);
    }

    /**
     * Crear nuevo vehículo
     * POST /api/vehiculos
     */
    public function store(VehiculoRequest $request): JsonResponse
    {
        try {
            $vehiculo = Vehiculo::create(array_merge(
                $request->validated(),
                ['created_by' => $request->user()->id_usuarios]
            ));

            return response()->json([
                'success' => true,
                'message' => 'Vehículo creado exitosamente',
                'data' => new VehiculoResource($vehiculo)
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creando vehículo: ' . $e->getMessage(),
                'errors' => [
                    'general' => [$e->getMessage()]
                ]
            ], 422);
        }
    }

    /**
     * Actualizar vehículo
     * PUT /api/vehiculos/{vehiculo}
     */
    public function update(VehiculoRequest $request, Vehiculo $vehiculo): JsonResponse
    {
        try {
            $vehiculo->update($request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Vehículo actualizado exitosamente',
                'data' => new VehiculoResource($vehiculo)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error actualizando vehículo: ' . $e->getMessage(),
                'errors' => [
                    'general' => [$e->getMessage()]
                ]
            ], 422);
        }
    }

    /**
     * Eliminar vehículo (soft delete)
     * DELETE /api/vehiculos/{vehiculo}
     */
    public function destroy(Vehiculo $vehiculo): JsonResponse
    {
        try {
            // Verificar que no tenga rutas activas asignadas
            $rutasActivasAsignadas = RutaActiva::where('vehiculo_id', $vehiculo->vehiculo_id)
                ->whereDate('ruta_activa_fecha', '>=', today())
                ->whereNull('deleted_at')
                ->count();

            if ($rutasActivasAsignadas > 0) {
                return response()->json([
                    'success' => false,
                    'message' => "No se puede eliminar el vehículo porque tiene {$rutasActivasAsignadas} rutas asignadas."
                ], 422);
            }

            $vehiculo->delete();

            return response()->json([
                'success' => true,
                'message' => 'Vehículo eliminado exitosamente',
                'data' => [
                    'id' => $vehiculo->vehiculo_id,
                    'placa' => $vehiculo->vehiculo_placa,
                    'eliminado_en' => now()->format('Y-m-d H:i:s')
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error eliminando vehículo: ' . $e->getMessage()
            ], 422);
        }
    }

    /**
     * Restaurar vehículo eliminado
     * PATCH /api/vehiculos/{vehiculo}/restore
     */
    public function restore($vehiculoId): JsonResponse
    {
        try {
            $vehiculo = Vehiculo::withTrashed()->findOrFail($vehiculoId);
            $vehiculo->restore();

            return response()->json([
                'success' => true,
                'message' => 'Vehículo restaurado exitosamente',
                'data' => new VehiculoResource($vehiculo)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error restaurando vehículo: ' . $e->getMessage()
            ], 422);
        }
    }

    /**
     * Obtener rutas activas asignadas a un vehículo
     * GET /api/vehiculos/{vehiculo}/rutas-activas
     */
    public function rutasActivas(Vehiculo $vehiculo, Request $request): JsonResponse
    {
        $query = RutaActiva::with(['ruta', 'estado', 'reservas'])
            ->where('vehiculo_id', $vehiculo->vehiculo_id);

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

        $rutasFormateadas = $rutasActivas->map(function ($rutaActiva) use ($vehiculo) {
            $disponibilidad = $this->capacidadService->verificarDisponibilidad($rutaActiva->id_ruta_activa, 1);

            return [
                'id' => $rutaActiva->id_ruta_activa,
                'fecha' => $rutaActiva->ruta_activa_fecha?->format('Y-m-d'),
                'fecha_formateada' => $rutaActiva->ruta_activa_fecha?->format('d/m/Y'),
                'hora' => $rutaActiva->ruta_activa_hora,
                'ruta' => $rutaActiva->ruta ? [
                    'id' => $rutaActiva->ruta->id_rutas,
                    'origen' => $rutaActiva->ruta->rutas_origen,
                    'destino' => $rutaActiva->ruta->rutas_destino,
                    'descripcion' => $rutaActiva->ruta->rutas_origen . ' → ' . $rutaActiva->ruta->rutas_destino,
                ] : null,
                'estado' => [
                    'id' => $rutaActiva->estado->estado_id,
                    'nombre' => $rutaActiva->estado->estado_nombre,
                ],
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
                'vehiculo' => [
                    'id' => $vehiculo->vehiculo_id,
                    'placa' => $vehiculo->vehiculo_placa,
                    'descripcion' => $vehiculo->vehiculo_marca . ' ' . $vehiculo->vehiculo_modelo,
                    'capacidad' => $vehiculo->vehiculo_capacidad,
                ],
                'total_asignaciones' => $rutasFormateadas->count(),
                'rutas_activas' => $rutasFormateadas,
            ]
        ]);
    }

    /**
     * Verificar disponibilidad de vehículo
     * GET /api/vehiculos/{vehiculo}/disponibilidad
     */
    public function verificarDisponibilidad(Vehiculo $vehiculo, Request $request): JsonResponse
    {
        $request->validate([
            'fecha' => 'required|date',
            'hora' => 'nullable|string'
        ]);

        try {
            $fecha = $request->get('fecha');
            $hora = $request->get('hora');

            // Buscar rutas activas en la fecha específica
            $rutasEnFecha = RutaActiva::where('vehiculo_id', $vehiculo->vehiculo_id)
                ->whereDate('ruta_activa_fecha', $fecha)
                ->when($hora, function ($q) use ($hora) {
                    $q->where('ruta_activa_hora', $hora);
                })
                ->with(['ruta', 'estado'])
                ->get();

            $disponible = $rutasEnFecha->isEmpty();

            return response()->json([
                'success' => true,
                'data' => [
                    'vehiculo' => [
                        'id' => $vehiculo->vehiculo_id,
                        'placa' => $vehiculo->vehiculo_placa,
                        'capacidad' => $vehiculo->vehiculo_capacidad,
                    ],
                    'fecha_consulta' => $fecha,
                    'hora_consulta' => $hora,
                    'disponible' => $disponible,
                    'rutas_asignadas' => $rutasEnFecha->map(function ($rutaActiva) {
                        return [
                            'id' => $rutaActiva->id_ruta_activa,
                            'hora' => $rutaActiva->ruta_activa_hora,
                            'ruta' => $rutaActiva->ruta->rutas_origen . ' → ' . $rutaActiva->ruta->rutas_destino,
                            'estado' => $rutaActiva->estado->estado_nombre,
                        ];
                    }),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error verificando disponibilidad: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Buscar vehículos
     * GET /api/vehiculos/buscar
     */
    public function buscar(Request $request): AnonymousResourceCollection
    {
        $request->validate([
            'termino' => 'required|string|min:2'
        ]);

        $termino = $request->get('termino');

        $query = Vehiculo::where(function ($q) use ($termino) {
            $q->where('vehiculo_placa', 'like', "%{$termino}%")
                ->orWhere('vehiculo_marca', 'like', "%{$termino}%")
                ->orWhere('vehiculo_modelo', 'like', "%{$termino}%")
                ->orWhere('vehiculo_tipo', 'like', "%{$termino}%");
        })
            ->where('vehiculo_activo', true);

        $vehiculos = $query->limit(20)->get();

        return VehiculoResource::collection($vehiculos);
    }

    /**
     * Duplicar vehículo
     * POST /api/vehiculos/{vehiculo}/duplicar
     */
    public function duplicar(Vehiculo $vehiculo): JsonResponse
    {
        try {
            $nuevoVehiculo = $vehiculo->replicate();
            $nuevoVehiculo->created_by = request()->user()->id_usuarios;
            $nuevoVehiculo->vehiculo_placa = $vehiculo->vehiculo_placa . '-COPIA';
            $nuevoVehiculo->save();

            return response()->json([
                'success' => true,
                'message' => 'Vehículo duplicado exitosamente',
                'data' => new VehiculoResource($nuevoVehiculo)
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error duplicando vehículo: ' . $e->getMessage()
            ], 422);
        }
    }
}
