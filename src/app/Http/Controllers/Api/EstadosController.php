<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\EstadoRequest;
use App\Http\Resources\EstadoResource;
use App\Models\Estado;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class EstadosController extends Controller
{
    /**
     * Listar estados con filtros
     * GET /api/estados
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Estado::query();

        // Filtro por nombre
        if ($request->filled('nombre')) {
            $query->where('estado_nombre', 'like', '%' . $request->get('nombre') . '%');
        }

        // Filtro por descripción
        if ($request->filled('descripcion')) {
            $query->where('estado_descripcion', 'like', '%' . $request->get('descripcion') . '%');
        }

        // Incluir conteos de relaciones si se solicita
        if ($request->get('con_conteos') === 'true') {
            $query->withCount([
                'vehiculos',
                'rutasActivas',
                'toursActivos',
                'reservas',
                'cajas'
            ]);
        }

        // Ordenamiento
        $query->orderBy('estado_nombre', 'asc');

        // Paginación
        $perPage = min($request->get('per_page', 15), 50);
        $estados = $query->paginate($perPage);

        return EstadoResource::collection($estados);
    }

    /**
     * Estados para vehículos
     * GET /api/estados/vehiculos
     */
    public function vehiculos(): AnonymousResourceCollection
    {
        $estados = Estado::vehiculos()->orderBy('estado_nombre')->get();
        return EstadoResource::collection($estados);
    }

    /**
     * Estados para rutas
     * GET /api/estados/rutas
     */
    public function rutas(): AnonymousResourceCollection
    {
        $estados = Estado::rutas()->orderBy('estado_nombre')->get();
        return EstadoResource::collection($estados);
    }

    /**
     * Estados para reservas
     * GET /api/estados/reservas
     */
    public function reservas(): AnonymousResourceCollection
    {
        $estados = Estado::reservas()->orderBy('estado_nombre')->get();
        return EstadoResource::collection($estados);
    }

    /**
     * Estados para contabilidad
     * GET /api/estados/contabilidad
     */
    public function contabilidad(): AnonymousResourceCollection
    {
        $estados = Estado::contabilidad()->orderBy('estado_nombre')->get();
        return EstadoResource::collection($estados);
    }

    /**
     * Estados por tipo específico
     * GET /api/estados/por-tipo/{tipo}
     */
    public function porTipo(string $tipo): AnonymousResourceCollection
    {
        $query = Estado::query();

        switch (strtolower($tipo)) {
            case 'vehiculos':
                $query->vehiculos();
                break;
            case 'rutas':
                $query->rutas();
                break;
            case 'reservas':
                $query->reservas();
                break;
            case 'contabilidad':
                $query->contabilidad();
                break;
            case 'generales':
                $query->generales();
                break;
            default:
                return EstadoResource::collection(collect());
        }

        $estados = $query->orderBy('estado_nombre')->get();
        return EstadoResource::collection($estados);
    }

    /**
     * Opciones para formularios
     * GET /api/estados/opciones
     */
    public function opciones(Request $request): JsonResponse
    {
        $tipo = $request->get('tipo');

        switch ($tipo) {
            case 'vehiculos':
                $opciones = Estado::opcionesVehiculos();
                break;
            case 'rutas':
                $opciones = Estado::opcionesRutas();
                break;
            case 'reservas':
                $opciones = Estado::opcionesReservas();
                break;
            case 'contabilidad':
                $opciones = Estado::opcionesContabilidad();
                break;
            default:
                $opciones = Estado::opciones();
        }

        return response()->json([
            'success' => true,
            'data' => $opciones
        ]);
    }

    /**
     * Buscar estados
     * GET /api/estados/buscar
     */
    public function buscar(Request $request): AnonymousResourceCollection
    {
        $request->validate([
            'termino' => 'required|string|min:2'
        ]);

        $termino = $request->get('termino');

        $estados = Estado::where('estado_nombre', 'like', "%{$termino}%")
            ->orWhere('estado_descripcion', 'like', "%{$termino}%")
            ->orderBy('estado_nombre')
            ->limit(20)
            ->get();

        return EstadoResource::collection($estados);
    }

    /**
     * Mostrar estado específico
     * GET /api/estados/{estado}
     */
    public function show(Estado $estado): JsonResponse
    {
        $estado->loadCount([
            'vehiculos',
            'rutasActivas',
            'toursActivos',
            'reservas',
            'cajas'
        ]);

        return response()->json([
            'success' => true,
            'data' => new EstadoResource($estado)
        ]);
    }

    /**
     * Crear nuevo estado
     * POST /api/estados
     */
    public function store(EstadoRequest $request): JsonResponse
    {
        try {
            $estado = Estado::create(array_merge(
                $request->validated(),
                ['created_by' => $request->user()->id_usuarios ?? null]
            ));

            return response()->json([
                'success' => true,
                'message' => 'Estado creado exitosamente',
                'data' => new EstadoResource($estado)
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creando estado: ' . $e->getMessage(),
                'errors' => [
                    'general' => [$e->getMessage()]
                ]
            ], 422);
        }
    }

    /**
     * Actualizar estado
     * PUT /api/estados/{estado}
     */
    public function update(EstadoRequest $request, Estado $estado): JsonResponse
    {
        try {
            // Verificar si es un estado crítico del sistema
            $estadosCriticos = [
                'Disponible',
                'Mantenimiento',
                'Asignado',
                'Activada',
                'Llena',
                'Ejecución',
                'Cerrada',
                'Liquidar Ruta',
                'Pendiente',
                'Confirmada',
                'Pagada',
                'Transferida',
                'Cancelada',
                'Confirmar Recibido',
                'Por Cobrar',
                'Cobrados',
                'Activo',
                'Inactivo'
            ];

            if (
                in_array($estado->estado_nombre, $estadosCriticos) &&
                $request->estado_nombre !== $estado->estado_nombre
            ) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se puede cambiar el nombre de estados críticos del sistema',
                    'errors' => [
                        'estado_nombre' => ['Este es un estado crítico del sistema']
                    ]
                ], 422);
            }

            $estado->update($request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Estado actualizado exitosamente',
                'data' => new EstadoResource($estado)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error actualizando estado: ' . $e->getMessage(),
                'errors' => [
                    'general' => [$e->getMessage()]
                ]
            ], 422);
        }
    }

    /**
     * Eliminar estado (soft delete)
     * DELETE /api/estados/{estado}
     */
    public function destroy(Estado $estado): JsonResponse
    {
        try {
            // Verificar si es un estado crítico del sistema
            $estadosCriticos = [
                'Disponible',
                'Mantenimiento',
                'Asignado',
                'Activada',
                'Llena',
                'Ejecución',
                'Cerrada',
                'Liquidar Ruta',
                'Pendiente',
                'Confirmada',
                'Pagada',
                'Transferida',
                'Cancelada',
                'Confirmar Recibido',
                'Por Cobrar',
                'Cobrados',
                'Activo',
                'Inactivo'
            ];

            if (in_array($estado->estado_nombre, $estadosCriticos)) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se puede eliminar estados críticos del sistema'
                ], 422);
            }

            // Verificar si está en uso
            $enUso = $estado->vehiculos()->count() > 0 ||
                $estado->rutasActivas()->count() > 0 ||
                $estado->toursActivos()->count() > 0 ||
                $estado->reservas()->count() > 0 ||
                $estado->cajas()->count() > 0;

            if ($enUso) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se puede eliminar el estado porque está siendo utilizado'
                ], 422);
            }

            $estado->delete();

            return response()->json([
                'success' => true,
                'message' => 'Estado eliminado exitosamente',
                'data' => [
                    'id' => $estado->estado_id,
                    'nombre' => $estado->estado_nombre,
                    'eliminado_en' => now()->format('Y-m-d H:i:s')
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error eliminando estado: ' . $e->getMessage()
            ], 422);
        }
    }

    /**
     * Restaurar estado eliminado
     * PATCH /api/estados/{id}/restore
     */
    public function restore($estadoId): JsonResponse
    {
        try {
            $estado = Estado::withTrashed()->findOrFail($estadoId);
            $estado->restore();

            return response()->json([
                'success' => true,
                'message' => 'Estado restaurado exitosamente',
                'data' => new EstadoResource($estado)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error restaurando estado: ' . $e->getMessage()
            ], 422);
        }
    }

    /**
     * Estadísticas de uso de estados
     * GET /api/estados/estadisticas-uso
     */
    public function estadisticasUso(): JsonResponse
    {
        try {
            $estadisticas = Estado::withCount([
                'vehiculos',
                'rutasActivas',
                'toursActivos',
                'reservas',
                'cajas'
            ])->get()->map(function ($estado) {
                return [
                    'id' => $estado->estado_id,
                    'nombre' => $estado->estado_nombre,
                    'descripcion' => $estado->estado_descripcion,
                    'uso_total' => $estado->vehiculos_count +
                        $estado->rutas_activas_count +
                        $estado->tours_activos_count +
                        $estado->reservas_count +
                        $estado->cajas_count,
                    'desglose' => [
                        'vehiculos' => $estado->vehiculos_count,
                        'rutas_activas' => $estado->rutas_activas_count,
                        'tours_activos' => $estado->tours_activos_count,
                        'reservas' => $estado->reservas_count,
                        'cajas' => $estado->cajas_count
                    ]
                ];
            });

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
}
