<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\EmpleadoRequest;
use App\Http\Resources\EmpleadoResource;
use App\Models\Empleado;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Carbon\Carbon;

class EmpleadosController extends Controller
{
    /**
     * Listar empleados con filtros y paginación
     * GET /api/empleados
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Empleado::with(['agencia', 'cargo', 'usuario']);

        // Filtros disponibles
        if ($request->filled('nombre')) {
            $nombre = $request->get('nombre');
            $query->where(function ($q) use ($nombre) {
                $q->where('empleados_nombres', 'like', "%{$nombre}%")
                    ->orWhere('empleados_apellidos', 'like', "%{$nombre}%");
            });
        }

        if ($request->filled('telefono')) {
            $query->where('empleados_telefono', 'like', '%' . $request->get('telefono') . '%');
        }

        if ($request->filled('correo')) {
            $query->where('empleados_correo', 'like', '%' . $request->get('correo') . '%');
        }

        if ($request->filled('dpi')) {
            $query->where('empleados_dpi', 'like', '%' . $request->get('dpi') . '%');
        }

        if ($request->filled('agencia_id')) {
            $query->where('id_agencias', $request->get('agencia_id'));
        }

        if ($request->filled('cargo_id')) {
            $query->where('id_cargo', $request->get('cargo_id'));
        }

        if ($request->filled('estado')) {
            $query->where('empleados_estado', 'like', '%' . $request->get('estado') . '%');
        }

        if ($request->filled('activo')) {
            $activo = $request->get('activo');
            if ($activo === 'true' || $activo === '1') {
                $query->where('empleados_activo', true);
            } elseif ($activo === 'false' || $activo === '0') {
                $query->where('empleados_activo', false);
            }
        }

        if ($request->filled('fecha_ingreso_desde')) {
            $query->whereDate('empleados_fecha_ingreso', '>=', $request->get('fecha_ingreso_desde'));
        }

        if ($request->filled('fecha_ingreso_hasta')) {
            $query->whereDate('empleados_fecha_ingreso', '<=', $request->get('fecha_ingreso_hasta'));
        }

        if ($request->filled('salario_min')) {
            $query->where('empleados_salario', '>=', $request->get('salario_min'));
        }

        if ($request->filled('salario_max')) {
            $query->where('empleados_salario', '<=', $request->get('salario_max'));
        }

        // Filtros especiales
        if ($request->filled('cumpleanos_mes')) {
            $mes = $request->get('cumpleanos_mes');
            $query->whereMonth('empleados_fecha_nacimiento', $mes);
        }

        if ($request->filled('aniversario_mes')) {
            $mes = $request->get('aniversario_mes');
            $query->whereMonth('empleados_fecha_ingreso', $mes);
        }

        if ($request->filled('sin_usuario_sistema')) {
            if ($request->get('sin_usuario_sistema') === 'true') {
                $query->doesntHave('usuario');
            }
        }

        // Filtro de búsqueda general
        if ($request->filled('buscar')) {
            $termino = $request->get('buscar');
            $query->where(function ($q) use ($termino) {
                $q->where('empleados_nombres', 'like', "%{$termino}%")
                    ->orWhere('empleados_apellidos', 'like', "%{$termino}%")
                    ->orWhere('empleados_telefono', 'like', "%{$termino}%")
                    ->orWhere('empleados_correo', 'like', "%{$termino}%")
                    ->orWhere('empleados_dpi', 'like', "%{$termino}%");
            });
        }

        // Filtro por eliminados
        if ($request->get('incluir_eliminados') === 'true') {
            $query->withTrashed();
        } elseif ($request->get('solo_eliminados') === 'true') {
            $query->onlyTrashed();
        }

        // Ordenamiento
        $sortBy = $request->get('sort_by', 'empleados_nombres');
        $sortOrder = $request->get('sort_order', 'asc');

        $allowedSorts = [
            'empleados_nombres',
            'empleados_apellidos',
            'empleados_telefono',
            'empleados_fecha_ingreso',
            'empleados_salario',
            'empleados_estado',
            'empleados_activo',
            'created_at'
        ];

        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortOrder);
        }

        // Paginación
        $perPage = min($request->get('per_page', 15), 100);
        $empleados = $query->paginate($perPage);

        return EmpleadoResource::collection($empleados)->additional([
            'meta' => [
                'filtros_aplicados' => $request->only([
                    'nombre',
                    'telefono',
                    'correo',
                    'dpi',
                    'agencia_id',
                    'cargo_id',
                    'estado',
                    'activo',
                    'fecha_ingreso_desde',
                    'fecha_ingreso_hasta',
                    'salario_min',
                    'salario_max',
                    'cumpleanos_mes',
                    'aniversario_mes',
                    'sin_usuario_sistema',
                    'buscar'
                ]),
                'ordenamiento' => [
                    'campo' => $sortBy,
                    'direccion' => $sortOrder
                ]
            ]
        ]);
    }

    /**
     * Mostrar empleado específico
     * GET /api/empleados/{empleado}
     */
    public function show(Empleado $empleado): EmpleadoResource
    {
        $empleado->load([
            'agencia',
            'cargo',
            'usuario'
        ]);

        return new EmpleadoResource($empleado);
    }

    /**
     * Crear nuevo empleado
     * POST /api/empleados
     */
    public function store(EmpleadoRequest $request): JsonResponse
    {
        try {
            $empleado = Empleado::create(array_merge(
                $request->validated(),
                ['created_by' => $request->user()->id_usuarios]
            ));

            $empleado->load(['agencia', 'cargo']);

            return response()->json([
                'success' => true,
                'message' => 'Empleado creado exitosamente',
                'data' => new EmpleadoResource($empleado)
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creando empleado: ' . $e->getMessage(),
                'errors' => [
                    'general' => [$e->getMessage()]
                ]
            ], 422);
        }
    }

    /**
     * Actualizar empleado
     * PUT /api/empleados/{empleado}
     */
    public function update(EmpleadoRequest $request, Empleado $empleado): JsonResponse
    {
        try {
            $empleado->update($request->validated());
            $empleado->load(['agencia', 'cargo', 'usuario']);

            return response()->json([
                'success' => true,
                'message' => 'Empleado actualizado exitosamente',
                'data' => new EmpleadoResource($empleado)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error actualizando empleado: ' . $e->getMessage(),
                'errors' => [
                    'general' => [$e->getMessage()]
                ]
            ], 422);
        }
    }

    /**
     * Eliminar empleado (soft delete)
     * DELETE /api/empleados/{empleado}
     */
    public function destroy(Empleado $empleado): JsonResponse
    {
        try {
            // Verificar si tiene usuario del sistema asociado
            if ($empleado->usuario) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se puede eliminar el empleado porque tiene un usuario del sistema asociado. Primero desactive el usuario.'
                ], 422);
            }

            $empleado->delete();

            return response()->json([
                'success' => true,
                'message' => 'Empleado eliminado exitosamente',
                'data' => [
                    'id' => $empleado->id_empleados,
                    'nombre' => $empleado->empleados_nombres . ' ' . $empleado->empleados_apellidos,
                    'eliminado_en' => now()->format('Y-m-d H:i:s')
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error eliminando empleado: ' . $e->getMessage()
            ], 422);
        }
    }

    /**
     * Restaurar empleado eliminado
     * PATCH /api/empleados/{empleado}/restore
     */
    public function restore($empleadoId): JsonResponse
    {
        try {
            $empleado = Empleado::withTrashed()->findOrFail($empleadoId);
            $empleado->restore();
            $empleado->load(['agencia', 'cargo']);

            return response()->json([
                'success' => true,
                'message' => 'Empleado restaurado exitosamente',
                'data' => new EmpleadoResource($empleado)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error restaurando empleado: ' . $e->getMessage()
            ], 422);
        }
    }

    /**
     * Buscar empleados
     * GET /api/empleados/buscar
     */
    public function buscar(Request $request): AnonymousResourceCollection
    {
        $request->validate([
            'termino' => 'required|string|min:2'
        ]);

        $termino = $request->get('termino');

        $query = Empleado::with(['agencia', 'cargo'])
            ->where('empleados_activo', true)
            ->where(function ($q) use ($termino) {
                $q->where('empleados_nombres', 'like', "%{$termino}%")
                    ->orWhere('empleados_apellidos', 'like', "%{$termino}%")
                    ->orWhere('empleados_telefono', 'like', "%{$termino}%")
                    ->orWhere('empleados_dpi', 'like', "%{$termino}%");
            });

        $empleados = $query->limit(20)->get();

        return EmpleadoResource::collection($empleados);
    }

    /**
     * Obtener empleados por agencia
     * GET /api/empleados/por-agencia/{agenciaId}
     */
    public function porAgencia($agenciaId): AnonymousResourceCollection
    {
        $empleados = Empleado::with(['cargo', 'usuario'])
            ->where('id_agencias', $agenciaId)
            ->where('empleados_activo', true)
            ->orderBy('empleados_nombres')
            ->get();

        return EmpleadoResource::collection($empleados);
    }

    /**
     * Obtener cumpleaños del mes
     * GET /api/empleados/cumpleanos/{mes?}
     */
    public function cumpleanosMes($mes = null): JsonResponse
    {
        $mes = $mes ?? today()->month;

        $empleados = Empleado::with(['agencia', 'cargo'])
            ->where('empleados_activo', true)
            ->whereMonth('empleados_fecha_nacimiento', $mes)
            ->orderByRaw('DAY(empleados_fecha_nacimiento)')
            ->get();

        $cumpleanos = $empleados->map(function ($empleado) {
            return [
                'id' => $empleado->id_empleados,
                'nombre_completo' => $empleado->empleados_nombres . ' ' . $empleado->empleados_apellidos,
                'fecha_nacimiento' => $empleado->empleados_fecha_nacimiento?->format('d/m/Y'),
                'dia' => $empleado->empleados_fecha_nacimiento?->day,
                'edad_cumple' => $empleado->empleados_fecha_nacimiento
                    ? $empleado->empleados_fecha_nacimiento->diffInYears(today()) + 1
                    : null,
                'agencia' => $empleado->agencia->agencias_nombre,
                'cargo' => $empleado->cargo->cargo_nombre,
                'es_hoy' => $empleado->empleados_fecha_nacimiento &&
                    $empleado->empleados_fecha_nacimiento->format('m-d') === today()->format('m-d'),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'mes' => $mes,
                'nombre_mes' => Carbon::create(null, $mes)->translatedFormat('F'),
                'total_cumpleanos' => $cumpleanos->count(),
                'cumpleanos_hoy' => $cumpleanos->where('es_hoy', true)->count(),
                'empleados' => $cumpleanos
            ]
        ]);
    }

    /**
     * Obtener aniversarios laborales del mes
     * GET /api/empleados/aniversarios/{mes?}
     */
    public function aniversariosMes($mes = null): JsonResponse
    {
        $mes = $mes ?? today()->month;

        $empleados = Empleado::with(['agencia', 'cargo'])
            ->where('empleados_activo', true)
            ->whereMonth('empleados_fecha_ingreso', $mes)
            ->orderByRaw('DAY(empleados_fecha_ingreso)')
            ->get();

        $aniversarios = $empleados->map(function ($empleado) {
            return [
                'id' => $empleado->id_empleados,
                'nombre_completo' => $empleado->empleados_nombres . ' ' . $empleado->empleados_apellidos,
                'fecha_ingreso' => $empleado->empleados_fecha_ingreso?->format('d/m/Y'),
                'dia' => $empleado->empleados_fecha_ingreso?->day,
                'anos_cumple' => $empleado->empleados_fecha_ingreso
                    ? $empleado->empleados_fecha_ingreso->diffInYears(today()) + 1
                    : null,
                'agencia' => $empleado->agencia->agencias_nombre,
                'cargo' => $empleado->cargo->cargo_nombre,
                'es_hoy' => $empleado->empleados_fecha_ingreso &&
                    $empleado->empleados_fecha_ingreso->format('m-d') === today()->format('m-d'),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'mes' => $mes,
                'nombre_mes' => Carbon::create(null, $mes)->translatedFormat('F'),
                'total_aniversarios' => $aniversarios->count(),
                'aniversarios_hoy' => $aniversarios->where('es_hoy', true)->count(),
                'empleados' => $aniversarios
            ]
        ]);
    }

    /**
     * Crear usuario del sistema para empleado
     * POST /api/empleados/{empleado}/crear-usuario
     */
    public function crearUsuario(Empleado $empleado, Request $request): JsonResponse
    {
        $request->validate([
            'username' => 'required|string|max:50|unique:usuarios,usuarios_nombre',
            'password' => 'required|string|min:8',
            'email' => 'nullable|email|unique:usuarios,usuarios_correo'
        ]);

        try {
            // Verificar que no tenga ya un usuario
            if ($empleado->usuario) {
                return response()->json([
                    'success' => false,
                    'message' => 'El empleado ya tiene un usuario del sistema asociado.'
                ], 422);
            }

            $usuario = User::create([
                'usuarios_nombre' => $request->username,
                'usuarios_correo' => $request->email ?? $empleado->empleados_correo ?? $empleado->empleados_nombres . '@magictravel.gt',
                'password' => bcrypt($request->password),
                'id_empleados' => $empleado->id_empleados,
                'usuarios_activo' => true,
                'created_by' => $request->user()->id_usuarios
            ]);

            $empleado->load(['agencia', 'cargo', 'usuario']);

            return response()->json([
                'success' => true,
                'message' => 'Usuario del sistema creado exitosamente',
                'data' => [
                    'empleado' => new EmpleadoResource($empleado),
                    'credenciales' => [
                        'username' => $usuario->usuarios_nombre,
                        'email' => $usuario->usuarios_correo,
                        'password_temporal' => $request->password
                    ]
                ]
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creando usuario: ' . $e->getMessage()
            ], 422);
        }
    }
}
