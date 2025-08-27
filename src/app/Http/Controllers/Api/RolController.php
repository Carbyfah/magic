<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\RolResource;
use App\Models\Rol;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class RolController extends Controller
{
    public function index(Request $request)
    {
        $query = Rol::query();

        // Filtros
        if ($request->filled('activo')) {
            $query->where('rol_situacion', $request->boolean('activo'));
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('rol_codigo', 'like', "%{$request->search}%")
                    ->orWhere('rol_rol', 'like', "%{$request->search}%")
                    ->orWhere('rol_descripcion', 'like', "%{$request->search}%");
            });
        }

        if ($request->filled('nivel_minimo')) {
            $codigos = ['ADMIN', 'GERENTE', 'VENDEDOR', 'OPERADOR', 'CHOFER'];
            $nivel = (int) $request->nivel_minimo;

            $codigosPermitidos = array_filter($codigos, function ($codigo) use ($nivel) {
                $niveles = ['ADMIN' => 5, 'GERENTE' => 4, 'VENDEDOR' => 3, 'OPERADOR' => 2, 'CHOFER' => 1];
                return ($niveles[$codigo] ?? 0) >= $nivel;
            });

            $query->whereIn('rol_codigo', $codigosPermitidos);
        }

        // Incluir relaciones
        if ($request->has('with_usuarios_count')) {
            $query->withCount('usuarios');
        }

        // Ordenamiento por nivel de acceso
        if ($request->get('sort') === 'nivel_acceso') {
            $query->orderByRaw(
                "
                CASE rol_codigo
                    WHEN 'ADMIN' THEN 5
                    WHEN 'GERENTE' THEN 4
                    WHEN 'VENDEDOR' THEN 3
                    WHEN 'OPERADOR' THEN 2
                    WHEN 'CHOFER' THEN 1
                    ELSE 0
                END " . $request->get('direction', 'desc')
            );
        } else {
            $sortField = $request->get('sort', 'rol_codigo');
            $sortDirection = $request->get('direction', 'asc');
            $query->orderBy($sortField, $sortDirection);
        }

        if ($request->has('all')) {
            return RolResource::collection($query->get());
        }

        $roles = $query->paginate($request->get('per_page', 15));
        return RolResource::collection($roles);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'rol_codigo' => 'required|string|max:45|unique:rol',
            'rol_rol' => 'required|string|max:45',
            'rol_descripcion' => 'nullable|string|max:100',
            'rol_situacion' => 'boolean'
        ]);

        $rol = Rol::create($validated);

        return new RolResource($rol);
    }

    public function show(Rol $rol)
    {
        return new RolResource($rol);
    }

    public function update(Request $request, Rol $rol)
    {
        $validated = $request->validate([
            'rol_codigo' => [
                'required',
                'string',
                'max:45',
                Rule::unique('rol')->ignore($rol->rol_id, 'rol_id')
            ],
            'rol_rol' => 'required|string|max:45',
            'rol_descripcion' => 'nullable|string|max:100',
            'rol_situacion' => 'boolean'
        ]);

        $rol->update($validated);

        return new RolResource($rol);
    }

    public function destroy(Rol $rol)
    {
        // Verificar si tiene usuarios asociados
        if ($rol->usuarios()->exists()) {
            return response()->json([
                'message' => 'No se puede eliminar este rol porque tiene usuarios asociados.'
            ], Response::HTTP_CONFLICT);
        }

        $rol->delete();

        return response()->json([
            'message' => 'Rol eliminado exitosamente'
        ]);
    }

    public function activate(Rol $rol)
    {
        $rol->update(['rol_situacion' => true]);
        return new RolResource($rol);
    }

    public function deactivate(Rol $rol)
    {
        $rol->update(['rol_situacion' => false]);
        return new RolResource($rol);
    }

    public function byCode(Request $request, $codigo)
    {
        $rol = Rol::where('rol_codigo', $codigo)->first();

        if (!$rol) {
            return response()->json([
                'message' => 'Rol no encontrado'
            ], Response::HTTP_NOT_FOUND);
        }

        return new RolResource($rol);
    }

    public function permissions(Rol $rol)
    {
        $recursos = [
            'usuarios',
            'roles',
            'configuracion',
            'reportes',
            'auditoria',
            'vehiculos',
            'rutas',
            'servicios',
            'empleados',
            'reservas',
            'clientes',
            'agencias',
            'facturas',
            'rutas_activadas',
            'rutas_asignadas'
        ];

        $permisos = [];
        foreach ($recursos as $recurso) {
            $permisos[$recurso] = $rol->puedeGestionar($recurso);
        }

        return response()->json([
            'rol' => new RolResource($rol),
            'permisos' => $permisos
        ]);
    }

    public function jerarquia()
    {
        $roles = Rol::activo()
            ->get()
            ->sortByDesc(function ($rol) {
                return $rol->nivel_acceso;
            })
            ->values();

        return RolResource::collection($roles);
    }

    public function stats()
    {
        $stats = [
            'total' => Rol::count(),
            'activos' => Rol::activo()->count(),
            'con_usuarios' => Rol::has('usuarios')->count(),
            'distribucion' => Rol::activo()
                ->withCount('usuarios')
                ->get()
                ->map(function ($rol) {
                    return [
                        'codigo' => $rol->rol_codigo,
                        'nombre' => $rol->rol_rol,
                        'nivel_acceso' => $rol->nivel_acceso,
                        'usuarios_count' => $rol->usuarios_count
                    ];
                })
                ->sortByDesc('nivel_acceso')
                ->values()
        ];

        return response()->json($stats);
    }

    public function checkAccess(Request $request)
    {
        $validated = $request->validate([
            'rol_id' => 'required|exists:rol,rol_id',
            'recurso' => 'required|string'
        ]);

        $rol = Rol::find($validated['rol_id']);
        $tieneAcceso = $rol->puedeGestionar($validated['recurso']);

        return response()->json([
            'tiene_acceso' => $tieneAcceso,
            'rol' => new RolResource($rol),
            'recurso' => $validated['recurso']
        ]);
    }
}
