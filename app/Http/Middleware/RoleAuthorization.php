<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Usuario;

class RoleAuthorization
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, ...$roles)
    {
        // Obtener token del header
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json(['message' => 'Token requerido'], 401);
        }

        try {
            // Decodificar token (usando tu sistema actual)
            $decoded = base64_decode($token);
            $parts = explode('|', $decoded);
            $usuarioId = $parts[0];

            // Obtener usuario con relaciones
            $usuario = Usuario::with(['persona', 'rol'])
                ->where('usuario_id', $usuarioId)
                ->where('usuario_situacion', 1)
                ->first();

            if (!$usuario) {
                return response()->json(['message' => 'Usuario no válido'], 401);
            }

            // Verificar si el usuario tiene uno de los roles permitidos
            $rolUsuario = $this->normalizarTexto($usuario->rol->rol_rol ?? '');
            $rolesPermitidos = array_map([$this, 'normalizarTexto'], $roles);

            // Log para debug (remover en producción)
            \Log::info('AUTH MIDDLEWARE:', [
                'usuario_id' => $usuario->usuario_id,
                'rol_original' => $usuario->rol->rol_rol ?? 'NULL',
                'rol_normalizado' => $rolUsuario,
                'roles_solicitados_original' => $roles,
                'roles_solicitados_normalizados' => $rolesPermitidos,
                'coincide' => in_array($rolUsuario, $rolesPermitidos)
            ]);

            // ADMINISTRADOR tiene acceso a TODO
            if ($rolUsuario === 'administrador') {
                $request->attributes->set('current_user', $usuario);
                return $next($request);
            }

            // Verificar si el rol del usuario está en los roles permitidos
            if (in_array($rolUsuario, $rolesPermitidos)) {
                $request->attributes->set('current_user', $usuario);
                return $next($request);
            }

            // Acceso denegado
            return response()->json([
                'message' => 'Acceso denegado. Rol requerido: ' . implode(', ', $roles),
                'user_role' => $usuario->rol->rol_rol ?? 'Sin rol'
            ], 403);
        } catch (\Exception $e) {
            \Log::error('Error en RoleAuthorization:', [
                'error' => $e->getMessage(),
                'token' => substr($token, 0, 20) . '...'
            ]);
            return response()->json(['message' => 'Token inválido'], 401);
        }
    }

    /**
     * Normalizar texto para comparaciones consistentes
     * Convierte a minúsculas y elimina tildes/acentos
     */
    private function normalizarTexto($texto)
    {
        if (empty($texto)) {
            return '';
        }

        // Convertir a minúsculas
        $texto = strtolower(trim($texto));

        // Eliminar acentos/tildes usando transliteración
        $texto = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $texto);

        // Limpiar caracteres especiales que puedan quedar
        $texto = preg_replace('/[^a-z0-9]/', '', $texto);

        return $texto;
    }
}
