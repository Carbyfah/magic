<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CheckUserPermissions
{
    /**
     * Manejar solicitud entrante y verificar permisos
     */
    public function handle(Request $request, Closure $next, string $modulo, string $accion): mixed
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no autenticado'
            ], 401);
        }

        // Verificar si el usuario tiene el permiso requerido
        if (!$user->tienePermiso($modulo, $accion)) {
            return response()->json([
                'success' => false,
                'message' => "No tiene permisos para {$accion} en el módulo {$modulo}",
                'required_permission' => [
                    'modulo' => $modulo,
                    'accion' => $accion
                ]
            ], 403);
        }

        return $next($request);
    }
}
