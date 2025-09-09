<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Usuario;
use App\Http\Resources\UsuarioResource;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UsuarioController extends Controller
{
    /**
     * LISTAR USUARIOS
     */
    public function index(Request $request)
    {
        $query = Usuario::with(['persona', 'rol']);

        // Filtro básico por situación
        if ($request->filled('activo')) {
            $query->where('usuario_situacion', $request->boolean('activo'));
        }

        // Filtro por rol
        if ($request->filled('rol_id')) {
            $query->porRol($request->rol_id);
        }

        // Búsqueda simple
        if ($request->filled('search')) {
            $query->buscar($request->search);
        }

        // Ordenamiento
        $query->orderBy('usuario_codigo');

        $usuarios = $query->get();

        return UsuarioResource::collection($usuarios);
    }

    /**
     * CREAR USUARIO
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'usuario_codigo' => 'sometimes|string|max:45|unique:usuario',
            'usuario_password' => 'required|string|min:8|max:500',
            'persona_id' => 'required|exists:persona,persona_id',
            'rol_id' => 'required|exists:rol,rol_id',
            'usuario_situacion' => 'sometimes|boolean'
        ]);

        // Generar código automáticamente si no viene
        $validated['usuario_codigo'] = $validated['usuario_codigo'] ?? Usuario::generarCodigo();
        $validated['usuario_situacion'] = $validated['usuario_situacion'] ?? true;

        // Validar persona única si se proporciona
        if (!empty($validated['persona_id'])) {
            $personaExiste = Usuario::where('persona_id', $validated['persona_id'])->exists();
            if ($personaExiste) {
                return response()->json([
                    'message' => 'La persona ya tiene un usuario registrado',
                    'errors' => ['persona_id' => ['Esta persona ya está en uso']]
                ], 422);
            }
        }

        $usuario = Usuario::create($validated);
        $usuario->load(['persona', 'rol']);

        return new UsuarioResource($usuario);
    }

    /**
     * VER USUARIO ESPECÍFICO
     */
    public function show(Usuario $usuario)
    {
        $usuario->load(['persona', 'rol', 'rutasActivadas']);
        return new UsuarioResource($usuario);
    }

    /**
     * ACTUALIZAR USUARIO
     */
    public function update(Request $request, Usuario $usuario)
    {
        $validated = $request->validate([
            'usuario_codigo' => [
                'sometimes',
                'string',
                'max:45',
                Rule::unique('usuario')->ignore($usuario->usuario_id, 'usuario_id')
            ],
            'usuario_password' => 'sometimes|string|min:8|max:500',
            'persona_id' => 'required|exists:persona,persona_id',
            'rol_id' => 'required|exists:rol,rol_id',
            'usuario_situacion' => 'sometimes|boolean'
        ]);

        // Validar persona única si se proporciona y es diferente
        if (
            !empty($validated['persona_id']) &&
            $validated['persona_id'] !== $usuario->persona_id
        ) {

            if (!$usuario->esPersonaUnica($validated['persona_id'], $usuario->usuario_id)) {
                return response()->json([
                    'message' => 'La persona ya tiene un usuario registrado',
                    'errors' => ['persona_id' => ['Esta persona ya está en uso']]
                ], 422);
            }
        }

        $usuario->update($validated);
        $usuario->load(['persona', 'rol']);

        return new UsuarioResource($usuario);
    }

    /**
     * ELIMINAR USUARIO (Solo si no tiene rutas activadas)
     */
    public function destroy(Usuario $usuario)
    {
        if (!$usuario->puedeSerEliminado()) {
            return response()->json([
                'message' => 'No se puede eliminar este usuario porque tiene rutas activadas en el sistema.'
            ], 409);
        }

        $usuario->delete();

        return response()->json(['message' => 'Usuario eliminado exitosamente']);
    }

    /**
     * ACTIVAR USUARIO
     */
    public function activate(Usuario $usuario)
    {
        $usuario->update(['usuario_situacion' => 1]);
        $usuario->load(['persona', 'rol']);

        return new UsuarioResource($usuario);
    }

    /**
     * DESACTIVAR USUARIO
     */
    public function deactivate(Usuario $usuario)
    {
        // Validar si tiene rutas activadas
        if ($usuario->tieneRutasActivadas()) {
            return response()->json([
                'message' => 'No se puede desactivar un usuario que tiene rutas activadas en el sistema.'
            ], 409);
        }

        $usuario->update(['usuario_situacion' => 0]);
        $usuario->load(['persona', 'rol']);

        return new UsuarioResource($usuario);
    }

    /**
     * VERIFICAR DISPONIBILIDAD DE CÓDIGO
     */
    public function verificarCodigo(Request $request)
    {
        $request->validate([
            'codigo' => 'required|string',
            'except_id' => 'nullable|integer'
        ]);

        $disponible = Usuario::where('usuario_codigo', $request->codigo)
            ->when($request->except_id, function ($query, $exceptId) {
                return $query->where('usuario_id', '!=', $exceptId);
            })
            ->doesntExist();

        return response()->json([
            'disponible' => $disponible,
            'message' => $disponible ? 'Código disponible' : 'Código ya está en uso'
        ]);
    }

    /**
     * OBTENER USUARIOS POR ROL
     */
    public function porRol(Request $request, $rolId)
    {
        $query = Usuario::with(['persona', 'rol'])
            ->porRol($rolId)
            ->activo();

        if ($request->filled('search')) {
            $query->buscar($request->search);
        }

        $usuarios = $query->orderBy('usuario_codigo')->get();

        return UsuarioResource::collection($usuarios);
    }

    /**
     * OBTENER USUARIOS POR PERSONA
     */
    public function porPersona(Request $request, $personaId)
    {
        $query = Usuario::with(['persona', 'rol'])
            ->where('persona_id', $personaId)
            ->activo();

        if ($request->filled('search')) {
            $query->buscar($request->search);
        }

        $usuarios = $query->orderBy('usuario_codigo')->get();

        return UsuarioResource::collection($usuarios);
    }

    /**
     * LOGIN DE USUARIO
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'usuario_codigo' => 'required|string',
            'password' => 'required|string'
        ]);

        $usuario = Usuario::with(['persona', 'rol'])
            ->where('usuario_codigo', $validated['usuario_codigo'])
            ->where('usuario_situacion', 1)
            ->first();

        if (!$usuario || !$usuario->verificarPassword($validated['password'])) {
            return response()->json([
                'message' => 'Credenciales incorrectas'
            ], 401);
        }

        // Generar token simple (puedes cambiar por JWT después)
        $token = base64_encode($usuario->usuario_id . '|' . time() . '|' . rand(1000, 9999));

        return response()->json([
            'message' => 'Login exitoso',
            'user' => new UsuarioResource($usuario),
            'token' => $token
        ]);
    }

    /**
     * LOGOUT DE USUARIO
     */
    public function logout(Request $request)
    {
        return response()->json([
            'message' => 'Logout exitoso'
        ]);
    }

    /**
     * OBTENER USUARIO AUTENTICADO
     */
    public function me(Request $request)
    {
        // Por ahora simulamos obtener el usuario del token
        $token = $request->bearerToken();
        if (!$token) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        try {
            $decoded = base64_decode($token);
            $parts = explode('|', $decoded);
            $usuarioId = $parts[0];

            $usuario = Usuario::with(['persona', 'rol'])->find($usuarioId);

            if (!$usuario || !$usuario->usuario_situacion) {
                return response()->json(['message' => 'Usuario inactivo'], 401);
            }

            return new UsuarioResource($usuario);
        } catch (Exception $e) {
            return response()->json(['message' => 'Token inválido'], 401);
        }
    }
}
