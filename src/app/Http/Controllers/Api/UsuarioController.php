<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UsuarioResource;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UsuarioController extends Controller
{
    public function index(Request $request)
    {
        $query = Usuario::query();

        if ($request->filled('activo')) {
            $query->where('usuario_situacion', $request->boolean('activo'));
        }

        if ($request->filled('rol')) {
            $query->porRol($request->rol);
        }

        if ($request->filled('search')) {
            $query->whereHas('persona', function ($q) use ($request) {
                $q->where('persona_nombres', 'like', "%{$request->search}%")
                    ->orWhere('persona_apellidos', 'like', "%{$request->search}%")
                    ->orWhere('persona_email', 'like', "%{$request->search}%");
            })->orWhere('usuario_codigo', 'like', "%{$request->search}%");
        }

        if ($request->has('with_persona')) {
            $query->with('persona.tipoPersona');
        }

        if ($request->has('with_rol')) {
            $query->with('rol');
        }

        if ($request->has('include_estadisticas')) {
            $query->withCount(['reservasCreadas', 'rutasActivadas', 'facturasEmitidas']);
        }

        if ($request->has('perfil_completo')) {
            $request->request->add(['perfil_completo' => true]);
        }

        $sortField = $request->get('sort', 'usuario_codigo');
        $sortDirection = $request->get('direction', 'asc');

        if ($sortField === 'nombre_completo') {
            $query->join('persona', 'usuario.persona_id', '=', 'persona.persona_id')
                ->orderBy('persona.persona_nombres', $sortDirection)
                ->select('usuario.*');
        } else {
            $query->orderBy($sortField, $sortDirection);
        }

        if ($request->has('all')) {
            return UsuarioResource::collection($query->get());
        }

        $usuarios = $query->paginate($request->get('per_page', 15));
        return UsuarioResource::collection($usuarios);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'usuario_codigo' => 'required|string|max:45|unique:usuario',
            'usuario_password' => 'required|string|min:6|confirmed',
            'usuario_situacion' => 'boolean',
            'persona_id' => 'required|exists:persona,persona_id|unique:usuario',
            'rol_id' => 'required|exists:rol,rol_id'
        ]);

        $validated['usuario_password'] = Hash::make($validated['usuario_password']);

        $usuario = Usuario::create($validated);
        $usuario->load(['persona.tipoPersona', 'rol']);

        return new UsuarioResource($usuario);
    }

    public function show(Usuario $usuario)
    {
        $usuario->load(['persona.tipoPersona', 'rol']);
        return new UsuarioResource($usuario);
    }

    public function update(Request $request, Usuario $usuario)
    {
        $validated = $request->validate([
            'usuario_codigo' => [
                'required',
                'string',
                'max:45',
                Rule::unique('usuario')->ignore($usuario->usuario_id, 'usuario_id')
            ],
            'usuario_situacion' => 'boolean',
            'persona_id' => [
                'required',
                'exists:persona,persona_id',
                Rule::unique('usuario')->ignore($usuario->usuario_id, 'usuario_id')
            ],
            'rol_id' => 'required|exists:rol,rol_id'
        ]);

        $usuario->update($validated);
        $usuario->load(['persona.tipoPersona', 'rol']);

        return new UsuarioResource($usuario);
    }

    public function destroy(Usuario $usuario)
    {
        if (
            $usuario->reservasCreadas()->exists() ||
            $usuario->rutasActivadas()->exists() ||
            $usuario->facturasEmitidas()->exists()
        ) {
            return response()->json([
                'message' => 'No se puede eliminar este usuario porque tiene registros asociados.'
            ], Response::HTTP_CONFLICT);
        }

        $usuario->delete();

        return response()->json([
            'message' => 'Usuario eliminado exitosamente'
        ]);
    }

    public function activate(Usuario $usuario)
    {
        $usuario->update(['usuario_situacion' => true]);
        return new UsuarioResource($usuario->load(['persona.tipoPersona', 'rol']));
    }

    public function deactivate(Usuario $usuario)
    {
        $usuario->update(['usuario_situacion' => false]);
        return new UsuarioResource($usuario->load(['persona.tipoPersona', 'rol']));
    }

    public function cambiarPassword(Request $request, Usuario $usuario)
    {
        $validated = $request->validate([
            'password_actual' => 'required|string',
            'password_nuevo' => 'required|string|min:6|confirmed'
        ]);

        if (!$usuario->verificarPassword($validated['password_actual'])) {
            return response()->json([
                'message' => 'La contraseña actual no es correcta'
            ], Response::HTTP_BAD_REQUEST);
        }

        $usuario->usuario_password = Hash::make($validated['password_nuevo']);
        $usuario->save();

        return response()->json([
            'message' => 'Contraseña actualizada exitosamente'
        ]);
    }

    public function resetPassword(Usuario $usuario)
    {
        $nuevaPassword = 'temp123456';
        $usuario->usuario_password = Hash::make($nuevaPassword);
        $usuario->save();

        return response()->json([
            'message' => 'Contraseña restablecida exitosamente',
            'nueva_password' => $nuevaPassword,
            'usuario' => new UsuarioResource($usuario)
        ]);
    }

    public function administradores()
    {
        $admins = Usuario::administradores()
            ->activo()
            ->with(['persona.tipoPersona', 'rol'])
            ->get();

        return UsuarioResource::collection($admins);
    }

    public function vendedores()
    {
        $vendedores = Usuario::vendedores()
            ->activo()
            ->with(['persona.tipoPersona', 'rol'])
            ->get();

        return UsuarioResource::collection($vendedores);
    }

    public function choferes()
    {
        $choferes = Usuario::choferes()
            ->activo()
            ->with(['persona.tipoPersona', 'rol'])
            ->get();

        return UsuarioResource::collection($choferes);
    }

    public function rendimientoVendedor(Usuario $usuario)
    {
        if (!$usuario->puedeVender()) {
            return response()->json([
                'message' => 'Este usuario no es vendedor'
            ], Response::HTTP_BAD_REQUEST);
        }

        $stats = [
            'usuario' => new UsuarioResource($usuario),
            'ventas_mes_actual' => $usuario->getVentasDelMes(),
            'ingresos_generados' => [
                'total' => $usuario->getIngresosGenerados(),
                'mes_actual' => $usuario->getIngresosGenerados(now()->startOfMonth(), now()),
                'mes_anterior' => $usuario->getIngresosGenerados(
                    now()->subMonth()->startOfMonth(),
                    now()->subMonth()->endOfMonth()
                )
            ],
            'estadisticas' => [
                'total_reservas' => $usuario->reservasCreadas()->count(),
                'reservas_activas' => $usuario->reservasCreadas()
                    ->whereHas('estado', function ($q) {
                        $q->whereIn('estado_codigo', ['RES_CONF', 'RES_EJEC']);
                    })->count()
            ]
        ];

        return response()->json($stats);
    }

    public function rutasChofer(Usuario $usuario)
    {
        if (!$usuario->esChofer()) {
            return response()->json([
                'message' => 'Este usuario no es chofer'
            ], Response::HTTP_BAD_REQUEST);
        }

        $rutasActivas = $usuario->getRutasAsignadas();

        return response()->json([
            'chofer' => new UsuarioResource($usuario),
            'tiene_rutas_activas' => $usuario->tieneRutaActiva(),
            'total_rutas_asignadas' => $rutasActivas->count(),
            'rutas_activas' => $rutasActivas->map(function ($ruta) {
                return [
                    'codigo' => $ruta->ruta_activada_codigo,
                    'fecha' => $ruta->ruta_activada_fecha->format('Y-m-d'),
                    'hora' => $ruta->ruta_activada_hora->format('H:i'),
                    'ruta' => $ruta->ruta?->ruta_completa,
                    'vehiculo' => $ruta->vehiculo?->descripcion_completa,
                    'estado' => $ruta->estado?->estado_estado
                ];
            })
        ]);
    }

    public function verificarPermisos(Request $request, Usuario $usuario)
    {
        $validated = $request->validate([
            'recursos' => 'required|array',
            'recursos.*' => 'string'
        ]);

        $permisos = [];
        foreach ($validated['recursos'] as $recurso) {
            $permisos[$recurso] = $usuario->tienePermiso($recurso);
        }

        return response()->json([
            'usuario' => new UsuarioResource($usuario),
            'permisos' => $permisos,
            'nivel_acceso' => $usuario->rol?->nivel_acceso ?? 0
        ]);
    }

    public function generarCodigo(Usuario $usuario)
    {
        $codigoAnterior = $usuario->usuario_codigo;
        $usuario->usuario_codigo = $usuario->generarCodigoUnico();
        $usuario->save();

        return response()->json([
            'usuario' => new UsuarioResource($usuario),
            'codigo_anterior' => $codigoAnterior,
            'codigo_nuevo' => $usuario->usuario_codigo
        ]);
    }

    public function stats()
    {
        $stats = [
            'total' => Usuario::count(),
            'activos' => Usuario::activo()->count(),
            'por_rol' => [
                'administradores' => Usuario::administradores()->count(),
                'vendedores' => Usuario::vendedores()->count(),
                'choferes' => Usuario::choferes()->count()
            ],
            'con_actividad_reciente' => Usuario::activo()
                ->where('updated_at', '>=', now()->subDays(7))
                ->count(),
            'top_vendedores' => Usuario::vendedores()
                ->withCount(['reservasCreadas' => function ($q) {
                    $q->where('created_at', '>=', now()->startOfMonth());
                }])
                ->orderByDesc('reservas_creadas_count')
                ->limit(5)
                ->get()
                ->map(function ($usuario) {
                    return [
                        'usuario' => $usuario->usuario_codigo,
                        'nombre' => $usuario->nombre_completo,
                        'ventas_mes' => $usuario->reservas_creadas_count
                    ];
                })
        ];

        return response()->json($stats);
    }
}
