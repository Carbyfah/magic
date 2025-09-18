<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AgenciaRequest;
use App\Http\Resources\AgenciaResource;
use App\Http\Resources\EmpleadoResource;
use App\Http\Resources\RutaResource;
use App\Models\Agencia;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AgenciasController extends Controller
{
    /**
     * Listar agencias activas
     * GET /api/agencias
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Agencia::activas();

        // Filtro por nombre
        if ($request->filled('nombre')) {
            $query->where('agencias_nombre', 'like', '%' . $request->get('nombre') . '%');
        }

        // Filtro de búsqueda general
        if ($request->filled('buscar')) {
            $termino = $request->get('buscar');
            $query->where('agencias_nombre', 'like', "%{$termino}%");
        }

        // Incluir relaciones si se solicita
        if ($request->get('con_empleados') === 'true') {
            $query->withCount('empleados');
        }

        if ($request->get('con_rutas') === 'true') {
            $query->withCount('rutas');
        }

        if ($request->get('con_tours') === 'true') {
            $query->withCount('tours');
        }

        if ($request->get('con_vehiculos') === 'true') {
            $query->withCount('vehiculos');
        }

        // Ordenamiento
        $query->orderBy('agencias_nombre', 'asc');

        // Paginación
        $perPage = min($request->get('per_page', 15), 50);
        $agencias = $query->paginate($perPage);

        return AgenciaResource::collection($agencias);
    }

    /**
     * Obtener Magic Travel específicamente
     * GET /api/agencias/magic-travel
     */
    public function magicTravel(): JsonResponse
    {
        $magicTravel = Agencia::magicTravel();

        if (!$magicTravel) {
            return response()->json([
                'success' => false,
                'message' => 'Magic Travel no encontrada en el sistema'
            ], 404);
        }

        $magicTravel->load(['empleados.cargo', 'rutas', 'tours', 'vehiculos']);

        return response()->json([
            'success' => true,
            'data' => new AgenciaResource($magicTravel)
        ]);
    }

    /**
     * Obtener otras agencias (para transferencias)
     * GET /api/agencias/otras
     */
    public function otras(): AnonymousResourceCollection
    {
        $agencias = Agencia::paraTransferencias();
        return AgenciaResource::collection($agencias);
    }

    /**
     * Opciones para formularios
     * GET /api/agencias/opciones
     */
    public function opciones(Request $request): JsonResponse
    {
        $incluirMagicTravel = $request->get('incluir_magic_travel', 'true') === 'true';

        if ($incluirMagicTravel) {
            $opciones = Agencia::opciones();
        } else {
            $opciones = Agencia::opcionesTransferencias();
        }

        return response()->json([
            'success' => true,
            'data' => $opciones
        ]);
    }

    /**
     * Mostrar agencia específica
     * GET /api/agencias/{agencia}
     */
    public function show(Agencia $agencia): JsonResponse
    {
        $agencia->load(['empleados.cargo', 'rutas', 'tours', 'vehiculos']);

        return response()->json([
            'success' => true,
            'data' => new AgenciaResource($agencia),
            'estadisticas' => $agencia->estadisticas(),
            'es_magic_travel' => $agencia->esMagicTravel()
        ]);
    }

    /**
     * Crear nueva agencia
     * POST /api/agencias
     */
    public function store(AgenciaRequest $request): JsonResponse
    {
        try {
            // Verificar si ya existe Magic Travel al crear una nueva
            $nombreAgencia = $request->validated()['agencias_nombre'];
            if (strtolower($nombreAgencia) === 'magic travel') {
                $existeMagicTravel = Agencia::magicTravel();
                if ($existeMagicTravel) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Ya existe una agencia llamada Magic Travel en el sistema',
                        'errors' => [
                            'agencias_nombre' => ['Magic Travel ya existe']
                        ]
                    ], 422);
                }
            }

            $agencia = Agencia::create(array_merge(
                $request->validated(),
                ['created_by' => $request->user()->id_usuarios ?? null]
            ));

            return response()->json([
                'success' => true,
                'message' => 'Agencia creada exitosamente',
                'data' => new AgenciaResource($agencia)
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creando agencia: ' . $e->getMessage(),
                'errors' => [
                    'general' => [$e->getMessage()]
                ]
            ], 422);
        }
    }

    /**
     * Actualizar agencia
     * PUT /api/agencias/{agencia}
     */
    public function update(AgenciaRequest $request, Agencia $agencia): JsonResponse
    {
        try {
            // Verificar si se está intentando cambiar el nombre de Magic Travel
            $nombreActual = $agencia->agencias_nombre;
            $nombreNuevo = $request->validated()['agencias_nombre'];

            if ($nombreActual === 'Magic Travel' && $nombreNuevo !== 'Magic Travel') {
                return response()->json([
                    'success' => false,
                    'message' => 'No se puede cambiar el nombre de Magic Travel',
                    'errors' => [
                        'agencias_nombre' => ['Magic Travel no se puede renombrar']
                    ]
                ], 422);
            }

            $agencia->update($request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Agencia actualizada exitosamente',
                'data' => new AgenciaResource($agencia)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error actualizando agencia: ' . $e->getMessage(),
                'errors' => [
                    'general' => [$e->getMessage()]
                ]
            ], 422);
        }
    }

    /**
     * Eliminar agencia (soft delete)
     * DELETE /api/agencias/{agencia}
     */
    public function destroy(Agencia $agencia): JsonResponse
    {
        try {
            // No permitir eliminar Magic Travel
            if ($agencia->esMagicTravel()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se puede eliminar Magic Travel'
                ], 422);
            }

            // Para otras agencias, eliminar directamente
            // La validación de capacidad/operación se maneja por WhatsApp
            $agencia->delete();

            return response()->json([
                'success' => true,
                'message' => 'Agencia eliminada exitosamente',
                'data' => [
                    'id' => $agencia->id_agencias,
                    'nombre' => $agencia->agencias_nombre,
                    'eliminada_en' => now()->format('Y-m-d H:i:s')
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error eliminando agencia: ' . $e->getMessage()
            ], 422);
        }
    }

    /**
     * Restaurar agencia eliminada
     * PATCH /api/agencias/{id}/restore
     */
    public function restore($agenciaId): JsonResponse
    {
        try {
            $agencia = Agencia::withTrashed()->findOrFail($agenciaId);
            $agencia->restore();

            return response()->json([
                'success' => true,
                'message' => 'Agencia restaurada exitosamente',
                'data' => new AgenciaResource($agencia)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error restaurando agencia: ' . $e->getMessage()
            ], 422);
        }
    }

    /**
     * Obtener empleados de una agencia
     * GET /api/agencias/{agencia}/empleados
     */
    public function empleados(Agencia $agencia): AnonymousResourceCollection
    {
        $empleados = $agencia->empleados()
            ->with('cargo')
            ->orderBy('empleados_nombres')
            ->get();

        return EmpleadoResource::collection($empleados);
    }

    /**
     * Obtener rutas de una agencia
     * GET /api/agencias/{agencia}/rutas
     */
    public function rutas(Agencia $agencia): AnonymousResourceCollection
    {
        $rutas = $agencia->rutas()
            ->orderBy('rutas_origen')
            ->get();

        return RutaResource::collection($rutas);
    }

    /**
     * Obtener estadísticas de la agencia
     * GET /api/agencias/{agencia}/estadisticas
     */
    public function estadisticas(Agencia $agencia): JsonResponse
    {
        try {
            $estadisticas = $agencia->estadisticas();

            return response()->json([
                'success' => true,
                'data' => [
                    'agencia' => [
                        'id' => $agencia->id_agencias,
                        'nombre' => $agencia->agencias_nombre,
                        'es_magic_travel' => $agencia->esMagicTravel(),
                        'creada_en' => $agencia->created_at?->format('Y-m-d H:i:s'),
                        'actualizada_en' => $agencia->updated_at?->format('Y-m-d H:i:s')
                    ],
                    'estadisticas' => $estadisticas
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error obteniendo estadísticas: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Buscar agencias
     * GET /api/agencias/buscar
     */
    public function buscar(Request $request): AnonymousResourceCollection
    {
        $request->validate([
            'termino' => 'required|string|min:2'
        ]);

        $termino = $request->get('termino');
        $incluirMagicTravel = $request->get('incluir_magic_travel', 'true') === 'true';

        $query = Agencia::activas()
            ->where('agencias_nombre', 'like', "%{$termino}%");

        if (!$incluirMagicTravel) {
            $query->otrasAgencias();
        }

        $agencias = $query->limit(20)->get();

        return AgenciaResource::collection($agencias);
    }
}
