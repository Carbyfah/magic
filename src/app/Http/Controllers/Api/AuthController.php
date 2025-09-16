<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use App\Models\UsuarioPermiso;

class AuthController extends Controller
{
    /**
     * Login del usuario
     * POST /api/login
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string|min:6',
        ]);

        // Buscar usuario por email en tabla usuarios
        $user = User::where('usuarios_correo', $request->email)->first();

        // Verificar si existe el usuario y la contraseña es correcta
        if (!$user || !Hash::check($request->password, $user->usuario_password)) {
            throw ValidationException::withMessages([
                'email' => ['Las credenciales son incorrectas.'],
            ]);
        }

        // Verificar que el usuario esté activo (no soft deleted)
        if ($user->deleted_at !== null) {
            throw ValidationException::withMessages([
                'email' => ['Este usuario está inactivo.'],
            ]);
        }

        // Crear token de acceso
        $token = $user->createToken('magic-travel-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login exitoso',
            'data' => [
                'user' => [
                    'id' => $user->id_usuarios,
                    'name' => $user->name, // Usa el accessor que definimos
                    'email' => $user->usuarios_correo,
                    'username' => $user->usuarios_nombre,
                    'empleado' => $user->empleado ? [
                        'id' => $user->empleado->id_empleados,
                        'nombres' => $user->empleado->empleados_nombres,
                        'apellidos' => $user->empleado->empleados_apellidos,
                        'agencia_id' => $user->empleado->id_agencias,
                        'cargo_id' => $user->empleado->id_cargo,
                    ] : null
                ],
                'token' => $token,
                'token_type' => 'Bearer',
            ]
        ], 200);
    }

    /**
     * Obtener usuario autenticado con permisos
     * GET /api/me
     */
    public function me(Request $request)
    {
        $user = $request->user()->load(['empleado.agencia', 'empleado.cargo', 'permisos']);

        // Obtener permisos organizados por módulo
        $permisos = $user->obtenerPermisos();

        // Si no tiene permisos configurados, devolver estructura vacía
        if ($permisos->isEmpty()) {
            $permisos = collect(UsuarioPermiso::$modulosDisponibles)->mapWithKeys(function ($nombre, $modulo) {
                return [$modulo => [
                    'ver' => false,
                    'crear' => false,
                    'editar' => false,
                    'eliminar' => false
                ]];
            });
        }

        return response()->json([
            'success' => true,
            'data' => [
                'user' => [
                    'id' => $user->id_usuarios,
                    'name' => $user->name,
                    'email' => $user->usuarios_correo,
                    'username' => $user->usuarios_nombre,
                    'permisos' => $permisos,
                    'modulos_disponibles' => UsuarioPermiso::$modulosDisponibles,
                    'empleado' => $user->empleado ? [
                        'id' => $user->empleado->id_empleados,
                        'nombres' => $user->empleado->empleados_nombres,
                        'apellidos' => $user->empleado->empleados_apellidos,
                        'nombre_completo' => $user->empleado->nombre_completo,
                        'agencia' => $user->empleado->agencia ? [
                            'id' => $user->empleado->agencia->id_agencias,
                            'nombre' => $user->empleado->agencia->agencias_nombre,
                        ] : null,
                        'cargo' => $user->empleado->cargo ? [
                            'id' => $user->empleado->cargo->id_cargo,
                            'nombre' => $user->empleado->cargo->cargo_nombre,
                        ] : null
                    ] : null
                ]
            ]
        ]);
    }

    /**
     * Logout del usuario
     * POST /api/logout
     */
    public function logout(Request $request)
    {
        // Eliminar el token actual
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout exitoso'
        ], 200);
    }

    /**
     * Logout de todos los dispositivos
     * POST /api/logout-all
     */
    public function logoutAll(Request $request)
    {
        // Eliminar todos los tokens del usuario
        $request->user()->tokens()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout de todos los dispositivos exitoso'
        ], 200);
    }

    /**
     * Refrescar token
     * POST /api/refresh
     */
    public function refresh(Request $request)
    {
        $user = $request->user();

        // Eliminar token actual
        $request->user()->currentAccessToken()->delete();

        // Crear nuevo token
        $newToken = $user->createToken('magic-travel-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Token refrescado exitosamente',
            'data' => [
                'token' => $newToken,
                'token_type' => 'Bearer',
            ]
        ], 200);
    }

    /**
     * Cambiar contraseña
     * POST /api/change-password
     */
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:6|confirmed',
        ]);

        $user = $request->user();

        // Verificar contraseña actual
        if (!Hash::check($request->current_password, $user->usuario_password)) {
            throw ValidationException::withMessages([
                'current_password' => ['La contraseña actual es incorrecta.'],
            ]);
        }

        // Actualizar contraseña
        $user->update([
            'usuario_password' => Hash::make($request->new_password)
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Contraseña actualizada exitosamente'
        ], 200);
    }

    /**
     * Verificar si el token es válido
     * GET /api/verify-token
     */
    public function verifyToken(Request $request)
    {
        return response()->json([
            'success' => true,
            'message' => 'Token válido',
            'data' => [
                'user_id' => $request->user()->id_usuarios,
                'token_valid' => true
            ]
        ], 200);
    }
}
